/* =========================================================
   Anar Events — canopy.js (branch `canopy`, home page only; loaded after site.js)
   The motion of the one tall tree. site.js owns GSAP + ScrollTrigger + Lenis,
   the "Pause motion" button and the reduced-motion handling: it adds html.motion
   when its tweens are live and removes it when they are killed. This file watches
   that class and builds / reverts its own gsap.context() in step, so the Pause
   button and prefers-reduced-motion stop everything here too. Nothing in this
   file is required for the page to read: every layer is laid out by canopy.css.
     1. parallax: the tree layer moves at 0.9× scroll (html.canopy-par switches the
        CSS offsets to the parallaxed formula)
     2. sway: the canopy ±0.5° (7 s), two shrub sprigs ±0.5° (9 s / 11 s), paused off
        screen; a scroll-velocity shake (x ±6px, ±0.8°) that eases back
     3. the hero video: fixed while the motion runs (CSS), hidden once screen 1 has
        scrolled past (site.js then pauses it) and shown again on the way back
     4. the falling pomegranate (scrub, 1.6 screens, 140°, fades in the last 10 %)
        and the fallen one rolling into place on the ground
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

  var tree = $('.tree', main);
  var canopy = $('.tree__canopy', main);
  var shake = $('.tree__shake', main);
  var sprigL = $('.tree__sprig--l', main);
  var sprigR = $('.tree__sprig--r', main);
  var hero = $('.hero', main);
  var heroBg = $('.hero__bg', main);
  var rise = $('.hero__rise', main);
  var fade = $('.hero__fade', main);
  var drop = $('.fruit-drop', main);
  var ground = $('.ground-art', main);
  var roll = $('.fruit-roll', main);
  var treeImg = $('.tree__canopy img', main);

  var ctx = null;
  var observers = [];
  var on = false;
  var risen = false;

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

  function build() {
    if (on) { return; }
    on = true;
    html.classList.add('canopy-motion');
    html.classList.add('canopy-par');
    ctx = gsap.context(function () {
      /* 1. parallax: y = 0.1 × scrollY over the whole page (the band under the ground absorbs the drift) */
      var shaking = false;
      var lastShake = 0;
      if (tree) {
        gsap.to(tree, {
          y: function () { return 0.1 * ScrollTrigger.maxScroll(window); },
          ease: 'none',
          scrollTrigger: {
            start: 0, end: 'max', scrub: true, invalidateOnRefresh: true,
            /* the shake: a fast flick (|velocity| > 2400 px/s) while the canopy is on screen nudges the canopy
               6px / 0.8° in the scroll direction and lets it spring back; at most one every 1.6 s */
            onUpdate: function (self) {
              if (!shake || shaking || !canopy) { return; }
              var v = self.getVelocity();
              var now = Date.now();
              if (Math.abs(v) < 2400 || now - lastShake < 1600) { return; }
              var r = canopy.getBoundingClientRect();
              if (r.bottom < 0 || r.top > vh()) { return; }
              shaking = true; lastShake = now;
              var d = v > 0 ? 1 : -1;
              gsap.timeline({ onComplete: function () { shaking = false; } })
                .to(shake, { x: 6 * d, rotation: 0.8 * d, duration: 0.16, ease: 'power2.out' })
                .to(shake, { x: 0, rotation: 0, duration: 1.3, ease: 'elastic.out(1, 0.35)' });
            }
          }
        });
      }

      /* 2. sway: the canopy about its top centre (7 s period), the sprigs about the trunk edge (9 s / 11 s) */
      if (canopy) {
        loopInView(canopy, gsap.fromTo(canopy, { rotation: -0.5 }, { rotation: 0.5, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      }
      if (sprigL) {
        loopInView(sprigL, gsap.fromTo(sprigL, { rotation: -0.5 }, { rotation: 0.5, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      }
      if (sprigR) {
        loopInView(sprigR, gsap.fromTo(sprigR, { rotation: 0.5 }, { rotation: -0.5, duration: 5.5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      }

      /* 3. the fixed video: gone once screen 1 has scrolled past (site.js block 1 has faded it under .hero__deepen
            by then; display:none makes its IntersectionObserver pause the file), back on the way up */
      /* the logo, line and tag are gone before the mark (site.js block 1, which leaves it at 35%) reaches the canopy:
         opacity 1 -> 0 between 40% and 80% of screen 1 */
      if (hero && fade) {
        gsap.fromTo(fade, { opacity: 1 }, {
          opacity: 0, ease: 'none',
          scrollTrigger: { trigger: hero, start: '40% top', end: '80% top', scrub: true, invalidateOnRefresh: true }
        });
      }
      if (hero && heroBg) {
        var syncBg = function (st) { heroBg.classList.toggle('is-gone', st.progress >= 1); };
        ScrollTrigger.create({
          trigger: hero, start: 'top top', end: 'bottom top',
          onToggle: syncBg, onRefresh: syncBg, onUpdate: syncBg
        });
      }

      /* 4a. the falling pomegranate: from its branch, 1.6 screens down over 0.8 screens of scroll once it has
             reached 40% of the viewport (≈1.1 screens in at 1440×900), 140° of spin, a slight sideways drift
             (right on desktop, off the edge on phones), fading out in the last 10 % */
      if (drop) {
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

      /* 5. the logo + line rise on load (once per page; its own element, so the site.js hero scrub keeps .hero__mark) */
      if (rise && !risen) {
        risen = true;
        gsap.fromTo(rise, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out', delay: 0.1 });
      }
    });
    ScrollTrigger.refresh();
  }

  function kill() {
    if (!on) { return; }
    on = false;
    try { if (ctx) { ctx.revert(); ctx = null; } } catch (e) { /* ignore */ }
    observers.forEach(function (o) { o.disconnect(); });
    observers = [];
    html.classList.remove('canopy-motion');
    html.classList.remove('canopy-par');
    if (heroBg) { heroBg.classList.remove('is-gone'); }
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
  /* the phone / desktop layers differ (no sprigs, 120vw): rebuild on the breakpoint change */
  var onMQ = function (mq, fn) {
    if (mq.addEventListener) { mq.addEventListener('change', fn); } else if (mq.addListener) { mq.addListener(fn); }
  };
  onMQ(phoneQuery, function () { if (on) { kill(); sync(); } });
})();
