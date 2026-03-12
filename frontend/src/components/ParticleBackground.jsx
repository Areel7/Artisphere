import { useEffect, useRef } from "react";

// Fix #2: Particle class defined at module scope, not inside useEffect
class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.z = Math.random() * 1000;
    this.size = Math.random() * 1.5 + 0.5;
    this.speedZ = Math.random() * 2 + 0.2;
  }

  update() {
    this.z -= this.speedZ;
    if (this.z <= 0) {
      this.z = 1000;
      this.x = Math.random() * this.canvasWidth;
      this.y = Math.random() * this.canvasHeight;
    }
  }

  draw(ctx, canvas) {
    const scale = 1000 / this.z;
    const x2d = (this.x - canvas.width / 2) * scale + canvas.width / 2;
    const y2d = (this.y - canvas.height / 2) * scale + canvas.height / 2;

    // Fix #4: Cap radius to prevent unbounded growth when z approaches 0
    const r = Math.min(this.size * scale, 20);

    if (x2d >= 0 && x2d <= canvas.width && y2d >= 0 && y2d <= canvas.height) {
      ctx.beginPath();
      ctx.arc(x2d, y2d, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, 1 - this.z / 800)})`;
      ctx.fill();
    }
  }
}

const ParticleBackground = () => {
  const canvasRef = useRef(null);

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
      // Fix #3: Clear canvas first, then apply a dense fade overlay for reliable trail rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(9, 9, 11, 0.85)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw(ctx, canvas);
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
      className="fixed inset-0 z-0 pointer-events-none bg-zinc-950"
    />
  );
};

export default ParticleBackground;