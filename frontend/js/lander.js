// Lunar & Martian Lander Physics Mini-Game
(function () {
  const canvas = document.getElementById("landerCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // DOM Elements
  const fuelDisplay = document.getElementById("gameFuel");
  const altDisplay = document.getElementById("gameAlt");
  const vxDisplay = document.getElementById("gameVx");
  const vyDisplay = document.getElementById("gameVy");
  const scoreDisplay = document.getElementById("gameScore");
  const statusMsg = document.getElementById("gameStatusMsg");
  const restartBtn = document.getElementById("gameRestartBtn");
  const moonBtn = document.getElementById("envMoonBtn");
  const marsBtn = document.getElementById("envMarsBtn");

  // Touch controls
  const btnThrust = document.getElementById("touchThrust");
  const btnLeft = document.getElementById("touchLeft");
  const btnRight = document.getElementById("touchRight");

  let environment = "moon"; // "moon" or "mars"
  let gravity = 0.045; // Moon
  let score = 0;
  let audioCtx = null;

  const ship = {
    x: 100,
    y: 60,
    vx: 1.2,
    vy: 0,
    angle: 0, // radians, 0 is pointing up
    fuel: 100,
    alive: true,
    landed: false,
    width: 22,
    height: 20
  };

  const keys = {
    up: false,
    left: false,
    right: false
  };

  let particles = [];
  let terrain = [];
  let pads = [];

  function playSound(type) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "thrust") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(90, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === "land") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659, audioCtx.currentTime + 0.12); // E5
        osc.frequency.setValueAtTime(784, audioCtx.currentTime + 0.24); // G5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else if (type === "crash") {
        osc.type = "square";
        osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch {
      // Audio unsupported or not allowed
    }
  }

  function generateTerrain() {
    terrain = [];
    pads = [];
    const w = canvas.width;
    const h = canvas.height;

    // Fixed pads for deterministic landing zones
    const pad1 = { x1: w * 0.25, x2: w * 0.38, y: h - 60, score: 100, label: "BASE ALPHA (100pt)" };
    const pad2 = { x1: w * 0.65, x2: w * 0.76, y: h - 90, score: 250, label: "CRATER RIDGE (250pt)" };
    pads.push(pad1, pad2);

    const step = 20;
    for (let x = 0; x <= w; x += step) {
      let y = h - 50 + Math.sin(x * 0.015) * 35 + Math.cos(x * 0.04) * 20;

      // Flatten on pads
      pads.forEach((pad) => {
        if (x >= pad.x1 && x <= pad.x2) {
          y = pad.y;
        }
      });

      terrain.push({ x, y });
    }
  }

  function resetGame() {
    ship.x = 80;
    ship.y = 50;
    ship.vx = 1.0;
    ship.vy = 0;
    ship.angle = 0;
    ship.fuel = 100;
    ship.alive = true;
    ship.landed = false;
    particles = [];

    if (statusMsg) {
      statusMsg.textContent = environment === "moon"
        ? "PILOTING APOLLO 15 DESCENT STAGE — TOUCHDOWN SPEED MUST BE < 1.4 M/S"
        : "MARS SKY-CRANE RETRO-BURN ACTIVE — REDUCE VELOCITY FOR TOUCHDOWN";
      statusMsg.style.color = "#b7a4ff";
    }

    generateTerrain();
  }

  function checkCollision() {
    if (!ship.alive || ship.landed) return;

    // Check pads first
    for (const pad of pads) {
      if (ship.x >= pad.x1 && ship.x <= pad.x2 && Math.abs(ship.y + ship.height / 2 - pad.y) < 5) {
        const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
        const angleDeg = Math.abs((ship.angle * 180) / Math.PI);

        if (speed <= 1.4 && angleDeg <= 14) {
          // Safe landing!
          ship.landed = true;
          ship.vx = 0;
          ship.vy = 0;
          score += pad.score + Math.round(ship.fuel);
          if (scoreDisplay) scoreDisplay.textContent = score;
          if (statusMsg) {
            statusMsg.textContent = `🎉 PERFECT TOUCHDOWN on ${pad.label}! +${pad.score} pts + ${Math.round(ship.fuel)} fuel bonus!`;
            statusMsg.style.color = "#55ffb2";
          }
          playSound("land");
          return;
        } else {
          // Hard impact crash
          crashShip(`CRASHED! Impact velocity: ${speed.toFixed(1)} m/s (Max safe: 1.4 m/s)`);
          return;
        }
      }
    }

    // Check terrain collision
    for (let i = 0; i < terrain.length - 1; i++) {
      const p1 = terrain[i];
      const p2 = terrain[i + 1];
      if (ship.x >= p1.x && ship.x <= p2.x) {
        const ratio = (ship.x - p1.x) / (p2.x - p1.x);
        const groundY = p1.y + ratio * (p2.y - p1.y);

        if (ship.y + ship.height / 2 >= groundY) {
          crashShip("CRASHED into rocky terrain! Aim for flat green landing pads.");
          return;
        }
      }
    }

    // Out of bounds
    if (ship.x < 0 || ship.x > canvas.width || ship.y > canvas.height) {
      crashShip("LOST IN SPACE: Descent module drifted out of landing sector.");
    }
  }

  function crashShip(reason) {
    ship.alive = false;
    playSound("crash");
    if (statusMsg) {
      statusMsg.textContent = `💥 ${reason}`;
      statusMsg.style.color = "#ff6666";
    }

    // Explosion particles
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: ship.x,
        y: ship.y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 1.0,
        color: Math.random() > 0.5 ? "#ffaa33" : "#ff4444",
        size: Math.random() * 4 + 2
      });
    }
  }

  function update() {
    if (ship.alive && !ship.landed) {
      // Rotation
      if (keys.left) ship.angle -= 0.045;
      if (keys.right) ship.angle += 0.045;

      // Thrust
      if (keys.up && ship.fuel > 0) {
        const thrustPower = 0.11;
        ship.vx += Math.sin(ship.angle) * thrustPower;
        ship.vy -= Math.cos(ship.angle) * thrustPower;
        ship.fuel = Math.max(0, ship.fuel - 0.25);

        // Rocket exhaust particles
        particles.push({
          x: ship.x - Math.sin(ship.angle) * (ship.height / 2),
          y: ship.y + Math.cos(ship.angle) * (ship.height / 2),
          vx: -Math.sin(ship.angle) * (Math.random() * 3 + 2) + (Math.random() - 0.5) * 1.5,
          vy: Math.cos(ship.angle) * (Math.random() * 3 + 2) + (Math.random() - 0.5) * 1.5,
          life: 0.6,
          color: Math.random() > 0.4 ? "#ffcc44" : "#ff5500",
          size: Math.random() * 3 + 1.5
        });

        playSound("thrust");
      }

      // Gravity & physics
      ship.vy += gravity;

      // Mars atmosphere drag
      if (environment === "mars") {
        ship.vx *= 0.996;
        ship.vy *= 0.996;
      }

      ship.x += ship.vx;
      ship.y += ship.vy;

      checkCollision();
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    // Update HUD
    if (fuelDisplay) fuelDisplay.textContent = `${Math.round(ship.fuel)}%`;
    if (altDisplay) altDisplay.textContent = `${Math.max(0, Math.round(canvas.height - ship.y - 40))}m`;
    if (vxDisplay) vxDisplay.textContent = `${ship.vx.toFixed(1)} m/s`;
    if (vyDisplay) {
      vyDisplay.textContent = `${ship.vy.toFixed(1)} m/s`;
      vyDisplay.style.color = Math.abs(ship.vy) <= 1.4 ? "#55ffb2" : "#ff7777";
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Stars
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    for (let i = 0; i < 30; i++) {
      const sx = (Math.sin(i * 45) * 0.5 + 0.5) * canvas.width;
      const sy = (Math.cos(i * 12) * 0.5 + 0.5) * (canvas.height * 0.6);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    // Earth in the sky
    ctx.fillStyle = "#3388ff";
    ctx.beginPath();
    ctx.arc(canvas.width - 50, 45, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#88e0a0";
    ctx.beginPath();
    ctx.arc(canvas.width - 53, 42, 6, 0, Math.PI * 2);
    ctx.fill();

    // Terrain
    ctx.fillStyle = environment === "moon" ? "#222738" : "#4a241a";
    ctx.strokeStyle = environment === "moon" ? "#7c85a3" : "#d9654c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    for (const pt of terrain) {
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw Landing Pads
    for (const pad of pads) {
      ctx.strokeStyle = "#55ffb2";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pad.x1, pad.y);
      ctx.lineTo(pad.x2, pad.y);
      ctx.stroke();

      ctx.fillStyle = "#55ffb2";
      ctx.font = "bold 9px monospace";
      ctx.fillText(pad.label, pad.x1, pad.y - 8);
    }

    // Draw Particles
    for (const p of particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Draw Lander Spacecraft
    if (ship.alive) {
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);

      // Main Capsule Body
      ctx.fillStyle = "#e0e4f5";
      ctx.strokeStyle = "#b7a4ff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -ship.height / 2);
      ctx.lineTo(ship.width / 2, ship.height / 3);
      ctx.lineTo(-ship.width / 2, ship.height / 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Window / Hatch
      ctx.fillStyle = "#4da6ff";
      ctx.beginPath();
      ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Landing Legs
      ctx.strokeStyle = "#cfd5ec";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-ship.width / 2, ship.height / 3);
      ctx.lineTo(-ship.width / 2 - 5, ship.height / 2 + 3);
      ctx.moveTo(ship.width / 2, ship.height / 3);
      ctx.lineTo(ship.width / 2 + 5, ship.height / 2 + 3);
      ctx.stroke();

      // Main thruster nozzle
      ctx.fillStyle = "#888";
      ctx.fillRect(-3, ship.height / 3, 6, 4);

      ctx.restore();
    }
  }

  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  // Keyboard controls
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.up = true;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") keys.up = false;
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
  });

  // Touch handlers
  function bindTouch(btn, key) {
    if (!btn) return;
    btn.addEventListener("touchstart", (e) => { e.preventDefault(); keys[key] = true; });
    btn.addEventListener("touchend", (e) => { e.preventDefault(); keys[key] = false; });
    btn.addEventListener("mousedown", () => { keys[key] = true; });
    btn.addEventListener("mouseup", () => { keys[key] = false; });
  }

  bindTouch(btnThrust, "up");
  bindTouch(btnLeft, "left");
  bindTouch(btnRight, "right");

  if (restartBtn) restartBtn.addEventListener("click", resetGame);

  if (moonBtn) {
    moonBtn.addEventListener("click", () => {
      environment = "moon";
      gravity = 0.045;
      moonBtn.classList.add("is-active");
      if (marsBtn) marsBtn.classList.remove("is-active");
      resetGame();
    });
  }

  if (marsBtn) {
    marsBtn.addEventListener("click", () => {
      environment = "mars";
      gravity = 0.085;
      marsBtn.classList.add("is-active");
      if (moonBtn) moonBtn.classList.remove("is-active");
      resetGame();
    });
  }

  resetGame();
  requestAnimationFrame(gameLoop);
})();
