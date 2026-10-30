/* ==========================================================================
   ATHARVA GANGURDE — CINEMATIC 3D DEVELOPER PORTFOLIO
   Tech Stack: Floating 3D Technology Spheres (Three.js)
   Pearl, Silver & Subtle Violet Materials with Verified Tech Logos
   ========================================================================== */

(function () {
  'use strict';

  const TECH_DATA = [
    {
      id: 'python',
      name: 'Python',
      category: 'Core Language',
      desc: 'Primary programming language for end-to-end machine learning, data engineering, statistical modeling, and API integrations.',
      projects: 'FraudGuard AI, AYOVANI, Gaia DR3 Clustering',
      color: '#38bdf8',
      accent: '#0284c7',
      symbol: 'Py'
    },
    {
      id: 'sklearn',
      name: 'scikit-learn',
      category: 'Machine Learning',
      desc: 'Building production ML pipelines, hyperparameter tuning, K-Means clustering, and high-precision ensemble classifiers.',
      projects: 'FraudGuard AI (0.96 Precision), Stellar Clustering',
      color: '#f97316',
      accent: '#ea580c',
      symbol: 'SK'
    },
    {
      id: 'xgboost',
      name: 'XGBoost',
      category: 'Gradient Boosting',
      desc: 'High-performance gradient boosting for extreme class-imbalanced tabular datasets and fraud classification benchmarks.',
      projects: 'FraudGuard AI (Evaluated Benchmark)',
      color: '#38bdf8',
      accent: '#0369a1',
      symbol: 'XGB'
    },
    {
      id: 'shap',
      name: 'SHAP',
      category: 'Explainable AI',
      desc: 'Game-theoretic Shapley Additive exPlanations to interpret black-box model predictions and reveal key fraud risk drivers.',
      projects: 'FraudGuard AI Risk Dashboard',
      color: '#ec4899',
      accent: '#be185d',
      symbol: 'SHAP'
    },
    {
      id: 'tensorflow',
      name: 'TensorFlow',
      category: 'Deep Learning',
      desc: 'Constructing and evaluating neural network architectures, Perceptron baselines, ANN classifiers, and CNNs.',
      projects: 'Neural Network Experimentation',
      color: '#f59e0b',
      accent: '#d97706',
      symbol: 'TF'
    },
    {
      id: 'onnx',
      name: 'ONNX Runtime',
      category: 'Edge AI / Inference',
      desc: 'INT8 quantized neural execution enabling sub-2.5s time-to-first-audio on constrained edge hardware.',
      projects: 'AYOVANI (SIH 2026 Team Project)',
      color: '#22d3ee',
      accent: '#0891b2',
      symbol: 'ONNX'
    },
    {
      id: 'pandas',
      name: 'pandas',
      category: 'Data Engineering',
      desc: 'Data wrangling, cleaning large astronomical catalogues (4,959 stars), and processing 284,807 financial transactions.',
      projects: 'FraudGuard AI, Gaia DR3 Analysis',
      color: '#818cf8',
      accent: '#4f46e5',
      symbol: 'PD'
    },
    {
      id: 'numpy',
      name: 'NumPy',
      category: 'Scientific Computing',
      desc: 'Vectorized linear algebra, multidimensional tensor operations, and fast mathematical computation.',
      projects: 'All ML & Algorithmic Projects',
      color: '#38bdf8',
      accent: '#2563eb',
      symbol: 'NP'
    },
    {
      id: 'streamlit',
      name: 'Streamlit',
      category: 'Interactive Web Apps',
      desc: 'Engineering intuitive web dashboards to showcase live ML risk scores and multidimensional astronomical clusters.',
      projects: 'FraudGuard AI Dashboard, Stellar Clustering App',
      color: '#f43f5e',
      accent: '#e11d48',
      symbol: 'ST'
    },
    {
      id: 'threejs',
      name: 'Three.js',
      category: '3D WebGL Graphics',
      desc: 'Creative development, real-time 3D geometry generation, custom shaders, and spatial portfolio experiences.',
      projects: 'Cinematic 3D Portfolio, Gaia 3D Visualizer',
      color: '#c084fc',
      accent: '#7e22ce',
      symbol: '3JS'
    },
    {
      id: 'git',
      name: 'Git',
      category: 'Version Control',
      desc: 'Branching strategies, collaborative workflows, reproducible research repositories, and version tracking.',
      projects: 'All Repositories',
      color: '#f97316',
      accent: '#c2410c',
      symbol: 'GIT'
    },
    {
      id: 'github',
      name: 'GitHub',
      category: 'Collaboration & CI',
      desc: 'Open-source project publishing, documentation, continuous workflows, and portfolio code management.',
      projects: 'Atharva110409 / Stellar / FraudGuard',
      color: '#e2e8f0',
      accent: '#94a3b8',
      symbol: 'GH'
    }
  ];

  let scene, camera, renderer, container;
  let spheresGroup;
  let sphereObjects = [];
  let raycaster, mouse;
  let hoveredSphere = null;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let clock = new THREE.Clock();
  let isVisible = true;
  let prefersReducedMotion = false;

  function initTechScene() {
    container = document.getElementById('tech-stage-container');
    const canvas = document.getElementById('tech-canvas');
    if (!container || !canvas) return;

    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion = mq.matches;
      mq.addEventListener('change', (e) => {
        prefersReducedMotion = e.matches;
      });
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    try {
      // 1. Scene
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x080910, 0.04);

      // 2. Camera
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 8.2);

      // 3. Renderer
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

      // 4. Lighting (White key, subtle violet rim, pearl highlights)
      const ambientLight = new THREE.AmbientLight(0x1a1d2e, 1.6);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(5, 7, 7);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xa855f7, 4.2);
      rimLight.position.set(-6, 3, -4);
      scene.add(rimLight);

      const blueFill = new THREE.DirectionalLight(0x38bdf8, 2.2);
      blueFill.position.set(0, -5, 4);
      scene.add(blueFill);

      // 5. Spheres Group
      spheresGroup = new THREE.Group();
      scene.add(spheresGroup);

      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2(-999, -999);

      createFloatingSpheres();

      // 6. Event Listeners
      window.addEventListener('resize', onResize, false);
      container.addEventListener('mousemove', onMouseMove, false);
      container.addEventListener('mousedown', onMouseDown, false);
      window.addEventListener('mouseup', onMouseUp, false);
      container.addEventListener('mouseleave', onMouseLeave, false);

      // Touch interaction
      container.addEventListener('touchstart', onTouchStart, { passive: true });
      container.addEventListener('touchmove', onTouchMove, { passive: true });

      // Performance observer
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
        });
      }, { threshold: 0.1 });
      observer.observe(container);

      // Select Python by default in HUD
      updateTechHUD(TECH_DATA[0]);

      animate();

    } catch (err) {
      console.warn('WebGL init failed in Tech Spheres:', err);
      // Grid fallback already visible below canvas in HTML
    }
  }

  // Generate dual-sided texture so logo is clearly visible from all angles
  function createSphereTexture(tech) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Elegant Pearl / Silver metallic gradient base
    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 512);
    bgGrad.addColorStop(0, '#1c1f30');
    bgGrad.addColorStop(0.5, '#121422');
    bgGrad.addColorStop(1, '#0c0e18');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // Subtle fine metallic brushed texture lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 512; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Draw tech emblem at BOTH u=0.25 (x=256) and u=0.75 (x=768)
    // This ensures full 360-degree visibility as the sphere orbits and floats!
    [256, 768].forEach(cx => {
      // Outer Glowing Ring in Technology Brand Color
      ctx.save();
      ctx.shadowColor = tech.color;
      ctx.shadowBlur = 28;
      ctx.strokeStyle = tech.color;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, 240, 130, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Translucent inner disc
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.arc(cx, 240, 120, 0, Math.PI * 2);
      ctx.fill();

      // Big Stylized Monogram
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 84px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = tech.color;
      ctx.shadowBlur = 18;
      ctx.fillText(tech.symbol, cx, 220);
      ctx.restore();

      // High-Contrast Title Label Below
      ctx.fillStyle = tech.color;
      ctx.font = '700 32px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tech.name, cx, 305);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 4;
    return texture;
  }

  function createFloatingSpheres() {
    const numSpheres = TECH_DATA.length;
    const radius = 3.4;

    for (let i = 0; i < numSpheres; i++) {
      const tech = TECH_DATA[i];
      // Golden spiral distribution on sphere surface for balanced visual spacing
      const phi = Math.acos(-1 + (2 * i) / numSpheres);
      const theta = Math.sqrt(numSpheres * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = (radius * 0.70) * Math.sin(theta) * Math.sin(phi);
      const z = (radius * 0.95) * Math.cos(phi);

      // Hierarchical sphere sizing (0.54 to 0.65)
      const sphereRadius = i % 3 === 0 ? 0.64 : (i % 2 === 0 ? 0.58 : 0.52);
      const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);

      const texture = createSphereTexture(tech);

      // Pearl & Silver Material with Clearcoat Gloss & Violet Highlight
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xf8fafc,
        map: texture,
        roughness: 0.22,
        metalness: 0.35,
        clearcoat: 0.9,
        clearcoatRoughness: 0.12,
        reflectivity: 0.7
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);

      mesh.userData = {
        tech: tech,
        basePos: new THREE.Vector3(x, y, z),
        floatSpeed: 0.7 + (i % 4) * 0.25,
        floatFreq: 1.1 + (i % 3) * 0.3,
        floatPhase: i * 1.4,
        baseScale: 1.0,
        targetScale: 1.0
      };

      // Glowing Gyroscope Accent Ring in brand color
      const haloGeo = new THREE.TorusGeometry(sphereRadius * 1.25, 0.015, 16, 48);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(tech.color),
        transparent: true,
        opacity: 0.65
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 3.5 + (i * 0.4);
      halo.rotation.y = (i * 0.3);
      mesh.add(halo);
      mesh.userData.halo = halo;

      spheresGroup.add(mesh);
      sphereObjects.push(mesh);
    }
  }

  function onResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function getContainerMouse(e) {
    const rect = container.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((e.clientY - rect.top) / rect.height) * 2 + 1
    };
  }

  function onMouseMove(e) {
    const m = getContainerMouse(e);
    mouse.x = m.x;
    mouse.y = m.y;

    if (isDragging) {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      spheresGroup.rotation.y += deltaX * 0.005;
      spheresGroup.rotation.x += deltaY * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    checkRaycast();
  }

  function onMouseDown(e) {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  }

  function onMouseUp() {
    isDragging = false;
  }

  function onMouseLeave() {
    isDragging = false;
    mouse.set(-999, -999);
    if (hoveredSphere) {
      hoveredSphere.userData.targetScale = 1.0;
      if (hoveredSphere.userData.halo) {
        hoveredSphere.userData.halo.material.opacity = 0.65;
      }
      hoveredSphere = null;
    }
  }

  function onTouchStart(e) {
    if (e.touches.length === 1) {
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function onTouchMove(e) {
    if (e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      spheresGroup.rotation.y += deltaX * 0.006;
      spheresGroup.rotation.x += deltaY * 0.006;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function checkRaycast() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(sphereObjects);

    if (intersects.length > 0) {
      const selected = intersects[0].object;
      if (hoveredSphere !== selected) {
        if (hoveredSphere) {
          hoveredSphere.userData.targetScale = 1.0;
          if (hoveredSphere.userData.halo) {
            hoveredSphere.userData.halo.material.opacity = 0.65;
          }
        }
        hoveredSphere = selected;
        hoveredSphere.userData.targetScale = 1.25;
        if (hoveredSphere.userData.halo) {
          hoveredSphere.userData.halo.material.opacity = 1.0;
        }
        updateTechHUD(hoveredSphere.userData.tech);
      }
    } else {
      if (hoveredSphere) {
        hoveredSphere.userData.targetScale = 1.0;
        if (hoveredSphere.userData.halo) {
          hoveredSphere.userData.halo.material.opacity = 0.65;
        }
        hoveredSphere = null;
      }
    }
  }

  function updateTechHUD(tech) {
    const nameEl = document.getElementById('tech-hud-name');
    const catEl = document.getElementById('tech-hud-category');
    const descEl = document.getElementById('tech-hud-desc');
    const projEl = document.getElementById('tech-hud-projects');

    if (nameEl) nameEl.innerHTML = `<span style="color:${tech.color}">●</span> ${tech.name}`;
    if (catEl) catEl.textContent = tech.category;
    if (descEl) descEl.textContent = tech.desc;
    if (projEl) projEl.textContent = `Applied in: ${tech.projects}`;
  }

  function animate() {
    requestAnimationFrame(animate);

    if (!isVisible) return;

    if (prefersReducedMotion) {
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
      return;
    }

    const elapsedTime = clock.getElapsedTime();

    // Slow orbital rotation when not dragging
    if (!isDragging) {
      spheresGroup.rotation.y += 0.0018;
      spheresGroup.rotation.x = Math.sin(elapsedTime * 0.25) * 0.06;
    }

    // Individual sphere float & scale lerp
    for (let i = 0; i < sphereObjects.length; i++) {
      const s = sphereObjects[i];
      const data = s.userData;

      // Harmonic vertical bobbing
      const offset = Math.sin(elapsedTime * data.floatSpeed + data.floatPhase) * 0.12;
      s.position.y = data.basePos.y + offset;

      // Gentle self-spin so dual-sided logos rotate into view
      s.rotation.y += 0.006;

      // Smooth scale interpolation on hover
      const currentScale = s.scale.x;
      const targetScale = data.targetScale;
      const newScale = currentScale + (targetScale - currentScale) * 0.12;
      s.scale.set(newScale, newScale, newScale);

      // Rotate glowing halo ring
      if (data.halo) {
        data.halo.rotation.z += 0.018;
      }
    }

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTechScene);
  } else {
    initTechScene();
  }
})();
