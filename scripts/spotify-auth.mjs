#!/usr/bin/env node
// One-shot Spotify OAuth helper.
//
// Reads SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET from .env.local, walks you
// through the authorize flow, exchanges the resulting code for a refresh
// token, and prints the token to paste back into .env.local.
//
// Usage: npm run spotify:auth

import { readFileSync, existsSync } from 'node:fs';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const REDIRECT_URI = 'http://127.0.0.1:3000/callback';
// user-read-currently-playing → for the nav pill
// user-read-recently-played  → for the "What I'm listening to" section
const SCOPES = 'user-read-currently-playing user-read-recently-played';

function loadEnv() {
  const path = '.env.local';
  if (!existsSync(path)) {
    console.error('❌ .env.local not found in the current directory.');
    console.error('   Run this from the portfolio folder root.');
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = loadEnv();
const clientId = env.SPOTIFY_CLIENT_ID;
const clientSecret = env.SPOTIFY_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('❌ Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env.local');
  console.error('   Fill those in first (Spotify dashboard → your app), then re-run.');
  process.exit(1);
}

const authUrl =
  `https://accounts.spotify.com/authorize` +
  `?client_id=${clientId}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(SCOPES)}`;

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Spotify auth helper');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('STEP 1 — Open this URL in your browser:\n');
console.log('  ' + authUrl);
console.log('\nSTEP 2 — Click "Agree" on the Spotify authorize page.');
console.log('\nSTEP 3 — Browser shows "This site can\'t be reached" — that is expected.');
console.log('         Look at the address bar:');
console.log('         http://127.0.0.1:3000/callback?code=AQDxxxxxxxxxxxxxx');
console.log('         Copy EVERYTHING after `code=` (it is a long string).\n');

const rl = readline.createInterface({ input, output });
const code = (await rl.question('STEP 4 — Paste the code here and press Enter:\n> ')).trim();
rl.close();

if (!code) {
  console.error('\n❌ No code provided. Aborting.');
  process.exit(1);
}

console.log('\n⏳ Exchanging code for refresh token...\n');

const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
const res = await fetch('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: {
    Authorization: `Basic ${basic}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
  }),
});

const json = await res.json();

if (!res.ok || !json.refresh_token) {
  console.error('❌ Spotify rejected the request:');
  console.error(JSON.stringify(json, null, 2));
  console.error('\nMost common causes:');
  console.error('  • Code expired (older than ~10 minutes) — restart the helper');
  console.error('  • Code already used once — restart the helper');
  console.error('  • Client ID/Secret in .env.local don\'t match the Spotify app');
  console.error('  • Redirect URI on the Spotify app is not http://127.0.0.1:3000/callback');
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  ✅ SUCCESS — your refresh token (never expires):');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('  ' + json.refresh_token);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Paste it into .env.local on this line:');
console.log('    SPOTIFY_REFRESH_TOKEN=<paste here>');
console.log('  Save, then restart `npm run dev`.');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
