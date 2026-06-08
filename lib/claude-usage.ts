import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UsageDay {
  date: string;          // 'YYYY-MM-DD'
  count: number;         // total messages logged that day
  tokens: number;        // input + output + cache tokens
  sessions: number;      // distinct session files touched that day
  level: 0 | 1 | 2 | 3 | 4;
}

export interface UsageStats {
  active_days: number;
  current_streak: number;
  sessions: number;
  tokens: number;
}

export type SourceKey = 'cowork' | 'code' | 'chat';

export interface SourceStats {
  transcripts: number;   // file count (0 for chat — exports aren't files-per-session)
  messages: number;      // total messages contributed
  sessions: number;      // distinct sessions
  tokens: number;        // 0 for chat (the export doesn't expose token counts)
}

export interface UsageData {
  generated_at: string;
  days: UsageDay[];
  stats: UsageStats;
  start_date: string;          // '' when empty; otherwise 'YYYY-MM-DD'
  empty: boolean;
  files_scanned: number;       // transcripts found locally (Cowork + Claude Code)
  chat_messages_imported: number; // messages pulled from claude.ai export file
  by_source: Record<SourceKey, SourceStats>;
}

// Decides whether a transcript path is a Cowork session or a Claude Code session.
// Cowork writes into  local-agent-mode-sessions/(session)/local_(id)/.claude/projects/
// Claude Code (CLI) writes directly into  ~/.claude/projects/
export function classifyTranscriptSource(filepath: string): 'cowork' | 'code' {
  return filepath.includes('local-agent-mode-sessions') ? 'cowork' : 'code';
}

function emptySourceStats(): SourceStats {
  return { transcripts: 0, messages: 0, sessions: 0, tokens: 0 };
}

// ---------------------------------------------------------------------------
// Where to look for transcripts. Each is checked at runtime; missing ones are
// silently skipped. If you discover another path, just push to this array.
// ---------------------------------------------------------------------------

const HOME = os.homedir();

// We scan parent dirs (not the projects subfolder) so future Anthropic
// products that follow the same .claude/projects/(encoded)/(uuid).jsonl layout
// get picked up automatically. The `looksLikeTranscript` filter keeps us
// honest — only files whose path contains .claude/projects/ are counted.
const CANDIDATE_DIRS: string[] = [
  path.join(HOME, '.claude'),                                    // Claude Code (CLI)
  path.join(HOME, 'Library', 'Application Support', 'Claude'),   // Cowork + any future macOS Claude desktop products
  path.join(HOME, '.config', 'Claude'),                          // Linux equivalent
  ...(process.env.APPDATA ? [path.join(process.env.APPDATA, 'Claude')] : []),
];

// Drop your claude.ai data export here (any one of these paths works).
// See README for how to export from claude.ai Settings → Privacy → Export.
const CHAT_EXPORT_CANDIDATES: string[] = [
  path.join(process.cwd(), 'data', 'claude-chat-export.json'),
  path.join(process.cwd(), 'data', 'conversations.json'),
];

const DAY_MS = 24 * 60 * 60 * 1000;

// IMPORTANT: use LOCAL date components, not UTC.
// `toISOString().slice(0, 10)` returns the UTC date, which causes a late-evening
// message in Pacific time (5am UTC next day) to bucket as "tomorrow" — breaking
// streak calculations and making today's cell stay dark.
function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ---------------------------------------------------------------------------
// Filesystem scanning
// ---------------------------------------------------------------------------

// Files we explicitly do NOT want to treat as conversation transcripts.
// `audit.jsonl` lives next to transcript folders and logs API/permission
// events — has a `timestamp` field but is not a Claude conversation.
const EXCLUDED_BASENAMES = new Set<string>(['audit.jsonl']);

// Real transcripts are always inside a `.claude/projects/...` path.
// We use this signal to ignore stray JSONL files at the top level of
// session folders that have nothing to do with conversations.
const TRANSCRIPT_PATH_HINT = `${path.sep}.claude${path.sep}projects${path.sep}`;

function looksLikeTranscript(filepath: string): boolean {
  const base = path.basename(filepath);
  if (EXCLUDED_BASENAMES.has(base)) return false;
  return filepath.includes(TRANSCRIPT_PATH_HINT);
}

function walk(dir: string): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.name.endsWith('.jsonl')) out.push(full);
  }
  return out;
}

function discoverFiles(): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const dir of CANDIDATE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const f of walk(dir)) {
      if (!looksLikeTranscript(f)) continue;
      if (!seen.has(f)) {
        seen.add(f);
        out.push(f);
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Snapshot fallback for production deploys (Vercel etc.) where ~/.claude
// doesn't exist. Run `npm run sync:claude` locally to refresh this file
// before deploying.
// ---------------------------------------------------------------------------

function loadSnapshot(): UsageData | null {
  try {
    const fp = path.join(process.cwd(), 'data', 'claude-usage.json');
    if (!fs.existsSync(fp)) return null;
    const raw = JSON.parse(fs.readFileSync(fp, 'utf-8'));
    if (raw && Array.isArray(raw.days) && raw.stats) return raw as UsageData;
  } catch {
    /* ignore */
  }
  return null;
}

function emptyResult(): UsageData {
  return {
    generated_at: new Date().toISOString(),
    days: [],
    stats: { active_days: 0, current_streak: 0, sessions: 0, tokens: 0 },
    start_date: '',
    empty: true,
    files_scanned: 0,
    chat_messages_imported: 0,
    by_source: {
      cowork: emptySourceStats(),
      code: emptySourceStats(),
      chat: emptySourceStats(),
    },
  };
}

// ---------------------------------------------------------------------------
// claude.ai chat export parsing
//
// Format produced by claude.ai Settings → Privacy → Export Data
// (an array of conversation objects, each with `chat_messages`).
// We're defensive about the shape because Anthropic has tweaked it over time.
// ---------------------------------------------------------------------------

interface ChatMessage {
  timestamp: string;
  conversationId: string;
}

function loadChatExport(): ChatMessage[] {
  for (const fp of CHAT_EXPORT_CANDIDATES) {
    if (!fs.existsSync(fp)) continue;
    try {
      const raw = JSON.parse(fs.readFileSync(fp, 'utf-8'));
      const msgs = parseChatExport(raw);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[claude-usage] imported ${msgs.length} chat messages from ${path.basename(fp)}`);
      }
      return msgs;
    } catch (e) {
      console.warn('[claude-usage] failed to parse chat export:', e);
    }
  }
  return [];
}

function parseChatExport(raw: unknown): ChatMessage[] {
  const conversations: any[] =
    Array.isArray(raw) ? raw :
    (raw as any)?.conversations ?? [];
  if (!Array.isArray(conversations)) return [];

  const out: ChatMessage[] = [];
  for (const conv of conversations) {
    const convId: string = String(conv?.uuid ?? conv?.id ?? conv?.name ?? 'unknown');
    const messages: any[] = conv?.chat_messages ?? conv?.messages ?? [];
    if (!Array.isArray(messages)) continue;
    for (const m of messages) {
      const ts = m?.created_at ?? m?.timestamp ?? m?.createdAt;
      if (!ts) continue;
      out.push({ timestamp: String(ts), conversationId: convId });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// The real work
// ---------------------------------------------------------------------------

function aggregate(files: string[], chatMessages: ChatMessage[] = []): UsageData {
  if (files.length === 0 && chatMessages.length === 0) return emptyResult();

  const byDay = new Map<
    string,
    { count: number; tokens: number; sessions: Set<string> }
  >();
  const allSessions = new Set<string>();
  let totalTokens = 0;
  let earliest: Date | null = null;

  // Per-source tallies — incremented as we scan
  const bySource: Record<SourceKey, SourceStats> = {
    cowork: emptySourceStats(),
    code: emptySourceStats(),
    chat: emptySourceStats(),
  };

  for (const file of files) {
    let content: string;
    try {
      content = fs.readFileSync(file, 'utf-8');
    } catch {
      continue;
    }
    const sessionId = path.basename(file, '.jsonl');
    const source = classifyTranscriptSource(file);
    bySource[source].transcripts += 1;
    let sessionUsed = false;
    let sessionMessages = 0;
    let sessionTokens = 0;

    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      let msg: any;
      try {
        msg = JSON.parse(line);
      } catch {
        continue;
      }
      const ts = msg.timestamp;
      if (!ts) continue;
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) continue;

      const key = dayKey(d);
      let bucket = byDay.get(key);
      if (!bucket) {
        bucket = { count: 0, tokens: 0, sessions: new Set<string>() };
        byDay.set(key, bucket);
      }
      bucket.count += 1;
      bucket.sessions.add(sessionId);
      sessionUsed = true;
      sessionMessages += 1;

      if (!earliest || d < earliest) earliest = d;

      const usage = msg.message?.usage;
      if (usage) {
        const t =
          (usage.input_tokens ?? 0) +
          (usage.output_tokens ?? 0) +
          (usage.cache_creation_input_tokens ?? 0) +
          (usage.cache_read_input_tokens ?? 0);
        bucket.tokens += t;
        totalTokens += t;
        sessionTokens += t;
      }
    }
    if (sessionUsed) {
      allSessions.add(sessionId);
      bySource[source].sessions += 1;
      bySource[source].messages += sessionMessages;
      bySource[source].tokens += sessionTokens;
    }
  }

  // Merge claude.ai chat export messages. No token data available in the export,
  // so they contribute to message count + session count but not tokens.
  const chatConvs = new Set<string>();
  for (const cm of chatMessages) {
    const d = new Date(cm.timestamp);
    if (Number.isNaN(d.getTime())) continue;

    const key = dayKey(d);
    let bucket = byDay.get(key);
    if (!bucket) {
      bucket = { count: 0, tokens: 0, sessions: new Set<string>() };
      byDay.set(key, bucket);
    }
    bucket.count += 1;
    bucket.sessions.add(`chat:${cm.conversationId}`);
    allSessions.add(`chat:${cm.conversationId}`);
    chatConvs.add(cm.conversationId);
    bySource.chat.messages += 1;

    if (!earliest || d < earliest) earliest = d;
  }
  bySource.chat.sessions = chatConvs.size;

  if (!earliest) return emptyResult();

  // Build day-by-day strip from first activity to today.
  const start = new Date(
    earliest.getFullYear(),
    earliest.getMonth(),
    earliest.getDate()
  );
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const span = Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1;

  const days: UsageDay[] = [];
  for (let i = 0; i < span; i++) {
    const d = new Date(start.getTime() + i * DAY_MS);
    const key = dayKey(d);
    const bucket = byDay.get(key);
    days.push({
      date: key,
      count: bucket?.count ?? 0,
      tokens: bucket?.tokens ?? 0,
      sessions: bucket?.sessions.size ?? 0,
      level: 0,
    });
  }

  // Quantile-bucket levels 1..4 (level 0 stays zero).
  const positive = days
    .map((d) => d.count)
    .filter((c) => c > 0)
    .sort((a, b) => a - b);
  const q = (p: number) => positive[Math.floor(positive.length * p)] ?? 0;
  const t1 = q(0.25);
  const t2 = q(0.5);
  const t3 = q(0.85);
  for (const d of days) {
    if (d.count === 0) d.level = 0;
    else if (d.count <= t1) d.level = 1;
    else if (d.count <= t2) d.level = 2;
    else if (d.count <= t3) d.level = 3;
    else d.level = 4;
  }

  // Stats
  const activeDays = days.filter((d) => d.count > 0).length;
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) streak += 1;
    else break;
  }

  return {
    generated_at: new Date().toISOString(),
    days,
    stats: {
      active_days: activeDays,
      current_streak: streak,
      sessions: allSessions.size,
      tokens: totalTokens,
    },
    start_date: dayKey(start),
    empty: false,
    files_scanned: files.length,
    chat_messages_imported: chatMessages.length,
    by_source: bySource,
  };
}

async function scanLive(): Promise<UsageData> {
  const files = discoverFiles();
  const chatMessages = loadChatExport();

  if (files.length === 0 && chatMessages.length === 0) {
    // No local data → fall back to a committed snapshot (for prod) or empty.
    const snap = loadSnapshot();
    if (snap) {
      return {
        ...snap,
        files_scanned: snap.files_scanned ?? 0,
        chat_messages_imported: snap.chat_messages_imported ?? 0,
        by_source: snap.by_source ?? {
          cowork: emptySourceStats(),
          code: emptySourceStats(),
          chat: emptySourceStats(),
        },
      };
    }
    return emptyResult();
  }
  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[claude-usage] scanned ${files.length} transcript files · imported ${chatMessages.length} chat messages`
    );
  }
  return aggregate(files, chatMessages);
}

// A full live scan recursively walks ~/.claude (+ other Claude dirs) and reads
// every transcript .jsonl synchronously — cheap on a fresh machine, but heavy
// for active Claude users with thousands of transcripts. Running it on every
// render made navigating to pages that render the heatmap (home, via <About>)
// noticeably slow. Memoize for a short TTL so back-to-back navigations reuse the
// last scan; this matches the home page's `revalidate = 30` freshness window.
const USAGE_TTL_MS = 30_000;
let usageCache: { at: number; data: UsageData } | null = null;

export async function getClaudeUsage(): Promise<UsageData> {
  if (usageCache && Date.now() - usageCache.at < USAGE_TTL_MS) {
    return usageCache.data;
  }
  const data = await scanLive();
  usageCache = { at: Date.now(), data };
  return data;
}

// Exported for the sync script (which writes the snapshot for prod deploys).
export { scanLive as scanClaudeUsageOnce };
