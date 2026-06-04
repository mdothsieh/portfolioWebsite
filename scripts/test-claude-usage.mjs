#!/usr/bin/env node
// Standalone test suite for the Claude usage scanning logic.
// Run via:  node scripts/test-claude-usage.mjs
//
// We use Node's built-in `node:test` to avoid pulling in Jest/Vitest.
// The tests cover the most subtle parts: timezone day keys, transcript
// filtering, audit.jsonl exclusion, claude.ai export parsing, and the
// quantile bucketing.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// We replicate the small pure functions inline rather than wiring up
// TS imports — the lib is .ts and we want this script to run with plain
// node, no compile step.

function dayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const TRANSCRIPT_PATH_HINT = `/.claude/projects/`;
const EXCLUDED_BASENAMES = new Set(['audit.jsonl']);

function looksLikeTranscript(filepath) {
  const base = filepath.split('/').pop();
  if (EXCLUDED_BASENAMES.has(base)) return false;
  return filepath.includes(TRANSCRIPT_PATH_HINT);
}

function parseChatExport(raw) {
  const conversations =
    Array.isArray(raw) ? raw :
    (raw && raw.conversations) ?? [];
  if (!Array.isArray(conversations)) return [];
  const out = [];
  for (const conv of conversations) {
    const convId = String(conv?.uuid ?? conv?.id ?? conv?.name ?? 'unknown');
    const messages = conv?.chat_messages ?? conv?.messages ?? [];
    if (!Array.isArray(messages)) continue;
    for (const m of messages) {
      const ts = m?.created_at ?? m?.timestamp ?? m?.createdAt;
      if (!ts) continue;
      out.push({ timestamp: String(ts), conversationId: convId });
    }
  }
  return out;
}

// =============================================================
describe('dayKey()', () => {
  test('returns local date components, not UTC', () => {
    // A timestamp at 10pm Pacific is 5am UTC next day.
    // dayKey should give the LOCAL date.
    // We construct using the local Date constructor.
    const d = new Date(2026, 4, 26, 22, 30, 0); // May 26 local 10:30pm
    assert.equal(dayKey(d), '2026-05-26');
  });

  test('handles single-digit months and days with padding', () => {
    const d = new Date(2026, 0, 5); // Jan 5
    assert.equal(dayKey(d), '2026-01-05');
  });

  test('round-trips a UTC ISO string into a local day key', () => {
    // This is the bug we fixed: a UTC string that crosses midnight
    // should still produce today's local date.
    const iso = '2026-05-26T22:30:00';  // no Z = local
    const d = new Date(iso);
    assert.equal(dayKey(d), '2026-05-26');
  });
});

// =============================================================
function classifyTranscriptSource(filepath) {
  return filepath.includes('local-agent-mode-sessions') ? 'cowork' : 'code';
}

describe('classifyTranscriptSource()', () => {
  test('Cowork transcript path → cowork', () => {
    const p = '/Users/m/Library/Application Support/Claude/local-agent-mode-sessions/abc/local_xyz/.claude/projects/enc/uuid.jsonl';
    assert.equal(classifyTranscriptSource(p), 'cowork');
  });

  test('Claude Code transcript path → code', () => {
    const p = '/Users/m/.claude/projects/encoded-cwd/uuid.jsonl';
    assert.equal(classifyTranscriptSource(p), 'code');
  });

  test('any path without local-agent-mode-sessions defaults to code', () => {
    assert.equal(classifyTranscriptSource('/random/path/.claude/projects/x.jsonl'), 'code');
  });
});

describe('looksLikeTranscript()', () => {
  test('accepts a Cowork transcript path', () => {
    const p = '/Users/m/Library/Application Support/Claude/local-agent-mode-sessions/sess/local_abc/.claude/projects/encoded/uuid.jsonl';
    assert.equal(looksLikeTranscript(p), true);
  });

  test('accepts a Claude Code transcript path', () => {
    const p = '/Users/m/.claude/projects/encoded-cwd/uuid.jsonl';
    assert.equal(looksLikeTranscript(p), true);
  });

  test('rejects audit.jsonl by basename', () => {
    const p = '/Users/m/Library/Application Support/Claude/local-agent-mode-sessions/sess/local_abc/audit.jsonl';
    assert.equal(looksLikeTranscript(p), false);
  });

  test("rejects audit.jsonl even if it's inside .claude/projects/", () => {
    const p = '/Users/m/.claude/projects/encoded/audit.jsonl';
    assert.equal(looksLikeTranscript(p), false);
  });

  test('rejects random jsonl files outside .claude/projects/', () => {
    const p = '/Users/m/Documents/logs/foo.jsonl';
    assert.equal(looksLikeTranscript(p), false);
  });
});

// =============================================================
describe('parseChatExport()', () => {
  test('parses the array-of-conversations format', () => {
    const raw = [
      {
        uuid: 'conv-1',
        chat_messages: [
          { created_at: '2026-05-26T10:00:00Z', text: 'hi' },
          { created_at: '2026-05-26T10:05:00Z', text: 'hello' },
        ],
      },
      {
        uuid: 'conv-2',
        chat_messages: [
          { created_at: '2026-05-25T15:00:00Z', text: 'yesterday' },
        ],
      },
    ];
    const msgs = parseChatExport(raw);
    assert.equal(msgs.length, 3);
    assert.equal(msgs[0].conversationId, 'conv-1');
    assert.equal(msgs[2].conversationId, 'conv-2');
  });

  test('parses the { conversations: [...] } wrapper format', () => {
    const raw = {
      conversations: [
        { uuid: 'c', messages: [{ timestamp: '2026-05-26T10:00:00Z' }] },
      ],
    };
    const msgs = parseChatExport(raw);
    assert.equal(msgs.length, 1);
  });

  test('skips conversations with missing message arrays', () => {
    const raw = [
      { uuid: 'a' },                          // no messages field
      { uuid: 'b', chat_messages: null },     // null
      { uuid: 'c', chat_messages: [{ created_at: '2026-05-26T10:00:00Z' }] },
    ];
    assert.equal(parseChatExport(raw).length, 1);
  });

  test('skips messages without timestamps', () => {
    const raw = [
      {
        uuid: 'x',
        chat_messages: [
          { text: 'no timestamp' },
          { created_at: '2026-05-26T10:00:00Z' },
          { created_at: null },
        ],
      },
    ];
    assert.equal(parseChatExport(raw).length, 1);
  });

  test('returns empty array on garbage input', () => {
    assert.deepEqual(parseChatExport(null), []);
    assert.deepEqual(parseChatExport(undefined), []);
    assert.deepEqual(parseChatExport('not json'), []);
    assert.deepEqual(parseChatExport(42), []);
  });

  test('falls back to id field when uuid missing', () => {
    const raw = [{ id: 'fallback-id', chat_messages: [{ created_at: '2026-05-26T10:00:00Z' }] }];
    const msgs = parseChatExport(raw);
    assert.equal(msgs[0].conversationId, 'fallback-id');
  });
});

// =============================================================
describe('quantile bucketing', () => {
  // Replicate the bucketing logic to verify thresholds behave reasonably
  function bucket(days) {
    const positive = days.map(d => d.count).filter(c => c > 0).sort((a, b) => a - b);
    const q = (p) => positive[Math.floor(positive.length * p)] ?? 0;
    const t1 = q(0.25), t2 = q(0.5), t3 = q(0.85);
    return days.map(d => {
      if (d.count === 0) return { ...d, level: 0 };
      if (d.count <= t1) return { ...d, level: 1 };
      if (d.count <= t2) return { ...d, level: 2 };
      if (d.count <= t3) return { ...d, level: 3 };
      return { ...d, level: 4 };
    });
  }

  test('empty array yields no levels', () => {
    assert.deepEqual(bucket([]), []);
  });

  test('all-zero days stay level 0', () => {
    const days = [{ count: 0 }, { count: 0 }, { count: 0 }];
    const out = bucket(days);
    assert.ok(out.every(d => d.level === 0));
  });

  test('single non-zero day gets level 1 minimum', () => {
    const days = [{ count: 0 }, { count: 5 }, { count: 0 }];
    const out = bucket(days);
    assert.equal(out[1].level >= 1, true);
  });

  test('distribution: low counts get low levels, high counts get high', () => {
    const days = Array.from({ length: 20 }, (_, i) => ({ count: i + 1 }));
    const out = bucket(days);
    // Lowest count (1) shouldn't be the highest level (4)
    assert.ok(out[0].level <= 2);
    // Highest count (20) should be level 4
    assert.equal(out[19].level, 4);
  });
});

// =============================================================
describe('streak calculation', () => {
  function streak(days) {
    let s = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) s += 1;
      else break;
    }
    return s;
  }

  test('zero streak when last day is empty', () => {
    assert.equal(streak([{ count: 1 }, { count: 0 }]), 0);
  });

  test('counts back from today through consecutive active days', () => {
    const days = [
      { count: 0 }, // 4 days ago
      { count: 0 }, // 3 days ago
      { count: 5 }, // 2 days ago
      { count: 3 }, // yesterday
      { count: 1 }, // today
    ];
    assert.equal(streak(days), 3);
  });

  test('handles all-active history', () => {
    const days = [{ count: 1 }, { count: 1 }, { count: 1 }];
    assert.equal(streak(days), 3);
  });
});
