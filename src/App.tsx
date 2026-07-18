import { useState, useEffect, ComponentType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HeartHandshake,
  ShieldAlert,
  Salad,
  Flame,
  Coins,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Sparkle,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { Test, TestId, TestResult } from './types';
import { testsList } from './data/tests';
import Questionnaire from './components/Questionnaire';
import ResultsDisplay from './components/ResultsDisplay';

const iconMap: Record<string, ComponentType<any>> = {
  HeartHandshake,
  ShieldAlert,
  Salad,
  Flame,
  Coins,
  Sparkles,
};

interface PremiumWelcomeConfig {
  coolQuestion: string;
  subtitle: string;
  buttonText: string;
  underButtonText?: string;
  bullets: string[];
}

const PREMIUM_WELCOME_CONFIGS: Record<string, PremiumWelcomeConfig> = {
  'female-shumkin': {
    coolQuestion: 'Что мешает твоим оргазмам и не даёт строить счастливые отношения?',
    subtitle: 'Пройди диагностику из 25 вопросов и узнай, какие скрытые блоки мешают тебе расслабиться, наслаждаться, чувствовать себя желанной и достойной.',
    buttonText: 'Пройти диагностику',
    underButtonText: 'Уже 155+ девушек прошли диагностику',
    bullets: ['25 вопросов', '5 минут', 'Результат сразу']
  },
  'male-shumkin': {
    coolQuestion: 'Что блокирует твою мужскую силу и мешает гармоничным отношениям?',
    subtitle: 'Пройди мужскую диагностику из 25 вопросов. Узнай, какие внутренние барьеры и страхи мешают тебе получать максимум удовольствия и строить глубокую близость.',
    buttonText: 'Пройти диагностику',
    underButtonText: 'Уже 120+ мужчин прошли диагностику',
    bullets: ['25 вопросов', '5 минут', 'Результат сразу']
  },
  'best-lover': {
    coolQuestion: 'Насколько ты хорош в постели и умеешь ли доставлять истинное удовольствие?',
    subtitle: 'Пройди интерактивный тест и раскрой свой истинный сексуальный архетип. Узнай свои сильные стороны и зоны роста в интимной жизни.',
    buttonText: 'Раскрыть потенциал',
    underButtonText: 'Узнай свой интимный рейтинг',
    bullets: ['10 вопросов', '4 минуты', 'Результат сразу']
  },
  'rpp': {
    coolQuestion: 'Узнай свой уровень свободы от еды',
    subtitle: 'Пройди тест из 25 вопросов и узнай, насколько еда контролирует твою жизнь. Диеты, срывы, чувство вины — всё это имеет причины, и мы поможем их увидеть.',
    buttonText: 'Пройти тест',
    underButtonText: 'Результаты конфиденциальны и доступны только тебе',
    bullets: ['25 вопросов', '5 минут', 'Результат сразу']
  },
  'burnout': {
    coolQuestion: 'Ты просто устал или это реальное выгорание?',
    subtitle: 'Пройди профессиональный экспресс-тест на уровень эмоционального истощения. Оцени состояние нервной системы и получи план восстановления.',
    buttonText: 'Проверить уровень сил',
    underButtonText: 'Верни контроль над своей энергией',
    bullets: ['20 вопросов', '4 минуты', 'Результат сразу']
  },
  'money': {
    coolQuestion: 'Что блокирует твой доход и почему деньги вызывают тревогу?',
    subtitle: 'Выяви свои скрытые финансовые установки, синдром самозванца и страхи перед богатством с помощью системного психологического теста.',
    buttonText: 'Выявить блоки',
    underButtonText: 'Сделай шаг к финансовой свободе',
    bullets: ['25 вопросов', '5-7 минут', 'Результат сразу']
  }
};

export default function App() {
  const [activeTestId, setActiveTestId] = useState<TestId | null>(null);
  const [testState, setTestState] = useState<'welcome' | 'testing' | 'results'>('welcome');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<TestResult | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.colorScheme) {
        return tg.colorScheme === 'dark';
      }
    }
    return false;
  });

  // Sync dark mode class with documentElement and localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const activeTest = testsList.find((t) => t.id === activeTestId);

  const handleSelectTest = (id: TestId) => {
    setActiveTestId(id);
    setTestState('welcome');
    setAnswers({});
    setResult(null);
  };

  const handleStartTest = () => {
    setTestState('testing');
  };

  const handleFinishTest = (finalAnswers: Record<number, number>) => {
    if (!activeTest) return;
    setAnswers(finalAnswers);

    // Calculate sum of scores
    let scoreSum = 0;
    Object.values(finalAnswers).forEach((score) => {
      scoreSum += score;
    });

    const calculatedResult = activeTest.calculateResult(scoreSum, finalAnswers);
    setResult(calculatedResult);
    setTestState('results');
  };

  const handleRestart = () => {
    setTestState('testing');
    setAnswers({});
    setResult(null);
  };

  const handleGoHome = () => {
    setActiveTestId(null);
    setTestState('welcome');
    setAnswers({});
    setResult(null);
  };

  // Determine ambient background gradient based on active test theme
  const getAmbientBg = () => {
    if (!activeTest) {
      return 'from-slate-500/5 via-zinc-500/5 to-neutral-500/5';
    }
    return activeTest.theme.bgGradient;
  };

  return (
    <div
      id="app-root-container"
      className="min-h-screen w-full flex flex-col transition-colors duration-500 bg-[#FCFAF6] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-onest"
    >
      {/* Background Ambient Glow */}
      <div
        id="ambient-background-glow"
        className={`absolute inset-0 bg-gradient-to-tr ${getAmbientBg()} pointer-events-none transition-all duration-700 blur-[80px] opacity-75 z-0`}
      />

      {/* Header bar */}
      <header
        id="app-header-nav"
        className="relative z-10 w-full max-w-md mx-auto px-4 py-3 border-b border-zinc-100 dark:border-zinc-900/60 flex items-center justify-between bg-white/40 dark:bg-zinc-950/40 backdrop-blur-md"
      >
        <div id="header-brand" className="flex items-center gap-1.5 cursor-pointer" onClick={handleGoHome}>
          <div className="w-6 h-6 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
            <Sparkle className="w-3.5 h-3.5 text-white dark:text-zinc-900 fill-current" />
          </div>
          <span className="text-xs font-black tracking-widest uppercase font-mono">
            strah.fun
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Theme toggler */}
          <button
            id="btn-theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/80 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 transition-all hover:scale-105 active:scale-95"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Telegram badge indicator */}
          <div className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900/80 text-zinc-400 border border-zinc-200/20">
            WebApp
          </div>
        </div>
      </header>

      {/* Main viewport */}
      <main id="app-main-content" className="flex-1 relative z-10 w-full flex flex-col justify-start">
        <AnimatePresence mode="wait">
          {!activeTestId ? (
            /* ================= SELECT TEST SCREEN (HOME) ================= */
            <motion.div
              key="hub"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md mx-auto p-4 flex flex-col justify-start"
            >
              {/* Promo Banner */}
              <div id="promo-hero" className="text-center mt-6 mb-8 px-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900/5 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border border-zinc-200/10 mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Анонимно & Научно
                </span>
                <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
                  Познайте Себя
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                  Профессиональные тесты для глубокого анализа личности, интимного интеллекта и ресурса.
                </p>
              </div>

              {/* Grid lists of tests */}
              <div id="tests-selection-grid" className="space-y-3">
                {testsList.map((test) => {
                  const IconComponent = iconMap[test.iconName] || Sparkle;
                  return (
                    <motion.div
                      key={test.id}
                      id={`test-item-card-${test.id}`}
                      onClick={() => handleSelectTest(test.id)}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      className="p-5 rounded-3xl bg-white/75 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-900/60 shadow-sm cursor-pointer transition-all duration-150 flex items-start gap-4 group"
                    >
                      {/* Left Icon Container */}
                      <div
                        id={`test-icon-wrapper-${test.id}`}
                        className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: `${test.theme.primary}15`,
                          color: test.theme.primary,
                        }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* Right Details */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span
                            id={`test-badge-${test.id}`}
                            className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${test.theme.primary}12`,
                              color: test.theme.primary,
                            }}
                          >
                            {test.category}
                          </span>
                        </div>
                        <h2 className="text-base font-display font-bold tracking-tight text-zinc-800 dark:text-zinc-100 leading-snug">
                          {test.title}
                        </h2>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-2 mt-0.5 leading-snug">
                          {test.description}
                        </p>
                      </div>

                      {/* Arrow Chevron */}
                      <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-700 mt-4 shrink-0 transition-transform group-hover:translate-x-1" />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* ================= TEST EXECUTION CONTAINER ================= */
            <div id="active-test-container" className="w-full">
              {testState === 'welcome' && activeTest && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-md mx-auto p-4 flex flex-col justify-start min-h-[82vh]"
                >
                  {/* Minimalist Top Back Bar */}
                  <div className="w-full flex items-center justify-between mb-6">
                    <button
                      id="btn-welcome-back"
                      onClick={handleGoHome}
                      className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-full bg-white/80 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-850 hover:scale-95 active:scale-90 transition-transform duration-150 text-zinc-600 dark:text-zinc-400"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Ко всем тестам
                    </button>
                    
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">
                      Диагностика
                    </span>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-100 dark:border-zinc-800/80 shadow-sm text-center flex-1 flex flex-col justify-center">
                    {/* Brand Infinity Logo (Only shown for female-shumkin) */}
                    {activeTest.id === 'female-shumkin' && (
                      <div id="welcome-logo-header" className="flex flex-col items-center justify-center mb-6">
                        <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-50">
                          <svg className="w-14 h-7 text-zinc-900 dark:text-zinc-100 fill-none stroke-current stroke-[2.5]" viewBox="0 0 48 24">
                            <path d="M24 12C20 7.5 17 4 13 4C6.5 4 4 8 4 12C4 16 6.5 20 13 20C17 20 20 16.5 24 12C28 7.5 31 4 35 4C41.5 4 44 8 44 12C44 16 41.5 20 35 20C31 20 28 16.5 24 12Z" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <span className="text-2xl font-display font-medium tracking-wide text-zinc-900 dark:text-zinc-50 mt-1 lowercase">
                          deeps
                        </span>
                      </div>
                    )}

                    {(() => {
                      const welcomeConfig = PREMIUM_WELCOME_CONFIGS[activeTest.id];
                      return (
                        <>
                          <h1 id="welcome-title" className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight leading-[1.15] text-zinc-900 dark:text-zinc-50 text-center mb-6 px-1">
                            {welcomeConfig?.coolQuestion || activeTest.title}
                          </h1>

                          <p id="welcome-desc" className="text-xs sm:text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 text-center max-w-[290px] mx-auto mb-6">
                            {welcomeConfig?.subtitle || activeTest.description}
                          </p>

                          {activeTest.id === 'rpp' && (
                            <p className="text-xs sm:text-sm font-semibold text-[#8B7CA5] dark:text-[#A493C2] text-center mb-6">
                              Результаты конфиденциальны<br />и доступны только тебе.
                            </p>
                          )}

                          <div id="welcome-actions" className="space-y-4 max-w-xs mx-auto mb-8 w-full">
                            <motion.button
                              id="btn-start-test-run"
                              onClick={handleStartTest}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full py-3.5 px-6 rounded-full font-bold text-sm text-white shadow-lg transition-all duration-150 text-center"
                              style={{
                                backgroundColor: activeTest.theme.primary,
                                boxShadow: `0 8px 24px -6px ${activeTest.theme.primary}50`
                              }}
                            >
                              {welcomeConfig?.buttonText || 'Начать тестирование'}
                            </motion.button>

                            {welcomeConfig?.underButtonText && (
                              <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 text-center">
                                {welcomeConfig.underButtonText}
                              </p>
                            )}

                            <p className="text-[10px] leading-normal text-zinc-400 dark:text-zinc-500 text-center max-w-[260px] mx-auto">
                              Нажимая кнопку, вы соглашаетесь с{' '}
                              <span className="underline cursor-pointer hover:text-zinc-500 dark:hover:text-zinc-400">
                                политикой обработки данных
                              </span>
                              .
                            </p>
                          </div>

                          {/* Bottom stats/bullets */}
                          <div className="flex items-center justify-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500 font-semibold mt-auto pt-5 border-t border-zinc-100 dark:border-zinc-900/40">
                            {(welcomeConfig?.bullets || [`${activeTest.questions.length} вопросов`, '5 минут', 'Результат сразу']).map((bullet, idx) => (
                              <span key={idx} className="flex items-center gap-1.5">
                                {idx > 0 && <span className="text-zinc-300 dark:text-zinc-700 font-normal">•</span>}
                                {bullet}
                              </span>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </motion.div>
              )}

              {testState === 'testing' && (
                <Questionnaire
                  test={activeTest}
                  onBack={handleGoHome}
                  onFinish={handleFinishTest}
                />
              )}

              {testState === 'results' && result && (
                <ResultsDisplay
                  test={activeTest}
                  result={result}
                  onRestart={handleRestart}
                  onHome={handleGoHome}
                />
              )}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
