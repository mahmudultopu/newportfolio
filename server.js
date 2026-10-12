// Portfolio server: serves the public site, a JSON content API and the admin panel.
// Runs locally (`npm start`) or on Vercel (the app is exported as a serverless function).
const express = require('express');
const multer = require('multer');
const compression = require('compression');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const totp = require('./lib/totp');
const { db, uploads, UPLOAD_DIR } = require('./lib/store');
const SEED_CONTENT = require('./data/content.json');

let sharp = null;
try { sharp = require('sharp'); } catch { console.warn('  sharp not available — images will not be optimised'); }

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const TEMPLATE = fs.readFileSync(path.join(__dirname, 'views', 'index.html'), 'utf8');
const NOT_FOUND = fs.readFileSync(path.join(__dirname, 'public', '404.html'), 'utf8');
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_IDLE = 60 * 60 * 2;          // seconds: log out after 2h of inactivity
const SESSION_MAX = 1000 * 60 * 60 * 12;   // ms: and always after 12h
const MAX_UPLOAD_TOTAL = 2 * 1024 ** 3;    // 2 GB disk quota (local)
const MAX_MESSAGES = 2000;
const SCRYPT = { N: 1 << 15, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };

// ---------- helpers ----------
const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- data access ----------
const getContent = async () => (await db.get('content')) || SEED_CONTENT;
const getMessages = async () => (await db.get('messages')) || [];
const getAuth = async () => {
  let a = await db.get('auth');
  if (!a) { a = { ...hashPassword(DEFAULT_PASSWORD), isDefault: true }; await db.set('auth', a); }
  return a;
};
const saveAuth = (a) => db.set('auth', a);

// ---------- passwords ----------
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  return { salt, hash: crypto.scryptSync(pw, salt, 64, SCRYPT).toString('hex'), N: SCRYPT.N };
}
const checkPassword = (pw, auth) => {
  if (!auth?.salt || !auth?.hash) return false;
  const opts = auth.N ? { ...SCRYPT, N: auth.N } : {}; // older hashes used the scrypt defaults
  const test = crypto.scryptSync(String(pw), auth.salt, 64, opts);
  const ref = Buffer.from(auth.hash, 'hex');
  return test.length === ref.length && crypto.timingSafeEqual(test, ref);
};
const COMMON = new Set(['password', 'password1', 'password123', '12345678', '123456789', '1234567890', 'qwerty123', 'admin123', 'admin1234', 'administrator', 'iloveyou', 'letmein123', 'welcome123', 'portfolio', 'topu1234']);
const passwordProblem = (pw, auth) => {
  pw = String(pw || '');
  if (pw.length < 10) return 'Use at least 10 characters.';
  if (pw.length > 200) return 'Password is too long.';
  if (COMMON.has(pw.toLowerCase())) return 'That password is too common.';
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  if (kinds < 3) return 'Mix at least three of: lowercase, uppercase, numbers, symbols.';
  if (/mahmudul|hasan|topu/i.test(pw)) return 'Do not include your name in the password.';
  if (auth && checkPassword(pw, auth)) return 'New password must be different from the current one.';
  return null;
};

// ---------- security log ----------
const logEvent = async (req, type, detail = '') => {
  const log = (await db.get('log')) || [];
  log.unshift({ type, detail, ip: req?.ip || '', ua: String(req?.headers?.['user-agent'] || '').slice(0, 160), date: new Date().toISOString() });
  await db.set('log', log.slice(0, 300));
};

// ---------- sessions (stored by sha256 of the cookie token) ----------
const cookieName = (req) => (req.secure ? '__Host-sid' : 'sid');
const parseCookies = (req) => Object.fromEntries(
  (req.headers.cookie || '').split(';').filter((c) => c.includes('=')).map((c) => {
    const i = c.indexOf('=');
    let v = c.slice(i + 1).trim();
    try { v = decodeURIComponent(v); } catch { /* keep raw */ }
    return [c.slice(0, i).trim(), v];
  })
);
const getSession = async (req) => {
  const token = parseCookies(req)[cookieName(req)];
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const key = sha256(token);
  const s = await db.tmpGet('sess:' + key);
  if (!s) return null;
  if (Date.now() - s.created > SESSION_MAX) { await db.tmpDel('sess:' + key); return null; }
  if (Date.now() - s.seen > 60 * 1000) { s.seen = Date.now(); await db.tmpSet('sess:' + key, s, SESSION_IDLE); }
  return { key, ...s };
};
const setSessionCookie = (req, res, token, maxAge) => {
  const secure = req.secure ? '; Secure' : '';
  res.append('Set-Cookie', `${cookieName(req)}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`);
};
const createSession = async (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  await db.tmpSet('sess:' + sha256(token), { id: crypto.randomUUID(), created: Date.now(), seen: Date.now(), ip: req.ip, ua: String(req.headers['user-agent'] || '').slice(0, 160) }, SESSION_IDLE);
  setSessionCookie(req, res, token, SESSION_MAX / 1000);
};
const allSessions = async () => (await db.tmpList('sess:')).map(([k, s]) => ({ key: k.slice(5), ...s }));

const requireAuth = wrap(async (req, res, next) => {
  const s = await getSession(req);
  if (!s) return res.status(401).json({ error: 'Not logged in' });
  req.session = s;
  next();
});
// Content changes are blocked until the default password has been replaced.
const requireSecured = wrap(async (req, res, next) => ((await getAuth()).isDefault
  ? res.status(403).json({ error: 'For security, change the default password in Security before editing.', code: 'DEFAULT_PASSWORD' })
  : next()));

// ---------- rate limiting (shared across serverless instances via the store) ----------
const limiter = (name, windowSec, max, message) => wrap(async (req, res, next) => {
  const n = await db.tmpIncr(`rl:${name}:${req.ip}`, windowSec);
  if (n > max) {
    res.set('Retry-After', String(windowSec));
    return res.status(429).json({ error: message || 'Too many requests. Please slow down.' });
  }
  next();
});

// Escalating lockout for failed logins: 5 failures → 5 min, then 10, 20 … up to 24 h.
const lockState = async (ip) => (await db.tmpGet('lock:' + ip)) || { count: 0, locks: 0, until: 0 };
const recordLoginFail = async (req) => {
  const s = await lockState(req.ip);
  s.count += 1;
  if (s.count >= 5) {
    s.locks += 1; s.count = 0;
    s.until = Date.now() + Math.min(5 * 60 * 1000 * 2 ** (s.locks - 1), 24 * 60 * 60 * 1000);
    await logEvent(req, 'login_locked', `IP locked for ${Math.round((s.until - Date.now()) / 60000)} min`);
  }
  await db.tmpSet('lock:' + req.ip, s, 48 * 60 * 60);
};

// ---------- uploads ----------
const EXT = /\.(png|jpe?g|gif|webp|svg|avif|mp4|webm|mov|pdf|ico)$/i;
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif', mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', pdf: 'application/pdf', ico: 'image/x-icon' };
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: uploads.maxBytes, files: 20, fields: 5 },
  fileFilter: (req, file, cb) => (EXT.test(file.originalname) ? cb(null, true) : cb(new Error('File type not allowed'))),
});
const safeName = (original, ext) => {
  const base = path.basename(original, path.extname(original))
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'file';
  return `${base}-${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}.${ext}`;
};
// Check the real file contents match the extension (stops disguised files).
const sniff = (buf, ext) => {
  const hex = buf.subarray(0, 64).toString('hex'), ascii = buf.subarray(0, 64).toString('latin1');
  switch (ext) {
    case 'png': return hex.startsWith('89504e470d0a1a0a');
    case 'jpg': case 'jpeg': return hex.startsWith('ffd8ff');
    case 'gif': return ascii.startsWith('GIF87a') || ascii.startsWith('GIF89a');
    case 'webp': return ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP';
    case 'avif': case 'mp4': case 'mov': return ascii.slice(4, 8) === 'ftyp';
    case 'webm': return hex.startsWith('1a45dfa3');
    case 'pdf': return ascii.startsWith('%PDF-');
    case 'ico': return hex.startsWith('00000100');
    case 'svg': {
      const txt = buf.toString('utf8');
      if (!/<svg[\s>]/i.test(txt)) return false;
      // reject anything that could execute or load external content
      return !/<script|<foreignobject|<iframe|<embed|<object|\son[a-z]+\s*=|javascript:|data:text\/html|<!entity|xlink:href\s*=\s*["']?\s*(https?:|\/\/)/i.test(txt);
    }
    default: return false;
  }
};
// Resize large photos, convert to WebP and strip metadata (EXIF can contain GPS location).
const optimise = async (buf, ext) => {
  if (!sharp || !['png', 'jpg', 'jpeg', 'webp', 'avif'].includes(ext)) return { buf, ext };
  try {
    const out = await sharp(buf, { limitInputPixels: 100e6 }).rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 }).toBuffer();
    return { buf: out, ext: 'webp' };
  } catch (e) {
    console.warn('optimise failed:', e.message);
    return { buf, ext };
  }
};

const validContent = (c) => c && typeof c === 'object' && !Array.isArray(c)
  && c.profile && typeof c.profile === 'object' && Array.isArray(c.sections);
const snapshot = async (reason) => {
  const current = await db.get('content');
  if (!current) return;
  const id = `${new Date().toISOString().replace(/[:.]/g, '-')}__${reason}`;
  await db.history.add({ id, date: new Date().toISOString(), reason, size: JSON.stringify(current).length }, current);
};

// ---------- app ----------
const app = express();
app.disable('x-powered-by');
if (process.env.VERCEL) app.set('trust proxy', true);
else if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? true : process.env.TRUST_PROXY);
app.use(compression());

// Security headers on every response
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');
app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': CSP,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-site',
    'X-DNS-Prefetch-Control': 'off',
  });
  if (req.secure) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (req.path.startsWith('/admin') || req.path.startsWith('/api')) res.set({ 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' });
  next();
});

// CSRF: state-changing API calls must come from our own pages
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.get('x-requested-with') !== 'fetch') return res.status(403).json({ error: 'Forbidden' });
  const origin = req.get('origin') || req.get('referer');
  if (origin) {
    try { if (new URL(origin).host !== req.get('host')) return res.status(403).json({ error: 'Forbidden' }); } catch { return res.status(403).json({ error: 'Forbidden' }); }
  }
  next();
});
app.use('/api', limiter('api', 60, 300));

const smallJSON = express.json({ limit: '20kb' });
const bigJSON = express.json({ limit: '3mb' });

// Public content
app.get('/api/content', wrap(async (req, res) => res.json(await getContent())));

// Contact form
app.post('/api/messages', limiter('contact', 600, 5, 'Too many messages — please try again later.'), smallJSON, wrap(async (req, res) => {
  const clean = (v, n) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, n);
  const b = req.body || {};
  if (b.website) return res.json({ ok: true }); // honeypot: bots fill hidden fields
  if (Number(b.t) && Date.now() - Number(b.t) < 2500) return res.json({ ok: true }); // submitted too fast for a human
  const name = clean(b.name, 120), email = clean(b.email, 160), subject = clean(b.subject, 200), message = clean(b.message, 5000);
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message are required.' });
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email.' });
  if ((message.match(/https?:\/\//g) || []).length > 5) return res.status(400).json({ error: 'Too many links in the message.' });
  const messages = await getMessages();
  messages.unshift({ id: crypto.randomUUID(), name, email, subject, message, date: new Date().toISOString(), read: false });
  await db.set('messages', messages.slice(0, MAX_MESSAGES));
  res.json({ ok: true });
}));

// ---------- auth ----------
app.post('/api/login', smallJSON, wrap(async (req, res) => {
  const st = await lockState(req.ip);
  if (st.until > Date.now()) {
    const mins = Math.ceil((st.until - Date.now()) / 60000);
    return res.status(429).json({ error: `Too many failed attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.` });
  }
  const auth = await getAuth();
  const { password = '', code = '' } = req.body || {};
  if (!checkPassword(password, auth)) {
    await recordLoginFail(req); await logEvent(req, 'login_failed', 'wrong password');
    await sleep(400 + Math.random() * 400);
    return res.status(401).json({ error: 'Wrong password' });
  }
  if (auth.totp?.enabled) {
    if (!code) return res.status(401).json({ need2fa: true, error: 'Enter the 6-digit code from your authenticator app' });
    const clean = String(code).replace(/[\s-]/g, '');
    const counter = totp.verify(auth.totp.secret, clean, auth.totp.lastCounter ?? -1);
    if (counter != null) auth.totp.lastCounter = counter;
    else {
      const i = (auth.totp.backup || []).findIndex((h) => safeEqual(h, sha256(clean.toUpperCase())));
      if (i < 0) {
        await recordLoginFail(req); await logEvent(req, 'login_failed', 'wrong 2FA code');
        await sleep(400);
        return res.status(401).json({ need2fa: true, error: 'Invalid code' });
      }
      auth.totp.backup.splice(i, 1);
      await logEvent(req, 'backup_code_used', `${auth.totp.backup.length} backup codes left`);
    }
  }
  if (!auth.N || auth.N < SCRYPT.N) Object.assign(auth, hashPassword(password)); // upgrade old hashes
  await saveAuth(auth);
  await db.tmpDel('lock:' + req.ip);
  await createSession(req, res);
  await logEvent(req, 'login_success');
  res.json({ ok: true, isDefault: !!auth.isDefault });
}));

app.post('/api/logout', wrap(async (req, res) => {
  const s = await getSession(req);
  if (s) await db.tmpDel('sess:' + s.key);
  setSessionCookie(req, res, '', 0);
  res.json({ ok: true });
}));

app.get('/api/session', wrap(async (req, res) => {
  res.json({ authed: !!(await getSession(req)), isDefault: !!(await getAuth()).isDefault });
}));

app.post('/api/password', requireAuth, smallJSON, wrap(async (req, res) => {
  const auth = await getAuth();
  const { current, next } = req.body || {};
  if (!checkPassword(current || '', auth)) { await logEvent(req, 'password_change_failed'); return res.status(400).json({ error: 'Current password is wrong' }); }
  const problem = passwordProblem(next, auth);
  if (problem) return res.status(400).json({ error: problem });
  await saveAuth({ ...auth, ...hashPassword(String(next)), isDefault: false });
  for (const s of await allSessions()) if (s.key !== req.session.key) await db.tmpDel('sess:' + s.key); // sign out everywhere else
  await logEvent(req, 'password_changed');
  res.json({ ok: true });
}));

// Security overview
app.get('/api/security', requireAuth, wrap(async (req, res) => {
  const a = await getAuth();
  res.json({
    twoFactor: !!a.totp?.enabled,
    backupCodesLeft: a.totp?.backup?.length || 0,
    isDefault: !!a.isDefault,
    sessions: (await allSessions()).map((s) => ({ id: s.id, ip: s.ip, ua: s.ua, created: s.created, seen: s.seen, current: s.key === req.session.key })),
    log: ((await db.get('log')) || []).slice(0, 100),
  });
}));
app.post('/api/sessions/revoke-others', requireAuth, wrap(async (req, res) => {
  let n = 0;
  for (const s of await allSessions()) if (s.key !== req.session.key) { await db.tmpDel('sess:' + s.key); n++; }
  await logEvent(req, 'sessions_revoked', `${n} other session(s) signed out`);
  res.json({ ok: true, revoked: n });
}));

// Two-factor authentication
app.post('/api/2fa/setup', requireAuth, wrap(async (req, res) => {
  const secret = totp.generateSecret();
  await db.tmpSet('p2fa:' + req.session.key, secret, 15 * 60);
  const url = totp.otpauthURL(secret, 'admin', 'Topu Portfolio');
  res.json({ secret, qr: await QRCode.toDataURL(url, { margin: 1, width: 220 }) });
}));
app.post('/api/2fa/enable', requireAuth, smallJSON, wrap(async (req, res) => {
  const secret = await db.tmpGet('p2fa:' + req.session.key);
  if (!secret) return res.status(400).json({ error: 'Start the setup again' });
  const counter = totp.verify(secret, req.body?.code);
  if (counter == null) return res.status(400).json({ error: 'That code is not correct — check your phone’s time and try again' });
  const codes = Array.from({ length: 8 }, () => crypto.randomBytes(5).toString('hex').toUpperCase());
  const auth = await getAuth();
  auth.totp = { enabled: true, secret, lastCounter: counter, backup: codes.map(sha256) };
  await saveAuth(auth);
  await db.tmpDel('p2fa:' + req.session.key);
  await logEvent(req, '2fa_enabled');
  res.json({ ok: true, backupCodes: codes });
}));
app.post('/api/2fa/disable', requireAuth, smallJSON, wrap(async (req, res) => {
  const auth = await getAuth();
  if (!checkPassword(req.body?.password || '', auth)) { await sleep(400); return res.status(400).json({ error: 'Password is wrong' }); }
  delete auth.totp;
  await saveAuth(auth);
  await logEvent(req, '2fa_disabled');
  res.json({ ok: true });
}));

// ---------- content ----------
app.put('/api/content', requireAuth, requireSecured, bigJSON, wrap(async (req, res) => {
  if (!validContent(req.body)) return res.status(400).json({ error: 'Invalid content' });
  await snapshot('save');
  await db.set('content', req.body);
  res.json({ ok: true, savedAt: new Date().toISOString() });
}));
app.get('/api/history', requireAuth, wrap(async (req, res) => res.json(await db.history.list())));
app.post('/api/history/:id/restore', requireAuth, requireSecured, wrap(async (req, res) => {
  const id = String(req.params.id);
  if (!/^[\w-]+$/.test(id)) return res.status(404).json({ error: 'Version not found' });
  const data = await db.history.get(id);
  if (!validContent(data)) return res.status(404).json({ error: 'Version not found' });
  await snapshot('before-restore');
  await db.set('content', data);
  await logEvent(req, 'version_restored', id);
  res.json({ ok: true, content: data });
}));

// ---------- media ----------
app.post('/api/upload', requireAuth, requireSecured, limiter('upload', 600, 120, 'Too many uploads'), wrap(async (req, res) => {
  if (await uploads.totalSize() > MAX_UPLOAD_TOTAL) return res.status(507).json({ error: 'Upload storage is full — delete some files first' });
  await new Promise((resolve, reject) => upload.array('files', 20)(req, res, (err) => (err ? reject(err) : resolve())))
    .catch((err) => {
      const msg = err.code === 'LIMIT_FILE_SIZE'
        ? `File too large (max ${Math.round(uploads.maxBytes / 1048576)} MB here). For videos, paste a YouTube or Vimeo link instead.`
        : err.message;
      res.status(400).json({ error: msg });
    });
  if (res.headersSent) return;
  const files = req.files || [];
  const bad = files.filter((f) => !sniff(f.buffer, path.extname(f.originalname).slice(1).toLowerCase()));
  if (bad.length) {
    await logEvent(req, 'upload_rejected', bad.map((f) => f.originalname).join(', ').slice(0, 200));
    return res.status(400).json({ error: `Rejected “${bad[0].originalname}”: the file content does not match its type or contains unsafe code.` });
  }
  const out = [];
  for (const f of files) {
    const { buf, ext } = await optimise(f.buffer, path.extname(f.originalname).slice(1).toLowerCase());
    out.push(await uploads.save(safeName(f.originalname, ext), buf, MIME[ext] || 'application/octet-stream'));
  }
  res.json({ files: out });
}));
app.get('/api/uploads', requireAuth, wrap(async (req, res) => {
  res.json((await uploads.list()).filter((f) => EXT.test(f.name)).sort((a, b) => new Date(b.date) - new Date(a.date)));
}));
app.delete('/api/uploads/:name', requireAuth, requireSecured, wrap(async (req, res) => {
  const name = path.basename(req.params.name);
  if (!EXT.test(name) || !(await uploads.remove(name))) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
}));

// ---------- messages ----------
app.get('/api/messages', requireAuth, wrap(async (req, res) => res.json(await getMessages())));
app.patch('/api/messages/:id', requireAuth, smallJSON, wrap(async (req, res) => {
  const messages = await getMessages();
  const m = messages.find((x) => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  m.read = !!req.body?.read;
  await db.set('messages', messages);
  res.json({ ok: true });
}));
app.delete('/api/messages/:id', requireAuth, wrap(async (req, res) => {
  await db.set('messages', (await getMessages()).filter((x) => x.id !== req.params.id));
  res.json({ ok: true });
}));

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ---------- public pages ----------
const escAttr = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const safeJSON = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const originOf = (req) => process.env.SITE_URL?.replace(/\/$/, '') || `${req.protocol}://${req.get('host')}`;
app.get(['/', '/index.html'], wrap(async (req, res) => {
  const c = await getContent();
  const site = c.site || {}, p = c.profile || {};
  const fullName = [p.firstName, p.lastName, p.nickname].filter(Boolean).join(' ');
  const origin = originOf(req);
  const abs = (u) => (!u ? '' : /^https?:/.test(u) ? u : origin + u);
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Person',
    name: fullName, jobTitle: p.role, email: p.email ? `mailto:${p.email}` : undefined,
    image: abs(c.hero?.photo), url: origin,
    address: p.location ? { '@type': 'PostalAddress', addressLocality: p.location } : undefined,
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'North South University' },
    knowsAbout: (c.skills?.items || []).map((s) => s.name),
    sameAs: (c.socials || []).map((s) => s.url).filter((u) => /^https:\/\//.test(u || '')),
  };
  const html = TEMPLATE
    .replaceAll('{{TITLE}}', escAttr(site.title || fullName))
    .replaceAll('{{DESC}}', escAttr(site.metaDescription))
    .replaceAll('{{KEYWORDS}}', escAttr(site.keywords))
    .replaceAll('{{AUTHOR}}', escAttr(fullName))
    .replaceAll('{{CANONICAL}}', escAttr(origin + '/'))
    .replaceAll('{{OG_IMAGE}}', escAttr(abs(c.hero?.photo)))
    .replaceAll('{{FAVICON}}', escAttr(site.favicon || '/assets/favicon.svg'))
    .replace('{{JSONLD}}', safeJSON(jsonld))
    .replace('{{CONTENT}}', safeJSON(c));
  res.set('Cache-Control', 'no-cache').type('html').send(html);
}));

app.get('/robots.txt', (req, res) => res.type('text/plain').send(
  `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${originOf(req)}/sitemap.xml\n`));
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escAttr(originOf(req))}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><priority>1.0</priority></url></urlset>\n`);
});

// Uploaded files (local mode): sandboxed so even a malicious file can never run scripts on this site
app.use('/uploads', express.static(UPLOAD_DIR, {
  maxAge: '30d', immutable: true, dotfiles: 'deny', index: false,
  setHeaders: (res, file) => {
    res.set('Content-Security-Policy', "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox");
    if (file.endsWith('.svg')) res.set('Content-Type', 'image/svg+xml');
  },
}));
app.use(express.static(path.join(ROOT, 'public'), {
  extensions: ['html'], dotfiles: 'deny', index: false,
  setHeaders: (res, file) => res.set('Cache-Control', /\.(css|js|html)$/.test(file) ? 'no-cache' : 'public, max-age=604800'),
}));
app.get(['/admin', '/admin/'], (req, res) => res.sendFile(path.join(ROOT, 'public/admin/index.html')));

// 404 + error handler (never leak stack traces)
app.use((req, res) => res.status(404).type('html').send(NOT_FOUND));
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  if (res.headersSent) return;
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: status === 413 ? 'Request too large' : status < 500 ? 'Bad request' : 'Server error' });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`\n  Portfolio running:  http://localhost:${PORT}`);
    console.log(`  Admin panel:        http://localhost:${PORT}/admin`);
    console.log(`  Storage:            ${db.kind} + ${uploads.kind}`);
    if ((await getAuth()).isDefault && !process.env.ADMIN_PASSWORD) console.log(`  Default password:   ${DEFAULT_PASSWORD}  (you'll be asked to change it)\n`);
  });
}
