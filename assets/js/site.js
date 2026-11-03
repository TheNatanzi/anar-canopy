/* =========================================================
   Anar Events — site.js (v2.7, night palette, round-7 fixes, 3 Nov 2026)
   Loaded (defer, self-hosted in assets/js/vendor/) before this file:
     GSAP 3.12.5 + ScrollTrigger, Lenis 1.1.18
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
  /* every matchMedia change binding goes through this (addEventListener, with the addListener fallback for old Safari) */
  var onMQ = function (mq, fn) {
    if (mq.addEventListener) { mq.addEventListener('change', fn); } else if (mq.addListener) { mq.addListener(fn); }
  };
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  /* the phone/desktop threshold: 769px here and in the CSS header block (nav drawer, toggle) */
  var desktopQuery = window.matchMedia('(min-width: 769px)');
  var isDesktop = function () { return desktopQuery.matches; };
  /* the celebrations accordion keeps its one-open-panel row only from 1100px (CSS); below, every panel is stacked */
  var wideQuery = window.matchMedia('(min-width: 1100px)');
  var isWide = function () { return wideQuery.matches; };
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
    /* load()/play() only while the hero is on screen (a deep link to #inquire lands below it); otherwise the
       observer starts it when the hero scrolls back in (play() on the preload="none" video fetches the mp4) */
    var inView = heroVideo.getBoundingClientRect().bottom > 0;
    if (inView || !('IntersectionObserver' in window)) {
      heroVideo.load();
      heroVideo.play().catch(function () {});
    }
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
    /* hidden tab: pause; back in view: resume only while motion is on and the hero is still on screen */
    document.addEventListener('visibilitychange', function () {
      if (!videoLoaded) { return; }
      if (document.hidden) { heroVideo.pause(); return; }
      if (!userPaused && !reduced && heroVideo.getBoundingClientRect().bottom > 0) { heroVideo.play().catch(function () {}); }
    });
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
  /* After an anchor jump (or a load with a hash) the once-only reveals whose trigger start is now above the
     scroll position are forced to their end state, so nothing arrives invisible; ScrollTrigger is refreshed first */
  function settleReveals() {
    if (!hasGsap || !motionOn) { return; }
    ScrollTrigger.refresh();
    var y = window.scrollY || window.pageYOffset;
    ScrollTrigger.getAll().forEach(function (st) {
      if (st.vars.once && st.animation && st.start < y && st.animation.progress() < 1) {
        st.animation.progress(1);
        st.kill();
      }
    });
  }
  function scrollToEl(el) {
    if (!el.hasAttribute('tabindex')) { el.setAttribute('tabindex', '-1'); }
    el.focus({ preventScroll: true });
    if (lenis) { lenis.scrollTo(el, { offset: headerOffset(), duration: 1.4, onComplete: settleReveals }); }
    else {
      el.scrollIntoView({ behavior: reduced || userPaused ? 'auto' : 'smooth', block: 'start' });
      setTimeout(settleReveals, reduced || userPaused ? 50 : 900);
    }
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
  /* ONE window scroll listener for the whole file, gated by requestAnimationFrame (with Lenis every frame is a
     scroll event): each block pushes its handler into scrollFns; every handler writes the DOM only on a change */
  var scrollFns = [];
  var scrollQueued = false;
  window.addEventListener('scroll', function () {
    if (scrollQueued) { return; }
    scrollQueued = true;
    requestAnimationFrame(function () {
      scrollQueued = false;
      scrollFns.forEach(function (fn) { fn(); });
    });
  }, { passive: true });
  function onScrollState() {
    if (!header) { return; }
    var on = (window.scrollY || window.pageYOffset) > 40;
    if (header.classList.contains('is-scrolled') !== on) { header.classList.toggle('is-scrolled', on); }
  }
  scrollFns.push(onScrollState);
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
    /* the drawer closes when a link is activated and when the viewport grows past the phone breakpoint */
    $$('.site-nav a', header).forEach(function (a) { a.addEventListener('click', closeNav); });
    onMQ(desktopQuery, function (e) { if (e.matches) { closeNav(); } });
    /* the links are visible by default (CSS); only now, with the toggle wired, do they collapse into the drawer */
    html.classList.add('nav-ready');
  }

  /* ---------------------------------------------------------
     "How we work +" slide-out panel (works without GSAP too):
     ghost tab, night panel, close ×, Esc closes, backdrop closes,
     focus trap, main content inert (aria-hidden fallback), close
     timer cancelled on reopen, focus returns to the tab. The tab
     hides while #inquire or the footer is in view and while the index
     hero is in view (the inner-page band hides it on phones only);
     on phones also while scrolling down: it slides in once the first
     screen has scrolled past. The same block turns the header
     "Inquire" ghost at the destination and hides the Pause button on
     phones while a celebration body or the form sits under it.
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
    html.classList.add('panel-ready');
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
    /* Keep focused controls visible; synchronize visual and keyboard availability.
       While the page scrolls only the class changes (visual); aria-hidden / tabIndex are written in the settle
       timeout (700 ms after the last scroll or observer change), never while the control holds focus. */
    var hideAtDestination = false, hideWhileScrolling = false, heroInView = true, underContent = false, idleTimer;
    var lastScroll = window.scrollY;
    var motionBtn = $('.motion-toggle');
    var headerInquire = header ? $('.nav-right .btn', header) : null;
    var heroEl = $('.hero') || $('.pageband');
    /* the index hero hides the tab on every screen size; the inner-page band only on phones */
    var heroHides = function () { return heroInView && (!isDesktop() || (heroEl && heroEl.classList.contains('hero'))); };
    var setShown = function (el, hidden, settled) {
      if (el.classList.contains('is-hidden') !== hidden) { el.classList.toggle('is-hidden', hidden); }
      if (!settled || el.contains(document.activeElement)) { return; }
      var aria = hidden ? 'true' : 'false';
      if (el.getAttribute('aria-hidden') !== aria) { el.setAttribute('aria-hidden', aria); }
      var ti = hidden ? -1 : 0;
      if (el.tabIndex !== ti) { el.tabIndex = ti; }
    };
    var syncTab = function (settled) {
      var hidden = !panelOpen && document.activeElement !== tab &&
        (hideAtDestination || heroHides() || (!isDesktop() && hideWhileScrolling));
      setShown(tab, hidden, settled);
      /* phones: the Pause button hides while scrolling down and while an open celebration body or the form is under it */
      if (motionBtn) {
        setShown(motionBtn, !isDesktop() && (hideWhileScrolling || underContent) && document.activeElement !== motionBtn, settled);
      }
      /* the header "Inquire" turns ghost while #inquire or the footer is in view: one gold button per screen */
      if (headerInquire && headerInquire.classList.contains('ghost') !== hideAtDestination) {
        headerInquire.classList.toggle('ghost', hideAtDestination);
      }
    };
    var settleSoon = function () {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { hideWhileScrolling = false; syncTab(true); }, 700);
    };
    tab.addEventListener('blur', function () { setTimeout(function () { syncTab(true); }, 0); });
    if (motionBtn) { motionBtn.addEventListener('blur', function () { setTimeout(function () { syncTab(true); }, 0); }); }
    onMQ(desktopQuery, function () { syncTab(true); });
    scrollFns.push(function () {
      var next = window.scrollY;
      if (Math.abs(next - lastScroll) > 2) { hideWhileScrolling = next > lastScroll; }
      lastScroll = next;
      syncTab(false);
      settleSoon();
    });
    var hideFor = [$('#inquire'), $('.site-footer')].filter(Boolean);
    if (hideFor.length && 'IntersectionObserver' in window) {
      var inView = new Map();
      var tabObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { inView.set(en.target, en.isIntersecting); });
        hideAtDestination = false;
        inView.forEach(function (v) { if (v) { hideAtDestination = true; } });
        syncTab(false);
        settleSoon();
      }, { threshold: 0.05 });
      hideFor.forEach(function (el) { tabObserver.observe(el); });
    }
    /* the hero observer (index: .hero; inner pages: .pageband): the tab stays out of the first screen */
    if (heroEl && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { heroInView = en.isIntersecting; });
        syncTab(false);
        settleSoon();
      }, { threshold: 0 }).observe(heroEl);
    } else { heroInView = false; syncTab(true); }
    /* phones: the celebrations and the form, watched in the bottom 10% of the viewport (where the Pause button sits) */
    var underFor = [$('.accordion'), $('.form')].filter(Boolean);
    if (motionBtn && underFor.length && 'IntersectionObserver' in window) {
      var underView = new Map();
      var underObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { underView.set(en.target, en.isIntersecting); });
        underContent = false;
        underView.forEach(function (v) { if (v) { underContent = true; } });
        syncTab(false);
        settleSoon();
      }, { threshold: 0, rootMargin: '-90% 0px 0px 0px' });
      underFor.forEach(function (el) { underObserver.observe(el); });
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
     controls its body (aria-controls / id). Under 1100px every body
     is shown stacked and the triggers are removed (CSS + here).
     While the .7s flex transition runs the opening panel carries
     .is-settling (its body stays out of flow and invisible, CSS) and
     the row keeps its height; once settled (transitionend, or the
     .7s timer) the body is in flow, fades in, the row grows to fit
     its text and ScrollTrigger is refreshed. A ResizeObserver on the
     accordion refreshes on any later height change (debounced).
     Phones: each description sits in a native <details> "Read more";
     wider screens open every one (the summary is hidden there).
     Wide screens also reserve the row height: every body is measured
     at the open panel's width (fonts loaded, on resize) and the tallest
     sets --acc-min on the accordion (CSS min-height), so hovering from
     a short description to a long one never moves the sections below.
     --------------------------------------------------------- */
  var refreshTriggers = function () { if (hasGsap && motionOn) { ScrollTrigger.refresh(); } };
  var compactQuery = window.matchMedia('(max-width: 768px)');
  $$('[data-accordion]').forEach(function (acc, ai) {
    var panels = $$('.accordion__panel', acc);
    var hoverable = window.matchMedia('(hover: hover)').matches;
    var settleTimer = null;
    var settling = null;
    function settle() {
      if (!settling) { return; }
      var p = settling; settling = null;
      if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }
      p.classList.remove('is-settling');
      acc.style.minHeight = '';
      /* no ScrollTrigger.refresh() here: the ResizeObserver below refreshes (debounced) when the row height changes */
    }
    function open(target) {
      if (target.classList.contains('is-open')) { return; }
      settle();
      /* the row keeps its current height while the flex transition runs */
      if (isWide()) { acc.style.minHeight = acc.offsetHeight + 'px'; }
      panels.forEach(function (p) {
        var on = p === target;
        p.classList.toggle('is-open', on);
        p.classList.toggle('is-settling', on);
        var btn = $('.accordion__trigger', p);
        if (btn) { btn.setAttribute('aria-expanded', on ? 'true' : 'false'); }
        var content = $('.accordion__body', p);
        if (content) { content.inert = !on; content.setAttribute('aria-hidden', on ? 'false' : 'true'); }
      });
      settling = target;
      settleTimer = setTimeout(settle, reduced || userPaused ? 0 : 720);
    }
    acc.addEventListener('transitionend', function (e) {
      if (settling && e.target === settling && /flex/.test(e.propertyName)) { settle(); }
    });
    if ('ResizeObserver' in window) {
      var resizeTimer = null;
      new ResizeObserver(function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(refreshTriggers, 150);
      }).observe(acc);
    }
    panels.forEach(function (p, i) {
      var btn = $('.accordion__trigger', p);
      var bodyEl = $('.accordion__body', p);
      if (bodyEl && !bodyEl.id) { bodyEl.id = 'acc-' + ai + '-' + i; }
      if (btn && bodyEl) { btn.setAttribute('aria-controls', bodyEl.id); }
      /* hover opens unless focus sits inside the open body (its details / summary included) or the keyboard placed
         focus inside the accordion (a click also focuses, and must not disable hover) */
      if (hoverable) {
        p.addEventListener('mouseenter', function () {
          if (!isWide()) { return; }
          var openBody = $('.accordion__panel.is-open .accordion__body', acc);
          if (openBody && openBody.contains(document.activeElement)) { return; }
          if (acc.contains(document.activeElement) && document.activeElement.matches(':focus-visible')) { return; }
          open(p);
        });
      }
      if (btn) {
        btn.addEventListener('click', function () { if (isWide()) { open(p); } });
        btn.addEventListener('focus', function () { if (isWide()) { open(p); } });
      }
    });
    var syncMobile = function () {
      var mobile = !isWide();
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
      refreshTriggers();
    };
    /* the native "Read more": open everywhere above 768px; on phones the first panel starts open, the rest closed */
    var syncRead = function () {
      var compact = compactQuery.matches;
      panels.forEach(function (p, i) {
        var d = $('.accordion__read', p);
        if (d) { d.open = !compact || i === 0; }
      });
    };
    /* the tallest expanded body at the open panel's width (flex 4.5 of 4.5+(n-1), minus the 8px gaps) -> --acc-min */
    var reserveHeight = function () {
      if (!isWide()) { acc.style.removeProperty('--acc-min'); return; }
      var n = panels.length;
      var gap = parseFloat(getComputedStyle(acc).columnGap) || 8;
      var openW = Math.max(0, (acc.clientWidth - gap * (n - 1)) * 4.5 / (n + 3.5));
      var tallest = 0;
      panels.forEach(function (p) {
        var b = $('.accordion__body', p);
        if (!b) { return; }
        var saved = b.getAttribute('style');
        b.style.cssText = 'position:absolute;inset:auto;left:0;top:0;width:' + openW + 'px;height:auto;min-height:0;visibility:hidden;opacity:0;transition:none';
        tallest = Math.max(tallest, b.scrollHeight);
        if (saved === null) { b.removeAttribute('style'); } else { b.setAttribute('style', saved); }
      });
      if (tallest) { acc.style.setProperty('--acc-min', tallest + 'px'); }
    };
    var reserveTimer = null;
    var reserveSoon = function () { clearTimeout(reserveTimer); reserveTimer = setTimeout(function () { reserveHeight(); refreshTriggers(); }, 120); };
    syncMobile();
    syncRead();
    reserveHeight();
    onMQ(wideQuery, function () { syncMobile(); reserveSoon(); });
    onMQ(compactQuery, syncRead);
    window.addEventListener('resize', reserveSoon, { passive: true });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(reserveSoon); }
    window.addEventListener('load', reserveSoon, { once: true });
  });
  html.classList.add('site-ready');

  /* ---------------------------------------------------------
     Inquiry form: posts to Formspree with fetch when available;
     12 s AbortController timeout; entered values stay on every
     error (timeout included); the submit button is restored in
     finally; the aria-live region reports success / error.
     Without fetch the form submits normally.
     --------------------------------------------------------- */
  var form = $('.form[data-ajax]');
  if (form && window.fetch && window.FormData) {
    var status = $('.form__status', form) || $('#form-status');
    var submitBtn = $('button[type="submit"]', form);
    /* every failure message ends with clickable email and WhatsApp links (built with DOM nodes, no innerHTML) */
    var contactLinks = function () {
      var frag = document.createDocumentFragment();
      var add = function (text, href) {
        if (!href) { frag.appendChild(document.createTextNode(text)); return; }
        var a = document.createElement('a');
        a.href = href; a.className = 'link'; a.textContent = text;
        if (/^https?:/.test(href)) { a.rel = 'noopener'; }
        frag.appendChild(a);
      };
      add(' write to '); add('hello@anarevents.com', 'mailto:hello@anarevents.com');
      add(' or '); add('WhatsApp us', 'https://wa.me/19252639949'); add('.');
      return frag;
    };
    var say = function (kind, text, links) {
      if (!status) { return; }
      status.hidden = false;
      status.className = 'form__status is-' + kind;
      status.textContent = text;
      if (links) { status.appendChild(contactLinks()); }
    };
    var restoreSubmit = function () { if (submitBtn) { submitBtn.disabled = false; } };
    /* a field inside the closed "Share more wedding details" that fails validation opens it first, so the browser can show the message */
    form.addEventListener('invalid', function (e) {
      var more = e.target && e.target.closest ? e.target.closest('details') : null;
      if (more && !more.open) { more.open = true; }
    }, true);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (/FORMSPREE_ID/.test(form.action)) {
        say('error', 'Online inquiries are not connected yet. Your entries are still here. Please', true);
        return;
      }
      if (submitBtn && submitBtn.disabled) { return; }
      if (submitBtn) { submitBtn.disabled = true; }
      say('wait', 'Sending…');
      var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var timedOut = false;
      var timer;
      var timeout = new Promise(function (_, reject) {
        timer = setTimeout(function () {
          timedOut = true;
          if (controller) { controller.abort(); }
          reject(new Error('timeout'));
        }, 12000);
      });
      var options = { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } };
      if (controller) { options.signal = controller.signal; }
      var request = Promise.race([timeout, Promise.resolve().then(function () { return fetch(form.action, options); })])
        .then(function (r) { if (!r.ok) { throw new Error('bad status'); } })
        .then(function () {
          say('ok', 'Thank you. Your message is on its way; we reply within one business day.');
          form.reset();
          if (status) { status.focus(); }
        })
        .catch(function () {
          if (timedOut) {
            say('error', 'The connection timed out, so we could not confirm delivery. Nothing you typed was lost: please try again in a moment, or', true);
          } else {
            say('error', 'Your message did not send. Nothing you typed was lost: please try again, or', true);
          }
          if (status) { status.focus(); }
        });
      var done = function () { clearTimeout(timer); restoreSubmit(); };
      if (request.finally) { request.finally(done); } else { request.then(done, done); }
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
  var trunkImgs = $$('.descend__trunks img');

  /* Drawn lines (.kashida-draw, .track-line) use vector-effect:non-scaling-stroke, so dash values are
     screen pixels, not viewBox units: the dash length is the RENDERED length of the path. Returned as
     functions so GSAP re-evaluates them on every refresh (invalidateOnRefresh) and resize. */
  var lengthOf = function (p) {
    return function () { var r = p.getBoundingClientRect(); return Math.max(r.width, r.height) || 1; };
  };
  var dashOf = function (p) {
    var len = lengthOf(p);
    return function () { var l = len(); return l + 'px ' + l + 'px'; };
  };
  /* an element's offset along one axis inside an ancestor, summed up the offsetParent chain (transform-independent) */
  var offsetWithin = function (el, root, prop) {
    var v = 0;
    while (el && el !== root) { v += el[prop]; el = el.offsetParent; }
    return v;
  };

  /* Keyboard focus inside a reveal target: mark every animated ancestor
     .is-revealed at once (CSS forces it visible) so nobody tabs into
     invisible content. The inquiry form carries no reveal class at all. */
  document.addEventListener('focusin', function (e) {
    var node = e.target;
    if (!node || !node.closest || !html.classList.contains('anim-ready')) { return; }
    while (node && node !== body) {
      if (node.classList.contains('reveal') || node.classList.contains('reveal-img') || node.classList.contains('stagger') ||
          (node.parentElement && node.parentElement.classList.contains('stagger'))) {
        node.classList.add('is-revealed');
      }
      node = node.parentElement;
    }
  });

  function initMotion() {
    if (!hasGsap || motionOn) { return motionOn; }
    try {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ limitCallbacks: true });
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
      /* only the props each target was animated on are cleared (never clearProps:'all': authored inline styles stay) */
      var cleared = [
        ['.reveal, .stagger > *, .hero__mark', 'opacity,transform'],
        ['.reveal-img, .hero__canopy, .descend__trunks img, .teaser__strips i, .leaf, .ground__roots', 'transform'],
        ['.hero__deepen, .hero__scroll, .hero__tag', 'opacity'],
        ['.track-dot', 'backgroundColor,transform'],
        ['.kashida-draw path, .track-line path', 'strokeDasharray,strokeDashoffset']
      ];
      cleared.forEach(function (pair) {
        $$(pair[0]).forEach(function (el) { gsap.set(el, { clearProps: pair[1] }); });
      });
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
       3. DESCEND THE TREE: the two edge strips (trunk-left /
          trunk-right) sit in a sticky, viewport-high frame and
          scroll past at 0.8x while the statement and the pillars
          (normal flow) pass at 1x. Travel is clamped to each
          strip's spare height so no gap opens at the bottom.
       ------------------------------------------------------- */
    var descend = $('.descend');
    if (descend && trunkImgs.length) {
      trunkImgs.forEach(function (img) {
        gsap.to(img, {
          y: function () {
            var travel = Math.max(0, descend.offsetHeight - vh()) * 0.8;
            var room = Math.max(0, img.offsetHeight - vh());
            return -Math.min(travel, room);
          },
          ease: 'none',
          scrollTrigger: { trigger: descend, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true }
        });
      });
    }

    /* -------------------------------------------------------
       4. Kashida draw-on: every .kashida-draw path draws with
          scroll (stroke-dashoffset from full length to 0)
       ------------------------------------------------------- */
    $$('.kashida-draw path').forEach(function (p) {
      gsap.fromTo(p, { strokeDasharray: dashOf(p), strokeDashoffset: lengthOf(p) }, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: p.closest('svg'), start: 'top 88%', end: 'top 45%', scrub: true, invalidateOnRefresh: true }
      });
    });

    /* -------------------------------------------------------
       5. The journey (and the steps line on How we work):
          [data-track] holds .track-line path(s) and .track-dot(s).
          The sage base line and all the dots are there from the
          start (CSS: no empty state); the gold .track-line overlay
          draws across with scroll and each dot turns gold, with a
          small pulse, as the line reaches it. Each dot's activation
          point comes from its layout position along the track (not
          an even split) and is re-measured on every refresh.
       ------------------------------------------------------- */
    $$('[data-track]').forEach(function (track) {
      var paths = $$('.track-line path', track);
      var dots = $$('.track-dot', track);
      if (!paths.length) { return; }
      /* the visible track line runs horizontally when its rendered width beats its height (the other one is display:none) */
      var horizontal = function () {
        return paths.some(function (p) { var r = p.getBoundingClientRect(); return r.width > r.height; });
      };
      var ats = [];
      var measure = function () {
        var h = horizontal();
        var size = (h ? track.offsetWidth : track.offsetHeight) || 1;
        ats = dots.map(function (d) { return Math.min(1, Math.max(0, (offsetWithin(d, track, h ? 'offsetLeft' : 'offsetTop') + 7) / size)); });
      };
      /* each dot: sage -> gold with a small pulse, played when the line reaches it, reversed when it draws back */
      var dotTls = dots.map(function (d) {
        return gsap.timeline({ paused: true })
          .fromTo(d, { backgroundColor: '#5D625F' }, { backgroundColor: '#C99E5C', ease: 'none', duration: 0.25 }, 0)
          .fromTo(d, { scale: 1 }, { scale: 1.35, ease: 'power1.inOut', duration: 0.18, yoyo: true, repeat: 1 }, 0);
      });
      var syncDots = function (st) {
        var pr = st.progress;
        dotTls.forEach(function (t, i) { if (pr >= ats[i]) { t.play(); } else { t.reverse(); } });
      };
      measure();
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: track, start: 'top 78%', end: 'bottom 60%', scrub: true, invalidateOnRefresh: true,
          onRefreshInit: measure, onRefresh: syncDots, onUpdate: syncDots
        }
      });
      paths.forEach(function (p) {
        tl.fromTo(p, { strokeDasharray: dashOf(p), strokeDashoffset: lengthOf(p) }, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);
      });
    });

    /* -------------------------------------------------------
       6. How we work teaser: ONE gold kashida strip (<i>) slides in
          from the right as the section arrives, then the options.
       ------------------------------------------------------- */
    var teaser = $('.teaser');
    if (teaser) {
      var strips = $$('.teaser__strips i', teaser);
      /* GSAP alone positions the strips (no CSS translate to compound with xPercent) */
      gsap.timeline({ scrollTrigger: { trigger: teaser, start: 'top 75%', end: 'top 20%', scrub: true } })
        .fromTo(strips, { xPercent: 102, x: 0 }, { xPercent: 0, x: 0, ease: 'power1.inOut', duration: 0.6, stagger: 0.15 }, 0);
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
       8. Floating leaves (two places): buildLeaves(), rebuilt on
          the 769px breakpoint change (see below buildTweens).
       ------------------------------------------------------- */
    buildLeaves();

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

  /* -------------------------------------------------------
     8. Floating leaves (two places): desktop runs the slow
        yoyo drift loop; phones get the scroll-scrub drift
        instead. Never both: the same `y` is driven once, and
        relative (+=) so a CSS translate on the leaf is kept.
        Crossing the 769px breakpoint kills the old tweens
        (and their triggers) and builds the other kind.
     ------------------------------------------------------- */
  function killLeaves() {
    leafTweens.forEach(function (t) { if (t.scrollTrigger) { t.scrollTrigger.kill(); } t.kill(); });
    leafTweens = [];
    gsap.set($$('.leaf'), { clearProps: 'transform' });
  }
  function buildLeaves() {
    killLeaves();
    $$('.leaf').forEach(function (leaf, i) {
      if (isDesktop()) {
        leafTweens.push(gsap.to(leaf, { y: '+=' + (18 + i * 6), x: '+=' + (i % 2 ? -10 : 10), rotation: '+=' + (i % 2 ? -3 : 3), duration: 6 + i * 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      } else {
        leafTweens.push(gsap.to(leaf, { y: '+=' + (40 + i * 10), ease: 'none', scrollTrigger: { trigger: leaf.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
      }
    });
  }
  onMQ(desktopQuery, function () { if (motionOn) { buildLeaves(); } });

  /* ---------------------------------------------------------
     Pause motion / Play motion (bottom-left ghost button) and
     the prefers-reduced-motion change event.
     --------------------------------------------------------- */
  var toggle = $('.motion-toggle');
  /* the visible text lives in .motion-toggle__text (hidden where CSS draws the glyph); the accessible name is the
     fixed aria-label "Pause motion" and is never changed here: aria-pressed="true" means paused */
  var toggleText = toggle ? ($('.motion-toggle__text', toggle) || toggle) : null;
  var toggleNote = $('.motion-toggle__note');
  var setToggle = function (pressed) {
    if (!toggle) { return; }
    toggle.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    toggleText.textContent = pressed ? 'Play motion' : 'Pause motion';
  };
  /* OS reduced motion: the play control is hidden (it could not start anything) and a visually-hidden line says why;
     the stored user pause preference is left untouched */
  var syncReducedControl = function () {
    if (!toggle) { return; }
    toggle.hidden = reduced || (!hasGsap && !heroVideo);
    if (toggleNote) { toggleNote.hidden = !reduced; }
  };
  function pauseAll(remember) {
    if (remember) { userPaused = true; }
    if (remember) { try { sessionStorage.setItem('anar-motion', 'paused'); } catch (e) { /* ignore */ } }
    killMotion();
    stopSmoothScroll();
    if (heroVideo && !heroVideo.paused) { heroVideo.pause(); }
    setToggle(true);
  }
  function playAll(remember) {
    userPaused = false;
    if (remember) { try { sessionStorage.removeItem('anar-motion'); } catch (e) { /* ignore */ } }
    if (reduced) { pauseAll(false); return; }
    startSmoothScroll();
    if (body.classList.contains('panel-open') && lenis) { lenis.stop(); }
    initMotion();
    if (heroVideo) { if (!videoLoaded) { loadHeroVideo(); } else if (heroVideo.getBoundingClientRect().bottom > 0) { heroVideo.play().catch(function () {}); } }
    setToggle(false);
  }
  if (toggle) {
    syncReducedControl();
    if (!toggle.hasAttribute('aria-label')) { toggle.setAttribute('aria-label', 'Pause motion'); }
    html.classList.add('motion-ready');
    /* the control stays visible the whole page on every screen size: motion continues below the hero, so must the way to stop it */
    toggle.addEventListener('click', function () { if (userPaused) { playAll(true); } else { pauseAll(true); } });
  }
  var onReduceChange = function (e) {
    reduced = e.matches;
    syncReducedControl();
    if (reduced) { pauseAll(false); } else if (!userPaused) { playAll(false); }
  };
  onMQ(rmq, onReduceChange);

  /* ---- start ---- */
  if (!hasGsap || reduced || userPaused) {
    html.classList.add('reduced');
    if (toggle && (userPaused || reduced)) { setToggle(true); }
  } else {
    initMotion();
  }

  /* Refresh once fonts and images have settled (sticky heights, line lengths) */
  if (hasGsap) {
    window.addEventListener('load', function () { if (motionOn) { ScrollTrigger.refresh(); } });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { if (motionOn) { ScrollTrigger.refresh(); } }); }
    trunkImgs.forEach(function (img) { if (!img.complete) { img.addEventListener('load', function () { if (motionOn) { ScrollTrigger.refresh(); } }); } });
  }
})();
