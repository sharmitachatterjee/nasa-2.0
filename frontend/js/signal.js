// Deep Space Signal Delay Simulator
(function () {
  const SPEED_OF_LIGHT_KM_S = 299792.458;
  const AU_TO_KM = 149597870.7;

  const TARGETS = {
    voyager1: {
      name: "Voyager 1",
      location: "Interstellar Space (24.3 Billion km)",
      distanceKm: 24310000000,
      frequencyGhz: 8.4, // X-band
      signalStrengthDbm: -158,
      icon: "🛰️",
      telemetryResponse: "CARRIER DETECTED: Deep Space Network Canberra 70m dish. RTG power output: 218 Watts. Telemetry bit rate: 160 bps. Heading: 35.5° north of ecliptic toward Ophiuchus. We are still listening."
    },
    mars_oppy: {
      name: "Opportunity (Mars - Endeavour Crater)",
      location: "Mars (Perseverance Valley)",
      distanceKm: 225000000,
      frequencyGhz: 8.4,
      signalStrengthDbm: -115,
      icon: "🤖",
      telemetryResponse: "PING RECEIVED. Mars Exploration Rover B status: Passive sleep state. Dust opacity tau: elevated. Memory banks contain 217,594 frames and 45.16 kilometers of tracks. Sol 5111 immortal."
    },
    moon_apollo15: {
      name: "Apollo 15 Lunar Rover (The Moon)",
      location: "Hadley Rille, Mare Imbrium",
      distanceKm: 384400,
      frequencyGhz: 2.2, // S-band
      signalStrengthDbm: -72,
      icon: "🌙",
      telemetryResponse: "LUNAR SURFACE RELAY: Odometer reading: 17.3 miles. High-gain antenna aligned with Earth. Ambient vacuum: 3x10^-15 bar. Surface regolith quiet. Footprints undisturbed."
    },
    cassini_saturn: {
      name: "Cassini (Saturn Atmosphere)",
      location: "Saturn (Atmospheric Dissolution Site)",
      distanceKm: 1420000000,
      frequencyGhz: 8.4,
      signalStrengthDbm: -142,
      icon: "🪐",
      telemetryResponse: "GRAND FINALE FINAL BURST RECORD: Sept 15 2017. 13 years at Saturn, 453,048 images. Enceladus ocean protected. Spacecraft matter dispersed into Saturnian atmospheric winds."
    },
    new_horizons: {
      name: "New Horizons (Kuiper Belt)",
      location: "Kuiper Belt (54 AU from Sun)",
      distanceKm: 8100000000,
      frequencyGhz: 8.4,
      signalStrengthDbm: -152,
      icon: "☄️",
      telemetryResponse: "KUIPER BELT BEACON: Distance from Earth: 54.2 AU. Pluto and Arrokoth flyby archives verified in solid-state flash recorder. Outbound trajectory into deep galaxy."
    }
  };

  let activeTargetKey = "voyager1";
  let activeTarget = TARGETS.voyager1;
  let isTransmitting = false;
  let simSpeed = 1000; // default simulation speed multiplier
  let audioCtx = null;

  // DOM Elements
  const targetSelect = document.getElementById("signalTargetSelect");
  const speedSelect = document.getElementById("signalSpeedSelect");
  const sendBtn = document.getElementById("signalSendBtn");
  const messageInput = document.getElementById("signalMessageInput");
  const logBox = document.getElementById("signalLog");
  const distStat = document.getElementById("statDistance");
  const owltStat = document.getElementById("statOwlt");
  const rtltStat = document.getElementById("statRtlt");
  const statusStat = document.getElementById("statStatus");
  const progressFill = document.getElementById("signalProgressFill");
  const progressLabel = document.getElementById("signalProgressLabel");
  const canvas = document.getElementById("signalCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;

  // Sound synthesis via Web Audio
  function playTelemetrySound(type) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "send") {
        // Uplink chirp
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2400, audioCtx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === "ack") {
        // Spacecraft ACK beep
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1800, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // Audio not permitted or unsupported
    }
  }

  function appendLog(text) {
    if (!logBox) return;
    const time = new Date().toTimeString().split(" ")[0];
    const line = document.createElement("div");
    line.textContent = `[${time}] ${text}`;
    logBox.appendChild(line);
    logBox.scrollTop = logBox.scrollHeight;
  }

  function formatTime(seconds) {
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  }

  function updateHUD() {
    const owltSeconds = activeTarget.distanceKm / SPEED_OF_LIGHT_KM_S;
    const rtltSeconds = owltSeconds * 2;
    const au = (activeTarget.distanceKm / AU_TO_KM).toFixed(2);
    const millionsKm = (activeTarget.distanceKm / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 });

    if (distStat) distStat.textContent = `${millionsKm}M km (${au} AU)`;
    if (owltStat) owltStat.textContent = formatTime(owltSeconds);
    if (rtltStat) rtltStat.textContent = formatTime(rtltSeconds);
  }

  // Fetch live Voyager 1 Horizons ephemeris if available
  async function checkLiveVoyager() {
    try {
      const resp = await fetch("/api/voyager", { cache: "no-store" });
      if (resp.ok) {
        const data = await resp.json();
        if (data.distanceKm && data.distanceKm > 0) {
          TARGETS.voyager1.distanceKm = data.distanceKm;
          if (activeTargetKey === "voyager1") {
            updateHUD();
            appendLog(`Live JPL Horizons distance synced: ${(data.distanceKm / AU_TO_KM).toFixed(3)} AU`);
          }
        }
      }
    } catch {
      // Keep calculated fallback
    }
  }

  // Visualizer Canvas Animation
  let packetX = -1;
  let packetDirection = 0; // 1 outbound, -1 return, 0 idle

  function renderCanvas() {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Starfield
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    for (let i = 0; i < 40; i++) {
      const sx = (Math.sin(i * 99) * 0.5 + 0.5) * w;
      const sy = (Math.cos(i * 33) * 0.5 + 0.5) * h;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Grid baseline
    ctx.strokeStyle = "rgba(213,220,255,0.1)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(60, h / 2);
    ctx.lineTo(w - 60, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Earth (Left)
    ctx.fillStyle = "#4da6ff";
    ctx.beginPath();
    ctx.arc(60, h / 2, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#80ffaa";
    ctx.beginPath();
    ctx.arc(56, h / 2 - 4, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f3f5ff";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillText("EARTH", 42, h / 2 + 36);

    // Target Spacecraft (Right)
    ctx.fillStyle = "#b7a4ff";
    ctx.beginPath();
    ctx.arc(w - 60, h / 2, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f3f5ff";
    ctx.font = "bold 11px Inter, sans-serif";
    ctx.fillText(activeTarget.name.split(" ")[0].toUpperCase(), w - 85, h / 2 + 36);

    // Transmitting pulse
    if (packetDirection !== 0 && packetX >= 60 && packetX <= w - 60) {
      // Photons / wavefronts
      ctx.strokeStyle = packetDirection === 1 ? "#55ffb2" : "#b7a4ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(packetX, h / 2, 14, -Math.PI / 3, Math.PI / 3, packetDirection === -1);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(packetX, h / 2, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(renderCanvas);
  }

  function startTransmission() {
    if (isTransmitting) return;
    const msg = (messageInput?.value || "STATUS REPORT REQUEST").trim();
    isTransmitting = true;
    if (sendBtn) sendBtn.disabled = true;
    if (statusStat) statusStat.textContent = "OUTBOUND TRANSIT";

    playTelemetrySound("send");
    appendLog(`UPLINK INITIATED: "${msg}" to ${activeTarget.name}`);
    appendLog(`Carrier Frequency: ${activeTarget.frequencyGhz} GHz | Transmit Power: 20 kW | Velocity: c`);

    const realOwltSeconds = activeTarget.distanceKm / SPEED_OF_LIGHT_KM_S;
    
    // Total animation duration in milliseconds based on speed multiplier
    let animDurationMs = 4000; // baseline 4 seconds for one-way demo
    if (simSpeed === 1) {
      // Real-time (capped at 60s for browser sanity with notice)
      animDurationMs = Math.min(realOwltSeconds * 1000, 30000);
      appendLog(`[Real-time mode active] Transit delay running at 1x.`);
    }

    const startTime = performance.now();
    const w = canvas ? canvas.width : 500;
    packetDirection = 1;

    function animateOutbound(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / animDurationMs, 1);
      packetX = 60 + progress * (w - 120);

      if (progressFill) progressFill.style.width = `${progress * 50}%`;
      if (progressLabel) {
        const estSecRem = ((1 - progress) * realOwltSeconds).toFixed(1);
        progressLabel.textContent = `Outbound speed of light travel... (Est remaining: ${formatTime(parseFloat(estSecRem))})`;
      }

      if (progress < 1) {
        requestAnimationFrame(animateOutbound);
      } else {
        // Reached spacecraft!
        playTelemetrySound("ack");
        appendLog(`SIGNAL ARRIVED at ${activeTarget.name}. Processing command...`);
        if (statusStat) statusStat.textContent = "SPACE CRAFT PROCESSING";

        setTimeout(() => {
          // Downlink start
          appendLog(`DOWNLINK TRANSMITTING from ${activeTarget.name} back to Earth...`);
          if (statusStat) statusStat.textContent = "RETURN DOWNLINK TRANSIT";
          packetDirection = -1;
          const returnStart = performance.now();

          function animateReturn(now2) {
            const elapsed2 = now2 - returnStart;
            const progress2 = Math.min(elapsed2 / animDurationMs, 1);
            packetX = (w - 60) - progress2 * (w - 120);

            if (progressFill) progressFill.style.width = `${50 + progress2 * 50}%`;
            if (progressLabel) {
              const estSecRem = ((1 - progress2) * realOwltSeconds).toFixed(1);
              progressLabel.textContent = `Downlink telemetry returning to Earth... (Est remaining: ${formatTime(parseFloat(estSecRem))})`;
            }

            if (progress2 < 1) {
              requestAnimationFrame(animateReturn);
            } else {
              // Reached Earth!
              playTelemetrySound("ack");
              packetDirection = 0;
              isTransmitting = false;
              if (sendBtn) sendBtn.disabled = false;
              if (statusStat) statusStat.textContent = "IDLE (TRANSMISSION COMPLETE)";
              if (progressLabel) progressLabel.textContent = "Round-trip transmission complete! Telemetry decoded below.";
              if (progressFill) progressFill.style.width = "100%";

              appendLog(`DOWNLINK RECEIVED AT DEEP SPACE NETWORK: Signal: ${activeTarget.signalStrengthDbm} dBm`);
              appendLog(`DECODED TELEMETRY: "${activeTarget.telemetryResponse}"`);
            }
          }

          requestAnimationFrame(animateReturn);
        }, 800);
      }
    }

    requestAnimationFrame(animateOutbound);
  }

  function init() {
    if (targetSelect) {
      targetSelect.addEventListener("change", (e) => {
        activeTargetKey = e.target.value;
        activeTarget = TARGETS[activeTargetKey] || TARGETS.voyager1;
        updateHUD();
        appendLog(`Target switched to ${activeTarget.name} (${activeTarget.location})`);
      });
    }

    if (speedSelect) {
      speedSelect.addEventListener("change", (e) => {
        simSpeed = parseFloat(e.target.value) || 1000;
        appendLog(`Simulation multiplier set to ${simSpeed}x`);
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener("click", startTransmission);
    }

    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || 600;
      canvas.height = 280;
      window.addEventListener("resize", () => {
        if (canvas.parentElement) canvas.width = canvas.parentElement.clientWidth;
      });
      renderCanvas();
    }

    updateHUD();
    checkLiveVoyager();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
