import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface CartoonProps {
  onComplete: () => void;
}

const Cartoon: React.FC<CartoonProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const transitionedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = Math.min(window.innerWidth, 600);
    const H = Math.min(Math.round(W * 0.6), 320);
    canvas.width = W;
    canvas.height = H;
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';

    const groundY = H * 0.75;
    const bearScale = W < 400 ? 0.75 : 1;

    // Dust particles
    const dust: { x: number; y: number; vx: number; vy: number; opacity: number; r: number }[] = [];
    // Hearts array
    const hearts: { x: number; y: number; vy: number; opacity: number; size: number }[] = [];

    const drawBear = (
      x: number, y: number,
      isChar1: boolean,
      bobY: number,
      rotation: number,
      blush: number,
      legPhase: number,
      armUpL: boolean = false,
      armUpR: boolean = false,
      hugging: boolean = false
    ) => {
      ctx.save();
      ctx.translate(x, y + bobY);
      ctx.rotate(rotation);

      const s = bearScale;
      const bodyColor = isChar1 ? '#7a5530' : '#c09060';
      const lightColor = isChar1 ? '#a07045' : '#d4a870';

      // Shadow
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(0, 30 * s, 22 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Legs
      const legSwing = Math.sin(legPhase) * 18;
      ctx.fillStyle = bodyColor;

      // Left leg
      ctx.save();
      ctx.translate(-10 * s, 20 * s);
      if (!hugging) ctx.rotate((legSwing * Math.PI) / 180);
      ctx.beginPath();
      ctx.ellipse(0, 10 * s, 6 * s, 13 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Foot
      ctx.beginPath();
      ctx.ellipse(0, 22 * s, 8 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right leg
      ctx.save();
      ctx.translate(10 * s, 20 * s);
      if (!hugging) ctx.rotate((-legSwing * Math.PI) / 180);
      ctx.beginPath();
      ctx.ellipse(0, 10 * s, 6 * s, 13 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(0, 22 * s, 8 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Body
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, 20 * s, 25 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hoodie (char1) or shirt (char2)
      if (isChar1) {
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.ellipse(0, 5 * s, 20 * s, 20 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        // Hood strings
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-3 * s, -8 * s); ctx.lineTo(-3 * s, 5 * s);
        ctx.moveTo(3 * s, -8 * s); ctx.lineTo(3 * s, 5 * s);
        ctx.stroke();
      }

      // Tummy
      ctx.fillStyle = lightColor;
      ctx.beginPath();
      ctx.ellipse(0, 5 * s, 12 * s, 16 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Arms
      ctx.fillStyle = bodyColor;

      // Left arm
      ctx.save();
      ctx.translate(-20 * s, -5 * s);
      const aSwingL = hugging ? -Math.PI * 0.4 : (armUpL ? -Math.PI * 0.3 : Math.sin(legPhase + Math.PI) * 0.3);
      ctx.rotate(aSwingL);
      ctx.beginPath();
      ctx.ellipse(0, 12 * s, 6 * s, 14 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // Paw
      ctx.beginPath();
      ctx.arc(0, 26 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right arm
      ctx.save();
      ctx.translate(20 * s, -5 * s);
      const aSwingR = hugging ? Math.PI * 0.4 : (armUpR ? Math.PI * 0.3 : Math.sin(legPhase) * 0.3);
      ctx.rotate(aSwingR);
      ctx.beginPath();
      ctx.ellipse(0, 12 * s, 6 * s, 14 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 26 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Head
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.ellipse(0, -32 * s, 18 * s, 17 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ears
      [-1, 1].forEach((side) => {
        ctx.beginPath();
        ctx.arc(side * 15 * s, -44 * s, 8 * s, 0, Math.PI * 2);
        ctx.fillStyle = bodyColor;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(side * 15 * s, -44 * s, 5 * s, 0, Math.PI * 2);
        ctx.fillStyle = '#cc7799';
        ctx.fill();
      });

      // Red ribbon on char2
      if (!isChar1) {
        ctx.save();
        ctx.translate(15 * s, -44 * s);
        ctx.fillStyle = '#ff0040';
        // Bow shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-8 * s, -8 * s, -12 * s, 0, -8 * s, 4 * s);
        ctx.bezierCurveTo(-4 * s, 8 * s, 0, 4 * s, 0, 0);
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(8 * s, -8 * s, 12 * s, 0, 8 * s, 4 * s);
        ctx.bezierCurveTo(4 * s, 8 * s, 0, 4 * s, 0, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, 3 * s, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6b6b';
        ctx.fill();
        ctx.restore();
      }

      // Face
      ctx.fillStyle = '#222';
      // Eyes
      ctx.beginPath();
      ctx.arc(-6 * s, -33 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(6 * s, -33 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      // Eye shine
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-5 * s, -34 * s, 1 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(7 * s, -34 * s, 1 * s, 0, Math.PI * 2);
      ctx.fill();

      // Nose
      ctx.fillStyle = '#5c3317';
      ctx.beginPath();
      ctx.ellipse(0, -27 * s, 4 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mouth - smile
      ctx.strokeStyle = '#5c3317';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -25 * s, 4 * s, 0.15, Math.PI - 0.15);
      ctx.stroke();

      // Blush
      if (blush > 0) {
        ctx.globalAlpha = blush * 0.55;
        ctx.fillStyle = '#ff9999';
        ctx.beginPath();
        ctx.ellipse(-11 * s, -28 * s, 6 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(11 * s, -28 * s, 6 * s, 4 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();
    };

    const drawHeart = (x: number, y: number, size: number, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.3);
      ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.6);
      ctx.bezierCurveTo(x - size, y + size * 1.1, x, y + size * 1.4, x, y + size * 1.6);
      ctx.bezierCurveTo(x, y + size * 1.4, x + size, y + size * 1.1, x + size, y + size * 0.6);
      ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3);
      ctx.fill();
      ctx.restore();
    };

    let heartsSpawned = false;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      ctx.clearRect(0, 0, W, H);

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#2a1a10');
      bgGrad.addColorStop(1, '#1a0e08');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Floor
      const floorGrad = ctx.createLinearGradient(0, groundY, 0, H);
      floorGrad.addColorStop(0, '#3d2817');
      floorGrad.addColorStop(1, '#2a1a0e');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, groundY, W, H - groundY);

      // Floor line
      ctx.strokeStyle = '#4d3827';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY); ctx.lineTo(W, groundY);
      ctx.stroke();

      const cx = W / 2;

      // --- PHASE 0: CHASE (0-3s) ---
      if (elapsed < 3) {
        const progress = elapsed / 3;
        const b2X = -60 + progress * (W + 120);
        const b1X = b2X - 85;
        const bob = Math.abs(Math.sin(elapsed * 10)) * -6;
        const legPhase = elapsed * 10;

        // Spawn dust behind bear 1
        if (Math.random() < 0.25) {
          dust.push({ x: b1X - 12, y: groundY + 5, vx: -1.2, vy: -0.3, opacity: 0.5, r: Math.random() * 4 + 2 });
        }

        // Draw dust
        for (let i = dust.length - 1; i >= 0; i--) {
          const d = dust[i];
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(90,70,50,${d.opacity})`;
          ctx.fill();
          d.x += d.vx; d.y += d.vy; d.opacity -= 0.015; d.r *= 1.02;
          if (d.opacity <= 0) dust.splice(i, 1);
        }

        drawBear(b2X, groundY, false, bob, 0, 0, legPhase);
        drawBear(b1X, groundY, true, bob * 1.1, 0, 0, legPhase + 1);

        // "Chasing" text effect
        if (elapsed > 0.5) {
          ctx.save();
          ctx.globalAlpha = Math.min(1, elapsed);
          ctx.fillStyle = '#fff';
          ctx.font = `${Math.round(10 * bearScale)}px Cairo, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('يا نارررر', b1X, groundY - 60 * bearScale);
          ctx.restore();
        }

      // --- PHASE 1: FIGHT (3-5.5s) ---
      } else if (elapsed < 5.5) {
        const fE = elapsed - 3;

        const b1X = cx - 65;
        const b2X = cx + 65;

        // Fight wobble
        const wobble1 = Math.sin(fE * 8) * 0.25;
        const wobble2 = Math.sin(fE * 8 + 2) * 0.25;

        // Impact effect
        if (fE > 0.3 && fE < 2.2) {
          const starScale = Math.min(1, Math.sin((fE - 0.3) * Math.PI / 1.9));
          ctx.save();
          ctx.translate(cx, groundY - 55 * bearScale);
          ctx.scale(starScale * 22 * bearScale, starScale * 22 * bearScale);
          ctx.fillStyle = '#ffd700';
          for (let i = 0; i < 8; i++) {
            ctx.rotate(Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0.25, 0.65);
            ctx.lineTo(0, 1);
            ctx.lineTo(-0.25, 0.65);
            ctx.fill();
          }
          ctx.restore();

          // 💥 emoji
          ctx.font = `${Math.round(20 * bearScale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('💥', cx, groundY - 75 * bearScale);
        }

        // Fall at 1.8s into fight
        const tumble = Math.max(0, Math.min(1, (fE - 1.5) / 1));
        const fallY = tumble * 25 * bearScale;
        const fallR1 = -tumble * 0.6;
        const fallR2 = tumble * 0.6;

        drawBear(b1X - tumble * 15, groundY + fallY, true, 0, fallR1, 0, 0, fE < 1.5, false);
        drawBear(b2X + tumble * 15, groundY + fallY, false, 0, fallR2, 0, 0, false, fE < 1.5);

        // Dizzy stars after tumble
        if (fE > 2) {
          const dizzyAlpha = Math.min(1, (fE - 2) * 2);
          ctx.globalAlpha = dizzyAlpha;
          ctx.font = `${Math.round(14 * bearScale)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('💫', b1X - 20, groundY + fallY - 55 * bearScale);
          ctx.fillText('💫', b2X + 20, groundY + fallY - 55 * bearScale);
          ctx.globalAlpha = 1;
        }

        void wobble1; void wobble2;

      // --- PHASE 2: HUG (5.5s+) ---
      } else {
        const hE = elapsed - 5.5;

        if (!heartsSpawned) {
          heartsSpawned = true;
          for (let i = 0; i < 5; i++) {
            hearts.push({
              x: cx + (i - 2) * 18,
              y: groundY - 70 * bearScale,
              vy: -(0.8 + i * 0.15),
              opacity: 0.9,
              size: 7 + i * 1.5,
            });
          }
        }

        const comeIn = Math.min(1, hE / 0.9);
        const sitUp = Math.min(1, hE / 0.5);
        const sitY = (1 - sitUp) * 28;
        const blush = Math.min(1, Math.max(0, (hE - 0.5) * 1.5));
        const hugging = hE > 0.8;
        const hugScale = 1 + Math.min(0.08, hE * 0.01);

        const b1X = cx - (hugging ? 38 : 65 - comeIn * 27);
        const b2X = cx + (hugging ? 38 : 65 - comeIn * 27);

        // Update & draw hearts
        for (let i = hearts.length - 1; i >= 0; i--) {
          hearts[i].y += hearts[i].vy;
          hearts[i].opacity -= 0.004;
          drawHeart(hearts[i].x, hearts[i].y, hearts[i].size, hearts[i].opacity);
          if (hearts[i].opacity <= 0) hearts.splice(i, 1);
        }

        // Spawn more hearts during hug
        if (hE > 1 && hE < 4 && Math.random() < 0.04) {
          hearts.push({
            x: cx + (Math.random() - 0.5) * 60,
            y: groundY - 70 * bearScale,
            vy: -(0.6 + Math.random() * 0.4),
            opacity: 0.8,
            size: 5 + Math.random() * 8,
          });
        }

        ctx.save();
        ctx.scale(hugScale, hugScale);
        ctx.translate(cx * (1 - hugScale), groundY * (1 - hugScale));
        drawBear(b1X / hugScale, (groundY + sitY) / hugScale, true, 0, 0, blush, 0, false, false, hugging);
        drawBear(b2X / hugScale, (groundY + sitY) / hugScale, false, 0, 0, blush, 0, false, false, hugging);
        ctx.restore();

        // "I love you" text
        if (hE > 2) {
          const textAlpha = Math.min(1, (hE - 2) * 1.5);
          ctx.save();
          ctx.globalAlpha = textAlpha;
          ctx.fillStyle = '#ff6b6b';
          ctx.font = `${Math.round(12 * bearScale)}px Cairo, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('🥰', cx, groundY - 90 * bearScale);
          ctx.restore();
        }
      }

      // Trigger transition
      if (elapsed > 9.5 && !transitionedRef.current) {
        transitionedRef.current = true;
        if (overlayRef.current) {
          gsap.to(overlayRef.current, {
            opacity: 1,
            duration: 0.8,
            delay: 0.3,
            onComplete: onComplete,
          });
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [onComplete]);

  return (
    <div
      className="relative w-full"
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #2a1a0e 0%, #1a0e08 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        overflow: 'hidden',
      }}
    >
      {/* Leather texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: [
            'repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 10px)',
            'repeating-linear-gradient(-45deg, rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px, transparent 1px, transparent 10px)',
          ].join(', '),
          pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <p
        className="font-cairo text-white text-center"
        style={{
          fontSize: 'clamp(16px, 4.5vw, 22px)',
          margin: 0,
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          paddingLeft: 16,
          paddingRight: 16,
          textShadow: '0 0 12px rgba(255,100,100,0.3)',
          zIndex: 1,
          position: 'relative',
        }}
      >
        ده انا وانتي طول اليوم عادي 😂
      </p>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          maxWidth: '100%',
          borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          zIndex: 1,
          position: 'relative',
        }}
      />

      {/* Subtitle */}
      <p
        className="font-cairo text-center"
        style={{
          fontSize: 'clamp(13px, 3.5vw, 16px)',
          color: 'rgba(255,180,180,0.65)',
          margin: 0,
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          paddingLeft: 16,
          paddingRight: 16,
          zIndex: 1,
          position: 'relative',
        }}
      >
        ولو بنتخانق... في الآخر بنتحب ❤️
      </p>

      {/* Transition overlay */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0a0a0f',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 100,
        }}
      />
    </div>
  );
};

export default Cartoon;
