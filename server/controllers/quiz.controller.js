import { questions, publicQuestions, PASS_THRESHOLD } from '../data/quiz.js';
import { httpError } from '../utils/http.js';

export function getQuiz() { return { passThreshold: PASS_THRESHOLD, questions: publicQuestions() }; }

export function checkAnswer(body) {
  const q = questions.find((x) => x.id === body.id);
  if (!q) throw httpError(404, 'Вопрос не найден');
  return { correct: Number(body.answer) === q.answer, correctAnswer: q.answer, explanation: q.explanation };
}

export function submitQuiz(body) {
  const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
  const results = questions.map((q) => ({ id: q.id, topic: q.topic, correct: Number(answers[q.id]) === q.answer }));
  const correct = results.filter((r) => r.correct).length;
  const score = questions.length ? correct / questions.length : 0;
  return { correct, total: questions.length, score, passed: score >= PASS_THRESHOLD, weakTopics: results.filter((r) => !r.correct).map((r) => r.topic) };
}
