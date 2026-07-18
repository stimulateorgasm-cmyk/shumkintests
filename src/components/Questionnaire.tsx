import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RefreshCw, ChevronRight, ChevronLeft, HelpCircle, Heart } from 'lucide-react';
import { Test, Question, Option } from '../types';
import { getSupportMessage } from '../data/supportMessages';

// Helper to get custom colorful option classes based on test theme and option scale
function getOptionColors(testId: string, oIdx: number, totalOptions: number, isSelected: boolean) {
  // RPP / Burnout / 5 Options
  if (testId === 'rpp' || testId === 'burnout' || totalOptions === 5) {
    const rppColors = [
      // 0: Green (Very positive/safe)
      {
        unselected: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/80',
        selected: 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/15'
      },
      // 1: Teal/Mint
      {
        unselected: 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/50 text-teal-800 dark:text-teal-300 hover:bg-teal-100/80',
        selected: 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-500/15'
      },
      // 2: Yellow/Amber
      {
        unselected: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100/80',
        selected: 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/15'
      },
      // 3: Orange
      {
        unselected: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50 text-orange-800 dark:text-orange-300 hover:bg-orange-100/80',
        selected: 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/15'
      },
      // 4: Red
      {
        unselected: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 hover:bg-rose-100/80',
        selected: 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-500/15'
      }
    ];
    return rppColors[oIdx] || rppColors[2];
  }

  // Shumkin Scale (4 Options)
  if (testId === 'female-shumkin' || testId === 'male-shumkin' || totalOptions === 4) {
    const shumkinColors = [
      // 0: Red (Score 1 - High Block/Anxiety)
      {
        unselected: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 hover:bg-rose-100/80',
        selected: 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-500/15'
      },
      // 1: Orange (Score 2)
      {
        unselected: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50 text-orange-800 dark:text-orange-300 hover:bg-orange-100/80',
        selected: 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/15'
      },
      // 2: Yellow/Amber (Score 3)
      {
        unselected: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100/80',
        selected: 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/15'
      },
      // 3: Green/Free (Score 4)
      {
        unselected: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/80',
        selected: 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/15'
      }
    ];
    return shumkinColors[oIdx] || shumkinColors[3];
  }

  // Best Lover (3 Options)
  if (totalOptions === 3) {
    const bestLoverColors = [
      // 0: Red
      {
        unselected: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 hover:bg-rose-100/80',
        selected: 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-500/15'
      },
      // 1: Amber
      {
        unselected: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 hover:bg-amber-100/80',
        selected: 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/15'
      },
      // 2: Green
      {
        unselected: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/80',
        selected: 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/15'
      }
    ];
    return bestLoverColors[oIdx] || bestLoverColors[1];
  }

  // General Fallback
  return {
    unselected: 'bg-white/90 border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200 hover:bg-white',
    selected: 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-lg'
  };
}

interface QuestionnaireProps {
  test: Test;
  onBack: () => void;
  onFinish: (answers: Record<number, number>) => void;
}

export default function Questionnaire({ test, onBack, onFinish }: QuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [activeSupportMessage, setActiveSupportMessage] = useState<string | null>(null);

  const currentQuestion = test.questions[currentIndex];
  const totalQuestions = test.questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  // Trigger light Telegram haptic tap if available
  const triggerHaptic = () => {
    if (typeof window !== 'undefined') {
      // Standard navigator vibration
      if (window.navigator?.vibrate) {
        window.navigator.vibrate(10);
      }
      // Telegram WebApp Haptic
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
      }
    }
  };

  // Automatically clear the support toast after 1.8 seconds
  useEffect(() => {
    if (activeSupportMessage) {
      const timer = setTimeout(() => {
        setActiveSupportMessage(null);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [activeSupportMessage]);

  const handleSelectOption = (score: number) => {
    triggerHaptic();
    const updatedAnswers = { ...answers, [currentQuestion.id]: score };
    setAnswers(updatedAnswers);

    // Get non-blocking floating support message for any test
    const supportMessage = getSupportMessage(test.id, currentQuestion.id, score, currentIndex, totalQuestions);
    if (supportMessage) {
      setActiveSupportMessage(supportMessage);
    }

    // Always transition immediately to the next question with a small delay (220ms) for visual selection feedback
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setDirection('forward');
        setCurrentIndex(currentIndex + 1);
      } else {
        onFinish(updatedAnswers);
      }
    }, 220);
  };

  const handlePrev = () => {
    setActiveSupportMessage(null);
    if (currentIndex > 0) {
      triggerHaptic();
      setDirection('backward');
      setCurrentIndex(currentIndex - 1);
    } else {
      onBack();
    }
  };

  const options: Option[] = currentQuestion.options || test.globalOptions || [];

  // Slide/Fade variants
  const variants = {
    enter: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: 'forward' | 'backward') => ({
      x: dir === 'forward' ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div id="questionnaire-viewport" className="w-full flex flex-col min-h-[92vh] max-w-md mx-auto justify-between p-4 font-sans selection:bg-rose-500/20">
      {/* Header Info */}
      <div id="test-header" className="flex items-center gap-2 mb-3">
        <button
          id="btn-back-header"
          onClick={handlePrev}
          className="flex items-center justify-center p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 dark:text-zinc-400"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span id="test-progress-text" className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
          Вопрос {currentIndex + 1} из {totalQuestions}
        </span>
      </div>

      {/* Progress bar container */}
      <div id="test-progress-container" className="w-full h-1.5 rounded-full mb-6 overflow-hidden relative" style={{ backgroundColor: `${test.theme.primary}15` }}>
        <motion.div
          id="test-progress-fill"
          className="h-full rounded-full"
          style={{ backgroundColor: test.theme.primary }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Main interactive area with smooth slide animation */}
      <div id="question-card-container" className="flex-1 flex flex-col justify-center relative min-h-[340px]">
        {/* Floating Support Toast */}
        <AnimatePresence>
          {activeSupportMessage && (
            <motion.div
              initial={{ opacity: 0, y: -12, x: '-50%', scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
              exit={{ opacity: 0, y: -8, x: '-50%', scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-2 left-1/2 z-50 py-2 px-4 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border shadow-lg flex items-center gap-2 whitespace-nowrap"
              style={{
                borderColor: `${test.theme.primary}25`,
                boxShadow: `0 10px 15px -3px ${test.theme.primary}12`,
              }}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" 
                style={{ backgroundColor: test.theme.primary }}
              />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-100 font-sans">
                {activeSupportMessage}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="w-full"
          >
            {/* Dimension Label */}
            {currentQuestion.dimension && (
              <span
                id={`dimension-badge-${currentQuestion.id}`}
                className="inline-block text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full mb-3"
                style={{
                  backgroundColor: `${test.theme.primary}15`,
                  color: test.theme.primary,
                }}
              >
                {currentQuestion.dimension}
              </span>
            )}

            {/* Question Text */}
            <h2
              id={`question-text-${currentQuestion.id}`}
              className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 leading-tight"
            >
              {currentQuestion.text}
            </h2>

            {/* Answers options stack */}
            <div id={`options-stack-${currentQuestion.id}`} className="space-y-3">
              {options.map((opt, oIdx) => {
                const isSelected = answers[currentQuestion.id] === opt.score;
                const btnColors = getOptionColors(test.id, oIdx, options.length, isSelected);
                return (
                  <motion.button
                    key={oIdx}
                    id={`opt-btn-${currentQuestion.id}-${oIdx}`}
                    onClick={() => handleSelectOption(opt.score)}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    className={`w-full text-left p-4 rounded-2xl border text-sm font-semibold transition-all duration-150 flex items-center justify-between ${
                      isSelected ? btnColors.selected : btnColors.unselected
                    }`}
                  >
                    <span className="leading-tight flex-1 pr-3">{opt.text}</span>
                    
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'border-white bg-white scale-110 shadow-sm'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white/40'
                      }`}
                    >
                      {isSelected && (
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: test.theme.primary }}
                        />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>


          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom hint/branding */}
      <div id="questionnaire-footer" className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 font-medium">
        <HelpCircle className="w-3.5 h-3.5" />
        Все ответы полностью анонимны и конфиденциальны
      </div>
    </div>
  );
}
