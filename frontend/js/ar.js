// 3D Spacecraft Hologram & AR Wireframe Viewer
(function () {
  const canvas = document.getElementById("arCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let autoRotate = true;
  let wireframeColor = "#b7a4ff";
  let rotX = 0.35;
  let rotY = 0.45;
  let zoom = 1.3;
  let activeModelKey = "voyager1";

  // Spacecraft 3D Models (Vertices and Edges)
  const MODELS = {
    voyager1: {
      name: "Voyager 1 Interstellar Probe",
      specs: "Mass: 773 kg · Primary Antenna: 3.7m diameter · Power: 3x RTGs · Speed: 17 km/s relative to Sun",
      vertices: [
        // High gain dish (parabolic ring + feed)
        [-70, -40, 0], [70, -40, 0], [0, -40, -70], [0, -40, 70],
        [-50, -40, -50], [50, -40, -50], [50, -40, 50], [-50, -40, 50],
        [0, -85, 0], // Dish focal feed
        // Main Bus (10-sided box)
        [-35, -20, -35], [35, -20, -35], [35, -20, 35], [-35, -20, 35],
        [-35, 30, -35], [35, 30, -35], [35, 30, 35], [-35, 30, 35],
        // RTG boom
        [-35, 10, 0], [-120, 30, 20], [-130, 32, 20],
        // Magnetometer boom
        [35, 10, 0], [140, -10, -20], [150, -12, -20],
        // Golden Record
        [20, 25, 36], [30, 25, 36], [30, 15, 36], [20, 15, 36]
      ],
      edges: [
        // Dish perimeter
        [0, 4], [4, 2], [2, 5], [5, 1], [1, 6], [6, 3], [3, 7], [7, 0],
        // Dish feed struts
        [0, 8], [1, 8], [2, 8], [3, 8],
        // Main Bus
        [9, 10], [10, 11], [11, 12], [12, 9],
        [13, 14], [14, 15], [15, 16], [16, 13],
        [9, 13], [10, 14], [11, 15], [12, 16],
        // RTG Boom
        [17, 18], [18, 19],
        // Mag Boom
        [20, 21], [21, 22],
        // Golden record square
        [23, 24], [24, 25], [25, 26], [26, 23]
      ],
      hotspots: [
        { label: "High-Gain Antenna", desc: "3.7-meter parabolic reflector beaming signals across 24 billion km back to Earth." },
        { label: "Golden Record", desc: "Electroplated gold phonograph record containing sounds and greetings of Earth." },
        { label: "RTG Nuclear Generators", desc: "Plutonium-238 decaying heat converted to electricity, slowly cooling after 47 years." }
      ]
    },
    opportunity: {
      name: "Mars Exploration Rover (Opportunity)",
      specs: "Length: 1.6m · Mass: 185 kg · Max speed: 5 cm/s · Top range: 45.16 km across 5,111 sols",
      vertices: [
        // Solar deck
        [-50, -10, -35], [50, -10, -35], [65, -10, 0], [50, -10, 35], [-50, -10, 35], [-60, -10, 0],
        // Warm electronics box (chassis)
        [-35, 15, -25], [35, 15, -25], [35, 15, 25], [-35, 15, 25],
        // Pancam Mast
        [20, -10, 0], [20, -75, 0], [15, -75, -5], [25, -75, -5],
        // Rocker bogie & 6 wheels
        [-40, 25, -45], [0, 25, -50], [40, 25, -45],
        [-40, 25, 45], [0, 25, 50], [40, 25, 45],
        // Robotic arm (IDD)
        [40, 10, 0], [60, 20, 0], [70, 30, -5]
      ],
      edges: [
        // Solar panel perimeter
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
        // Chassis
        [6, 7], [7, 8], [8, 9], [9, 6],
        // Connect deck to chassis
        [0, 6], [1, 7], [3, 8], [4, 9],
        // Mast
        [10, 11], [12, 13],
        // Wheels to chassis
        [6, 14], [6, 15], [7, 16],
        [9, 17], [9, 18], [8, 19],
        // Arm
        [20, 21], [21, 22]
      ],
      hotspots: [
        { label: "Pancam Mast Assembly", desc: "Stereoscopic panoramic cameras standing 1.5m tall, acting as the rover's eyes." },
        { label: "Solar Array Deck", desc: "Gallium arsenide solar panels that outlived their 90-day warranty by over 14 years." },
        { label: "Instrument Deployment Device", desc: "Robotic arm armed with the rock abrasion tool, microscopic imager, and spectrometers." }
      ]
    }
  };

  function project(x, y, z, w, h) {
    // 3D rotation around Y and X
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY + z * sinY;
    const z1 = -x * sinY + z * cosY;

    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    const distance = 350;
    const fov = distance / (distance + z2 * zoom);
    return {
      x: w / 2 + x1 * zoom * fov,
      y: h / 2 + y2 * zoom * fov,
      z: z2
    };
  }

  function render() {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (autoRotate) {
      rotY += 0.008;
    }

    const model = MODELS[activeModelKey] || MODELS.voyager1;
    const projected = model.vertices.map((v) => project(v[0], v[1], v[2], w, h));

    // Holographic grid floor
    ctx.strokeStyle = "rgba(183, 164, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let r = 50; r <= 220; r += 35) {
      ctx.beginPath();
      ctx.ellipse(w / 2, h / 2 + 90, r, r * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw 3D Edges
    ctx.strokeStyle = wireframeColor;
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 10;
    ctx.shadowColor = wireframeColor;

    for (const [i1, i2] of model.edges) {
      const p1 = projected[i1];
      const p2 = projected[i2];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    ctx.shadowBlur = 0;

    // Draw Vertices
    ctx.fillStyle = "#ffffff";
    for (const p of projected) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hologram Scanline overlay
    ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1.5);
    }

    requestAnimationFrame(render);
  }

  function updateHotspotList() {
    const listEl = document.getElementById("hotspotList");
    const specsEl = document.getElementById("modelSpecs");
    const model = MODELS[activeModelKey];
    if (specsEl) specsEl.textContent = model.specs;
    if (!listEl) return;
    listEl.innerHTML = "";

    model.hotspots.forEach((h) => {
      const card = document.createElement("div");
      card.className = "hud-stat";
      card.style.marginBottom = "0.75rem";
      card.innerHTML = `
        <div class="hud-stat-label" style="color: var(--accent);">${h.label}</div>
        <div style="font-size: 0.85rem; color: #f3f5ff; line-height: 1.4;">${h.desc}</div>
      `;
      listEl.appendChild(card);
    });
  }

  function init() {
    canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 700;
    canvas.height = 420;

    window.addEventListener("resize", () => {
      if (canvas.parentElement) canvas.width = canvas.parentElement.clientWidth;
    });

    // Mouse / Touch Drag to Rotate
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    canvas.addEventListener("mousedown", (e) => {
      isDragging = true;
      autoRotate = false;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      rotY += dx * 0.01;
      rotX += dy * 0.01;
      prevX = e.clientX;
      prevY = e.clientY;
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Touch
    canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        autoRotate = false;
        prevX = e.touches[0].clientX;
        prevY = e.touches[0].clientY;
      }
    }, { passive: true });

    canvas.addEventListener("touchmove", (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevX;
      const dy = e.touches[0].clientY - prevY;
      rotY += dx * 0.01;
      rotX += dy * 0.01;
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener("touchend", () => { isDragging = false; });

    // Gyroscope / DeviceOrientation for AR mode
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", (e) => {
        if (e.gamma !== null && e.beta !== null) {
          rotY = (e.gamma * Math.PI) / 180;
          rotX = (e.beta * Math.PI) / 180 - 0.5;
        }
      });
    }

    // Toggle Buttons
    const spinBtn = document.getElementById("toggleSpinBtn");
    if (spinBtn) {
      spinBtn.addEventListener("click", () => {
        autoRotate = !autoRotate;
        spinBtn.textContent = autoRotate ? "⏸️ Pause Spin" : "▶️ Auto Rotate";
      });
    }

    const colorBtn = document.getElementById("toggleColorBtn");
    if (colorBtn) {
      const colors = ["#b7a4ff", "#55ffb2", "#55aaff", "#ffcc44"];
      let cIdx = 0;
      colorBtn.addEventListener("click", () => {
        cIdx = (cIdx + 1) % colors.length;
        wireframeColor = colors[cIdx];
      });
    }

    const modelBtns = document.querySelectorAll("[data-model]");
    modelBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        modelBtns.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        activeModelKey = btn.dataset.model;
        updateHotspotList();
      });
    });

    updateHotspotList();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
