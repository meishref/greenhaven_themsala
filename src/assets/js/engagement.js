/**
 * GREEN HAVEN PRO — engagement.js
 * Toast notifications, WhatsApp btn, back-to-top,
 * newsletter popup, exit-intent popup, recently viewed
 */
(function () {
    'use strict';

    const GH = window.GreenHaven || {};

    /* ══════════════════════════════════════════════════════════
       TOAST NOTIFICATION SYSTEM
    ══════════════════════════════════════════════════════════ */
    const toastContainer = document.getElementById('toast-container');

    function GHToast(message, type = 'success', duration = 4000) {
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast toast--' + type;
        toast.setAttribute('role', 'alert');

        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        };

        toast.innerHTML = `
      <div class="toast__icon">${icons[type] || icons.success}</div>
      <span>${message}</span>
      <button class="toast__close" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    `;

        toastContainer.appendChild(toast);

        const closeBtn = toast.querySelector('.toast__close');
        function dismiss() {
            toast.classList.add('is-leaving');
            setTimeout(() => toast.remove(), 350);
        }
        closeBtn && closeBtn.addEventListener('click', dismiss);
        setTimeout(dismiss, duration);
    }

    // Export globally
    window.GHToast = GHToast;

    /* ══════════════════════════════════════════════════════════
       BACK TO TOP BUTTON
    ══════════════════════════════════════════════════════════ */
    if (GH.showBackToTop !== false) {
        const backBtn = document.getElementById('back-to-top');
        if (backBtn) {
            window.addEventListener('scroll', function () {
                const visible = window.scrollY > 400;
                backBtn.style.display = visible ? 'flex' : 'none';
                backBtn.style.opacity = visible ? '1' : '0';
            }, { passive: true });

            backBtn.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    /* ══════════════════════════════════════════════════════════
       NEWSLETTER POPUP
    ══════════════════════════════════════════════════════════ */
    const nlPopup = document.getElementById('newsletter-popup');
    const nlPopClose = document.getElementById('newsletter-popup-close');
    const POPUP_KEY = 'gh_nl_popup_seen';

    if (nlPopup && !sessionStorage.getItem(POPUP_KEY)) {
        const delay = (GH.newsletterPopupDelay || 5) * 1000;
        setTimeout(() => {
            nlPopup.showModal();
        }, delay);

        nlPopClose && nlPopClose.addEventListener('click', function () {
            nlPopup.close();
            sessionStorage.setItem(POPUP_KEY, '1');
        });

        nlPopup.addEventListener('click', function (e) {
            if (e.target === nlPopup) {
                nlPopup.close();
                sessionStorage.setItem(POPUP_KEY, '1');
            }
        });
    }

    /* ══════════════════════════════════════════════════════════
       EXIT INTENT POPUP
    ══════════════════════════════════════════════════════════ */
    const exitPopup = document.getElementById('exit-intent-popup');
    const exitClose = document.getElementById('exit-popup-close');
    const EXIT_KEY = 'gh_exit_seen';
    let exitTriggered = false;

    if (GH.showExitIntent && exitPopup && !sessionStorage.getItem(EXIT_KEY)) {
        document.addEventListener('mouseleave', function onMouseLeave(e) {
            if (e.clientY <= 5 && !exitTriggered) {
                exitTriggered = true;
                exitPopup.showModal();
                sessionStorage.setItem(EXIT_KEY, '1');
                document.removeEventListener('mouseleave', onMouseLeave);
            }
        });

        exitClose && exitClose.addEventListener('click', () => exitPopup.close());
        exitPopup.addEventListener('click', e => { if (e.target === exitPopup) exitPopup.close(); });
    }

    /* ══════════════════════════════════════════════════════════
       RECENTLY VIEWED (localStorage)
    ══════════════════════════════════════════════════════════ */
    const RECENT_KEY = 'gh_recently_viewed';
    const MAX_RECENT = 8;

    function getRecentlyViewed() {
        try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
        catch (e) { return []; }
    }

    function saveProduct(product) {
        if (!product) return;
        let items = getRecentlyViewed();
        items = items.filter(p => p.id !== product.id);
        items.unshift(product);
        items = items.slice(0, MAX_RECENT);
        try { localStorage.setItem(RECENT_KEY, JSON.stringify(items)); } catch (e) { }
    }

    function renderRecentlyViewed() {
        const section = document.getElementById('recently-viewed');
        const slider = document.getElementById('recently-viewed-slider');
        if (!section || !slider) return;

        const items = getRecentlyViewed();
        if (items.length < 2) { section.style.display = 'none'; return; }

        section.style.display = '';
        slider.innerHTML = items.map(p => `
      <div class="product-card" role="listitem" style="flex:0 0 220px;">
        <div class="product-card__media">
          <a href="${p.url}">
            <img src="${p.thumbnail}" alt="${p.name}" class="product-card__img" loading="lazy">
          </a>
        </div>
        <div class="product-card__body">
          <a href="${p.url}" class="product-card__name">${p.name}</a>
          <div class="product-card__price">
            <span class="product-card__price-current">${p.price}</span>
          </div>
        </div>
      </div>
    `).join('');
    }

    // Save current product if on product page
    if (window.currentProduct) saveProduct(window.currentProduct);
    renderRecentlyViewed();

    /* ══════════════════════════════════════════════════════════
       SCROLL-TRIGGERED MICRO-INTERACTIONS
    ══════════════════════════════════════════════════════════ */
    // Highlight active nav link based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.header-nav__link');
    let scrollTimer;

    window.addEventListener('scroll', function () {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            let current = '';
            sections.forEach(sec => {
                if (window.scrollY >= sec.offsetTop - 80) current = sec.id;
            });
            navLinks.forEach(link => {
                link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
            });
        }, 50);
    }, { passive: true });
})();
