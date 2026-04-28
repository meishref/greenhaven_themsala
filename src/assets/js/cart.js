/**
 * GREEN HAVEN PRO — cart.js
 * Slide cart drawer + live quantity update + Salla Cart API
 */
(function () {
    'use strict';

    const GH = window.GreenHaven || {};
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('global-overlay');
    const openBtn = document.getElementById('cart-toggle-btn');
    const closeBtn = document.getElementById('cart-drawer-close');
    const countBadge = document.getElementById('cart-count');
    const drawerCount = document.getElementById('cart-drawer-count');

    /* ── Open / Close ────────────────────────────────────────── */
    function openCart() {
        drawer && drawer.classList.add('is-open');
        overlay && overlay.classList.add('is-active');
        openBtn && openBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeCart() {
        drawer && drawer.classList.remove('is-open');
        overlay && overlay.classList.remove('is-active');
        openBtn && openBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    openBtn && openBtn.addEventListener('click', openCart);
    closeBtn && closeBtn.addEventListener('click', closeCart);
    overlay && overlay.addEventListener('click', closeCart);
    document.querySelectorAll('#cart-continue-btn, #cart-continue-btn2').forEach(b => b.addEventListener('click', closeCart));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

    /* ── Update count badge ──────────────────────────────────── */
    function setCount(n) {
        if (countBadge) { countBadge.textContent = n; countBadge.style.display = n > 0 ? '' : 'none'; }
        if (drawerCount) drawerCount.textContent = n;
    }

    /* ── Update shipping bar ─────────────────────────────────── */
    function updateShippingBar(subtotal) {
        const threshold = 200;
        const fill = document.getElementById('cart-shipping-fill');
        const text = document.getElementById('cart-shipping-text');
        if (!fill || !text) return;
        const pct = Math.min((subtotal / threshold) * 100, 100);
        fill.style.width = pct + '%';
        if (subtotal >= threshold) {
            text.innerHTML = '<strong>' + (GH.i18n.freeShippingAchieved || '🎉 حصلت على شحن مجاني!') + '</strong>';
        } else {
            const remaining = (threshold - subtotal).toFixed(0);
            text.textContent = (GH.i18n.freeShippingMsg || 'أضف {{amount}} للحصول على شحن مجاني!')
                .replace('{{amount}}', remaining + ' ' + (GH.currency || 'ر.س'));
        }
    }

    /* ── Salla API: Add to cart ──────────────────────────────── */
    function addToCart(productId, qty, btn) {
        if (!productId) return;
        if (btn) { btn.disabled = true; btn.classList.add('btn--loading'); }

        // Try Salla Web Components API first
        if (window.salla && salla.cart) {
            salla.cart.addItem({ id: productId, quantity: qty || 1 })
                .then(res => {
                    if (btn) { btn.disabled = false; btn.classList.remove('btn--loading'); }
                    setCount(res.count);
                    window.GHToast && window.GHToast(GH.i18n.addedToCart || 'تمت الإضافة للسلة', 'success');
                    openCart();
                })
                .catch(() => {
                    if (btn) { btn.disabled = false; btn.classList.remove('btn--loading'); }
                    window.GHToast && window.GHToast(GH.i18n.error || 'حدث خطأ', 'error');
                });
            return;
        }

        // Fallback: REST
        fetch('/api/cart/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            body: JSON.stringify({ product_id: productId, quantity: qty || 1 })
        })
            .then(r => r.json())
            .then(data => {
                if (btn) { btn.disabled = false; btn.classList.remove('btn--loading'); }
                setCount(data.count || 0);
                window.GHToast && window.GHToast(GH.i18n.addedToCart || 'تمت الإضافة للسلة', 'success');
                openCart();
            })
            .catch(() => {
                if (btn) { btn.disabled = false; btn.classList.remove('btn--loading'); }
                window.GHToast && window.GHToast(GH.i18n.error || 'حدث خطأ', 'error');
            });
    }

    /* ── Remove item ─────────────────────────────────────────── */
    function removeItem(itemId, row) {
        fetch('/api/cart/items/' + itemId, {
            method: 'DELETE',
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
            .then(r => r.json())
            .then(data => {
                row && row.remove();
                setCount(data.count || 0);
            })
            .catch(() => window.GHToast && window.GHToast(GH.i18n.error, 'error'));
    }

    /* ── Update quantity ─────────────────────────────────────── */
    function updateQty(itemId, qty) {
        fetch('/api/cart/items/' + itemId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            body: JSON.stringify({ quantity: qty })
        })
            .then(r => r.json())
            .then(data => setCount(data.count || 0))
            .catch(() => { });
    }

    /* ── Event delegation for cart actions ───────────────────── */
    document.addEventListener('click', function (e) {
        // Add to cart (product card quick add)
        const atcBtn = e.target.closest('[data-action="add-to-cart"]');
        if (atcBtn) {
            const pid = atcBtn.dataset.product;
            const qtyInput = document.getElementById('product-qty');
            const qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;
            addToCart(pid, qty, atcBtn);
            return;
        }

        // Remove cart item
        const removeBtn = e.target.closest('[data-action="remove"]');
        if (removeBtn) {
            const row = removeBtn.closest('.cart-item');
            removeItem(removeBtn.dataset.itemId, row);
            return;
        }

        // Qty stepper inside cart
        const stepBtn = e.target.closest('.qty-stepper__btn');
        if (stepBtn) {
            const stepper = stepBtn.closest('.qty-stepper');
            const input = stepper.querySelector('.qty-stepper__value');
            const itemId = input && input.dataset.itemId;
            const direction = stepBtn.dataset.action;
            if (!input) return;
            let val = parseInt(input.value, 10);
            if (direction === 'increase') val = Math.min(val + 1, parseInt(input.max || 99, 10));
            if (direction === 'decrease') val = Math.max(val - 1, 1);
            input.value = val;
            if (itemId) updateQty(itemId, val);
            return;
        }
    });

    // Expose add to cart globally
    window.GHCart = { addToCart, openCart, closeCart, setCount };
})();
