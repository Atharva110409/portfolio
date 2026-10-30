/* ==========================================================================
   ATHARVA GANGURDE — CINEMATIC 3D DEVELOPER PORTFOLIO
   Project 02: AYOVANI — Offline AI Speech Translation Waveform & Pipeline
   ========================================================================== */

(function () {
  'use strict';

  let canvas, ctx, container;
  let isVisible = true;
  let animId;
  let phase = 0;
  let activeStep = 0;
  let isSimulating = false;
  let prefersReducedMotion = false;

  const PIPELINE_STEPS = [
    { label: 'Voice Input', sub: 'Mic Audio (PCM)' },
    { label: 'IndicConformer', sub: 'ASR Acoustic Model' },
    { label: 'IndicTrans2', sub: 'ONNX INT8 NMT' },
    { label: 'Piper TTS', sub: 'Speech Synthesis' },
    { label: 'Audio Out', sub: 'Low Latency Speaker' }
  ];

  // Verified bidirectional pipeline modes (Devanagari orthography: hin_Deva <-> mun_Deva)
  // Questionable/invented sample texts omitted in accordance with pipeline factual audit.
  const MODES = [
    {
      direction: 'Classroom Instruction: Hindi (hin_Deva) → Mundari (mun_Deva)',
      srcLang: 'Hindi Spoken Instruction (hin_Deva)',
      srcDesc: 'Teacher classroom speech captured via on-device microphone (16 kHz PCM audio stream)',
      tgtLang: 'Mundari Synthesized Speech (mun_Deva)',
      tgtDesc: 'Piper-VITS edge synthesis outputting spoken Mundari audio based on Devanagari orthography',
      telemetry: 'Quantized IndicTrans2 (QUInt8) • Latency: ~2.05s TTFA • Working RAM: 183 MB'
    },
    {
      direction: 'Student Response: Mundari (mun_Deva) → Hindi (hin_Deva)',
      srcLang: 'Mundari Spoken Response (mun_Deva)',
      srcDesc: 'Student tribal classroom inquiry captured via offline tablet microphone',
      tgtLang: 'Hindi Synthesized Speech (hin_Deva)',
      tgtDesc: 'Audio synthesis enabling non-tribal instructors to understand indigenous student feedback',
      telemetry: 'Bidirectional Direction-Tag Conditioning • Latency: ~2.45s TTFA • Working RAM: 347 MB'
    }
  ];

  let currentModeIdx = 0;

  function initAyovaniCanvas() {
    container = document.getElementById('ayovani-canvas-area');
    canvas = document.getElementById('ayovani-canvas');
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

    // Button event listeners
    const simBtn = document.getElementById('ayovani-sim-btn');
    if (simBtn) {
      simBtn.addEventListener('click', triggerSimulation);
    }

    const switchBtn = document.getElementById('ayovani-switch-btn');
    if (switchBtn) {
      switchBtn.addEventListener('click', () => {
        currentModeIdx = (currentModeIdx + 1) % MODES.length;
        updateSampleDisplay();
      });
    }

    const inspectBtn = document.getElementById('ayovani-inspect-btn');
    if (inspectBtn) {
      inspectBtn.addEventListener('click', () => {
        const modal = document.getElementById('ayovani-modal');
        if (modal) modal.classList.add('active');
      });
    }

    // Modal close
    const modalClose = document.getElementById('ayovani-modal-close');
    if (modalClose) {
      modalClose.addEventListener('click', () => {
        const modal = document.getElementById('ayovani-modal');
        if (modal) modal.classList.remove('active');
      });
    }

    // Visibility observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.1 });
    observer.observe(container);

    updateSampleDisplay();
    renderWaveform();
  }

  function resizeCanvas() {
    if (!container || !canvas) return;
    canvas.width = container.clientWidth;
    canvas.height = 140; // compact waveform canvas
  }

  function updateSampleDisplay() {
    const mode = MODES[currentModeIdx];
    const srcLangEl = document.getElementById('ayovani-src-lang');
    const srcTextEl = document.getElementById('ayovani-src-text');
    const tgtLangEl = document.getElementById('ayovani-tgt-lang');
    const tgtTextEl = document.getElementById('ayovani-tgt-text');
    const noteEl = document.getElementById('ayovani-script-note');

    if (srcLangEl) srcLangEl.textContent = mode.srcLang;
    if (srcTextEl) srcTextEl.textContent = mode.srcDesc;
    if (tgtLangEl) tgtLangEl.textContent = mode.tgtLang;
    if (tgtTextEl) tgtTextEl.textContent = mode.tgtDesc;
    if (noteEl) noteEl.textContent = mode.telemetry;
  }

  function triggerSimulation() {
    if (isSimulating) return;
    isSimulating = true;
    activeStep = 0;

    const stepInterval = setInterval(() => {
      activeStep++;
      updateStepUI(activeStep);

      if (activeStep >= PIPELINE_STEPS.length) {
        clearInterval(stepInterval);
        setTimeout(() => {
          activeStep = 0;
          updateStepUI(-1);
          isSimulating = false;
        }, 1200);
      }
    }, 450);
  }

  function updateStepUI(step) {
    const nodes = document.querySelectorAll('.pipeline-node');
    nodes.forEach((node, i) => {
      node.classList.toggle('active', i === step);
    });
  }

  function renderWaveform() {
    animId = requestAnimationFrame(renderWaveform);

    if (!isVisible || !ctx) {
      if (canvas) ctx = canvas.getContext('2d');
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;
    const centerY = h / 2;

    phase += prefersReducedMotion ? 0 : (isSimulating ? 0.08 : 0.025);

    // Draw Multi-harmonic Organic Waveforms
    // Wave 1: Primary Cyan Wave
    drawSineWave(w, centerY, phase, 24, 0.015, 'rgba(34, 211, 238, 0.75)', 2.5);

    // Wave 2: Secondary Violet Wave
    drawSineWave(w, centerY, phase * 1.3 + 1.2, 16, 0.022, 'rgba(168, 85, 247, 0.65)', 2);

    // Wave 3: Tertiary Soft Indigo Background Wave
    drawSineWave(w, centerY, phase * 0.7 + 2.5, 32, 0.008, 'rgba(99, 102, 241, 0.25)', 1.5);

    // Pulse markers when simulating
    if (isSimulating) {
      const progress = (phase % 5) / 5;
      const markerX = progress * w;
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(markerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function drawSineWave(width, centerY, ph, amplitude, frequency, color, lineWidth) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    const ampMultiplier = isSimulating ? 1.6 : 1.0;

    for (let x = 0; x < width; x += 4) {
      // Natural envelope dampening at edges
      const edgeFactor = Math.sin((x / width) * Math.PI);
      const y = centerY + Math.sin(x * frequency + ph) * amplitude * edgeFactor * ampMultiplier;

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.stroke();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAyovaniCanvas);
  } else {
    initAyovaniCanvas();
  }
})();
