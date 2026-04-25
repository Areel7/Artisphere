import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

const FBX_URL = "/TOE_Characters.fbx";

const THEME = {
  dark: {
    bg: 0x080b1a,
    grid1: 0x7c3aed,
    grid2: 0x4c1d95,
    gridOpacity: 0.55,
    ambientIntensity: 0.4,
    hemiSky: 0xc4b5fd,
    hemiGround: 0x1e1b4b,
    hemiIntensity: 0.6,
    dirIntensity: 0.9,
    fillIntensity: 0.35,
  },
  light: {
    bg: 0xf4f4f8,
    grid1: 0x8b5cf6,
    grid2: 0xc4b5fd,
    gridOpacity: 0.5,
    ambientIntensity: 0.6,
    hemiSky: 0xffffff,
    hemiGround: 0xaaaaaa,
    hemiIntensity: 0.8,
    dirIntensity: 1.0,
    fillIntensity: 0.5,
  },
};

const loadScript = (src, globalVar) =>
  new Promise((resolve, reject) => {
    if (globalVar && window[globalVar]) { resolve(); return; }
    let s = document.querySelector(`script[src="${src}"]`);
    if (s) {
      if (s.getAttribute("data-loaded") === "true" || (globalVar && window[globalVar])) {
        resolve();
      } else {
        s.addEventListener("load", resolve);
        s.addEventListener("error", reject);
      }
      return;
    }
    s = document.createElement("script");
    s.src = src;
    s.onload = () => { s.setAttribute("data-loaded", "true"); resolve(); };
    s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(s);
  });

const FBXViewer = () => {
  const mountRef = useRef(null);
  const frameIdRef = useRef(null);
  const sceneRef = useRef(null);
  const gridRef = useRef(null);
  const lightsRef = useRef({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const { theme } = useTheme();

  // Load three.js scripts once
  useEffect(() => {
    (async () => {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", "THREE");
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js");
        await loadScript("https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js", "fflate");
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/FBXLoader.js");
        setIsLoaded(true);
      } catch (err) {
        console.error("3D script load error:", err);
        setLoadError(err.message || "Could not load 3D engine scripts.");
      }
    })();
  }, []);

  // React to theme changes: update scene colors live
  useEffect(() => {
    const t = THEME[theme] || THEME.dark;
    const THREE = window.THREE;
    if (!THREE || !sceneRef.current) return;

    sceneRef.current.background = new THREE.Color(t.bg);

    if (gridRef.current) {
      gridRef.current.material.opacity = t.gridOpacity;
    }

    const { ambient, hemi, dir, fill } = lightsRef.current;
    if (ambient) ambient.intensity = t.ambientIntensity;
    if (hemi) {
      hemi.color.set(t.hemiSky);
      hemi.groundColor.set(t.hemiGround);
      hemi.intensity = t.hemiIntensity;
    }
    if (dir) dir.intensity = t.dirIntensity;
    if (fill) fill.intensity = t.fillIntensity;
  }, [theme]);

  // Build the 3D scene
  useEffect(() => {
    if (!isLoaded || !mountRef.current) return;

    const THREE = window.THREE;
    const mount = mountRef.current;
    const t = THEME[theme] || THEME.dark;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(t.bg);
    sceneRef.current = scene;

    const W = mount.clientWidth;
    const H = mount.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 5000);
    camera.position.set(0, 150, 300);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputEncoding = THREE.sRGBEncoding;
      mount.appendChild(renderer.domElement);
    } catch (err) {
      setLoadError("WebGL not supported on this device.");
      return;
    }

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // ── Floor plane ─────────────────────────────────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(2000, 2000);
    const floorMat = new THREE.MeshStandardMaterial({
      color: theme === "dark" ? 0x0d0f22 : 0xe8e8f0,
      roughness: 0.9,
      metalness: 0.0,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // ── Grid on floor ────────────────────────────────────────────────────────
    const grid = new THREE.GridHelper(1000, 50, t.grid1, t.grid2);
    grid.material.opacity = t.gridOpacity;
    grid.material.transparent = true;
    grid.position.y = 0.5;
    scene.add(grid);
    gridRef.current = grid;

    // ── Lights ───────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, t.ambientIntensity);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(t.hemiSky, t.hemiGround, t.hemiIntensity);
    hemi.position.set(0, 300, 0);
    scene.add(hemi);

    const dir = new THREE.DirectionalLight(0xffffff, t.dirIntensity);
    dir.position.set(200, 400, 200);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    dir.shadow.camera.near = 0.5;
    dir.shadow.camera.far = 1500;
    dir.shadow.camera.top = 400;
    dir.shadow.camera.bottom = -400;
    dir.shadow.camera.left = -400;
    dir.shadow.camera.right = 400;
    dir.shadow.bias = -0.0001;
    scene.add(dir);

    const fill = new THREE.DirectionalLight(0xd0c0ff, t.fillIntensity);
    fill.position.set(-200, 150, -200);
    scene.add(fill);

    // Rim light for dark mode pop
    const rim = new THREE.PointLight(0x7c3aed, theme === "dark" ? 0.6 : 0.0, 800);
    rim.position.set(0, 200, -300);
    scene.add(rim);

    lightsRef.current = { ambient, hemi, dir, fill };

    // ── Load FBX ─────────────────────────────────────────────────────────────
    const loader = new THREE.FBXLoader();
    let mixer;

    loader.load(
      FBX_URL,
      (object) => {
        if (object.animations?.length > 0) {
          mixer = new THREE.AnimationMixer(object);
          mixer.clipAction(object.animations[0]).play();
        }

        object.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            const fix = (mat) => {
              mat.side = THREE.DoubleSide;
              if (mat.isMeshStandardMaterial) {
                mat.metalness = 0.1;
                mat.roughness = 0.75;
                mat.envMapIntensity = 0.3;
              }
              if (mat.color?.getHex() === 0x000000 && !mat.map) {
                mat.color.setHex(0x999999);
              }
              if (mat.isMeshPhongMaterial) {
                mat.specular = new THREE.Color(0x222222);
              }
            };
            Array.isArray(child.material)
              ? child.material.forEach(fix)
              : fix(child.material);
          }
        });

        // Auto center + scale
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 150 / maxDim;
        object.scale.setScalar(scale);
        box.setFromObject(object);
        object.position.y = -box.min.y;

        const cy = size.y * scale * 0.5;
        camera.position.set(0, cy * 1.1, size.y * scale * 2.2);
        controls.target.set(0, cy, 0);
        controls.update();

        scene.add(object);
      },
      undefined,
      (err) => {
        console.error("FBX load error:", err);
        setLoadError("Failed to load 3D model. Make sure TOE_Characters.fbx is in the /public folder.");
      }
    );

    // ── Animate ──────────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ───────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      controls.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (mount?.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      sceneRef.current = null;
      gridRef.current = null;
      lightsRef.current = {};
    };
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDark = theme === "dark";

  return (
    <div
      className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border ${
        isDark
          ? "border-violet-900/40 bg-[#080b1a]"
          : "border-violet-200 bg-[#f4f4f8]"
      }`}
    >
      {/* Loading state */}
      {!isLoaded && !loadError && (
        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 ${isDark ? "bg-[#080b1a]" : "bg-[#f4f4f8]"}`}>
          <div className="w-12 h-12 rounded-full border-4 border-violet-900/30 border-t-violet-500 animate-spin" />
          <p className={`text-sm animate-pulse ${isDark ? "text-violet-300/60" : "text-violet-600/60"}`}>
            Loading 3D Engine...
          </p>
        </div>
      )}

      {/* Error state */}
      {loadError && (
        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-8 text-center ${isDark ? "bg-[#080b1a]" : "bg-[#f4f4f8]"}`}>
          <p className="text-red-400 text-sm">{loadError}</p>
          <p className={`text-xs ${isDark ? "text-white/30" : "text-zinc-400"}`}>
            Copy <code className="bg-violet-900/30 px-1 rounded">TOE_Characters.fbx</code> into the{" "}
            <code className="bg-violet-900/30 px-1 rounded">frontend/public/</code> folder and refresh.
          </p>
        </div>
      )}

      {/* Hint label */}
      {isLoaded && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs backdrop-blur-md border ${
            isDark
              ? "bg-black/50 border-violet-700/30 text-violet-300/70"
              : "bg-white/70 border-violet-300/40 text-violet-700/70"
          }`}>
            Drag to orbit · Scroll to zoom
          </div>
        </div>
      )}

      <div ref={mountRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
};

export default FBXViewer;
