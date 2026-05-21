import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface CakeProps {
  onComplete: () => void;
}

const Cake: React.FC<CakeProps> = ({ onComplete }) => {
  const cakeCanvasRef = useRef<HTMLCanvasElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [blown, setBlown] = useState(false);
  const [showInstruction, setShowInstruction] = useState(false);
  const [celebrationText, setCelebrationText] = useState(false);
  const flameRef = useRef({ flicker: 1, extinguished: false });
  const animRef = useRef<number>(0);
  const confettiParticlesRef = useRef<any[]>([]);
  const bgParticlesRef = useRef<any[]>([]);
  const splotchesRef = useRef<{ x: number; y: number; r: number }[]>([]);
  const bgAnimRef = useRef<number>(0);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const CAKE_SCALE = isMobile ? 0.82 : 1;

  // BG golden dust
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const count = isMobile ? 15 : 30;
    bgParticlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.25 + 0.05),
      opacity: Math.random() * 0.5 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bgParticlesRef.current.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,215,0,${p.opacity})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -5) { p.y = canvas.height; p.x = Math.random() * canvas.width; }
      });
      bgAnimRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(bgAnimRef.current); window.removeEventListener('resize', resize); };
  }, [isMobile]);

  // Draw cake on canvas
  useEffect(() => {
    const canvas = cakeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = isMobile ? 340 : 400;
    const H = isMobile ? 420 : 480;
    canvas.width = W;
    canvas.height = H;

    const cx = W / 2;
    const scale = CAKE_SCALE;

    // Tier dimensions
    const t1W = 280 * scale, t1H = 90 * scale;
    const t2W = 215 * scale, t2H = 80 * scale;
    const t3W = 155 * scale, t3H = 70 * scale;
    const plateW = 310 * scale, plateH = 30 * scale;

    // Y positions (bottom-aligned)
    const plateY = H - 30;
    const t1Y = plateY - plateH / 2 - t1H;
    const t2Y = t1Y - t2H - 4;
    const t3Y = t2Y - t3H - 4;

    const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number, fill: string, gradient?: boolean) => {
      const rx = cx - w / 2 + x;
      ctx.beginPath();
      ctx.moveTo(rx + r, y);
      ctx.lineTo(rx + w - r, y);
      ctx.quadraticCurveTo(rx + w, y, rx + w, y + r);
      ctx.lineTo(rx + w, y + h - r);
      ctx.quadraticCurveTo(rx + w, y + h, rx + w - r, y + h);
      ctx.lineTo(rx + r, y + h);
      ctx.quadraticCurveTo(rx, y + h, rx, y + h - r);
      ctx.lineTo(rx, y + r);
      ctx.quadraticCurveTo(rx, y, rx + r, y);
      ctx.closePath();
      if (gradient) {
        const gr = ctx.createLinearGradient(rx, y, rx, y + h);
        gr.addColorStop(0, lighten(fill, 25));
        gr.addColorStop(1, darken(fill, 20));
        ctx.fillStyle = gr;
      } else {
        ctx.fillStyle = fill;
      }
      ctx.fill();
    };

    const lighten = (hex: string, amt: number) => {
      const n = parseInt(hex.replace('#', ''), 16);
      const r = Math.min(255, (n >> 16) + amt);
      const g = Math.min(255, ((n >> 8) & 0xff) + amt);
      const b = Math.min(255, (n & 0xff) + amt);
      return `rgb(${r},${g},${b})`;
    };
    const darken = (hex: string, amt: number) => {
      const n = parseInt(hex.replace('#', ''), 16);
      const r = Math.max(0, (n >> 16) - amt);
      const g = Math.max(0, ((n >> 8) & 0xff) - amt);
      const b = Math.max(0, (n & 0xff) - amt);
      return `rgb(${r},${g},${b})`;
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // Plate
      ctx.save();
      const plateGr = ctx.createLinearGradient(cx - plateW / 2, 0, cx + plateW / 2, 0);
      plateGr.addColorStop(0, '#aaa');
      plateGr.addColorStop(0.5, '#eee');
      plateGr.addColorStop(1, '#aaa');
      ctx.fillStyle = plateGr;
      ctx.beginPath();
      ctx.ellipse(cx, plateY, plateW / 2, plateH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Tier 1
      ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(0,0,0,0.4)';
      drawRoundedRect(0, t1Y, t1W, t1H, 14, '#f4c2c2', true);
      ctx.shadowBlur = 0;

      // Masaa text on tier 1
      ctx.fillStyle = '#d4145a';
      ctx.font = `bold ${Math.round(22 * scale)}px Pacifico, cursive`;
      ctx.textAlign = 'center';
      ctx.fillText('Masaa', cx, t1Y + t1H / 2 + 8 * scale);

      // Piping on tier 1 top
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 5 * scale;
      ctx.beginPath();
      for (let i = 0; i < t1W; i += 16 * scale) {
        const px = cx - t1W / 2 + i;
        ctx.arc(px, t1Y, 5 * scale, Math.PI, 0);
      }
      ctx.stroke();

      // Tier 2
      ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(0,0,0,0.3)';
      drawRoundedRect(0, t2Y, t2W, t2H, 12, '#ffb6c1', true);
      ctx.shadowBlur = 0;

      // Piping on tier 2 top
      ctx.strokeStyle = '#fff8';
      ctx.lineWidth = 4 * scale;
      ctx.beginPath();
      for (let i = 0; i < t2W; i += 14 * scale) {
        const px = cx - t2W / 2 + i;
        ctx.arc(px, t2Y, 4 * scale, Math.PI, 0);
      }
      ctx.stroke();

      // Tier 3
      ctx.shadowBlur = 12; ctx.shadowColor = 'rgba(0,0,0,0.25)';
      drawRoundedRect(0, t3Y, t3W, t3H, 10, '#ff69b4', true);
      ctx.shadowBlur = 0;

      // Pride flag on tier 3
      const flagW = isMobile ? 88 : 100;
      const flagH = isMobile ? 60 : 66;
      const flagX = cx - flagW / 2;
      const flagY = t3Y + 4 * scale;
      const stripes = ['#FF0018', '#FFA52C', '#FFFF41', '#008018', '#0000F9', '#86007D'];
      const sh = flagH / 6;
      stripes.forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.fillRect(flagX, flagY + i * sh, flagW, sh);
      });

      // Pride flag border
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(flagX, flagY, flagW, flagH);

      // Text above flag
      ctx.fillStyle = '#fff';
      ctx.font = `${isMobile ? 9 : 11}px Cairo, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Happy 4 months my diamond bestie!', cx, t3Y + (isMobile ? 78 : 84) * scale);

      // Chocolate splotches
      splotchesRef.current.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = '#4a2500';
        ctx.fill();
      });

      // Candle body
      const candleX = cx - 6 * scale;
      const candleW = 12 * scale;
      const candleH = 30 * scale;
      const candleY = t3Y - candleH;

      const candleGr = ctx.createLinearGradient(candleX, 0, candleX + candleW, 0);
      candleGr.addColorStop(0, '#ddd');
      candleGr.addColorStop(0.5, '#fff');
      candleGr.addColorStop(1, '#ddd');
      ctx.fillStyle = candleGr;
      ctx.fillRect(candleX, candleY, candleW, candleH);

      // Red spiral stripes on candle
      ctx.strokeStyle = '#ff0040';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(candleX + (candleW / 4) * i, candleY);
        ctx.lineTo(candleX + (candleW / 4) * (i + 1), candleY + candleH);
        ctx.stroke();
      }

      // Wick
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, candleY);
      ctx.lineTo(cx, candleY - 6 * scale);
      ctx.stroke();

      // Flame
      if (!flameRef.current.extinguished) {
        const flicker = flameRef.current.flicker;
        const fW = 10 * scale * flicker;
        const fH = 18 * scale * flicker;
        const fX = cx;
        const fY = candleY - 6 * scale;

        ctx.shadowBlur = 20 * flicker;
        ctx.shadowColor = 'rgba(255,140,0,0.9)';

        // Outer flame
        const flameGr = ctx.createRadialGradient(fX, fY - fH * 0.3, 1, fX, fY, fH);
        flameGr.addColorStop(0, '#fff700');
        flameGr.addColorStop(0.4, '#ff8c00');
        flameGr.addColorStop(1, 'rgba(255,50,0,0)');
        ctx.fillStyle = flameGr;

        ctx.beginPath();
        ctx.moveTo(fX, fY);
        ctx.bezierCurveTo(fX - fW, fY - fH * 0.5, fX - fW * 0.5, fY - fH, fX, fY - fH);
        ctx.bezierCurveTo(fX + fW * 0.5, fY - fH, fX + fW, fY - fH * 0.5, fX, fY);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    // Flame flicker
    const flickerInterval = setInterval(() => {
      if (!flameRef.current.extinguished) {
        flameRef.current.flicker = 0.9 + Math.random() * 0.2;
      }
    }, 80);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(flickerInterval);
    };
  }, [blown, isMobile, CAKE_SCALE]);

  // Show instruction
  useEffect(() => {
    const t = setTimeout(() => setShowInstruction(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const blowCandle = () => {
    if (blown) return;
    setBlown(true);
    flameRef.current.extinguished = true;

    // Smoke particles & chocolate splash using canvas
    const canvas = cakeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = canvas.width / 2;
    const scale = CAKE_SCALE;
    const t3H = 70 * scale;
    const plateH = 30;
    const t1H = 90 * scale, t2H = 80 * scale;
    const plateY = canvas.height - 30;
    const t1Y = plateY - plateH / 2 - t1H;
    const t2Y = t1Y - t2H - 4;
    const t3Y = t2Y - t3H - 4;
    const candleY = t3Y - 30 * scale;

    // Chocolate droplets
    const droplets: any[] = Array.from({ length: 12 }, (_) => ({
      x: cx,
      y: candleY,
      vx: (Math.random() - 0.5) * 8,
      vy: -(Math.random() * 5 + 2),
      r: Math.random() * 5 + 2,
      gravity: 0.3,
      stuck: false,
    }));

    let frame = 0;
    const dropAnim = setInterval(() => {
      frame++;
      droplets.forEach((d) => {
        if (!d.stuck) {
          d.x += d.vx;
          d.y += d.vy;
          d.vy += d.gravity;
          if (d.y > t3Y || frame > 40) {
            d.stuck = true;
            splotchesRef.current.push({ x: d.x, y: Math.min(d.y, t3Y + 10), r: d.r });
          }
        }
      });
      if (frame > 50) clearInterval(dropAnim);
    }, 20);

    // Confetti
    setTimeout(() => {
      startConfetti();
      setCelebrationText(true);
      // Transition after 4s
      setTimeout(() => {
        if (overlayRef.current) {
          gsap.to(containerRef.current, { y: -50, opacity: 0, duration: 0.5 });
          gsap.to(overlayRef.current, {
            opacity: 1,
            duration: 0.5,
            delay: 0.4,
            onComplete: onComplete,
          });
        }
      }, 4000);
    }, 600);
  };

  const startConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#ff0040', '#00d4ff', '#ffd700', '#b829dd', '#98fb98', '#ff69b4'];
    const isMob = window.innerWidth < 768;
    const count = isMob ? 60 : 120;

    confettiParticlesRef.current = Array.from({ length: count }, () => ({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 5 + 3,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      rotation: Math.random() * Math.PI * 2,
      rotationV: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      isCircle: Math.random() > 0.6,
      opacity: 1,
    }));

    let elapsed = 0;
    const drawConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      elapsed += 16;
      confettiParticlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.isCircle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationV;
        if (elapsed > 3000) p.opacity -= 0.008;
      });
      if (elapsed < 5000) requestAnimationFrame(drawConfetti);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    drawConfetti();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #1a0a10 0%, #0f0508 100%)',
      }}
    >
      {/* BG golden particles */}
      <canvas ref={bgCanvasRef} className="absolute inset-0" style={{ pointerEvents: 'none' }} />

      {/* Confetti canvas */}
      <canvas
        ref={confettiCanvasRef}
        className="absolute inset-0"
        style={{ pointerEvents: 'none', zIndex: 10 }}
      />

      {/* Content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
        style={{
          paddingTop: 'max(20px, env(safe-area-inset-top))',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Celebration text */}
        {celebrationText && (
          <div
            className="font-pacifico text-center fade-in-up glow-gold"
            style={{
              fontSize: 'clamp(18px, 5vw, 24px)',
              color: '#ffd700',
              marginBottom: 8,
              zIndex: 20,
              position: 'relative',
            }}
          >
            🎉 4 أشهر من الحب والجنون 🎉
          </div>
        )}

        {/* Cake canvas */}
        <div
          style={{
            position: 'relative',
            cursor: blown ? 'default' : 'pointer',
            zIndex: 5,
          }}
          onClick={blowCandle}
          onTouchStart={blowCandle}
        >
          <canvas
            ref={cakeCanvasRef}
            style={{
              display: 'block',
              filter: celebrationText ? 'drop-shadow(0 0 30px rgba(255,0,64,0.5))' : 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))',
              transition: 'filter 1s',
            }}
          />
        </div>

        {/* Instruction */}
        {!blown && (
          <p
            className="font-cairo text-white text-center"
            style={{
              fontSize: 'clamp(15px, 4vw, 18px)',
              opacity: showInstruction ? 1 : 0,
              transition: 'opacity 0.8s',
              margin: 0,
              zIndex: 5,
              position: 'relative',
            }}
          >
            انفخي الشمعة يا ماسه 🕯️
          </p>
        )}
      </div>

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

export default Cake;
