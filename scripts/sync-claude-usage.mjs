#!/usr/bin/env node
// Aggregates Claude usage (Claude Code CLI + Cowork chat) by day and writes
// data/claude-usage.json.
//
// Scans every *.jsonl transcript found under these locations and dedupes by
// absolute file path:
//   ~/.claude/projects/                                       (Claude Code)
//   ~/Library/Application Support/Claude/local-agent-mode-sessions/  (Cowork on macOS)
//   ~/.config/Claude/local-agent-mode-sessions/               (Cowork on Linux)
//   %APPDATA%/Claude/local-agent-mode-sessions/               (Cowork on Windows)
//
// Runs automatically via `predev` and `prebuild` hooks. Also runnable via
// `npm run sync:claude`. Writes an empty-but-valid JSON if nothing's found,
// so the heatmap renders even on a fresh machine.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir, platform } from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(REPO_ROOT, 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'claude-usage.json');

const HOME = homedir();
const CANDIDATE_DIRS = [
  join(HOME, '.claude', 'projects'),
  join(HOME, 'Library', 'Application Support', 'Claude', 'local-agent-mode-sessions'),
  join(HOME, '.config', 'Claude', 'local-agent-mode-sessions'),
  process.env.APPDATA && join(process.env.APPDATA, 'Claude', 'local-agent-mode-sessions'),
].filter(Boolean);

const DAY_MS = 24 * 60 * 60 * 1000;
const ONE_YEAR_MS = 365 * DAY_MS;
const cutoff = new Date(Date.now() - ONE_YEAR_MS);

/** Recursively collect every *.jsonl path under dir. */
async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (e.name.endsWith('.jsonl')) out.push(full);
  }
  return out;
}

// LOCAL date components — see lib/claude-usage.ts for why.
function dayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function emptySourceStats() {
  return { transcripts: 0, messages: 0, sessions: 0, tokens: 0 };
}

function emptyResult() {
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

async function discoverFiles() {
  const found = [];
  const seen = new Set();
  for (const dir of CANDIDATE_DIRS) {
    if (!existsSync(dir)) continue;
    const paths = await walk(dir);
    for (const p of paths) {
      if (seen.has(p)) continue;
      seen.add(p);
      found.push(p);
    }
  }
  return found;
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true });

  const files = await discoverFiles();
  if (files.length === 0) {
    console.log('[sync-claude-usage] no transcript files found in any candidate path — writing empty data.');
    console.log('  candidates:');
    for (const d of CANDIDATE_DIRS) console.log('   -', d);
    await writeFile(OUTPUT_FILE, JSON.stringify(emptyResult(), null, 2));
    return;
  }
  console.log(`[sync-claude-usage] found ${files.length} transcript files across ${CANDIDATE_DIRS.length} candidate paths`);

  // day -> { count, tokens, sessions: Set<string> }
  const byDay = new Map();
  const allSessions = new Set();
  let totalTokens = 0;
  let earliest = null;

  for (const file of files) {
    let content;
    try {
      content = await readFile(file, 'utf-8');
    } catch {
      continue;
    }
    const sessionId = file.split('/').pop().replace('.jsonl', '');
    let sessionUsedThisYear = false;

    for (const line of content.split('\n')) {
      if (!line.trim()) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { continue; }
      const ts = msg.timestamp;
      if (!ts) continue;
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) continue;

      const key = dayKey(d);
      if (!byDay.has(key)) {
        byDay.set(key, { count: 0, tokens: 0, sessions: new Set() });
      }
      const bucket = byDay.get(key);
      bucket.count += 1;
      bucket.sessions.add(sessionId);
      sessionUsedThisYear = true;

      if (!earliest || d < earliest) earliest = d;

      // Claude Code message usage fields (when present on assistant messages).
      const usage = msg.message?.usage;
      if (usage) {
        const t =
          (usage.input_tokens ?? 0) +
          (usage.output_tokens ?? 0) +
          (usage.cache_creation_input_tokens ?? 0) +
          (usage.cache_read_input_tokens ?? 0);
        bucket.tokens += t;
        totalTokens += t;
      }
    }
    if (sessionUsedThisYear) allSessions.add(sessionId);
  }

  if (!earliest) {
    await writeFile(OUTPUT_FILE, JSON.stringify(emptyResult(), null, 2));
    console.log('[sync-claude-usage] no parseable timestamps — wrote empty snapshot.');
    return;
  }

  // Build day-by-day strip from earliest activity to today.
  const start = new Date(earliest.getFullYear(), earliest.getMonth(), earliest.getDate());
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const span = Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1;

  const days = [];
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

  // Quantile-bucket the day counts into levels 1..4. Empty days stay 0.
  const positive = days.map(d => d.count).filter(c => c > 0).sort((a, b) => a - b);
  const q = (p) => positive[Math.floor(positive.length * p)] ?? 0;
  const t1 = q(0.25), t2 = q(0.5), t3 = q(0.85);
  for (const d of days) {
    if (d.count === 0) d.level = 0;
    else if (d.count <= t1) d.level = 1;
    else if (d.count <= t2) d.level = 2;
    else if (d.count <= t3) d.level = 3;
    else d.level = 4;
  }

  // Stats
  const activeDays = days.filter(d => d.count > 0).length;
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) streak += 1;
    else break;
  }

  const result = {
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
    chat_messages_imported: 0,
  };

  await writeFile(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log(
    `[sync-claude-usage] ${activeDays} active days · ${streak}d streak · ${allSessions.size} sessions · ${(totalTokens / 1e6).toFixed(1)}M tokens`
  );
}

main().catch((e) => {
  console.error('[sync-claude-usage] failed:', e);
  // Don't break dev/build — write empty data and exit 0.
  writeFile(OUTPUT_FILE, JSON.stringify(emptyResult(), null, 2)).catch(() => {});
});
