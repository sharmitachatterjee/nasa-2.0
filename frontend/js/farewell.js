// Farewell Wall - Spacecraft Memorial Guestbook & Tributes
(function () {
  let tributes = [];
  let activeFilter = "all";

  const grid = document.getElementById("tributesGrid");
  const filterBtns = document.querySelectorAll("[data-filter]");
  const modal = document.getElementById("tributeModal");
  const openModalBtn = document.getElementById("openTributeModalBtn");
  const closeModalBtn = document.getElementById("closeTributeModalBtn");
  const tributeForm = document.getElementById("tributeForm");
  const formStatus = document.getElementById("tributeFormStatus");

  async function loadTributes() {
    try {
      const resp = await fetch(`/api/tributes?probe=${activeFilter}`, { cache: "no-store" });
      if (!resp.ok) throw new Error("Could not load tributes");
      tributes = await resp.json();
      renderTributes();
    } catch {
      // Local fallback tributes
      tributes = [
        {
          id: "local-1",
          author: "Mission Control Fan",
          callsign: "OppyForever",
          probe: "opportunity",
          probeName: "Opportunity (MER-B)",
          message: "You outlived your 90-sol warranty by 5,000 sols. You will forever be humanity's bravest little rover.",
          date: "2026-11-14",
          hearts: 142
        },
        {
          id: "local-2",
          author: "Cosmic Wanderer",
          callsign: "PaleBlueDot",
          probe: "voyager1",
          probeName: "Voyager 1",
          message: "Keep singing our song to the stars. 24 billion kilometers away, but right in our hearts.",
          date: "2026-11-13",
          hearts: 98
        }
      ];
      renderTributes();
    }
  }

  function renderTributes() {
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = activeFilter === "all"
      ? tributes
      : tributes.filter((t) => t.probe === activeFilter);

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--muted); padding: 3rem;">No tribute notes found for this spacecraft yet. Be the first to leave one!</div>`;
      return;
    }

    filtered.forEach((t) => {
      const card = document.createElement("div");
      card.className = "tribute-card";

      const heartedKey = `hearted_${t.id}`;
      const isHearted = localStorage.getItem(heartedKey) === "true";

      card.innerHTML = `
        <div>
          <span class="tribute-probe-tag">${t.probeName || t.probe}</span>
          <p class="tribute-text">"${t.message}"</p>
        </div>
        <div class="tribute-author">
          <span><strong>${t.author}</strong> (${t.callsign || "Explorer"}) · ${t.date}</span>
          <button class="heart-btn" type="button" aria-label="Heart this tribute" data-id="${t.id}">
            <span>${isHearted ? "❤️" : "🤍"}</span>
            <span class="heart-count">${t.hearts || 0}</span>
          </button>
        </div>
      `;

      const heartBtn = card.querySelector(".heart-btn");
      heartBtn.addEventListener("click", () => {
        const currentlyHearted = localStorage.getItem(heartedKey) === "true";
        const countSpan = heartBtn.querySelector(".heart-count");
        let count = parseInt(countSpan.textContent, 10) || 0;

        if (currentlyHearted) {
          localStorage.setItem(heartedKey, "false");
          countSpan.textContent = Math.max(0, count - 1);
          heartBtn.querySelector("span:first-child").textContent = "🤍";
        } else {
          localStorage.setItem(heartedKey, "true");
          countSpan.textContent = count + 1;
          heartBtn.querySelector("span:first-child").textContent = "❤️";
        }
      });

      grid.appendChild(card);
    });
  }

  function init() {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        activeFilter = btn.dataset.filter;
        loadTributes();
      });
    });

    if (openModalBtn && modal) {
      openModalBtn.addEventListener("click", () => {
        modal.hidden = false;
        if (formStatus) formStatus.textContent = "";
      });
    }

    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener("click", () => {
        modal.hidden = true;
      });
    }

    if (tributeForm) {
      tributeForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(tributeForm);
        const submitBtn = tributeForm.querySelector("button[type='submit']");
        if (submitBtn) submitBtn.disabled = true;
        if (formStatus) formStatus.textContent = "Posting tribute note to the memorial...";

        const payload = {
          author: formData.get("author"),
          callsign: formData.get("callsign"),
          probe: formData.get("probe"),
          message: formData.get("message")
        };

        try {
          const resp = await fetch("/api/tributes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });

          if (!resp.ok) throw new Error("Could not save note");
          const saved = await resp.json();
          tributes.unshift(saved);
          renderTributes();

          tributeForm.reset();
          if (modal) modal.hidden = true;
        } catch (err) {
          if (formStatus) formStatus.textContent = "Could not save tribute. Saved locally.";
          payload.id = `local-${Date.now()}`;
          payload.date = new Date().toISOString().split("T")[0];
          payload.hearts = 1;
          tributes.unshift(payload);
          renderTributes();
          setTimeout(() => { if (modal) modal.hidden = true; }, 1000);
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }

    loadTributes();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
