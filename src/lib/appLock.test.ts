import { parseFlag, RELOCK_AFTER_MS, shouldRelock } from './appLock';

describe('блокировка приложения', () => {
  it('закрываем снова, если приложение было свёрнуто дольше минуты', () => {
    expect(shouldRelock(null, 1_000_000)).toBe(false);
    expect(shouldRelock(1_000_000, 1_000_000 + RELOCK_AFTER_MS - 1)).toBe(false);
    expect(shouldRelock(1_000_000, 1_000_000 + RELOCK_AFTER_MS)).toBe(true);
  });

  it('флаг из хранилища', () => {
    expect(parseFlag('1')).toBe(true);
    expect(parseFlag('0')).toBe(false);
    expect(parseFlag(null)).toBe(false);
  });
});
