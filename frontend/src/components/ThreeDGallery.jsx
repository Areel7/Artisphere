import React, { useState, useEffect, useRef } from "react";
import { MousePointer2 } from "lucide-react";

/** @typedef {"cosmos" | "interior"} GalleryVariant */

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

/**
 * Layout slots for hanging art on room walls (meters, Y-up).
 * @param {unknown[]} artworks
 * @param {{ W: number; D: number; H: number }} ROOM
 */
function layoutArtworksInRoom(artworks, ROOM) {
  const slots = [];
  const n = artworks.length;
  if (n === 0) return slots;

  const hw = ROOM.W / 2;
  const hd = ROOM.D / 2;
  const hangY = ROOM.H * 0.48;

  const backCount = Math.min(n, Math.max(1, Math.min(6, Math.ceil(n * 0.55))));
  const spacing = Math.min(2.35, (ROOM.W - 1.4) / Math.max(backCount, 1));
  const rowW = spacing * (backCount - 1);
  for (let i = 0; i < backCount; i++) {
    const x = -rowW / 2 + i * spacing;
    const z = -hd + 0.14;
    slots.push({
      art: artworks[i],
      x,
      y: hangY,
      z,
      rotY: 0,
    });
  }

  let idx = backCount;
  const leftSlots = Math.ceil((n - idx) / 2);
  for (let j = 0; j < leftSlots && idx < n; j++, idx++) {
    const t = leftSlots <= 1 ? 0.5 : j / (leftSlots - 1 || 1);
    const z = -hd * 0.85 + t * (ROOM.D * 0.75);
    slots.push({
      art: artworks[idx],
      x: -hw + 0.14,
      y: hangY,
      z,
      rotY: Math.PI / 2,
    });
  }

  for (let j = 0; idx < n; j++, idx++) {
    const remaining = n - idx;
    const t = remaining <= 1 ? 0.5 : j / Math.max(remaining - 1, 1);
    const z = -hd * 0.85 + t * (ROOM.D * 0.75);
    slots.push({
      art: artworks[idx],
      x: hw - 0.14,
      y: hangY,
      z,
      rotY: -Math.PI / 2,
    });
  }

  return slots;
}

/**
 * @param {object} props
 * @param {unknown[]} props.artworks
 * @param {(art: unknown) => void} props.onSelect
 * @param {GalleryVariant} [props.variant]
 */
const ThreeDGallery = ({ artworks = [], onSelect, variant = "cosmos" }) => {
  const mountRef = useRef(null);
  const frameIdRef = useRef(null);
  const starsRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [hovered, setHovered] = useState(false);

  onSelectRef.current = onSelect;

  useEffect(() => {
    (async () => {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js",
        );
        setIsLoaded(true);
      } catch {
        setLoadError("Could not load 3D engine. Please check your connection.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mountRef.current || artworks.length === 0) return;

    const THREE = window.THREE;
    const mount = mountRef.current;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, W / H, 0.08, 120);
    
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        powerPreference: "high-performance" 
      });
    } catch (err) {
      console.error("WebGL Context Error:", err);
      setLoadError("WebGL context limit reached or unsupported hardware. Please refresh the page.");
      return;
    }
    
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = variant === "interior" ? 1.05 : 1.0;
    mount.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;

    const clickTargets = [];
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = "anonymous";
    let interiorBounds = null;
    let introProgress = 0;
    let introFrom = null;
    let introTo = null;
    let introTarget = null;
    let dustCloud = null;

    const FRAME_COL = 0x2a1810;
    const MOUNT_COL = 0x0f0e0c;
    const BORDER = 0.14;

    const applyArtTexture = (
      art,
      canvasMesh,
      mountMesh,
      outerMesh,
      FRAME_W,
      FRAME_H,
    ) => {
      const imageUrl = art.image
        ? art.image.startsWith("http")
          ? art.image
          : `${import.meta.env.VITE_BASE_URL}${art.image}`
        : null;

      if (!imageUrl) return;

      textureLoader.load(imageUrl, (tex) => {
        tex.encoding = THREE.sRGBEncoding;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

        const aspect = tex.image.width / tex.image.height;
        const maxW = FRAME_W - 0.1;
        const maxH = FRAME_H - 0.1;
        let fw = maxW;
        let fh = maxW / aspect;
        if (fh > maxH) {
          fh = maxH;
          fw = maxH * aspect;
        }

        canvasMesh.geometry.dispose();
        canvasMesh.geometry = new THREE.BoxGeometry(fw, fh, 0.12);

        const edgeMat = new THREE.MeshStandardMaterial({
          color: 0x080806,
          roughness: 0.92,
        });
        const faceMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.42,
          metalness: 0.02,
        });
        canvasMesh.material = [
          edgeMat,
          edgeMat,
          edgeMat,
          edgeMat,
          faceMat,
          faceMat,
        ];

        mountMesh.geometry.dispose();
        mountMesh.geometry = new THREE.BoxGeometry(fw + 0.08, fh + 0.08, 0.1);

        outerMesh.geometry.dispose();
        outerMesh.geometry = new THREE.BoxGeometry(
          fw + BORDER * 2 + 0.06,
          fh + BORDER * 2 + 0.06,
          0.11,
        );
      });
    };

    const buildFramedPiece = (art, FRAME_W, FRAME_H) => {
      const outerGeo = new THREE.BoxGeometry(
        FRAME_W + BORDER * 2,
        FRAME_H + BORDER * 2,
        0.11,
      );
      const outerMat = new THREE.MeshStandardMaterial({
        color: FRAME_COL,
        roughness: 0.82,
        metalness: 0.12,
      });
      const outerMesh = new THREE.Mesh(outerGeo, outerMat);
      outerMesh.castShadow = true;

      const mountGeo = new THREE.BoxGeometry(FRAME_W, FRAME_H, 0.1);
      const mountMat = new THREE.MeshStandardMaterial({
        color: MOUNT_COL,
        roughness: 0.96,
      });
      const mountMesh = new THREE.Mesh(mountGeo, mountMat);

      const canvasGeo = new THREE.BoxGeometry(FRAME_W - 0.08, FRAME_H - 0.08, 0.12);
      const placemat = new THREE.MeshStandardMaterial({
        color: 0x141210,
        roughness: 0.9,
      });
      const canvasMesh = new THREE.Mesh(canvasGeo, placemat);
      canvasMesh.castShadow = true;
      canvasMesh.userData = { art };
      clickTargets.push(canvasMesh);

      const frameGroup = new THREE.Group();
      frameGroup.add(outerMesh, mountMesh, canvasMesh);
      applyArtTexture(art, canvasMesh, mountMesh, outerMesh, FRAME_W, FRAME_H);
      return frameGroup;
    };

    if (variant === "interior") {
      const ROOM = { W: 12, D: 10.5, H: 4.35 };
      scene.background = new THREE.Color(0x121110);
      scene.fog = new THREE.Fog(0x1a1816, 6.5, 19);

      const wallMat = new THREE.MeshStandardMaterial({
        color: 0xeae4dc,
        roughness: 0.94,
        metalness: 0,
      });
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x1f1611,
        roughness: 0.78,
        metalness: 0.06,
      });
      const ceilMat = new THREE.MeshStandardMaterial({
        color: 0xf0ebe4,
        roughness: 0.9,
        metalness: 0,
      });
      const trimMat = new THREE.MeshStandardMaterial({
        color: 0xc8bfb4,
        roughness: 0.88,
        metalness: 0.02,
      });

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM.W, ROOM.D),
        floorMat,
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const rug = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM.W * 0.55, ROOM.D * 0.42),
        new THREE.MeshStandardMaterial({
          color: 0x2a2220,
          roughness: 0.92,
          metalness: 0,
        }),
      );
      rug.rotation.x = -Math.PI / 2;
      rug.position.set(0, 0.004, -ROOM.D * 0.08);
      rug.receiveShadow = true;
      scene.add(rug);

      const ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM.W, ROOM.D),
        ceilMat,
      );
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = ROOM.H;
      ceiling.receiveShadow = true;
      scene.add(ceiling);

      const hw = ROOM.W / 2;
      const hd = ROOM.D / 2;

      const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM.W, ROOM.H),
        wallMat,
      );
      backWall.position.set(0, ROOM.H / 2, -hd + 0.02);
      backWall.receiveShadow = true;
      scene.add(backWall);

      const frontWall = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM.W, ROOM.H),
        wallMat,
      );
      frontWall.position.set(0, ROOM.H / 2, hd - 0.02);
      frontWall.rotation.y = Math.PI;
      frontWall.receiveShadow = true;
      scene.add(frontWall);

      const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM.D, ROOM.H),
        wallMat,
      );
      leftWall.position.set(-hw + 0.02, ROOM.H / 2, 0);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.receiveShadow = true;
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(ROOM.D, ROOM.H),
        wallMat,
      );
      rightWall.position.set(hw - 0.02, ROOM.H / 2, 0);
      rightWall.rotation.y = -Math.PI / 2;
      rightWall.receiveShadow = true;
      scene.add(rightWall);

      const baseH = 0.12;
      const addBaseboard = (w, d, x, z, rotY) => {
        const b = new THREE.Mesh(
          new THREE.BoxGeometry(w, baseH, 0.06),
          trimMat,
        );
        b.position.set(x, baseH / 2, z);
        b.rotation.y = rotY;
        b.castShadow = true;
        b.receiveShadow = true;
        scene.add(b);
      };
      addBaseboard(ROOM.W, 0, 0, -hd + 0.04, 0);
      addBaseboard(ROOM.W, 0, 0, hd - 0.04, 0);
      addBaseboard(ROOM.D, 0, -hw + 0.04, 0, Math.PI / 2);
      addBaseboard(ROOM.D, 0, hw - 0.04, 0, Math.PI / 2);

      const crownH = 0.1;
      const crownY = ROOM.H - crownH / 2;
      const crown = new THREE.Mesh(
        new THREE.BoxGeometry(ROOM.W - 0.08, crownH, 0.08),
        trimMat,
      );
      crown.position.set(0, crownY, -hd + 0.05);
      crown.castShadow = true;
      scene.add(crown);

      const studioMat = new THREE.MeshStandardMaterial({
        color: 0x2a201a,
        roughness: 0.78,
        metalness: 0.08,
      });
      const stool = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.45, 0.55, 20), studioMat);
      stool.position.set(ROOM.W * 0.22, 0.28, ROOM.D * 0.08);
      stool.castShadow = true;
      stool.receiveShadow = true;
      scene.add(stool);

      const easelGroup = new THREE.Group();
      const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 2.1, 12);
      const leg1 = new THREE.Mesh(legGeo, studioMat);
      const leg2 = new THREE.Mesh(legGeo, studioMat);
      const leg3 = new THREE.Mesh(legGeo, studioMat);
      leg1.position.set(-0.36, 1.1, 0.03);
      leg2.position.set(0.36, 1.1, 0.03);
      leg3.position.set(0, 1.05, -0.28);
      const tray = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.14), studioMat);
      tray.position.set(0, 0.92, 0.08);
      easelGroup.add(leg1, leg2, leg3, tray);
      easelGroup.position.set(-ROOM.W * 0.24, 0, ROOM.D * 0.1);
      easelGroup.rotation.y = 0.45;
      easelGroup.traverse((m) => {
        if (m.isMesh) {
          m.castShadow = true;
          m.receiveShadow = true;
        }
      });
      scene.add(easelGroup);

      const lampStand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 2.2, 16),
        new THREE.MeshStandardMaterial({ color: 0xb8b1a8, roughness: 0.35, metalness: 0.35 }),
      );
      lampStand.position.set(ROOM.W * 0.36, 1.1, -ROOM.D * 0.1);
      lampStand.castShadow = true;
      scene.add(lampStand);
      const lampHead = new THREE.Mesh(
        new THREE.ConeGeometry(0.24, 0.35, 20),
        new THREE.MeshStandardMaterial({ color: 0xe8ddcf, roughness: 0.52 }),
      );
      lampHead.position.set(ROOM.W * 0.36, 2.22, -ROOM.D * 0.08);
      lampHead.rotation.x = Math.PI;
      lampHead.castShadow = true;
      scene.add(lampHead);

      const ambient = new THREE.AmbientLight(0xffffff, 0.28);
      scene.add(ambient);

      const hemi = new THREE.HemisphereLight(0xf2f6ff, 0x8a7a68, 0.42);
      hemi.position.set(0, ROOM.H, 0);
      scene.add(hemi);

      const sun = new THREE.DirectionalLight(0xfff3e0, 0.55);
      sun.position.set(hw * 0.9, ROOM.H * 0.95, hd * 0.35);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.near = 0.5;
      sun.shadow.camera.far = 28;
      sun.shadow.camera.left = -10;
      sun.shadow.camera.right = 10;
      sun.shadow.camera.top = 10;
      sun.shadow.camera.bottom = -10;
      sun.shadow.bias = -0.0002;
      scene.add(sun);

      const fill = new THREE.PointLight(0xffeedd, 0.35, 14);
      fill.position.set(0, ROOM.H - 0.35, 0.5);
      scene.add(fill);
      const lampGlow = new THREE.PointLight(0xffe2bc, 0.55, 6.5);
      lampGlow.position.set(ROOM.W * 0.36, 2.0, -ROOM.D * 0.08);
      scene.add(lampGlow);

      const DUST_COUNT = 320;
      const dustPos = new Float32Array(DUST_COUNT * 3);
      for (let i = 0; i < DUST_COUNT; i++) {
        dustPos[i * 3] = (Math.random() - 0.5) * (ROOM.W - 1.5);
        dustPos[i * 3 + 1] = 0.35 + Math.random() * (ROOM.H - 0.9);
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * (ROOM.D - 1.4);
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
      const dustMat = new THREE.PointsMaterial({
        color: 0xf8ede0,
        size: 0.035,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      });
      dustCloud = new THREE.Points(dustGeo, dustMat);
      scene.add(dustCloud);

      const slots = layoutArtworksInRoom(artworks, ROOM);
      const FRAME_H = 1.55;
      const FRAME_W = 2.15;

      slots.forEach((slot, index) => {
        const fg = buildFramedPiece(slot.art, FRAME_W, FRAME_H);
        fg.position.set(slot.x, slot.y, slot.z);
        fg.rotation.y = slot.rotY;
        scene.add(fg);

        if (index < 8) {
          const spot = new THREE.SpotLight(0xfff4e6, 0.85, 12, Math.PI / 5.5, 0.38, 1.2);
          spot.position.set(slot.x * 0.35, ROOM.H - 0.15, slot.z * 0.35 + hd * 0.25);
          spot.target.position.copy(fg.position);
          spot.castShadow = true;
          spot.shadow.mapSize.set(512, 512);
          scene.add(spot);
          scene.add(spot.target);
        }
      });

      introFrom = new THREE.Vector3(0, 1.58, hd + 1.2);
      introTo = new THREE.Vector3(0, 1.55, hd - 1.65);
      introTarget = new THREE.Vector3(0, 1.48, -hd * 0.38);
      camera.position.copy(introFrom);
      camera.lookAt(introTarget);

      controls.target.copy(introTarget);
      controls.enablePan = false;
      controls.maxDistance = 3.4;
      controls.minDistance = 0.9;
      controls.maxPolarAngle = Math.PI * 0.49;
      controls.minPolarAngle = 0.22;
      controls.autoRotate = false;
      controls.update();
      interiorBounds = {
        minX: -hw + 0.55,
        maxX: hw - 0.55,
        minZ: -hd + 0.65,
        maxZ: hd - 0.65,
        minY: 1.05,
        maxY: 2.25,
      };
    } else {
      scene.background = new THREE.Color(0x03030d);
      scene.fog = new THREE.FogExp2(0x03030d, 0.045);

      camera.position.set(0, 3, 13);
      camera.lookAt(0, 1.5, 0);

      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.35;
      controls.maxDistance = 22;
      controls.minDistance = 4;
      controls.maxPolarAngle = Math.PI * 0.72;
      controls.minPolarAngle = Math.PI * 0.12;
      controls.target.set(0, 1.5, 0);
      controls.update();

      const STAR_COUNT = 5000;
      const starPositions = new Float32Array(STAR_COUNT * 3);
      const starColors = new Float32Array(STAR_COUNT * 3);

      for (let i = 0; i < STAR_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 60 + Math.random() * 100;

        starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPositions[i * 3 + 2] = r * Math.cos(phi);

        const tint = Math.random();
        if (tint < 0.15) {
          starColors[i * 3] = 0.7;
          starColors[i * 3 + 1] = 0.85;
          starColors[i * 3 + 2] = 1.0;
        } else if (tint < 0.3) {
          starColors[i * 3] = 1.0;
          starColors[i * 3 + 1] = 0.9;
          starColors[i * 3 + 2] = 0.65;
        } else if (tint < 0.4) {
          starColors[i * 3] = 0.85;
          starColors[i * 3 + 1] = 0.65;
          starColors[i * 3 + 2] = 1.0;
        } else {
          starColors[i * 3] = 1.0;
          starColors[i * 3 + 1] = 1.0;
          starColors[i * 3 + 2] = 1.0;
        }
      }

      const starsGeo = new THREE.BufferGeometry();
      starsGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(starPositions, 3),
      );
      starsGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

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

      scene.add(new THREE.AmbientLight(0xfff0f5, 0.5));

      const chandelier = new THREE.PointLight(0xfff0e8, 1.5, 55);
      chandelier.position.set(0, 10, 0);
      chandelier.castShadow = true;
      chandelier.shadow.mapSize.set(512, 512);
      scene.add(chandelier);

      [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((a) => {
        const fl = new THREE.PointLight(0xfff5f0, 0.45, 28);
        fl.position.set(Math.cos(a) * 9, 6, Math.sin(a) * 9);
        scene.add(fl);
      });

      const rim = new THREE.PointLight(0xd0e8ff, 0.25, 22);
      rim.position.set(0, -3, 0);
      scene.add(rim);

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

      const RADIUS = 7;
      const FRAME_H = 2.4;
      const FRAME_W = 3.4;
      const group = new THREE.Group();
      scene.add(group);

      artworks.forEach((art, index) => {
        const angle = (index / artworks.length) * Math.PI * 2;
        const x = Math.cos(angle) * RADIUS;
        const z = Math.sin(angle) * RADIUS;
        const yPos = FRAME_H / 2 + 0.4;

        const fg = buildFramedPiece(art, FRAME_W, FRAME_H);
        fg.position.set(x, yPos, z);
        fg.lookAt(0, yPos, 0);
        group.add(fg);

        if (index < 6) {
          const spot = new THREE.SpotLight(
            0xfff0d8,
            1.1,
            18,
            Math.PI / 7,
            0.45,
            1.4,
          );
          spot.position.set(x * 0.6, 9, z * 0.6);
          spot.target.position.set(x, yPos, z);
          scene.add(spot);
          scene.add(spot.target);
        }
      });
    }

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      renderer.domElement.style.cursor =
        raycaster.intersectObjects(clickTargets).length > 0 ? "pointer" : "grab";
    };

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickTargets);
      if (hits.length > 0 && hits[0].object.userData?.art) {
        onSelectRef.current(hits[0].object.userData.art);
      }
    };

    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("click", onClick);

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      if (variant !== "interior" && starsRef.current) {
        starsRef.current.rotation.y += 0.00008;
      }
      if (variant === "interior") {
        if (introProgress < 1 && introFrom && introTo && introTarget) {
          introProgress = Math.min(1, introProgress + 0.009);
          const eased = 1 - Math.pow(1 - introProgress, 3);
          camera.position.lerpVectors(introFrom, introTo, eased);
          controls.target.lerp(introTarget, 0.12);
        }
        if (interiorBounds) {
          camera.position.x = Math.min(interiorBounds.maxX, Math.max(interiorBounds.minX, camera.position.x));
          camera.position.z = Math.min(interiorBounds.maxZ, Math.max(interiorBounds.minZ, camera.position.z));
          camera.position.y = Math.min(interiorBounds.maxY, Math.max(interiorBounds.minY, camera.position.y));
        }
        if (dustCloud) {
          dustCloud.rotation.y += 0.00018;
          dustCloud.position.y = Math.sin(performance.now() * 0.00035) * 0.02;
        }
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      controls?.dispose();
      if (renderer) {
        renderer.dispose();
        // Crucial fix: releases the WebGL context back to the browser immediately
        renderer.forceContextLoss();
        if (mount && renderer.domElement && renderer.domElement.parentNode === mount) {
          mount.removeChild(renderer.domElement);
        }
      }
      starsRef.current = null;
    };
  }, [isLoaded, artworks, variant]);

  const loadingLabel =
    variant === "interior" ? "Building gallery space…" : "Preparing galaxy gallery…";

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
      {!isLoaded && !loadError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#03030d]">
          <div className="w-12 h-12 rounded-full border-4 border-white/10 border-t-violet-500 animate-spin" />
          <p className="text-zinc-500 text-sm tracking-wide animate-pulse">
            {loadingLabel}
          </p>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#03030d]">
          <p className="text-red-400 text-sm">{loadError}</p>
        </div>
      )}

      <div
        ref={mountRef}
        className="w-full h-full min-h-[400px]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {isLoaded && (
        <div
          className={`absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-500 ${
            hovered ? "opacity-100" : "opacity-50"
          }`}
        >
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-violet-500/20 text-xs text-zinc-400 whitespace-nowrap">
            <MousePointer2 size={12} className="text-violet-400 shrink-0" />
            {variant === "interior"
              ? "Walk the room · Click a frame · Drag to look around"
              : "Click an artwork · Drag to orbit · Scroll to zoom"}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDGallery;
