/* =========================================================
   Anar Events — site.js (v2.10, night palette, round-10 fixes, 3 Nov 2026)
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
  var videoFailed = false;
  /* every play() goes through here: the promise rejection (autoplay refused) is swallowed and nothing plays after a failure */
  var playVideo = function () {
    if (!heroVideo || videoFailed) { return; }
    var p = heroVideo.play();
    if (p && p.catch) { p.catch(function () {}); }
  };
  function loadHeroVideo() {
    if (!heroVideo || videoLoaded || videoFailed || reduced || saveData || userPaused) { return; }
    var src = isDesktop() ? heroVideo.getAttribute('data-src-desktop') : heroVideo.getAttribute('data-src-mobile');
    if (!src) { return; }
    videoLoaded = true;
    var source = document.createElement('source');
    source.type = 'video/mp4';
    source.src = src;
    /* a failed fetch or decode (restrictive data policies, a missing file): the source is removed and load() puts
       the poster back, silently; no later play() is attempted */
    var fallback = function () {
      if (videoFailed) { return; }
      videoFailed = true;
      try {
        heroVideo.pause();
        if (source.parentNode) { heroVideo.removeChild(source); }
        heroVideo.load();
      } catch (e) { /* the poster is already showing */ }
    };
    source.addEventListener('error', fallback);
    heroVideo.addEventListener('error', fallback);
    heroVideo.appendChild(source);
    /* load()/play() only while the hero is on screen (a deep link to #inquire lands below it); otherwise the
       observer starts it when the hero scrolls back in (play() on the preload="none" video fetches the mp4) */
    var inView = heroVideo.getBoundingClientRect().bottom > 0;
    if (inView || !('IntersectionObserver' in window)) {
      heroVideo.load();
      playVideo();
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !userPaused && !reduced) { playVideo(); } else { heroVideo.pause(); }
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
      if (!userPaused && !reduced && heroVideo.getBoundingClientRect().bottom > 0) { playVideo(); }
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
     scroll position are forced to their end state, so nothing arrives invisible; ScrollTrigger is refreshed first.
     The same settle runs (without the refresh) when ordinary scrolling ends, so a fast flick or a scrollbar jump
     past a whole trigger range (limitCallbacks:true can skip its callback) never strands a .reveal / .stagger */
  function settleReveals(noRefresh) {
    if (!hasGsap || !motionOn) { return; }
    if (!noRefresh) { ScrollTrigger.refresh(); }
    /* the reveal tweens are tracked in revealTweens (block 9): a once-only trigger that was jumped over may already have
       killed itself without playing, so ScrollTrigger.getAll() cannot find it; the trigger element's position can */
    var limit = vh() * 0.88;
    revealTweens = revealTweens.filter(function (r) {
      if (r.tween.progress() >= 1) { return false; }
      if (r.el.getBoundingClientRect().top >= limit) { return true; }
      r.tween.progress(1);
      if (r.tween.scrollTrigger) { r.tween.scrollTrigger.kill(); }
      return false;
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

  /* Skip link: the same anchor path as every in-page link (the drawer and the panel close first, so <main>
     is no longer inert when it takes focus; main carries tabindex="-1") */
  var skip = $('.skip-link'), mainEl = $('#main');
  if (skip && mainEl) {
    skip.addEventListener('click', function (e) {
      e.preventDefault();
      goToAnchor(mainEl);
    });
  }

  /* ---------------------------------------------------------
     Header: solid once scrolled (the small gold logo fades in
     via .is-scrolled, CSS); mobile drawer
     --------------------------------------------------------- */
  var header = $('.site-header');
  var navToggle = $('.nav-toggle');
  /* the "How we work +" tab, panel and backdrop (their block is below); panelOpen is read here by syncInert() */
  var tab = $('.hww-tab'), panel = $('#hww-panel'), backdrop = $('.hww-backdrop');
  var panelOpen = false;
  /* ONE background-inert state for BOTH overlays (the drawer and the panel). Every element outside the panel is
     a candidate; its original inert / aria-hidden is saved the first time either overlay opens and restored only
     once both are closed, so a resize (syncNav) can never clear inert under the open panel. The drawer leaves the
     header live (it lives there) and the skip link reachable (activating it closes the drawer); the panel makes
     everything outside itself inert. aria-hidden goes with inert, for browsers without `inert`. */
  var inertState = null;
  var outside = function () {
    return $$('body > *').filter(function (el) { return el !== panel && el !== backdrop && el.tagName !== 'SCRIPT'; });
  };
  function syncInert() {
    var navOpen = !!(header && header.classList.contains('nav-open'));
    var on = navOpen || panelOpen;
    if (on) {
      if (!inertState) {
        inertState = outside().map(function (el) { return { el: el, inert: el.inert, hidden: el.getAttribute('aria-hidden') }; });
      }
      inertState.forEach(function (s) {
        var inert = panelOpen || (s.el !== header && s.el !== skip);
        s.el.inert = inert;
        if (inert) { s.el.setAttribute('aria-hidden', 'true'); }
        else if (s.hidden === null) { s.el.removeAttribute('aria-hidden'); } else { s.el.setAttribute('aria-hidden', s.hidden); }
      });
    } else if (inertState) {
      inertState.forEach(function (s) {
        s.el.inert = s.inert;
        if (s.hidden === null) { s.el.removeAttribute('aria-hidden'); } else { s.el.setAttribute('aria-hidden', s.hidden); }
      });
      inertState = null;
    }
    /* the scroll lock and Lenis follow the same combined state */
    body.classList.toggle('panel-open', on);
    if (lenis) { if (on) { lenis.stop(); } else { lenis.start(); } }
  }
  /* ONE window scroll listener for the whole file, gated by requestAnimationFrame (with Lenis every frame is a
     scroll event): each block pushes its handler into scrollFns; every handler writes the DOM only on a change */
  var scrollFns = [];
  var scrollQueued = false;
  var scrollEndTimer = null;
  window.addEventListener('scroll', function () {
    /* scroll end (150 ms after the last event): complete any once-only reveal whose trigger range has been passed */
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(function () { settleReveals(true); }, 150);
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
  /* the toggle's aria-expanded, the inert page, the scroll lock and Lenis always follow the drawer's class (also
     re-synced on resize): syncInert() computes them from the drawer AND the panel together */
  function syncNav() {
    if (!header || !navToggle) { return; }
    var open = header.classList.contains('nav-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    syncInert();
  }
  function closeNav() {
    if (!header || !navToggle) { return; }
    header.classList.remove('nav-open');
    syncNav();
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      header.classList.toggle('nav-open');
      syncNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.classList.contains('nav-open')) { closeNav(); navToggle.focus(); }
    });
    /* the drawer closes when a link is activated, on a click outside the header (capture: before the target's own
       handler, so the "How we work +" tab's open runs on a page that is no longer inert), when focus leaves the
       header (Tab past the last link) and when the viewport grows past the phone breakpoint */
    $$('.site-nav a', header).forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('click', function (e) {
      if (header.classList.contains('nav-open') && !header.contains(e.target)) { closeNav(); }
    }, true);
    header.addEventListener('focusout', function (e) {
      if (header.classList.contains('nav-open') && e.relatedTarget && !header.contains(e.relatedTarget)) { closeNav(); }
    });
    onMQ(desktopQuery, function (e) { if (e.matches) { closeNav(); } });
    window.addEventListener('resize', syncNav, { passive: true });
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
     "Inquire" ghost while another filled inquiry button is on screen
     and hides the Pause button on phones while the page is scrolling.
     --------------------------------------------------------- */
  var closePanel = function () {};
  if (tab && panel && backdrop) {
    var closeBtn = $('.hww-panel__close', panel);
    var lastFocus = null;
    var closeTimer = null;
    var openFrame = null;
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
      (closeBtn || panel).focus({ preventScroll: true });
      syncInert();
    };
    closePanel = function () {
      if (!panelOpen) { return; }
      panelOpen = false;
      if (openFrame !== null) { cancelAnimationFrame(openFrame); openFrame = null; }
      panel.classList.remove('is-open'); backdrop.classList.remove('is-on');
      tab.setAttribute('aria-expanded', 'false');
      syncInert();
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
       Showing: the class, aria-hidden and tabIndex change together, at once. Hiding: while the page scrolls only
       the class changes (visual); aria-hidden / tabIndex follow in the settle timeout (700 ms after the last
       scroll or observer change). A control that holds focus is never hidden, visually or from the keyboard. */
    var hideAtDestination = false, hideWhileScrolling = false, heroInView = true, filledInquire = false, idleTimer;
    var lastScroll = window.scrollY;
    var motionBtn = $('.motion-toggle');
    var headerInquire = header ? $('.nav-right .btn', header) : null;
    var heroEl = $('.hero') || $('.pageband');
    /* the index hero hides the tab on every screen size; the inner-page band only on phones */
    var heroHides = function () { return heroInView && (!isDesktop() || (heroEl && heroEl.classList.contains('hero'))); };
    var setShown = function (el, hidden, settled) {
      if (hidden && el.contains(document.activeElement)) { hidden = false; }
      if (el.classList.contains('is-hidden') !== hidden) { el.classList.toggle('is-hidden', hidden); }
      if (hidden && !settled) { return; }
      var aria = hidden ? 'true' : 'false';
      if (el.getAttribute('aria-hidden') !== aria) { el.setAttribute('aria-hidden', aria); }
      var ti = hidden ? -1 : 0;
      if (el.tabIndex !== ti) { el.tabIndex = ti; }
    };
    var syncTab = function (settled) {
      var hidden = !panelOpen && document.activeElement !== tab &&
        (hideAtDestination || heroHides() || (!isDesktop() && hideWhileScrolling));
      setShown(tab, hidden, settled);
      /* phones: the Pause button hides only while actively scrolling down (the animated sections keep it available;
         the celebration bodies and the form reserve 64px under their text for it, CSS) */
      if (motionBtn) {
        setShown(motionBtn, !isDesktop() && hideWhileScrolling && document.activeElement !== motionBtn, settled);
      }
      /* the header "Inquire" turns ghost while another filled inquiry button is on screen (the celebrations and
         journey CTAs, the form's own button in #inquire, the footer): one gold button per screen */
      if (headerInquire && headerInquire.classList.contains('ghost') !== filledInquire) {
        headerInquire.classList.toggle('ghost', filledInquire);
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
    /* one observer: #inquire and the footer hide the tab AND ghost the header Inquire; every other filled inquiry
       button in the page (every main .btn whose href ends in #inquire) only ghosts the header Inquire */
    var hideFor = [$('#inquire'), $('.site-footer')].filter(Boolean);
    var ghostFor = hideFor.concat($$('main .btn[href$="#inquire"]'));
    if (ghostFor.length && 'IntersectionObserver' in window) {
      var inView = new Map();
      var tabObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { inView.set(en.target, en.isIntersecting); });
        hideAtDestination = false; filledInquire = false;
        inView.forEach(function (v, el) {
          if (!v) { return; }
          filledInquire = true;
          if (hideFor.indexOf(el) !== -1) { hideAtDestination = true; }
        });
        syncTab(false);
        settleSoon();
      }, { threshold: 0.05 });
      ghostFor.forEach(function (el) { tabObserver.observe(el); });
    }
    /* the hero observer (index: .hero; inner pages: .pageband): the tab stays out of the first screen */
    if (heroEl && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { heroInView = en.isIntersecting; });
        syncTab(false);
        settleSoon();
      }, { threshold: 0 }).observe(heroEl);
    } else { heroInView = false; syncTab(true); }
  }

  /* Same-page anchors (including "index.html#inquire" while on index) and the skip link:
     the panel and the drawer close first, then the scroll. A target inside a collapsed
     celebration strip (the "Find your celebration" links) opens that panel on wide screens. */
  function openPanelFor(target) {
    var p = target.closest ? target.closest('.accordion__panel') : null;
    var btn = p ? $('.accordion__trigger', p) : null;
    if (btn && !btn.hidden) { btn.click(); }
  }
  function goToAnchor(target) {
    closeNav();
    closePanel();
    openPanelFor(target);
    scrollToEl(target);
  }
  $$('a[href*="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') { return; }
      var url = new URL(a.getAttribute('href'), location.href);
      var norm = function (p) { return p.replace(/\/index\.html$/, '/'); };
      if (url.origin !== location.origin || norm(url.pathname) !== norm(location.pathname) || !url.hash) { return; }
      var target = document.getElementById(url.hash.slice(1));
      if (!target) { return; }
      e.preventDefault();
      goToAnchor(target);
      history.pushState(null, '', url.hash);
    });
  });
  /* a hash landing: the browser has already jumped to the fragment, so measure first. Already at the intended clearance
     (its top between the header height and the CSS scroll-margin, header + 16px): focus and settle only; anywhere else,
     a top of 0 behind the fixed header included, an immediate (not glided) scroll to the header offset, so the page
     never slides twice */
  if (location.hash) {
    var landing = document.getElementById(location.hash.slice(1));
    if (landing) {
      setTimeout(function () {
        if (!landing.hasAttribute('tabindex')) { landing.setAttribute('tabindex', '-1'); }
        openPanelFor(landing);
        /* focus first: the focusin handler (below) marks every .reveal ancestor .is-revealed (transform none), and
           settleReveals() completes the reveals above the fold, so the box measured next is the untransformed one
           (a target inside a not-yet-revealed .reveal sits 24px low until then; the browser's own jump used that box) */
        landing.focus({ preventScroll: true });
        settleReveals();
        var top = landing.getBoundingClientRect().top;
        var headerH = -headerOffset();
        if (top >= headerH - 2 && top <= headerH + 18) { return; }
        var settled = function () { settleReveals(true); };
        if (lenis) { lenis.scrollTo(landing, { offset: headerOffset(), immediate: true, onComplete: settled }); }
        else { landing.scrollIntoView({ behavior: 'auto', block: 'start' }); setTimeout(settled, 50); }
      }, 80);
    }
  }

  /* ---------------------------------------------------------
     Accordion (The celebrations): hover expands on pointer
     devices, click/focus expands (touch, keyboard). Each trigger
     controls its body (aria-controls / id). Under 1100px every body
     is shown stacked and the triggers are removed (CSS + here).
     While the .35s flex transition runs the opening panel carries
     .is-settling (its body stays out of flow, CSS, and fades in from
     40% of the transition) and the row keeps its height; once settled
     (transitionend, or the .36s timer) the body is in flow, the row
     grows to fit its text and ScrollTrigger is refreshed. A
     ResizeObserver on the accordion refreshes on any later height
     change (debounced). At every width each description sits in a
     native <details> "Read more", closed at start (the title, the
     Persian accent and the intro stay visible). Collapsed bodies carry
     aria-hidden="true" + inert at every breakpoint; a shown body
     carries neither (setBodyShown).
     Wide screens also reserve the row height: every body is measured
     at the open panel's width (fonts loaded, on resize) and the tallest
     sets --acc-min on the accordion (CSS min-height), so hovering from
     a short description to a long one never moves the sections below.
     --------------------------------------------------------- */
  var refreshTriggers = function () { if (hasGsap && motionOn) { ScrollTrigger.refresh(); } };
  var setBodyShown = function (content, shown) {
    if (!content) { return; }
    content.inert = !shown;
    if (shown) { content.removeAttribute('aria-hidden'); } else { content.setAttribute('aria-hidden', 'true'); }
  };
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
        setBodyShown($('.accordion__body', p), on);
      });
      settling = target;
      settleTimer = setTimeout(settle, reduced || userPaused ? 0 : 360);
    }
    acc.addEventListener('transitionend', function (e) {
      if (settling && e.target === settling && /flex/.test(e.propertyName)) { settle(); }
    });
    /* height changes (a panel settling, a Read more opening): one refresh, 150 ms after the last change, on the next frame */
    if ('ResizeObserver' in window) {
      var resizeTimer = null;
      new ResizeObserver(function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () { requestAnimationFrame(refreshTriggers); }, 150);
      }).observe(acc);
    }
    panels.forEach(function (p, i) {
      var btn = $('.accordion__trigger', p);
      var bodyEl = $('.accordion__body', p);
      if (bodyEl && !bodyEl.id) { bodyEl.id = 'acc-' + ai + '-' + i; }
      if (btn && bodyEl) { btn.setAttribute('aria-controls', bodyEl.id); }
      /* hover opens after a 120 ms hover-intent pause (a pointer crossing the row to reach the CTA opens nothing),
         unless focus sits inside the open body (its details / summary included) or the keyboard placed focus
         inside the accordion (a click also focuses, and must not disable hover) */
      if (hoverable) {
        var hoverTimer = null;
        p.addEventListener('mouseenter', function () {
          if (!isWide()) { return; }
          clearTimeout(hoverTimer);
          hoverTimer = setTimeout(function () {
            hoverTimer = null;
            var openBody = $('.accordion__panel.is-open .accordion__body', acc);
            if (openBody && openBody.contains(document.activeElement)) { return; }
            /* old Safari throws on the :focus-visible pseudo-class: a throw counts as "not keyboard focus" */
            var keyboardFocus = false;
            try { keyboardFocus = acc.contains(document.activeElement) && document.activeElement.matches(':focus-visible'); } catch (err) { keyboardFocus = false; }
            if (keyboardFocus) { return; }
            open(p);
          }, 120);
        });
        p.addEventListener('mouseleave', function () { clearTimeout(hoverTimer); hoverTimer = null; });
      }
      /* keyboard: click / Enter / Space only (focus alone opens nothing; the :has() ring on the panel shows where focus is) */
      if (btn) {
        btn.addEventListener('click', function () { if (isWide()) { open(p); } });
      }
    });
    var syncMobile = function () {
      var mobile = !isWide();
      panels.forEach(function (p) {
        var btn = $('.accordion__trigger', p);
        var content = $('.accordion__body', p);
        var visible = mobile || p.classList.contains('is-open');
        if (!mobile && content && content.contains(document.activeElement)) { open(p); visible = true; }
        setBodyShown(content, visible);
        if (!btn) { return; }
        btn.hidden = mobile;
        if (mobile) { btn.setAttribute('aria-expanded', 'true'); }
        else { btn.setAttribute('aria-expanded', p.classList.contains('is-open') ? 'true' : 'false'); }
      });
      refreshTriggers();
    };
    /* the native "Read more": closed at start on every width (the summary stays visible; a reader opens the one they want) */
    var syncRead = function () {
      panels.forEach(function (p) {
        var d = $('.accordion__read', p);
        if (d) { d.open = false; }
      });
    };
    /* the tallest expanded body at the open panel's width (flex 5 of 5+(n-1), minus the 8px gaps) -> --acc-min.
       Batched: every measuring style is written first, then every height is read, then every style is restored
       (one layout, not one per panel) */
    var bodies = panels.map(function (p) { return $('.accordion__body', p); }).filter(Boolean);
    var reserveHeight = function () {
      if (!isWide()) { acc.style.removeProperty('--acc-min'); return; }
      var n = panels.length;
      var gap = parseFloat(getComputedStyle(acc).columnGap) || 8;
      var openW = Math.max(0, (acc.clientWidth - gap * (n - 1)) * 5 / (n + 4));
      var saved = bodies.map(function (b) { return b.getAttribute('style'); });
      bodies.forEach(function (b) {
        b.style.cssText = 'position:absolute;inset:auto;left:0;top:0;width:' + openW + 'px;height:auto;min-height:0;visibility:hidden;opacity:0;transition:none';
      });
      var tallest = bodies.reduce(function (m, b) { return Math.max(m, b.scrollHeight); }, 0);
      bodies.forEach(function (b, i) {
        if (saved[i] === null) { b.removeAttribute('style'); } else { b.setAttribute('style', saved[i]); }
      });
      if (tallest) { acc.style.setProperty('--acc-min', tallest + 'px'); }
    };
    var reserveTimer = null;
    var reserveSoon = function () { clearTimeout(reserveTimer); reserveTimer = setTimeout(function () { reserveHeight(); refreshTriggers(); }, 120); };
    syncMobile();
    syncRead();
    reserveHeight();
    onMQ(wideQuery, function () { syncMobile(); reserveSoon(); });
    /* height-only resizes (the mobile URL bar) change no body width: only a width change re-measures */
    var lastWidth = window.innerWidth;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastWidth) { return; }
      lastWidth = window.innerWidth;
      reserveSoon();
    }, { passive: true });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(reserveSoon); }
    window.addEventListener('load', reserveSoon, { once: true });
  });
  html.classList.add('site-ready');

  /* ---------------------------------------------------------
     Inquiry form. First, before any other form logic and with or
     without fetch: the invalid-field handler (a field that fails
     validation inside the optional <details> opens it, so the
     browser can show the message); only once it is installed does
     the <details> close (the HTML renders it open for no-JS users).
     Then: posts to Formspree with fetch when available; 12 s
     AbortController timeout; entered values stay on every error
     (timeout included); on success the form is reset only if its
     values still match the submitted snapshot (edits made while
     the request was pending are kept); the submit button is
     restored in finally; the aria-live region reports success /
     error. Without fetch the form submits normally.
     --------------------------------------------------------- */
  var form = $('.form[data-ajax]');
  if (form) {
    form.addEventListener('invalid', function (e) {
      var more = e.target && e.target.closest ? e.target.closest('details') : null;
      if (more && !more.open) { more.open = true; }
    }, true);
    $$('.form__more', form).forEach(function (more) { more.open = false; });
  }
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
    /* the form's values as one string (no file fields here): compared before the reset after a successful send */
    var snapshot = function () {
      try { return new URLSearchParams(new FormData(form)).toString(); } catch (err) { return null; }
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (/FORMSPREE_ID/.test(form.action)) {
        say('error', 'Online inquiries are not connected yet. Your entries are still here. Please', true);
        if (status) { status.focus(); }
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
      var sent = snapshot();
      var options = { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } };
      if (controller) { options.signal = controller.signal; }
      var request = Promise.race([timeout, Promise.resolve().then(function () { return fetch(form.action, options); })])
        .then(function (r) { if (!r.ok) { throw new Error('bad status'); } })
        .then(function () {
          say('ok', 'Thank you. Your message is on its way; we reply within one business day.');
          /* reset only what was sent: an edit made while the request was pending stays in place */
          if (sent !== null && snapshot() === sent) { form.reset(); }
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
     MOTION. initMotion() builds every tween inside ONE
     gsap.context() (motionCtx) and returns true; killMotion()
     reverts that context (every tween and ScrollTrigger this
     file made, and the inline styles they wrote) and shows
     everything, touching nothing another component may add to
     GSAP later. The "Pause motion / Play motion" button and the
     reduced-motion media query call these.
     ========================================================= */
  var motionOn = false;
  var motionCtx = null;
  var leafTweens = [];
  /* the IntersectionObservers that pause / resume the desktop leaf loops off screen (block 8) */
  var leafObservers = [];
  var disconnectLeafObservers = function () {
    leafObservers.forEach(function (o) { o.disconnect(); });
    leafObservers = [];
  };
  /* the once-only reveal tweens with their trigger elements (block 9), for settleReveals() */
  var revealTweens = [];
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
      /* ignoreMobileResize: the iOS address-bar collapse fires resize; the hero and trunk scrubs read vh(), so a refresh there would jump the logo */
      ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true });
      html.classList.add('anim-ready');
      html.classList.add('motion');
      html.classList.remove('reduced');
      /* the context exists before buildTweens() runs, so a throw midway still leaves killMotion() something to revert
         (gsap.context() needs a function: without one it returns the current context, i.e. none) */
      motionCtx = gsap.context(function () {});
      motionCtx.add(buildTweens);
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
      /* revert() kills every tween / ScrollTrigger recorded in the context and restores the inline styles each
         target had before (authored inline styles stay); other GSAP users on the page are untouched */
      if (motionCtx) { motionCtx.revert(); motionCtx = null; }
      disconnectLeafObservers();
      leafTweens = [];
      revealTweens = [];
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
        .to('.hero__tag', { opacity: 0, ease: 'none', duration: 0.35 }, 0);
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
       6. (gone, round 9) The teaser's gold line is the same
          .kashida-draw as under the statement: block 4 draws it.
       ------------------------------------------------------- */

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
    revealTweens = [];
    var reveal = function (el, targets, vars) {
      vars.scrollTrigger = { trigger: el, start: 'top 88%', once: true };
      revealTweens.push({ el: el, tween: gsap.to(targets, vars) });
    };
    $$('.reveal').forEach(function (el) {
      if (seen(el)) { gsap.set(el, { opacity: 1, y: 0 }); return; }
      reveal(el, el, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' });
    });
    $$('.reveal-img').forEach(function (el) {
      if (seen(el)) { gsap.set(el, { scale: 1 }); return; }
      reveal(el, el, { scale: 1, duration: 1.2, ease: 'power2.out' });
    });
    $$('.stagger').forEach(function (group) {
      if (seen(group)) { gsap.set(group.children, { opacity: 1, y: 0 }); return; }
      reveal(group, group.children, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.08 });
    });
  }

  /* -------------------------------------------------------
     8. Floating leaves (two places): desktop runs the slow
        yoyo drift loop, paused while its leaf is off screen
        (IntersectionObserver) and resumed when it is back;
        phones get the scroll-scrub drift instead. Never both:
        the same `y` is driven once, and relative (+=) so a CSS
        translate on the leaf is kept. Crossing the 769px
        breakpoint kills the old tweens (and their triggers and
        observers) and builds the other kind, inside motionCtx so
        a later killMotion() reverts them too (the reduced-motion
        cleanup is unchanged).
     ------------------------------------------------------- */
  function killLeaves() {
    disconnectLeafObservers();
    leafTweens.forEach(function (t) { t.revert(); });
    leafTweens = [];
  }
  function buildLeaves() {
    killLeaves();
    $$('.leaf').forEach(function (leaf, i) {
      if (isDesktop()) {
        var drift = gsap.to(leaf, { y: '+=' + (18 + i * 6), x: '+=' + (i % 2 ? -10 : 10), rotation: '+=' + (i % 2 ? -3 : 3), duration: 6 + i * 1.5, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
        leafTweens.push(drift);
        /* the loop only runs while the leaf is in (or within 10% of) the viewport */
        if ('IntersectionObserver' in window) {
          var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) { if (en.isIntersecting) { drift.play(); } else { drift.pause(); } });
          }, { rootMargin: '10% 0px' });
          io.observe(leaf);
          leafObservers.push(io);
        } else { drift.play(); }
      } else {
        leafTweens.push(gsap.to(leaf, { y: '+=' + (40 + i * 10), ease: 'none', scrollTrigger: { trigger: leaf.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
      }
    });
  }
  onMQ(desktopQuery, function () { if (motionOn && motionCtx) { motionCtx.add(buildLeaves); } });

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
    if (heroVideo) { if (!videoLoaded) { loadHeroVideo(); } else if (heroVideo.getBoundingClientRect().bottom > 0) { playVideo(); } }
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
