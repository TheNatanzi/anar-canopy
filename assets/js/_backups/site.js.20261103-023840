/* =========================================================
   Anar Events — site.js (v2.1, night palette, round-1 fixes, 3 Nov 2026)
   Loaded (defer, pinned) before this file:
     GSAP 3.12.5 + ScrollTrigger (cdnjs), Lenis 1.1.18 (unpkg)
   Content is visible by default. Reveal targets are hidden only
   AFTER GSAP + ScrollTrigger have initialised (html.anim-ready);
   if that init throws, nothing is ever hidden. The "Pause motion"
   button and the prefers-reduced-motion change event both kill
   the scrubbed tweens and the leaf drift and pause the hero video.
   Every motion is a numbered block below. Nothing here is
   page-specific; each block checks for its own elements.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var body = document.body;
  var rmq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = rmq.matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var desktopQuery = window.matchMedia('(min-width: 769px)');
  var isDesktop = function () { return desktopQuery.matches; };
  var vh = function () { return window.innerHeight; };
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var saveData = (navigator.connection && navigator.connection.saveData === true);

  var userPaused = false;
  try { userPaused = sessionStorage.getItem('anar-motion') === 'paused'; } catch (e) { /* storage blocked: ignore */ }

  /* ---------------------------------------------------------
     0. Hero video: the src is set only after window 'load',
        only without reduced motion and only when Save-Data is off.
        1080 mp4 on wide screens, 720 mp4 at <=768px (a <source
        media> attribute is ignored inside <video>). Pauses off
        screen. The poster shows in every other case.
     --------------------------------------------------------- */
  var heroVideo = $('.hero__video');
  var videoLoaded = false;
  function loadHeroVideo() {
    if (!heroVideo || videoLoaded || reduced || saveData || userPaused) { return; }
    var src = isDesktop() ? heroVideo.getAttribute('data-src-desktop') : heroVideo.getAttribute('data-src-mobile');
    if (!src) { return; }
    videoLoaded = true;
    var source = document.createElement('source');
    source.type = 'video/mp4';
    source.src = src;
    heroVideo.appendChild(source);
    heroVideo.load();
    heroVideo.play().catch(function () {});
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !userPaused && !reduced) { heroVideo.play().catch(function () {}); } else { heroVideo.pause(); }
        });
      }, { threshold: 0.05 }).observe(heroVideo);
    }
  }
  if (heroVideo) {
    if (document.readyState === 'complete') { loadHeroVideo(); }
    else { window.addEventListener('load', loadHeroVideo, { once: true }); }
  }

  /* ---------------------------------------------------------
     Smooth scroll (Lenis) wired to the GSAP ticker
     --------------------------------------------------------- */
  var lenis = null;
  var lenisTick = function (t) { if (lenis) { lenis.raf(t * 1000); } };
  function startSmoothScroll() {
  if (!lenis && hasGsap && !reduced && !userPaused && typeof window.Lenis !== 'undefined') {
    try {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', function () { ScrollTrigger.update(); });
      gsap.ticker.add(lenisTick);
      gsap.ticker.lagSmoothing(0);
      html.classList.add('lenis');
    } catch (e) { lenis = null; }
  }
  }
  function stopSmoothScroll() {
    if (lenis) { gsap.ticker.remove(lenisTick); lenis.destroy(); lenis = null; }
    html.classList.remove('lenis');
  }
  startSmoothScroll();
  function headerOffset() { var h = $('.site-header'); return -(h ? h.offsetHeight : 0); }
  function scrollToEl(el) {
    if (!el.hasAttribute('tabindex')) { el.setAttribute('tabindex', '-1'); }
    el.focus({ preventScroll: true });
    if (lenis) { lenis.scrollTo(el, { offset: headerOffset(), duration: 1.4 }); }
    else { el.scrollIntoView({ behavior: reduced || userPaused ? 'auto' : 'smooth', block: 'start' }); }
  }

  /* Skip link: move focus INTO <main> (main carries tabindex="-1") */
  var skip = $('.skip-link'), mainEl = $('#main');
  if (skip && mainEl) {
    skip.addEventListener('click', function (e) {
      e.preventDefault();
      if (!mainEl.hasAttribute('tabindex')) { mainEl.setAttribute('tabindex', '-1'); }
      mainEl.focus({ preventScroll: true });
      mainEl.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }

  /* ---------------------------------------------------------
     Header: solid once scrolled (the small gold logo fades in
     via .is-scrolled, CSS); mobile drawer
     --------------------------------------------------------- */
  var header = $('.site-header');
  var navToggle = $('.nav-toggle');
  function onScrollState() {
    if (!header) { return; }
    header.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset) > 40);
  }
  window.addEventListener('scroll', onScrollState, { passive: true });
  onScrollState();
  function closeNav() {
    if (!header || !navToggle) { return; }
    header.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) { closeNav(); navToggle.focus(); }
    });
  }

  /* ---------------------------------------------------------
     "How we work +" slide-out panel (works without GSAP too):
     ghost tab, night panel, close ×, Esc closes, backdrop closes,
     focus trap, main content inert (aria-hidden fallback), close
     timer cancelled on reopen, focus returns to the tab. The tab
     hides while #inquire or the footer is in view.
     --------------------------------------------------------- */
  var tab = $('.hww-tab'), panel = $('#hww-panel'), backdrop = $('.hww-backdrop');
  var closePanel = function () {};
  if (tab && panel && backdrop) {
    var closeBtn = $('.hww-panel__close', panel);
    var lastFocus = null;
    var closeTimer = null;
    var openFrame = null;
    var panelOpen = false;
    var outsideState = [];
    var outside = function () {
      return $$('body > *').filter(function (el) { return el !== panel && el !== backdrop && el.tagName !== 'SCRIPT'; });
    };
    var setInert = function (on) {
      if (on) {
        outsideState = outside().map(function (el) {
          var state = { el: el, inert: el.inert, hidden: el.getAttribute('aria-hidden') };
          el.inert = true;
          el.setAttribute('aria-hidden', 'true');
          return state;
        });
      } else {
        outsideState.forEach(function (s) {
          s.el.inert = s.inert;
          if (s.hidden === null) { s.el.removeAttribute('aria-hidden'); } else { s.el.setAttribute('aria-hidden', s.hidden); }
        });
        outsideState = [];
      }
    };
    var focusables = function () {
      return $$('a[href], button, input, select, textarea, [tabindex]', panel)
        .filter(function (el) { return !el.disabled && el.tabIndex >= 0 && el.offsetParent !== null && !el.closest('[inert]'); });
    };
    var openPanel = function () {
      if (panelOpen) { return; }
      panelOpen = true;
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
      lastFocus = document.activeElement;
      panel.hidden = false; backdrop.hidden = false;
      panel.inert = false;
      panel.removeAttribute('aria-hidden');
      openFrame = requestAnimationFrame(function () { panel.classList.add('is-open'); backdrop.classList.add('is-on'); openFrame = null; });
      tab.setAttribute('aria-expanded', 'true');
      body.classList.add('panel-open');
      (closeBtn || panel).focus({ preventScroll: true });
      setInert(true);
      if (lenis) { lenis.stop(); }
    };
    closePanel = function () {
      if (!panelOpen) { return; }
      panelOpen = false;
      if (openFrame !== null) { cancelAnimationFrame(openFrame); openFrame = null; }
      panel.classList.remove('is-open'); backdrop.classList.remove('is-on');
      tab.setAttribute('aria-expanded', 'false');
      body.classList.remove('panel-open');
      setInert(false);
      if (lenis) { lenis.start(); }
      if (closeTimer) { clearTimeout(closeTimer); }
      closeTimer = setTimeout(function () { panel.hidden = true; backdrop.hidden = true; closeTimer = null; }, reduced || userPaused ? 0 : 560);
      if (lastFocus && lastFocus.focus) { lastFocus.focus({ preventScroll: true }); }
      panel.inert = true;
      panel.setAttribute('aria-hidden', 'true');
    };
    tab.addEventListener('click', openPanel);
    if (closeBtn) { closeBtn.addEventListener('click', closePanel); }
    backdrop.addEventListener('click', closePanel);
    document.addEventListener('keydown', function (e) {
      if (!panelOpen) { return; }
      if (e.key === 'Escape') { closePanel(); return; }
      if (e.key === 'Tab') {
        var f = focusables(); if (!f.length) { e.preventDefault(); panel.focus(); return; }
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    document.addEventListener('focusin', function (e) {
      if (panelOpen && !panel.contains(e.target)) { (closeBtn || panel).focus(); }
    });
    /* hide the tab while the Inquire ground or the footer is in view */
    var hideFor = [$('#inquire'), $('.site-footer')].filter(Boolean);
    if (hideFor.length && 'IntersectionObserver' in window) {
      var inView = new Map();
      var tabObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { inView.set(en.target, en.isIntersecting); });
        var any = false;
        inView.forEach(function (v) { if (v) { any = true; } });
        tab.classList.toggle('is-hidden', any);
        tab.setAttribute('aria-hidden', any ? 'true' : 'false');
        tab.tabIndex = any ? -1 : 0;
      }, { threshold: 0.05 });
      hideFor.forEach(function (el) { tabObserver.observe(el); });
    }
  }

  /* Same-page anchors (including "index.html#inquire" while on index):
     the panel and the drawer close first, then the scroll. */
  $$('a[href*="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') { return; }
      var url = new URL(a.getAttribute('href'), location.href);
      var norm = function (p) { return p.replace(/\/index\.html$/, '/'); };
      if (url.origin !== location.origin || norm(url.pathname) !== norm(location.pathname) || !url.hash) { return; }
      var target = document.getElementById(url.hash.slice(1));
      if (!target) { return; }
      e.preventDefault();
      closeNav();
      closePanel();
      scrollToEl(target);
      history.pushState(null, '', url.hash);
    });
  });
  if (location.hash) {
    var landing = document.getElementById(location.hash.slice(1));
    if (landing) { setTimeout(function () { scrollToEl(landing); }, 80); }
  }

  /* ---------------------------------------------------------
     Accordion (The celebrations): hover expands on pointer
     devices, click/focus expands (touch, keyboard). Each trigger
     controls its body (aria-controls / id). On <=768px every body
     is shown stacked and the triggers are removed (CSS + here).
     --------------------------------------------------------- */
  $$('[data-accordion]').forEach(function (acc, ai) {
    var panels = $$('.accordion__panel', acc);
    var hoverable = window.matchMedia('(hover: hover)').matches;
    function open(target) {
      panels.forEach(function (p) {
        var on = p === target;
        p.classList.toggle('is-open', on);
        var btn = $('.accordion__trigger', p);
        if (btn) { btn.setAttribute('aria-expanded', on ? 'true' : 'false'); }
        var content = $('.accordion__body', p);
        if (content) { content.inert = !on; content.setAttribute('aria-hidden', on ? 'false' : 'true'); }
      });
    }
    panels.forEach(function (p, i) {
      var btn = $('.accordion__trigger', p);
      var bodyEl = $('.accordion__body', p);
      if (bodyEl && !bodyEl.id) { bodyEl.id = 'acc-' + ai + '-' + i; }
      if (btn && bodyEl) { btn.setAttribute('aria-controls', bodyEl.id); }
      if (hoverable) { p.addEventListener('mouseenter', function () { if (isDesktop() && !acc.contains(document.activeElement)) { open(p); } }); }
      if (btn) {
        btn.addEventListener('click', function () { if (isDesktop()) { open(p); } });
        btn.addEventListener('focus', function () { if (isDesktop()) { open(p); } });
      }
    });
    var syncMobile = function () {
      var mobile = !isDesktop();
      panels.forEach(function (p) {
        var btn = $('.accordion__trigger', p);
        var content = $('.accordion__body', p);
        var visible = mobile || p.classList.contains('is-open');
        if (!mobile && content && content.contains(document.activeElement)) { open(p); visible = true; }
        if (content) { content.inert = !visible; content.setAttribute('aria-hidden', visible ? 'false' : 'true'); }
        if (!btn) { return; }
        btn.hidden = mobile;
        if (mobile) { btn.setAttribute('aria-expanded', 'true'); }
        else { btn.setAttribute('aria-expanded', p.classList.contains('is-open') ? 'true' : 'false'); }
      });
    };
    syncMobile();
    desktopQuery.addEventListener('change', syncMobile);
  });
  html.classList.add('site-ready');

  /* ---------------------------------------------------------
     Inquiry form: posts to Formspree with fetch when available;
     entered values stay on error; the aria-live region reports
     success / error. Without fetch the form submits normally.
     --------------------------------------------------------- */
  var form = $('.form[data-ajax]');
  if (form && window.fetch && window.FormData) {
    var status = $('.form__status', form) || $('#form-status');
    var submitBtn = $('button[type="submit"]', form);
    var say = function (kind, text) {
      if (!status) { return; }
      status.hidden = false;
      status.className = 'form__status is-' + kind;
      status.textContent = text;
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (/FORMSPREE_ID/.test(form.action)) {
        say('error', 'Online inquiries are not connected yet. Your entries are still here. Please write to hello@anarevents.com or WhatsApp us.');
        return;
      }
      if (submitBtn && submitBtn.disabled) { return; }
      if (submitBtn) { submitBtn.disabled = true; }
      say('wait', 'Sending…');
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) { if (!r.ok) { throw new Error('bad status'); } })
        .then(function () {
          say('ok', 'Thank you. Your message is on its way; we reply within one business day.');
          form.reset();
          if (status) { status.focus(); }
        })
        .catch(function () {
          say('error', 'Your message did not send. Nothing you typed was lost: please try again, or write to hello@anarevents.com or WhatsApp us.');
          if (status) { status.focus(); }
        })
        .then(function () { if (submitBtn) { submitBtn.disabled = false; } });
    });
  }

  /* =========================================================
     MOTION. initMotion() builds every tween and returns true;
     killMotion() removes them all and shows everything. The
     "Pause motion / Play motion" button and the reduced-motion
     media query call these.
     ========================================================= */
  var motionOn = false;
  var leafTweens = [];
  var trunksImg = $('.descend__trunks img');

  function initMotion() {
    if (!hasGsap || motionOn) { return motionOn; }
    try {
      gsap.registerPlugin(ScrollTrigger);
      html.classList.add('anim-ready');
      html.classList.add('motion');
      html.classList.remove('reduced');
      buildTweens();
      motionOn = true;
      ScrollTrigger.refresh();
    } catch (err) {
      killMotion();
      stopSmoothScroll();
      /* nothing stays hidden if init fails */
      html.classList.remove('anim-ready');
      html.classList.remove('motion');
      html.classList.add('reduced');
      motionOn = false;
      if (window.console) { console.warn('Anar motion disabled:', err); }
    }
    return motionOn;
  }

  function killMotion() {
    try {
      if (hasGsap) {
      ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
      leafTweens.forEach(function (t) { t.kill(); });
      leafTweens = [];
      gsap.globalTimeline.clear();
      $$('.reveal, .reveal-img, .stagger > *, .hero__mark, .hero__canopy, .hero__deepen, .hero__scroll, .hero__tag, .descend__trunks img, .teaser__strips i, .leaf, .ground__roots, .track-dot, .kashida-draw path, .track-line path')
        .forEach(function (el) { gsap.set(el, { clearProps: 'all' }); });
      }
    } catch (e) { /* ignore */ }
    html.classList.remove('anim-ready');
    html.classList.remove('motion');
    html.classList.add('reduced');
    motionOn = false;
  }

  function buildTweens() {
    /* -------------------------------------------------------
       1. HERO (scrubbed over the hero's own height): the logo
          rises slower than the page and fades (no blur: cheaper);
          the video tint deepens to solid cypress;
       2. the canopy-u3 piece moves up and out at 0.6x scroll speed.
       ------------------------------------------------------- */
    var hero = $('.hero');
    if (hero) {
      gsap.timeline({
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      })
        .to('.hero__mark', { y: function () { return vh() * 0.45; }, opacity: 0.35, ease: 'none', duration: 1 }, 0)
        .to('.hero__canopy', { y: function () { return vh() * 0.4; }, ease: 'none', duration: 1 }, 0)
        .to('.hero__deepen', { opacity: 1, ease: 'none', duration: 1 }, 0)
        .to(['.hero__scroll', '.hero__tag'], { opacity: 0, ease: 'none', duration: 0.35 }, 0);
    }

    /* -------------------------------------------------------
       3. DESCEND THE TREE: the trunks sit in a sticky, viewport-
          high frame and scroll past at 0.8x while the statement
          and the pillars (normal flow) pass at 1x.
       ------------------------------------------------------- */
    var descend = $('.descend');
    if (descend && trunksImg) {
      gsap.to(trunksImg, {
        y: function () {
          var travel = Math.max(0, descend.offsetHeight - vh()) * 0.8;
          var room = Math.max(0, trunksImg.offsetHeight - vh());
          return -Math.min(travel, room);
        },
        ease: 'none',
        scrollTrigger: { trigger: descend, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true }
      });
    }

    /* -------------------------------------------------------
       4. Kashida draw-on: every .kashida-draw path draws with
          scroll (stroke-dashoffset from full length to 0)
       ------------------------------------------------------- */
    $$('.kashida-draw path').forEach(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      gsap.to(p, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: p.closest('svg'), start: 'top 88%', end: 'top 45%', scrub: true }
      });
    });

    /* -------------------------------------------------------
       5. The journey (and the steps line on How we work):
          [data-track] holds .track-line path(s) and .track-dot(s).
          ONE gold line draws across the section; each dot pops.
       ------------------------------------------------------- */
    $$('[data-track]').forEach(function (track) {
      var paths = $$('.track-line path', track);
      var dots = $$('.track-dot', track);
      if (!paths.length) { return; }
      var tl = gsap.timeline({
        scrollTrigger: { trigger: track, start: 'top 78%', end: 'bottom 60%', scrub: true }
      });
      paths.forEach(function (p) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
        tl.to(p, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);
      });
      dots.forEach(function (d, i) {
        tl.fromTo(d, { scale: 0 }, { scale: 1, ease: 'back.out(2)', duration: 0.06 }, Math.max(0, (i + 0.5) / dots.length - 0.04));
      });
    });

    /* -------------------------------------------------------
       6. How we work teaser: three gold kashida strips slide in
          from the right as the section arrives, then the cards.
       ------------------------------------------------------- */
    var teaser = $('.teaser');
    if (teaser) {
      var strips = $$('.teaser__strips i', teaser);
      gsap.timeline({ scrollTrigger: { trigger: teaser, start: 'top 75%', end: 'top 20%', scrub: true } })
        .fromTo(strips, { xPercent: 102 }, { xPercent: 0, ease: 'power1.inOut', duration: 0.6, stagger: 0.15 }, 0);
    }

    /* -------------------------------------------------------
       7. The roots: roots-floor rises in as the floor while the
          Inquire section arrives.
       ------------------------------------------------------- */
    var ground = $('.ground'), roots = $('.ground__roots');
    if (ground && roots) {
      gsap.fromTo(roots, { yPercent: 28 }, {
        yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: ground, start: 'top 90%', end: 'top 15%', scrub: true }
      });
    }

    /* -------------------------------------------------------
       8. Floating leaves drift slowly (two places).
       ------------------------------------------------------- */
    $$('.leaf').forEach(function (leaf, i) {
      leafTweens.push(gsap.to(leaf, { y: 18 + i * 6, x: i % 2 ? -10 : 10, rotation: i % 2 ? -3 : 3, duration: 6 + i * 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      gsap.to(leaf, { y: '+=' + (40 + i * 10), ease: 'none', scrollTrigger: { trigger: leaf.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* -------------------------------------------------------
       9. Section reveals (fade + rise, 0.9s ease-out), once;
          images scale 1.02 -> 1; .stagger children stagger.
          Anything already inside the viewport is shown at once
          (no flash: .anim-ready and these sets land in one task).
       ------------------------------------------------------- */
    var limit = vh() * 0.88;
    var seen = function (el) { return el.getBoundingClientRect().top < limit; };
    $$('.reveal').forEach(function (el) {
      if (seen(el)) { gsap.set(el, { opacity: 1, y: 0 }); return; }
      gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    $$('.reveal-img').forEach(function (el) {
      if (seen(el)) { gsap.set(el, { scale: 1 }); return; }
      gsap.to(el, { scale: 1, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    $$('.stagger').forEach(function (group) {
      if (seen(group)) { gsap.set(group.children, { opacity: 1, y: 0 }); return; }
      gsap.to(group.children, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.08, scrollTrigger: { trigger: group, start: 'top 88%', once: true } });
    });
  }

  /* ---------------------------------------------------------
     Pause motion / Play motion (bottom-left ghost button) and
     the prefers-reduced-motion change event.
     --------------------------------------------------------- */
  var toggle = $('.motion-toggle');
  function pauseAll(remember) {
    if (remember) { userPaused = true; }
    if (remember) { try { sessionStorage.setItem('anar-motion', 'paused'); } catch (e) { /* ignore */ } }
    killMotion();
    stopSmoothScroll();
    if (heroVideo && !heroVideo.paused) { heroVideo.pause(); }
    if (toggle) { toggle.setAttribute('aria-pressed', 'true'); toggle.textContent = 'Play motion'; }
  }
  function playAll(remember) {
    userPaused = false;
    if (remember) { try { sessionStorage.removeItem('anar-motion'); } catch (e) { /* ignore */ } }
    if (reduced) { pauseAll(false); return; }
    startSmoothScroll();
    if (body.classList.contains('panel-open') && lenis) { lenis.stop(); }
    initMotion();
    if (heroVideo) { if (!videoLoaded) { loadHeroVideo(); } else if (heroVideo.getBoundingClientRect().bottom > 0) { heroVideo.play().catch(function () {}); } }
    if (toggle) { toggle.setAttribute('aria-pressed', 'false'); toggle.textContent = 'Pause motion'; }
  }
  if (toggle) {
    toggle.hidden = !hasGsap && !heroVideo;
    toggle.addEventListener('click', function () { if (userPaused || reduced) { playAll(true); } else { pauseAll(true); } });
  }
  var onReduceChange = function (e) {
    reduced = e.matches;
    if (reduced) { pauseAll(false); } else if (!userPaused) { playAll(false); }
  };
  if (rmq.addEventListener) { rmq.addEventListener('change', onReduceChange); } else if (rmq.addListener) { rmq.addListener(onReduceChange); }

  /* ---- start ---- */
  if (!hasGsap || reduced || userPaused) {
    html.classList.add('reduced');
    if (toggle && (userPaused || reduced)) { toggle.setAttribute('aria-pressed', 'true'); toggle.textContent = 'Play motion'; }
  } else {
    initMotion();
  }

  /* Refresh once fonts and images have settled (sticky heights, line lengths) */
  if (hasGsap) {
    window.addEventListener('load', function () { if (motionOn) { ScrollTrigger.refresh(); } });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { if (motionOn) { ScrollTrigger.refresh(); } }); }
    if (trunksImg && !trunksImg.complete) { trunksImg.addEventListener('load', function () { if (motionOn) { ScrollTrigger.refresh(); } }); }
  }
})();
