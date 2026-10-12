// Portfolio server: serves the public site, a JSON content API and the admin panel.
const express = require('express');
const multer = require('multer');
const compression = require('compression');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const totp = require('./lib/totp');

let sharp = null;
try { sharp = require('sharp'); } catch { console.warn('  sharp not available — images will not be optimised'); }

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const HISTORY_DIR = path.join(DATA_DIR, 'history');
const UPLOAD_DIR = path.join(ROOT, 'uploads');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');
const LOG_FILE = path.join(DATA_DIR, 'security-log.json');
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_IDLE = 1000 * 60 * 60 * 2;       // log out after 2h of inactivity
const SESSION_MAX = 1000 * 60 * 60 * 12;       // and always after 12h
const MAX_UPLOAD_TOTAL = 2 * 1024 ** 3;        // 2 GB disk quota for uploads
const MAX_MESSAGES = 2000;
const HISTORY_KEEP = 20;
const SCRYPT = { N: 1 << 15, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };

for (const d of [DATA_DIR, HISTORY_DIR, UPLOAD_DIR]) fs.mkdirSync(d, { recursive: true });

// ---------- helpers ----------
const readJSON = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
};
const writeJSON = (file, data) => {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, file);
};
const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- passwords ----------
const hashPassword = (pw) => {
  const salt = crypto.randomBytes(16).toString('hex');
  return { salt, hash: crypto.scryptSync(pw, salt, 64, SCRYPT).toString('hex'), N: SCRYPT.N };
};
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

const getAuth = () => readJSON(AUTH_FILE, null);
const saveAuth = (a) => writeJSON(AUTH_FILE, a);
if (!getAuth()) saveAuth({ ...hashPassword(DEFAULT_PASSWORD), isDefault: true });
if (!fs.existsSync(MESSAGES_FILE)) writeJSON(MESSAGES_FILE, []);

// ---------- security log ----------
const logEvent = (req, type, detail = '') => {
  const log = readJSON(LOG_FILE, []);
  log.unshift({ type, detail, ip: req?.ip || '', ua: String(req?.headers?.['user-agent'] || '').slice(0, 160), date: new Date().toISOString() });
  writeJSON(LOG_FILE, log.slice(0, 300));
};

// ---------- sessions ----------
const sessions = new Map(); // sha256(token) -> {id, created, seen, ip, ua}
const cookieName = (req) => (req.secure ? '__Host-sid' : 'sid');
const parseCookies = (req) => Object.fromEntries(
  (req.headers.cookie || '').split(';').filter((c) => c.includes('=')).map((c) => {
    const i = c.indexOf('=');
    let v = c.slice(i + 1).trim();
    try { v = decodeURIComponent(v); } catch { /* keep raw */ }
    return [c.slice(0, i).trim(), v];
  })
);
const getSession = (req) => {
  const token = parseCookies(req)[cookieName(req)];
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const key = sha256(token);
  const s = sessions.get(key);
  if (!s) return null;
  const now = Date.now();
  if (now - s.seen > SESSION_IDLE || now - s.created > SESSION_MAX) { sessions.delete(key); return null; }
  s.seen = now;
  return { key, ...s, ref: s };
};
const setSessionCookie = (req, res, token, maxAge) => {
  const secure = req.secure ? '; Secure' : '';
  res.append('Set-Cookie', `${cookieName(req)}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure}`);
};
const createSession = (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(sha256(token), { id: crypto.randomUUID(), created: Date.now(), seen: Date.now(), ip: req.ip, ua: String(req.headers['user-agent'] || '').slice(0, 160) });
  setSessionCookie(req, res, token, SESSION_MAX / 1000);
};
setInterval(() => { // sweep expired sessions
  const now = Date.now();
  for (const [k, s] of sessions) if (now - s.seen > SESSION_IDLE || now - s.created > SESSION_MAX) sessions.delete(k);
}, 10 * 60 * 1000).unref();

const requireAuth = (req, res, next) => {
  const s = getSession(req);
  if (!s) return res.status(401).json({ error: 'Not logged in' });
  req.session = s;
  next();
};
// Content changes are blocked until the default password has been replaced.
const requireSecured = (req, res, next) => (getAuth()?.isDefault
  ? res.status(403).json({ error: 'For security, change the default password in Settings → Security before editing.', code: 'DEFAULT_PASSWORD' })
  : next());

// ---------- rate limiting ----------
const limiter = (windowMs, max, message) => {
  const hits = new Map();
  setInterval(() => { const now = Date.now(); for (const [k, v] of hits) if (v.reset < now) hits.delete(k); }, windowMs).unref();
  return (req, res, next) => {
    const now = Date.now();
    let h = hits.get(req.ip);
    if (!h || h.reset < now) { h = { n: 0, reset: now + windowMs }; hits.set(req.ip, h); }
    if (++h.n > max) {
      res.set('Retry-After', Math.ceil((h.reset - now) / 1000));
      return res.status(429).json({ error: message || 'Too many requests. Please slow down.' });
    }
    next();
  };
};

// Escalating lockout for failed logins: 5 failures → 5 min, then 10, 20 … up to 24 h.
const loginFails = new Map(); // ip -> {count, locks, until}
const lockState = (ip) => loginFails.get(ip) || { count: 0, locks: 0, until: 0 };
const recordLoginFail = (req) => {
  const s = lockState(req.ip);
  s.count += 1;
  if (s.count >= 5) {
    s.locks += 1; s.count = 0;
    s.until = Date.now() + Math.min(5 * 60 * 1000 * 2 ** (s.locks - 1), 24 * 60 * 60 * 1000);
    logEvent(req, 'login_locked', `IP locked for ${Math.round((s.until - Date.now()) / 60000)} min`);
  }
  loginFails.set(req.ip, s);
};

// ---------- uploads ----------
const EXT = /\.(png|jpe?g|gif|webp|svg|avif|mp4|webm|mov|pdf|ico)$/i;
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'file';
    cb(null, `${base}-${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024, files: 20, fields: 5 },
  fileFilter: (req, file, cb) => (EXT.test(file.originalname) ? cb(null, true) : cb(new Error('File type not allowed'))),
});
// Check the real file contents match the extension (stops disguised files).
const sniff = (file) => {
  const fd = fs.openSync(file, 'r'); const b = Buffer.alloc(64);
  fs.readSync(fd, b, 0, 64, 0); fs.closeSync(fd);
  const hex = b.toString('hex'), ascii = b.toString('latin1');
  const ext = path.extname(file).toLowerCase().slice(1);
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
      const txt = fs.readFileSync(file, 'utf8');
      if (!/<svg[\s>]/i.test(txt)) return false;
      // reject anything that could execute or load external content
      return !/<script|<foreignobject|<iframe|<embed|<object|\son[a-z]+\s*=|javascript:|data:text\/html|<!entity|xlink:href\s*=\s*["']?\s*(https?:|\/\/)/i.test(txt);
    }
    default: return false;
  }
};
// Resize large photos, convert to WebP and strip metadata (EXIF can contain GPS location).
const optimise = async (file) => {
  if (!sharp || !/\.(png|jpe?g|webp|avif)$/i.test(file)) return file;
  try {
    const out = file.replace(/\.[^.]+$/, '') + '.webp';
    const tmp = out + '.tmp';
    await sharp(file, { limitInputPixels: 100e6 }).rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 }).toFile(tmp);
    if (file !== out) fs.unlinkSync(file);
    fs.renameSync(tmp, out);
    return out;
  } catch (e) {
    console.warn('optimise failed:', e.message);
    return file;
  }
};
const uploadsSize = () => fs.readdirSync(UPLOAD_DIR).reduce((n, f) => n + (fs.statSync(path.join(UPLOAD_DIR, f)).size || 0), 0);

// ---------- content history ----------
const snapshot = (reason) => {
  if (!fs.existsSync(CONTENT_FILE)) return;
  const id = new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(CONTENT_FILE, path.join(HISTORY_DIR, `${id}__${reason}.json`));
  const files = fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith('.json')).sort().reverse();
  files.slice(HISTORY_KEEP).forEach((f) => fs.unlinkSync(path.join(HISTORY_DIR, f)));
};
const validContent = (c) => c && typeof c === 'object' && !Array.isArray(c)
  && c.profile && typeof c.profile === 'object' && Array.isArray(c.sections);

// ---------- app ----------
const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? true : process.env.TRUST_PROXY);
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
app.use('/api', limiter(60 * 1000, 300));

const smallJSON = express.json({ limit: '20kb' });
const bigJSON = express.json({ limit: '3mb' });

// Public content
app.get('/api/content', (req, res) => res.json(readJSON(CONTENT_FILE, {})));

// Contact form
app.post('/api/messages', limiter(10 * 60 * 1000, 5, 'Too many messages — please try again later.'), smallJSON, (req, res) => {
  const clean = (v, n) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, n);
  const b = req.body || {};
  if (b.website) return res.json({ ok: true }); // honeypot: bots fill hidden fields
  if (Number(b.t) && Date.now() - Number(b.t) < 2500) return res.json({ ok: true }); // submitted too fast for a human
  const name = clean(b.name, 120), email = clean(b.email, 160), subject = clean(b.subject, 200), message = clean(b.message, 5000);
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message are required.' });
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) return res.status(400).json({ error: 'Please enter a valid email.' });
  if ((message.match(/https?:\/\//g) || []).length > 5) return res.status(400).json({ error: 'Too many links in the message.' });
  const messages = readJSON(MESSAGES_FILE, []);
  messages.unshift({ id: crypto.randomUUID(), name, email, subject, message, date: new Date().toISOString(), read: false });
  writeJSON(MESSAGES_FILE, messages.slice(0, MAX_MESSAGES));
  res.json({ ok: true });
});

// ---------- auth ----------
app.post('/api/login', smallJSON, async (req, res) => {
  const st = lockState(req.ip);
  if (st.until > Date.now()) {
    const mins = Math.ceil((st.until - Date.now()) / 60000);
    return res.status(429).json({ error: `Too many failed attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.` });
  }
  const auth = getAuth();
  const { password = '', code = '' } = req.body || {};
  if (!checkPassword(password, auth)) {
    recordLoginFail(req); logEvent(req, 'login_failed', 'wrong password');
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
        recordLoginFail(req); logEvent(req, 'login_failed', 'wrong 2FA code');
        await sleep(400);
        return res.status(401).json({ need2fa: true, error: 'Invalid code' });
      }
      auth.totp.backup.splice(i, 1);
      logEvent(req, 'backup_code_used', `${auth.totp.backup.length} backup codes left`);
    }
  }
  // upgrade old/weak hashes transparently
  if (!auth.N || auth.N < SCRYPT.N) Object.assign(auth, hashPassword(password));
  saveAuth(auth);
  loginFails.delete(req.ip);
  createSession(req, res);
  logEvent(req, 'login_success');
  res.json({ ok: true, isDefault: !!auth.isDefault });
});

app.post('/api/logout', (req, res) => {
  const s = getSession(req);
  if (s) sessions.delete(s.key);
  setSessionCookie(req, res, '', 0);
  res.json({ ok: true });
});

app.get('/api/session', (req, res) => {
  const a = getAuth();
  res.json({ authed: !!getSession(req), isDefault: !!a?.isDefault });
});

app.post('/api/password', requireAuth, smallJSON, (req, res) => {
  const auth = getAuth();
  const { current, next } = req.body || {};
  if (!checkPassword(current || '', auth)) { logEvent(req, 'password_change_failed'); return res.status(400).json({ error: 'Current password is wrong' }); }
  const problem = passwordProblem(next, auth);
  if (problem) return res.status(400).json({ error: problem });
  saveAuth({ ...auth, ...hashPassword(String(next)), isDefault: false });
  for (const k of sessions.keys()) if (k !== req.session.key) sessions.delete(k); // sign out everywhere else
  logEvent(req, 'password_changed');
  res.json({ ok: true });
});

// Security overview
app.get('/api/security', requireAuth, (req, res) => {
  const a = getAuth();
  res.json({
    twoFactor: !!a.totp?.enabled,
    backupCodesLeft: a.totp?.backup?.length || 0,
    isDefault: !!a.isDefault,
    sessions: [...sessions.entries()].map(([k, s]) => ({ id: s.id, ip: s.ip, ua: s.ua, created: s.created, seen: s.seen, current: k === req.session.key })),
    log: readJSON(LOG_FILE, []).slice(0, 100),
  });
});
app.post('/api/sessions/revoke-others', requireAuth, (req, res) => {
  let n = 0;
  for (const k of sessions.keys()) if (k !== req.session.key) { sessions.delete(k); n++; }
  logEvent(req, 'sessions_revoked', `${n} other session(s) signed out`);
  res.json({ ok: true, revoked: n });
});

// Two-factor authentication
const pending2fa = new Map(); // session key -> secret
app.post('/api/2fa/setup', requireAuth, async (req, res) => {
  const secret = totp.generateSecret();
  pending2fa.set(req.session.key, secret);
  const url = totp.otpauthURL(secret, 'admin', 'Topu Portfolio');
  res.json({ secret, qr: await QRCode.toDataURL(url, { margin: 1, width: 220 }) });
});
app.post('/api/2fa/enable', requireAuth, smallJSON, (req, res) => {
  const secret = pending2fa.get(req.session.key);
  if (!secret) return res.status(400).json({ error: 'Start the setup again' });
  const counter = totp.verify(secret, req.body?.code);
  if (counter == null) return res.status(400).json({ error: 'That code is not correct — check your phone’s time and try again' });
  const codes = Array.from({ length: 8 }, () => crypto.randomBytes(5).toString('hex').toUpperCase());
  const auth = getAuth();
  auth.totp = { enabled: true, secret, lastCounter: counter, backup: codes.map(sha256) };
  saveAuth(auth);
  pending2fa.delete(req.session.key);
  logEvent(req, '2fa_enabled');
  res.json({ ok: true, backupCodes: codes });
});
app.post('/api/2fa/disable', requireAuth, smallJSON, async (req, res) => {
  const auth = getAuth();
  if (!checkPassword(req.body?.password || '', auth)) { await sleep(400); return res.status(400).json({ error: 'Password is wrong' }); }
  delete auth.totp;
  saveAuth(auth);
  logEvent(req, '2fa_disabled');
  res.json({ ok: true });
});

// ---------- content ----------
app.put('/api/content', requireAuth, requireSecured, bigJSON, (req, res) => {
  if (!validContent(req.body)) return res.status(400).json({ error: 'Invalid content' });
  snapshot('save');
  writeJSON(CONTENT_FILE, req.body);
  res.json({ ok: true, savedAt: new Date().toISOString() });
});
app.get('/api/history', requireAuth, (req, res) => {
  res.json(fs.readdirSync(HISTORY_DIR).filter((f) => f.endsWith('.json')).sort().reverse().map((f) => {
    const [stamp, reason = ''] = f.replace(/\.json$/, '').split('__');
    const iso = stamp.replace(/^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/, '$1T$2:$3:$4.$5Z');
    return { id: f, date: iso, reason, size: fs.statSync(path.join(HISTORY_DIR, f)).size };
  }));
});
app.post('/api/history/:id/restore', requireAuth, requireSecured, (req, res) => {
  const id = path.basename(req.params.id);
  const file = path.join(HISTORY_DIR, id);
  if (!/^[\w-]+__\w+\.json$/.test(id) || !fs.existsSync(file)) return res.status(404).json({ error: 'Version not found' });
  const data = readJSON(file);
  if (!validContent(data)) return res.status(400).json({ error: 'That version is damaged' });
  snapshot('before-restore');
  writeJSON(CONTENT_FILE, data);
  logEvent(req, 'version_restored', id);
  res.json({ ok: true, content: data });
});

// ---------- media ----------
app.post('/api/upload', requireAuth, requireSecured, limiter(10 * 60 * 1000, 120, 'Too many uploads'), (req, res) => {
  if (uploadsSize() > MAX_UPLOAD_TOTAL) return res.status(507).json({ error: 'Upload storage is full — delete some files first' });
  upload.array('files', 20)(req, res, async (err) => {
    const files = req.files || [];
    if (err) { files.forEach((f) => fs.rmSync(f.path, { force: true })); return res.status(400).json({ error: err.message }); }
    const bad = files.filter((f) => !sniff(f.path));
    if (bad.length) {
      files.forEach((f) => fs.rmSync(f.path, { force: true }));
      logEvent(req, 'upload_rejected', bad.map((f) => f.originalname).join(', ').slice(0, 200));
      return res.status(400).json({ error: `Rejected “${bad[0].originalname}”: the file content does not match its type or contains unsafe code.` });
    }
    const out = [];
    for (const f of files) {
      const final = await optimise(f.path);
      out.push({ url: `/uploads/${path.basename(final)}`, name: path.basename(final), size: fs.statSync(final).size });
    }
    res.json({ files: out });
  });
});
app.get('/api/uploads', requireAuth, (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR).filter((f) => EXT.test(f)).map((f) => {
    const st = fs.statSync(path.join(UPLOAD_DIR, f));
    return { url: `/uploads/${f}`, name: f, size: st.size, date: st.mtime };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(files);
});
app.delete('/api/uploads/:name', requireAuth, requireSecured, (req, res) => {
  const name = path.basename(req.params.name);
  const file = path.join(UPLOAD_DIR, name);
  if (!EXT.test(name) || !fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
  fs.unlinkSync(file);
  res.json({ ok: true });
});

// ---------- messages ----------
app.get('/api/messages', requireAuth, (req, res) => res.json(readJSON(MESSAGES_FILE, [])));
app.patch('/api/messages/:id', requireAuth, smallJSON, (req, res) => {
  const messages = readJSON(MESSAGES_FILE, []);
  const m = messages.find((x) => x.id === req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  m.read = !!req.body?.read;
  writeJSON(MESSAGES_FILE, messages);
  res.json({ ok: true });
});
app.delete('/api/messages/:id', requireAuth, (req, res) => {
  writeJSON(MESSAGES_FILE, readJSON(MESSAGES_FILE, []).filter((x) => x.id !== req.params.id));
  res.json({ ok: true });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// ---------- public pages ----------
const escAttr = (s = '') => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const safeJSON = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const originOf = (req) => process.env.SITE_URL?.replace(/\/$/, '') || `${req.protocol}://${req.get('host')}`;
const renderHome = (req, res) => {
  const c = readJSON(CONTENT_FILE, {});
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
  const html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8')
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
};
app.get(['/', '/index.html'], renderHome);

app.get('/robots.txt', (req, res) => res.type('text/plain').send(
  `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${originOf(req)}/sitemap.xml\n`));
app.get('/sitemap.xml', (req, res) => {
  const mod = fs.existsSync(CONTENT_FILE) ? fs.statSync(CONTENT_FILE).mtime.toISOString() : new Date().toISOString();
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escAttr(originOf(req))}/</loc><lastmod>${mod}</lastmod><priority>1.0</priority></url></urlset>\n`);
});

// Uploaded files: sandboxed so even a malicious file can never run scripts on this site
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
app.use((req, res) => res.status(404).sendFile(path.join(ROOT, 'public/404.html')));
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  if (res.headersSent) return;
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: status === 413 ? 'Request too large' : status < 500 ? 'Bad request' : 'Server error' });
});

app.listen(PORT, () => {
  console.log(`\n  Portfolio running:  http://localhost:${PORT}`);
  console.log(`  Admin panel:        http://localhost:${PORT}/admin`);
  if (getAuth()?.isDefault) console.log(`  Default password:   ${DEFAULT_PASSWORD}  (you'll be asked to change it)\n`);
});
