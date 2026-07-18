export type TestId = 'female-shumkin' | 'male-shumkin' | 'rpp' | 'burnout' | 'money' | 'best-lover';

export interface TestTheme {
  primary: string;       // Tailwind color e.g., 'rose-500' or hex '#F43F5E'
  primaryDark: string;   // Darker shade for focus/hover e.g., 'rose-700'
  accent: string;        // Accent e.g., 'pink-500'
  bgGradient: string;    // Gradient classes e.g., 'from-rose-50 to-pink-100' or dark gradients
  cardBg: string;        // White or slate background with opacity e.g., 'bg-white/95'
  progressBg: string;    // ProgressBar background e.g., 'bg-rose-100'
  progressFill: string;  // ProgressBar fill e.g., 'bg-rose-500'
  buttonBg: string;      // Button background e.g., 'bg-rose-500 hover:bg-rose-600'
  textMuted: string;     // Secondary text color
  ringColor: string;     // Ring color for buttons
  accentBadge: string;   // Accent color for level badges
}

export interface Option {
  text: string;
  score: number;
}

export interface Question {
  id: number;
  text: string;
  dimension?: string;      // E.g., 'Desire', 'Arousal'
  options?: Option[];      // If questions share the same options, we can assign them globally or inline
}

export interface DimensionResult {
  name: string;
  score: number;
  max: number;
  percentage: number;
  description: string;
}

export interface TestResult {
  title: string;
  level: 'low' | 'medium' | 'high' | 'excellent';
  score: number;
  maxScore: number;
  text: string;
  recommendations: string[];
  dimensions?: DimensionResult[];
}

export interface Test {
  id: TestId;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  category: string;
  theme: TestTheme;
  questions: Question[];
  scoreMax: number;
  globalOptions?: Option[]; // For tests where all questions have the same options (like RPP or Burnout)
  calculateResult: (score: number, questionAnswers: Record<number, number>) => TestResult;
}
