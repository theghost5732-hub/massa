import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface FinalProps {
  onBack: () => void;
}

const FINAL_TEXT = `معرفش اي المميز ف ان احنا عدينا 4 شهور سوا

بس ممكن عشان عدينا ب 120 يوم
واحسب الدقايق والثواني لحد انهارده

بقالنا 120 يوم و 2880 ساعه و 172800 دقيقه سوا
وجنب بعض وبنفكر سوا وبنعاند سوا

عايز اقولك انها احسن ايام حياتي

و اه انا تعبان فالويب ده بقالي 6 ايام عايز مقابل 😂😭

عمتا فداكي اي حاجه
ضحكتك عندي بالدنيا كلها يماسه ❤️`;

const START_DATE = new Date('2026-01-22T00:00:00');

const getTimeElapsed = () => {
  const now = new Date();
  const diff = Math.max(0, now.getTime() - START_DATE.getTime());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
};

const Final: React.FC<FinalProps> = ({ onBack }) => {
  const [time, setTime] = useState(getTimeElapsed());
  const [letterText, setLetterText] = useState('');
  const [letterDone, setLetterDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const letterScrollRef = useRef<HTMLDivElement>(null);

  // Live counter
  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeElapsed()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Animated background canvas
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
    const heartCount = isMobile ? 18 : 38;
    const starCount = isMobile ? 28 : 58;

    const hearts = Array.from({ length: heartCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * (isMobile ? 12 : 18) + 6,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.008,
      color: ['#ff0040', '#ff6b6b', '#c87dd4', '#ff69b4'][Math.floor(Math.random() * 4)],
      vy: -(Math.random() * 0.15 + 0.05),
    }));

    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.75,
      r: Math.random() * 1.8 + 0.4,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.025 + 0.01,
      gold: Math.random() < 0.15,
    }));

    // Shooting star state
    let ssActive = false;
    let ssProgress = 0;
    let ssNextTime = Date.now() + 8000 + Math.random() * 7000;

    const drawHeart = (x: number, y: number, size: number, color: string, opacity: number) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, opacity);
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

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Pulsing hearts
      hearts.forEach((h) => {
        const pulse = 0.65 + Math.sin(t * h.speed * 60 + h.phase) * 0.35;
        drawHeart(h.x, h.y, h.size * pulse, h.color, 0.3 * pulse);
        h.y += h.vy;
        if (h.y < -40) { h.y = canvas.height + 20; h.x = Math.random() * canvas.width; }
      });

      // Twinkling stars
      stars.forEach((s) => {
        const twinkle = 0.25 + Math.abs(Math.sin(t * s.speed * 60 + s.phase)) * 0.75;
        ctx.save();
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = s.gold ? '#ffd700' : '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Moon (top right)
      const moonX = canvas.width * 0.87 + Math.sin(t * 0.1) * 8;
      const moonY = canvas.height * 0.1;
      ctx.save();
      ctx.shadowBlur = 35;
      ctx.shadowColor = 'rgba(255,250,180,0.6)';
      ctx.fillStyle = '#fffacd';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
      ctx.fill();
      // Crescent cutout
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(moonX + 10, moonY - 3, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.shadowBlur = 0;
      ctx.restore();

      // Shooting star
      const now = Date.now();
      if (!ssActive && now > ssNextTime) {
        ssActive = true;
        ssProgress = 0;
      }
      if (ssActive) {
        ssProgress += 0.018;
        const sx = ssProgress * canvas.width;
        const sy = ssProgress * canvas.height * 0.45;
        const trailLen = 80;
        const grad = ctx.createLinearGradient(sx - trailLen, sy - trailLen * 0.45, sx, sy);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, 'rgba(255,255,255,0.85)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sx - trailLen, sy - trailLen * 0.45);
        ctx.lineTo(sx, sy);
        ctx.stroke();
        if (ssProgress > 1) {
          ssActive = false;
          ssNextTime = now + 8000 + Math.random() * 7000;
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Typewriter for final message
  useEffect(() => {
    let i = 0;
    let tid: ReturnType<typeof setTimeout>;
    const isMobile = window.innerWidth < 768;

    const type = () => {
      if (i >= FINAL_TEXT.length) {
        setLetterDone(true);
        return;
      }
      setLetterText(FINAL_TEXT.slice(0, i + 1));
      if (letterScrollRef.current) {
        letterScrollRef.current.scrollTop = letterScrollRef.current.scrollHeight;
      }
      const ch = FINAL_TEXT[i];
      let delay = isMobile ? 55 : 45;
      if (ch === '،' || ch === ',') delay = 280;
      else if (ch === '.' || ch === '؟' || ch === '!') delay = 580;
      else if (ch === '\n') delay = 380;
      i++;
      tid = setTimeout(type, delay);
    };

    const start = setTimeout(type, 800);
    return () => { clearTimeout(start); clearTimeout(tid); };
  }, []);

  const handleBack = () => {
    if (overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.6,
        ease: 'power4.in',
        onComplete: onBack,
      });
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  const counterUnits = [
    { value: time.days, label: 'أيام' },
    { value: time.hours, label: 'ساعات' },
    { value: time.minutes, label: 'دقايق' },
    { value: time.seconds, label: 'ثواني' },
  ];

  return (
    <div
      className="relative w-full"
      style={{
        minHeight: '100dvh',
        background: 'radial-gradient(ellipse at 30% 40%, #0d0a1f 0%, #1a0a1a 60%, #0a0a0f 100%)',
      }}
    >
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{ pointerEvents: 'none' }} />

      {/* Vignette */}
      <div className="vignette absolute inset-0" style={{ pointerEvents: 'none' }} />

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="relative overflow-y-auto"
        style={{
          minHeight: '100dvh',
          paddingTop: 'max(24px, env(safe-area-inset-top))',
          paddingBottom: 'max(90px, calc(env(safe-area-inset-bottom) + 80px))',
          paddingLeft: 'max(14px, env(safe-area-inset-left))',
          paddingRight: 'max(14px, env(safe-area-inset-right))',
        }}
      >
        <div
          className="flex flex-col items-center gap-5 mx-auto"
          style={{ maxWidth: 680 }}
        >

          {/* Header */}
          <div className="text-center">
            <div style={{ fontSize: 'clamp(28px, 8vw, 40px)', marginBottom: 4 }}>🌙✨</div>
            <h2
              className="font-orbitron text-white"
              style={{
                fontSize: 'clamp(14px, 4vw, 20px)',
                letterSpacing: 3,
                margin: 0,
                textShadow: '0 0 20px rgba(184,41,221,0.5)',
              }}
            >
              TOWN OF DR.DIA
            </h2>
          </div>

          {/* Counter label */}
          <p
            className="font-cairo text-center"
            style={{ fontSize: 'clamp(14px, 4vw, 17px)', color: 'rgba(255,255,255,0.65)', margin: 0 }}
          >
            بقالنا سوا... ❤️
          </p>

          {/* Counter container */}
          <div
            className="w-full"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: 'clamp(16px, 4vw, 28px)',
              boxShadow: '0 0 40px rgba(184,41,221,0.1)',
            }}
          >
            <div
              className="grid grid-cols-2 gap-3"
              style={{ direction: 'ltr' }}
            >
              {counterUnits.map((unit, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,0,64,0.25)',
                    borderRadius: 14,
                    padding: 'clamp(12px, 3vw, 18px) 8px',
                    transition: 'all 0.3s',
                  }}
                >
                  <span
                    className="font-orbitron text-white"
                    style={{
                      fontSize: 'clamp(28px, 8vw, 44px)',
                      fontWeight: 700,
                      letterSpacing: '2px',
                      textShadow: idx === 3
                        ? '0 0 20px rgba(255,0,64,0.7)'
                        : '0 0 15px rgba(255,0,64,0.35)',
                      lineHeight: 1.1,
                      display: 'block',
                      minWidth: 60,
                      textAlign: 'center',
                    }}
                  >
                    {pad(unit.value)}
                  </span>
                  <span
                    className="font-cairo"
                    style={{ fontSize: 12, color: '#ff6b6b', marginTop: 6, direction: 'rtl' }}
                  >
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            {/* LGBTQ decoration */}
            <div
              className="flex justify-center items-center gap-2 mt-3"
              style={{ fontSize: 'clamp(16px, 5vw, 22px)' }}
            >
              🏳️‍🌈 ❤️ 🏳️‍🌈
            </div>
          </div>

          {/* Final letter */}
          <div
            className="message-container w-full"
            style={{
              background: 'rgba(15,8,20,0.78)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,0,64,0.15)',
              borderRadius: 20,
              padding: 'clamp(18px, 5vw, 30px)',
              boxShadow: '0 0 50px rgba(255,0,64,0.06)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 'clamp(22px, 6vw, 30px)' }}>💌</span>
              <p className="font-cairo" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
                رسالة أخيرة
              </p>
            </div>
            <div ref={letterScrollRef}>
              <p
                className="font-indie"
                style={{
                  fontSize: 'clamp(16px, 4.5vw, 20px)',
                  lineHeight: 2.1,
                  color: '#fff5f5',
                  textAlign: 'center',
                  direction: 'rtl',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  textShadow: letterDone ? '0 0 20px rgba(255,0,64,0.18)' : 'none',
                  transition: 'text-shadow 1s',
                }}
              >
                {letterText}
                {!letterDone && (
                  <span className="typewriter-cursor">_</span>
                )}
              </p>
            </div>
          </div>

          {/* Heart bottom */}
          {letterDone && (
            <div
              className="text-center fade-in-up"
              style={{ fontSize: 'clamp(24px, 7vw, 36px)', marginBottom: 8 }}
            >
              ❤️ 🏳️‍🌈 ❤️
            </div>
          )}

        </div>
      </div>

      {/* Back button */}
      <div
        style={{
          position: 'fixed',
          bottom: 'max(24px, env(safe-area-inset-bottom))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span
          className="font-cairo"
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            display: 'block',
          }}
        >
          العودة للبداية
        </span>
        <button
          onClick={handleBack}
          className="touch-target"
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff',
            fontSize: 22,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.transform = 'scale(1.1)';
            el.style.boxShadow = '0 0 24px rgba(255,0,64,0.5)';
            el.style.borderColor = 'rgba(255,0,64,0.5)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.transform = 'scale(1)';
            el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
            el.style.borderColor = 'rgba(255,255,255,0.12)';
          }}
        >
          ↩
        </button>
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
          zIndex: 1000,
        }}
      />
    </div>
  );
};

export default Final;
