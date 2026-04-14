import { useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

// Vibrant light-mode palette: violet, fuchsia, indigo, rose, amber
const LIGHT_COLORS = [
  [139, 92,  246], // violet-500
  [217, 70,  239], // fuchsia-500
  [99,  102, 241], // indigo-500
  [244, 63,  94],  // rose-500
  [245, 158, 11],  // amber-500
  [168, 85,  247], // purple-500
];

// Particle class defined at module scope, not inside useEffect
class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.z = Math.random() * 1000;
    this.size = Math.random() * 1.5 + 0.5;
    this.speedZ = Math.random() * 2 + 0.2;
    // Pick a random color from the palette once at birth
    this.colorIdx = Math.floor(Math.random() * LIGHT_COLORS.length);
  }

  update() {
    this.z -= this.speedZ;
    if (this.z <= 0) {
      this.z = 1000;
      this.x = Math.random() * this.canvasWidth;
      this.y = Math.random() * this.canvasHeight;
      this.colorIdx = Math.floor(Math.random() * LIGHT_COLORS.length);
    }
  }

  draw(ctx, canvas, isDark) {
    const scale = 1000 / this.z;
    const x2d = (this.x - canvas.width / 2) * scale + canvas.width / 2;
    const y2d = (this.y - canvas.height / 2) * scale + canvas.height / 2;

    // Cap radius to prevent unbounded growth when z approaches 0
    const r = Math.min(this.size * scale, 20);

    if (x2d >= 0 && x2d <= canvas.width && y2d >= 0 && y2d <= canvas.height) {
      ctx.beginPath();
      ctx.arc(x2d, y2d, r, 0, Math.PI * 2);
      const alpha = Math.max(0, 1 - this.z / 800);
      if (isDark) {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      } else {
        const [red, green, blue] = LIGHT_COLORS[this.colorIdx];
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha * 0.65})`;
      }
      ctx.fill();
    }
  }
}

const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let particles = [];

    const init = () => {
      particles = [];
      for (let i = 0; i < 300; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    // Fix #1: Re-initialize particles on resize so positions match new dimensions
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const animate = () => {
      const isDark = themeRef.current === "dark";
      // Fix #3: Clear canvas first, then apply a dense fade overlay for reliable trail rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isDark
        ? "rgba(9, 9, 11, 0.85)"
        : "rgba(250, 250, 250, 0.9)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw(ctx, canvas, isDark);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none bg-zinc-50 dark:bg-zinc-950"
    />
  );
};

export default ParticleBackground;
