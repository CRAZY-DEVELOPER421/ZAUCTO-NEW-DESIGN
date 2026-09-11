/* ============================================================
   ADVANCED ANIMATIONS — Zaucto Premium JS
   Inspired by HerNostics.com + NeanicSolutions.com
   ============================================================ */

(function() {
  'use strict';

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initBlurReveal();
    initAnimatedCounters();
    initMagneticButtons();
    initPerspectiveScroll();
    initSvgDraw();
    initStaggerChildren();
    initFocusCards();
    initScrollProgress();
    initSpotlight();
    initTilt();
    initMarquee();
    initTimeline();
    initTypewriter();
    initRipple();
    initPageTransitions();
    initParallax();
  }

  /* ----------------------------------------------------------
     8. SCROLL PROGRESS BAR — fixed top gradient bar
     ---------------------------------------------------------- */
  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress-bar');
    if (!bar) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY / max) : 0;
      bar.style.transform = 'scaleX(' + p + ')';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ----------------------------------------------------------
     9. SPOTLIGHT — soft cursor-follow glow (desktop only)
     ---------------------------------------------------------- */
  function initSpotlight() {
    if (window.matchMedia('(hover: none)').matches) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const glow = document.createElement('div');
    glow.className = 'spotlight-glow';
    document.body.appendChild(glow);
    let x = -500, y = -500, tx = -500, ty = -500;
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      glow.style.opacity = '1';
    }, { passive: true });
    (function loop() {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.left = x + 'px';
      glow.style.top = y + 'px';
      requestAnimationFrame(loop);
    })();
  }

  /* ----------------------------------------------------------
     10. TILT CARDS — rAF-lerped 3D tilt (buttery smooth)
     JS owns the transform: target angles ease toward the cursor
     every frame. No CSS transition fighting = no jitter/lag.
     ---------------------------------------------------------- */
  function initTilt() {
    const cards = document.querySelectorAll('[data-tilt]');
    if (!cards.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return; // touch devices: skip

    cards.forEach(card => {
      if (card.dataset.tiltReady) return;
      card.dataset.tiltReady = '1';
      card.classList.add('tilt-card');

      const maxTilt = parseFloat(card.getAttribute('data-tilt-max')) || 8;
      const LIFT = 4;      // px raise while tilted
      const LERP = 0.15;   // easing factor per frame (lower = smoother/glidey)

      let hovering = false;
      let rafId = null;
      let leaveTimer = null;
      const cur = { rx: 0, ry: 0, lift: 0 };
      const tgt = { rx: 0, ry: 0, lift: 0 };

      function cleanup() {
        if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
        card.style.removeProperty('transform');
        card.style.removeProperty('transition');
        card.classList.remove('tilting');
      }

      function apply() {
        card.style.setProperty('transform',
          'perspective(700px) rotateX(' + cur.rx.toFixed(3) + 'deg) rotateY(' + cur.ry.toFixed(3) + 'deg) translateY(' + cur.lift.toFixed(2) + 'px)',
          'important');
      }

      function frame() {
        cur.rx += (tgt.rx - cur.rx) * LERP;
        cur.ry += (tgt.ry - cur.ry) * LERP;
        cur.lift += (tgt.lift - cur.lift) * LERP;
        apply();

        const settled = !hovering &&
          Math.abs(tgt.rx - cur.rx) < 0.02 &&
          Math.abs(tgt.ry - cur.ry) < 0.02 &&
          Math.abs(tgt.lift - cur.lift) < 0.05;
        if (settled) {
          // hand control back to CSS: clear all inline overrides
          cleanup();
          return;
        }
        rafId = requestAnimationFrame(frame);
      }

      function ensureLoop() {
        if (rafId === null) rafId = requestAnimationFrame(frame);
      }

      card.addEventListener('mouseenter', () => {
        hovering = true;
        if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null; }
        card.classList.add('tilting');
        // JS owns transform: kill transform transitions but keep shadow/border CSS transitions alive
        card.style.setProperty('transition',
          'transform 0s linear, box-shadow .4s cubic-bezier(.22,1,.36,1), border-color .35s ease', 'important');
        ensureLoop();
      });

      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;   // -1 .. 1
        const ny = ((e.clientY - r.top) / r.height) * 2 - 1;   // -1 .. 1
        tgt.rx = (-ny) * maxTilt;
        tgt.ry = (nx) * maxTilt;
        tgt.lift = -LIFT;
        ensureLoop();
      });

      card.addEventListener('mouseleave', () => {
        hovering = false;
        tgt.rx = 0; tgt.ry = 0; tgt.lift = 0;
        ensureLoop(); // eases back to flat
        // deterministic cleanup: no matter what, styles clear after 700ms
        if (leaveTimer) clearTimeout(leaveTimer);
        leaveTimer = setTimeout(() => {
          if (!hovering) { cleanup(); cur.rx = 0; cur.ry = 0; cur.lift = 0; }
          leaveTimer = null;
        }, 700);
      });
    });
  }

  /* ----------------------------------------------------------
     11. MARQUEE — duplicate track content for seamless loop
     ---------------------------------------------------------- */
  function initMarquee() {
    const tracks = document.querySelectorAll('.marquee-track');
    if (!tracks.length) return;
    tracks.forEach(track => {
      if (track.dataset.marqueeReady) return;
      track.dataset.marqueeReady = '1';
      const dur = track.getAttribute('data-marquee-duration');
      if (dur) track.style.setProperty('--marquee-duration', dur);
      track.innerHTML += track.innerHTML; // duplicate for seamless -50% loop
    });
  }
  
  /* ----------------------------------------------------------
     12. TIMELINE — draw line + pop nodes on scroll
     ---------------------------------------------------------- */
  function initTimeline() {
    const timelines = document.querySelectorAll('.timeline-anim');
    if (!timelines.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('timeline-line-drawn');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    timelines.forEach(t => observer.observe(t));
  }

  /* ----------------------------------------------------------
     13. TYPEWRITER — types [data-typewriter] text on view
     ---------------------------------------------------------- */
  function initTypewriter() {
    const els = document.querySelectorAll('[data-typewriter]');
    if (!els.length) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);
        const text = el.getAttribute('data-typewriter');
        if (reduced) { el.textContent = text; return; }
        el.textContent = '';
        const caret = document.createElement('span');
        caret.className = 'typewriter-caret';
        el.after(caret);
        let i = 0;
        const speed = parseInt(el.getAttribute('data-typewriter-speed')) || 45;
        (function type() {
          if (i <= text.length) {
            el.textContent = text.slice(0, i);
            i++;
            setTimeout(type, speed);
          } else {
            setTimeout(() => caret.remove(), 1800);
          }
        })();
      });
    }, { threshold: 0.4 });
    els.forEach(el => observer.observe(el));
  }

  /* ----------------------------------------------------------
     14. RIPPLE — click feedback on .magnetic-btn and .btn-primary
     ---------------------------------------------------------- */
  function initRipple() {
    const hosts = document.querySelectorAll('.btn-primary, .btn-gold, .btn-dash, .magnetic-btn');
    if (!hosts.length) return;
    hosts.forEach(host => {
      if (host.dataset.rippleReady) return;
      host.dataset.rippleReady = '1';
      host.classList.add('ripple-host');
      host.addEventListener('click', (e) => {
        const rect = host.getBoundingClientRect();
        const ink = document.createElement('span');
        ink.className = 'ripple-ink';
        const size = Math.max(rect.width, rect.height);
        ink.style.width = ink.style.height = size + 'px';
        ink.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ink.style.top = (e.clientY - rect.top - size / 2) + 'px';
        host.appendChild(ink);
        setTimeout(() => ink.remove(), 650);
      });
    });
  }

  /* ----------------------------------------------------------
     15. PAGE TRANSITIONS — fade-out on internal page nav clicks
     ---------------------------------------------------------- */
  function initPageTransitions() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      // Only intercept same-origin .html page links, not anchors/downloads/new tabs
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || link.target === '_blank') return;
      if (!/\.html($|\?|#)/.test(href)) return;
      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(() => { window.location.href = href; }, 220);
    });
  }

  /* ----------------------------------------------------------
     16. PARALLAX — soft float on [data-parallax] elements
     ---------------------------------------------------------- */
  function initParallax() {
    const els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      els.forEach(el => {
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        const offset = (rect.top + rect.height / 2 - vh / 2) * speed;
        el.style.transform = 'translateY(' + offset.toFixed(1) + 'px)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ----------------------------------------------------------
     1. BLUR REVEAL — IntersectionObserver based
     ---------------------------------------------------------- */
  function initBlurReveal() {
    const els = document.querySelectorAll('.blur-reveal, .blur-reveal-light, .blur-reveal-left, .blur-reveal-right, .blur-reveal-zoom');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
  }

  /* ----------------------------------------------------------
     2. ANIMATED COUNTERS — Count up on scroll
     ---------------------------------------------------------- */
  function initAnimatedCounters() {
    const counters = document.querySelectorAll('[data-counter], [data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateAdvancedCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  function animateAdvancedCounter(el) {
    // Support both data-counter and data-count attributes
    const target = parseFloat(el.getAttribute('data-counter') || el.getAttribute('data-count'));
    if (isNaN(target)) return;
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;

      el.textContent = prefix + current.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* ----------------------------------------------------------
     3. MAGNETIC CURSOR HOVER — Buttons follow cursor slightly
     ---------------------------------------------------------- */
  function initMagneticButtons() {
    const btns = document.querySelectorAll('.magnetic-btn');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const strength = 0.3;

        btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ----------------------------------------------------------
     4. PERSPECTIVE SCROLL — 3D rotate on scroll
     ---------------------------------------------------------- */
  function initPerspectiveScroll() {
    const cards = document.querySelectorAll('.perspective-card');
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', () => handlePerspectiveScroll(entry.target), { passive: true });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
  }

  function handlePerspectiveScroll(card) {
    const rect = card.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const cardCenter = rect.top + rect.height / 2;
    const offset = (cardCenter - viewportCenter) / viewportCenter;
    const rotateY = -15 + (offset * 10);
    const clamped = Math.max(-25, Math.min(-5, rotateY));
    card.style.transform = `rotateY(${clamped}deg)`;
  }

  /* ----------------------------------------------------------
     5. SVG PATH DRAW — Animate stroke-dashoffset on scroll
     ---------------------------------------------------------- */
  function initSvgDraw() {
    const svgs = document.querySelectorAll('.svg-draw');
    if (!svgs.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('drawn');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    svgs.forEach(svg => observer.observe(svg));
  }

  /* ----------------------------------------------------------
     6. STAGGER CHILDREN — Animate children in sequence
     ---------------------------------------------------------- */
  function initStaggerChildren() {
    const containers = document.querySelectorAll('.stagger-children');
    if (!containers.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    containers.forEach(el => observer.observe(el));
  }

  /* ----------------------------------------------------------
     7. FOCUS CARDS — Click to activate/expand
     ---------------------------------------------------------- */
  function initFocusCards() {
    const cards = document.querySelectorAll('.focus-card');
    if (!cards.length) return;

    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }

})();
