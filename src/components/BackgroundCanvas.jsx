import { useEffect, useRef } from "react";

/**
 * Full-screen canvas background.
 * Renders a slow-drifting particle network with connecting lines —
 * gold nodes on a deep navy field, matching the AuditAI colour palette.
 *
 * Mounted once in App.jsx behind all content via position:fixed.
 * Uses requestAnimationFrame; cleans up on unmount.
 */
export function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let raf;

    // ── Config ──────────────────────────────────────────────────────────────
    const PARTICLE_COUNT  = 72;
    const MAX_DIST        = 160;   // px — max distance for a connecting line
    const SPEED           = 0.28;  // base drift speed
    const NODE_RADIUS     = 1.4;
    const GOLD            = "201,153,58";
    const BLUE            = "59,100,180";

    // ── Resize ──────────────────────────────────────────────────────────────
    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // ── Particles ────────────────────────────────────────────────────────────
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:   Math.random() * canvas.width,
      y:   Math.random() * canvas.height,
      vx:  (Math.random() - 0.5) * SPEED,
      vy:  (Math.random() - 0.5) * SPEED,
      r:   NODE_RADIUS * (0.6 + Math.random() * 0.8),
      // mix of gold and blue nodes
      color: Math.random() > 0.65 ? GOLD : BLUE,
    }));

    // ── Draw loop ────────────────────────────────────────────────────────────
    function draw() {
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Move particles, wrap at edges
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      }

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a  = particles[i];
          const b  = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);

          if (d < MAX_DIST) {
            const alpha = (1 - d / MAX_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${a.color},${alpha})`;
            ctx.lineWidth   = 0.7;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},0.55)`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.7,
      }}
    />
  );
}