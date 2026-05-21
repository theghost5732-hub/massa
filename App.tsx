import React, { useState, useCallback } from 'react';
import Gate from './pages/Gate';
import Question from './pages/Question';
import Letter from './pages/Letter';
import Cake from './pages/Cake';
import Cartoon from './pages/Cartoon';
import Final from './pages/Final';
import './index.css';

type Page = 'gate' | 'question' | 'letter' | 'cake' | 'cartoon' | 'final';

const PAGE_LABELS: Record<Page, string> = {
  gate: '🔒',
  question: '🥺',
  letter: '💌',
  cake: '🎂',
  cartoon: '🐻',
  final: '❤️',
};

const ORDERED_PAGES: Page[] = ['gate', 'question', 'letter', 'cake', 'cartoon', 'final'];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('gate');
  const [isTransitioning, setIsTransitioning] = useState(false);


  const navigateTo = useCallback((page: Page) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentPage(page);
      setIsTransitioning(false);
      window.scrollTo(0, 0);
    }, 100);
  }, [isTransitioning]);

  const handleUnlock = useCallback(() => navigateTo('question'), [navigateTo]);
  const handleYes = useCallback(() => navigateTo('letter'), [navigateTo]);
  const handleLetterComplete = useCallback(() => navigateTo('cake'), [navigateTo]);
  const handleCakeComplete = useCallback(() => navigateTo('cartoon'), [navigateTo]);
  const handleCartoonComplete = useCallback(() => navigateTo('final'), [navigateTo]);
  const handleBack = useCallback(() => navigateTo('gate'), [navigateTo]);

  const pageIndex = ORDERED_PAGES.indexOf(currentPage);
  const showDots = currentPage !== 'gate';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0a0f',
        overflow: 'hidden',
      }}
    >
      {/* Progress indicator — subtle dots on the right */}
      {showDots && (
        <div
          style={{
            position: 'fixed',
            right: 'max(10px, env(safe-area-inset-right))',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            zIndex: 999,
          }}
        >
          {ORDERED_PAGES.slice(1).map((p, i) => (
            <div
              key={p}
              title={PAGE_LABELS[p]}
              style={{
                width: i === pageIndex - 1 ? 8 : 5,
                height: i === pageIndex - 1 ? 8 : 5,
                borderRadius: '50%',
                background: i === pageIndex - 1
                  ? '#ff0040'
                  : i < pageIndex - 1
                    ? 'rgba(255,0,64,0.35)'
                    : 'rgba(255,255,255,0.2)',
                transform: i === pageIndex - 1 ? 'scale(1)' : 'scale(1)',
                transition: 'all 0.4s ease',
                boxShadow: i === pageIndex - 1 ? '0 0 8px rgba(255,0,64,0.7)' : 'none',
              }}
            />
          ))}
        </div>
      )}

      {/* Pages */}
      {currentPage === 'gate' && <Gate onUnlock={handleUnlock} />}
      {currentPage === 'question' && <Question onYes={handleYes} />}
      {currentPage === 'letter' && <Letter onComplete={handleLetterComplete} />}
      {currentPage === 'cake' && <Cake onComplete={handleCakeComplete} />}
      {currentPage === 'cartoon' && <Cartoon onComplete={handleCartoonComplete} />}
      {currentPage === 'final' && <Final onBack={handleBack} />}
    </div>
  );
};

export default App;
