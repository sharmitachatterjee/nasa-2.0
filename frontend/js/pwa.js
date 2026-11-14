// PWA Registration & Install Handler
(function () {
  let deferredPrompt = null;

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // registered successfully
        })
        .catch((err) => {
          console.log("SW registration skipped:", err.message);
        });
    });
  }

  // Capture install prompt
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtns = document.querySelectorAll("[data-pwa-install]");
    installBtns.forEach((btn) => {
      btn.hidden = false;
      btn.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          installBtns.forEach((b) => (b.hidden = true));
        }
        deferredPrompt = null;
      });
    });
  });

  // Offline status indicator
  function updateOnlineStatus() {
    let indicator = document.querySelector("#offline-indicator");
    if (!navigator.onLine) {
      if (!indicator) {
        indicator = document.createElement("div");
        indicator.id = "offline-indicator";
        indicator.className = "offline-banner";
        indicator.innerHTML = "📡 Offline Mode Active — Showing Cached Mission Records";
        document.body.prepend(indicator);
      }
    } else if (indicator) {
      indicator.remove();
    }
  }

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  updateOnlineStatus();
})();
