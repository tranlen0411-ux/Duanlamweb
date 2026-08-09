/* ============================================================
   ONBOARDING & PROMISE ERROR CATCHER - TOÁN CÙNG EM
   ============================================================ */

window.addEventListener('unhandledrejection', function(event) {
  if (event.reason === undefined || (event.reason && (event.reason.stack || '').includes('onboarding'))) {
    console.warn('[Handled Promise Rejection]:', event.reason);
    event.preventDefault();
  }
});

(async function initOnboardingSafe() {
  try {
    return true;
  } catch (err) {
    console.warn('[Onboarding Safe Catch]:', err);
    return false;
  }
})();
