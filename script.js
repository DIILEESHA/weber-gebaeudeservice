// ================================================================
// WEBER GEBÄUDESERVICE — Website JS
// Cookie Banner, Nav, Formular-Validierung, Counter, Scroll-Reveal
// ================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── COOKIE BANNER ─────────────────────────────────────────
  const cookieBanner = document.getElementById('cookie-banner');

  const checkCookieConsent = () => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent && cookieBanner) {
      setTimeout(() => cookieBanner.classList.add('show'), 1200);
    }
  };
  checkCookieConsent();

  window.acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    if (cookieBanner) {
      cookieBanner.style.transition = 'transform .4s ease';
      cookieBanner.classList.remove('show');
    }
  };

  window.declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    if (cookieBanner) cookieBanner.classList.remove('show');
  };

  window.resetCookieConsent = () => {
    localStorage.removeItem('cookieConsent');
    localStorage.removeItem('cookieConsentDate');
    if (cookieBanner) cookieBanner.classList.add('show');
  };


  // ── NAV SCROLL ────────────────────────────────────────────
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  // ── MOBILE NAV ────────────────────────────────────────────
  const hamburger    = document.getElementById('hamburger');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobClose     = document.getElementById('mobClose');

  const openMenu = () => {
    if (!mobileOverlay) return;
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    const spans = hamburger?.querySelectorAll('span');
    if (spans) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    }
  };

  const closeMenu = () => {
    if (!mobileOverlay) return;
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
    const spans = hamburger?.querySelectorAll('span');
    if (spans) {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  };

  hamburger?.addEventListener('click', () =>
    mobileOverlay?.classList.contains('open') ? closeMenu() : openMenu()
  );
  mobClose?.addEventListener('click', closeMenu);
  mobileOverlay?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));


  // ── SMOOTH SCROLL ─────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href   = anchor.getAttribute('href');
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = (nav?.offsetHeight || 70) + 16;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  // ── SCROLL REVEAL ─────────────────────────────────────────
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children within same parent
        const siblings = [...(entry.target.parentElement?.querySelectorAll('[data-reveal]') || [])];
        const idx      = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), idx * 100);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  revealEls.forEach(el => revealObs.observe(el));


  // ── STAT COUNTERS ─────────────────────────────────────────
  const counterEls = document.querySelectorAll('[data-count]');

  const animateCount = (el) => {
    const target   = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const startT   = performance.now();
    const suffix   = el.nextElementSibling?.textContent?.includes('Jahr') ? '' : '+';

    const tick = (now) => {
      const t      = Math.min((now - startT) / duration, 1);
      const eased  = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(target * eased) + (t === 1 ? suffix : '');
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => counterObs.observe(el));


  // ── HERO PARALLAX ─────────────────────────────────────────
  const heroImg = document.getElementById('heroImg');
  if (heroImg) {
    window.addEventListener('scroll', () => {
      if (window.scrollY < window.innerHeight * 1.2) {
        heroImg.style.transform = `scale(1.06) translateY(${window.scrollY * 0.15}px)`;
      }
    }, { passive: true });
  }


  // ══════════════════════════════════════════════════════════
  // ── KONTAKT FORMULAR VALIDIERUNG ──────────────────────────
  // ══════════════════════════════════════════════════════════
  const kontaktForm = document.getElementById('kontaktForm');
  const kfSubmitBtn = document.getElementById('kfSubmit');
  const formSuccess = document.getElementById('formSuccess');
  const successName = document.getElementById('successName');

  if (kontaktForm) {

    const fields = {
      'kf-name':     { el: document.getElementById('kf-name'),     errId: 'err-kf-name' },
      'kf-telefon':  { el: document.getElementById('kf-telefon'),  errId: 'err-kf-telefon' },
      'kf-email':    { el: document.getElementById('kf-email'),    errId: 'err-kf-email' },
      'kf-service':  { el: document.getElementById('kf-service'),  errId: 'err-kf-service' },
      'kf-dsgvo':    { el: document.getElementById('kf-dsgvo'),    errId: 'err-kf-dsgvo' },
    };

    // Show / clear error helpers
    const showErr = (key, msg) => {
      const f = fields[key];
      const errEl = document.getElementById(f.errId);
      if (errEl) errEl.textContent = msg;
      if (f.el)  f.el.classList.toggle('f-invalid', !!msg);
    };
    const clearErr = (key) => showErr(key, '');

    // Live clearing
    Object.entries(fields).forEach(([key, { el }]) => {
      if (!el) return;
      const evt = el.type === 'checkbox' ? 'change' : 'input';
      el.addEventListener(evt, () => clearErr(key));
    });

    // Validate all
    const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const TEL_RX   = /^[\d\s\+\-\(\)]{6,}$/;

    const validate = () => {
      let ok = true;

      // Name
      if (!fields['kf-name'].el.value.trim()) {
        showErr('kf-name', 'Bitte geben Sie Ihren Namen ein.'); ok = false;
      } else clearErr('kf-name');

      // Telefon
      const tel = fields['kf-telefon'].el.value.trim();
      if (!tel) {
        showErr('kf-telefon', 'Bitte geben Sie Ihre Telefonnummer ein.'); ok = false;
      } else if (!TEL_RX.test(tel)) {
        showErr('kf-telefon', 'Bitte geben Sie eine gültige Telefonnummer ein.'); ok = false;
      } else clearErr('kf-telefon');

      // E-Mail
      const email = fields['kf-email'].el.value.trim();
      if (!email) {
        showErr('kf-email', 'Bitte geben Sie Ihre E-Mail-Adresse ein.'); ok = false;
      } else if (!EMAIL_RX.test(email)) {
        showErr('kf-email', 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'); ok = false;
      } else clearErr('kf-email');

      // Service
      if (!fields['kf-service'].el.value) {
        showErr('kf-service', 'Bitte wählen Sie eine Leistung aus.'); ok = false;
      } else clearErr('kf-service');

      // DSGVO
      if (!fields['kf-dsgvo'].el.checked) {
        showErr('kf-dsgvo', 'Bitte stimmen Sie der Datenschutzerklärung zu.'); ok = false;
      } else clearErr('kf-dsgvo');

      return ok;
    };

    // Submit
    kontaktForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validate()) {
        const firstBad = kontaktForm.querySelector('.f-invalid');
        if (firstBad) {
          const top = firstBad.getBoundingClientRect().top + window.scrollY - (nav?.offsetHeight || 70) - 24;
          window.scrollTo({ top, behavior: 'smooth' });
          setTimeout(() => firstBad.focus({ preventScroll: true }), 500);
        }
        return;
      }

      // Loading
      kfSubmitBtn.classList.add('loading');
      kfSubmitBtn.disabled = true;

      // ── Hier Ihren API-Aufruf einfügen ───────────────────────
      // z.B. fetch('/api/kontakt', { method: 'POST', body: formData })
      await new Promise(res => setTimeout(res, 1600));
      // ─────────────────────────────────────────────────────────

      // Success
      const name = fields['kf-name'].el.value.trim().split(' ')[0];
      if (successName) successName.textContent = name + '!';

      kontaktForm.style.transition = 'opacity .4s ease, transform .4s ease';
      kontaktForm.style.opacity    = '0';
      kontaktForm.style.transform  = 'translateY(12px)';

      setTimeout(() => {
        kontaktForm.style.display = 'none';
        if (formSuccess) {
          formSuccess.classList.add('visible');
          const top = formSuccess.getBoundingClientRect().top + window.scrollY - (nav?.offsetHeight || 70) - 20;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 420);
    });
  }


  // ── FOCUS MICRO-INTERACTIONS ──────────────────────────────
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('focus',  () => el.closest('.form-group')?.classList.add('focused'));
    el.addEventListener('blur',   () => el.closest('.form-group')?.classList.remove('focused'));
  });


  // ── ACTIVE NAV LINK ON SCROLL ─────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');

  const activateNavLink = () => {
    const scrollY = window.scrollY;
    sections.forEach(section => {
      const top    = section.offsetTop - (nav?.offsetHeight || 70) - 50;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + section.id) {
            link.classList.add('active');
          }
        });
      }
    });
  };
  window.addEventListener('scroll', activateNavLink, { passive: true });


  // ── EXTERNAL LINK SECURITY ────────────────────────────────
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    if (!link.rel.includes('noopener')) {
      link.rel = 'noopener noreferrer';
    }
  });

});
