# Mahmudul Hasan Topu — Portfolio

Personal portfolio with a built-in admin panel. Every piece of text, image, skill, project and demo video can be edited from the browser.

## Run it

```bash
npm install
npm start
```

- Website: http://localhost:3000
- Admin panel: http://localhost:3000/admin
- Default admin password: `admin123`. On first login you're taken to **Security** and editing stays locked until you choose a strong password.

## Admin panel

| Area | What you can do |
|---|---|
| Dashboard | Unread messages, counts and quick links |
| Profile & Socials | Name, role, email, phone, location, CV (PDF), social links |
| Hero | Photo and photo style (orange duotone, black & white or natural colour), intro text, button, services list, the scrolling text band |
| Sections & Order | Show or hide any section, rename menu labels and change the section order |
| About, What I Offer, How I Work, Skills, Projects, Experience, Certifications, Highlights, Testimonials, Contact | Edit every field. You can add, duplicate, delete and drag-to-reorder list items |
| Projects | Cover image, demo video (MP4 upload or YouTube/Vimeo link), live and code links, tags, extra screenshots, "featured" layout |
| SEO & Appearance | Page title, meta description and keywords with a Google preview, accent colour, favicon, loading screen and cursor settings |
| Media Library | Upload (drag and drop works), browse, copy links to and delete images, videos and PDFs |
| Messages | Read contact form messages, reply by email, mark them read or unread, delete them |
| Security | Change password (strength meter), two-factor login with QR code + backup codes, active sessions, security activity log |
| Backups & History | One-click restore of any of the last 20 saved versions, download/restore a backup file |

**Live preview:** click **Preview** to see your edits on the site as you type. Press **Save** or **Ctrl + S** to publish them.

**Text highlighting:** in statements, `*word*` turns the word orange and `~word~` turns it grey.

## Where things are stored

- `data/content.json`: all site content
- `data/messages.json`: contact form messages
- `data/auth.json`: the hashed admin password and 2FA settings. Deleting it resets the password to `admin123` and turns off 2FA, so only someone with access to the server's files can do this. If you lose your phone and your backup codes, this is how you get back in.
- `data/history/`: the last 20 saved versions
- `data/security-log.json`: sign-ins and security events
- `uploads/`: your uploaded files

## Deploying

You need a host that runs Node.js and keeps files on disk, such as a VPS, Render (with a persistent disk), Railway or Hostinger's Node hosting. Set `PORT` if your host needs it. You can also set `ADMIN_PASSWORD` before the first start to choose the initial password.

## Security

- Passwords are hashed with scrypt and must be strong (10+ characters, mixed types, no common passwords, no name).
- Optional two-factor login (TOTP: Google Authenticator, Authy, etc.) with 8 one-time backup codes and protection against code reuse.
- After 5 wrong attempts an IP is locked out, starting at 5 minutes and doubling each time, up to 24 hours. Every failed attempt is logged.
- Sessions use HttpOnly, SameSite=Strict cookies that are Secure on HTTPS. They expire after 2 hours of inactivity and always after 12 hours. Changing the password signs out every other device.
- Every change must come from the admin page itself (custom header + Origin check), which stops cross-site request forgery.
- Strict Content-Security-Policy and other security headers protect against XSS, clickjacking and MIME sniffing.
- Uploads are checked by their real contents, not just the file name. Unsafe SVGs are rejected, and uploaded files are served in a sandbox. Photos are resized, converted to WebP and stripped of EXIF/GPS data.
- The API and contact form are rate-limited. The contact form also has a honeypot and a time check against spam bots.

### When you put it online
1. **Use HTTPS.** Most hosts provide it free. Without it, passwords can be read on public Wi-Fi.
2. If the site runs behind a proxy (Render, Railway, Nginx, Cloudflare), set `TRUST_PROXY=1` so lockouts see real visitor IPs, and `SITE_URL=https://your-domain.com` for correct SEO links.
3. Turn on two-factor login in **Security** and store the backup codes somewhere safe.
4. Keep Node.js and dependencies updated (`npm audit`, `npm update`).
