import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, ZoomIn, X, BookOpen } from 'lucide-react';
import ParticleBackground from './ParticleBackground';

const ThreeDModal = ({ imageSrc, onClose, title, artistName, story }) => {
  const [showStory, setShowStory] = useState(false);
  const mountRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [autoRotate, setAutoRotate] = useState(true);
  const [headerHeight, setHeaderHeight] = useState(73);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const meshRef = useRef(null);
  const controlsRef = useRef(null);
  const frameIdRef = useRef(null);

  // Measure header height dynamically
  useEffect(() => {
    setShowStory(true);
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Initial measurement after the browser layout is ready
    const updateHeight = () => {
      const height = nav.getBoundingClientRect().height;
      if (height > 0) setHeaderHeight(height);
    };

    requestAnimationFrame(updateHeight);

    const observer = new ResizeObserver(updateHeight);
    observer.observe(nav);
    
    return () => observer.disconnect();
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });

  useEffect(() => {
    const init = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js');
        setIsLoaded(true);
      } catch {
        setErrorMsg("3D engine load karne mein masla aa gaya.");
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mountRef.current) return;

    const mountNode = mountRef.current;
    const THREE = window.THREE;
    const width = mountNode.clientWidth;
    const height = mountNode.clientHeight;

    let renderer, controls, geometry, material;

    try {
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 0, 8);
      cameraRef.current = camera;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mountNode.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 3;
      controls.maxDistance = 15;
      controls.maxPolarAngle = Math.PI * 0.82;
      controls.minPolarAngle = Math.PI * 0.18;
      controlsRef.current = controls;

      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(5, 5, 5);
      scene.add(dirLight);
      const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
      backLight.position.set(-5, -5, -5);
      scene.add(backLight);

      geometry = new THREE.BoxGeometry(1, 1, 0.1);
      material = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      meshRef.current = mesh;

      const animate = () => {
        frameIdRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!mountNode) return;
        const w = mountNode.clientWidth;
        const h = mountNode.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
        if (controls) controls.dispose();
        if (geometry) geometry.dispose();
        if (material) material.dispose();
        if (renderer) {
          // Force-lose context first to immediately free the WebGL slot (prevents HMR "too many contexts" crash)
          try { renderer.forceContextLoss(); } catch (_) {}
          renderer.dispose();
          if (renderer.domElement?.parentNode === mountNode) {
            mountNode.removeChild(renderer.domElement);
          }
        }
      };
    } catch (err) {
      console.error("WebGL init error:", err);
      setErrorMsg("WebGL unavailable. Please do a full page refresh (Ctrl+Shift+R).");
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !meshRef.current || !imageSrc) return;
    const THREE = window.THREE;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "Anonymous";
    loader.load(imageSrc, (texture) => {
      texture.anisotropy = rendererRef.current.capabilities.getMaxAnisotropy();
      const { width: iw, height: ih } = texture.image;
      const aspect = iw / ih;
      const maxW = 6;
      const w = aspect > 1 ? maxW : maxW * aspect;
      const h = aspect > 1 ? maxW / aspect : maxW;
      meshRef.current.geometry.dispose();
      meshRef.current.geometry = new THREE.BoxGeometry(w, h, 0.15);
      const edge = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 });
      const face = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.2, metalness: 0.1 });
      if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach(m => m.dispose());
      } else {
        meshRef.current.material.dispose();
      }
      meshRef.current.material = [edge, edge, edge, edge, face, face];
      meshRef.current.rotation.set(0, 0, 0);
    }, undefined, () => setErrorMsg("Error loading image."));
  }, [imageSrc, isLoaded]);

  useEffect(() => {
    let id;
    const rotate = () => {
      if (autoRotate && meshRef.current) {
        meshRef.current.rotation.y += 0.003;
        meshRef.current.rotation.x = Math.sin(Date.now() * 0.0005) * 0.05;
      }
      id = requestAnimationFrame(rotate);
    };
    rotate();
    return () => cancelAnimationFrame(id);
  }, [autoRotate]);

  const resetView = () => {
    if (controlsRef.current && cameraRef.current && meshRef.current) {
      controlsRef.current.reset();
      cameraRef.current.position.set(0, 0, 8);
      meshRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <>
      <ParticleBackground />
      <div
        className="fixed left-0 right-0 bottom-0 z-40 flex flex-col"
        style={{ top: `${headerHeight}px`, background: 'radial-gradient(ellipse at 50% 0%, #0f0618 0%, #09090b 60%)' }}
      >
        {/* ── Floating Top HUD ─────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-white/5"
          style={{ background: 'linear-gradient(to bottom, rgba(9,9,11,0.95), rgba(9,9,11,0.6))', backdropFilter: 'blur(20px)' }}
        >
          {/* Left — artwork meta */}
          <div className="min-w-0 flex-1 pr-6">
            {title ? (
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400 mb-0.5">Now Viewing</span>
                <p className="text-base font-bold text-white truncate leading-tight">{title}</p>
                {artistName && (
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    <span className="text-zinc-600">by </span>
                    <span className="text-zinc-400 font-medium">{artistName}</span>
                  </p>
                )}
              </div>
            ) : (
              <span className="text-sm text-zinc-400 font-medium tracking-widest uppercase">3D Viewer</span>
            )}
          </div>

          {/* Centre — controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Story toggle */}
            <button
              id="story-toggle-btn"
              onClick={() => setShowStory(!showStory)}
              title="Artist Story"
              className={`group relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 border ${
                showStory
                  ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <BookOpen size={13} />
              <span>Story</span>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-white/10" />

            {/* Auto‑rotate */}
            <button
              id="auto-rotate-btn"
              onClick={() => setAutoRotate(!autoRotate)}
              title={autoRotate ? 'Pause rotation' : 'Start rotation'}
              className={`p-2.5 rounded-full transition-all duration-300 border ${
                autoRotate
                  ? 'bg-white/10 border-white/15 text-white shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                  : 'bg-transparent border-white/5 text-zinc-600 hover:bg-white/8 hover:text-zinc-300'
              }`}
            >
              <RotateCw size={14} className={autoRotate ? 'animate-spin' : ''} />
            </button>

            {/* Reset */}
            <button
              id="reset-view-btn"
              onClick={resetView}
              title="Reset camera"
              className="p-2.5 rounded-full bg-transparent border border-white/5 text-zinc-600 hover:bg-white/8 hover:text-zinc-300 transition-all duration-300"
            >
              <ZoomIn size={14} />
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-white/10" />

            {/* Exit */}
            <button
              id="exit-3d-btn"
              onClick={onClose}
              title="Exit 3D viewer"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-transparent border border-white/10 text-zinc-500 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400 transition-all duration-300"
            >
              <X size={13} />
              <span>Exit</span>
            </button>
          </div>
        </div>

        {/* ── 3D Viewport ─────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden">

          {/* Ambient corner glows */}
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute top-0 left-1/4 w-96 h-48 bg-violet-900/10 blur-[80px] rounded-full" />
            <div className="absolute bottom-0 right-1/4 w-96 h-48 bg-indigo-900/10 blur-[80px] rounded-full" />
          </div>

          {/* Loading state */}
          {!isLoaded && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-t-violet-400 border-violet-500/20 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-white/80 text-sm font-medium">Loading 3D Engine</p>
                <p className="text-zinc-600 text-xs mt-1">Preparing your experience…</p>
              </div>
            </div>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-red-950/80 border border-red-500/30 backdrop-blur-md text-red-300 px-5 py-3 rounded-2xl text-sm shadow-xl">
              <X size={15} className="text-red-400 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Three.js canvas mount */}
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing relative z-10" />

          {/* Floating bottom hint */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="flex items-center gap-4 px-5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/5 text-[11px] text-zinc-500 tracking-widest uppercase">
              <span>⟵ Drag to rotate</span>
              <span className="w-px h-3 bg-white/10" />
              <span>Scroll to zoom</span>
            </div>
          </div>

          {/* Story slide-in panel */}
          <div
            className={`absolute top-0 right-0 bottom-0 z-30 w-80 xl:w-[22rem] flex flex-col overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              showStory ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{ background: 'linear-gradient(135deg, rgba(15,6,24,0.97) 0%, rgba(9,9,11,0.98) 100%)', borderLeft: '1px solid rgba(139,92,246,0.2)', boxShadow: '-20px 0 60px rgba(0,0,0,0.6)' }}
          >
            {/* Panel header */}
            <div className="relative px-6 pt-6 pb-5 shrink-0"
              style={{ borderBottom: '1px solid rgba(139,92,246,0.15)', background: 'linear-gradient(to bottom, rgba(139,92,246,0.08), transparent)' }}
            >
              {/* Decorative line */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                    <BookOpen size={11} className="text-violet-400" />
                  </div>
                  <span className="text-[15px] font-black uppercase tracking-[0.25em] text-violet-400">Artist's Story</span>
                </div>
                <button
                  onClick={() => setShowStory(false)}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-600 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X size={13} />
                </button>
              </div>

              {title && (
                <h2 className="text-white font-bold text-base leading-snug line-clamp-2">{title}</h2>
              )}
              {artistName && (
                <p className="mt-1 text-xs text-zinc-500">
                  <span className="inline-block w-3 h-px bg-zinc-700 mr-2 align-middle" />
                  {artistName}
                </p>
              )}
            </div>

            {/* Scroll indicator decoration */}
            <div className="flex items-center gap-3 px-6 py-3 shrink-0">
              <div className="flex-1 h-px bg-gradient-to-r from-violet-500/20 to-transparent" />
              <span className="text-[9px] uppercase tracking-widest text-zinc-700">Scroll to read</span>
              <div className="flex-1 h-px bg-gradient-to-l from-violet-500/20 to-transparent" />
            </div>

            {/* Story text */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.2) transparent' }}
            >
              {story ? (
                story.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-zinc-400 text-sm leading-7 relative italic">
                    {i === 0 && (
                      <span className="float-left text-4xl font-black text-violet-500/40 leading-none mr-2 mt-1 font-serif">
                        {paragraph.charAt(0)}
                      </span>
                    )}
                    {i === 0 ? paragraph.slice(1) : paragraph}
                  </p>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
                    <BookOpen size={20} className="text-zinc-700" />
                  </div>
                  <p className="text-zinc-600 text-xs">No story written yet.</p>
                </div>
              )}
            </div>

            {/* Bottom fade */}
            <div className="h-8 shrink-0 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ThreeDModal;

