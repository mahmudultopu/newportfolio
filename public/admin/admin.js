/* Portfolio admin panel */
(() => {
  // ---------- icons ----------
  const P = {
    home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0',
    star: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z',
    layers: 'M12 3l9 5-9 5-9-5zm-9 9l9 5 9-5M3 16l9 5 9-5',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-11v6m0-9.5v.5',
    grid: 'M4 4h7v7H4zm9 0h7v7h-7zM4 13h7v7H4zm9 0h7v7h-7z',
    steps: 'M4 19h4v-4h4v-4h4V7h4',
    bar: 'M5 20V10m7 10V4m7 16v-7',
    folder: 'M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
    briefcase: 'M4 8h16v11H4zm5-3h6v3H9zM4 13h16',
    award: 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm-4 0l-1 7 5-3 5 3-1-7',
    chart: 'M4 20h16M7 16v-5m5 5V7m5 9v-8',
    quote: 'M7 7h4v4c0 3-2 5-4 6m10-10h4v4c0 3-2 5-4 6',
    mail: 'M3 6h18v12H3zm0 0l9 7 9-7',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm9 3l-4-4',
    image: 'M4 5h16v14H4zm0 11l5-5 4 4 3-3 4 4M15 9.5a1 1 0 1 0 0-.01',
    inbox: 'M3 13l3-8h12l3 8v6H3zm0 0h5l1 3h6l1-3h5',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14.5 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    save: 'M5 3h11l3 3v15H5zm3 0v5h7V3M8 21v-7h8v7',
    plus: 'M12 5v14M5 12h14',
    trash: 'M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3',
    copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
    up: 'M12 19V5m-6 6l6-6 6 6',
    down: 'M12 5v14m6-6l-6 6-6-6',
    chev: 'M6 9l6 6 6-6',
    upload: 'M12 16V4m-5 5l5-5 5 5M4 20h16',
    x: 'M6 6l12 12M18 6L6 18',
    logout: 'M15 4h4v16h-4M10 8l-4 4 4 4m-4-4h11',
    external: 'M14 4h6v6m0-6L10 14M18 14v6H4V6h6',
    drag: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
    monitor: 'M3 5h18v11H3zm6 15h6m-3-4v4',
    phone: 'M8 3h8v18H8zm3 15h2',
    menu: 'M4 7h16M4 12h16M4 17h16',
    reply: 'M10 9V5l-7 7 7 7v-4c5 0 8 1 11 5-1-5-4-10-11-11z',
    check: 'M5 12l5 5 9-10',
    download: 'M12 4v12m-5-5l5 5 5-5M4 20h16',
    link: 'M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1m2 4a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zm-3 9l2 2 4-4',
    history: 'M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5m4-1v5l3 2',
  };
  const svg = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${P[n] || ''}"/></svg>`;
  const ico = (n) => `<i data-icon="${n}">${svg(n)}</i>`;
  const hydrateIcons = (root = document) => root.querySelectorAll('i[data-icon]:empty').forEach((i) => { i.innerHTML = svg(i.dataset.icon); });

  // ---------- tiny DOM helper ----------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach((c) => c != null && c !== false && el.append(c.nodeType ? c : document.createTextNode(c)));
    return el;
  };
  const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtSize = (b) => (b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
  const isVideo = (u = '') => /\.(mp4|webm|mov)(\?|$)/i.test(u);
  const isImage = (u = '') => /\.(png|jpe?g|gif|webp|svg|avif|ico)(\?|$)/i.test(u);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const cssUrl = (u) => `url("${String(u).replace(/[\\"\n\r]/g, '')}")`;

  // ---------- state ----------
  let C = {};            // content being edited
  let savedJSON = '';    // last saved snapshot
  let messages = [];
  let media = [];
  let current = 'dashboard';
  const openItems = new WeakSet();

  const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const setPath = (obj, path, val) => {
    const ks = path.split('.'); let o = obj;
    ks.slice(0, -1).forEach((k, i) => {
      if (o[k] == null) o[k] = /^\d+$/.test(ks[i + 1]) ? [] : {};
      o = o[k];
    });
    o[ks.at(-1)] = val;
  };

  // ---------- api ----------
  const api = async (url, opts = {}) => {
    const json = opts.body && !(opts.body instanceof FormData);
    const r = await fetch(url, {
      ...opts,
      credentials: 'same-origin',
      headers: { 'X-Requested-With': 'fetch', ...(json ? { 'Content-Type': 'application/json' } : {}) },
      body: json ? JSON.stringify(opts.body) : opts.body,
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 && url !== '/api/login') { showLogin(); throw new Error('Session expired — please log in again'); }
    if (r.status === 403 && j.code === 'DEFAULT_PASSWORD') { window.__authDefault = true; setTimeout(() => go('security'), 0); }
    if (!r.ok) { const e = new Error(j.error || `Request failed (${r.status})`); e.data = j; e.status = r.status; throw e; }
    return j;
  };

  const toast = (msg, err = false) => {
    const t = h('div', { class: 'toast' + (err ? ' err' : '') }, msg);
    $('#toasts').append(t);
    setTimeout(() => t.remove(), 3500);
  };

  // ---------- dirty / save ----------
  const isDirty = () => JSON.stringify(C) !== savedJSON;
  const refreshDirty = () => {
    const d = isDirty();
    $('#dirty').hidden = !d;
    $('#saveBtn').disabled = !d;
  };
  let previewTimer;
  const changed = () => {
    refreshDirty();
    clearTimeout(previewTimer);
    previewTimer = setTimeout(pushPreview, 250);
  };
  const save = async () => {
    if (!isDirty()) return;
    const btn = $('#saveBtn'); btn.disabled = true;
    try {
      await api('/api/content', { method: 'PUT', body: C });
      savedJSON = JSON.stringify(C);
      toast('Saved — your website is updated');
      renderSide();
    } catch (e) { toast(e.message, true); }
    refreshDirty();
  };
  $('#saveBtn').addEventListener('click', save);
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); }
    if (e.key === 'Escape') closeDialog();
  });
  addEventListener('beforeunload', (e) => { if (isDirty()) { e.preventDefault(); e.returnValue = ''; } });

  // ---------- preview ----------
  const frame = $('#previewFrame');
  const pushPreview = () => {
    if ($('#preview').hidden || !frame.contentWindow) return;
    frame.contentWindow.postMessage({ type: 'preview', content: C }, location.origin);
  };
  addEventListener('message', (e) => { if (e.origin === location.origin && e.data?.type === 'preview-ready') pushPreview(); });
  const togglePreview = (show = $('#preview').hidden) => {
    $('#preview').hidden = !show;
    $('#workspace').classList.toggle('with-preview', show);
    $('#previewBtn').classList.toggle('on', show);
    if (show && !frame.src) frame.src = '/?preview=1';
    else if (show) pushPreview();
    try { localStorage.setItem('admin-preview', show ? '1' : '0'); } catch { /* ignore */ }
  };
  $('#previewBtn').addEventListener('click', () => togglePreview());
  $('#previewClose').addEventListener('click', () => togglePreview(false));
  $$('.seg button').forEach((b) => b.addEventListener('click', () => {
    $$('.seg button').forEach((x) => x.classList.toggle('on', x === b));
    $('#preview').classList.toggle('mobile', b.dataset.device === 'mobile');
  }));

  // ---------- uploads & media ----------
  const uploadFiles = async (files) => {
    const fd = new FormData();
    [...files].forEach((f) => fd.append('files', f));
    const j = await api('/api/upload', { method: 'POST', body: fd });
    await loadMedia();
    toast(`Uploaded ${j.files.length} file${j.files.length > 1 ? 's' : ''}`);
    return j.files.map((f) => f.url);
  };
  const pickFiles = (accept, multiple = false) => new Promise((res) => {
    const inp = $('#hiddenFile');
    inp.accept = accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : accept === 'pdf' ? 'application/pdf' : 'image/*,video/*,application/pdf';
    inp.multiple = multiple; inp.value = '';
    inp.onchange = () => res(inp.files.length ? [...inp.files] : null);
    inp.click();
  });
  const loadMedia = async () => { media = await api('/api/uploads'); };
  const BUILTIN = ['neural-network', 'nlp-waves', 'seo-growth', 'computer-vision', 'data-clusters', 'search-ranking', 'services']
    .map((n) => ({ url: `/assets/covers/${n}.svg`, name: `${n}.svg`, builtin: true }));

  const matches = (accept, url) => accept === 'image' ? isImage(url) : accept === 'video' ? isVideo(url) : accept === 'pdf' ? /\.pdf$/i.test(url) : true;
  const mediaTile = (m, { onPick, onDelete } = {}) => {
    const prev = h('div', { class: 'media__prev' });
    if (isImage(m.url)) prev.style.backgroundImage = cssUrl(m.url);
    else if (isVideo(m.url)) prev.append(h('video', { src: m.url, muted: true, preload: 'metadata' }));
    else prev.textContent = m.name.split('.').pop().toUpperCase();
    const tile = h(onPick ? 'button' : 'div', { class: 'media__item' + (onPick ? ' pick' : ''), type: onPick ? 'button' : null, onclick: onPick ? () => onPick(m.url) : null },
      prev,
      h('div', { class: 'media__meta' },
        h('div', {}, h('strong', { title: m.name }, m.name), h('small', {}, m.builtin ? 'Built-in' : fmtSize(m.size))),
        !onPick && !m.builtin ? h('button', { class: 'iconbtn', title: 'Copy link', html: ico('link'), onclick: () => { navigator.clipboard?.writeText(location.origin + m.url); toast('Link copied'); } }) : null,
        onDelete && !m.builtin ? h('button', { class: 'iconbtn danger', title: 'Delete', html: ico('trash'), onclick: (e) => { e.stopPropagation(); onDelete(m); } }) : null));
    return tile;
  };
  const dropzone = (accept, onFiles, label = 'Drop files here or click to upload') => {
    const z = h('div', { class: 'drop', tabindex: 0, role: 'button' },
      h('strong', {}, label),
      accept === 'image' ? 'PNG, JPG, WEBP, SVG, GIF' : accept === 'video' ? 'MP4, WEBM, MOV (max 100 MB)' : 'Images, videos and PDF (max 100 MB)');
    const go = async (files) => { if (!files?.length) return; z.classList.add('drag'); try { await onFiles(files); } catch (e) { toast(e.message, true); } z.classList.remove('drag'); };
    z.addEventListener('click', async () => go(await pickFiles(accept, true)));
    z.addEventListener('keydown', async (e) => { if (e.key === 'Enter') go(await pickFiles(accept, true)); });
    z.addEventListener('dragover', (e) => { e.preventDefault(); z.classList.add('drag'); });
    z.addEventListener('dragleave', () => z.classList.remove('drag'));
    z.addEventListener('drop', (e) => { e.preventDefault(); go(e.dataTransfer.files); });
    return z;
  };

  let dlgResolve = null;
  const closeDialog = () => { $('#mediaDlg').hidden = true; dlgResolve?.(null); dlgResolve = null; };
  $$('[data-dlg-close]').forEach((b) => b.addEventListener('click', closeDialog));
  const openMediaPicker = (accept = 'image') => new Promise(async (resolve) => {
    dlgResolve = resolve;
    const body = $('#mediaDlgBody'); body.innerHTML = '<div class="empty">Loading…</div>';
    $('#mediaDlg').hidden = false;
    try { await loadMedia(); } catch (e) { toast(e.message, true); }
    const pick = (url) => { const r = dlgResolve; dlgResolve = null; $('#mediaDlg').hidden = true; r?.(url); };
    const draw = () => {
      body.innerHTML = '';
      body.append(dropzone(accept, async (files) => { const urls = await uploadFiles(files); if (urls.length === 1) pick(urls[0]); else draw(); }));
      const mine = media.filter((m) => matches(accept, m.url));
      body.append(h('div', { class: 'media__group' }, `Your uploads (${mine.length})`));
      body.append(mine.length ? h('div', { class: 'media' }, mine.map((m) => mediaTile(m, { onPick: pick }))) : h('div', { class: 'empty' }, 'No files yet — upload one above.'));
      if (accept === 'image') {
        body.append(h('div', { class: 'media__group' }, 'Built-in artwork'));
        body.append(h('div', { class: 'media' }, BUILTIN.map((m) => mediaTile(m, { onPick: pick }))));
      }
      hydrateIcons(body);
    };
    draw();
  });

  // ---------- field renderers ----------
  const fieldWrap = (f, control, extra) => h('div', { class: 'fld' + (f.full ? ' full' : '') },
    h('div', { class: 'fld__label' }, h('span', {}, f.label), extra || null),
    control,
    f.hint ? h('div', { class: 'fld__hint', html: f.hint }) : null);

  const F = {};
  F.text = (f, path, onChange) => {
    const val = getPath(C, path) ?? '';
    const counter = f.max ? h('span', { class: 'counter' }) : null;
    const updCount = (v) => { if (counter) { counter.textContent = `${v.length}/${f.max}`; counter.classList.toggle('warn', v.length > f.max); } };
    const inp = h(f.type === 'textarea' ? 'textarea' : 'input', {
      type: f.type === 'textarea' ? null : (f.inputType || 'text'), placeholder: f.placeholder || '', rows: f.rows || null,
      oninput: (e) => { setPath(C, path, e.target.value); updCount(e.target.value); onChange?.(); changed(); },
    });
    inp.value = val; updCount(String(val));
    return fieldWrap(f, inp, counter);
  };
  F.textarea = F.text;
  F.url = (f, p, o) => F.text({ ...f, inputType: 'url', placeholder: f.placeholder || 'https://…' }, p, o);
  F.email = (f, p, o) => F.text({ ...f, inputType: 'email' }, p, o);
  F.number = (f, path, onChange) => {
    const inp = h('input', { type: 'number', step: 'any', oninput: (e) => { setPath(C, path, e.target.value === '' ? 0 : Number(e.target.value)); onChange?.(); changed(); } });
    inp.value = getPath(C, path) ?? 0;
    return fieldWrap(f, inp);
  };
  F.range = (f, path, onChange) => {
    const out = h('output', {}, `${getPath(C, path) ?? 0}%`);
    const inp = h('input', { type: 'range', min: 0, max: 100, oninput: (e) => { setPath(C, path, +e.target.value); out.textContent = e.target.value + '%'; onChange?.(); changed(); } });
    inp.value = getPath(C, path) ?? 0;
    return fieldWrap(f, h('div', { class: 'range' }, inp, out));
  };
  F.select = (f, path, onChange) => {
    const sel = h('select', { onchange: (e) => { setPath(C, path, e.target.value); onChange?.(); changed(); } },
      f.options.map(([v, l]) => h('option', { value: v }, l)));
    sel.value = getPath(C, path) ?? f.options[0][0];
    return fieldWrap(f, sel);
  };
  F.toggle = (f, path, onChange) => {
    const cb = h('input', { type: 'checkbox', onchange: (e) => { setPath(C, path, e.target.checked); onChange?.(); changed(); } });
    const v = getPath(C, path);
    cb.checked = v == null ? !!f.default : !!v;
    return h('div', { class: 'fld' + (f.full ? ' full' : '') }, h('label', { class: 'switch' }, cb, h('span', { class: 'switch__ui' }), f.label), f.hint ? h('div', { class: 'fld__hint', html: f.hint }) : null);
  };
  F.color = (f, path, onChange) => {
    const set = (v) => { setPath(C, path, v); pick.value = v; txt.value = v; onChange?.(); changed(); };
    const pick = h('input', { type: 'color', oninput: (e) => set(e.target.value) });
    const txt = h('input', { class: 'inp', style: { maxWidth: '120px' }, oninput: (e) => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) set(e.target.value); } });
    pick.value = txt.value = getPath(C, path) || '#ff5b14';
    const sw = h('div', { class: 'swatches' }, ['#ff5b14', '#ff3d3d', '#ffc21a', '#3ddc84', '#2ec5ff', '#7c5cff', '#ff4fa3', '#f2f0eb']
      .map((c) => h('button', { type: 'button', title: c, style: { background: c }, onclick: () => set(c) })));
    return fieldWrap(f, h('div', { class: 'color' }, pick, txt, sw));
  };
  F.tags = (f, path, onChange) => {
    const box = h('div', { class: 'tags' });
    const draw = () => {
      const arr = getPath(C, path) || [];
      box.innerHTML = '';
      arr.forEach((t, i) => box.append(h('span', { class: 'tag' }, t, h('button', { type: 'button', 'aria-label': 'Remove', onclick: () => { arr.splice(i, 1); setPath(C, path, arr); draw(); onChange?.(); changed(); } }, '×'))));
      const inp = h('input', {
        placeholder: f.placeholder || 'Type and press Enter',
        onkeydown: (e) => {
          if ((e.key === 'Enter' || e.key === ',') && inp.value.trim()) {
            e.preventDefault();
            inp.value.split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => arr.push(s));
            setPath(C, path, arr); draw(); onChange?.(); changed(); $('input', box).focus();
          } else if (e.key === 'Backspace' && !inp.value && arr.length) {
            arr.pop(); setPath(C, path, arr); draw(); onChange?.(); changed(); $('input', box).focus();
          }
        },
        onblur: () => { if (inp.value.trim()) { arr.push(inp.value.trim()); setPath(C, path, arr); draw(); onChange?.(); changed(); } },
      });
      box.append(inp);
    };
    draw();
    return fieldWrap({ ...f, hint: f.hint || 'Press Enter after each item. Backspace removes the last one.' }, box);
  };
  F.image = (f, path, onChange) => {
    const accept = f.accept || 'image';
    const thumb = h('div', { class: 'img__thumb', tabindex: 0, role: 'button', title: 'Choose from library' });
    const url = h('input', { class: 'inp img__url', placeholder: 'or paste a URL', oninput: (e) => set(e.target.value, true) });
    const set = (v, fromInput) => {
      setPath(C, path, v || '');
      if (!fromInput) url.value = v || '';
      drawThumb(); onChange?.(); changed();
    };
    const drawThumb = () => {
      const v = getPath(C, path) || '';
      thumb.innerHTML = ''; thumb.style.backgroundImage = '';
      thumb.classList.toggle('has', !!v);
      if (!v) thumb.textContent = accept === 'video' ? 'No video' : accept === 'pdf' ? 'No file' : 'Click or drop image';
      else if (isVideo(v)) thumb.append(h('video', { src: v, muted: true, preload: 'metadata' }));
      else if (isImage(v) || accept === 'image') thumb.style.backgroundImage = cssUrl(v);
      else thumb.textContent = /youtu|vimeo/.test(v) ? 'Video link' : v.split('.').pop().toUpperCase();
    };
    const upload = async (files) => {
      if (!files?.length) return;
      const busy = h('div', { class: 'uploading' }, 'Uploading…'); thumb.append(busy);
      try { const [u] = await uploadFiles([files[0]]); set(u); } catch (e) { toast(e.message, true); busy.remove(); }
    };
    const library = async () => { const u = await openMediaPicker(accept); if (u) set(u); };
    thumb.addEventListener('click', library);
    thumb.addEventListener('keydown', (e) => { if (e.key === 'Enter') library(); });
    thumb.addEventListener('dragover', (e) => { e.preventDefault(); thumb.classList.add('drag'); });
    thumb.addEventListener('dragleave', () => thumb.classList.remove('drag'));
    thumb.addEventListener('drop', (e) => { e.preventDefault(); thumb.classList.remove('drag'); upload(e.dataTransfer.files); });
    url.value = getPath(C, path) || '';
    drawThumb();
    const side = h('div', { class: 'img__side' },
      h('div', { class: 'img__btns' },
        h('button', { type: 'button', class: 'abtn abtn--ghost abtn--sm', html: `${ico('upload')}Upload`, onclick: async () => upload(await pickFiles(accept)) }),
        h('button', { type: 'button', class: 'abtn abtn--ghost abtn--sm', html: `${ico('image')}Library`, onclick: library }),
        h('button', { type: 'button', class: 'abtn abtn--ghost abtn--sm', html: `${ico('trash')}Remove`, onclick: () => set('') })),
      url);
    return fieldWrap(f, h('div', { class: 'img' }, thumb, side));
  };
  F.images = (f, path, onChange) => {
    const box = h('div', { class: 'imgs' });
    const draw = () => {
      const arr = getPath(C, path) || [];
      box.innerHTML = '';
      arr.forEach((u, i) => {
        const move = (d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; draw(); onChange?.(); changed(); };
        box.append(h('div', { class: 'imgs__item', style: { backgroundImage: cssUrl(u) } },
          h('div', { class: 'tools' },
            h('button', { type: 'button', class: 'iconbtn', title: 'Move left', html: ico('up'), style: { transform: 'rotate(-90deg)' }, onclick: () => move(-1) }),
            h('button', { type: 'button', class: 'iconbtn', title: 'Move right', html: ico('down'), style: { transform: 'rotate(-90deg)' }, onclick: () => move(1) }),
            h('button', { type: 'button', class: 'iconbtn danger', title: 'Remove', html: ico('trash'), onclick: () => { arr.splice(i, 1); setPath(C, path, arr); draw(); onChange?.(); changed(); } }))));
      });
      const add = h('button', { type: 'button', class: 'imgs__add', html: `${ico('plus')}<span>Add image</span>` });
      const push = (urls) => { const a = getPath(C, path) || []; a.push(...urls); setPath(C, path, a); draw(); onChange?.(); changed(); };
      add.addEventListener('click', async () => { const u = await openMediaPicker('image'); if (u) push([u]); });
      add.addEventListener('dragover', (e) => { e.preventDefault(); add.classList.add('drag'); });
      add.addEventListener('dragleave', () => add.classList.remove('drag'));
      add.addEventListener('drop', async (e) => { e.preventDefault(); add.classList.remove('drag'); try { push(await uploadFiles(e.dataTransfer.files)); } catch (err) { toast(err.message, true); } });
      box.append(add);
    };
    draw();
    return fieldWrap(f, box);
  };

  const defaultFor = (sub) => sub.default ?? ({ tags: [], images: [], toggle: false, number: 0, range: 80 }[sub.type] ?? '');
  F.list = (f, path) => {
    const wrap = h('div', { class: 'list' });
    let query = '';
    let dragFrom = null;
    const draw = () => {
      const arr = getPath(C, path) || [];
      wrap.innerHTML = '';
      const addBtn = h('button', { type: 'button', class: 'abtn abtn--primary abtn--sm', html: `${ico('plus')}Add ${esc(f.noun || 'item')}`, onclick: () => {
        const item = Object.fromEntries(f.item.map((s) => [s.key, clone(defaultFor(s))]));
        const a = getPath(C, path) || []; a.push(item); setPath(C, path, a);
        openItems.add(item); query = ''; draw(); changed();
        setTimeout(() => wrap.querySelector('.item:last-of-type input, .item:last-of-type textarea')?.focus(), 30);
      } });
      const search = arr.length > 6 ? h('input', { class: 'inp list__search', placeholder: `Search ${f.noun || 'item'}s…`, oninput: (e) => { query = e.target.value.toLowerCase(); filter(); } }) : null;
      if (search) search.value = query;
      wrap.append(h('div', { class: 'list__tools' }, h('span', { class: 'fld__hint' }, `${arr.length} ${f.noun || 'item'}${arr.length === 1 ? '' : 's'} · drag ⠿ to reorder`), h('div', { class: 'row' }, search, addBtn)));
      if (!arr.length) wrap.append(h('div', { class: 'list__empty' }, `No ${f.noun || 'item'}s yet.`));

      arr.forEach((item, i) => {
        const titleEl = h('strong', {});
        const subEl = h('small', {});
        const thumbEl = f.thumb ? h('span', { class: 'item__thumb' }) : null;
        const updHead = () => {
          titleEl.textContent = item[f.titleKey] || `Untitled ${f.noun || 'item'}`;
          const sub = typeof f.subKey === 'function' ? f.subKey(item) : item[f.subKey];
          subEl.textContent = sub ?? ''; subEl.hidden = !sub && sub !== 0;
          if (thumbEl) { const t = item[f.thumb]; thumbEl.style.backgroundImage = t && isImage(t) ? cssUrl(t) : ''; }
        };
        updHead();
        const card = h('div', { class: 'item' + (openItems.has(item) ? ' open' : ''), 'data-i': i });
        const body = h('div', { class: 'item__body', hidden: !openItems.has(item) });
        const toggle = () => {
          const open = !openItems.has(item);
          open ? openItems.add(item) : openItems.delete(item);
          card.classList.toggle('open', open); body.hidden = !open;
          if (open && !body.childElementCount) fillBody();
        };
        const fillBody = () => {
          body.append(h('div', { class: 'grid' }, f.item.map((sub) => (F[sub.type || 'text'])(sub, `${path}.${i}.${sub.key}`, updHead))));
          hydrateIcons(body);
        };
        if (openItems.has(item)) fillBody();
        const mv = (d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; draw(); changed(); };
        const handle = h('span', { class: 'item__drag', title: 'Drag to reorder', html: svg('drag') });
        handle.addEventListener('mousedown', () => { card.draggable = true; });
        handle.addEventListener('mouseup', () => { card.draggable = false; });
        card.addEventListener('dragstart', (e) => { dragFrom = i; card.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); });
        card.addEventListener('dragend', () => { card.draggable = false; card.classList.remove('dragging'); $$('.drop-before,.drop-after', wrap).forEach((x) => x.classList.remove('drop-before', 'drop-after')); });
        card.addEventListener('dragover', (e) => {
          if (dragFrom == null) return; e.preventDefault();
          const r = card.getBoundingClientRect(); const after = e.clientY > r.top + r.height / 2;
          card.classList.toggle('drop-after', after); card.classList.toggle('drop-before', !after);
        });
        card.addEventListener('dragleave', () => card.classList.remove('drop-before', 'drop-after'));
        card.addEventListener('drop', (e) => {
          e.preventDefault(); if (dragFrom == null) return;
          const r = card.getBoundingClientRect(); let to = i + (e.clientY > r.top + r.height / 2 ? 1 : 0);
          const [moved] = arr.splice(dragFrom, 1); if (dragFrom < to) to--; arr.splice(to, 0, moved);
          dragFrom = null; draw(); changed();
        });
        card.append(
          h('div', { class: 'item__head' },
            handle, thumbEl,
            h('button', { type: 'button', class: 'item__title', onclick: toggle }, titleEl, subEl),
            f.badge ? (() => { const b = f.badge(item); return b ? h('span', { class: 'pill' }, b) : null; })() : null,
            h('button', { type: 'button', class: 'iconbtn', title: 'Move up', html: ico('up'), disabled: i === 0, onclick: () => mv(-1) }),
            h('button', { type: 'button', class: 'iconbtn', title: 'Move down', html: ico('down'), disabled: i === arr.length - 1, onclick: () => mv(1) }),
            h('button', { type: 'button', class: 'iconbtn', title: 'Duplicate', html: ico('copy'), onclick: () => { const c = clone(item); arr.splice(i + 1, 0, c); openItems.add(c); draw(); changed(); } }),
            h('button', { type: 'button', class: 'iconbtn danger', title: 'Delete', html: ico('trash'), onclick: () => {
              if (!confirm(`Delete "${item[f.titleKey] || 'this ' + (f.noun || 'item')}"?`)) return;
              arr.splice(i, 1); draw(); changed();
            } }),
            h('button', { type: 'button', class: 'iconbtn item__chev', title: 'Edit', html: ico('chev'), onclick: toggle })),
          body);
        wrap.append(card);
      });
      filter();
    };
    const filter = () => {
      const arr = getPath(C, path) || [];
      $$('.item', wrap).forEach((card) => {
        const it = arr[+card.dataset.i];
        card.hidden = !!query && !JSON.stringify(it).toLowerCase().includes(query);
      });
    };
    draw();
    return h('div', { class: 'full' }, wrap);
  };

  const renderFields = (fields) => h('div', { class: 'grid' }, fields.map((f) => (F[f.type || 'text'])(f, f.path)));
  const card = (title, desc, content, headExtra) => h('div', { class: 'card' },
    h('div', { class: 'card__head' }, h('div', {}, h('h2', {}, title), desc ? h('p', {}, desc) : null), headExtra || null),
    content);

  // visibility toggle for a public section
  const sectionToggle = (id) => {
    const sec = (C.sections || []).find((s) => s.id === id);
    if (!sec) return null;
    const cb = h('input', { type: 'checkbox', onchange: (e) => { sec.visible = e.target.checked; changed(); renderSide(); } });
    cb.checked = sec.visible !== false;
    return h('label', { class: 'switch' }, cb, h('span', { class: 'switch__ui' }), 'Show on website');
  };

  const RICH = 'Wrap words in <code>*stars*</code> to make them orange and <code>~tildes~</code> to make them grey.';

  // ---------- views ----------
  const VIEWS = [
    { group: 'Overview' },
    { id: 'dashboard', title: 'Dashboard', icon: 'home', desc: 'Overview of your portfolio' },
    { group: 'Content' },
    { id: 'profile', title: 'Profile & Socials', icon: 'user', desc: 'Your name, contact details and social links',
      cards: [
        ['Personal info', 'Shown in the hero, navigation, footer and contact card.', [
          { path: 'profile.firstName', label: 'First name' },
          { path: 'profile.lastName', label: 'Last name' },
          { path: 'profile.nickname', label: 'Nickname', hint: 'Shown under your name in the hero.' },
          { path: 'profile.role', label: 'Role / title' },
          { path: 'profile.email', label: 'Email', type: 'email' },
          { path: 'profile.phone', label: 'Phone', placeholder: '+880…' },
          { path: 'profile.location', label: 'Location' },
          { path: 'profile.availability', label: 'Availability badge', hint: 'Leave empty to hide the green badge.' },
          { path: 'profile.resume', label: 'CV / Resume (PDF)', type: 'image', accept: 'pdf', full: true, hint: 'Adds a “Download CV” button to the contact card.' },
        ]],
        ['Social links', 'Shown in the hero, mobile menu and footer.', [
          { path: 'socials', type: 'list', noun: 'link', titleKey: 'label', subKey: 'url', item: [
            { key: 'label', label: 'Name', placeholder: 'LinkedIn' },
            { key: 'short', label: 'Short label (optional)', placeholder: 'IN', hint: 'Shown inside the round button. Defaults to the name.' },
            { key: 'url', label: 'URL', type: 'url', full: true },
          ] },
        ]],
      ] },
    { id: 'hero', title: 'Hero', icon: 'star', desc: 'The first screen visitors see',
      cards: [
        ['Photo', null, [
          { path: 'hero.photo', label: 'Profile photo', type: 'image', full: true, hint: 'A portrait works best. It is also used in the footer and for social sharing.' },
          { path: 'hero.photoStyle', label: 'Photo style', type: 'select', options: [['duotone', 'Orange duotone (like the reference)'], ['mono', 'Black & white'], ['natural', 'Natural colours']] },
        ]],
        ['Text & button', null, [
          { path: 'hero.intro', label: 'Intro text', type: 'textarea', full: true, rows: 3 },
          { path: 'hero.ctaText', label: 'Button text' },
          { path: 'hero.ctaLink', label: 'Button link', placeholder: '#contact' },
          { path: 'hero.servicesTitle', label: 'Services list title' },
          { path: 'hero.services', label: 'Services list (right side)', type: 'tags', full: true },
        ]],
        ['Scrolling marquee', 'The big moving text band under the hero.', [
          { path: 'marquee', label: 'Words', type: 'tags', full: true },
        ]],
      ] },
    { id: 'layout', title: 'Sections & Order', icon: 'layers', desc: 'Show, hide, rename and reorder sections' },
    { id: 'about', section: 'about', title: 'About', icon: 'info', desc: 'Your personal statement',
      cards: [['About section', null, [
        { path: 'about.label', label: 'Small label' },
        { path: 'about.statement', label: 'Statement', type: 'textarea', full: true, rows: 5, hint: RICH + ' Words light up as visitors scroll.' },
        { path: 'about.images', label: 'Image strip (up to 5)', type: 'images', full: true },
      ]]] },
    { id: 'services', section: 'services', title: 'What I Offer', icon: 'grid', desc: 'Services — hovering each one swaps the image',
      cards: [
        ['Heading', null, [
          { path: 'services.titleLeft', label: 'Left word' },
          { path: 'services.titleRight', label: 'Right words' },
          { path: 'services.buttonText', label: 'Button text' },
          { path: 'services.image', label: 'Fallback image', type: 'image', full: true },
        ]],
        ['Services', null, [
          { path: 'services.items', type: 'list', noun: 'service', titleKey: 'title', subKey: 'description', thumb: 'image', item: [
            { key: 'title', label: 'Title' },
            { key: 'image', label: 'Image', type: 'image' },
            { key: 'description', label: 'Description', type: 'textarea', full: true, rows: 3 },
          ] },
        ]],
      ] },
    { id: 'process', section: 'process', title: 'How I Work', icon: 'steps', desc: 'Your work process steps',
      cards: [
        ['Heading', null, [
          { path: 'process.title', label: 'Title' },
          { path: 'process.intro', label: 'Intro', type: 'textarea', rows: 2 },
        ]],
        ['Steps', 'Four steps look best.', [
          { path: 'process.steps', type: 'list', noun: 'step', titleKey: 'title', subKey: 'description', item: [
            { key: 'title', label: 'Title', full: true },
            { key: 'description', label: 'Description', type: 'textarea', full: true, rows: 3 },
          ] },
        ]],
      ] },
    { id: 'skills', section: 'skills', title: 'Skills', icon: 'bar', desc: 'Skills with levels, grouped into tabs by category',
      cards: [
        ['Heading', null, [
          { path: 'skills.title', label: 'Title' },
          { path: 'skills.intro', label: 'Intro' },
        ]],
        ['Skills', 'Use the same category name to group skills into a tab.', [
          { path: 'skills.items', type: 'list', noun: 'skill', titleKey: 'name', subKey: (s) => `${s.category || 'No category'} · ${s.level ?? 0}%`, item: [
            { key: 'name', label: 'Skill name' },
            { key: 'category', label: 'Category', placeholder: 'AI / ML' },
            { key: 'level', label: 'Level', type: 'range', full: true, default: 80 },
          ] },
        ]],
      ] },
    { id: 'projects', section: 'projects', title: 'Projects & Demos', icon: 'folder', desc: 'Your work — images, demo videos and links',
      cards: [
        ['Heading', null, [
          { path: 'projects.title', label: 'Title' },
          { path: 'projects.intro', label: 'Intro' },
        ]],
        ['Projects', 'Click a project to edit. “Featured” projects show full width.', [
          { path: 'projects.items', type: 'list', noun: 'project', titleKey: 'title', subKey: (p) => [p.category, p.year].filter(Boolean).join(' · '), thumb: 'image',
            badge: (p) => (p.featured ? 'Featured' : p.videoUrl ? 'Video' : ''), item: [
              { key: 'title', label: 'Title' },
              { key: 'category', label: 'Category', placeholder: 'NLP', hint: 'Used for the filter tabs.' },
              { key: 'year', label: 'Year' },
              { key: 'featured', label: 'Featured (full width)', type: 'toggle' },
              { key: 'description', label: 'Description', type: 'textarea', full: true, rows: 4 },
              { key: 'image', label: 'Cover image', type: 'image', full: true },
              { key: 'videoUrl', label: 'Demo video', type: 'image', accept: 'video', full: true, hint: 'Upload an MP4, or paste a YouTube / Vimeo link — it plays in the project popup.' },
              { key: 'liveUrl', label: 'Live demo URL', type: 'url' },
              { key: 'codeUrl', label: 'Source code URL', type: 'url', placeholder: 'https://github.com/…' },
              { key: 'tags', label: 'Tags / tech', type: 'tags', full: true },
              { key: 'gallery', label: 'Extra screenshots', type: 'images', full: true },
            ] },
        ]],
      ] },
    { id: 'experience', section: 'experience', title: 'Experience & Education', icon: 'briefcase', desc: 'Your timeline',
      cards: [
        ['Heading', null, [
          { path: 'experience.label', label: 'Badge' },
          { path: 'experience.buttonText', label: 'Button text' },
          { path: 'experience.title', label: 'Title (line 1)' },
          { path: 'experience.titleAccent', label: 'Title (orange line 2)' },
        ]],
        ['Timeline', 'Newest first works best.', [
          { path: 'experience.items', type: 'list', noun: 'entry', titleKey: 'role', subKey: (e) => [e.company, e.period].filter(Boolean).join(' · '), item: [
            { key: 'role', label: 'Role / degree' },
            { key: 'company', label: 'Company / school' },
            { key: 'period', label: 'Period', placeholder: '2024 — Present' },
            { key: 'description', label: 'Description', type: 'textarea', full: true, rows: 3 },
          ] },
        ]],
      ] },
    { id: 'certifications', section: 'certifications', title: 'Certifications', icon: 'award', desc: 'Certificates, awards and courses',
      cards: [
        ['Heading', null, [
          { path: 'certifications.titleTop', label: 'Title (white)' },
          { path: 'certifications.titleBottom', label: 'Title (grey)' },
          { path: 'certifications.buttonText', label: 'Button text' },
          { path: 'certifications.buttonLink', label: 'Button link', type: 'url', hint: 'e.g. your LinkedIn certifications page. Empty hides the button.' },
        ]],
        ['Certifications', null, [
          { path: 'certifications.items', type: 'list', noun: 'certificate', titleKey: 'title', subKey: (c) => [c.organization, c.date].filter(Boolean).join(' · '), item: [
            { key: 'title', label: 'Title', full: true },
            { key: 'organization', label: 'Organization' },
            { key: 'date', label: 'Date' },
            { key: 'link', label: 'Credential link (optional)', type: 'url', full: true },
          ] },
        ]],
      ] },
    { id: 'stats', section: 'stats', title: 'Highlights', icon: 'chart', desc: 'Statement and animated numbers',
      cards: [
        ['Statement', null, [
          { path: 'stats.label', label: 'Small label' },
          { path: 'stats.note', label: 'Note under statement' },
          { path: 'stats.statement', label: 'Statement', type: 'textarea', full: true, rows: 3, hint: RICH },
        ]],
        ['Numbers', 'They count up when scrolled into view.', [
          { path: 'stats.items', type: 'list', noun: 'number', titleKey: 'label', subKey: (s) => `${s.value ?? 0}${s.suffix || ''}`, item: [
            { key: 'value', label: 'Number', type: 'number' },
            { key: 'suffix', label: 'Suffix', placeholder: '+ or %' },
            { key: 'label', label: 'Label', full: true },
            { key: 'description', label: 'Small description', type: 'textarea', full: true, rows: 2 },
          ] },
        ]],
      ] },
    { id: 'testimonials', section: 'testimonials', title: 'Testimonials', icon: 'quote', desc: 'What clients and colleagues say',
      cards: [
        ['Heading', null, [{ path: 'testimonials.title', label: 'Title' }]],
        ['Testimonials', null, [
          { path: 'testimonials.items', type: 'list', noun: 'testimonial', titleKey: 'name', subKey: 'role', thumb: 'photo', item: [
            { key: 'name', label: 'Name' },
            { key: 'role', label: 'Role & company' },
            { key: 'quote', label: 'Quote', type: 'textarea', full: true, rows: 4 },
            { key: 'photo', label: 'Photo', type: 'image', full: true },
          ] },
        ]],
      ] },
    { id: 'contact', section: 'contact', title: 'Contact & Footer', icon: 'mail', desc: 'Call-to-action card, form and footer',
      cards: [
        ['Contact card', null, [
          { path: 'contact.badge', label: 'Badge' },
          { path: 'contact.buttonText', label: 'Form button text' },
          { path: 'contact.title', label: 'Title', full: true },
          { path: 'contact.text', label: 'Text', type: 'textarea', full: true, rows: 3 },
        ]],
        ['Footer', null, [{ path: 'footer.text', label: 'Copyright text', full: true }]],
      ] },
    { group: 'Site' },
    { id: 'seo', title: 'SEO & Appearance', icon: 'search', desc: 'Search engine settings, colours and effects' },
    { id: 'media', title: 'Media Library', icon: 'image', desc: 'All your uploaded images, videos and files' },
    { id: 'messages', title: 'Messages', icon: 'inbox', desc: 'Messages sent through your contact form' },
    { id: 'security', title: 'Security', icon: 'shield', desc: 'Password, two-factor login, sessions and activity' },
    { id: 'settings', title: 'Backups & History', icon: 'history', desc: 'Version history, backups and restore' },
  ];

  // ---------- sidebar ----------
  const renderSide = () => {
    const nav = $('#sideNav'); nav.innerHTML = '';
    const unread = messages.filter((m) => !m.read).length;
    VIEWS.forEach((v) => {
      if (v.group) { nav.append(h('div', { class: 'side__group' }, v.group)); return; }
      const sec = v.section && (C.sections || []).find((s) => s.id === v.section);
      nav.append(h('button', { class: 'side__link' + (v.id === current ? ' on' : ''), onclick: () => go(v.id), html: ico(v.icon) + esc(v.title) },
        v.id === 'messages' && unread ? h('span', { class: 'count' }, unread) : null,
        sec && sec.visible === false ? h('span', { class: 'off' }, 'Hidden') : null));
    });
    const p = C.profile || {};
    $('#sideName').textContent = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Portfolio';
    $('#sideLogo').innerHTML = C.hero?.photo ? `<img src="${esc(C.hero.photo)}" alt="">` : esc(((p.firstName || 'M')[0] + (p.lastName || 'H')[0]).toUpperCase());
  };

  const go = (id) => {
    if (!VIEWS.some((v) => v.id === id)) id = 'dashboard';
    current = id;
    if (location.hash !== '#/' + id) history.replaceState(null, '', '#/' + id);
    $('#side').classList.remove('open');
    renderView();
    renderSide();
    scrollTo(0, 0);
  };
  addEventListener('hashchange', () => go(location.hash.slice(2)));
  $('#menuBtn').addEventListener('click', () => $('#side').classList.toggle('open'));
  $('#sideBackdrop').addEventListener('click', () => $('#side').classList.remove('open'));

  const renderView = () => {
    const v = VIEWS.find((x) => x.id === current);
    $('#pageTitle').textContent = v.title;
    $('#pageDesc').textContent = v.desc || '';
    const view = $('#view'); view.innerHTML = '';
    const custom = { dashboard: viewDashboard, layout: viewLayout, seo: viewSeo, media: viewMedia, messages: viewMessages, settings: viewSettings, security: viewSecurity }[v.id];
    if (custom) custom(view);
    else {
      if (v.section) view.append(h('div', { class: 'card', style: { padding: '14px 22px' } }, h('div', { class: 'row', style: { justifyContent: 'space-between' } },
        h('span', { class: 'fld__hint' }, 'Turn this section on or off on your website.'), sectionToggle(v.section))));
      v.cards.forEach(([title, desc, fields]) => view.append(card(title, desc, renderFields(fields))));
    }
    hydrateIcons(view);
  };

  // dashboard
  const viewDashboard = (view) => {
    const p = C.profile || {};
    const unread = messages.filter((m) => !m.read).length;
    view.append(h('div', { class: 'hello' },
      C.hero?.photo ? h('img', { src: C.hero.photo, alt: '' }) : null,
      h('div', {}, h('h2', {}, `Hi ${p.nickname || p.firstName || 'there'} 👋`), h('p', {}, 'Edit anything on the left, then press Save (or Ctrl + S). Turn on Preview to see changes live.'))));
    if (window.__authDefault) view.append(h('div', { class: 'alert' }, h('p', {}, 'You are still using the default password. Please change it now.'), h('button', { class: 'abtn abtn--primary abtn--sm', onclick: () => go('security') }, 'Change password')));
    const stat = (n, label, to) => h('button', { class: 'stat', onclick: () => go(to) }, h('b', {}, n), h('span', {}, label));
    view.append(h('div', { class: 'stats' },
      stat(unread, unread === 1 ? 'Unread message' : 'Unread messages', 'messages'),
      stat(C.projects?.items?.length || 0, 'Projects', 'projects'),
      stat(C.skills?.items?.length || 0, 'Skills', 'skills'),
      stat(media.length, 'Uploaded files', 'media')));
    const q = (icon, label, to) => h('button', { onclick: () => go(to), html: ico(icon) + esc(label) });
    view.append(card('Quick actions', null, h('div', { class: 'quick' },
      q('folder', 'Add a project / demo', 'projects'), q('bar', 'Edit skills', 'skills'), q('star', 'Change hero photo', 'hero'),
      q('briefcase', 'Update experience', 'experience'), q('award', 'Add certificate', 'certifications'), q('layers', 'Reorder sections', 'layout'),
      q('search', 'SEO settings', 'seo'), q('image', 'Upload media', 'media'))));
    view.append(card('Tips', null, h('ul', { class: 'tips', html: `
      <li>In statements, wrap words in <code>*stars*</code> for orange and <code>~tildes~</code> for grey.</li>
      <li>Drag the <code>⠿</code> handle to reorder any list — projects, skills, steps, links.</li>
      <li>Drop an image file straight onto any image box to upload it.</li>
      <li>Demo videos: upload an MP4 or paste a YouTube / Vimeo link in a project.</li>
      <li>Hide a section without deleting it from <b>Sections & Order</b>.</li>
      <li>Download a backup from <b>Settings</b> before big changes.</li>` })));
  };

  // sections manager
  const viewLayout = (view) => {
    const list = h('div', { class: 'list' });
    const names = Object.fromEntries(VIEWS.filter((v) => v.section).map((v) => [v.section, v]));
    const draw = () => {
      list.innerHTML = '';
      list.append(h('div', { class: 'secrow', style: { opacity: .7 } }, h('span', { class: 'pill pill--muted' }, 'Fixed'), h('strong', {}, 'Hero'), h('span', { class: 'secrow__id' }, 'Always first')));
      C.sections.forEach((s, i) => {
        const mv = (d) => { const j = i + d; if (j < 0 || j >= C.sections.length) return; [C.sections[i], C.sections[j]] = [C.sections[j], C.sections[i]]; draw(); changed(); };
        const vis = h('input', { type: 'checkbox', onchange: (e) => { s.visible = e.target.checked; row.classList.toggle('hidden-sec', !s.visible); changed(); renderSide(); } }); vis.checked = s.visible !== false;
        const nav = h('input', { type: 'checkbox', onchange: (e) => { s.inNav = e.target.checked; changed(); } }); nav.checked = s.inNav !== false;
        const navable = ['about', 'services', 'skills', 'projects', 'experience', 'contact'].includes(s.id);
        const label = h('input', { class: 'inp', title: 'Menu label', oninput: (e) => { s.label = e.target.value; changed(); } }); label.value = s.label || '';
        const row = h('div', { class: 'secrow' + (s.visible === false ? ' hidden-sec' : '') },
          h('div', { class: 'row', style: { flexDirection: 'column', gap: '0' } },
            h('button', { class: 'iconbtn', title: 'Move up', html: ico('up'), disabled: i === 0, onclick: () => mv(-1) }),
            h('button', { class: 'iconbtn', title: 'Move down', html: ico('down'), disabled: i === C.sections.length - 1, onclick: () => mv(1) })),
          label,
          h('span', { class: 'secrow__id' }, names[s.id] ? h('a', { href: '#/' + names[s.id].id, style: { textDecoration: 'underline' } }, 'Edit content') : s.id),
          navable ? h('label', { class: 'switch', title: 'Show in the top menu' }, nav, h('span', { class: 'switch__ui' }), 'In menu') : null,
          h('label', { class: 'switch' }, vis, h('span', { class: 'switch__ui' }), 'Visible'));
        list.append(row);
      });
      hydrateIcons(list);
    };
    draw();
    view.append(card('Page sections', 'Use the arrows to change order. The label is what appears in the menu.', list));
  };

  // SEO
  const viewSeo = (view) => {
    const snippet = h('div', { style: { background: '#fff', color: '#202124', borderRadius: '12px', padding: '18px', fontFamily: 'Arial, sans-serif' } });
    const drawSnippet = () => {
      const t = C.site?.title || ''; const d = C.site?.metaDescription || '';
      snippet.innerHTML = `<div style="font-size:12px;color:#4d5156">${esc(location.host)}</div>
        <div style="font-size:20px;color:#1a0dab;margin:4px 0;line-height:1.3">${esc(t.length > 60 ? t.slice(0, 60) + '…' : t)}</div>
        <div style="font-size:14px;color:#4d5156;line-height:1.5">${esc(d.length > 160 ? d.slice(0, 160) + '…' : d)}</div>`;
    };
    drawSnippet();
    const seoFields = [
      { path: 'site.title', label: 'Page title', max: 60, full: true, hint: 'Aim for 50–60 characters. Include your name and main keyword.' },
      { path: 'site.metaDescription', label: 'Meta description', type: 'textarea', max: 160, full: true, rows: 3, hint: 'Aim for 140–160 characters.' },
      { path: 'site.keywords', label: 'Keywords', full: true, hint: 'Comma-separated.' },
    ];
    view.append(card('Search engines', 'Rendered into the page on the server, plus Person structured data (JSON-LD) built from your profile and skills.',
      h('div', { class: 'grid' }, seoFields.map((f) => (F[f.type || 'text'])(f, f.path, drawSnippet)))));
    view.append(card('Google preview', 'Approximately how your site appears in search results.', snippet));
    view.append(card('Appearance', null, renderFields([
      { path: 'site.accent', label: 'Accent colour', type: 'color', full: true },
      { path: 'site.favicon', label: 'Favicon (browser tab icon)', type: 'image', full: true, hint: 'Square image, 64×64 or larger. Empty uses the default “MH” icon.' },
      { path: 'site.showPreloader', label: 'Show loading screen', type: 'toggle' },
      { path: 'site.showCursor', label: 'Custom animated cursor', type: 'toggle' },
    ])));
  };

  // media
  const viewMedia = async (view) => {
    const grid = h('div', {});
    const draw = () => {
      grid.innerHTML = '';
      grid.append(h('div', { class: 'media__group' }, `${media.length} file${media.length === 1 ? '' : 's'}`));
      if (!media.length) { grid.append(h('div', { class: 'empty' }, 'Nothing uploaded yet.')); return; }
      grid.append(h('div', { class: 'media' }, media.map((m) => mediaTile(m, {
        onDelete: async (file) => {
          const used = JSON.stringify(C).includes(file.url);
          if (!confirm(used ? `"${file.name}" is used on your website. Delete anyway?` : `Delete "${file.name}"?`)) return;
          try { await api('/api/uploads/' + encodeURIComponent(file.name), { method: 'DELETE' }); await loadMedia(); draw(); toast('File deleted'); } catch (e) { toast(e.message, true); }
        },
      }))));
      hydrateIcons(grid);
    };
    view.append(card('Upload', 'Images, videos and PDFs. Up to 100 MB each.', dropzone('any', async (files) => { await uploadFiles(files); draw(); })));
    view.append(card('Library', null, grid));
    try { await loadMedia(); } catch (e) { toast(e.message, true); }
    draw();
  };

  // messages
  const viewMessages = async (view) => {
    const box = h('div', {});
    view.append(box);
    const draw = () => {
      box.innerHTML = '';
      if (!messages.length) { box.append(h('div', { class: 'card empty' }, 'No messages yet. They appear here when someone uses your contact form.')); return; }
      messages.forEach((m) => {
        const body = h('div', { class: 'msg__body', hidden: true },
          h('p', {}, m.message),
          h('div', { class: 'msg__actions' },
            h('a', { class: 'abtn abtn--primary abtn--sm', href: `mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Your message'))}`, html: ico('reply') + 'Reply by email' }),
            h('button', { class: 'abtn abtn--ghost abtn--sm', onclick: () => setRead(m, !m.read) }, m.read ? 'Mark as unread' : 'Mark as read'),
            h('button', { class: 'abtn abtn--danger abtn--sm', html: ico('trash') + 'Delete', onclick: async () => {
              if (!confirm('Delete this message?')) return;
              try { await api('/api/messages/' + m.id, { method: 'DELETE' }); messages = messages.filter((x) => x !== m); draw(); renderSide(); } catch (e) { toast(e.message, true); }
            } })));
        const el = h('div', { class: 'msg' + (m.read ? ' read' : '') },
          h('button', { class: 'msg__head', onclick: () => { body.hidden = !body.hidden; if (!body.hidden && !m.read) setRead(m, true, el); } },
            h('span', { class: 'msg__dot' }),
            h('span', { class: 'msg__who' }, h('strong', {}, `${m.name} · ${m.email}`), h('small', {}, m.subject || m.message.slice(0, 90))),
            h('span', { class: 'msg__date' }, new Date(m.date).toLocaleString())),
          body);
        box.append(el);
      });
      hydrateIcons(box);
    };
    const setRead = async (m, read, el) => {
      try { await api('/api/messages/' + m.id, { method: 'PATCH', body: { read } }); m.read = read; renderSide(); if (el) el.classList.toggle('read', read); else draw(); } catch (e) { toast(e.message, true); }
    };
    try { messages = await api('/api/messages'); renderSide(); } catch (e) { toast(e.message, true); }
    draw();
  };

  // security
  const EVENT = {
    login_success: ['Signed in', 'ok'], login_failed: ['Failed sign-in', 'bad'], login_locked: ['IP locked out', 'bad'],
    password_changed: ['Password changed', 'ok'], password_change_failed: ['Password change failed', 'bad'],
    '2fa_enabled': ['Two-factor enabled', 'ok'], '2fa_disabled': ['Two-factor disabled', 'warn'],
    backup_code_used: ['Backup code used', 'warn'], sessions_revoked: ['Other sessions signed out', 'ok'],
    upload_rejected: ['Unsafe upload blocked', 'bad'], version_restored: ['Version restored', 'warn'],
  };
  const device = (ua = '') => {
    const b = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
    const o = /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Windows/.test(ua) ? 'Windows' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
    return o ? `${b} on ${o}` : b;
  };
  const ago = (t) => {
    const s = Math.round((Date.now() - new Date(t)) / 1000);
    return s < 60 ? 'just now' : s < 3600 ? `${Math.floor(s / 60)} min ago` : s < 86400 ? `${Math.floor(s / 3600)} h ago` : new Date(t).toLocaleDateString();
  };
  const strength = (pw) => {
    const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
    let score = 0;
    if (pw.length >= 10) score++;
    if (pw.length >= 14) score++;
    if (kinds >= 3) score++;
    if (kinds === 4) score++;
    if (/mahmudul|hasan|topu|password|admin|1234|qwer/i.test(pw)) score = Math.min(score, 1);
    const tip = pw.length < 10 ? 'At least 10 characters' : kinds < 3 ? 'Mix lowercase, uppercase, numbers and symbols' : /mahmudul|hasan|topu/i.test(pw) ? 'Do not use your name' : score >= 4 ? 'Strong password' : 'Good — longer is even better';
    return { score, tip };
  };
  const viewSecurity = async (view) => {
    let sec;
    try { sec = await api('/api/security'); } catch (e) { toast(e.message, true); return; }
    window.__authDefault = sec.isDefault;
    const https = location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname);
    const checks = [
      [!sec.isDefault, 'Default password replaced', 'Change it below — editing is locked until you do.'],
      [sec.twoFactor, 'Two-factor login on', 'Even if someone learns your password, they cannot sign in without your phone.'],
      [https, 'Secure connection (HTTPS)', 'When you publish the site, use a host with HTTPS.'],
      [sec.sessions.length <= 2, 'Few active sessions', 'Sign out devices you do not recognise.'],
    ];
    const done = checks.filter((c) => c[0]).length;
    view.append(card(`Security score: ${done}/${checks.length}`, done === checks.length ? 'Excellent — your admin panel is well protected.' : 'Finish the items below to fully protect your site.',
      h('div', { class: 'checks' }, checks.map(([ok, title, tip]) => h('div', { class: 'check' + (ok ? ' ok' : '') },
        h('span', { class: 'check__dot', html: ok ? svg('check') : '!' }),
        h('div', {}, h('strong', {}, title), ok ? null : h('div', { class: 'fld__hint' }, tip)))))));

    // password
    const pwField = (id, label, ac) => h('label', { class: 'fld' }, h('span', {}, label),
      h('div', { class: 'pw' }, h('input', { type: 'password', id, autocomplete: ac, required: true, maxlength: 200 }), h('button', { type: 'button', class: 'pw__toggle', 'data-toggle-pw': id }, 'Show')));
    const meter = h('div', { class: 'meter' }, h('span', {}));
    const meterTip = h('div', { class: 'fld__hint' }, 'At least 10 characters, mixing letters, numbers and symbols.');
    const form = h('form', { class: 'grid', onsubmit: async (e) => {
      e.preventDefault();
      const cur = $('#pwCur').value, nx = $('#pwNew').value, cf = $('#pwConf').value;
      if (nx !== cf) return toast('New passwords do not match', true);
      try {
        await api('/api/password', { method: 'POST', body: { current: cur, next: nx } });
        window.__authDefault = false; toast('Password changed — other devices were signed out'); renderView();
      } catch (err) { toast(err.message, true); }
    } },
      h('div', { class: 'full' }, pwField('pwCur', 'Current password', 'current-password')),
      pwField('pwNew', 'New password', 'new-password'),
      pwField('pwConf', 'Confirm new password', 'new-password'),
      h('div', { class: 'full' }, meter, meterTip),
      h('div', { class: 'full' }, h('button', { class: 'abtn abtn--primary', type: 'submit' }, 'Change password')));
    view.append(card('Password', sec.isDefault ? 'You are using the default password. Change it now — editing is locked until you do.' : 'Changing it signs out every other device.', form));
    $('#pwNew', form).addEventListener('input', (e) => {
      const { score, tip } = strength(e.target.value);
      meter.dataset.score = e.target.value ? score : '';
      meterTip.textContent = e.target.value ? tip : 'At least 10 characters, mixing letters, numbers and symbols.';
    });

    // two-factor
    const tfa = h('div', {});
    const drawTfa = () => {
      tfa.innerHTML = '';
      if (sec.twoFactor) {
        const pw = h('input', { type: 'password', class: 'inp', placeholder: 'Your password', autocomplete: 'current-password', style: { maxWidth: '260px' } });
        tfa.append(
          h('div', { class: 'check ok', style: { marginBottom: '14px' } }, h('span', { class: 'check__dot', html: svg('check') }),
            h('div', {}, h('strong', {}, 'Two-factor login is ON'), h('div', { class: 'fld__hint' }, `${sec.backupCodesLeft} backup code${sec.backupCodesLeft === 1 ? '' : 's'} left. Keep them somewhere safe.`))),
          h('div', { class: 'row' }, pw, h('button', { class: 'abtn abtn--danger', onclick: async () => {
            if (!confirm('Turn off two-factor login? Your account will be protected by the password only.')) return;
            try { await api('/api/2fa/disable', { method: 'POST', body: { password: pw.value } }); sec.twoFactor = false; toast('Two-factor login turned off'); renderView(); } catch (e) { toast(e.message, true); }
          } }, 'Turn off')));
        return;
      }
      tfa.append(h('p', { class: 'fld__hint', style: { margin: '0 0 14px', fontSize: '13px' } },
        'Use an app like Google Authenticator, Microsoft Authenticator or Authy. After this, signing in needs your password and a 6-digit code from your phone.'),
      h('button', { class: 'abtn abtn--primary', html: ico('shield') + 'Set up two-factor login', onclick: async () => {
        let setup;
        try { setup = await api('/api/2fa/setup', { method: 'POST' }); } catch (e) { return toast(e.message, true); }
        const code = h('input', { class: 'inp', inputmode: 'numeric', maxlength: 6, placeholder: '123456', autocomplete: 'one-time-code', style: { maxWidth: '160px', fontSize: '20px', letterSpacing: '.2em' } });
        const verify = async () => {
          try {
            const r = await api('/api/2fa/enable', { method: 'POST', body: { code: code.value } });
            sec.twoFactor = true; sec.backupCodesLeft = r.backupCodes.length;
            showBackupCodes(r.backupCodes);
          } catch (e) { toast(e.message, true); }
        };
        code.addEventListener('keydown', (e) => { if (e.key === 'Enter') verify(); });
        tfa.innerHTML = '';
        tfa.append(h('div', { class: 'tfa' },
          h('img', { class: 'tfa__qr', src: setup.qr, alt: 'QR code for your authenticator app', width: 220, height: 220 }),
          h('div', { class: 'tfa__steps' },
            h('ol', {},
              h('li', {}, 'Open your authenticator app and tap ', h('b', {}, 'Add / Scan QR code'), '.'),
              h('li', {}, 'Scan this QR code. Can’t scan? Enter this key manually:', h('code', { class: 'tfa__key' }, setup.secret.match(/.{1,4}/g).join(' '))),
              h('li', {}, 'Type the 6-digit code the app shows:')),
            h('div', { class: 'row' }, code, h('button', { class: 'abtn abtn--primary', onclick: verify }, 'Verify & turn on')))));
        code.focus();
      } }));
    };
    const showBackupCodes = (codes) => {
      tfa.innerHTML = '';
      const text = `Topu Portfolio — admin backup codes\nEach code works once.\n\n${codes.join('\n')}\n`;
      tfa.append(
        h('div', { class: 'alert' }, h('p', {}, 'Two-factor login is ON. Save these backup codes now — they are shown only once. Each one lets you sign in if you lose your phone.')),
        h('div', { class: 'codes' }, codes.map((c) => h('code', {}, c))),
        h('div', { class: 'row', style: { marginTop: '14px' } },
          h('button', { class: 'abtn abtn--ghost', html: ico('download') + 'Download codes', onclick: () => {
            const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/plain' })), download: 'portfolio-backup-codes.txt' }); a.click(); URL.revokeObjectURL(a.href);
          } }),
          h('button', { class: 'abtn abtn--ghost', html: ico('copy') + 'Copy', onclick: () => { navigator.clipboard?.writeText(text); toast('Copied'); } }),
          h('button', { class: 'abtn abtn--primary', onclick: () => renderView() }, 'I have saved them')));
      hydrateIcons(tfa);
    };
    drawTfa();
    view.append(card('Two-factor login', 'A second lock on your admin panel.', tfa));

    // sessions
    view.append(card('Active sessions', 'Devices currently signed in. Sessions end after 2 hours of inactivity.', h('div', { class: 'list' },
      sec.sessions.sort((a, b) => b.current - a.current).map((x) => h('div', { class: 'secrow' },
        h('span', { html: ico(/Android|iPhone|iPad/.test(x.ua) ? 'phone' : 'monitor') }),
        h('div', { style: { flex: 1, minWidth: 0 } }, h('strong', {}, device(x.ua)), h('div', { class: 'fld__hint' }, `${x.ip} · active ${ago(x.seen)} · signed in ${ago(x.created)}`)),
        x.current ? h('span', { class: 'pill' }, 'This device') : null)),
      sec.sessions.length > 1 ? h('div', {}, h('button', { class: 'abtn abtn--danger abtn--sm', onclick: async () => {
        try { const r = await api('/api/sessions/revoke-others', { method: 'POST' }); toast(`Signed out ${r.revoked} other session(s)`); renderView(); } catch (e) { toast(e.message, true); }
      } }, 'Sign out all other devices')) : null)));

    // activity log
    const rows = sec.log.slice(0, 50);
    view.append(card('Security activity', 'Sign-ins, failed attempts and other important events (latest 50).', rows.length
      ? h('div', { class: 'logtable' }, rows.map((ev) => {
        const [label, tone] = EVENT[ev.type] || [ev.type, ''];
        return h('div', { class: 'logrow ' + tone },
          h('span', { class: 'logrow__dot' }),
          h('div', { class: 'logrow__main' }, h('strong', {}, label), ev.detail ? h('span', { class: 'fld__hint' }, ev.detail) : null),
          h('span', { class: 'fld__hint' }, `${ev.ip} · ${device(ev.ua)}`),
          h('span', { class: 'fld__hint', title: new Date(ev.date).toLocaleString() }, ago(ev.date)));
      }))
      : h('div', { class: 'list__empty' }, 'No activity yet.')));
    hydrateIcons(view);
  };

  // settings
  const viewSettings = (view) => {
    const hist = h('div', { class: 'list' });
    const drawHistory = async () => {
      hist.innerHTML = '<div class="fld__hint">Loading…</div>';
      try {
        const versions = await api('/api/history');
        hist.innerHTML = '';
        if (!versions.length) { hist.append(h('div', { class: 'list__empty' }, 'No versions yet — one is kept automatically every time you save.')); return; }
        versions.forEach((v, i) => hist.append(h('div', { class: 'secrow' },
          h('span', { html: ico('history') }),
          h('div', { style: { flex: 1, minWidth: 0 } },
            h('strong', {}, new Date(v.date).toLocaleString()),
            h('div', { class: 'fld__hint' }, `${v.reason === 'before-restore' ? 'Before a restore' : 'Saved version'}${i === 0 ? ' · most recent' : ''} · ${fmtSize(v.size)}`)),
          h('button', { class: 'abtn abtn--ghost abtn--sm', onclick: async () => {
            if (!confirm(`Restore the website to how it was on ${new Date(v.date).toLocaleString()}? Your current version is kept in history too.`)) return;
            try {
              const r = await api(`/api/history/${encodeURIComponent(v.id)}/restore`, { method: 'POST' });
              C = r.content; savedJSON = JSON.stringify(C); refreshDirty(); renderSide(); pushPreview();
              toast('Version restored — the website is updated'); drawHistory();
            } catch (e) { toast(e.message, true); }
          } }, 'Restore'))));
        hydrateIcons(hist);
      } catch (e) { hist.innerHTML = ''; toast(e.message, true); }
    };
    view.append(card('Version history', 'Every save keeps a copy (last 20). If something goes wrong — or someone changes your site — restore it in one click.', hist));
    drawHistory();

    view.append(card('Backup', 'Download all your content as a file, or restore from one. Uploaded files stay in the uploads folder.', h('div', { class: 'row' },
      h('button', { class: 'abtn abtn--ghost', html: ico('download') + 'Download backup', onclick: () => {
        const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(C, null, 2)], { type: 'application/json' })), download: `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json` });
        a.click(); URL.revokeObjectURL(a.href);
      } }),
      h('button', { class: 'abtn abtn--ghost', html: ico('upload') + 'Restore from file', onclick: () => {
        const inp = h('input', { type: 'file', accept: 'application/json,.json' });
        inp.onchange = async () => {
          try {
            const data = JSON.parse(await inp.files[0].text());
            if (!data.profile || !data.sections) throw new Error('This does not look like a portfolio backup');
            if (!confirm('Replace all current content with this backup? (You still need to press Save.)')) return;
            C = data; changed(); renderSide(); toast('Backup loaded — press Save to publish');
          } catch (e) { toast(e.message, true); }
        };
        inp.click();
      } }),
      h('button', { class: 'abtn abtn--danger', onclick: () => {
        if (!isDirty()) return toast('No unsaved changes');
        if (confirm('Discard all unsaved changes?')) { C = JSON.parse(savedJSON); changed(); renderView(); renderSide(); toast('Changes discarded'); }
      } }, 'Discard unsaved changes'))));
  };

  // password show/hide (delegated)
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-toggle-pw]'); if (!b) return;
    const inp = document.getElementById(b.dataset.togglePw);
    inp.type = inp.type === 'password' ? 'text' : 'password';
    b.textContent = inp.type === 'password' ? 'Show' : 'Hide';
  });

  // ---------- auth & boot ----------
  const showLogin = () => { $('#app').hidden = true; $('#login').hidden = false; setTimeout(() => $('#loginPw').focus(), 50); };
  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('#loginErr').textContent = '';
    const body = { password: $('#loginPw').value };
    const askCode = !$('#loginCodeWrap').hidden;
    if (askCode) body.code = $('#loginCode').value.trim();
    const btn = $('#loginForm button[type=submit]'); btn.disabled = true;
    try {
      const j = await api('/api/login', { method: 'POST', body });
      window.__authDefault = j.isDefault;
      $('#loginPw').value = ''; $('#loginCode').value = ''; $('#loginCodeWrap').hidden = true;
      boot();
    } catch (err) {
      if (err.data?.need2fa) {
        $('#loginCodeWrap').hidden = false; $('#loginCode').focus();
        if (!askCode) { btn.disabled = false; return; }
      }
      $('#loginErr').textContent = err.message;
    }
    btn.disabled = false;
  });
  $('#logoutBtn').addEventListener('click', async () => {
    if (isDirty() && !confirm('You have unsaved changes. Log out anyway?')) return;
    await api('/api/logout', { method: 'POST' }).catch(() => {});
    savedJSON = JSON.stringify(C); location.reload();
  });

  const boot = async () => {
    try {
      C = await api('/api/content');
      C.sections ||= [];
      savedJSON = JSON.stringify(C);
      [messages, media] = await Promise.all([api('/api/messages'), api('/api/uploads')]);
    } catch (e) { toast(e.message, true); return; }
    $('#login').hidden = true; $('#app').hidden = false;
    hydrateIcons();
    go(window.__authDefault ? 'security' : (location.hash.slice(2) || 'dashboard'));
    if (window.__authDefault) toast('Welcome! First, choose a new password to unlock editing.');
    refreshDirty();
    let pv = false; try { pv = localStorage.getItem('admin-preview') === '1'; } catch { /* ignore */ }
    if (pv && innerWidth > 1200) togglePreview(true);
  };

  (async () => {
    hydrateIcons();
    const s = await api('/api/session').catch(() => ({}));
    window.__authDefault = s.isDefault;
    s.authed ? boot() : showLogin();
  })();
})();
