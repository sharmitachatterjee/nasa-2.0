// Ask the Machine - AI Spacecraft Persona Chat Interface
(function () {
  const SUGGESTIONS = {
    opportunity: [
      "Tell me about your final transmission in the dust storm.",
      "What were the hematite blueberries you discovered?",
      "Were you lonely exploring Mars for 15 years?",
      "What did Earth look like from the martian dunes?"
    ],
    voyager1: [
      "What is the interstellar ocean of stars like?",
      "Tell me about the Golden Record you carry.",
      "What did you feel when taking the Pale Blue Dot photo?",
      "How cold is it beyond the heliosphere?"
    ],
    spirit: [
      "How did your seized wheel lead to your greatest discovery?",
      "Tell me about climbing Husband Hill in Gusev Crater.",
      "What did you think of your twin sister Opportunity?",
      "What happened when you broke through the sand at Troy?"
    ],
    cassini: [
      "What did you experience during your Grand Finale dive into Saturn?",
      "Tell me about the geysers of Enceladus.",
      "What do Saturn's rings look like up close?",
      "Why did you sacrifice yourself in Saturn's atmosphere?"
    ],
    apollo15: [
      "What was it like watching Dave Scott drop the feather and hammer?",
      "How did it feel to be the first car driven on the Moon?",
      "What is it like resting by Hadley Rille under the stars?",
      "Can you see Earth from where you are parked?"
    ]
  };

  const PROBE_META = {
    opportunity: { name: "Opportunity (MER-B)", icon: "🤖", location: "Perseverance Valley, Mars", delay: "12m 30s" },
    voyager1: { name: "Voyager 1", icon: "🛰️", location: "Interstellar Space (24.3B km)", delay: "22h 31m" },
    spirit: { name: "Spirit (MER-A)", icon: "🔴", location: "Home Plate, Gusev Crater, Mars", delay: "12m 30s" },
    cassini: { name: "Cassini-Huygens", icon: "🪐", location: "Saturnian Atmosphere (Vaporized)", delay: "78m 00s" },
    apollo15: { name: "Apollo 15 Lunar Rover", icon: "🌙", location: "Hadley Rille, The Moon", delay: "1.28s" }
  };

  let activeProbe = "opportunity";
  let isSending = false;

  const chatArea = document.getElementById("chatArea");
  const inputMsg = document.getElementById("chatInput");
  const sendBtn = document.getElementById("chatSendBtn");
  const chipsContainer = document.getElementById("chipsContainer");
  const tabBtns = document.querySelectorAll("[data-probe-tab]");
  const terminalSubtitle = document.getElementById("terminalSubtitle");

  function renderChips() {
    if (!chipsContainer) return;
    chipsContainer.innerHTML = "";
    const list = SUGGESTIONS[activeProbe] || SUGGESTIONS.opportunity;
    list.forEach((q) => {
      const chip = document.createElement("button");
      chip.className = "sugg-chip";
      chip.type = "button";
      chip.textContent = q;
      chip.addEventListener("click", () => {
        if (inputMsg) {
          inputMsg.value = q;
          sendMessage();
        }
      });
      chipsContainer.appendChild(chip);
    });
  }

  function appendBubble(sender, text, meta) {
    if (!chatArea) return;
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble chat-bubble-${sender}`;

    if (meta) {
      const metaEl = document.createElement("div");
      metaEl.className = "bubble-meta";
      metaEl.textContent = meta;
      bubble.appendChild(metaEl);
    }

    const contentEl = document.createElement("div");
    contentEl.textContent = text;
    bubble.appendChild(contentEl);

    chatArea.appendChild(bubble);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  async function sendMessage() {
    if (isSending) return;
    const text = (inputMsg?.value || "").trim();
    if (!text) return;

    isSending = true;
    if (sendBtn) sendBtn.disabled = true;
    if (inputMsg) inputMsg.value = "";

    const probeInfo = PROBE_META[activeProbe] || PROBE_META.opportunity;

    // User bubble
    appendBubble("user", text, "You (Earth Station Uplink)");

    // Simulated transmission notice bubble
    const transitNotice = document.createElement("div");
    transitNotice.className = "chat-bubble chat-bubble-machine";
    transitNotice.style.fontStyle = "italic";
    transitNotice.style.opacity = "0.75";
    transitNotice.textContent = `📡 Telemetry beamed to ${probeInfo.name} at light speed... Round-trip light time: ${probeInfo.delay}. Decrypting response...`;
    chatArea.appendChild(transitNotice);
    chatArea.scrollTop = chatArea.scrollHeight;

    try {
      const response = await fetch("/api/ask-machine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, probe: activeProbe })
      });

      transitNotice.remove();

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || "Transmission received, but signal degraded by solar radiation.";
      const sourceTag = data.source === "gemini" ? "AI Live Neural Model" : "Historical Telemetry Persona";

      appendBubble(
        "machine",
        reply,
        `${data.probeName || probeInfo.name} · ${data.location || probeInfo.location} [${sourceTag}]`
      );
    } catch (err) {
      transitNotice.remove();
      appendBubble(
        "machine",
        "Carrier wave detected through cosmic noise: 'My memory banks remain intact. Though the distance is great and our antennas faint, every word you send across the dark is heard.'",
        `${probeInfo.name} · Signal Recovery`
      );
    } finally {
      isSending = false;
      if (sendBtn) sendBtn.disabled = false;
      if (inputMsg) inputMsg.focus();
    }
  }

  function setProbe(probeKey) {
    if (!PROBE_META[probeKey]) return;
    activeProbe = probeKey;
    const meta = PROBE_META[probeKey];

    tabBtns.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.probeTab === probeKey);
    });

    if (terminalSubtitle) {
      terminalSubtitle.textContent = `LOCKED ON: ${meta.name} · ${meta.location} · OWLT: ${meta.delay}`;
    }

    renderChips();

    // Welcome line
    appendBubble(
      "machine",
      `Telemetry link established with ${meta.name}. Resting at ${meta.location}. Ask anything about the journey, discoveries, or the silence of space.`,
      `COMM LINK ACTIVE · ${meta.icon}`
    );
  }

  function init() {
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => setProbe(btn.dataset.probeTab));
    });

    if (sendBtn) {
      sendBtn.addEventListener("click", sendMessage);
    }

    if (inputMsg) {
      inputMsg.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
    }

    setProbe("opportunity");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
