/**
 * GREEN HAVEN PRO — product.js
 * Gallery thumbnails, quick-view modal, product page interactions
 */
(function () {
    'use strict';

    /* ── Gallery ──────────────────────────────────────────────── */
    const mainImg = document.getElementById('gallery-main-img');
    const thumbs = document.querySelectorAll('.product-gallery__thumb');

    thumbs.forEach(thumb => {
        thumb.addEventListener('click', function () {
            thumbs.forEach(t => t.classList.remove('is-active'));
            this.classList.add('is-active');
            if (mainImg) {
                mainImg.style.opacity = '0';
                setTimeout(() => {
                    mainImg.src = this.dataset.src;
                    mainImg.style.opacity = '1';
                }, 150);
            }
        });
    });

    /* ── Sticky ATC on mobile ─────────────────────────────────── */
    const stickyAtc = document.getElementById('sticky-atc');
    const productInfo = document.getElementById('add-to-cart-btn');

    if (stickyAtc && productInfo) {
        const atcObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                stickyAtc.classList.toggle('is-visible', !entry.isIntersecting);
            });
        }, { threshold: 0 });
        atcObserver.observe(productInfo);
    }

    /* ── Product page qty controls ────────────────────────────── */
    const qtyEl = document.getElementById('product-qty');
    const decreaseBtn = document.getElementById('qty-decrease');
    const increaseBtn = document.getElementById('qty-increase');

    decreaseBtn && decreaseBtn.addEventListener('click', () => {
        if (qtyEl) qtyEl.value = Math.max(1, parseInt(qtyEl.value, 10) - 1);
    });
    increaseBtn && increaseBtn.addEventListener('click', () => {
        if (qtyEl) qtyEl.value = Math.min(parseInt(qtyEl.max || 99, 10), parseInt(qtyEl.value, 10) + 1);
    });

    /* ── Product option selection ─────────────────────────────── */
    document.addEventListener('click', function (e) {
        const choice = e.target.closest('.product-option__choice');
        if (!choice || choice.disabled) return;
        const group = choice.closest('.product-option__choices');
        group.querySelectorAll('.product-option__choice').forEach(c => c.classList.remove('is-active'));
        choice.classList.add('is-active');
        const label = choice.closest('.product-option');
        const valDisplay = label && label.querySelector(`#option-${choice.dataset.option}-value`);
        if (valDisplay) valDisplay.textContent = ': ' + choice.dataset.value;
    });

    /* ── Quick View Modal ──────────────────────────────────────── */
    const qvModal = document.getElementById('quick-view-modal');
    const qvClose = document.getElementById('quick-view-close');
    const qvImage = document.getElementById('qv-image');
    const qvName = document.getElementById('qv-name');
    const qvPrice = document.getElementById('qv-price');
    const qvLink = document.getElementById('qv-view-more');
    const qvAtcBtn = document.getElementById('qv-add-to-cart');
    const qvScarcity = document.getElementById('qv-scarcity');
    const qvScarcityText = document.getElementById('qv-scarcity-text');

    function openQuickView(productId) {
        if (!qvModal) return;

        // Show loading state
        if (qvImage) qvImage.src = '';
        if (qvName) qvName.textContent = '...';
        if (qvPrice) qvPrice.textContent = '...';
        qvModal.showModal();

        // Fetch product data from Salla API
        fetch('/api/products/' + productId, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(p => {
                if (qvImage) { qvImage.src = p.thumbnail || p.images?.[0]?.url || ''; qvImage.alt = p.name; }
                if (qvName) qvName.textContent = p.name;
                if (qvPrice) qvPrice.textContent = p.price_formatted || p.price;
                if (qvLink) qvLink.href = p.url;
                if (qvAtcBtn) qvAtcBtn.dataset.product = p.id;
                if (qvScarcity && qvScarcityText && p.quantity > 0 && p.quantity <= 10) {
                    qvScarcity.style.display = 'flex';
                    qvScarcityText.textContent = 'بقي ' + p.quantity + ' فقط!';
                }
            })
            .catch(() => {
                if (qvName) qvName.textContent = 'تعذّر تحميل المنتج';
            });
    }

    // Quick view button clicks
    document.addEventListener('click', function (e) {
        const qvBtn = e.target.closest('[data-action="quick-view"]');
        if (qvBtn) openQuickView(qvBtn.dataset.product);
    });

    qvClose && qvClose.addEventListener('click', () => qvModal && qvModal.close());
    qvModal && qvModal.addEventListener('click', function (e) {
        if (e.target === qvModal) qvModal.close();
    });

    // Add to cart from quick view
    qvAtcBtn && qvAtcBtn.addEventListener('click', function () {
        const pid = this.dataset.product;
        window.GHCart && window.GHCart.addToCart(pid, 1, this);
        qvModal && qvModal.close();
    });

    /* ── Wishlist ─────────────────────────────────────────────── */
    const GH = window.GreenHaven || {};
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('[data-action="wishlist"]');
        if (!btn) return;
        const pid = btn.dataset.product;
        const pressed = btn.getAttribute('aria-pressed') === 'true';

        fetch('/api/wishlist/' + (pressed ? 'remove' : 'add') + '/' + pid, {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(data => {
                btn.setAttribute('aria-pressed', !pressed);
                const svg = btn.querySelector('svg');
                if (svg) svg.setAttribute('fill', !pressed ? 'currentColor' : 'none');
                const msg = !pressed ? (GH.i18n && GH.i18n.addedToWishlist || 'تمت الإضافة للمفضلة') : 'تمت الإزالة من المفضلة';
                window.GHToast && window.GHToast(msg, 'success');
            })
            .catch(() => window.GHToast && window.GHToast(GH.i18n && GH.i18n.error || 'حدث خطأ', 'error'));
    });
})();
