/* ==========================================================================
   ATHARVA GANGURDE — CINEMATIC 3D DEVELOPER PORTFOLIO
   Hero 3D Developer Character Mascot & Cinematic Studio Environment
   ========================================================================== */

(function () {
  'use strict';

  let scene, camera, renderer;
  let mascotRoot, headGroup, eyesGroup, glassesGroup, companionOrb, companionRing;
  let screenLight, laptopGroup;
  let particlesMesh, platformGlowRing;
  let targetMouseX = 0, targetMouseY = 0;
  let currentMouseX = 0, currentMouseY = 0;
  let clock = new THREE.Clock();
  let blinkTimer = 0;
  let isBlinking = false;
  let isVisible = true;
  let canvasContainer;
  let prefersReducedMotion = false;

  function initHeroScene() {
    canvasContainer = document.getElementById('hero-canvas-container');
    const canvas = document.getElementById('hero-canvas');
    if (!canvasContainer || !canvas) return;

    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      prefersReducedMotion = mediaQuery.matches;
      mediaQuery.addEventListener('change', (e) => {
        prefersReducedMotion = e.matches;
      });
    }

    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;

    try {
      // 1. Scene
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050508, 0.04);

      // 2. Camera
      camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      updateCameraPosition();

      // 3. WebGL Renderer
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // 4. Studio Lighting System
      setupStudioLighting();

      // 5. Build Stage, Mascot & Floating Companion
      buildStagePlatform();
      buildStylizedDeveloperMascot();
      buildFloatingCompanion();
      buildAtmosphericDust();

      // 6. Listeners
      window.addEventListener('resize', onWindowResize, false);
      window.addEventListener('mousemove', onMouseMove, false);

      // 7. Visibility Observer
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });
      observer.observe(canvasContainer);

      // 8. Animation Loop
      animate();

    } catch (err) {
      console.warn('WebGL initialization failed in Hero scene:', err);
      showHeroFallback();
    }
  }

  function showHeroFallback() {
    if (!canvasContainer) return;
    const canvas = document.getElementById('hero-canvas');
    if (canvas) canvas.style.display = 'none';

    let fallback = document.getElementById('hero-fallback-stage');
    if (!fallback) {
      fallback = document.createElement('div');
      fallback.id = 'hero-fallback-stage';
      fallback.className = 'hero-fallback-stage';
      fallback.innerHTML = `
        <div class="fallback-mascot-card">
          <div class="fallback-avatar-circle">
            <span class="fallback-avatar-emoji">👨‍💻</span>
            <div class="fallback-glow-ring"></div>
          </div>
          <div class="fallback-badge">ATHARVA // 3D MASCOT</div>
        </div>
      `;
      canvasContainer.appendChild(fallback);
    }
  }

  function updateCameraPosition() {
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      // Mobile: Centered in 380px stage canvas
      camera.position.set(0, 0.75, 4.8);
      camera.lookAt(0, 0.75, 0);
    } else {
      camera.position.set(0.48, 1.02, 5.0);
      camera.lookAt(-0.48, 0.80, 0);
    }
  }

  function setupStudioLighting() {
    // Soft Dark Ambient
    const ambientLight = new THREE.AmbientLight(0x0e101f, 1.1);
    scene.add(ambientLight);

    // Warm Key Spotlight from above-left
    const spotLight = new THREE.SpotLight(0xfff2e5, 2.8);
    spotLight.position.set(-1.0, 7.0, 4.0);
    spotLight.angle = Math.PI / 4.6;
    spotLight.penumbra = 0.65;
    spotLight.decay = 1.2;
    spotLight.distance = 25;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.bias = -0.0008;
    scene.add(spotLight);

    // Front Warm Fill Light
    const frontFill = new THREE.DirectionalLight(0xffeedd, 0.9);
    frontFill.position.set(1.5, 2.0, 4.0);
    scene.add(frontFill);

    // Dramatic Violet Rim Light (Reference Signature)
    const rimLight = new THREE.DirectionalLight(0xa855f7, 4.0);
    rimLight.position.set(-4.5, 3.0, -3.0);
    rimLight.castShadow = false;
    scene.add(rimLight);

    // Subtle Electric Blue Fill
    const blueFill = new THREE.DirectionalLight(0x38bdf8, 1.0);
    blueFill.position.set(4.0, 1.0, 2.5);
    scene.add(blueFill);

    // Floor Violet Bounce
    const bounceLight = new THREE.PointLight(0x7c3aed, 1.8, 6);
    bounceLight.position.set(-1.2, 0.1, 0.8);
    scene.add(bounceLight);
  }

  function buildStagePlatform() {
    const platformGroup = new THREE.Group();
    const isMobile = window.innerWidth < 1024;
    platformGroup.position.set(isMobile ? 0 : -1.35, -0.50, 0);

    // Base Podium
    const podiumGeo = new THREE.CylinderGeometry(1.65, 1.85, 0.22, 48);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x090b14,
      roughness: 0.5,
      metalness: 0.65
    });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.receiveShadow = true;
    platformGroup.add(podium);

    // Glowing Neon Violet Outer Ring
    const ringGeo = new THREE.TorusGeometry(1.68, 0.026, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.85
    });
    platformGlowRing = new THREE.Mesh(ringGeo, ringMat);
    platformGlowRing.rotation.x = Math.PI / 2;
    platformGlowRing.position.y = 0.11;
    platformGroup.add(platformGlowRing);

    // Inner Cyan Accent Ring
    const innerRingGeo = new THREE.TorusGeometry(1.28, 0.015, 16, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = 0.115;
    platformGroup.add(innerRing);

    // Soft Contact Shadow Disc
    const shadowGeo = new THREE.CircleGeometry(1.15, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x020205,
      transparent: true,
      opacity: 0.75
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.12;
    platformGroup.add(shadowMesh);

    scene.add(platformGroup);
  }

  function buildStylizedDeveloperMascot() {
    mascotRoot = new THREE.Group();
    const isMobile = window.innerWidth < 1024;
    mascotRoot.position.set(isMobile ? 0 : -1.35, -0.38, 0);

    // Premium Stylized Materials
    const hoodieMat = new THREE.MeshStandardMaterial({
      color: 0x11131c, // Matte charcoal streetwear hoodie
      roughness: 0.85,
      metalness: 0.05
    });

    const hoodieRibMat = new THREE.MeshStandardMaterial({
      color: 0x0b0c14,
      roughness: 0.9,
      metalness: 0.05
    });

    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e16, // Dark cargo pants
      roughness: 0.85,
      metalness: 0.05
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xdc9b78, // Warm natural stylized human skin tone
      roughness: 0.55,
      metalness: 0.0
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x14131e, // Deep espresso hair
      roughness: 0.75,
      metalness: 0.08
    });

    const capMat = new THREE.MeshStandardMaterial({
      color: 0x181928,
      roughness: 0.65,
      metalness: 0.12
    });

    const sneakerWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.3,
      metalness: 0.08
    });

    const sneakerUpperMat = new THREE.MeshStandardMaterial({
      color: 0x141624,
      roughness: 0.55,
      metalness: 0.15
    });

    const violetAccentMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.5,
      roughness: 0.25,
      metalness: 0.4
    });

    const glassesFrameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.2
    });

    const glassesLensMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5
    });

    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.15
    });

    // =========================================================================
    // 1. LEGS & HIGH-TOP SNEAKERS
    // =========================================================================
    const legsGroup = new THREE.Group();

    // Hips / Pelvis
    const pelvisGeo = new THREE.CylinderGeometry(0.35, 0.33, 0.20, 24);
    const pelvis = new THREE.Mesh(pelvisGeo, pantsMat);
    pelvis.position.y = 0.56;
    pelvis.castShadow = true;
    legsGroup.add(pelvis);

    // Left & Right Legs
    [-0.16, 0.16].forEach((legX, idx) => {
      const leg = new THREE.Group();
      leg.position.set(legX, 0.52, 0);

      // Thigh
      const thighGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.32, 16);
      thighGeo.translate(0, -0.16, 0);
      const thigh = new THREE.Mesh(thighGeo, pantsMat);
      thigh.rotation.z = (idx === 0 ? 0.03 : -0.03);
      thigh.castShadow = true;
      leg.add(thigh);

      // Shin
      const shinGeo = new THREE.CylinderGeometry(0.11, 0.095, 0.30, 16);
      shinGeo.translate(0, -0.15, 0);
      const shin = new THREE.Mesh(shinGeo, pantsMat);
      shin.position.set(0, -0.32, 0);
      shin.castShadow = true;
      leg.add(shin);

      // Ribbed Cuff
      const cuffGeo = new THREE.TorusGeometry(0.10, 0.018, 12, 20);
      const cuff = new THREE.Mesh(cuffGeo, hoodieRibMat);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.58;
      leg.add(cuff);

      // Sneaker
      const sneaker = new THREE.Group();
      sneaker.position.set(0, -0.60, 0.05);

      const soleGeo = new THREE.BoxGeometry(0.17, 0.06, 0.36);
      const sole = new THREE.Mesh(soleGeo, sneakerWhiteMat);
      sole.position.y = 0.03;
      sole.castShadow = true;
      sole.receiveShadow = true;
      sneaker.add(sole);

      const soleStripeGeo = new THREE.BoxGeometry(0.175, 0.015, 0.35);
      const soleStripe = new THREE.Mesh(soleStripeGeo, violetAccentMat);
      soleStripe.position.y = 0.045;
      sneaker.add(soleStripe);

      const shoeUpperGeo = new THREE.BoxGeometry(0.16, 0.11, 0.30);
      const shoeUpper = new THREE.Mesh(shoeUpperGeo, sneakerUpperMat);
      shoeUpper.position.set(0, 0.09, 0.01);
      shoeUpper.castShadow = true;
      sneaker.add(shoeUpper);

      const toeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.11, 16, 1, false, 0, Math.PI);
      const toe = new THREE.Mesh(toeGeo, sneakerWhiteMat);
      toe.rotation.x = -Math.PI / 2;
      toe.position.set(0, 0.055, 0.15);
      sneaker.add(toe);

      const heelGeo = new THREE.BoxGeometry(0.04, 0.055, 0.02);
      const heel = new THREE.Mesh(heelGeo, violetAccentMat);
      heel.position.set(0, 0.15, -0.13);
      sneaker.add(heel);

      sneaker.rotation.y = (idx === 0 ? -0.10 : 0.10);

      leg.add(sneaker);
      legsGroup.add(leg);
    });

    mascotRoot.add(legsGroup);

    // =========================================================================
    // 2. TORSO & HOODIE
    // =========================================================================
    const torsoGroup = new THREE.Group();

    // Hem
    const hemGeo = new THREE.CylinderGeometry(0.37, 0.38, 0.10, 24);
    const hem = new THREE.Mesh(hemGeo, hoodieRibMat);
    hem.position.y = 0.70;
    torsoGroup.add(hem);

    // Torso
    const torsoGeo = new THREE.CylinderGeometry(0.40, 0.37, 0.62, 24);
    const torso = new THREE.Mesh(torsoGeo, hoodieMat);
    torso.position.y = 1.02;
    torso.castShadow = true;
    torso.receiveShadow = true;
    torsoGroup.add(torso);

    // Shoulder Joint Spheres
    [-0.40, 0.40].forEach(sx => {
      const shoulderGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const shoulder = new THREE.Mesh(shoulderGeo, hoodieMat);
      shoulder.position.set(sx, 1.25, 0);
      shoulder.castShadow = true;
      torsoGroup.add(shoulder);
    });

    // Kangaroo Pouch Pocket
    const pocketGeo = new THREE.BoxGeometry(0.42, 0.20, 0.14);
    const pocket = new THREE.Mesh(pocketGeo, hoodieMat);
    pocket.position.set(0, 0.86, 0.31);
    pocket.rotation.x = 0.08;
    torsoGroup.add(pocket);

    // Pocket Trim
    const trimGeo = new THREE.BoxGeometry(0.38, 0.015, 0.02);
    const trim = new THREE.Mesh(trimGeo, violetAccentMat);
    trim.position.set(0, 0.95, 0.38);
    torsoGroup.add(trim);

    // Cowl / Collar
    const cowlGeo = new THREE.TorusGeometry(0.26, 0.085, 16, 28);
    const cowl = new THREE.Mesh(cowlGeo, hoodieMat);
    cowl.rotation.x = Math.PI / 2;
    cowl.position.set(0, 1.32, 0.02);
    torsoGroup.add(cowl);

    // Back Hood
    const backHoodGeo = new THREE.SphereGeometry(0.28, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const backHood = new THREE.Mesh(backHoodGeo, hoodieMat);
    backHood.rotation.x = -Math.PI / 1.8;
    backHood.position.set(0, 1.26, -0.20);
    torsoGroup.add(backHood);

    // Drawstrings
    [-0.09, 0.09].forEach(stringX => {
      const stringGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.24, 8);
      const stringMesh = new THREE.Mesh(stringGeo, hoodieMat);
      stringMesh.position.set(stringX, 1.18, 0.36);
      torsoGroup.add(stringMesh);

      const agletGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.045, 12);
      const agletMesh = new THREE.Mesh(agletGeo, silverMat);
      agletMesh.position.set(stringX, 1.05, 0.36);
      torsoGroup.add(agletMesh);
    });

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.14, 0.15, 0.16, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 1.36;
    neck.castShadow = true;
    torsoGroup.add(neck);

    // =========================================================================
    // 3. ARMS, SLEEVES & HANDS
    // =========================================================================
    // Left Arm
    const armGroupL = new THREE.Group();
    armGroupL.position.set(-0.40, 1.25, 0);

    const upperArmGeoL = new THREE.CylinderGeometry(0.11, 0.095, 0.36, 16);
    upperArmGeoL.translate(0, -0.18, 0);
    const upperArmL = new THREE.Mesh(upperArmGeoL, hoodieMat);
    upperArmL.rotation.x = 0.50;
    upperArmL.rotation.z = -0.22;
    upperArmL.castShadow = true;
    armGroupL.add(upperArmL);

    const elbowL = new THREE.Group();
    elbowL.position.set(-0.06, -0.28, 0.16);

    const forearmGeoL = new THREE.CylinderGeometry(0.095, 0.08, 0.32, 16);
    forearmGeoL.translate(0, -0.16, 0);
    const forearmL = new THREE.Mesh(forearmGeoL, hoodieMat);
    forearmL.rotation.x = 1.20;
    forearmL.rotation.z = -0.32;
    forearmL.castShadow = true;
    elbowL.add(forearmL);

    const cuffLGeo = new THREE.TorusGeometry(0.08, 0.016, 12, 16);
    const cuffL = new THREE.Mesh(cuffLGeo, hoodieRibMat);
    cuffL.rotation.x = 1.20;
    cuffL.position.set(-0.08, -0.18, 0.28);
    elbowL.add(cuffL);

    const handLGeo = new THREE.SphereGeometry(0.075, 16, 16);
    handLGeo.scale(1.0, 0.6, 1.3);
    const handL = new THREE.Mesh(handLGeo, skinMat);
    handL.position.set(-0.09, -0.20, 0.35);
    handL.castShadow = true;
    elbowL.add(handL);

    armGroupL.add(elbowL);
    torsoGroup.add(armGroupL);

    // Right Arm
    const armGroupR = new THREE.Group();
    armGroupR.position.set(0.40, 1.25, 0);

    const upperArmGeoR = new THREE.CylinderGeometry(0.11, 0.095, 0.36, 16);
    upperArmGeoR.translate(0, -0.18, 0);
    const upperArmR = new THREE.Mesh(upperArmGeoR, hoodieMat);
    upperArmR.rotation.x = 0.50;
    upperArmR.rotation.z = 0.22;
    upperArmR.castShadow = true;
    armGroupR.add(upperArmR);

    const elbowR = new THREE.Group();
    elbowR.position.set(0.06, -0.28, 0.16);

    const forearmGeoR = new THREE.CylinderGeometry(0.095, 0.08, 0.32, 16);
    forearmGeoR.translate(0, -0.16, 0);
    const forearmR = new THREE.Mesh(forearmGeoR, hoodieMat);
    forearmR.rotation.x = 1.20;
    forearmR.rotation.z = 0.32;
    forearmR.castShadow = true;
    elbowR.add(forearmR);

    const cuffRGeo = new THREE.TorusGeometry(0.08, 0.016, 12, 16);
    const cuffR = new THREE.Mesh(cuffRGeo, hoodieRibMat);
    cuffR.rotation.x = 1.20;
    cuffR.position.set(0.08, -0.18, 0.28);
    elbowR.add(cuffR);

    const handRGeo = new THREE.SphereGeometry(0.075, 16, 16);
    handRGeo.scale(1.0, 0.6, 1.3);
    const handR = new THREE.Mesh(handRGeo, skinMat);
    handR.position.set(0.09, -0.20, 0.35);
    handR.castShadow = true;
    elbowR.add(handR);

    armGroupR.add(elbowR);
    torsoGroup.add(armGroupR);

    // =========================================================================
    // 4. METALLIC DEVELOPER LAPTOP
    // =========================================================================
    laptopGroup = new THREE.Group();
    laptopGroup.position.set(0, 0.60, 0.44);

    const laptopBaseGeo = new THREE.BoxGeometry(0.66, 0.022, 0.42);
    const laptopBodyMat = new THREE.MeshStandardMaterial({
      color: 0x121624,
      metalness: 0.85,
      roughness: 0.25
    });
    const laptopBase = new THREE.Mesh(laptopBaseGeo, laptopBodyMat);
    laptopBase.rotation.x = -0.05;
    laptopBase.castShadow = true;
    laptopBase.receiveShadow = true;
    laptopGroup.add(laptopBase);

    const kbGeo = new THREE.BoxGeometry(0.58, 0.004, 0.24);
    const kbMat = new THREE.MeshStandardMaterial({
      color: 0x1b2238,
      roughness: 0.5,
      metalness: 0.3
    });
    const kb = new THREE.Mesh(kbGeo, kbMat);
    kb.position.set(0, 0.014, -0.05);
    laptopGroup.add(kb);

    const trackpadGeo = new THREE.BoxGeometry(0.20, 0.003, 0.10);
    const trackpadMat = new THREE.MeshStandardMaterial({
      color: 0x242e4a,
      roughness: 0.2
    });
    const trackpad = new THREE.Mesh(trackpadGeo, trackpadMat);
    trackpad.position.set(0, 0.014, 0.13);
    laptopGroup.add(trackpad);

    // Screen Lid
    const screenLid = new THREE.Group();
    screenLid.position.set(0, 0.01, -0.21);
    screenLid.rotation.x = -0.58;

    const screenShellGeo = new THREE.BoxGeometry(0.66, 0.40, 0.018);
    const screenShell = new THREE.Mesh(screenShellGeo, laptopBodyMat);
    screenShell.position.set(0, 0.20, 0);
    screenShell.castShadow = true;
    screenLid.add(screenShell);

    const logoGeo = new THREE.CircleGeometry(0.040, 24);
    const logoMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
    const logoMesh = new THREE.Mesh(logoGeo, logoMat);
    logoMesh.position.set(0, 0.20, -0.011);
    logoMesh.rotation.y = Math.PI;
    screenLid.add(logoMesh);

    // Screen Canvas
    const codeCanvas = document.createElement('canvas');
    codeCanvas.width = 512;
    codeCanvas.height = 320;
    const cctx = codeCanvas.getContext('2d');

    cctx.fillStyle = '#080a14';
    cctx.fillRect(0, 0, 512, 320);

    cctx.fillStyle = '#0f172a';
    cctx.fillRect(0, 0, 512, 28);
    cctx.fillStyle = '#f43f5e';
    cctx.beginPath(); cctx.arc(18, 14, 5, 0, Math.PI * 2); cctx.fill();
    cctx.fillStyle = '#fbbf24';
    cctx.beginPath(); cctx.arc(36, 14, 5, 0, Math.PI * 2); cctx.fill();
    cctx.fillStyle = '#10b981';
    cctx.beginPath(); cctx.arc(54, 14, 5, 0, Math.PI * 2); cctx.fill();
    cctx.fillStyle = '#94a3b8';
    cctx.font = '12px "JetBrains Mono", monospace';
    cctx.fillText('Atharva // intelligent_systems.py', 80, 18);

    cctx.font = '14px "JetBrains Mono", monospace';
    cctx.fillStyle = '#a855f7';
    cctx.fillText('import', 20, 60);
    cctx.fillStyle = '#f8fafc';
    cctx.fillText('torch, onnxruntime, xgboost', 80, 60);

    cctx.fillStyle = '#38bdf8';
    cctx.fillText('class', 20, 95);
    cctx.fillStyle = '#fbbf24';
    cctx.fillText('IntelligentPipeline:', 70, 95);

    cctx.fillStyle = '#94a3b8';
    cctx.fillText('  # FraudGuard F1: 0.85 (0.96 Prec)', 35, 125);
    cctx.fillText('  # AYOVANI: Hindi-Mundari Edge INT8', 35, 150);

    cctx.fillStyle = '#10b981';
    cctx.fillText('  status = "ONLINE & OPTIMIZED"', 35, 180);

    cctx.fillStyle = '#c084fc';
    cctx.fillText('>>> GAIA DR3: 5 POPULATIONS CLUSTERED', 20, 225);
    cctx.fillStyle = '#38bdf8';
    cctx.fillText('>>> ATHARVA GANGURDE // PORTFOLIO', 20, 255);

    cctx.fillStyle = '#8b5cf6';
    cctx.fillRect(20, 280, 472, 3);

    const screenTex = new THREE.CanvasTexture(codeCanvas);
    const screenGeo = new THREE.PlaneGeometry(0.62, 0.36);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.20, 0.011);
    screenLid.add(screenMesh);

    laptopGroup.add(screenLid);

    // Subtle Cyan Screen Light
    screenLight = new THREE.PointLight(0x38bdf8, 0.8, 2.0);
    screenLight.position.set(0, 0.30, 0.08);
    laptopGroup.add(screenLight);

    torsoGroup.add(laptopGroup);
    mascotRoot.add(torsoGroup);

    // =========================================================================
    // 5. HEAD, HAIR, EXPRESSIVE FACE, GLASSES & STUDIO HEADPHONES
    // =========================================================================
    headGroup = new THREE.Group();
    headGroup.position.set(0, 1.54, 0.03);

    // Stylized Head (Sculpted oval shape with tapered chin)
    const headGeo = new THREE.SphereGeometry(0.34, 32, 32);
    headGeo.scale(1.0, 1.10, 1.02);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Soft Stylized Chin
    const chinGeo = new THREE.SphereGeometry(0.13, 16, 16);
    chinGeo.scale(1.0, 0.7, 0.9);
    const chin = new THREE.Mesh(chinGeo, skinMat);
    chin.position.set(0, -0.24, 0.22);
    headGroup.add(chin);

    // Cute Stylized Nose
    const noseGeo = new THREE.SphereGeometry(0.028, 12, 12);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, -0.04, 0.355);
    headGroup.add(nose);

    // Ears
    [-0.33, 0.33].forEach(earX => {
      const earGeo = new THREE.SphereGeometry(0.07, 16, 16);
      earGeo.scale(0.5, 1.0, 0.8);
      const ear = new THREE.Mesh(earGeo, skinMat);
      ear.position.set(earX, 0, 0.02);
      headGroup.add(ear);
    });

    // Sculpted Modern Developer Hair
    const hairCapGeo = new THREE.SphereGeometry(0.355, 28, 28, 0, Math.PI * 2, 0, Math.PI * 0.52);
    hairCapGeo.scale(1.02, 1.12, 1.04);
    const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
    hairCap.position.set(0, 0.05, -0.01);
    headGroup.add(hairCap);

    // Front Fringe Layer
    const fringeLocks = [
      { x: -0.16, y: 0.23, z: 0.28, rotZ: 0.28, scale: 0.11 },
      { x: -0.05, y: 0.25, z: 0.30, rotZ: 0.08, scale: 0.12 },
      { x: 0.06, y: 0.24, z: 0.29, rotZ: -0.10, scale: 0.11 },
      { x: 0.17, y: 0.21, z: 0.26, rotZ: -0.28, scale: 0.10 }
    ];

    fringeLocks.forEach(lock => {
      const lockGeo = new THREE.SphereGeometry(lock.scale, 16, 16);
      lockGeo.scale(1.0, 0.7, 1.3);
      const lockMesh = new THREE.Mesh(lockGeo, hairMat);
      lockMesh.position.set(lock.x, lock.y, lock.z);
      lockMesh.rotation.z = lock.rotZ;
      headGroup.add(lockMesh);
    });

    // Backward Snapback Cap Detail
    const capBackGeo = new THREE.SphereGeometry(0.36, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.45);
    const capBack = new THREE.Mesh(capBackGeo, capMat);
    capBack.rotation.x = -Math.PI / 1.6;
    capBack.position.set(0, 0.12, -0.08);
    headGroup.add(capBack);

    const brimGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.02, 24, 1, false, Math.PI * 0.7, Math.PI * 0.6);
    const brim = new THREE.Mesh(brimGeo, capMat);
    brim.position.set(0, 0.04, -0.22);
    brim.rotation.x = -0.18;
    headGroup.add(brim);

    // -------------------------------------------------------------------------
    // Expressive Eyes (Almond shape, violet iris, catchlights)
    // -------------------------------------------------------------------------
    eyesGroup = new THREE.Group();
    eyesGroup.position.set(0, 0.04, 0.32);

    [-0.11, 0.11].forEach((eyeX, idx) => {
      const eyeSub = new THREE.Group();
      eyeSub.position.set(eyeX, 0, 0);

      // Sclera
      const scleraGeo = new THREE.SphereGeometry(0.065, 16, 16);
      scleraGeo.scale(1.0, 0.95, 0.45);
      const scleraMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.15,
        metalness: 0.0
      });
      const sclera = new THREE.Mesh(scleraGeo, scleraMat);
      eyeSub.add(sclera);

      // Iris
      const irisGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.015, 16);
      const irisMat = new THREE.MeshStandardMaterial({
        color: 0x7c3aed,
        roughness: 0.2
      });
      const iris = new THREE.Mesh(irisGeo, irisMat);
      iris.rotation.x = Math.PI / 2;
      iris.position.z = 0.028;
      eyeSub.add(iris);

      // Pupil
      const pupilGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.02, 16);
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x06060a });
      const pupil = new THREE.Mesh(pupilGeo, pupilMat);
      pupil.rotation.x = Math.PI / 2;
      pupil.position.z = 0.033;
      eyeSub.add(pupil);

      // Catchlights
      const glintGeo = new THREE.SphereGeometry(0.011, 8, 8);
      const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const glint = new THREE.Mesh(glintGeo, glintMat);
      glint.position.set(0.015, 0.015, 0.042);
      eyeSub.add(glint);

      const glintSmallGeo = new THREE.SphereGeometry(0.006, 6, 6);
      const glintSmall = new THREE.Mesh(glintSmallGeo, glintMat);
      glintSmall.position.set(-0.010, -0.010, 0.042);
      eyeSub.add(glintSmall);

      // Eyebrow
      const browGeo = new THREE.BoxGeometry(0.10, 0.020, 0.025);
      const brow = new THREE.Mesh(browGeo, hairMat);
      brow.position.set(0, 0.095, 0.02);
      brow.rotation.z = (idx === 0 ? 0.06 : -0.06);
      eyeSub.add(brow);

      eyesGroup.add(eyeSub);
    });

    headGroup.add(eyesGroup);

    // -------------------------------------------------------------------------
    // Sleek Modern Developer Glasses (Thin dark wireframes + transparent lenses)
    // -------------------------------------------------------------------------
    glassesGroup = new THREE.Group();
    glassesGroup.position.set(0, 0.04, 0.35);

    [-0.11, 0.11].forEach(gx => {
      // Rounded Rim Wireframe
      const rimGeo = new THREE.TorusGeometry(0.088, 0.009, 8, 24);
      const rim = new THREE.Mesh(rimGeo, glassesFrameMat);
      rim.position.set(gx, 0, 0);
      glassesGroup.add(rim);

      // Subtle Glass Lens
      const lensGeo = new THREE.CircleGeometry(0.086, 20);
      const lens = new THREE.Mesh(lensGeo, glassesLensMat);
      lens.position.set(gx, 0, 0.002);
      glassesGroup.add(lens);
    });

    // Bridge between lenses
    const bridgeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.06, 8);
    const bridge = new THREE.Mesh(bridgeGeo, glassesFrameMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.01, 0.002);
    glassesGroup.add(bridge);

    headGroup.add(glassesGroup);

    // Pleasant Focused Developer Smile Line
    const smileCurveGeo = new THREE.TorusGeometry(0.06, 0.010, 8, 16, Math.PI * 0.6);
    const smileCurveMat = new THREE.MeshBasicMaterial({ color: 0x5a2323 });
    const smileMesh = new THREE.Mesh(smileCurveGeo, smileCurveMat);
    smileMesh.rotation.z = Math.PI * 1.2;
    smileMesh.position.set(0, -0.13, 0.33);
    headGroup.add(smileMesh);

    // -------------------------------------------------------------------------
    // Studio Over-Ear Headphones
    // -------------------------------------------------------------------------
    const phoneGroup = new THREE.Group();

    // Padded Headband
    const bandGeo = new THREE.TorusGeometry(0.38, 0.030, 16, 32, Math.PI);
    const bandMat = new THREE.MeshStandardMaterial({
      color: 0x121422,
      roughness: 0.5,
      metalness: 0.35
    });
    const headband = new THREE.Mesh(bandGeo, bandMat);
    headband.rotation.z = Math.PI;
    headband.position.y = 0.04;
    phoneGroup.add(headband);

    // Left & Right Earcups
    [-0.37, 0.37].forEach((hx, i) => {
      const cupGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.085, 24);
      const cup = new THREE.Mesh(cupGeo, bandMat);
      cup.rotation.z = Math.PI / 2;
      cup.position.set(hx, 0.03, 0.02);
      phoneGroup.add(cup);

      const glowRingGeo = new THREE.TorusGeometry(0.105, 0.016, 16, 32);
      const glowRing = new THREE.Mesh(glowRingGeo, violetAccentMat);
      glowRing.rotation.y = Math.PI / 2;
      glowRing.position.set(hx + (i === 0 ? -0.045 : 0.045), 0.03, 0.02);
      phoneGroup.add(glowRing);

      const cushionGeo = new THREE.TorusGeometry(0.11, 0.030, 16, 24);
      const cushionMat = new THREE.MeshStandardMaterial({
        color: 0x090a12,
        roughness: 0.85
      });
      const cushion = new THREE.Mesh(cushionGeo, cushionMat);
      cushion.rotation.y = Math.PI / 2;
      cushion.position.set(hx + (i === 0 ? 0.032 : -0.032), 0.03, 0.02);
      phoneGroup.add(cushion);
    });

    headGroup.add(phoneGroup);
    mascotRoot.add(headGroup);

    scene.add(mascotRoot);
  }

  function buildFloatingCompanion() {
    companionOrb = new THREE.Group();
    const isMobile = window.innerWidth < 1024;
    companionOrb.position.set(isMobile ? -1.0 : -2.5, 1.55, 0.6);

    // Iridescent Faceted Violet Crystal
    const crystalGeo = new THREE.IcosahedronGeometry(0.24, 0);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xa855f7,
      emissive: 0x6b21a8,
      emissiveIntensity: 0.45,
      roughness: 0.12,
      metalness: 0.35,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    companionOrb.add(crystalMesh);

    // Inner Glowing Core
    const coreGeo = new THREE.SphereGeometry(0.10, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xc084fc });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    companionOrb.add(coreMesh);

    // Orbiting Cyan Ring
    const ringGeo = new THREE.TorusGeometry(0.40, 0.012, 16, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85
    });
    companionRing = new THREE.Mesh(ringGeo, ringMat);
    companionRing.rotation.x = Math.PI / 3;
    companionOrb.add(companionRing);

    // Secondary subtle outer ring
    const ring2Geo = new THREE.TorusGeometry(0.48, 0.008, 16, 48);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.5
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 3;
    companionOrb.add(ring2);

    scene.add(companionOrb);
  }

  function buildAtmosphericDust() {
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = Math.random() * 8 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xa855f7,
      size: 0.045,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);
  }

  function onMouseMove(e) {
    if (prefersReducedMotion) return;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    targetMouseX = (e.clientX - windowHalfX) / windowHalfX;
    targetMouseY = (e.clientY - windowHalfY) / windowHalfY;
  }

  function onWindowResize() {
    if (!canvasContainer || !renderer || !camera) return;
    const width = canvasContainer.clientWidth;
    const height = canvasContainer.clientHeight;
    camera.aspect = width / height;
    updateCameraPosition();
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  function animate() {
    requestAnimationFrame(animate);

    if (!isVisible) return;

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (prefersReducedMotion) {
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
      return;
    }

    // 1. Organic Mouse Easing Lerp
    currentMouseX += (targetMouseX - currentMouseX) * 0.045;
    currentMouseY += (targetMouseY - currentMouseY) * 0.045;

    // 2. Mascot Gentle Idle Breathing
    if (mascotRoot) {
      const breath = Math.sin(elapsedTime * 1.8) * 0.015;
      mascotRoot.position.y = -0.38 + breath;
      mascotRoot.rotation.y = currentMouseX * 0.10;
    }

    // 3. Head & Eyes Track Cursor
    if (headGroup) {
      headGroup.rotation.y = currentMouseX * 0.38;
      headGroup.rotation.x = -currentMouseY * 0.20;
    }

    // 4. Natural Blinking Cycle
    blinkTimer += delta;
    if (blinkTimer > 3.8 && !isBlinking) {
      isBlinking = true;
      blinkTimer = 0;
    }

    if (isBlinking && eyesGroup) {
      eyesGroup.scale.y = 0.08;
      if (blinkTimer > 0.14) {
        eyesGroup.scale.y = 1.0;
        isBlinking = false;
        blinkTimer = 0;
      }
    }

    // 5. Laptop Screen Light Subtle Pulse
    if (screenLight) {
      screenLight.intensity = 0.8 + Math.sin(elapsedTime * 3.5) * 0.15;
    }

    // 6. Floating Companion Motion
    if (companionOrb) {
      companionOrb.position.y = 1.55 + Math.sin(elapsedTime * 1.5) * 0.08;
      companionOrb.rotation.x += 0.008;
      companionOrb.rotation.y += 0.012;

      if (companionRing) {
        companionRing.rotation.z += 0.022;
      }
    }

    // 7. Platform Ring Glow Pulse
    if (platformGlowRing) {
      const pulse = (Math.sin(elapsedTime * 2.2) + 1) * 0.5;
      platformGlowRing.material.opacity = 0.5 + pulse * 0.45;
    }

    // 8. Atmospheric Particles Slow Drift
    if (particlesMesh) {
      particlesMesh.rotation.y = elapsedTime * 0.018;
    }

    renderer.render(scene, camera);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroScene);
  } else {
    initHeroScene();
  }
})();
