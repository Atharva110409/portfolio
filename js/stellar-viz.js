/* ==========================================================================
   ATHARVA GANGURDE — CINEMATIC 3D DEVELOPER PORTFOLIO
   Project 03: Stellar Population Clustering with Gaia DR3 (Three.js 3D Cloud)
   ========================================================================== */

(function () {
  'use strict';

  const TOTAL_STARS = 4959;
  const CLUSTERS_CONFIG = [
    {
      id: 0,
      name: 'Cluster 0: Ordinary Background Stars',
      count: 2199,
      color: 0x22c55e, // Green (matches project README)
      hex: '#22c55e',
      spread: { x: 3.2, y: 1.2, z: 2.8 },
      center: { x: -0.5, y: -0.4, z: 0.1 },
      desc: 'Faint & distant background stars forming the largest unsupervised astrometric group (2,199 stars).'
    },
    {
      id: 1,
      name: 'Cluster 1: Average Nearby Population',
      count: 1450,
      color: 0x38bdf8, // Blue (matches project README)
      hex: '#38bdf8',
      spread: { x: 2.0, y: 1.4, z: 1.8 },
      center: { x: 0.7, y: 0.5, z: -0.4 },
      desc: 'Average nearby stellar population with standard solar-neighborhood parallax & kinematics (1,450 stars).'
    },
    {
      id: 2,
      name: 'Cluster 2: Luminous Distant Stars',
      count: 1129,
      color: 0xa855f7, // Purple (matches project README)
      hex: '#a855f7',
      spread: { x: 1.7, y: 1.6, z: 1.5 },
      center: { x: 1.2, y: -0.8, z: 0.8 },
      desc: 'Luminous distant stars distinguished by high photometric brightness across 5D Gaia features (1,129 stars).'
    },
    {
      id: 3,
      name: 'Cluster 3: Close Neighbourhood Stars',
      count: 178,
      color: 0xf59e0b, // Orange (matches project README)
      hex: '#f59e0b',
      spread: { x: 0.9, y: 0.8, z: 0.9 },
      center: { x: -1.8, y: 1.1, z: -1.1 },
      desc: 'Proximate stars with elevated parallax measurements in the immediate solar vicinity (178 stars).'
    },
    {
      id: 4,
      name: 'Cluster 4: Anomalous Runaway Candidates',
      count: 3,
      color: 0xf43f5e, // Red (matches project README)
      hex: '#f43f5e',
      spread: { x: 4.5, y: 4.0, z: 4.5 },
      center: { x: 3.4, y: 2.5, z: -2.6 },
      desc: 'Extreme outlier candidates displaying anomalous proper motion (130–168 mas/yr) isolated via unsupervised learning (3 stars).'
    }
  ];

  let scene, camera, renderer, container;
  let pointsMesh;
  let starData = [];
  let currentFilter = -1; // -1 means all clusters
  let isDragging = false;
  let previousMousePos = { x: 0, y: 0 };
  let isVisible = true;
  let prefersReducedMotion = false;
  let clock = new THREE.Clock();

  function initStellarScene() {
    container = document.getElementById('stellar-canvas-area');
    const canvas = document.getElementById('stellar-canvas');
    if (!container || !canvas) return;

    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion = mq.matches;
      mq.addEventListener('change', (e) => {
        prefersReducedMotion = e.matches;
      });
    }

    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    // 1. Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.05);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 7.5);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Studio Space Lighting
    const ambientLight = new THREE.AmbientLight(0x18182b, 1.2);
    scene.add(ambientLight);

    const violetLight = new THREE.PointLight(0xa855f7, 3.0, 15);
    violetLight.position.set(-4, 3, 2);
    scene.add(violetLight);

    const blueLight = new THREE.PointLight(0x38bdf8, 2.5, 15);
    blueLight.position.set(4, -2, -2);
    scene.add(blueLight);

    // 5. Generate 4,959 Stars Point Cloud
    buildStellarPointCloud();

    // 6. Interactive Controls
    setupFilterButtons();

    // Mouse drag rotation & zoom
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePos.x;
      const deltaY = e.clientY - previousMousePos.y;

      if (pointsMesh) {
        pointsMesh.rotation.y += deltaX * 0.005;
        pointsMesh.rotation.x += deltaY * 0.005;
      }

      previousMousePos = { x: e.clientX, y: e.clientY };
    });

    // Touch support
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        previousMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - previousMousePos.x;
        const deltaY = e.touches[0].clientY - previousMousePos.y;
        if (pointsMesh) {
          pointsMesh.rotation.y += deltaX * 0.007;
          pointsMesh.rotation.x += deltaY * 0.007;
        }
        previousMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    // Mouse wheel zoom support with distance clamping
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.005;
      camera.position.z = Math.max(3.5, Math.min(14.0, camera.position.z + zoomDelta));
    }, { passive: false });

    window.addEventListener('resize', onResize, false);

    // Performance observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.1 });
    observer.observe(container);

    animate();
  }

  function buildStellarPointCloud() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(TOTAL_STARS * 3);
    const colors = new Float32Array(TOTAL_STARS * 3);
    const defaultColors = new Float32Array(TOTAL_STARS * 3);

    let starIndex = 0;

    CLUSTERS_CONFIG.forEach(cluster => {
      const cColor = new THREE.Color(cluster.color);

      for (let i = 0; i < cluster.count && starIndex < TOTAL_STARS; i++) {
        // Gaussian-like cluster distribution
        const u = Math.random() + Math.random() - 1;
        const v = Math.random() + Math.random() - 1;
        const w = Math.random() + Math.random() - 1;
        const distFromCenter = Math.sqrt(u * u + v * v + w * w);
        const isHdbscanNoise = (distFromCenter > 0.58 && cluster.id !== 4);

        const x = cluster.center.x + u * cluster.spread.x;
        const y = cluster.center.y + v * cluster.spread.y;
        const z = cluster.center.z + w * cluster.spread.z;

        positions[starIndex * 3] = x;
        positions[starIndex * 3 + 1] = y;
        positions[starIndex * 3 + 2] = z;

        colors[starIndex * 3] = cColor.r;
        colors[starIndex * 3 + 1] = cColor.g;
        colors[starIndex * 3 + 2] = cColor.b;

        defaultColors[starIndex * 3] = cColor.r;
        defaultColors[starIndex * 3 + 1] = cColor.g;
        defaultColors[starIndex * 3 + 2] = cColor.b;

        starData.push({
          clusterId: cluster.id,
          isHdbscanNoise: isHdbscanNoise,
          pos: { x, y, z },
          color: cColor
        });

        starIndex++;
      }
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.userData.defaultColors = defaultColors;

    // Point Material
    const material = new THREE.PointsMaterial({
      size: 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    pointsMesh = new THREE.Points(geometry, material);
    scene.add(pointsMesh);
  }

  function setupFilterButtons() {
    const buttons = document.querySelectorAll('.stellar-filter-btn');
    const infoEl = document.getElementById('stellar-filter-info');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const clusterId = parseInt(btn.getAttribute('data-cluster'), 10);
        applyClusterFilter(clusterId);

        if (infoEl) {
          if (clusterId === -1) {
            infoEl.textContent = 'Showing all 4,959 stars clustered across 5 unsupervised K-Means populations + HDBSCAN density separation.';
          } else if (clusterId === 5) {
            infoEl.innerHTML = '<strong style="color:#94a3b8">HDBSCAN Density Separation (3,074 Noise Stars)</strong> — Density-based clustering automatically separates field background stars that do not belong to any dense cluster (min_cluster_size=15).';
          } else {
            const c = CLUSTERS_CONFIG[clusterId];
            infoEl.innerHTML = `<strong style="color:${c.hex}">${c.name}</strong> (${c.count} stars) — ${c.desc}`;
          }
        }
      });
    });
  }

  function applyClusterFilter(clusterId) {
    currentFilter = clusterId;
    if (!pointsMesh) return;

    const colorsAttr = pointsMesh.geometry.attributes.color;
    const defaultColors = pointsMesh.geometry.userData.defaultColors;

    for (let i = 0; i < TOTAL_STARS; i++) {
      const star = starData[i];
      let isActive = false;

      if (clusterId === -1) {
        isActive = true;
      } else if (clusterId === 5) {
        isActive = star.isHdbscanNoise;
      } else {
        isActive = (star.clusterId === clusterId);
      }

      if (isActive) {
        if (clusterId === 5) {
          // Highlight HDBSCAN noise in muted cool slate
          colorsAttr.setXYZ(i, 0.65, 0.72, 0.85);
        } else {
          colorsAttr.setXYZ(i, defaultColors[i * 3], defaultColors[i * 3 + 1], defaultColors[i * 3 + 2]);
        }
      } else {
        // Dim unselected clusters
        colorsAttr.setXYZ(i, defaultColors[i * 3] * 0.08, defaultColors[i * 3 + 1] * 0.08, defaultColors[i * 3 + 2] * 0.08);
      }
    }

    colorsAttr.needsUpdate = true;
  }

  function onResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight || 420;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
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

    // Gentle orbital rotation
    if (pointsMesh && !isDragging) {
      pointsMesh.rotation.y = elapsedTime * 0.045;
      pointsMesh.rotation.x = Math.sin(elapsedTime * 0.2) * 0.06;
    }

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStellarScene);
  } else {
    initStellarScene();
  }
})();
