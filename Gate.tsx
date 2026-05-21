import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

interface GateProps {
  onUnlock: () => void;
}

const Gate: React.FC<GateProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [borderColor, setBorderColor] = useState('rgba(255,255,255,0.3)');
  const [inputFocused, setInputFocused] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);

  // Particle system
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
    const count = isMobile ? 18 : 28;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.3 + 0.08),
      opacity: Math.random() * 0.35 + 0.1,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    const draw = () => {
      t += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        const twinkle = p.opacity * (0.8 + Math.sin(t + p.phase) * 0.2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
      });
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Show hint after 3 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = useCallback(() => {
    if (unlocking) return;
    const val = password.trim().toLowerCase().replace(/\s/g, '');
    const valid = ['ماسه', 'ماسة', 'masaa', 'masa', 'masah'].includes(val);

    if (valid) {
      setUnlocking(true);
      setBorderColor('#00ff88');

      // Lock unlock sequence
      gsap.timeline()
        .to('.lock-icon', { rotation: 15, duration: 0.2, ease: 'power2.out' })
        .to('.lock-icon', { rotation: 0, scale: 1.2, duration: 0.3, ease: 'bounce.out' })
        .to('.lock-icon', { opacity: 0, y: -10, duration: 0.4, delay: 0.1 });

      // Card fade out
      setTimeout(() => {
        gsap.to(cardRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: 0.6,
          ease: 'power2.inOut',
        });
        setTimeout(() => {
          if (overlayRef.current) {
            gsap.to(overlayRef.current, {
              opacity: 1,
              duration: 0.5,
              ease: 'power2.inOut',
              onComplete: onUnlock,
            });
          }
        }, 500);
      }, 600);

    } else {
      setShaking(true);
      setBorderColor('#ff0040');
      gsap.fromTo('.gate-vignette', { opacity: 0 }, { opacity: 1, duration: 0.15, yoyo: true, repeat: 3 });
      setTimeout(() => {
        setShaking(false);
        setBorderColor(inputFocused ? '#ff0040aa' : 'rgba(255,255,255,0.3)');
        setTimeout(() => setBorderColor(inputFocused ? 'rgba(255,0,64,0.6)' : 'rgba(255,255,255,0.3)'), 200);
      }, 450);
    }
  }, [password, unlocking, onUnlock, inputFocused]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ minHeight: '100dvh', background: '#000' }}>
      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/gate-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.65)' }}
      />

      {/* Color vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10,0,20,0.6) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Wrong password vignette */}
      <div
        className="gate-vignette absolute inset-0 opacity-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255,0,64,0.25) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{ pointerEvents: 'none' }} />

      {/* Content */}
      <div
        className="absolute inset-0 flex items-center justify-center px-4"
        style={{
          paddingTop: 'max(20px, env(safe-area-inset-top))',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        }}
      >
        <div
          ref={cardRef}
          className="w-full flex flex-col items-center gap-5"
          style={{
            maxWidth: 420,
            padding: 'clamp(28px, 8vw, 44px)',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 28,
            boxShadow: '0 0 80px rgba(0,0,0,0.5), 0 0 40px rgba(184,41,221,0.1)',
          }}
        >
          {/* Lock icon */}
          <div
            className="lock-icon lock-pulse"
            style={{
              fontSize: 'clamp(36px, 9vw, 48px)',
              lineHeight: 1,
              filter: 'drop-shadow(0 0 16px rgba(255,255,255,0.5))',
            }}
          >
            🔒
          </div>

          {/* Title */}
          <div className="text-center">
            <h1
              className="font-orbitron text-white"
              style={{
                fontSize: 'clamp(16px, 5vw, 22px)',
                letterSpacing: '4px',
                margin: 0,
                textShadow: '0 0 30px rgba(255,255,255,0.4)',
              }}
            >
              مدينة د.ديا
            </h1>
            <p
              className="font-cairo"
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.55)',
                margin: '8px 0 0',
                letterSpacing: 1,
              }}
            >
              البوابة مقفلة
            </p>
          </div>

          {/* Divider */}
          <div style={{ width: '60%', height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)' }} />

          {/* Input */}
          <div className="w-full">
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setInputFocused(true);
                if (borderColor !== '#00ff88' && borderColor !== '#ff0040') {
                  setBorderColor('rgba(255,0,64,0.6)');
                }
              }}
              onBlur={() => {
                setInputFocused(false);
                if (borderColor !== '#00ff88' && borderColor !== '#ff0040') {
                  setBorderColor('rgba(255,255,255,0.3)');
                }
              }}
              placeholder="كلمة السر..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              className={`w-full font-cairo ${shaking ? 'shake' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${borderColor}`,
                color: '#fff',
                fontSize: 18,
                padding: '14px 4px',
                outline: 'none',
                textAlign: 'center',
                direction: 'rtl',
                transition: 'border-color 0.3s, box-shadow 0.3s',
                boxShadow: borderColor === '#ff0040'
                  ? '0 4px 12px rgba(255,0,64,0.25)'
                  : borderColor === '#00ff88'
                    ? '0 4px 12px rgba(0,255,136,0.25)'
                    : 'none',
                width: '100%',
                minHeight: 56,
              }}
            />
          </div>

          {/* Hint */}
          <p
            className="font-cairo text-center"
            style={{
              fontSize: 12,
              color: '#ff6b6b',
              opacity: showHint ? 0.85 : 0,
              transition: 'opacity 1.2s ease',
              margin: '-8px 0 0',
            }}
          >
            تلميح: اسمها الحقيقي 💎
          </p>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="touch-target font-cairo w-full"
            style={{
              background: 'linear-gradient(135deg, #ff0040 0%, #b829dd 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 50,
              fontSize: 18,
              fontWeight: 700,
              padding: '18px 32px',
              minHeight: 58,
              cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(255,0,64,0.35)',
              letterSpacing: 1,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 36px rgba(255,0,64,0.5)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(255,0,64,0.35)';
            }}
          >
            ادخلي ✨
          </button>

          {/* LGBTQ decoration */}
          <div style={{ fontSize: 18, opacity: 0.7 }}>🏳️‍🌈</div>
        </div>
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

export default Gate;
