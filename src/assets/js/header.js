/**
 * GREEN HAVEN PRO — header.js
 * Sticky scroll effect, mobile menu, mobile search
 */
(function () {
    'use strict';

    const header = document.getElementById('site-header');
    const overlay = document.getElementById('global-overlay');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const menuClose = document.getElementById('mobile-menu-close');

    /* ── Transparent → solid on scroll ──────────────────────── */
    let lastScroll = 0;
    function onScroll() {
        const y = window.scrollY;
        if (!header) return;
        if (y > 60) {
            header.classList.remove('header--transparent');
            header.classList.add('header--solid');
        } else {
            header.classList.add('header--transparent');
            header.classList.remove('header--solid');
        }
        // Hide on scroll down, show on scroll up
        if (y > 300 && y > lastScroll) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        lastScroll = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    /* ── Mobile menu open / close ────────────────────────────── */
    function openMobileMenu() {
        mobileMenu && mobileMenu.classList.add('is-open');
        overlay && overlay.classList.add('is-active');
        menuToggle && menuToggle.setAttribute('aria-expanded', 'true');
        mobileMenu && mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    function closeMobileMenu() {
        mobileMenu && mobileMenu.classList.remove('is-open');
        overlay && overlay.classList.remove('is-active');
        menuToggle && menuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu && mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    menuToggle && menuToggle.addEventListener('click', openMobileMenu);
    menuClose && menuClose.addEventListener('click', closeMobileMenu);
    overlay && overlay.addEventListener('click', closeMobileMenu);

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMobileMenu();
    });

    /* ── Mobile search panel ─────────────────────────────────── */
    const searchToggle = document.getElementById('mobile-search-toggle');
    const searchPanel = document.getElementById('mobile-search-panel');
    const searchClose = document.getElementById('mobile-search-close');

    if (searchToggle && searchPanel) {
        searchToggle.addEventListener('click', function () {
            searchPanel.hidden = false;
            const input = document.getElementById('mobile-search-field');
            input && input.focus();
        });
        searchClose && searchClose.addEventListener('click', function () {
            searchPanel.hidden = true;
        });
    }

    /* ── Header search submit ────────────────────────────────── */
    function bindSearch(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && input.value.trim()) {
                window.location.href = '/search?q=' + encodeURIComponent(input.value.trim());
            }
        });
    }
    bindSearch('header-search-input');
    bindSearch('mobile-search-field');
    bindSearch('mobile-search-input');
})();
