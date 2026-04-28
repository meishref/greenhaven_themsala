/**
 * GREEN HAVEN PRO — theme.js
 * Core initialisation, lazy loading, IntersectionObserver reveal
 */
(function () {
    'use strict';

    const GH = window.GreenHaven || {};

    /* ── IntersectionObserver: lazy images ────────────────── */
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const imgObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const img = entry.target;
            if (img.src) img.classList.add('is-loaded');
            img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
            obs.unobserve(img);
        });
    }, { rootMargin: '200px 0px' });

    lazyImages.forEach(img => imgObserver.observe(img));

    /* ── IntersectionObserver: scroll reveals ─────────────── */
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.12 });

    revealEls.forEach(el => revealObserver.observe(el));

    /* ── Tab system ────────────────────────────────────────── */
    document.addEventListener('click', function (e) {
        const tabBtn = e.target.closest('[data-tab]');
        if (!tabBtn) return;
        const tabs = tabBtn.closest('.product-tabs');
        if (!tabs) return;
        const target = tabBtn.dataset.tab;
        tabs.querySelectorAll('.product-tabs__btn').forEach(b => {
            b.classList.toggle('is-active', b.dataset.tab === target);
            b.setAttribute('aria-selected', b.dataset.tab === target);
        });
        tabs.querySelectorAll('.product-tabs__panel').forEach(p => {
            p.classList.toggle('is-active', p.id === 'panel-' + target);
        });
    });

    /* ── Filter toggle ─────────────────────────────────────── */
    document.addEventListener('click', function (e) {
        const toggle = e.target.closest('[data-toggle="filter"]');
        if (toggle) toggle.closest('.catalog-filter').classList.toggle('is-collapsed');
    });

    /* ── Newsletter form ───────────────────────────────────── */
    function bindNewsletterForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = form.querySelector('[type="email"]').value.trim();
            if (!email || !email.includes('@')) {
                window.GHToast && window.GHToast(GH.i18n.newsletterError, 'error');
                return;
            }
            const btn = form.querySelector('button[type="submit"]');
            if (btn) { btn.disabled = true; btn.classList.add('btn--loading'); }
            // Salla API call
            fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ email })
            })
                .then(() => {
                    if (btn) { btn.disabled = false; btn.classList.remove('btn--loading'); }
                    window.GHToast && window.GHToast(GH.i18n.newsletterSuccess || '✅ تم الاشتراك!', 'success');
                    form.reset();
                })
                .catch(() => {
                    if (btn) { btn.disabled = false; btn.classList.remove('btn--loading'); }
                    window.GHToast && window.GHToast(GH.i18n.error, 'error');
                });
        });
    }
    bindNewsletterForm('newsletter-form');
    bindNewsletterForm('popup-newsletter-form');

    /* ── Share button ──────────────────────────────────────── */
    document.addEventListener('click', function (e) {
        const shareBtn = e.target.closest('[data-action="share"]');
        if (!shareBtn) return;
        const url = shareBtn.dataset.url || location.href;
        const title = shareBtn.dataset.title || document.title;
        if (navigator.share) {
            navigator.share({ title, url }).catch(() => { });
        } else {
            navigator.clipboard.writeText(url).then(() => {
                window.GHToast && window.GHToast(GH.i18n.copied || 'تم النسخ!', 'success');
            });
        }
    });

    /* ── Sort select ───────────────────────────────────────── */
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            const url = new URL(location.href);
            url.searchParams.set('sort', this.value);
            location.href = url.toString();
        });
    }

    window.GH = GH;
})();
