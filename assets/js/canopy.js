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
        the hero (×0.985 / .993 / 1 / 1.008 of the scroll, the spread between
        the first and the last capped at 8px), swayed about their top (L1
        ±0.2° / 11 s, L2 ±0.3° / 8 s, L3 ±0.45° / 6 s) and nudged on a fast
        scroll move (from the current y to −4 / −6 / −8px, then a soft settle,
        a fresh timeline per kick, |velocity| > 900, ≤ 1 per 400 ms); two
        shrub sprigs ±0.3° about their base (9 s / 11 s); all paused off
        screen and reverted on Pause
     3. the hero, owned here (site.js block 1 skips a hero inside main.canopy):
        the mark drifts down a little; .hero__text (the descriptor + the tag
        pair) goes to 0 over the first px of scroll, complete before the morphing
        logo's box (block 6) reaches the text's top (the cross point is solved
        from the measured rects on every refresh); .hero__fade (the halo and the
        hero's own logo) goes to 0 between 10 % and 45 %, finished before the
        drifted bounds reach the canopy's centre (art row 297, measured); the
        video deepens to cypress by 80 % of screen 1 and is hidden once screen 1
        has scrolled past (site.js then pauses it), shown again on the way back
     4. the falling pomegranate (scrub, 1.6 screens, 40° of spin, fades in the
        last 10 %; desktop only, the sprite is display:none on phones) and the
        fallen one nudged 30° into place on the ground
     5. the ground rising 40px into place; the logo + line rising on load
     6. the logo morph (built before 3, which reads its measurement): the hero
        logo travels up and shrinks into the centre of the header bar over the
        first 70 % of the hero (eased out: it moves fastest first, so the text
        scrolling up under it meets its box as late as possible) and docks
        there (one ScrollTrigger; html.logo-morphing / html.logo-docked)
   fitHero() (no motion, no vendor needed: it runs whenever main.canopy
   exists): the mark's rendered height is written to --hero-content on main,
   so canopy.css can size the hero to the real text (short phones: nothing
   under the fixed bar, nothing in the foliage).
   Leaves (.leaf), kashida draws (.kashida-draw) and reveals (.reveal / .stagger)
   are site.js blocks 8, 4 and 9.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var main = document.querySelector('main.canopy');
  if (!main) { return; }
  /* GSAP + ScrollTrigger gate the MOTION only (below, after fitHero): the clearance measurement runs without them */
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

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
  var text = $('.hero__text', main);
  var header = $('.site-header');
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
  /* the scroll bounce of the canopy layers: the live kick timeline, the kick function and the bounced imgs (set in
     buildAll; the timeline is built per kick, outside the context, so kill() kills it and clears the imgs), the time
     of the last kick and the canopy's in-view flag (written by an IntersectionObserver, never measured per frame)
     live here so kill() can reset them */
  var bounceTl = null;
  var kickBounce = null;
  var bounceImgs = [];
  var lastBounce = 0;
  var canopyInView = false;

  /* the mark's rendered content height (logo + descriptor + tag pair; the halo is absolute and not counted) goes to
     --hero-content on main, so the CSS hero height reserves the real text: short phones (390×700, 360×640) and
     enlarged text get a taller hero instead of text under the fixed bar. Independent of the motion AND of the vendors
     (round 6: it runs whenever main.canopy exists, under Pause, reduced motion and a failed GSAP request alike);
     re-measured on resize, when the fonts land and on load. The hero's height does not feed back into the mark's
     height (its width is viewport-based), so the write never loops */
  var fitTimer = null;
  function fitHero() {
    if (!mark) { return; }
    var h = mark.offsetHeight;
    if (!h) { return; }
    var next = h + 'px';
    if (main.style.getPropertyValue('--hero-content') === next) { return; }
    main.style.setProperty('--hero-content', next);
    if (on && hasGsap) { ScrollTrigger.refresh(); }
  }
  fitHero();
  window.addEventListener('resize', function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitHero, 120);
  }, { passive: true });
  window.addEventListener('load', fitHero);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(fitHero); }

  /* ---- everything from here on is the motion: nothing without GSAP + ScrollTrigger ---- */
  if (!hasGsap) { return; }

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
  /* the halo + logo fade runs over FADE_FROM..FADE_TO of the hero's height; the drift is sized so that, at FADE_TO,
     the drifted mark has used at most the clearance less a 16px reserve (every fade is complete strictly before the
     bounds touch the foliage): drift = min(DRIFT_MAX, (clearance − 16) / FADE_TO) × hero height. With no clearance
     there is no drift at all. Measured at 1440×900: clearance 43px, drift 60px, the halo gone at 405px of scroll */
  var FADE_FROM = 0.1, FADE_TO = 0.45, DRIFT_MAX = 0.35, RESERVE = 16;
  /* the morph: over the first MORPH_END of the hero's height, eased (power2.out: q = 1 − (1 − p)²) */
  var MORPH_END = 0.7;
  var morphEase = function (p) { return 1 - (1 - p) * (1 - p); };
  function heroDrift() {
    var h = hero ? hero.offsetHeight : vh();
    var k = Math.min(DRIFT_MAX, Math.max(0, heroClearance() - RESERVE) / (FADE_TO * h));
    return Math.round(k * h);
  }
  /* an element's page top, summed up the offsetParent chain to main (transforms ignored: the untransformed box) */
  function pageTop(el) {
    var top = 0;
    while (el && el !== main) { top += el.offsetTop; el = el.offsetParent; }
    return top + main.offsetTop;
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
          a. parallax: the outer div's y = (1 − m) × the page scroll over the hero (L0 ×0.985, L1 ×0.993, L2 ×1, L3
             ×1.008 of the scroll), scrubbed from the top of the page to the hero's bottom and held after it, and the
             spread between L0 and L3 capped at 8px (every offset scaled down together past that), so the layers slide
             a few px past each other while the canopy rises and never drift far enough to read as a second copy
             (5.2 / 2.4 / 0 / −2.8px at 1440×900); written with gsap.quickSetter (no per-frame tween lookup);
          b. sway: the outer div rotates about its top centre (L1 ±0.2° / 11 s, L2 ±0.3° / 8 s, L3 ±0.45° / 6 s, yoyo
             sine; L0 still), paused off screen;
          c. bounce: on a scroll update with |velocity| > 900 px/s while the canopy is on screen (the in-view flag comes
             from an IntersectionObserver, not a per-frame layout read) the imgs lift (−4 / −6 / −8px for L1 / L2 / L3,
             2 / 3 / 4 on phones) from wherever they are and come back: a 1px undershoot, then a soft sine settle to
             0 (no elastic overshoot), 40 ms stagger, at most once per 400 ms */
    var layers = $$('.tree__layer', main);
    if (canopy && layers.length === 4) {
      var mult = [0.985, 0.993, 1, 1.008];
      var SPREAD_MAX = 8;
      var sway = [null, [0.2, 5.5], [0.3, 4], [0.45, 3]];
      var amp = isPhone() ? [0, 2, 3, 4] : [0, 4, 6, 8];
      var layerImgs = layers.map(function (l) { return $('img', l); });
      /* a. parallax, applied directly from the trigger's scroll (no tween, so the layers track the page exactly) */
      var setY = layers.map(function (l) { return gsap.quickSetter(l, 'y', 'px'); });
      var applyParallax = function (self) {
        var s = Math.max(0, Math.min(self.scroll(), hero ? hero.offsetHeight : vh()));
        var spread = (mult[3] - mult[0]) * s;
        var k = spread > SPREAD_MAX ? SPREAD_MAX / spread : 1;
        for (var i = 0; i < 4; i++) { setY[i](Math.round((1 - mult[i]) * s * k * 10) / 10); }
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
      /* c. bounce (round 7): each kick glides from the img's CURRENT y up to the offset (.2 s, power2.out), back to a 1px
         undershoot (.4 s) and settles to 0 (.5 s); no instantaneous jump to −amp, also when a kick lands mid-bounce.
         A fresh timeline of .to() tweens per kick (each tween reads its start when the playhead reaches it), the
         previous one killed first; built from a ScrollTrigger callback, i.e. outside the context, so kill() kills
         the live one and clears the imgs' transform itself */
      bounceImgs = layerImgs.filter(function (img, i) { return !!img && !!amp[i]; });
      kickBounce = function () {
        if (bounceTl) { bounceTl.kill(); }
        bounceTl = gsap.timeline();
        layerImgs.forEach(function (img, i) {
          if (!amp[i] || !img) { return; }
          var at = (i - 1) * 0.04;
          bounceTl.to(img, { y: -amp[i], duration: 0.2, ease: 'power2.out' }, at)
            .to(img, { y: 1, duration: 0.4, ease: 'sine.inOut' }, at + 0.2)
            .to(img, { y: 0, duration: 0.5, ease: 'sine.inOut' }, at + 0.6);
        });
      };
      canopyInView = false;
      if ('IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { canopyInView = en.isIntersecting; });
        });
        cio.observe(canopy);
        observers.push(cio);
      } else { canopyInView = true; }
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: function (self) {
          if (!kickBounce || !canopyInView) { return; }
          var now = Date.now();
          if (Math.abs(self.getVelocity()) < 900 || now - lastBounce < 400) { return; }
          lastBounce = now;
          kickBounce();
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

    /* the morph geometry (block 6), measured ONCE per refresh by the morph trigger's onRefreshInit (a global
       "refreshInit" listener: every onRefreshInit fires before any trigger re-measures, and the create-time refresh
       calls it too), so block 3 can solve the text's cross point against it without a second measurement (round 6:
       measureMorph() inside the text trigger's end walked the offsetParent chain and toggled .is-measuring twice per
       refresh, two forced layouts for one measurement). A = the hero logo's untransformed page rect, summed up the
       offsetParent chain (the mark's drift / rise transforms ignored; its translateX(-50%) taken off); B = the header
       slot's img rect (fixed, so viewport = page), read with the bar's transitions disabled (.is-measuring) so a
       mid-transition frame can never be captured. The copy's img is sized by a plain style write (no callback-driven
       gsap.set outside the context); kill() clears it */
    var A = null, B = null;
    var canMorph = !!(morph && morphImg && heroLogo && navImg && hero && mark);
    var measureMorph = function () {
      if (!canMorph) { return; }
      var el = heroLogo, left = 0, top = 0;
      while (el && el !== main) { left += el.offsetLeft; top += el.offsetTop; el = el.offsetParent; }
      left -= mark.offsetWidth / 2;
      A = { left: left + main.offsetLeft, top: top + main.offsetTop, w: heroLogo.offsetWidth, h: heroLogo.offsetHeight };
      if (header) { header.classList.add('is-measuring'); }
      var r = navImg.getBoundingClientRect();
      if (header) { header.classList.remove('is-measuring'); }
      B = { left: r.left, top: r.top, w: r.width };
      morphImg.style.width = A.w + 'px';
    };

    /* 6. the logo morph, created BEFORE the hero text trigger (block 3 reads its A / B): the hero logo travels up and
          shrinks into the centre of the header bar over the first 70 % of the hero's height, and docks there. ONE
          ScrollTrigger (no tween: the progress is applied directly through three gsap.quickSetters, so the copy
          tracks the page pixel for pixel and no per-frame tween is recorded). At progress p, q = power2.out(p): the
          fixed copy sits at lerp(A in the viewport, B, q) with scale lerp(1, B.w / A.w, q) about its top-left
          corner (fastest first: the text scrolling up under it meets its box as late as possible, block 3 fades the
          text before that); at p = 0 the hero's own logo shows, between the ends the copy (html.logo-morphing hides
          the hero img), at p = 1 the header logo (html.logo-docked) in the same place, never overshooting the bar.
          Re-measured on every refresh (resize, fonts); kill() clears the copy's transform (clearProps, the GSAP
          cache included) and its img width */
    if (canMorph) {
      /* scaleX + scaleY, not "scale": the alias is resolved only by a tween, a quickSetter on it writes nothing
         (verified on 3.12.5: style.transform stayed translate-only, the copy never shrank) */
      var setMorphX = gsap.quickSetter(morph, 'x', 'px');
      var setMorphY = gsap.quickSetter(morph, 'y', 'px');
      var setMorphSX = gsap.quickSetter(morph, 'scaleX');
      var setMorphSY = gsap.quickSetter(morph, 'scaleY');
      var applyMorph = function (self) {
        if (!A || !B) { return; }
        var p = self.progress, q = morphEase(p), k = 1 + (B.w / A.w - 1) * q;
        setMorphX(A.left + (B.left - A.left) * q);
        setMorphY(A.top + (B.top - A.top) * q);
        setMorphSX(k);
        setMorphSY(k);
        html.classList.toggle('logo-morphing', p > 0 && p < 1);
        html.classList.toggle('logo-docked', p >= 1);
      };
      ScrollTrigger.create({
        trigger: hero, start: 'top top', end: function () { return '+=' + Math.round(hero.offsetHeight * MORPH_END); },
        onRefreshInit: measureMorph, onRefresh: applyMorph, onUpdate: applyMorph
      });
    }

    /* the scroll position (px) by which the descriptor + tag pair must be gone: the first px where the morphing
       logo's box bottom (rising from A to B with the eased progress, shrinking about its top-left corner) comes
       within TEXT_RESERVE of the text's top (scrolling up at 1× less the mark's drift), less 2px, so the fade is
       complete strictly before the box reaches the text's bounds; never later than FADE_TO of the hero (the
       foliage clearance). Scanned in 2px steps from 0 (the eased morph makes the gap a quadratic in the scroll).
       A / B come from the morph trigger above (measured on its create-time refresh and on every refreshInit since).
       Measured: 1440×900 → ~66px linear, later eased; 390×844 → ~24px linear */
    var TEXT_RESERVE = 8;
    var textFadeEnd = function () {
      var H = hero.offsetHeight;
      var cap = Math.round(FADE_TO * H);
      if (!text || !canMorph || !A || !B) { return cap; }
      var L = Math.round(H * MORPH_END);
      var scaleEnd = B.w / A.w;
      var tTop = pageTop(text);
      var drift = heroDrift() / H;
      for (var s = 0; s <= cap; s += 2) {
        var q = morphEase(Math.min(1, s / L));
        var boxBottom = A.top + (B.top - A.top) * q + A.h * (1 + (scaleEnd - 1) * q);
        var textTop = tTop - s + drift * s;
        if (textTop <= boxBottom + TEXT_RESERVE) { return Math.max(1, s - 2); }
      }
      return cap;
    };

    /* 3. the hero, scrubbed over its own height: the mark drifts down by heroDrift() (depth: it rises slower than the
          page); the halo and the hero's own logo (.hero__fade) fade 1 -> 0 between 10 % and 45 % of the hero, and by
          45 % the drift has used at most the measured clearance, so nothing is ever over the foliage; the video
          deepens to cypress by 80 % of the hero (the open middle under the canopy is clean night before screen 2).
          The descriptor + tag pair (.hero__text) fade on their own trigger, 1 -> 0 from the top of the page to
          textFadeEnd(): gone before the morphing logo's box reaches them. Every value is a function: a refresh
          (resize, fonts, the tree image landing) re-measures */
    if (hero && mark && fade) {
      var heroTl = gsap.timeline({
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
      heroTl.fromTo(mark, { y: 0 }, { y: heroDrift, ease: 'none', duration: 1 }, 0)
        .fromTo(fade, { opacity: 1 }, { opacity: 0, ease: 'none', duration: FADE_TO - FADE_FROM }, FADE_FROM);
      if (deepen) { heroTl.fromTo(deepen, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.8 }, 0); }
      if (text) {
        gsap.fromTo(text, { opacity: 1 }, {
          opacity: 0, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: function () { return '+=' + textFadeEnd(); }, scrub: true, invalidateOnRefresh: true }
        });
      }
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
           over 0.8 screens of scroll once it has reached 40% of the viewport, 40° of spin in all (a fruit falls, it
           does not tumble), a slight drift right, fading out in the last 10 % */
    if (shown(drop)) {
      gsap.timeline({
        scrollTrigger: { trigger: drop, start: 'top 40%', end: function () { return '+=' + Math.round(vh() * 0.8); }, scrub: true, invalidateOnRefresh: true }
      })
        .fromTo(drop, { y: 0, x: 0, rotation: 0 }, {
          y: function () { return vh() * 1.6; },
          x: function () { return isPhone() ? -30 : 30; },
          rotation: 40, ease: 'power2.in', duration: 1
        }, 0)
        .fromTo(drop, { opacity: 1 }, { opacity: 0, ease: 'none', duration: 0.1 }, 0.9);
    }

    /* 4b. the fallen fruit settles into place on the moss as the ground arrives (a short 30° nudge over 70px, not a
           rolling entrance); 5. the ground rises 40px */
    if (ground) {
      gsap.fromTo(ground, { y: 40 }, {
        y: 0, ease: 'none',
        scrollTrigger: { trigger: ground, start: 'top bottom', end: 'top 55%', scrub: true, invalidateOnRefresh: true }
      });
      if (roll) {
        gsap.fromTo(roll, { x: -70, rotation: -30 }, {
          x: 0, rotation: 0, ease: 'power2.out',
          scrollTrigger: { trigger: ground, start: 'top 95%', end: 'top 40%', scrub: true, invalidateOnRefresh: true }
        });
      }
    }

    /* (6. the logo morph is built above block 3, which depends on its measurement) */

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
    /* the parallax y of the layers and the morph's x / y / scale are written by gsap.quickSetter (no tween for the
       context to revert): cleared with clearProps, which empties GSAP's transform cache too (an emptied inline style
       alone left the cached y, re-rendered by the first rotation write after Play); the copy's img width likewise */
    $$('.tree__layer', main).forEach(function (l) { gsap.set(l, { clearProps: 'transform' }); });
    /* the live bounce timeline sits outside the context (built per kick): killed here, the imgs' y cleared */
    if (bounceTl) { bounceTl.kill(); }
    bounceImgs.forEach(function (img) { gsap.set(img, { clearProps: 'transform' }); });
    bounceImgs = [];
    if (morph) { gsap.set(morph, { clearProps: 'transform' }); }
    if (morphImg) { morphImg.style.width = ''; }
    observers.forEach(function (o) { o.disconnect(); });
    observers = [];
    bounceTl = null; kickBounce = null; lastBounce = 0; canopyInView = false;
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
