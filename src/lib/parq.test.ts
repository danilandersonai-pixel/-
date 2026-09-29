import { parqIsStale, parqQuestions, parqResult, parseParqAnswers, serializeParqAnswers } from './parq';

describe('анкета PAR-Q', () => {
  it('7 вопросов', () => {
    expect(parqQuestions).toHaveLength(7);
  });

  it('все «Нет» — можно начинать', () => {
    const all = Object.fromEntries(parqQuestions.map((q) => [q, false]));
    expect(parqResult(all)).toEqual({ kind: 'ready', answered: 7, total: 7, yes: [] });
  });

  it('хотя бы одно «Да» — к врачу, даже если анкета не закончена', () => {
    expect(parqResult({ heart: false, joints: true, chestPain: true })).toEqual({
      kind: 'doctor',
      answered: 3,
      total: 7,
      yes: ['chestPain', 'joints'],
    });
  });

  it('не на все вопросы ответили — не закончена', () => {
    expect(parqResult({ heart: false, chestPain: false })).toMatchObject({ kind: 'incomplete', answered: 2 });
    expect(parqResult({})).toMatchObject({ kind: 'incomplete', answered: 0 });
  });

  it('ответы в строку и обратно; мусор и чужие ключи отбрасываются', () => {
    const text = serializeParqAnswers({ joints: true, heart: false });
    expect(text).toBe('{"heart":false,"joints":true}');
    expect(parseParqAnswers(text)).toEqual({ heart: false, joints: true });
    expect(parseParqAnswers('{"heart":"да","other":true,"dizziness":false}')).toEqual({ dizziness: false });
    expect(parseParqAnswers('не json')).toEqual({});
    expect(parseParqAnswers('[true]')).toEqual({});
  });

  it('анкета старше года — пора пройти заново', () => {
    expect(parqIsStale('2025-09-29', '2026-09-29')).toBe(false);
    expect(parqIsStale('2025-09-28', '2026-09-29')).toBe(true);
  });
});
