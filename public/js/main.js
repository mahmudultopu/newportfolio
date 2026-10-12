/* Portfolio front-end: renders all sections from content JSON and wires up motion. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const isPreview = new URLSearchParams(location.search).has('preview');
  const readInitial = () => { try { return JSON.parse(document.getElementById('initial-content')?.textContent || '{}'); } catch { return {}; } };
  let C = readInitial();

  // ---------- helpers ----------
  const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // *text* -> accent, ~text~ -> muted
  const segments = (s = '') => {
    const out = []; const re = /\*([^*]+)\*|~([^~]+)~/g; let last = 0, m;
    while ((m = re.exec(s))) {
      if (m.index > last) out.push({ t: s.slice(last, m.index), c: '' });
      out.push(m[1] != null ? { t: m[1], c: 'accent' } : { t: m[2], c: 'muted' });
      last = re.lastIndex;
    }
    if (last < s.length) out.push({ t: s.slice(last), c: '' });
    return out;
  };
  const rich = (s) => segments(s).map(({ t, c }) => (c ? `<span class="${c}">${esc(t)}</span>` : esc(t))).join('');
  const words = (s) => segments(s).map(({ t, c }) =>
    t.split(/(\s+)/).map((w) => (/^\s+$/.test(w) || !w ? w : `<span class="w ${c}">${esc(w)}</span>`)).join('')).join('');
  // Only allow safe link schemes (blocks javascript: and data: URLs)
  const safeUrl = (u = '') => {
    u = String(u).trim();
    if (/^(https?:|mailto:|tel:)/i.test(u) || /^#[\w-]*$/.test(u) || /^\/(?!\/)/.test(u)) return u;
    if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return 'https://' + u; // "github.com/me" -> https://
    return '#';
  };
  const link = (u) => esc(safeUrl(u));
  const letters = (t, start = 0) => [...String(t || '')].map((ch, i) =>
    `<span class="ch" style="--i:${start + i}" aria-hidden="true">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('');
  const visible = (id) => (C.sections || []).find((s) => s.id === id)?.visible !== false;
  const arrow = '<span class="btn__icon">↗</span>';
  const pad = (n) => String(n).padStart(2, '0');
  const fullName = () => [C.profile?.firstName, C.profile?.lastName].filter(Boolean).join(' ');
  const splitLines = (text, delay = 0) => esc(text).split('|').map((l, i) =>
    `<span class="split-line"><span style="--d:${delay + i * 0.08}s">${l}</span></span>`).join('');

  // ---------- section renderers ----------
  const R = {};

  R.hero = () => {
    const h = C.hero || {}, p = C.profile || {};
    const style = h.photoStyle || 'duotone';
    return `
    <section class="hero hero--${esc(style)}" id="top">
      ${h.photo ? `<div class="hero__media"><img src="${esc(h.photo)}" alt="${esc(fullName())}" id="heroImg" fetchpriority="high"></div>` : ''}
      <div class="hero__inner">
        <div class="hero__top" data-hero-fade>
          ${p.availability ? `<span class="badge-live">${esc(p.availability)}</span>` : ''}
          ${p.location ? `<span>${esc(p.location)}</span>` : ''}
        </div>
        <div>
          <h1 class="display hero__name" aria-label="${esc(fullName())}">
            <span class="line">${letters(p.firstName)}</span>
            <span class="line">${letters(p.lastName, (p.firstName || '').length)}</span>
          </h1>
          ${p.nickname ? `<div class="hero__nick" data-hero-fade>${esc(p.nickname)}</div>` : ''}
        </div>
        ${(h.services || []).length ? `
        <aside class="hero__services" data-hero-fade>
          <h4>${esc(h.servicesTitle || 'Services')}</h4>
          <ul>${h.services.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
        </aside>` : ''}
        <div class="hero__bottom" data-hero-fade>
          <div>
            <div class="hero__role">${esc(p.role)}</div>
            <p class="hero__intro">${esc(h.intro)}</p>
          </div>
          <div class="hero__actions">
            ${socialsHTML()}
            ${h.ctaText ? `<a class="btn btn--dark" href="${link(h.ctaLink || '#contact')}">${esc(h.ctaText)} ${arrow}</a>` : ''}
          </div>
        </div>
      </div>
      <div class="hero__scroll" aria-hidden="true"></div>
    </section>
    ${(C.marquee || []).length ? `
    <div class="marquee" aria-hidden="true"><div class="marquee__track">
      ${[...C.marquee, ...C.marquee, ...C.marquee, ...C.marquee].map((m) => `<span class="marquee__item">${esc(m)}</span>`).join('')}
    </div></div>` : ''}`;
  };

  const socialsHTML = () => `<div class="socials">${(C.socials || []).filter((s) => s.url)
    .map((s) => `<a href="${link(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(s.label)}">${esc(s.short || s.label)}</a>`).join('')}</div>`;

  R.about = () => {
    const a = C.about || {};
    return `
    <section class="section" id="about">
      <div class="container">
        <div class="about__grid">
          <div data-reveal><span class="eyebrow">${esc(a.label || 'About me')}</span></div>
          <p class="about__statement" id="aboutStatement">${words(a.statement)}</p>
        </div>
        ${(a.images || []).length ? `<div class="about__strip">${a.images.slice(0, 5).map((src, i) =>
          `<figure data-reveal style="--d:${i * 0.08}s"><img src="${esc(src)}" alt="" loading="lazy"></figure>`).join('')}</div>` : ''}
      </div>
    </section>`;
  };

  R.services = () => {
    const s = C.services || {}; const items = s.items || [];
    if (!items.length) return '';
    return `
    <section class="section section--paper" id="services">
      <div class="container">
        <div class="services__head" data-reveal>
          <div class="services__count"><span id="svcIdx">01</span><small>/${pad(items.length)}</small></div>
          <a class="btn btn--dark btn--sm" href="#contact">${esc(s.buttonText || "Let's talk")} ${arrow}</a>
        </div>
        <div class="services__grid">
          <h2 class="display services__title" data-reveal>${esc(s.titleLeft)}</h2>
          <div class="services__media" data-reveal style="--d:.1s">
            ${items.map((it, i) => `<img src="${esc(it.image || s.image)}" alt="${esc(it.title)}" class="${i === 0 ? 'on' : ''}" loading="lazy">`).join('')}
          </div>
          <div class="services__right">
            <h2 class="display services__title services__title--right" data-reveal style="--d:.15s"><span class="services__title-pre" style="display:none">${esc(s.titleLeft)} </span>${esc(s.titleRight)}</h2>
            <div class="services__body" data-reveal style="--d:.2s">
              <p class="services__desc" id="svcDesc">${esc(items[0].description)}</p>
              <ul class="services__list">
                ${items.map((it, i) => `<li class="${i === 0 ? 'on' : ''}"><button type="button" data-i="${i}">${esc(it.title)}</button></li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  };

  R.process = () => {
    const p = C.process || {}; const steps = p.steps || [];
    if (!steps.length) return '';
    return `
    <section class="section" id="process">
      <div class="container">
        <div class="process__head">
          <div><span class="eyebrow" data-reveal>Process</span><h2 class="display" data-reveal>${esc(p.title)}</h2></div>
          <p data-reveal>${esc(p.intro)}</p>
        </div>
        <div class="process__grid">
          ${steps.map((s, i) => `
          <article class="step ${i === 1 || (steps.length === 1 && i === 0) ? 'on' : ''}" data-reveal style="--d:${i * 0.08}s">
            <div class="step__num">${i + 1}.</div>
            <div><h3>${esc(s.title)}</h3><p>${esc(s.description)}</p></div>
          </article>`).join('')}
        </div>
      </div>
    </section>`;
  };

  R.skills = () => {
    const s = C.skills || {}; const items = s.items || [];
    if (!items.length) return '';
    const cats = [...new Set(items.map((i) => i.category).filter(Boolean))];
    return `
    <section class="section section--skills" id="skills">
      <div class="container">
        <div class="skills__head">
          <div><span class="eyebrow" data-reveal>Expertise</span><h2 class="display" data-reveal>${esc(s.title)}</h2><p data-reveal>${esc(s.intro)}</p></div>
          ${cats.length > 1 ? `<div class="tabs" data-reveal><button class="tab on" data-cat="*">All</button>${cats.map((c) => `<button class="tab" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}
        </div>
        <div class="skills__grid">
          ${items.map((it) => {
            const lv = Math.max(0, Math.min(100, Number(it.level) || 0));
            return `<div class="skill" data-cat="${esc(it.category)}">
              <div class="skill__top"><span class="skill__name">${esc(it.name)}</span><span class="skill__val">${lv}%</span></div>
              <div class="skill__bar"><span style="--w:${lv}%"></span></div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </section>`;
  };

  const isVideoFile = (u = '') => /\.(mp4|webm|mov)(\?|$)/i.test(u);
  R.projects = () => {
    const p = C.projects || {}; const items = p.items || [];
    if (!items.length) return '';
    const cats = [...new Set(items.map((i) => i.category).filter(Boolean))];
    return `
    <section class="section" id="projects">
      <div class="container">
        <div class="projects__head">
          <div><span class="eyebrow" data-reveal>Portfolio</span><h2 class="display" data-reveal>${esc(p.title)}</h2><p data-reveal>${esc(p.intro)}</p></div>
          ${cats.length > 1 ? `<div class="tabs" data-reveal><button class="tab on" data-cat="*">All</button>${cats.map((c) => `<button class="tab" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>` : ''}
        </div>
        <div class="projects__grid">
          ${items.map((it, i) => `
          <button type="button" class="project ${it.featured ? 'featured' : ''}" data-i="${i}" data-cat="${esc(it.category)}" data-reveal data-cursor="view">
            <div class="project__media">
              ${it.image ? `<img src="${esc(it.image)}" alt="${esc(it.title)}" loading="lazy">`
                : isVideoFile(it.videoUrl) ? `<video src="${esc(it.videoUrl)}" muted loop playsinline autoplay></video>` : ''}
              ${it.category ? `<span class="project__chip">${esc(it.category)}</span>` : ''}
              ${it.videoUrl ? `<span class="project__play">▶ Demo</span>` : ''}
            </div>
            <div class="project__info">
              <div>
                <h3 class="project__title">${esc(it.title)}</h3>
                <div class="project__tags">${(it.tags || []).map((t) => `<span>${esc(t)}</span>`).join('')}</div>
              </div>
              <div style="display:flex;gap:14px;align-items:center">
                ${it.year ? `<span class="project__year">${esc(it.year)}</span>` : ''}
                <span class="project__arrow">↗</span>
              </div>
            </div>
          </button>`).join('')}
        </div>
      </div>
    </section>`;
  };

  R.experience = () => {
    const e = C.experience || {}; const items = e.items || [];
    if (!items.length) return '';
    return `
    <section class="section section--paper" id="experience">
      <div class="container exp">
        <span class="exp__badge" data-reveal>${esc(e.label || 'My experience')}</span>
        <h2 class="display exp__title" data-reveal>${esc(e.title)}<br><span class="accent">${esc(e.titleAccent)}</span></h2>
        <div class="exp__card" data-reveal>
          ${items.map((it) => `
          <div class="exp__item">
            <div><div class="exp__role">${esc(it.role)}</div><div class="exp__company">${esc(it.company)}</div><div class="exp__period">${esc(it.period)}</div></div>
            <div class="exp__dot"><span></span></div>
            <p class="exp__desc">${esc(it.description)}</p>
          </div>`).join('')}
        </div>
        <div class="exp__cta" data-reveal><a class="btn btn--dark" href="#contact">${esc(e.buttonText || "Let's work together")} ${arrow}</a></div>
      </div>
    </section>`;
  };

  R.certifications = () => {
    const c = C.certifications || {}; const items = c.items || [];
    if (!items.length) return '';
    return `
    <section class="section" id="certifications">
      <div class="container">
        <div class="certs__head">
          <h2 class="display" data-reveal>${esc(c.titleTop)}<span>${esc(c.titleBottom)}</span></h2>
          ${c.buttonLink ? `<a class="btn btn--accent btn--sm" href="${link(c.buttonLink)}" target="_blank" rel="noopener noreferrer" data-reveal>${esc(c.buttonText || 'View all')} ${arrow}</a>` : ''}
        </div>
        <div data-reveal>
          <table class="certs__table">
            <thead><tr><th>Organization</th><th>Title</th><th>Date</th></tr></thead>
            <tbody>${items.map((it) => `<tr><td>${esc(it.organization)}</td><td>${it.link ? `<a href="${link(it.link)}" target="_blank" rel="noopener noreferrer">${esc(it.title)} ↗</a>` : esc(it.title)}</td><td>${esc(it.date)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>
    </section>`;
  };

  R.stats = () => {
    const s = C.stats || {}; const items = s.items || [];
    return `
    <section class="section" id="stats" style="padding-top:0">
      <div class="container">
        <div class="stats__top">
          <div data-reveal><span class="eyebrow">${esc(s.label || 'Highlights')}</span></div>
          <div data-reveal>
            <p class="stats__statement">${rich(s.statement)}</p>
            ${s.note ? `<div class="stats__note">${esc(s.note)}</div>` : ''}
          </div>
        </div>
        ${items.length ? `<div class="stats__grid">${items.map((it, i) => `
          <div class="stat" data-reveal style="--d:${i * 0.08}s">
            <p>${esc(it.description)}</p>
            <div><div class="stat__num"><span data-count="${Number(it.value) || 0}">0</span>${esc(it.suffix)}</div><div class="stat__label">${esc(it.label)}</div></div>
          </div>`).join('')}</div>` : ''}
      </div>
    </section>`;
  };

  R.testimonials = () => {
    const t = C.testimonials || {}; const items = t.items || [];
    if (!items.length) return '';
    return `
    <section class="section" id="testimonials">
      <div class="container testi">
        <h2 class="display" data-reveal>${esc(t.title || 'Testimonials')}</h2>
        <div class="testi__stage" data-reveal>
          ${items.map((it, i) => `
          <figure class="testi__slide ${i === 0 ? 'on' : ''}" style="margin:0">
            <blockquote class="testi__quote">${esc(it.quote)}</blockquote>
            ${it.photo ? `<img class="testi__photo" src="${esc(it.photo)}" alt="${esc(it.name)}" loading="lazy">` : ''}
            <figcaption><div class="testi__name">${esc(it.name)}</div><div class="testi__role">${esc(it.role)}</div></figcaption>
          </figure>`).join('')}
        </div>
        ${items.length > 1 ? `<div class="testi__nav"><button type="button" data-dir="-1">← Prev</button><button type="button" data-dir="1">Next →</button></div>` : ''}
      </div>
    </section>`;
  };

  R.contact = () => {
    const c = C.contact || {}, p = C.profile || {};
    return `
    <section class="section" id="contact">
      <div class="container contact__grid">
        <div class="cta-card-wrap" data-reveal>
          <div class="cta-card">
            <span class="cta-card__badge">${esc(c.badge)}</span>
            <h2 class="display">${esc(c.title)}</h2>
            <p>${esc(c.text)}</p>
            ${p.resume ? `<a class="btn btn--accent btn--sm" href="${link(p.resume)}" target="_blank" rel="noopener noreferrer">Download CV ${arrow}</a>` : ''}
            <div class="cta-card__meta">
              <div><b>Email</b><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></div>
              <div style="text-align:right"><b>Location</b>${esc(p.location)}</div>
            </div>
          </div>
        </div>
        <form class="form" id="contactForm" novalidate data-reveal style="--d:.1s">
          <h3>Send a message</h3>
          <div class="form__row">
            <div class="field"><input id="f-name" name="name" placeholder=" " required><label for="f-name">Your name</label></div>
            <div class="field"><input id="f-email" name="email" type="email" placeholder=" " required><label for="f-email">Email address</label></div>
          </div>
          <div class="field"><input id="f-subject" name="subject" placeholder=" "><label for="f-subject">Subject</label></div>
          <div class="field"><textarea id="f-msg" name="message" placeholder=" " required></textarea><label for="f-msg">Tell me about your project</label></div>
          <input class="form__hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <div class="form__status" id="formStatus" role="status"></div>
          <button class="btn btn--accent" type="submit">${esc(c.buttonText || 'Send message')} ${arrow}</button>
        </form>
      </div>
    </section>`;
  };

  const renderFooter = () => {
    const p = C.profile || {}, h = C.hero || {};
    $('#footer').innerHTML = `
      <div class="container">
        <div class="footer__top">
          ${h.photo ? `<div class="footer__photo"><img src="${esc(h.photo)}" alt="${esc(fullName())}" loading="lazy"></div>` : '<div></div>'}
          <div class="footer__talk">
            <h3>Let's talk</h3>
            ${p.email ? `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>` : ''}
            ${p.phone ? `<a href="tel:${esc(p.phone.replace(/\s/g, ''))}">${esc(p.phone)}</a>` : ''}
          </div>
        </div>
        <div class="footer__mid">
          <nav class="footer__links">${navItems().map((n) => `<a href="#${n.id}">${esc(n.label)}</a>`).join('')}</nav>
          ${socialsHTML()}
        </div>
        <div class="footer__name display" id="footerName">${esc(fullName())}</div>
        <div class="footer__bottom">
          <span>© ${new Date().getFullYear()} ${esc(C.footer?.text || fullName())}</span>
          <a href="#top" class="to-top">Back to top ↑</a>
        </div>
      </div>`;
  };

  const navItems = () => (C.sections || []).filter((s) => s.visible !== false && s.inNav !== false && ['about', 'services', 'skills', 'projects', 'experience', 'contact'].includes(s.id));

  const renderNav = () => {
    const p = C.profile || {};
    const initials = ((p.firstName || '')[0] || '') + ((p.lastName || '')[0] || '');
    $('#navLogo').innerHTML = `<i>${esc(initials)}</i><span>${esc(p.nickname || p.firstName)}</span>`;
    $('#navLinks').innerHTML = navItems().map((n) => `<a href="#${n.id}"><span data-text="${esc(n.label)}">${esc(n.label)}</span></a>`).join('');
    $('#menuLinks').innerHTML = navItems().map((n, i) => `<a href="#${n.id}" style="transition-delay:${0.2 + i * 0.05}s">${esc(n.label)}</a>`).join('');
    $('#menuFoot').innerHTML = `${p.email ? `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>` : ''}${(C.socials || []).map((s) => `<a href="${link(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a>`).join('')}`;
  };

  // ---------- render all ----------
  const render = () => {
    document.documentElement.style.setProperty('--accent', /^#[0-9a-f]{3,8}$/i.test(C.site?.accent || '') ? C.site.accent : '#ff5b14');
    const order = (C.sections || []).map((s) => s.id);
    const html = [R.hero(), ...order.filter((id) => visible(id) && R[id]).map((id) => R[id]())].join('');
    $('#app').innerHTML = html;
    renderNav();
    renderFooter();
    bind();
  };

  // ---------- interactions ----------
  let io;
  const bind = () => {
    // reveal on scroll
    io?.disconnect();
    io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      const cnt = e.target.querySelector('[data-count]');
      if (cnt) countUp(cnt);
      io.unobserve(e.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    $$('[data-reveal], .skill').forEach((el) => io.observe(el));

    // services hover
    const svc = $('#services');
    if (svc) {
      const items = C.services.items;
      const setSvc = (i) => {
        $$('.services__list li', svc).forEach((li, j) => li.classList.toggle('on', j === i));
        $$('.services__media img', svc).forEach((im, j) => im.classList.toggle('on', j === i));
        $('#svcIdx').textContent = pad(i + 1);
        $('#svcDesc').textContent = items[i].description || '';
      };
      $$('.services__list button', svc).forEach((b) => {
        const i = +b.dataset.i;
        b.addEventListener('mouseenter', () => setSvc(i));
        b.addEventListener('focus', () => setSvc(i));
        b.addEventListener('click', () => setSvc(i));
      });
    }

    // process hover
    const steps = $$('.step');
    steps.forEach((s) => s.addEventListener('mouseenter', () => steps.forEach((x) => x.classList.toggle('on', x === s))));

    // tab filters (skills + projects)
    $$('.tabs').forEach((tabs) => {
      const scope = tabs.closest('section');
      tabs.addEventListener('click', (e) => {
        const b = e.target.closest('.tab'); if (!b) return;
        $$('.tab', tabs).forEach((t) => t.classList.toggle('on', t === b));
        $$('[data-cat]:not(.tab)', scope).forEach((el) => {
          const show = b.dataset.cat === '*' || el.dataset.cat === b.dataset.cat;
          el.classList.toggle('hide', !show);
          if (show) el.classList.add('in');
        });
      });
    });

    // project modal
    $$('.project').forEach((el) => el.addEventListener('click', () => openProject(C.projects.items[+el.dataset.i])));

    // testimonials
    const slides = $$('.testi__slide'); let ti = 0;
    $$('.testi__nav button').forEach((b) => b.addEventListener('click', () => {
      ti = (ti + +b.dataset.dir + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle('on', j === ti));
    }));

    // contact form
    const form = $('#contactForm');
    const formStart = Date.now();
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = $('#formStatus'); const btn = form.querySelector('button[type=submit]');
      const data = { ...Object.fromEntries(new FormData(form)), t: formStart };
      if (!data.name.trim() || !data.email.trim() || !data.message.trim()) {
        status.className = 'form__status err'; status.textContent = 'Please fill in your name, email and message.'; return;
      }
      if (isPreview) { status.className = 'form__status ok'; status.textContent = 'Preview mode — message not sent.'; return; }
      btn.disabled = true; status.className = 'form__status'; status.textContent = 'Sending…';
      try {
        const r = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' }, body: JSON.stringify(data) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Something went wrong');
        form.reset(); status.className = 'form__status ok'; status.textContent = 'Thank you! Your message has been sent.';
      } catch (err) {
        status.className = 'form__status err'; status.textContent = err.message;
      } finally { btn.disabled = false; }
    });

    bindCursorTargets();
    bindMagnetic();
    marqueeTrack = $('.marquee__track'); marqueePos = 0;
    if (marqueeTrack && !reduceMotion) marqueeTrack.parentElement.classList.add('is-js');
    fitFooterName();
    onScroll();
  };

  const countUp = (el) => {
    const target = +el.dataset.count; const dur = 1600; const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur); const v = target * (1 - Math.pow(1 - k, 4));
      el.textContent = Number.isInteger(target) ? Math.round(v) : v.toFixed(1);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const embedUrl = (u = '') => {
    let m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
    if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`;
    m = u.match(/vimeo\.com\/(\d+)/);
    if (m) return `https://player.vimeo.com/video/${m[1]}?autoplay=1`;
    return null;
  };
  const openProject = (p) => {
    if (!p) return;
    let media = '';
    if (p.videoUrl && embedUrl(p.videoUrl)) media = `<iframe src="${esc(embedUrl(p.videoUrl))}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="${esc(p.title)}"></iframe>`;
    else if (p.videoUrl && isVideoFile(p.videoUrl)) media = `<video src="${esc(p.videoUrl)}" controls autoplay playsinline ${p.image ? `poster="${esc(p.image)}"` : ''}></video>`;
    else if (p.image) media = `<img src="${esc(p.image)}" alt="${esc(p.title)}">`;
    const gallery = (p.gallery || []).filter(Boolean);
    $('#modalBody').innerHTML = `
      ${media ? `<div class="modal__media">${media}</div>` : ''}
      <div class="modal__content">
        <span class="eyebrow">${esc(p.category)} ${p.year ? '· ' + esc(p.year) : ''}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description).replace(/\n/g, '<br>')}</p>
        ${(p.tags || []).length ? `<div class="modal__tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        <div class="modal__links">
          ${p.liveUrl ? `<a class="btn btn--accent btn--sm" href="${link(p.liveUrl)}" target="_blank" rel="noopener noreferrer">Live demo ${arrow}</a>` : ''}
          ${p.codeUrl ? `<a class="btn btn--sm" href="${link(p.codeUrl)}" target="_blank" rel="noopener noreferrer">Source code ${arrow}</a>` : ''}
          ${p.videoUrl && !embedUrl(p.videoUrl) && !isVideoFile(p.videoUrl) ? `<a class="btn btn--sm" href="${link(p.videoUrl)}" target="_blank" rel="noopener noreferrer">Watch video ${arrow}</a>` : ''}
        </div>
        ${gallery.length ? `<div class="modal__gallery">${gallery.map((g) => `<button type="button" class="gallery__thumb" data-src="${esc(g)}" aria-label="View screenshot"><img src="${esc(g)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
      </div>`;
    $$('.gallery__thumb', $('#modalBody')).forEach((b) => b.addEventListener('click', () => {
      let m = $('.modal__media', $('#modalBody'));
      if (!m) { m = document.createElement('div'); m.className = 'modal__media'; $('#modalBody').prepend(m); }
      m.innerHTML = `<img src="${esc(b.dataset.src)}" alt="">`;
      $('.modal__panel').scrollTo({ top: 0, behavior: 'smooth' });
    }));
    $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    $('.modal__close').focus();
  };
  const closeModal = () => {
    $('#modal').classList.remove('open'); $('#modal').setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    setTimeout(() => { if (!$('#modal').classList.contains('open')) $('#modalBody').innerHTML = ''; }, 400);
  };
  $('#modal').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); toggleMenu(false); } });

  // menu
  const toggleMenu = (open = !document.body.classList.contains('menu-open')) => {
    document.body.classList.toggle('menu-open', open);
    $('#burger').setAttribute('aria-expanded', open);
    $('#menu').setAttribute('aria-hidden', !open);
  };
  $('#burger').addEventListener('click', () => toggleMenu());
  $('#menu').addEventListener('click', (e) => { if (e.target.closest('a')) toggleMenu(false); });

  // footer name fits full width
  const fitFooterName = () => {
    const el = $('#footerName'); if (!el) return;
    el.style.display = ''; const w = el.clientWidth;
    el.style.display = 'inline-block'; el.style.fontSize = '100px';
    const size = Math.floor((100 * w) / el.offsetWidth * 10) / 10 - 0.5;
    el.style.display = ''; el.style.fontSize = `${size}px`;
  };
  addEventListener('resize', fitFooterName);
  document.fonts?.load('400 100px Anton').then(fitFooterName).catch(() => {});
  addEventListener('load', fitFooterName);

  // ---------- scroll effects ----------
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = scrollY; const nav = $('#nav');
    const heroH = $('.hero')?.offsetHeight || 600;
    nav.classList.toggle('is-scrolled', y > heroH - 80);
    nav.classList.toggle('is-hidden', y > lastY && y > heroH && !document.body.classList.contains('menu-open'));
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    $('#scrollProgress').style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    const img = $('#heroImg');
    if (img && y < heroH) img.style.transform = `translateY(${y * 0.25}px) scale(${1 + y * 0.0002})`;

    // about: words light up as you scroll
    const st = $('#aboutStatement');
    if (st) {
      const r = st.getBoundingClientRect();
      const prog = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const ws = st.querySelectorAll('.w'); const n = Math.round(prog * ws.length);
      ws.forEach((w, i) => w.classList.toggle('on', i < n));
    }
    // strip parallax
    $$('.about__strip figure').forEach((f, i) => {
      const r = f.getBoundingClientRect();
      f.style.setProperty('--py', `${((r.top - innerHeight / 2) * (i % 2 ? 0.04 : -0.06)).toFixed(1)}px`);
    });

    // active nav link
    let current = '';
    navItems().forEach((n) => { const s = document.getElementById(n.id); if (s && s.getBoundingClientRect().top < innerHeight * 0.4) current = n.id; });
    $$('#navLinks a').forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // ---------- magnetic buttons ----------
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const bindMagnetic = () => {
    if (reduceMotion || !finePointer) return;
    $$('.btn, .project__arrow, .socials a').forEach((el) => {
      if (el.dataset.magnet) return; el.dataset.magnet = 1;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25, y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  };

  // ---------- marquee reacts to scroll speed & direction ----------
  let marqueeTrack = null, marqueePos = 0, marqueeVel = 0, marqueeDir = 1, lastSY = scrollY;
  const marqueeLoop = () => {
    const dy = scrollY - lastSY; lastSY = scrollY;
    if (dy) marqueeDir = dy > 0 ? 1 : -1;
    marqueeVel += (Math.min(Math.abs(dy), 80) * 0.25 - marqueeVel) * 0.08;
    if (marqueeTrack && !reduceMotion) {
      const half = marqueeTrack.scrollWidth / 2;
      marqueePos -= (0.6 + marqueeVel) * marqueeDir;
      if (half) { if (marqueePos <= -half) marqueePos += half; if (marqueePos > 0) marqueePos -= half; }
      marqueeTrack.style.transform = `translate3d(${marqueePos.toFixed(2)}px,0,0)`;
    }
    requestAnimationFrame(marqueeLoop);
  };
  requestAnimationFrame(marqueeLoop);

  // ---------- cursor ----------
  const cursor = $('#cursor'), dot = $('#cursorDot');
  let mx = -100, my = -100, cx = -100, cy = -100;
  const useCursor = () => C.site?.showCursor !== false && matchMedia('(hover: hover) and (pointer: fine)').matches && !isPreview;
  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
    if (useCursor()) document.body.classList.add('has-cursor');
  });
  document.addEventListener('mouseleave', () => document.body.classList.remove('has-cursor'));
  const loop = () => {
    cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  };
  loop();
  const bindCursorTargets = () => {
    $$('a, button, .tab').forEach((el) => {
      if (el.dataset.cursorBound) return; el.dataset.cursorBound = 1;
      const view = el.dataset.cursor === 'view';
      el.addEventListener('mouseenter', () => {
        cursor.classList.add(view ? 'is-view' : 'is-hover');
        $('.cursor__label', cursor).textContent = view ? 'View' : '';
      });
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-view', 'is-hover'));
    });
  };

  // ---------- preloader ----------
  const finishLoading = () => {
    $('#preloader').classList.add('done');
    document.body.classList.remove('is-loading');
    setTimeout(() => document.body.classList.add('is-ready'), 250);
  };
  const runPreloader = () => {
    if (C.site?.showPreloader === false || isPreview) { $('#preloader').style.display = 'none'; finishLoading(); return; }
    $('#preloaderName').textContent = fullName();
    let n = 0, loaded = document.readyState === 'complete';
    addEventListener('load', () => { loaded = true; });
    const tick = () => {
      n = Math.min(loaded ? n + 4 : Math.min(n + 2, 90), 100);
      $('#preloaderCount').textContent = n;
      $('#preloaderBar').style.width = n + '%';
      if (n < 100) setTimeout(tick, 22); else setTimeout(finishLoading, 200);
    };
    tick();
  };

  // ---------- live preview from admin ----------
  addEventListener('message', (e) => {
    if (e.origin !== location.origin || e.data?.type !== 'preview') return;
    const y = scrollY;
    C = e.data.content; render();
    document.body.classList.add('is-ready');
    $$('[data-reveal], .skill').forEach((el) => el.classList.add('in'));
    scrollTo(0, y);
  });

  const start = async () => {
    if (!Object.keys(C).length) {
      try { C = await (await fetch('/api/content')).json(); } catch { /* keep empty */ }
    }
    render();
    runPreloader();
    if (isPreview) parent.postMessage({ type: 'preview-ready' }, location.origin);
  };
  start();
})();
