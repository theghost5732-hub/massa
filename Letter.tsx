import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface LetterProps {
  onComplete: () => void;
}

const LETTER_TEXT = `همم مش عارف اجيبهالك ازاي بس انا حبيتك واتعلقت بيكي وحبيتك فشخ كمان

اه عارف انك مش بتحبي اني اقول عليكي حبيبتي
بس انتي صاحبتي وحبيبتي وبيستي فور ايفر وبير اسراري

انا اكتشفت نفسي معاكي اساسا
وبقيت احب وقتي معاكي فشخ
وبيبقى اسعد اوقات حياتي

اه بنقعد نبضن ع بعض بالساعات
وبتزعليني كتير وبتيجي عليا اكتر
بس عادي كله فداكي

انا وانتي ملناش غير بعض
(لحد ما تلاقيلك مامي يعني 😂)

خليكي عارفه يجزمه اني بحبك دايما
وهفضل جنبك وساندك
وهفضل اتجنن معاكي ونعمل كل حاجه سوا
لحد ما كل واحد فينا يبقى عنده منظمته

و اه انتي ماسه بحق وحقيقي مش مجرد اسم
ماسه غاليه بجد يماسه
مش اي حد ينفع يمتلكها
ميمتلكهاش غير اللي يستاهلها
واللي هي توافق عليه وتفتحلو قلبها

وأنا عمتا محظوظ فشخ بيكي يماستي
بحبك دايما يا احلى ليسبيان فالدنيا ❤️`;

const Letter: React.FC<LetterProps> = ({ onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hearts particle canvas
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
    const count = isMobile ? 40 : 120;

    const colors = ['#ff0040', '#ff6b6b', '#ffd700', '#b829dd', '#ff69b4'];
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight + window.innerHeight * 0.3,
      size: Math.random() * (isMobile ? 8 : 10) + 3,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(Math.random() * 0.5 + 0.15),
      opacity: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      phase: Math.random() * Math.PI * 2,
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

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.01;
      particles.forEach((p) => {
        const twinkle = Math.sin(t + p.phase) * 0.2 + p.opacity;
        drawHeart(p.x, p.y, p.size, p.color, Math.max(0, Math.min(1, twinkle)));
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -40) {
          p.y = canvas.height + 20;
          p.x = Math.random() * canvas.width;
        }
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Typewriter effect
  useEffect(() => {
    let charIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;
    const isMobile = window.innerWidth < 768;

    const typeNext = () => {
      if (charIndex >= LETTER_TEXT.length) {
      setIsComplete(true);
        // After completion, trigger page transition
        setTimeout(() => {
          if (letterRef.current) {
            gsap.to(letterRef.current, {
              opacity: 0,
              scale: 0.95,
              duration: 0.8,
              ease: 'power2.inOut',
            });
          }
          setTimeout(() => {
            if (overlayRef.current) {
              gsap.to(overlayRef.current, {
                opacity: 1,
                duration: 0.5,
                onComplete: onComplete,
              });
            }
          }, 700);
        }, 2000);
        return;
      }

      const char = LETTER_TEXT[charIndex];
      setDisplayedText(LETTER_TEXT.slice(0, charIndex + 1));
      charIndex++;

      // Auto-scroll
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }

      // Timing per character
      let delay = isMobile ? 55 : 45;
      if (char === '،' || char === ',') delay = 300;
      else if (char === '.' || char === '!' || char === '؟' || char === '?') delay = 600;
      else if (char === '\n') delay = 400;

      timeoutId = setTimeout(typeNext, delay);
    };

    // Start typing after a brief delay
    const startDelay = setTimeout(() => typeNext(), 800);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timeoutId);
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{
        minHeight: '100dvh',
        background: 'radial-gradient(ellipse at center, #1a0510 0%, #0a0a0f 80%)',
      }}
    >
      {/* Hearts canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" style={{ pointerEvents: 'none' }} />

      {/* Vignette */}
      <div className="vignette absolute inset-0" style={{ pointerEvents: 'none' }} />

      {/* Letter container */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          padding: 'env(safe-area-inset-top, 16px) 16px env(safe-area-inset-bottom, 16px)',
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        <div
          ref={letterRef}
          className="letter-container w-full"
          style={{
            maxWidth: 700,
            maxHeight: '85dvh',
            background: 'rgba(20,10,15,0.75)',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            border: '1px solid rgba(255,0,64,0.2)',
            borderRadius: 20,
            boxShadow: '0 0 60px rgba(255,0,64,0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: 'clamp(16px, 4vw, 24px) clamp(16px, 4vw, 32px) 8px',
              textAlign: 'center',
              borderBottom: '1px solid rgba(255,0,64,0.15)',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 'clamp(24px, 6vw, 32px)' }}>💌</div>
            <p
              className="font-cairo"
              style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}
            >
              رسالة من القلب
            </p>
          </div>

          {/* Scrollable text area */}
          <div
            ref={scrollRef}
            style={{
              overflowY: 'auto',
              padding: 'clamp(16px, 4vw, 32px)',
              flex: 1,
            }}
          >
            <p
              className="font-indie"
              style={{
                fontSize: 'clamp(17px, 4.5vw, 22px)',
                lineHeight: 2.1,
                color: '#fff5f5',
                textAlign: 'center',
                direction: 'rtl',
                margin: 0,
                whiteSpace: 'pre-wrap',
                textShadow: isComplete ? '0 0 20px rgba(255,0,64,0.2)' : 'none',
                transition: 'text-shadow 1s',
              }}
            >
              {displayedText}
              {!isComplete && (
                <span className="typewriter-cursor" style={{ fontSize: 'clamp(17px, 4.5vw, 22px)' }}>
                  _
                </span>
              )}
            </p>
          </div>
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

export default Letter;
