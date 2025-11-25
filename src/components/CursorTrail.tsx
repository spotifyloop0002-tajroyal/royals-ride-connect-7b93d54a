import { useEffect, useState } from "react";

const CursorTrail = () => {
  const [trails, setTrails] = useState<{ x: number; y: number; id: number }[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Check if premium mode is active
    const isPremium = document.body.classList.contains("premium-dark");
    if (!isPremium) return;

    let animationFrameId: number;
    const trailPositions: { x: number; y: number; id: number }[] = [];
    let trailId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Add new trail position
      trailPositions.push({
        x: e.clientX,
        y: e.clientY,
        id: trailId++,
      });

      // Limit trail length
      if (trailPositions.length > 15) {
        trailPositions.shift();
      }
    };

    const updateTrails = () => {
      setTrails([...trailPositions]);
      animationFrameId = requestAnimationFrame(updateTrails);
    };

    window.addEventListener("mousemove", handleMouseMove);
    updateTrails();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Only render in premium mode
  if (!document.body.classList.contains("premium-dark")) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <div
        className="cursor-trail-dot"
        style={{
          left: mousePos.x - 2,
          top: mousePos.y - 2,
        }}
      />
      
      {/* Trail effect */}
      {trails.map((trail, index) => {
        const opacity = (index + 1) / trails.length;
        const scale = (index + 1) / trails.length;
        
        return (
          <div
            key={trail.id}
            className="cursor-trail"
            style={{
              left: trail.x - 10,
              top: trail.y - 10,
              opacity: opacity * 0.6,
              transform: `scale(${scale})`,
            }}
          />
        );
      })}
    </>
  );
};

export default CursorTrail;
