(() => {
  // ===== Lucide =====
  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // ===== Mobile Menu =====
  function initMobileMenu() {
    const menuBtn = document.getElementById("menu-btn");
    const closeBtn = document.getElementById("close-menu");
    const mobileMenu = document.getElementById("mobile-menu");
    if (!menuBtn || !closeBtn || !mobileMenu) return;

    menuBtn.addEventListener("click", () => mobileMenu.classList.remove("translate-x-full"));
    closeBtn.addEventListener("click", () => mobileMenu.classList.add("translate-x-full"));

    // Close after tapping a link
    document.querySelectorAll(".mobile-link").forEach((a) => {
      a.addEventListener("click", () => mobileMenu.classList.add("translate-x-full"));
    });
  }

  // ===== Cursor (optional) =====
  function initCursor() {
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorOutline = document.querySelector(".cursor-outline");
    if (!cursorDot || !cursorOutline) return;

    window.addEventListener("mousemove", (e) => {
      const x = e.clientX;
      const y = e.clientY;
      cursorDot.style.left = `${x}px`;
      cursorDot.style.top = `${y}px`;
      cursorOutline.animate({ left: `${x}px`, top: `${y}px` }, { duration: 500, fill: "forwards" });
    }, { passive: true });

    document.querySelectorAll("a, button, input, select, textarea, .device-clickable").forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("hover-expand"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("hover-expand"));
    });
  }

  // ===== Spotlight (optional, if you use it) =====
  window.handleSpotlight = function (e, element) {
    const rect = element.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    element.style.setProperty("--mouse-x", `${x}%`);
    element.style.setProperty("--mouse-y", `${y}%`);
  };
  window.clearSpotlight = function (element) {
    element.style.setProperty("--mouse-x", "50%");
    element.style.setProperty("--mouse-y", "50%");
  };

  // ============================================================
  // ======================= BRAND 3D ============================
  // ============================================================

  function shouldRun3D() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    // Run only on desktop-like devices, no reduced motion
    return !prefersReducedMotion && canHover && finePointer;
  }

  function loadThree(callback) {
    if (window.THREE) return callback();
    const s = document.createElement("script");
    s.src = "https://unpkg.com/three@0.160.0/build/three.min.js";
    s.async = true;
    s.onload = () => callback();
    document.head.appendChild(s);
  }

  // Create an “L” monogram shape using 2 rectangles (no fonts needed).
  function createLShape(THREE) {
    const shape = new THREE.Shape();

    // Big outer L (simple monogram)
    // vertical bar
    shape.moveTo(-1.0, -1.4);
    shape.lineTo(-0.35, -1.4);
    shape.lineTo(-0.35,  1.4);
    shape.lineTo(-1.0,   1.4);
    shape.lineTo(-1.0,  -1.4);

    // bottom bar
    shape.moveTo(-1.0, -1.4);
    shape.lineTo( 1.2, -1.4);
    shape.lineTo( 1.2, -0.8);
    shape.lineTo(-1.0, -0.8);
    shape.lineTo(-1.0, -1.4);

    return shape;
  }

  function initThreeScene(mount, type) {
    if (!mount || !window.THREE) return;
    const THREE = window.THREE;

    const canvas = document.createElement("canvas");
    mount.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 8);

    // Lights tuned for “premium”
    const key = new THREE.DirectionalLight(0x10b981, 1.25);
    key.position.set(3.5, 2.5, 4.5);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xffffff, 0.55);
    rim.position.set(-4, 1, 3);
    scene.add(rim);

    const ambient = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambient);

    // Group for parallax
    const group = new THREE.Group();
    scene.add(group);

    let mainObj = null;

    if (type === "monogram") {
      const Lshape = createLShape(THREE);

      const geo = new THREE.ExtrudeGeometry(Lshape, {
        depth: 0.6,
        bevelEnabled: true,
        bevelThickness: 0.08,
        bevelSize: 0.06,
        bevelSegments: 6,
        steps: 1,
      });
      geo.center();

      const mat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.85,
        roughness: 0.22,
        emissive: 0x022c22,
        emissiveIntensity: 0.85,
      });

      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);

      // Wireframe sheen overlay
      const wire = new THREE.LineSegments(
        new THREE.WireframeGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.10 })
      );
      mesh.add(wire);

      // Halo ring behind it
      const ringGeo = new THREE.TorusGeometry(2.2, 0.06, 16, 220);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.35,
        transparent: true,
        opacity: 0.14,
        emissive: 0x10b981,
        emissiveIntensity: 0.25,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.2;
      ring.position.z = -1.1;
      group.add(ring);

      mainObj = mesh;
    }

    if (type === "devices") {
      // Laptop base
      const baseGeo = new THREE.BoxGeometry(4.2, 0.22, 2.8);
      const screenGeo = new THREE.BoxGeometry(3.7, 2.3, 0.12);
      const phoneGeo = new THREE.BoxGeometry(1.2, 2.4, 0.18);

      const shellMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.65,
        roughness: 0.30,
        emissive: 0x000000,
        emissiveIntensity: 0.25,
      });

      const glowMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        metalness: 0.8,
        roughness: 0.25,
        emissive: 0x10b981,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 0.18,
      });

      const laptopBase = new THREE.Mesh(baseGeo, shellMat);
      laptopBase.position.set(0, -1.55, 0);
      laptopBase.rotation.x = 0.06;
      group.add(laptopBase);

      const laptopScreen = new THREE.Mesh(screenGeo, shellMat);
      laptopScreen.position.set(0, 0.10, -1.05);
      laptopScreen.rotation.x = -0.12;
      group.add(laptopScreen);

      // Screen glow “UI”
      const ui = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2.1), glowMat);
      ui.position.set(0, 0.10, -0.98);
      ui.rotation.x = -0.12;
      group.add(ui);

      // Phone
      const phone = new THREE.Mesh(phoneGeo, shellMat);
      phone.position.set(2.15, -0.55, 0.65);
      phone.rotation.y = -0.4;
      phone.rotation.x = 0.10;
      group.add(phone);

      const phoneUI = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 2.2), glowMat);
      phoneUI.position.set(2.15, -0.55, 0.75);
      phoneUI.rotation.y = -0.4;
      phoneUI.rotation.x = 0.10;
      group.add(phoneUI);

      // small floating “cards”
      const cardGeo = new THREE.BoxGeometry(1.25, 0.75, 0.08);
      for (let i = 0; i < 3; i++) {
        const c = new THREE.Mesh(cardGeo, shellMat);
        c.position.set(-2.1 + i * 1.1, 1.45 - i * 0.35, -0.2 - i * 0.35);
        c.rotation.y = 0.45;
        group.add(c);

        const cg = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.62), glowMat);
        cg.position.set(c.position.x, c.position.y, c.position.z + 0.06);
        cg.rotation.y = 0.45;
        group.add(cg);
      }

      mainObj = group;
    }

    function resize() {
      const r = mount.getBoundingClientRect();
      const w = Math.max(320, r.width);
      const h = Math.max(320, r.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // pause when off-screen
    let running = true;
    const io = new IntersectionObserver(
      (entries) => (running = entries[0]?.isIntersecting ?? true),
      { threshold: 0.08 }
    );
    io.observe(mount);

    // mouse parallax
    let mx = 0, my = 0;
    window.addEventListener(
      "mousemove",
      (e) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 0.9;
        my = (e.clientY / window.innerHeight - 0.5) * 0.9;
      },
      { passive: true }
    );

    // animate
    let t = 0;
    function tick() {
      requestAnimationFrame(tick);
      if (!running) return;

      t += 0.01;

      group.rotation.y = t * 0.55 + mx * 0.35;
      group.rotation.x = t * 0.25 + my * 0.22;
      group.position.y = Math.sin(t) * 0.08;

      // subtle breathing
      if (mainObj && type === "monogram") {
        mainObj.rotation.z = Math.sin(t * 0.6) * 0.06;
      }

      renderer.render(scene, camera);
    }
    tick();
  }

  function initBrand3D() {
    if (!shouldRun3D()) return;

    const mounts = Array.from(document.querySelectorAll("[data-three]"));
    if (!mounts.length) return;

    loadThree(() => {
      mounts.forEach((m) => initThreeScene(m, m.getAttribute("data-three")));
    });
  }

  // ===== DOM Ready =====
  document.addEventListener("DOMContentLoaded", () => {
    initIcons();
    initMobileMenu();
    initCursor();
    initBrand3D();
  });
})();
