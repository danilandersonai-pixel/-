import { pluralRu } from './plural';

const forms = ['тренировка', 'тренировки', 'тренировок'] as const;

describe('pluralRu', () => {
  it('выбирает форму по последней цифре', () => {
    expect(pluralRu(1, forms)).toBe('тренировка');
    expect(pluralRu(2, forms)).toBe('тренировки');
    expect(pluralRu(5, forms)).toBe('тренировок');
    expect(pluralRu(21, forms)).toBe('тренировка');
    expect(pluralRu(104, forms)).toBe('тренировки');
    expect(pluralRu(0, forms)).toBe('тренировок');
  });

  it('11–19 всегда в третьей форме', () => {
    expect(pluralRu(11, forms)).toBe('тренировок');
    expect(pluralRu(14, forms)).toBe('тренировок');
    expect(pluralRu(112, forms)).toBe('тренировок');
  });
});
