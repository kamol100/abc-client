/**
 * Notify the service worker to clear all caches.
 * Call this on logout, tenant switch, or impersonation changes
 * to prevent stale data leakage between tenants.
 */
export function clearServiceWorkerCaches() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !navigator.serviceWorker.controller
  ) {
    return;
  }
  navigator.serviceWorker.controller.postMessage("CLEAR_CACHES");
}
