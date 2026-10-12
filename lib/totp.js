// Minimal RFC 6238 TOTP (Google Authenticator compatible), no dependencies.
const crypto = require('crypto');

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const base32Encode = (buf) => {
  let bits = 0, value = 0, out = '';
  for (const byte of buf) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
};

const base32Decode = (str) => {
  const clean = str.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0, value = 0; const out = [];
  for (const ch of clean) {
    value = (value << 5) | B32.indexOf(ch); bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
};

const hotp = (secret, counter) => {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac('sha1', base32Decode(secret)).update(buf).digest();
  const o = h[h.length - 1] & 15;
  const code = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(code % 1e6).padStart(6, '0');
};

const generateSecret = () => base32Encode(crypto.randomBytes(20));

// Returns the matched time-step counter, or null. Rejects codes at or before lastCounter (replay protection).
const verify = (secret, code, lastCounter = -1, window = 1) => {
  const c = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(c)) return null;
  const now = Math.floor(Date.now() / 30000);
  for (let w = -window; w <= window; w++) {
    const counter = now + w;
    if (counter <= lastCounter) continue;
    if (crypto.timingSafeEqual(Buffer.from(hotp(secret, counter)), Buffer.from(c))) return counter;
  }
  return null;
};

const otpauthURL = (secret, account, issuer) =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

module.exports = { generateSecret, verify, otpauthURL, hotp };
