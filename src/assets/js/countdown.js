/**
 * GREEN HAVEN PRO — countdown.js
 * Flash sale countdown timer
 */
(function () {
    'use strict';

    const el = document.getElementById('flash-countdown');
    if (!el) return;

    const endDateStr = el.dataset.end;
    if (!endDateStr) return;

    // Parse date: "YYYY-MM-DD HH:MM"
    const endDate = new Date(endDateStr.replace(' ', 'T'));
    if (isNaN(endDate.getTime())) return;

    const days = document.getElementById('cd-days');
    const hours = document.getElementById('cd-hours');
    const mins = document.getElementById('cd-mins');
    const secs = document.getElementById('cd-secs');

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
        const now = new Date();
        const diff = endDate - now;

        if (diff <= 0) {
            el.closest('.flash-sale') && el.closest('.flash-sale').remove();
            return;
        }

        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        if (days) days.textContent = pad(d);
        if (hours) hours.textContent = pad(h);
        if (mins) mins.textContent = pad(m);
        if (secs) secs.textContent = pad(s);
    }

    tick();
    setInterval(tick, 1000);
})();
