import { useEffect, useRef, useState } from "react";

const CursorTrail = () => {
  const [isActive, setIsActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailsRef = useRef<{ x: number; y: number; opacity: number }[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const isPremium = document.body.classList.contains("premium-dark");
    if (!isPremium) return;
    setIsActive(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      trailsRef.current.push({ x: e.clientX, y: e.clientY, opacity: 0.6 });
      if (trailsRef.current.length > 15) trailsRef.current.shift();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const trails = trailsRef.current;
      
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.opacity -= 0.02;
        if (t.opacity <= 0) { trails.splice(i, 1); continue; }
        const scale = t.opacity;
        ctx.fillStyle = `hsla(43, 74%, 49%, ${t.opacity})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 10 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Main dot
      ctx.fillStyle = 'hsl(43, 74%, 49%)';
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 2, 0, Math.PI * 2);
      ctx.fill();
      
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
};

export default CursorTrail;
