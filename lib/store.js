// Storage layer.
//  - On Vercel (or anywhere with Upstash/KV env vars): Upstash Redis for data, Vercel Blob for uploads.
//  - Locally: JSON files in /data and files in /uploads.
// Both backends expose the same async API so server.js does not care which one is active.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const HISTORY_DIR = path.join(DATA_DIR, 'history');
const UPLOAD_DIR = path.join(ROOT, 'uploads');

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const HISTORY_KEEP = 20;

// ======================= Redis backend =======================
const redisBackend = () => {
  const { Redis } = require('@upstash/redis');
  const r = new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
  const P = 'pf:'; // key prefix
  return {
    kind: 'redis',
    get: async (key) => (await r.get(P + key)) ?? null,
    set: async (key, value) => { await r.set(P + key, value); },
    // short-lived values (sessions, rate limits) with automatic expiry
    tmpGet: async (key) => (await r.get(P + 'tmp:' + key)) ?? null,
    tmpSet: async (key, value, ttlSec) => { await r.set(P + 'tmp:' + key, value, { ex: Math.max(1, Math.ceil(ttlSec)) }); },
    tmpDel: async (key) => { await r.del(P + 'tmp:' + key); },
    tmpIncr: async (key, ttlSec) => {
      const k = P + 'tmp:' + key;
      const n = await r.incr(k);
      if (n === 1) await r.expire(k, Math.ceil(ttlSec));
      return n;
    },
    tmpList: async (prefix) => {
      const keys = []; let cursor = '0';
      do {
        const [next, batch] = await r.scan(cursor, { match: `${P}tmp:${prefix}*`, count: 200 });
        cursor = String(next); keys.push(...batch);
      } while (cursor !== '0');
      if (!keys.length) return [];
      const vals = await r.mget(...keys);
      return keys.map((k, i) => [k.slice((P + 'tmp:').length), vals[i]]).filter(([, v]) => v != null);
    },
    history: {
      list: async () => (await r.get(P + 'history:index')) || [],
      add: async (entry, content) => {
        const index = (await r.get(P + 'history:index')) || [];
        index.unshift(entry);
        await r.set(P + 'history:' + entry.id, content);
        for (const old of index.slice(HISTORY_KEEP)) await r.del(P + 'history:' + old.id);
        await r.set(P + 'history:index', index.slice(0, HISTORY_KEEP));
      },
      get: async (id) => (await r.get(P + 'history:' + id)) ?? null,
    },
  };
};

// ======================= File backend =======================
const FILES = { content: 'content.json', messages: 'messages.json', auth: 'auth.json', log: 'security-log.json' };
const fileBackend = () => {
  for (const d of [DATA_DIR, HISTORY_DIR]) fs.mkdirSync(d, { recursive: true });
  const fileOf = (key) => path.join(DATA_DIR, FILES[key] || `${key.replace(/[^\w-]/g, '_')}.json`);
  const read = (file) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; } };
  const write = (file, data) => {
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, file);
  };
  const mem = new Map(); // key -> {v, exp}
  const live = (key) => { const e = mem.get(key); if (!e) return null; if (e.exp < Date.now()) { mem.delete(key); return null; } return e; };
  setInterval(() => { for (const k of mem.keys()) live(k); }, 10 * 60 * 1000).unref();
  return {
    kind: 'files',
    get: async (key) => read(fileOf(key)),
    set: async (key, value) => write(fileOf(key), value),
    tmpGet: async (key) => live(key)?.v ?? null,
    tmpSet: async (key, value, ttlSec) => { mem.set(key, { v: value, exp: Date.now() + ttlSec * 1000 }); },
    tmpDel: async (key) => { mem.delete(key); },
    tmpIncr: async (key, ttlSec) => {
      const e = live(key);
      if (!e) { mem.set(key, { v: 1, exp: Date.now() + ttlSec * 1000 }); return 1; }
      e.v += 1; return e.v;
    },
    tmpList: async (prefix) => [...mem.keys()].filter((k) => k.startsWith(prefix) && live(k)).map((k) => [k, mem.get(k).v]),
    history: {
      list: async () => fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith('.json')).sort().reverse().map((f) => {
        const id = f.replace(/\.json$/, '');
        const [stamp, reason = 'save'] = id.split('__');
        const date = stamp.replace(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/, '$1T$2:$3:$4.$5Z');
        return { id, date, reason, size: fs.statSync(path.join(HISTORY_DIR, f)).size };
      }),
      add: async (entry, content) => {
        write(path.join(HISTORY_DIR, `${entry.id}.json`), content);
        const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith('.json')).sort().reverse();
        files.slice(HISTORY_KEEP).forEach((f) => fs.unlinkSync(path.join(HISTORY_DIR, f)));
      },
      get: async (id) => (/^[\w-]+$/.test(id) ? read(path.join(HISTORY_DIR, `${id}.json`)) : null),
    },
  };
};

// ======================= Uploads =======================
const blobUploads = () => {
  const blob = require('@vercel/blob');
  return {
    kind: 'blob',
    maxBytes: 4 * 1024 * 1024, // Vercel functions accept request bodies up to ~4.5 MB
    save: async (name, buffer, contentType) => {
      const r = await blob.put(`uploads/${name}`, buffer, { access: 'public', contentType, addRandomSuffix: false, token: BLOB_TOKEN });
      return { url: r.url, name, size: buffer.length };
    },
    list: async () => {
      const out = []; let cursor;
      do {
        const r = await blob.list({ prefix: 'uploads/', cursor, token: BLOB_TOKEN });
        out.push(...r.blobs.map((b) => ({ url: b.url, name: b.pathname.replace(/^uploads\//, ''), size: b.size, date: b.uploadedAt })));
        cursor = r.hasMore ? r.cursor : undefined;
      } while (cursor);
      return out;
    },
    remove: async (name) => {
      const files = await blob.list({ prefix: `uploads/${name}`, token: BLOB_TOKEN });
      const hit = files.blobs.find((b) => b.pathname === `uploads/${name}`);
      if (!hit) return false;
      await blob.del(hit.url, { token: BLOB_TOKEN });
      return true;
    },
    totalSize: async () => 0,
  };
};
const diskUploads = () => {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  return {
    kind: 'disk',
    maxBytes: 100 * 1024 * 1024,
    save: async (name, buffer) => {
      fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
      return { url: `/uploads/${name}`, name, size: buffer.length };
    },
    list: async () => fs.readdirSync(UPLOAD_DIR).filter((f) => !f.startsWith('.')).map((f) => {
      const st = fs.statSync(path.join(UPLOAD_DIR, f));
      return { url: `/uploads/${f}`, name: f, size: st.size, date: st.mtime };
    }),
    remove: async (name) => {
      const file = path.join(UPLOAD_DIR, path.basename(name));
      if (!fs.existsSync(file)) return false;
      fs.unlinkSync(file); return true;
    },
    totalSize: async () => fs.readdirSync(UPLOAD_DIR).reduce((n, f) => n + fs.statSync(path.join(UPLOAD_DIR, f)).size, 0),
  };
};

const db = REDIS_URL && REDIS_TOKEN ? redisBackend() : fileBackend();
const uploads = BLOB_TOKEN ? blobUploads() : diskUploads();
if (process.env.VERCEL && db.kind !== 'redis') console.warn('WARNING: running on Vercel without Redis — data will not persist. Connect Upstash Redis.');

module.exports = { db, uploads, UPLOAD_DIR };
