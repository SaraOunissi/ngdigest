import { INTERVIEW_QUESTIONS, INTERVIEW_THEMES } from './interview-questions.data';

describe('INTERVIEW_QUESTIONS', () => {
  it('keeps only the 53 questions Sara was actually asked', () => {
    expect(INTERVIEW_QUESTIONS).toHaveLength(53);
    expect(INTERVIEW_QUESTIONS.every((question) => !question.seed)).toBe(true);
  });

  it('uses unique ids', () => {
    const ids = INTERVIEW_QUESTIONS.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('puts every question in a declared theme and leaves no theme empty', () => {
    const themeIds = INTERVIEW_THEMES.map((theme) => theme.id);
    expect(INTERVIEW_QUESTIONS.every((question) => themeIds.includes(question.theme))).toBe(true);
    for (const themeId of themeIds) {
      expect(INTERVIEW_QUESTIONS.some((question) => question.theme === themeId)).toBe(true);
    }
  });

  it('gives a substantial answer in both languages', () => {
    for (const question of INTERVIEW_QUESTIONS) {
      expect(question.a.fr.split(/\s+/).length).toBeGreaterThan(50);
      expect(question.a.en.split(/\s+/).length).toBeGreaterThan(50);
    }
  });

  it('flags as modern every answer that carries a 2026 note, in both languages', () => {
    for (const question of INTERVIEW_QUESTIONS) {
      expect(question.a.fr.includes('💡')).toBe(question.a.en.includes('💡'));
      if (question.a.fr.includes('💡')) {
        expect(question.modern).toBe(true);
      }
    }
  });
});
