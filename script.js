(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = typeof gsap !== 'undefined';
  var hasST = hasGSAP && typeof ScrollTrigger !== 'undefined';
  var hasSplit = hasGSAP && typeof SplitText !== 'undefined';
  var hasScramble = hasGSAP && typeof ScrambleTextPlugin !== 'undefined';
  var hasCustomEase = hasGSAP && typeof CustomEase !== 'undefined';
  var hasFlip = hasGSAP && typeof Flip !== 'undefined';

  if (hasGSAP) {
    var toRegister = [];
    if (hasST) toRegister.push(ScrollTrigger);
    if (hasSplit) toRegister.push(SplitText);
    if (hasScramble) toRegister.push(ScrambleTextPlugin);
    if (hasCustomEase) toRegister.push(CustomEase);
    if (hasFlip) toRegister.push(Flip);
    if (toRegister.length) gsap.registerPlugin.apply(gsap, toRegister);
  }

  // Signature motion curve for this site — used everywhere instead of a stock ease.
  var EASE = 'power3.out';
  if (hasCustomEase) {
    try { CustomEase.create('hyperframe', 'M0,0 C0.65,0 0.35,1 1,1'); EASE = 'hyperframe'; }
    catch (e) { EASE = 'power3.out'; }
  }

  /* ================= mobile menu ================= */
  var menuBtn = document.getElementById('menu-btn');
  var menu = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      var willOpen = menu.classList.contains('hidden');
      if (hasGSAP && hasFlip && !reduce) {
        var state = Flip.getState(menu);
        menu.classList.toggle('hidden');
        Flip.from(state, { duration: 0.4, ease: EASE, height: true, opacity: true });
      } else {
        menu.classList.toggle('hidden');
      }
      menuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  }

  /* ================= header solid-on-scroll ================= */
  var header = document.getElementById('site-header');
  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 60) header.classList.add('bg-forest', 'shadow-md');
    else header.classList.remove('bg-forest', 'shadow-md');
  }
  document.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if (!hasGSAP) return; /* page is fully readable & usable without any animation library */

  /* ================= intro loader — one signature page-load moment ================= */
  var loader = document.getElementById('loader');
  var heroTl = gsap.timeline({ paused: true, defaults: { ease: EASE } });

  function buildHeroTimeline() {
    if (hasSplit && !reduce) {
      var split = new SplitText('#hero-title', { type: 'lines,chars' });
      gsap.set('#hero-title', { autoAlpha: 1 });
      heroTl.from(split.chars, { yPercent: 120, opacity: 0, duration: 0.9, stagger: 0.012 });
    } else {
      heroTl.from('#hero-title', { y: 30, autoAlpha: 0, duration: 0.8 });
    }
    heroTl
      .from('#hero-kicker', { y: 10, autoAlpha: 0, duration: 0.5 }, 0)
      .from('#hero-sub', { y: 16, autoAlpha: 0, duration: 0.6 }, '-=0.5')
      .from('#hero-cta > *', { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.1 }, '-=0.4')
      .from('#hero-portrait', { autoAlpha: 0, x: 24, duration: 0.8 }, '-=0.6')
      .from('#stats-row', { autoAlpha: 0, duration: 0.6 }, '-=0.3');
  }
  buildHeroTimeline();

  if (loader) {
    if (reduce) {
      loader.style.display = 'none';
      heroTl.play();
    } else {
      var loadTl = gsap.timeline({
        onComplete: function () { loader.remove(); heroTl.play(); }
      });
      loadTl
        .from('.loader-mark', { autoAlpha: 0, scale: 1.6, duration: 0.6, stagger: 0.04, ease: EASE })
        .to('#loader-bar', { width: '100%', duration: 0.7, ease: 'power1.inOut' }, '-=0.2')
        .to(loader, { autoAlpha: 0, duration: 0.5, ease: 'power1.out' }, '+=0.1');
    }
  } else {
    heroTl.play();
  }

  /* ================= cinema cursor ================= */
  var cursor = document.getElementById('cinema-cursor');
  if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var xTo = gsap.quickTo(cursor, 'x', { duration: 0.5, ease: 'power3' });
    var yTo = gsap.quickTo(cursor, 'y', { duration: 0.5, ease: 'power3' });
    window.addEventListener('mousemove', function (e) { xTo(e.clientX); yTo(e.clientY); });
    document.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
  }

  /* ================= magnetic CTAs (used sparingly, primary actions only) ================= */
  document.querySelectorAll('.magnetic').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var r = btn.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2;
      var y = e.clientY - r.top - r.height / 2;
      gsap.to(btn, { x: x * 0.3, y: y * 0.35, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', function () {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.45)' });
    });
  });

  /* ================= stat count-up ================= */
  document.querySelectorAll('.stat-num').forEach(function (el) {
    var target = +el.dataset.target || 0;
    if (reduce) { el.textContent = target; return; }
    gsap.fromTo(el, { textContent: 0 }, {
      textContent: target, duration: 1.6, ease: 'power1.out', snap: { textContent: 1 },
      scrollTrigger: { trigger: '#stats-row', start: 'top 85%' }
    });
  });

  /* ================= scramble-reveal on frame index labels ================= */
  document.querySelectorAll('.frame-index').forEach(function (el) {
    var full = el.textContent;
    if (reduce || !hasScramble) return;
    gsap.set(el, { textContent: '' });
    gsap.to(el, {
      duration: 1, scrambleText: { text: full, chars: '01·—ABCDEFGHIJ', speed: 0.4 },
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
    });
  });

  /* ================= restrained single reveal per section ================= */
  document.querySelectorAll('.reveal-up').forEach(function (el) {
    if (reduce) return;
    gsap.from(el, {
      y: 40, autoAlpha: 0, duration: 0.9, ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 78%', toggleActions: 'play none none reverse' }
    });
  });
  gsap.utils.toArray('#visi-misi li').forEach(function (li, i) {
    if (reduce) return;
    gsap.from(li, {
      x: -24, autoAlpha: 0, duration: 0.7, ease: EASE, delay: i * 0.05,
      scrollTrigger: { trigger: li, start: 'top 88%', toggleActions: 'play none none reverse' }
    });
  });

  /* ================= subtle parallax on portrait images ================= */
  ['#hero-portrait img', '#guru-portrait img'].forEach(function (sel) {
    var img = document.querySelector(sel);
    if (!img || reduce) return;
    gsap.fromTo(img, { yPercent: -8 }, {
      yPercent: 8, ease: 'none',
      scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* ================= Frame 04: Panca Nilai — hyperframe centerpiece, pinned step-through ================= */
  var panels = gsap.utils.toArray('.value-panel');
  var pancaDots = gsap.utils.toArray('#panca-dots .dot');
  if (panels.length) {
    gsap.set(panels[0], { autoAlpha: 1 });
    panels.slice(1).forEach(function (p) { gsap.set(p, { autoAlpha: 0, y: 24 }); });

    if (!reduce) {
      var pancaTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#panca-nilai', start: 'top top', end: '+=2400',
          scrub: 0.6, pin: true, anticipatePin: 1
        }
      });
      panels.forEach(function (panel, i) {
        if (i === 0) return;
        pancaTl
          .to(panels[i - 1], { autoAlpha: 0, y: -24, duration: 0.4 }, i)
          .to(panel, { autoAlpha: 1, y: 0, duration: 0.4 }, i)
          .call(function () {
            pancaDots.forEach(function (d, di) {
              d.classList.toggle('bg-brass-light', di === i);
              d.classList.toggle('bg-cream/20', di !== i);
            });
          }, null, i);
      });
    } else {
      var stage = document.getElementById('panca-stage');
      if (stage) { stage.style.position = 'static'; stage.style.height = 'auto'; }
      panels.forEach(function (p) { p.style.position = 'static'; p.style.opacity = 1; p.classList.add('mb-8'); });
    }
  }

  /* ================= filmstrip rail: active frame + nav active link ================= */
  var frameIds = ['beranda', 'guru', 'visi-misi', 'panca-nilai', 'humas', 'kontak-sekolah'];
  frameIds.forEach(function (id, i) {
    var section = document.getElementById(id);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section, start: 'top 55%', end: 'bottom 55%',
      onToggle: function (self) {
        if (!self.isActive) return;
        document.querySelectorAll('#filmstrip-rail a').forEach(function (a) {
          a.classList.toggle('is-active', a.dataset.frame === String(i));
        });
        document.querySelectorAll('.nav-link').forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
