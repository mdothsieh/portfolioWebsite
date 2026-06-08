// Server-only NetEase Cloud Music (网易云音乐) helpers.
//
// NetEase has NO official public API and NO OAuth. This module talks to the
// public web endpoint (`/weapi/v1/play/record`) directly, using the same
// "weapi" request encryption the NetEase web player uses, authenticated with
// your account cookie.
//
// Requires two env vars:
//   NETEASE_UID    — your numeric user id (the number in your profile URL)
//   NETEASE_COOKIE — the value of your MUSIC_U cookie (just the token)
//
// Your "listen records" privacy must be public for the record endpoint to
// return data (NetEase settings → 隐私设置 → 允许其他人查看我的播放记录).
//
// Consumed by components/ListeningSection.tsx (server component).

import crypto from 'node:crypto';

const RECORD_URL = 'https://music.163.com/weapi/v1/play/record';

// weapi constants (public, identical to the NetEase web client)
const PRESET_KEY = '0CoJUm6Qyw8W8jud';
const IV = '0102030405060708';
const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const RSA_MODULUS = BigInt(
  '0x00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725' +
    '152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ec' +
    'bda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813' +
    'cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7',
);
const RSA_EXPONENT = BigInt('0x010001');

export interface NeteaseTrack {
  id: string;
  name: string;
  artists: string;
  album: string;
  albumImage: string | null;
  neteaseUrl: string;
  playCount: number;
}

export interface PlayRecords {
  weekly: NeteaseTrack[];
  allTime: NeteaseTrack[];
}

function aesEncrypt(text: string, key: string): string {
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key), Buffer.from(IV));
  return Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]).toString('base64');
}

function randomKey(len: number): string {
  let out = '';
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) out += BASE62[bytes[i] % BASE62.length];
  return out;
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return result;
}

// NetEase uses textbook (no-padding) RSA over the reversed secret key.
function rsaEncrypt(secKey: string): string {
  const reversed = secKey.split('').reverse().join('');
  const hex = Buffer.from(reversed, 'utf8').toString('hex');
  const enc = modPow(BigInt('0x' + hex), RSA_EXPONENT, RSA_MODULUS);
  return enc.toString(16).padStart(256, '0');
}

function weapi(payload: Record<string, unknown>): URLSearchParams {
  const text = JSON.stringify(payload);
  const secKey = randomKey(16);
  const params = aesEncrypt(aesEncrypt(text, PRESET_KEY), secKey);
  const encSecKey = rsaEncrypt(secKey);
  return new URLSearchParams({ params, encSecKey });
}

function normalizeTrack(entry: any): NeteaseTrack {
  const song = entry?.song ?? {};
  const pic: string | null = song?.al?.picUrl ?? null;
  return {
    id: String(song?.id ?? ''),
    name: String(song?.name ?? ''),
    artists: Array.isArray(song?.ar)
      ? song.ar.map((a: { name: string }) => a.name).filter(Boolean).join(', ')
      : '',
    album: String(song?.al?.name ?? ''),
    albumImage: pic ? pic.replace(/^http:/, 'https:') : null,
    neteaseUrl: `https://music.163.com/#/song?id=${song?.id ?? ''}`,
    playCount: Number(entry?.playCount ?? 0),
  };
}

// type: 1 = last 7 days (weekData), 0 = all time (allData)
async function fetchRecord(uid: string, cookie: string, type: 0 | 1): Promise<NeteaseTrack[]> {
  const body = weapi({ uid: Number(uid), type, csrf_token: '' });
  const res = await fetch(RECORD_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      Referer: 'https://music.163.com',
      Cookie: `os=pc; appver=2.9.7; MUSIC_U=${cookie}`,
    },
    body: body.toString(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const json: any = await res.json().catch(() => null);
  if (!json || json.code !== 200) return [];
  const list = type === 1 ? json.weekData : json.allData;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeTrack).filter((t: NeteaseTrack) => t.id);
}

export async function getPlayRecords(limit = 10): Promise<PlayRecords> {
  const uid = process.env.NETEASE_UID;
  const cookie = process.env.NETEASE_COOKIE;
  if (!uid || !cookie) return { weekly: [], allTime: [] };

  try {
    const [weekly, allTime] = await Promise.all([
      fetchRecord(uid, cookie, 1),
      fetchRecord(uid, cookie, 0),
    ]);
    return { weekly: weekly.slice(0, limit), allTime: allTime.slice(0, limit) };
  } catch {
    return { weekly: [], allTime: [] };
  }
}
