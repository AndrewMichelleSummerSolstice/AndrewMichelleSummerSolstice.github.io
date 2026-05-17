/* =========================================================
   countdown.js — Countdown timer to June 21, 2026 6:00 PM
   ========================================================= */

(function () {
  'use strict';

  // Wedding date: June 21, 2026 at 6:00 PM local time
  const WEDDING_DATE = new Date('2026-06-21T18:00:00');

  const daysEl    = document.getElementById('cd-days');
  const hoursEl   = document.getElementById('cd-hours');
  const minsEl    = document.getElementById('cd-mins');
  const secsEl    = document.getElementById('cd-secs');
  const countdownEl = document.getElementById('countdown');
  const marriedEl   = document.getElementById('countdown-married');

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function tick() {
    const now  = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      // Wedding has happened — show "Just Married!" message
      if (countdownEl)  countdownEl.style.display = 'none';
      if (marriedEl)    marriedEl.style.display    = 'block';
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const days  = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins  = Math.floor((totalSecs % 3600) / 60);
    const secs  = totalSecs % 60;

    if (daysEl)  daysEl.textContent  = days;
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minsEl)  minsEl.textContent  = pad(mins);
    if (secsEl)  secsEl.textContent  = pad(secs);
  }

  document.addEventListener('DOMContentLoaded', () => {
    tick();
    setInterval(tick, 1000);
  });
})();
