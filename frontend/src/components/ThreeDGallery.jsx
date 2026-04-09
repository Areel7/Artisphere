import React, { useState, useEffect, useRef } from 'react';
import { MousePointer2 } from 'lucide-react';

// ─── load a <script> tag exactly once ───────────────────────────────────────
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

// ─── COMPONENT ───────────────────────────────────────────────────────────────
const ThreeDGallery = ({ artworks = [], onSelect }) => {
  const mountRef   = useRef(null);
  const frameIdRef = useRef(null);
  const starsRef   = useRef(null);
  const [isLoaded,  setIsLoaded]  = useState(false);
  const [loadError, setLoadError] = useState('');
  const [hovered,   setHovered]   = useState(false);

  // ── 1. Load Three.js CDN scripts once ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js');
        setIsLoaded(true);
      } catch {
        setLoadError('Could not load 3D engine. Please check your connection.');
      }
    })();
  }, []);

  // ── 2. Build the scene ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !mountRef.current || artworks.length === 0) return;

    const THREE = window.THREE;
    const mount = mountRef.current;
    const W     = mount.clientWidth;
    const H     = mount.clientHeight;

    // ── Scene — deep space dark ───────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03030d);
    scene.fog = new THREE.FogExp2(0x03030d, 0.045);

    // ── Camera ────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 300);
    camera.position.set(0, 3, 13);
    camera.lookAt(0, 1.5, 0);

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    // ── Orbit Controls ────────────────────────────────────────────────────────
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping   = true;
    controls.dampingFactor   = 0.06;
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 0.35;
    controls.maxDistance     = 22;
    controls.minDistance     = 4;
    controls.maxPolarAngle   = Math.PI * 0.72;
    controls.minPolarAngle   = Math.PI * 0.12;
    controls.target.set(0, 1.5, 0);
    controls.update();

    // ── Galaxy starfield ──────────────────────────────────────────────────────
    const STAR_COUNT = 5000;
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starColors    = new Float32Array(STAR_COUNT * 3);

    for (let i = 0; i < STAR_COUNT; i++) {
      // Place stars in a large sphere around the scene
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 60 + Math.random() * 100;

      starPositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      // Slightly varied star colours — white, blue-white, warm white
      const tint = Math.random();
      if (tint < 0.15) {
        // Blue-white stars
        starColors[i * 3]     = 0.7;
        starColors[i * 3 + 1] = 0.85;
        starColors[i * 3 + 2] = 1.0;
      } else if (tint < 0.3) {
        // Warm amber stars
        starColors[i * 3]     = 1.0;
        starColors[i * 3 + 1] = 0.9;
        starColors[i * 3 + 2] = 0.65;
      } else if (tint < 0.4) {
        // Violet stars (nebula hint)
        starColors[i * 3]     = 0.85;
        starColors[i * 3 + 1] = 0.65;
        starColors[i * 3 + 2] = 1.0;
      } else {
        // Pure white
        starColors[i * 3]     = 1.0;
        starColors[i * 3 + 1] = 1.0;
        starColors[i * 3 + 2] = 1.0;
      }
    }

    const starsGeo = new THREE.BufferGeometry();
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starsGeo.setAttribute('color',    new THREE.BufferAttribute(starColors, 3));

    const starsMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
    });

    const stars = new THREE.Points(starsGeo, starsMat);
    scene.add(stars);
    starsRef.current = stars;

    // ── Nebula accent clouds (large semi-transparent billboards) ──────────────
    const makeNebula = (color, x, y, z, scale) => {
      const geo = new THREE.PlaneGeometry(scale, scale);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.04,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.lookAt(camera.position);
      return mesh;
    };
    scene.add(makeNebula(0x6030c0, -30, 20, -50, 80));
    scene.add(makeNebula(0x1040b0, 40, -10, -60, 70));
    scene.add(makeNebula(0x8010a0, 0, 30, -70, 90));

    // ── Lighting — warm chandelier + neutral fills (NO emissive = no blinking) ─
    scene.add(new THREE.AmbientLight(0xfff0f5, 0.5));

    const chandelier = new THREE.PointLight(0xfff0e8, 1.5, 55);
    chandelier.position.set(0, 10, 0);
    chandelier.castShadow = true;
    chandelier.shadow.mapSize.set(512, 512);
    scene.add(chandelier);

    // 4 equidistant fill lights at gallery perimeter
    [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((a) => {
      const fl = new THREE.PointLight(0xfff5f0, 0.45, 28);
      fl.position.set(Math.cos(a) * 9, 6, Math.sin(a) * 9);
      scene.add(fl);
    });

    // Soft cool under-rim
    const rim = new THREE.PointLight(0xd0e8ff, 0.25, 22);
    rim.position.set(0, -3, 0);
    scene.add(rim);

    // ── Floor — reflective dark surface ───────────────────────────────────────
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0d0d18,
      roughness: 0.12,
      metalness: 0.65,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(60, 60, 0x1a1a2e, 0x12121f);
    grid.position.y = 0.003;
    scene.add(grid);

    // ── Artwork frames in a circle ────────────────────────────────────────────
    const RADIUS    = 7;
    const FRAME_H   = 2.4;
    const FRAME_W   = 3.4;
    const DEPTH     = 0.12;
    const BORDER    = 0.2;
    const FRAME_COL = 0x1a1008; // dark walnut
    const MOUNT_COL = 0x0a0a14; // deep mount board

    const group        = new THREE.Group();
    const clickTargets = [];
    scene.add(group);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';

    artworks.forEach((art, index) => {
      const angle = (index / artworks.length) * Math.PI * 2;
      const x     = Math.cos(angle) * RADIUS;
      const z     = Math.sin(angle) * RADIUS;
      const yPos  = FRAME_H / 2 + 0.4;

      // Outer walnut frame
      const outerGeo = new THREE.BoxGeometry(FRAME_W + BORDER * 2, FRAME_H + BORDER * 2, 0.15);
      const outerMat = new THREE.MeshStandardMaterial({ color: FRAME_COL, roughness: 0.88, metalness: 0.08 });
      const outerMesh = new THREE.Mesh(outerGeo, outerMat);

      // Dark mount board
      const mountGeo = new THREE.BoxGeometry(FRAME_W, FRAME_H, 0.17);
      const mountMat = new THREE.MeshStandardMaterial({ color: MOUNT_COL, roughness: 0.95 });
      const mountMesh = new THREE.Mesh(mountGeo, mountMat);

      // Artwork canvas placeholder
      const canvasGeo = new THREE.BoxGeometry(FRAME_W - 0.12, FRAME_H - 0.12, 0.19);
      const placemat  = new THREE.MeshStandardMaterial({ color: 0x1e1e2e, roughness: 0.85 });
      const canvasMesh = new THREE.Mesh(canvasGeo, placemat);
      canvasMesh.userData = { art };
      clickTargets.push(canvasMesh);

      const frameGroup = new THREE.Group();
      frameGroup.add(outerMesh, mountMesh, canvasMesh);
      frameGroup.position.set(x, yPos, z);
      frameGroup.lookAt(0, yPos, 0);
      group.add(frameGroup);

      // Load artwork texture
      const imageUrl = art.image
        ? (art.image.startsWith('http') ? art.image : `${import.meta.env.VITE_BASE_URL}${art.image}`)
        : null;

      if (imageUrl) {
        textureLoader.load(imageUrl, (tex) => {
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

          const aspect = tex.image.width / tex.image.height;
          const maxW   = FRAME_W - 0.12;
          const maxH   = FRAME_H - 0.12;
          let fw = maxW;
          let fh = maxW / aspect;
          if (fh > maxH) { fh = maxH; fw = maxH * aspect; }

          canvasMesh.geometry.dispose();
          canvasMesh.geometry = new THREE.BoxGeometry(fw, fh, 0.19);

          const edgeMat = new THREE.MeshStandardMaterial({ color: 0x08080e, roughness: 0.9 });
          const faceMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.28, metalness: 0.03 });
          canvasMesh.material = [edgeMat, edgeMat, edgeMat, edgeMat, faceMat, faceMat];

          mountMesh.geometry.dispose();
          mountMesh.geometry = new THREE.BoxGeometry(fw + 0.1, fh + 0.1, 0.17);

          outerMesh.geometry.dispose();
          outerMesh.geometry = new THREE.BoxGeometry(fw + BORDER * 2 + 0.1, fh + BORDER * 2 + 0.1, 0.15);
        });
      }

      // Warm ceiling spotlight per frame (capped at 6 for WebGL budget)
      if (index < 6) {
        const spot = new THREE.SpotLight(0xfff0d8, 1.1, 18, Math.PI / 7, 0.45, 1.4);
        spot.position.set(x * 0.6, 9, z * 0.6);
        spot.target.position.set(x, yPos, z);
        scene.add(spot, spot.target);
      }
    });

    // ── Raycaster ─────────────────────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      renderer.domElement.style.cursor =
        raycaster.intersectObjects(clickTargets).length > 0 ? 'pointer' : 'grab';
    };

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickTargets);
      if (hits.length > 0 && hits[0].object.userData?.art) {
        onSelect(hits[0].object.userData.art);
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    // ── Render loop ───────────────────────────────────────────────────────────
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      // Slowly rotate the entire starfield for a living-galaxy feel
      if (starsRef.current) starsRef.current.rotation.y += 0.00008;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('click', onClick);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [isLoaded, artworks]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
      {/* Loading */}
      {!isLoaded && !loadError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#03030d]">
          <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-violet-500 animate-spin" />
          <p className="text-zinc-500 text-sm tracking-wide animate-pulse">
            Preparing galaxy gallery…
          </p>
        </div>
      )}

      {/* Error */}
      {loadError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#03030d]">
          <p className="text-red-400 text-sm">{loadError}</p>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={mountRef}
        className="w-full h-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {/* HUD hint */}
      {isLoaded && (
        <div
          className={`absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-500 ${
            hovered ? 'opacity-100' : 'opacity-50'
          }`}
        >
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-violet-500/20 text-xs text-zinc-400 whitespace-nowrap">
            <MousePointer2 size={12} className="text-violet-400 shrink-0" />
            Click an artwork · Drag to orbit · Scroll to zoom
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDGallery;
