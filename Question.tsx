import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

interface QuestionProps {
  onYes: () => void;
}

const Question: React.FC<QuestionProps> = ({ onYes }) => {
  const [noText, setNoText] = useState('لا');
  const [_noEvasions, setNoEvasions] = useState(0);
  void _noEvasions;
  const [showSadMsg, setShowSadMsg] = useState(false);
  const [sadMsgText, setSadMsgText] = useState('');
  const [yesPulse, setYesPulse] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const yesRef = useRef<HTMLButtonElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);
  const evasionCountRef = useRef(0);
  const sadMsg = 'مش بتحبيني يوسخه؟ شكرا';
  const noTexts = ['لا', 'مش هينفع', 'استحالة', 'جربي تاني', '😂'];

  // Hearts canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 25 : 60;

    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight + window.innerHeight,
      size: isMobile ? Math.random() * 10 + 5 : Math.random() * 14 + 4,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(Math.random() * 0.8 + 0.3),
      opacity: Math.random() * 0.7 + 0.3,
      color: Math.random() > 0.5 ? '#ff0040' : '#ff6b6b',
      grayed: false,
    }));

    const drawHeart = (x: number, y: number, size: number, color: string, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.3);
      ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.6);
      ctx.bezierCurveTo(x - size, y + size * 1.1, x, y + size * 1.4, x, y + size * 1.6);
      ctx.bezierCurveTo(x, y + size * 1.4, x + size, y + size * 1.1, x + size, y + size * 0.6);
      ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3);
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach((p) => {
        const col = p.grayed ? '#444' : p.color;
        drawHeart(p.x, p.y, p.size, col, p.opacity);
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -60) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    // Timeout - 4 seconds
    const sadTimeout = setTimeout(() => {
      setShowSadMsg(true);
      setYesPulse(true);
      particlesRef.current.forEach((p) => { p.grayed = true; });
      setTimeout(() => {
        particlesRef.current.forEach((p) => { p.grayed = false; });
      }, 2000);
    }, 4000);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      clearTimeout(sadTimeout);
    };
  }, []);

  // Typing effect for sad message
  useEffect(() => {
    if (!showSadMsg) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= sadMsg.length) {
        setSadMsgText(sadMsg.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [showSadMsg]);

  const evadeNo = useCallback(() => {
    const btn = noRef.current;
    if (!btn) return;

    const bw = btn.offsetWidth;
    const bh = btn.offsetHeight;
    const margin = 20;
    const safeTop = 80;

    const maxX = window.innerWidth - bw - margin;
    const maxY = window.innerHeight - bh - margin;

    const newX = Math.max(margin, Math.random() * maxX);
    const newY = Math.max(safeTop, Math.random() * maxY);

    const rot = (Math.random() - 0.5) * 30;

    gsap.to(btn, {
      position: 'fixed',
      left: newX,
      top: newY,
      rotation: rot,
      duration: 0.15,
      ease: 'power4.out',
      onComplete: () => {
        gsap.to(btn, { rotation: 0, duration: 0.2 });
      },
    });

    evasionCountRef.current += 1;
    setNoEvasions(evasionCountRef.current);
    if (evasionCountRef.current >= 5) {
      setNoText(noTexts[Math.floor(Math.random() * noTexts.length)]);
    }
  }, []);

  const handleYes = useCallback(() => {
    const yes = yesRef.current;
    if (!yes) return;

    // Burst hearts
    particlesRef.current.forEach((p) => {
      p.vy = -(Math.random() * 5 + 3);
      p.vx = (Math.random() - 0.5) * 4;
    });

    // Yes button expands
    gsap.to(yes, {
      scale: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.in',
    });

    // Show bubble
    setTimeout(() => {
      const bubble = document.createElement('div');
      bubble.innerHTML = '<span style="font-family: Pacifico, cursive; font-size: clamp(20px, 5vw, 28px); color: #fff; text-shadow: 0 0 20px rgba(255,0,64,0.4);">وأنا بموت فيكي ❤️</span>';
      Object.assign(bubble.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) scale(0)',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,0,64,0.3)',
        borderRadius: '30px',
        padding: '28px 40px',
        textAlign: 'center',
        zIndex: '999',
        maxWidth: '90vw',
        boxShadow: '0 0 60px rgba(255,0,64,0.2)',
      });
      document.body.appendChild(bubble);

      gsap.to(bubble, {
        scale: 1,
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)',
      });

      setTimeout(() => {
        gsap.to(bubble, {
          opacity: 0,
          scale: 0.9,
          duration: 0.5,
          onComplete: () => {
            bubble.remove();
            if (overlayRef.current) {
              gsap.to(overlayRef.current, {
                opacity: 1,
                duration: 0.4,
                onComplete: onYes,
              });
            }
          },
        });
      }, 2500);
    }, 700);
  }, [onYes]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ minHeight: '100dvh', background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a1a 100%)' }}
    >
      {/* Hearts canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{ pointerEvents: 'none' }} />

      {/* Content */}
      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        style={{
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        <div
          ref={cardRef}
          className="w-full flex flex-col items-center gap-6"
          style={{
            maxWidth: 500,
            padding: 'clamp(24px, 6vw, 36px)',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24,
          }}
        >
          {/* Emoji */}
          <div style={{ fontSize: 'clamp(48px, 12vw, 72px)', lineHeight: 1 }}>🥺</div>

          {/* Question */}
          <h2
            className="font-pacifico text-white text-center"
            style={{
              fontSize: 'clamp(22px, 7vw, 32px)',
              margin: 0,
              lineHeight: 1.4,
              textShadow: '0 0 20px rgba(255,0,64,0.3)',
              direction: 'rtl',
            }}
          >
            بتحبيني ولا لا؟
          </h2>

          {/* Sad message */}
          {showSadMsg && (
            <p
              className="font-cairo text-center"
              style={{ fontSize: 15, color: '#ff6b6b', fontStyle: 'italic', margin: '-8px 0', minHeight: 24, direction: 'rtl' }}
            >
              {sadMsgText}
            </p>
          )}

          {/* YES button */}
          <button
            ref={yesRef}
            onClick={handleYes}
            className="touch-target font-cairo w-full"
            style={{
              background: 'linear-gradient(135deg, #ff0040, #b829dd)',
              color: '#fff',
              border: 'none',
              borderRadius: 50,
              fontSize: 'clamp(18px, 5vw, 20px)',
              fontWeight: 700,
              padding: '18px 40px',
              minHeight: 60,
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(255,0,64,0.4)',
              animation: yesPulse ? 'heart-pulse 1s ease-in-out infinite' : 'none',
              direction: 'rtl',
              maxWidth: 320,
            }}
          >
            بتحبيني 💕
          </button>

          <p className="font-cairo" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: '-12px 0' }}>
            (اضغطي الزر التاني على مسؤوليتك 😂)
          </p>
        </div>
      </div>

      {/* NO button (evading, outside card, positioned freely) */}
      <button
        ref={noRef}
        onMouseEnter={evadeNo}
        onTouchStart={evadeNo}
        onClick={evadeNo}
        className="touch-target font-cairo"
        style={{
          position: 'fixed',
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#2a2a2a',
          color: '#555',
          border: '1px solid #333',
          borderRadius: 50,
          fontSize: 16,
          padding: '12px 32px',
          minHeight: 48,
          cursor: 'pointer',
          zIndex: 200,
          whiteSpace: 'nowrap',
        }}
      >
        {noText}
      </button>

      {/* Transition overlay */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0a0a0f',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 1000,
        }}
      />
    </div>
  );
};

export default Question;
