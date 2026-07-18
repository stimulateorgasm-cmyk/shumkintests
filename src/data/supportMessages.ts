import { TestId } from '../types';

/**
 * Main helper to dynamically retrieve an extremely short supportive message or progress milestone.
 * These are kept to 1-2 words to be highly motivating and completely non-distracting.
 */
export function getSupportMessage(
  testId: TestId,
  questionId: number,
  score: number,
  questionIndex: number,
  totalQuestions: number
): string | null {
  const remaining = totalQuestions - 1 - questionIndex;

  // 1. Check for specific progress milestones first
  if (remaining === 5) {
    return "Осталось 5 вопросов!";
  }
  if (remaining === 3) {
    return "Осталось всего 3 вопроса!";
  }
  if (remaining === 1) {
    return "Последний вопрос!";
  }
  if (questionIndex + 1 === Math.floor(totalQuestions / 2)) {
    return "Половина пройдена!";
  }

  // 2. Classify if the answer is "Resourceful/Positive" or "Sensitive/Empathetic"
  let isPositive = false;

  if (testId === 'female-shumkin' || testId === 'male-shumkin') {
    // For Shumkin scales, scores 3 and 4 represent a lack of blocks, higher confidence and comfort.
    // Scores 1 and 2 represent blocks, fears, or physical discomfort.
    isPositive = score >= 3;
  } else if (testId === 'best-lover') {
    // For Best Lover, score 2 indicates high mastery/skills, 0 indicates struggles/lack of experience.
    isPositive = score >= 2;
  } else if (testId === 'rpp' || testId === 'burnout' || testId === 'money') {
    // For RPP (eating disorders), Burnout, and Money Blocks, high scores indicate high stress or symptoms.
    // Low scores (0 and 1) mean no symptoms, positive state, and low stress.
    isPositive = score <= 1;
  }

  // 3. Return a context-appropriate supportive phrase
  if (isPositive) {
    const positivePhrases = [
      "Отлично!",
      "Хорошо!",
      "Супер!",
      "Прекрасно!",
      "Здорово!",
      "Принято!",
      "Рад за вас!",
      "Замечательно!",
      "Так держать!",
      "Превосходно!",
      "В точку!"
    ];
    // Select deterministically to prevent consecutive duplicate messages
    const index = (questionIndex + score) % positivePhrases.length;
    return positivePhrases[index];
  } else {
    // Empathetic, respectful, and supportive phrases that acknowledge the sensitive/difficult answer
    const empatheticPhrases = [
      "Принято",
      "Записал",
      "Понимаю...",
      "Важно отметить",
      "Продолжаем",
      "Идём дальше",
      "Двигаемся дальше",
      "Важное признание",
      "Зафиксировано",
      "Ценный ответ"
    ];
    const index = (questionIndex + score) % empatheticPhrases.length;
    return empatheticPhrases[index];
  }
}
