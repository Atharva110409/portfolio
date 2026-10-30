/* ==========================================================================
   ATHARVA GANGURDE — CINEMATIC 3D DEVELOPER PORTFOLIO
   Project 01: FraudGuard AI — Illustrative Financial Anomaly Detection Canvas
   (Client-side interactive visual simulation demonstrating decision boundaries
    and illustrative SHAP feature contributions. Trained model in scikit-learn/Python)
   ========================================================================== */

(function () {
  'use strict';

  let canvas, ctx, container;
  let particles = [];
  let anomalies = [];
  let isVisible = true;
  let animFrameId;
  let totalEvaluated = 284807;
  let fraudDetected = 492;
  let showDecisionBoundary = true;
  let prefersReducedMotion = false;

  function initFraudCanvas() {
    container = document.getElementById('fraud-canvas-area');
    canvas = document.getElementById('fraud-canvas');
    if (!container || !canvas) return;

    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion = mq.matches;
      mq.addEventListener('change', (e) => {
        prefersReducedMotion = e.matches;
      });
    }

    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial pool of transaction nodes
    for (let i = 0; i < 90; i++) {
      createTransactionNode(Math.random() * canvas.width);
    }

    // Button event listeners
    const injectBtn = document.getElementById('fraud-inject-btn');
    if (injectBtn) {
      injectBtn.addEventListener('click', () => {
        // Force inject an anomalous transaction with dramatic pulse
        createTransactionNode(50, true);
        totalEvaluated++;
        fraudDetected++;
        updateCounters();
      });
    }

    const toggleBtn = document.getElementById('fraud-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        showDecisionBoundary = !showDecisionBoundary;
        toggleBtn.classList.toggle('active', showDecisionBoundary);
      });
    }

    // Visibility observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.1 });
    observer.observe(container);

    render();
  }

  function resizeCanvas() {
    if (!container || !canvas) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight || 420;
  }

  function createTransactionNode(startX, forceAnomaly = false) {
    const isAnomaly = forceAnomaly || (Math.random() < 0.04); // Slightly amplified for visual engagement
    const speed = isAnomaly ? (Math.random() * 0.8 + 0.6) : (Math.random() * 1.5 + 1.2);

    const node = {
      x: startX || 0,
      y: canvas.height * 0.25 + Math.random() * (canvas.height * 0.55),
      targetY: canvas.height * 0.25 + Math.random() * (canvas.height * 0.55),
      speed: speed,
      radius: isAnomaly ? 5.5 : (Math.random() * 2.2 + 2.0),
      isAnomaly: isAnomaly,
      riskScore: isAnomaly ? (Math.random() * 0.12 + 0.88).toFixed(3) : (Math.random() * 0.08).toFixed(3),
      shapFeature: isAnomaly ? ['V14 (-8.4)', 'V12 (-6.2)', 'V4 (+4.8)'][Math.floor(Math.random() * 3)] : 'Normal',
      pulseRadius: isAnomaly ? 8 : 0,
      opacity: 0,
      id: 'TXN-' + Math.floor(Math.random() * 9000 + 1000)
    };

    particles.push(node);
  }

  function updateCounters() {
    const evalEl = document.getElementById('fraud-counter-eval');
    const fraudEl = document.getElementById('fraud-counter-flagged');
    if (evalEl) evalEl.textContent = totalEvaluated.toLocaleString();
    if (fraudEl) fraudEl.textContent = fraudDetected.toLocaleString();
  }

  function render() {
    animFrameId = requestAnimationFrame(render);

    if (!isVisible || !ctx) {
      if (canvas) ctx = canvas.getContext('2d');
      return;
    }

    // Dark slate trail for cinematic motion blur
    ctx.fillStyle = 'rgba(10, 12, 20, 0.28)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Draw Subtle Analytical Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.lineWidth = 1;
    const gridSize = 45;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw Random Forest Decision Hyperplane (Curved Boundary)
    if (showDecisionBoundary) {
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(w * 0.45, 0);
      ctx.bezierCurveTo(w * 0.55, h * 0.35, w * 0.42, h * 0.7, w * 0.52, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label on Boundary
      ctx.fillStyle = '#c084fc';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('ILLUSTRATIVE RF DECISION BOUNDARY (BENCHMARK F1: 0.85)', w * 0.42, 24);
    }

    // Draw Connective PCA Latent Edges between close nodes
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 65) {
          const alpha = (1 - dist / 65) * 0.18;
          ctx.strokeStyle = particles[i].isAnomaly || particles[j].isAnomaly
            ? `rgba(244, 63, 94, ${alpha * 1.5})`
            : `rgba(56, 189, 248, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Update & Render Transaction Nodes
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      if (!prefersReducedMotion) {
        p.x += p.speed;
        p.y += (p.targetY - p.y) * 0.02;
      }

      // Fade in / out
      if (p.x < 60) p.opacity = Math.min(1, p.x / 60);
      else if (p.x > w - 60) p.opacity = Math.max(0, (w - p.x) / 60);
      else p.opacity = 1;

      // Draw particle
      if (p.isAnomaly) {
        // High-Risk Anomaly (Coral / Red)
        p.pulseRadius += 0.35;
        if (p.pulseRadius > 26) p.pulseRadius = p.radius;

        // Pulse warning ring
        ctx.strokeStyle = `rgba(244, 63, 94, ${Math.max(0, 1 - p.pulseRadius / 26)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.pulseRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Node Glow
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Telemetry Callout Tag (Clearly labeled as simulated)
        ctx.fillStyle = 'rgba(16, 18, 28, 0.92)';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1;
        ctx.fillRect(p.x + 12, p.y - 32, 168, 40);
        ctx.strokeRect(p.x + 12, p.y - 32, 168, 40);

        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillText(`🚨 SIMULATED FLAG: ${(p.riskScore * 100).toFixed(0)}% RISK`, p.x + 18, p.y - 16);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText(`ILLUSTRATIVE SHAP: ${p.shapFeature}`, p.x + 18, p.y - 4);

      } else {
        // Normal Transaction (Electric Blue / Cyan)
        ctx.fillStyle = `rgba(56, 189, 248, ${p.opacity * 0.85})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Recycle offscreen nodes
      if (p.x > w + 20) {
        particles.splice(i, 1);
        createTransactionNode(-10);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFraudCanvas);
  } else {
    initFraudCanvas();
  }
})();
