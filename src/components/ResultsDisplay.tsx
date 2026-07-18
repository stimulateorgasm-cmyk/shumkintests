import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Download,
  Share2,
  RotateCcw,
  CheckCircle2,
  Award,
  AlertTriangle,
  Flame,
  Heart,
  TrendingUp,
  FileText,
  BadgeAlert,
  Compass,
  RefreshCw,
} from 'lucide-react';
import { Test, TestResult } from '../types';
import { generatePdfReport } from './PdfExport';

interface ResultsDisplayProps {
  test: Test;
  result: TestResult;
  onRestart: () => void;
  onHome: () => void;
}

export default function ResultsDisplay({ test, result, onRestart, onHome }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfSourceRef = useRef<HTMLDivElement>(null);

  const percentage = Math.round((result.score / result.maxScore) * 100);

  // Trigger clipboard share copy
  const handleShare = () => {
    const text = `Я прошел тест «${test.title}» и получил результат: ${result.title} (${result.score} из ${result.maxScore} баллов). Пройти тест: ${window.location.origin}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Run the premium PDF export on the high-density print node
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await generatePdfReport('pdf-print-container', test.title, test.theme.primary);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Get dynamic icons depending on level
  const getLevelBadge = () => {
    switch (result.level) {
      case 'excellent':
        return {
          icon: <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          label: 'Отличный показатель',
          bg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900',
        };
      case 'medium':
        return {
          icon: <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
          label: 'Умеренная норма',
          bg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-100 dark:border-amber-900',
        };
      default:
        return {
          icon: <BadgeAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
          label: 'Требует внимания',
          bg: 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-100 dark:border-rose-900',
        };
    }
  };

  const badge = getLevelBadge();

  return (
    <div id="results-viewport" className="w-full max-w-md mx-auto p-4 font-sans text-zinc-900 dark:text-zinc-50 select-none pb-12">
      {/* Dynamic Animated Score Dial */}
      <div id="result-hero-card" className="relative p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 shadow-sm mb-6 overflow-hidden">
        <div id="hero-gradient" className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-10" style={{ backgroundColor: test.theme.primary }} />

        <div className="flex flex-col items-center text-center">
          <span id="test-category" className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-500 mb-1">
            {test.category}
          </span>
          <h2 id="result-title" className="text-2xl font-display font-extrabold tracking-tight mb-4">
            {test.title}
          </h2>

          {/* Dynamic Arc/Score Indicator */}
          {((test.id === 'female-shumkin' || test.id === 'male-shumkin') && result.dimensions && result.dimensions.length >= 2) ? (
            <div id="shumkin-dual-gauges" className="flex items-center justify-center gap-6 mb-6 mt-2 w-full">
              {result.dimensions.slice(0, 2).map((dim, dIdx) => {
                const dimPercentage = Math.min(100, Math.max(0, dim.percentage));
                return (
                  <div key={dIdx} className="flex flex-col items-center">
                    <div className="relative w-28 h-28 flex items-center justify-center mb-2">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          className="stroke-zinc-100 dark:stroke-zinc-800"
                          strokeWidth="6"
                          fill="none"
                        />
                        <motion.circle
                          cx="56"
                          cy="56"
                          r="48"
                          style={{ stroke: test.theme.primary }}
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={301.6}
                          initial={{ strokeDashoffset: 301.6 }}
                          animate={{ strokeDashoffset: 301.6 - (301.6 * dimPercentage) / 100 }}
                          transition={{ duration: 1.2, ease: 'easeOut', delay: dIdx * 0.2 }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-xl font-black tracking-tighter">
                          {dimPercentage}%
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400 font-mono">
                          {dim.score} / {dim.max} б
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-zinc-500 dark:text-zinc-400 max-w-[110px] text-center leading-tight">
                      {dIdx === 0 ? 'Свобода от страхов' : 'Интимная свобода'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div id="score-ring-container" className="relative w-36 h-36 flex items-center justify-center mb-4">
              {/* Background SVG circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  className="stroke-zinc-100 dark:stroke-zinc-800"
                  strokeWidth="8"
                  fill="none"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="64"
                  style={{ stroke: test.theme.primary }}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={402}
                  initial={{ strokeDashoffset: 402 }}
                  animate={{ strokeDashoffset: 402 - (402 * percentage) / 100 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>

              {/* Centered scores */}
              <div className="absolute flex flex-col items-center justify-center">
                {['rpp', 'burnout', 'money'].includes(test.id) ? (
                  <>
                    <motion.span
                      id="big-percentage"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-3xl font-black tracking-tighter"
                    >
                      {percentage}%
                    </motion.span>
                    <span id="percentage-label" className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500">
                      уровень
                    </span>
                  </>
                ) : (
                  <>
                    <motion.span
                      id="big-score"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="text-3xl font-black tracking-tighter"
                    >
                      {result.score}
                    </motion.span>
                    <span id="max-score" className="text-xs font-bold text-zinc-400 dark:text-zinc-500 font-mono">
                      из {result.maxScore} баллов
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Level Badge */}
          <div id="badge-level" className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${badge.bg} mb-4`}>
            {badge.icon}
            {badge.label}
          </div>

          {/* Summary title */}
          <h3 id="result-summary-heading" className="text-2xl font-display font-extrabold tracking-tight text-zinc-800 dark:text-zinc-100 mb-3">
            {result.title}
          </h3>

          <p id="result-explanation" className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {result.text}
          </p>
        </div>
      </div>

      {/* Multidimensional Bento Grid Breakdown */}
      {result.dimensions && result.dimensions.length > 0 && (
        <div id="dimensions-section" className="mb-6">
          <h4 id="dimensions-title" className="text-xs uppercase tracking-wider font-extrabold text-zinc-400 dark:text-zinc-500 mb-3 flex items-center gap-1.5 pl-1">
            <Compass className="w-3.5 h-3.5" />
            Детализация по шкалам
          </h4>

          <div id="dimensions-grid" className="grid grid-cols-1 gap-3">
            {result.dimensions.map((dim, idx) => {
              const bgPercent = Math.min(100, Math.max(0, dim.percentage));
              return (
                <div
                  key={idx}
                  id={`dimension-card-${idx}`}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span id={`dim-name-${idx}`} className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      {dim.name}
                    </span>
                    <span id={`dim-score-${idx}`} className="text-xs font-bold font-mono text-zinc-400">
                      {dim.score} / {dim.max}
                    </span>
                  </div>

                  <p id={`dim-desc-${idx}`} className="text-[11px] text-zinc-500 dark:text-zinc-500 mb-3 leading-snug">
                    {dim.description}
                  </p>

                  {/* Horizontal visual slider */}
                  <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden">
                    <motion.div
                      id={`dim-bar-${idx}`}
                      className="h-full rounded-full"
                      style={{ backgroundColor: test.theme.primary }}
                      initial={{ width: 0 }}
                      animate={{ width: `${bgPercent}%` }}
                      transition={{ delay: 0.1 * idx, duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand Specific Video & Assistant Section (Only for female-shumkin) */}
      {test.id === 'female-shumkin' && (
        <div id="female-premium-section" className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 shadow-sm mb-6 space-y-5">
          <h4 id="video-header" className="text-sm font-extrabold tracking-tight flex items-center gap-2 font-display">
            <span className="text-rose-500 text-lg">🎬</span>
            Разбор твоих результатов от автора
          </h4>
          
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
            Посмотри короткое видео-разбор от Антона Шумкина, чтобы понять, как устроена твоя интимная сфера и как убрать выявленные блоки.
          </p>

          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 shadow-inner">
            <iframe
              className="absolute top-0 left-0 w-full h-full border-0"
              src="https://www.youtube.com/embed/zHLe37jPex0"
              title="Разбор Женской Шкалы Шумкина"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            <h5 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 font-display">
              Нужна индивидуальная расшифровка?
            </h5>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed font-sans">
              Отправь скриншот своих результатов ассистенту Антона Шумкина. Он поможет подробно разобрать твои дефициты и подскажет пошаговый план решения.
            </p>
            
            <a
              href="https://t.me/anton_shumkin"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all hover:scale-[1.015] active:scale-[0.985] text-white"
              style={{ backgroundColor: test.theme.primary }}
            >
              <span className="text-base">💬</span>
              Написать ассистенту в Telegram
            </a>
          </div>
        </div>
      )}

      {/* Brand Specific Video & Assistant Section (Only for best-lover) */}
      {test.id === 'best-lover' && (
        <div id="best-lover-premium-section" className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 shadow-sm mb-6 space-y-5">
          <h4 id="best-lover-video-header" className="text-sm font-extrabold tracking-tight flex items-center gap-2 font-display">
            <span className="text-rose-500 text-lg">👑</span>
            Секретный видео-разбор твоего архетипа
          </h4>
          
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans">
            Я записал два эксклюзивных видео-разбора, раскрывающих психологию вербального возбуждения и трансовые техники, которые работают на глубоком подсознательном уровне.
          </p>

          <div className="space-y-4">
            {/* Video Card 1 */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">Часть 1 • Базовые Техники</span>
              <h5 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">«Как словами вызывать возбуждение и оргазм — даже без прикосновений»</h5>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Секретный гайд о том, как устроен женский мозг и какими фразами вызывать сильный чувственный отклик.</p>
              <a
                href="https://t.me/anton_shumkin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline pt-1"
              >
                <span>Получить у ассистента</span>
                <span>→</span>
              </a>
            </div>

            {/* Video Card 2 */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-500 dark:text-fuchsia-400">Часть 2 • Продвинутые Настройки</span>
              <h5 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">«Эксклюзивные трансовые техники, работающие на глубоком подсознательном уровне»</h5>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Для тех, кто готов войти в 3% лучших мужчин. Тонкие настройки интимной близости.</p>
              <a
                href="https://t.me/anton_shumkin"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-fuchsia-600 dark:text-fuchsia-400 hover:underline pt-1"
              >
                <span>Получить у ассистента</span>
                <span>→</span>
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
            <h5 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 font-display">
              Нужна индивидуальная расшифровка?
            </h5>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed font-sans">
              Напиши ассистенту Антона Шумкина. Он пришлёт тебе оба видео-гайда и поможет подробно разобрать твои дефициты и развить интимный интеллект.
            </p>
            
            <a
              href="https://t.me/anton_shumkin"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all hover:scale-[1.015] active:scale-[0.985] text-white"
              style={{ backgroundColor: test.theme.primary }}
            >
              <span className="text-base">💬</span>
              Получить видео-разборы в Telegram
            </a>
          </div>
        </div>
      )}

      {/* Core recommendations accordion */}
      <div id="recommendations-card" className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 shadow-sm mb-6">
        <h4 id="rec-heading" className="text-sm font-extrabold tracking-tight mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" style={{ color: test.theme.primary }} />
          Что делать дальше?
        </h4>

        <div id="rec-items" className="space-y-3">
          {result.recommendations.map((rec, idx) => (
            <div key={idx} id={`rec-item-${idx}`} className="flex gap-2.5 items-start text-sm">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: test.theme.primary }} />
              <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Floating Action buttons */}
      <div id="action-buttons-stack" className="space-y-2.5">
        <button
          id="btn-download-pdf"
          disabled={isGeneratingPdf}
          onClick={handleDownloadPdf}
          className="w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all hover:scale-[1.015] active:scale-[0.985] text-white"
          style={{ backgroundColor: test.theme.primary }}
        >
          {isGeneratingPdf ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isGeneratingPdf ? 'Сборка PDF отчета...' : 'Скачать PDF отчет'}
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="btn-share-results"
            onClick={handleShare}
            className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copied ? 'Скопировано!' : 'Поделиться'}
          </button>

          <button
            id="btn-restart-test"
            onClick={onRestart}
            className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 hover:bg-white dark:hover:bg-zinc-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Пройти заново
          </button>
        </div>

        <button
          id="btn-return-home"
          onClick={onHome}
          className="w-full py-3.5 text-xs text-center font-semibold text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
        >
          Вернуться на главную
        </button>
      </div>

      {/* --- HIDDEN HIGH-QUALITY LAYOUT FOR PDF GENERATION --- */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <div
          id="pdf-print-container"
          className="p-12 font-sans bg-white text-zinc-900 flex flex-col justify-between"
          style={{ width: '794px', minHeight: '1123px', boxSizing: 'border-box' }}
        >
          {/* Cover Header Graphic */}
          <div className="flex items-center justify-between border-b-2 pb-6 mb-8" style={{ borderColor: `${test.theme.primary}40` }}>
            <div>
              <span className="text-xs uppercase tracking-widest font-black text-zinc-400">
                Психодиагностический отчет
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: test.theme.primary }}>
                {test.title}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">Опросник: {test.subtitle}</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-zinc-400">Дата: {new Date().toLocaleDateString('ru-RU')}</div>
              <div className="text-xs font-mono text-zinc-400">Служба: Strah.Fun Diagnostics</div>
            </div>
          </div>

          {/* Result Block */}
          <div className="mb-8 p-6 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
            <div className="flex-1 pr-6">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-1 block">
                Итоговое заключение
              </span>
              <h2 className="text-xl font-black mb-2 text-zinc-800">{result.title}</h2>
              <p className="text-xs leading-relaxed text-zinc-600">{result.text}</p>
            </div>
            <div className="text-center p-6 bg-white border border-zinc-100 rounded-xl shrink-0">
              {['rpp', 'burnout', 'money'].includes(test.id) ? (
                <>
                  <div className="text-4xl font-black text-zinc-800">{percentage}%</div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Уровень тяжести</div>
                </>
              ) : (
                <>
                  <div className="text-4xl font-black text-zinc-800">{result.score}</div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">из {result.maxScore} баллов</div>
                </>
              )}
            </div>
          </div>

          {/* Dimension score meters */}
          {result.dimensions && result.dimensions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm uppercase tracking-wider font-extrabold text-zinc-400 mb-4">
                Показатели по суб-шкалам
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {result.dimensions.map((dim, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-zinc-100 bg-white">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-800">{dim.name}</span>
                      <span className="text-xs font-bold font-mono text-zinc-400">
                        {dim.score} / {dim.max}
                      </span>
                    </div>
                    {/* Progress Slider */}
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-1.5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: test.theme.primary,
                          width: `${Math.min(100, Math.max(0, dim.percentage))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom recommendations list */}
          <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 mb-8 flex-1">
            <h3 className="text-sm uppercase tracking-wider font-extrabold text-zinc-800 mb-4">
              Персональные рекомендации специалиста
            </h3>
            <div className="space-y-3.5">
              {result.recommendations.map((rec, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs text-zinc-600 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: test.theme.primary }} />
                  <p>{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Professional stamp and legal text */}
          <div className="border-t pt-6 mt-6 flex justify-between items-center text-[10px] text-zinc-400">
            <p className="max-w-[340px] leading-relaxed">
              *Данный отчет является информационным и не заменяет полноценную консультацию врача или психолога. Пожалуйста, обратитесь к сертифицированному специалисту за клиническим диагнозом.
            </p>
            <div className="text-right flex items-center gap-3">
              <div>
                <p className="font-bold text-zinc-600">Strah.Fun Diagnostics</p>
                <p>Электронная печать сертифицирована</p>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center font-bold text-[8px] text-center shrink-0 uppercase tracking-tighter" style={{ borderColor: `${test.theme.primary}60`, color: test.theme.primary }}>
                Strah<br />Fun
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
