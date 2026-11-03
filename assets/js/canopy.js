/* =========================================================
   Anar Events — canopy.js (branch `canopy`, home page only; loaded after site.js)
   The motion of the one tall tree. site.js owns GSAP + ScrollTrigger + Lenis,
   the "Pause motion" button and the reduced-motion handling: it adds html.motion
   when its tweens are live and removes it when they are killed. This file watches
   that class and builds / reverts its own gsap.context() in step, so the Pause
   button and prefers-reduced-motion stop everything here too. Nothing in this
   file is required for the page to read, and nothing here changes the page's
   geometry: every layer and offset is laid out by canopy.css, so Pause / Play
   moves no content.
     1. parallax: the tree layer moves at 0.9× scroll from the end of screen 2
        on (screens 1–2 stay registered with the statement; the band under the
        ground absorbs the drift)
     2. sway: the canopy ±0.5° (7 s), two shrub sprigs ±0.5° (9 s / 11 s), paused off
        screen; a scroll-velocity shake (x ±6px, ±0.8°) that eases back, its
        timeline added to the context so Pause reverts it too
     3. the hero video: fixed while the motion runs (CSS), hidden once screen 1 has
        scrolled past (site.js then pauses it) and shown again on the way back
     4. the falling pomegranate (scrub, 1.6 screens, 140°, fades in the last 10 %;
        desktop only, the sprite is display:none on phones) and the fallen one
        rolling into place on the ground
     5. the ground rising 40px into place; the logo + line rising on load
   Leaves (.leaf), kashida draws (.kashida-draw), reveals (.reveal / .stagger) and
   the hero logo / tag / deepen scrub are site.js blocks 8, 4, 9 and 1.
   ========================================================= */
(function () {
  'use strict';

  var html = document.documentElement;
  var main = document.querySelector('main.canopy');
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (!main || !hasGsap) { return; }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var vh = function () { return window.innerHeight; };
  var phoneQuery = window.matchMedia('(max-width: 768px)');
  var isPhone = function () { return phoneQuery.matches; };
  var shown = function (el) { return !!el && getComputedStyle(el).display !== 'none'; };

  var tree = $('.tree', main);
  var canopy = $('.tree__canopy', main);
  var shake = $('.tree__shake', main);
  var sprigL = $('.tree__sprig--l', main);
  var sprigR = $('.tree__sprig--r', main);
  var hero = $('.hero', main);
  var heroBg = $('.hero__bg', main);
  var rise = $('.hero__rise', main);
  var fade = $('.hero__fade', main);
  var stmt = $('.screen--statement', main);
  var drop = $('.fruit-drop', main);
  var ground = $('.ground-art', main);
  var roll = $('.fruit-roll', main);
  var treeImg = $('.tree__canopy img', main);

  var ctx = null;
  var observers = [];
  var on = false;
  var failed = false;
  var risen = false;
  /* the velocity shake: its timeline and state live here so kill() can reset them */
  var shakeTl = null;
  var shaking = false;
  var lastShake = 0;

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

  function buildAll() {
    /* 1. parallax: y = 0.1 × (scrollY − start) from the end of screen 2 to the bottom of the page */
    if (tree) {
      gsap.to(tree, {
        y: function () { return 0.1 * Math.max(0, ScrollTrigger.maxScroll(window) - parallaxStart()); },
        ease: 'none',
        scrollTrigger: { start: parallaxStart, end: 'max', scrub: true, invalidateOnRefresh: true }
      });
    }
    /* the shake: a fast flick (|velocity| > 2400 px/s) while the canopy is on screen nudges the canopy 6px / 0.8°
       in the scroll direction and lets it spring back; at most one every 1.6 s. The timeline is created through
       ctx.add() so the context records it and revert() (Pause, reduced motion) kills it with everything else */
    if (shake && canopy) {
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: function (self) {
          if (shaking || !ctx) { return; }
          var v = self.getVelocity();
          var now = Date.now();
          if (Math.abs(v) < 2400 || now - lastShake < 1600) { return; }
          var r = canopy.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh()) { return; }
          shaking = true; lastShake = now;
          var d = v > 0 ? 1 : -1;
          ctx.add(function () {
            shakeTl = gsap.timeline({ onComplete: function () { shaking = false; shakeTl = null; } })
              .to(shake, { x: 6 * d, rotation: 0.8 * d, duration: 0.16, ease: 'power2.out' })
              .to(shake, { x: 0, rotation: 0, duration: 1.3, ease: 'elastic.out(1, 0.35)' });
          });
        }
      });
    }

    /* 2. sway: the canopy about its top centre (7 s period), the sprigs about the trunk edge (9 s / 11 s) */
    if (canopy) {
      loopInView(canopy, gsap.fromTo(canopy, { rotation: -0.5 }, { rotation: 0.5, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    }
    if (shown(sprigL)) {
      loopInView(sprigL, gsap.fromTo(sprigL, { rotation: -0.5 }, { rotation: 0.5, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    }
    if (shown(sprigR)) {
      loopInView(sprigR, gsap.fromTo(sprigR, { rotation: 0.5 }, { rotation: -0.5, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    }

    /* 3. the logo, line and tag are gone before the mark (site.js block 1, which moves it 45vh down at 35%) reaches
          the canopy's centre: opacity 1 -> 0 between 25% and 65% of screen 1 */
    if (hero && fade) {
      gsap.fromTo(fade, { opacity: 1 }, {
        opacity: 0, ease: 'none',
        scrollTrigger: { trigger: hero, start: '25% top', end: '65% top', scrub: true, invalidateOnRefresh: true }
      });
    }
    /* the fixed video: gone once screen 1 has scrolled past (site.js block 1 has faded it under .hero__deepen by
       then; display:none makes its IntersectionObserver pause the file), back on the way up */
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

    /* 5. the logo + line rise on load, once per page: the CSS (.js.anim-ready .hero__rise) holds opacity 0 until
          this tween takes it to 1, so nothing paints and then snaps back; a rebuild (Play after Pause, the
          breakpoint change) just shows it */
    if (rise) {
      if (!risen) {
        risen = true;
        gsap.fromTo(rise, { y: 18 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', delay: 0.1 });
      } else {
        gsap.set(rise, { opacity: 1, y: 0 });
      }
    }
  }

  function build() {
    if (on || failed) { return; }
    on = true;
    html.classList.add('canopy-motion');
    /* the context exists before anything is built, so a throw midway leaves kill() something to revert */
    ctx = gsap.context(function () {});
    try {
      ctx.add(buildAll);
    } catch (err) {
      failed = true;
      kill();
      if (rise) { rise.style.opacity = '1'; }
      if (window.console) { console.warn('Anar canopy motion disabled:', err); }
      return;
    }
    ScrollTrigger.refresh();
  }

  function kill() {
    if (!on) { return; }
    on = false;
    try { if (ctx) { ctx.revert(); ctx = null; } } catch (e) { /* ignore */ }
    observers.forEach(function (o) { o.disconnect(); });
    observers = [];
    shakeTl = null; shaking = false; lastShake = 0;
    html.classList.remove('canopy-motion');
    if (heroBg) { heroBg.classList.remove('is-gone'); }
    /* the triggers that remain (site.js, still live on a breakpoint rebuild) re-measure after the revert */
    if (html.classList.contains('motion')) { ScrollTrigger.refresh(); }
  }

  /* follow site.js: html.motion present = its tweens are live (initMotion), absent = killed (Pause, reduced motion) */
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
    treeImg.addEventListener('load', function () { if (on) { ScrollTrigger.refresh(); } }, { once: true });
  }
  /* the phone / desktop layers differ (no sprigs, no falling fruit, 120vw): rebuild on the breakpoint change */
  var onMQ = function (mq, fn) {
    if (mq.addEventListener) { mq.addEventListener('change', fn); } else if (mq.addListener) { mq.addListener(fn); }
  };
  onMQ(phoneQuery, function () { if (on) { kill(); sync(); } });
})();
