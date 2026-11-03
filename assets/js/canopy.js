/* =========================================================
   Anar Events — canopy.js (branch `canopy`, home page only; loaded after site.js)
   The motion of the one tall tree. site.js owns GSAP + ScrollTrigger + Lenis,
   the "Pause motion" button and the reduced-motion handling: it adds html.motion
   when its tweens are live and removes it when they are killed. This file watches
   that class and builds / reverts its own gsap.context() in step, so the Pause
   button and prefers-reduced-motion stop everything here too. Nothing in this
   file is required for the page to read, and nothing here changes the page's
   geometry: every layer and offset is laid out by canopy.css, so Pause / Play
   moves no content. html.canopy-ready is present exactly while the context is
   live (the CSS hides .hero__rise only under it, so a blocked or failed file
   never hides the logo).
     1. parallax (desktop only): the tree layer moves at 0.9× scroll from the end
        of screen 2 on (screens 1–2 stay registered with the statement; the band
        under the ground absorbs the drift)
     2. the layered canopy: four tonal slices parallaxed past each other over
        the hero (×0.97 / .985 / 1 / 1.02 of the scroll), swayed about their
        top (L1 ±0.2° / 11 s, L2 ±0.3° / 8 s, L3 ±0.45° / 6 s) and bounced on
        every scroll move (a spring, −6 / −9 / −12px, one timeline restarted
        per kick, ≤ 1 per 120 ms); two shrub sprigs ±0.3° about their base
        (9 s / 11 s); all paused off screen and reverted on Pause
     3. the hero, owned here (site.js block 1 skips a hero inside main.canopy):
        the mark drifts down a little and .hero__fade goes to 0, the fade finished
        before the drifted text bounds reach the canopy's centre (art row 297,
        measured on every refresh); the video deepens to cypress over screen 1 and
        is hidden once screen 1 has scrolled past (site.js then pauses it), shown
        again on the way back
     4. the falling pomegranate (scrub, 1.6 screens, 140°, fades in the last 10 %;
        desktop only, the sprite is display:none on phones) and the fallen one
        rolling into place on the ground
     5. the ground rising 40px into place; the logo + line rising on load
     6. the logo morph: the hero logo travels up and shrinks into the centre
        of the header bar over the first 70 % of the hero and docks there
        (one ScrollTrigger; html.logo-morphing / html.logo-docked)
   Leaves (.leaf), kashida draws (.kashida-draw) and reveals (.reveal / .stagger)
   are site.js blocks 8, 4 and 9.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var main = document.querySelector('main.canopy');
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (!main || !hasGsap) { return; }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var vh = function () { return window.innerHeight; };
  var phoneQuery = window.matchMedia('(max-width: 768px)');
  var isPhone = function () { return phoneQuery.matches; };
  var shown = function (el) { return !!el && getComputedStyle(el).display !== 'none'; };

  var tree = $('.tree', main);
  var canopy = $('.tree__canopy', main);
  var sprigL = $('.tree__sprig--l', main);
  var sprigR = $('.tree__sprig--r', main);
  var hero = $('.hero', main);
  var heroBg = $('.hero__bg', main);
  var deepen = $('.hero__deepen', main);
  var mark = $('.hero__mark', main);
  var rise = $('.hero__rise', main);
  var fade = $('.hero__fade', main);
  var stmt = $('.screen--statement', main);
  var drop = $('.fruit-drop', main);
  var ground = $('.ground-art', main);
  var roll = $('.fruit-roll', main);
  var treeImg = $('.tree__canopy img', main);
  /* the logo morph (block 6): the fixed copy, the hero's own logo and the header slot's img */
  var morph = $('.logo-morph');
  var morphImg = morph ? $('img', morph) : null;
  var heroLogo = $('.hero__logo img', main);
  var navImg = $('.site-header .nav-home img');

  var ctx = null;
  var observers = [];
  var on = false;
  var failed = false;
  var risen = false;
  /* the scroll bounce of the canopy layers: ONE reusable timeline (built in buildAll, inside the context) and the
     time of the last kick live here so kill() can reset them */
  var bounceTl = null;
  var lastBounce = 0;
  /* the last global ScrollTrigger.refresh() (site.js refreshes in initMotion, on load and when the fonts land):
     build() skips its own when one has just run, since triggers measure themselves on creation */
  var lastRefresh = 0;
  ScrollTrigger.addEventListener('refresh', function () { lastRefresh = Date.now(); });
  var refreshUnlessFresh = function () {
    if (Date.now() - lastRefresh > 100) { ScrollTrigger.refresh(); }
  };

  /* a looping tween that only runs while its element is on screen (same device as the site.js leaves) */
  function loopInView(el, tween) {
    tween.pause();
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { tween.play(); } else { tween.pause(); } });
      }, { rootMargin: '10% 0px' });
      io.observe(el);
      observers.push(io);
    } else { tween.play(); }
  }

  /* the scroll position where the parallax begins: the statement's bottom reaching the viewport bottom, i.e. its
     column (one viewport minus the header tall) sitting exactly under the bar, the screen-2 composition reached */
  function parallaxStart() {
    if (!stmt) { return 0; }
    var top = stmt.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || 0);
    return Math.max(0, Math.round(top + stmt.offsetHeight - vh()));
  }

  /* one art pixel in CSS px (canopy.css --s), from the tree layer's rendered width */
  function artPx() { return (tree ? tree.offsetWidth : window.innerWidth) / 1536; }

  /* the hero's clearance: page px between the bottom of the mark's text (untransformed; offsets ignore transforms)
     and the canopy's centre limit, art row 297, the first foliage inside the logo's column (x 376–1160). Screens
     1–2 are never parallaxed, so the tree's CSS offset is its page position */
  function heroClearance() {
    if (!tree || !hero || !mark) { return 0; }
    var limit = tree.offsetTop + 297 * artPx();
    var markBottom = hero.offsetTop + mark.offsetTop + mark.offsetHeight;
    return Math.max(0, limit - markBottom);
  }
  /* the fade runs over FADE_FROM..FADE_TO of the hero's height; the drift is sized so that, at FADE_TO, the drifted
     mark has used at most the clearance less a 16px reserve (the fade is complete strictly before the bounds touch
     the foliage): drift = min(DRIFT_MAX, (clearance − 16) / FADE_TO) × hero height. With no clearance there is no
     drift at all (the fade alone). Measured at 1440×900: clearance 43px, drift 60px, the fade gone at 405px of scroll */
  var FADE_FROM = 0.1, FADE_TO = 0.45, DRIFT_MAX = 0.35, RESERVE = 16;
  function heroDrift() {
    var h = hero ? hero.offsetHeight : vh();
    var k = Math.min(DRIFT_MAX, Math.max(0, heroClearance() - RESERVE) / (FADE_TO * h));
    return Math.round(k * h);
  }

  function buildAll() {
    /* 1. parallax, desktop only (on phones the layer is the page height × 110vw: promoting it costs memory and jank for
          a drift nobody reads at 390px): y = 0.1 × (scrollY − start) from the end of screen 2 to the bottom of the page */
    if (tree && !isPhone()) {
      gsap.to(tree, {
        y: function () { return 0.1 * Math.max(0, ScrollTrigger.maxScroll(window) - parallaxStart()); },
        ease: 'none',
        scrollTrigger: { start: parallaxStart, end: 'max', scrub: true, invalidateOnRefresh: true }
      });
    }
    /* 2. the layered canopy (four tonal slices, .tree__layer--0..3; the static junction bark sits above them in CSS,
          so nothing here moves a trunk). Three motions per layer, on two elements so no property is driven twice:
          a. parallax: the outer div's y = (1 − m) × the page scroll over the hero (L0 ×0.97, L1 ×0.985, L2 ×1, L3
             ×1.02 of the scroll), scrubbed from the top of the page to the hero's bottom and held after it, so the
             layers slide a few px past each other while the canopy rises (27 / 13 / 0 / −18px at 1440×900);
          b. sway: the outer div rotates about its top centre (L1 ±0.2° / 11 s, L2 ±0.3° / 8 s, L3 ±0.45° / 6 s, yoyo
             sine; L0 still), paused off screen;
          c. bounce: on every scroll update with |velocity| > 300 px/s the imgs spring up (−6 / −9 / −12px for L1 / L2
             / L3, half on phones) and settle (elastic.out(1, .4), 1.2 s, 40 ms stagger): ONE timeline, built here in
             the context and restarted per kick, at most once per 120 ms (overwrite: auto on the tweens) */
    var layers = $$('.tree__layer', main);
    if (canopy && layers.length === 4) {
      var mult = [0.97, 0.985, 1, 1.02];
      var sway = [null, [0.2, 5.5], [0.3, 4], [0.45, 3]];
      var amp = isPhone() ? [0, 3, 4.5, 6] : [0, 6, 9, 12];
      var layerImgs = layers.map(function (l) { return $('img', l); });
      /* a. parallax, applied directly from the trigger's scroll (no tween, so the layers track the page exactly) */
      var applyParallax = function (self) {
        var s = Math.max(0, Math.min(self.scroll(), hero ? hero.offsetHeight : vh()));
        layers.forEach(function (l, i) { gsap.set(l, { y: Math.round((1 - mult[i]) * s * 10) / 10 }); });
      };
      ScrollTrigger.create({
        trigger: hero, start: 'top top', end: 'bottom top', invalidateOnRefresh: true,
        onUpdate: applyParallax, onRefresh: applyParallax
      });
      /* b. sway */
      layers.forEach(function (l, i) {
        if (!sway[i]) { return; }
        loopInView(l, gsap.fromTo(l, { rotation: -sway[i][0] }, { rotation: sway[i][0], duration: sway[i][1], ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      });
      /* c. bounce */
      bounceTl = gsap.timeline({ paused: true });
      layerImgs.forEach(function (img, i) {
        if (!amp[i] || !img) { return; }
        bounceTl.fromTo(img, { y: -amp[i] }, { y: 0, duration: 1.2, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' }, (i - 1) * 0.04);
      });
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: function (self) {
          if (!bounceTl) { return; }
          var now = Date.now();
          if (Math.abs(self.getVelocity()) < 300 || now - lastBounce < 120) { return; }
          var r = canopy.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh()) { return; }
          lastBounce = now;
          bounceTl.restart();
        }
      });
    }

    /* each shrub ±0.3° about the bottom of its crop at the trunk edge (9 s / 11 s: the tips move ~2px, the cut edges
       stay still) */
    if (shown(sprigL)) {
      loopInView(sprigL, gsap.fromTo(sprigL, { rotation: -0.3 }, { rotation: 0.3, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    }
    if (shown(sprigR)) {
      loopInView(sprigR, gsap.fromTo(sprigR, { rotation: 0.3 }, { rotation: -0.3, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    }

    /* 3. the hero, scrubbed over its own height: the mark drifts down by heroDrift() (depth: it rises slower than the
          page), the logo, line and tag fade 1 -> 0 between 10 % and 45 % of the hero, and by 45 % the drift has used
          at most the measured clearance, so no text is ever over the foliage; the video deepens to cypress meanwhile.
          Every value is a function: a refresh (resize, fonts, the tree image landing) re-measures */
    if (hero && mark && fade) {
      var heroTl = gsap.timeline({
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
      heroTl.fromTo(mark, { y: 0 }, { y: heroDrift, ease: 'none', duration: 1 }, 0)
        .fromTo(fade, { opacity: 1 }, { opacity: 0, ease: 'none', duration: FADE_TO - FADE_FROM }, FADE_FROM);
      if (deepen) { heroTl.fromTo(deepen, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 1 }, 0); }
    }
    /* the fixed video: gone once screen 1 has scrolled past (deepened to cypress by then; display:none makes its
       IntersectionObserver pause the file), back on the way up */
    if (hero && heroBg) {
      var syncBg = function (st) { heroBg.classList.toggle('is-gone', st.progress >= 1); };
      ScrollTrigger.create({
        trigger: hero, start: 'top top', end: 'bottom top',
        onToggle: syncBg, onRefresh: syncBg, onUpdate: syncBg
      });
    }

    /* 4a. the falling pomegranate (desktop: the sprite is display:none on phones): from its branch, 1.6 screens down
           over 0.8 screens of scroll once it has reached 40% of the viewport, 140° of spin, a slight drift right,
           fading out in the last 10 % */
    if (shown(drop)) {
      gsap.timeline({
        scrollTrigger: { trigger: drop, start: 'top 40%', end: function () { return '+=' + Math.round(vh() * 0.8); }, scrub: true, invalidateOnRefresh: true }
      })
        .fromTo(drop, { y: 0, x: 0, rotation: 0 }, {
          y: function () { return vh() * 1.6; },
          x: function () { return isPhone() ? -30 : 30; },
          rotation: 140, ease: 'power2.in', duration: 1
        }, 0)
        .fromTo(drop, { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.1 }, 0.9);
    }

    /* 4b. the fallen fruit rolls into place on the moss as the ground arrives; 5. the ground rises 40px */
    if (ground) {
      gsap.fromTo(ground, { y: 40 }, {
        y: 0, ease: 'none',
        scrollTrigger: { trigger: ground, start: 'top bottom', end: 'top 55%', scrub: true, invalidateOnRefresh: true }
      });
      if (roll) {
        gsap.fromTo(roll, { x: -70, rotation: -220 }, {
          x: 0, rotation: 0, ease: 'power2.out',
          scrollTrigger: { trigger: ground, start: 'top 95%', end: 'top 40%', scrub: true, invalidateOnRefresh: true }
        });
      }
    }

    /* 6. the logo morph: the hero logo travels up and shrinks into the centre of the header bar over the first 70 % of
          the hero's height, and docks there. ONE ScrollTrigger (no tween: progress is applied directly, so the copy
          tracks the page pixel for pixel). A = the hero logo's untransformed page rect, summed up the offsetParent
          chain (the mark's drift / rise transforms ignored; its translateX(-50%) taken off); B = the header slot's
          img rect (fixed, so viewport = page). At progress p the fixed copy sits at lerp(A in the viewport, B, p) with
          scale lerp(1, B.w / A.w, p) about its top-left corner; at p = 0 the hero's own logo shows, between the ends
          the copy (html.logo-morphing hides the hero img), at p = 1 the header logo (html.logo-docked) in the same
          place. Re-measured on every refresh (resize, fonts) */
    if (morph && morphImg && heroLogo && navImg && hero) {
      var A = null, B = null;
      var measureMorph = function () {
        var el = heroLogo, left = 0, top = 0;
        while (el && el !== main) { left += el.offsetLeft; top += el.offsetTop; el = el.offsetParent; }
        left -= mark.offsetWidth / 2;
        A = { left: left + main.offsetLeft, top: top + main.offsetTop, w: heroLogo.offsetWidth };
        var r = navImg.getBoundingClientRect();
        B = { left: r.left, top: r.top, w: r.width };
        gsap.set(morphImg, { width: A.w });
      };
      var applyMorph = function (self) {
        if (!A || !B) { return; }
        var p = self.progress;
        /* a straight line in the viewport from the hero logo's rect (where the hero logo is at scroll 0) to the slot:
           the logo rises slower than the page (the line and the tag scroll away beneath it) and never overshoots the bar */
        gsap.set(morph, {
          x: A.left + (B.left - A.left) * p,
          y: A.top + (B.top - A.top) * p,
          scale: 1 + (B.w / A.w - 1) * p
        });
        html.classList.toggle('logo-morphing', p > 0 && p < 1);
        html.classList.toggle('logo-docked', p >= 1);
      };
      measureMorph();
      ScrollTrigger.create({
        trigger: hero, start: 'top top', end: function () { return '+=' + Math.round(hero.offsetHeight * 0.7); },
        onRefreshInit: measureMorph, onRefresh: applyMorph, onUpdate: applyMorph
      });
    }

    /* 5. the logo + line rise on load, once per page. The CSS holds .hero__rise at opacity 0 only under
          html.canopy-ready (added by build() with this context), and this fromTo sets the same start inside the
          context, so nothing paints and then snaps back and a revert restores the visible default; a rebuild (Play
          after Pause, the breakpoint change) just shows it */
    if (rise) {
      if (!risen) {
        risen = true;
        gsap.fromTo(rise, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', delay: 0.1 });
      } else {
        gsap.set(rise, { opacity: 1, y: 0 });
      }
    }
  }

  function build() {
    if (on || failed) { return; }
    on = true;
    html.classList.add('canopy-motion');
    /* the context exists before anything is built, so a throw midway leaves kill() something to revert; the
       canopy-ready key (the only thing that hides .hero__rise) is added with it and removed with it */
    ctx = gsap.context(function () {});
    html.classList.add('canopy-ready');
    try {
      ctx.add(buildAll);
    } catch (err) {
      failed = true;
      kill();
      if (rise) { rise.style.opacity = '1'; rise.style.transform = 'none'; }
      if (window.console) { console.warn('Anar canopy motion disabled:', err); }
      return;
    }
    /* the triggers above measured themselves on creation; a global refresh only if site.js has not just run one */
    refreshUnlessFresh();
  }

  function kill() {
    if (!on) { return; }
    on = false;
    try { if (ctx) { ctx.revert(); ctx = null; } } catch (e) { /* ignore */ }
    observers.forEach(function (o) { o.disconnect(); });
    observers = [];
    bounceTl = null; lastBounce = 0;
    html.classList.remove('canopy-motion');
    html.classList.remove('canopy-ready');
    html.classList.remove('logo-morphing');
    html.classList.remove('logo-docked');
    if (heroBg) { heroBg.classList.remove('is-gone'); }
    /* the triggers that remain (site.js, still live on a breakpoint rebuild) re-measure after the revert */
    if (html.classList.contains('motion')) { ScrollTrigger.refresh(); }
  }

  /* follow site.js: html.motion present = its tweens are live (initMotion), absent = killed (Pause, reduced motion).
     The observer fires for this file's own class changes too (canopy-motion / canopy-ready): sync() then finds
     nothing to do, since it compares html.motion with `on` only */
  function sync() {
    var want = html.classList.contains('motion');
    if (want && !on) { build(); } else if (!want && on) { kill(); }
  }
  if ('MutationObserver' in window) {
    new MutationObserver(sync).observe(html, { attributes: true, attributeFilter: ['class'] });
  }
  sync();

  /* the tree image landing after the first layout changes nothing in flow (the layers are sized by CSS), but the
     ScrollTrigger positions of the fruit and the ground are re-measured to be safe */
  if (treeImg && !treeImg.complete) {
    treeImg.addEventListener('load', function () { if (on) { refreshUnlessFresh(); } }, { once: true });
  }
  /* the phone / desktop layers differ (no sprigs, no falling fruit, no parallax, 110vw): rebuild on the breakpoint change */
  var onMQ = function (mq, fn) {
    if (mq.addEventListener) { mq.addEventListener('change', fn); } else if (mq.addListener) { mq.addListener(fn); }
  };
  onMQ(phoneQuery, function () { if (on) { kill(); sync(); } });
})();
