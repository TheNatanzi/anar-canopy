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
     2. the canopy as a branch rig (.tree__rig): eight painted branches, each
        rotating about its own cut end at the trunk on its own wind rhythm,
        six fruit swinging on their stems behind them, a gust rippling across
        the crown on scroll, a small depth parallax (back / front); the still
        painting (.tree__canopy) is the canopy until the rig has loaded and on
        Pause / reduced motion / without JS. Two shrub sprigs
        ±1.2° / 6 s and ±1.6° / 7 s about their base, out of phase; all paused
        off screen and reverted on Pause
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
   The celebrations accordion (screen 3) is wired before the motion guard, so it
   works without the motion and without the vendors.
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

  /* the celebrations accordion (screen 3; adapted from the Arch version). Registered BEFORE the motion guard: it is
     an interface, not motion, so it works under Pause, reduced motion and a failed vendor request alike. On the strip
     (769px wide AND 701px tall) one panel is open: hover opens a strip after 80 ms (a pass across the strip opens
     nothing; pointer devices only), click / Enter / Space and keyboard focus open it (a focus that comes from a click
     does not open twice), the arrow keys, Home and End move between the triggers. A closed panel's body is inert and
     aria-hidden (it is faded out), the open one is live. Stacked cards (phones, short viewports): every body shown,
     the overlay triggers hidden (out of the tab order). The strip CSS applies only once all this is wired
     (.accordion-ready). When an expansion settles, ScrollTrigger re-measures the page (the strip's height follows
     the open body) */
  var stripQuery = window.matchMedia('(min-width: 769px) and (min-height: 701px)');
  var isStrip = function () { return stripQuery.matches; };
  var onMQ = function (mq, fn) {
    if (mq.addEventListener) { mq.addEventListener('change', fn); } else if (mq.addListener) { mq.addListener(fn); }
  };
  $$('[data-accordion]', main).forEach(function (acc) {
    var panels = $$('.accordion__panel', acc);
    var triggers = panels.map(function (p) { return $('.accordion__trigger', p); });
    var hoverable = window.matchMedia('(hover: hover)').matches;
    var hoverTimer = 0, settleTimer = 0, pointerFocus = false;
    function settle() {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () {
        if (hasGsap && html.classList.contains('motion')) { ScrollTrigger.refresh(); }
      }, html.classList.contains('reduced') ? 50 : 760);
    }
    function syncBodies() {
      var stacked = !isStrip();
      panels.forEach(function (p, i) {
        var bodyEl = $('.accordion__body', p);
        if (triggers[i]) { triggers[i].hidden = stacked; }
        if (!bodyEl) { return; }
        var closed = !stacked && !p.classList.contains('is-open');
        bodyEl.inert = closed;
        if (closed) { bodyEl.setAttribute('aria-hidden', 'true'); } else { bodyEl.removeAttribute('aria-hidden'); }
      });
    }
    function open(target) {
      if (target.classList.contains('is-open')) { return; }
      panels.forEach(function (p, i) {
        var isOn = p === target;
        p.classList.toggle('is-open', isOn);
        if (triggers[i]) { triggers[i].setAttribute('aria-expanded', isOn ? 'true' : 'false'); }
      });
      syncBodies();
      if (isStrip()) { settle(); }
    }
    panels.forEach(function (p, i) {
      var btn = triggers[i];
      if (hoverable) {
        p.addEventListener('mouseenter', function () {
          clearTimeout(hoverTimer);
          hoverTimer = setTimeout(function () { if (isStrip()) { open(p); } }, 80);
        });
        p.addEventListener('mouseleave', function () { clearTimeout(hoverTimer); });
      }
      if (!btn) { return; }
      btn.addEventListener('pointerdown', function () { pointerFocus = true; });
      btn.addEventListener('pointercancel', function () { pointerFocus = false; });
      btn.addEventListener('click', function () { pointerFocus = false; open(p); });
      btn.addEventListener('focus', function () {
        if (pointerFocus) { pointerFocus = false; return; }   /* the click that follows opens it */
        if (isStrip()) { open(p); }
      });
      btn.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { next = (i + 1) % triggers.length; }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { next = (i - 1 + triggers.length) % triggers.length; }
        else if (e.key === 'Home') { next = 0; }
        else if (e.key === 'End') { next = triggers.length - 1; }
        if (next === null || !triggers[next]) { return; }
        e.preventDefault();
        triggers[next].focus();
        open(panels[next]);
      });
    });
    syncBodies();
    onMQ(stripQuery, function () { syncBodies(); settle(); });
    acc.classList.add('accordion-ready');   /* only now does the strip layout apply (canopy.css) */
  });

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

  /* ---- 2. the branch rig (.tree__rig, canopy.css; the pieces placed by docs/council/rig_compose.py) ----
     Each branch rotates about its own cut end at the trunk (its CSS transform-origin), each fruit about its stem top.
     The rotation is the sum of three proxies, written once per frame by one quickSetter per element (one ticker
     callback, transforms only, no layout read):
       wind:  a sine loop (yoyo sine.inOut) of its own amplitude and period, from a random phase, plus a small
              secondary loop at a different period, so no two branches and no two cycles move alike; the back
              branches move less and slower than the front (depth)
       gust:  scrolling (|velocity| > 250 px/s, at most one gust per 300 ms) sends a gust across the crown: the
              branches nearer the scroll direction first (scrolling down, the lowest first; up, the highest), 75 ms
              apart; each eases out to its kick and settles back through one soft overshoot (no elastic wobble, no
              jump: a new gust starts from wherever the last one is). Scrolling down the crown rises on screen and
              its tips trail (droop); scrolling up they lift, at 40 % (the logo's column stays clear above them)
       fruit: a pendulum about the stem top, ±3.5–5°, on its branch's own period 0.25 s behind it, and the gust
              0.25 s after its branch, ×2 (capped at 3°)
     Depth parallax: the back branches move at 0.97 of the canopy's scroll, the front at 1.02 (y, scrubbed, from
     the top of the page until the rig has left the viewport); the static backdrop and limbs fill every gap.
     The loops run only while the rig is on screen. The rig shows (html.rig-on) once all its images have loaded;
     until then, and on Pause / reduced motion / without JS, the still painting (.tree__canopy) is the canopy */
  var rig = $('.tree__rig', main);
  var rigCleanups = [];
  var rigBuildId = 0;
  /* per branch (data-rig): a / p = the main sway (deg, s per full cycle), a2 / p2 = the secondary, g = the gust kick
     (deg). Front: b4, b7 (upper), b1m, b6 (long, the most motion); back: b3, b2, b5, b8 */
  var RIG = {
    b4: { a: 1.3, p: 5.2, a2: 0.30, p2: 2.6, g: 1.6 },
    b7: { a: 1.2, p: 5.8, a2: 0.28, p2: 3.1, g: 1.5 },
    b1m: { a: 1.6, p: 4.8, a2: 0.35, p2: 2.3, g: 1.9 },
    b6: { a: 1.8, p: 6.4, a2: 0.35, p2: 2.8, g: 2.0 },
    b3: { a: 0.9, p: 7.4, a2: 0.20, p2: 3.4, g: 1.0 },
    b2: { a: 0.7, p: 6.9, a2: 0.18, p2: 3.7, g: 0.9 },
    b5: { a: 0.8, p: 8.0, a2: 0.20, p2: 3.2, g: 1.0 },
    b8: { a: 0.6, p: 7.1, a2: 0.15, p2: 2.9, g: 0.8 }
  };
  var FRUIT_LAG = 0.25, GUST_STAGGER = 0.075, GUST_GAP = 300, GUST_MIN_V = 250, UP_GUST = 0.4;
  /* a yoyo sine loop on a proxy, from -amp to amp over half a period, started at the given point of its cycle */
  function swayLoop(proxy, amp, period, at) {
    var tw = gsap.fromTo(proxy, { a: -amp }, { a: amp, duration: period / 2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    tw.totalTime(((at % period) + period) % period);
    return tw;
  }
  /* resolves true once the image has loaded and decoded, false on an error */
  function imgReady(img) {
    return new Promise(function (resolve) {
      var done = function () {
        if (!img.naturalWidth) { resolve(false); return; }
        if (img.decode) { img.decode().then(function () { resolve(true); }, function () { resolve(true); }); } else { resolve(true); }
      };
      if (img.complete) { done(); return; }
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', function () { resolve(false); }, { once: true });
    });
  }
  function buildRig() {
    if (!rig) { return; }
    var buildId = ++rigBuildId;
    var cssNum = function (el, name) { return parseFloat(el.style.getPropertyValue(name)) || 0; };
    var branches = $$('.rig__b', rig).map(function (el) {
      var cfg = RIG[el.getAttribute('data-rig')] || { a: 1, p: 6, a2: 0.2, p2: 3, g: 1 };
      var left = cssNum(el, '--px') < 1;   /* the cut end on the sprite's left edge: a left-trunk branch */
      var phase = Math.random() * cfg.p;
      var b = {
        el: el, cfg: cfg, y: cssNum(el, '--y'), x: cssNum(el, '--x'),
        droop: left ? 1 : -1,               /* clockwise droops a left branch's tip, lifts a right one's */
        set: gsap.quickSetter(el, 'rotation', 'deg'),
        w: { a: 0 }, w2: { a: 0 }, g: { a: 0 }, gTl: null, loops: []
      };
      b.loops.push(swayLoop(b.w, cfg.a, cfg.p, phase), swayLoop(b.w2, cfg.a2, cfg.p2, Math.random() * cfg.p2));
      b.fruits = $$('.rig__f', el).map(function (fel) {
        var f = { set: gsap.quickSetter(fel, 'rotation', 'deg'), w: { a: 0 }, g: { a: 0 }, gTl: null };
        b.loops.push(swayLoop(f.w, 3.5 + Math.random() * 1.5, cfg.p, phase - FRUIT_LAG));
        return f;
      });
      return b;
    });
    var loops = [];
    branches.forEach(function (b) { loops = loops.concat(b.loops); });
    var apply = function () {
      for (var i = 0; i < branches.length; i++) {
        var b = branches[i];
        b.set(b.w.a + b.w2.a + b.g.a);
        for (var j = 0; j < b.fruits.length; j++) { b.fruits[j].set(b.fruits[j].w.a + b.fruits[j].g.a); }
      }
    };
    /* the loops and the per-frame write run only while the rig is on (or within 10 % of) the screen */
    var running = false;
    var run = function (yes) {
      if (yes === running) { return; }
      running = yes;
      loops.forEach(function (t) { if (yes) { t.play(); } else { t.pause(); } });
      if (yes) { gsap.ticker.add(apply); } else { gsap.ticker.remove(apply); }
    };
    loops.forEach(function (t) { t.pause(); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { run(en.isIntersecting); });
      }, { rootMargin: '10% 0px' });
      io.observe(rig);
      observers.push(io);
    } else { run(true); }

    /* the gust: a travelling ripple, one per GUST_GAP ms at most */
    var gust = function (dir, strength) {
      var order = branches.slice().sort(function (p, q) { return dir > 0 ? (q.y - p.y) || (p.x - q.x) : (p.y - q.y) || (p.x - q.x); });
      order.forEach(function (b, i) {
        var kick = b.droop * b.cfg.g * (dir > 0 ? 1 : -UP_GUST) * (0.45 + 0.55 * strength);
        var delay = i * GUST_STAGGER;
        if (b.gTl) { b.gTl.kill(); }
        b.gTl = gsap.timeline({ delay: delay })
          .to(b.g, { a: kick, duration: 0.5, ease: 'power2.out' })
          .to(b.g, { a: -0.22 * kick, duration: 0.8, ease: 'sine.inOut' })
          .to(b.g, { a: 0, duration: 1.1, ease: 'sine.inOut' });
        var fk = Math.max(-3, Math.min(3, kick * 2));
        b.fruits.forEach(function (f) {
          if (f.gTl) { f.gTl.kill(); }
          f.gTl = gsap.timeline({ delay: delay + FRUIT_LAG })
            .to(f.g, { a: fk, duration: 0.6, ease: 'power2.out' })
            .to(f.g, { a: -0.3 * fk, duration: 0.9, ease: 'sine.inOut' })
            .to(f.g, { a: 0, duration: 1.2, ease: 'sine.inOut' });
        });
      });
    };
    var lastGust = 0;
    ScrollTrigger.create({
      trigger: rig, start: 'top bottom', end: 'bottom top',
      onUpdate: function (self) {
        if (!running) { return; }
        var v = self.getVelocity(), now = Date.now();
        if (Math.abs(v) < GUST_MIN_V || now - lastGust < GUST_GAP) { return; }
        lastGust = now;
        gust(v > 0 ? 1 : -1, Math.min(1, Math.abs(v) / 2400));
      }
    });

    /* depth: back ×0.97, front ×1.02 of the canopy's scroll, from the top of the page until the rig's bottom has
       left the viewport's top (screens 1–2 are never parallaxed, so the rig's offsets are its page position) */
    var rigEnd = function () { return Math.max(1, Math.round(pageTop(rig) + rig.offsetHeight)); };
    var depth = function (els, k) {
      if (!els.length) { return; }
      gsap.fromTo(els, { y: 0 }, {
        y: function () { return k * rigEnd(); }, ease: 'none',
        scrollTrigger: { start: 0, end: rigEnd, scrub: true, invalidateOnRefresh: true }
      });
    };
    depth($$('.rig__b--back', rig), 0.03);
    depth($$('.rig__b--front', rig), -0.02);

    /* show the rig (fading the still painting out under it) once every piece has loaded; the gust tweens are made
       outside the context (on scroll), so kill() ends them here, with the ticker write and the transforms */
    html.classList.add('rig-wait');
    Promise.all($$('img', rig).map(imgReady)).then(function (ok) {
      if (!on || buildId !== rigBuildId || ok.indexOf(false) !== -1) { return; }
      html.classList.add('rig-on');
    });
    rigCleanups.push(function () {
      run(false);
      branches.forEach(function (b) {
        if (b.gTl) { b.gTl.kill(); }
        b.fruits.forEach(function (f) { if (f.gTl) { f.gTl.kill(); } });
      });
      gsap.set($$('.rig__b, .rig__f', rig), { clearProps: 'transform' });
      html.classList.remove('rig-wait');
      html.classList.remove('rig-on');
    });
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
    /* 2. the canopy as a branch rig (.tree__rig; the painting itself, .tree__canopy, never moves: no whole-image
          sway, and no tonal slices sliding past each other, which left a halo where each fruit had been) */
    buildRig();

    /* each shrub sways about the bottom of its crop at the trunk edge, the two out of phase (left ±1.2° / 6 s, right
       ±1.6° / 7 s per full cycle; each starts at rest mid-stroke, the two mirrored). The crop holds no bark
       (canopy.css: its mask opens just inside the trunk edge, over a static strip of the same pixels) and fades out
       over its last 25 rows onto the static copy below, so neither the trunk edge nor the cut moves as a seam */
    var sprigSway = function (el, deg, cycle, dir) {
      var half = cycle / 2;
      var tw = gsap.fromTo(el, { rotation: -deg * dir }, { rotation: deg * dir, duration: half, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      tw.totalTime(half / 2);
      loopInView(el, tw);
    };
    if (shown(sprigL)) { sprigSway(sprigL, 1.2, 6, -1); }
    if (shown(sprigR)) { sprigSway(sprigR, 1.6, 7, 1); }

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
      /* round 8: the last morphing / docked states written to the root, so the classes change only on a state change
         (the root's MutationObserver, sync() below, would otherwise run on every scroll update). Read from the root
         itself on each build, so a kill() (which removes both) and a rebuild start from the truth */
      var wasMorphing = html.classList.contains('logo-morphing');
      var wasDocked = html.classList.contains('logo-docked');
      var applyMorph = function (self) {
        if (!A || !B) { return; }
        var p = self.progress, q = morphEase(p), k = 1 + (B.w / A.w - 1) * q;
        setMorphX(A.left + (B.left - A.left) * q);
        setMorphY(A.top + (B.top - A.top) * q);
        setMorphSX(k);
        setMorphSY(k);
        var morphing = p > 0 && p < 1, docked = p >= 1;
        if (morphing !== wasMorphing) { wasMorphing = morphing; html.classList.toggle('logo-morphing', morphing); }
        if (docked !== wasDocked) { wasDocked = docked; html.classList.toggle('logo-docked', docked); }
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
    /* the rig's gusts (made on scroll, outside the context), its ticker write and its transforms */
    rigCleanups.forEach(function (fn) { try { fn(); } catch (e) { /* ignore */ } });
    rigCleanups = [];
    /* the morph's x / y / scale are written by gsap.quickSetter (no tween for the context to revert): cleared with
       clearProps, which empties GSAP's transform cache too (an emptied inline style alone left the cached y,
       re-rendered by the next transform write after Play); the copy's img width likewise */
    if (morph) { gsap.set(morph, { clearProps: 'transform' }); }
    if (morphImg) { morphImg.style.width = ''; }
    observers.forEach(function (o) { o.disconnect(); });
    observers = [];
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
  onMQ(phoneQuery, function () { if (on) { kill(); sync(); } });
})();
