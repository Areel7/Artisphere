import React, { useState, useEffect, useRef } from 'react';
import { RotateCw, ZoomIn, X } from 'lucide-react';
import ParticleBackground from './ParticleBackground';

const ThreeDModal = ({ imageSrc, onClose, title, artistName }) => {
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
    
    // Capture the ref value so the cleanup function has a stable reference
    const mountNode = mountRef.current;
    
    const THREE = window.THREE;
    const width = mountNode.clientWidth;
    const height = mountNode.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountNode.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 15;               // prevents zooming out too far
    controls.maxPolarAngle = Math.PI * 0.82; // prevents flipping under nav
    controls.minPolarAngle = Math.PI * 0.18;
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    const geometry = new THREE.BoxGeometry(1, 1, 0.1);
    const material = new THREE.MeshStandardMaterial({ color: 0x333333 });
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
      if (mountNode && renderer.domElement && renderer.domElement.parentNode === mountNode) {
        mountNode.removeChild(renderer.domElement);
      }
      controls.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
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
    <ParticleBackground/>
    <div
      className="fixed left-0 right-0 bottom-0 z-40 flex flex-col bg-zinc-950 backdrop-blur-md"
      style={{ top: `${headerHeight}px` }}
    >
      {/* Control bar — sits right below the nav */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 shrink-0">
      
        
        <div className="min-w-0 flex-1 pr-4">
          {title ? (
            <>
              <p className="text-sm font-semibold text-white truncate">{title}</p>
              {artistName ? (
                <p className="text-xs text-neutral-500 truncate">by {artistName}</p>
              ) : null}
            </>
          ) : (
            <span className="text-sm text-neutral-400 font-medium tracking-wide">
              3D Viewer
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              autoRotate
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <RotateCw size={15} className={autoRotate ? 'animate-spin' : ''} />
            Auto Rotate
          </button>

          <button
            onClick={resetView}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-all text-sm font-medium"
          >
            <ZoomIn size={15} />
            Reset View
          </button>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-sm font-medium shrink-0"
        >
          <X size={16} />
          Exit
        </button>
      </div>

      {/* 3D Viewport */}
      <div className="flex-1 relative overflow-hidden">
        {!isLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-neutral-700 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-white text-sm">3D Engine Loading...</p>
          </div>
        )}
        {errorMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
            {errorMsg}
          </div>
        )}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>

      {/* Bottom hint */}
      <div className="shrink-0 py-2 text-center text-neutral-500 text-xs bg-neutral-900/60 border-t border-neutral-800">
        Drag to rotate &nbsp;·&nbsp; Scroll to zoom
      </div>
    </div>
    </>
  );
};

export default ThreeDModal;
