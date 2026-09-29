import { useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

type Progress<T> = { status: Exclude<SaveStatus, 'pending'>; value: T | null };

/**
 * Сохраняет значение без кнопки «Сохранить»: через `delayMs` после последнего изменения,
 * а если экран закрыли раньше — сразу при закрытии.
 * `value = null` — сохранять нечего (например, не заполнено имя).
 * `save` должен быть стабильным (объявлен вне компонента или через useCallback).
 */
export function useAutosave<T>(value: T | null, save: (value: T) => Promise<void>, delayMs = 500): SaveStatus {
  const [progress, setProgress] = useState<Progress<T>>({ status: 'idle', value: null });
  const pending = useRef<{ value: T } | null>(null);
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (value === null) {
      pending.current = null;
      return;
    }
    pending.current = { value };
    const timer = setTimeout(() => {
      pending.current = null;
      setProgress({ status: 'saving', value });
      const finish = (status: Progress<T>['status']) =>
        setProgress((current) => (current.value === value ? { status, value } : current));
      save(value).then(
        () => finish('saved'),
        () => finish('error'),
      );
    }, delayMs);
    return () => clearTimeout(timer);
  }, [value, save, delayMs]);

  // Экран закрывают до истечения задержки — сохраняем немедленно
  useEffect(
    () => () => {
      if (pending.current) {
        void saveRef.current(pending.current.value);
        pending.current = null;
      }
    },
    [],
  );

  if (value === null) {
    return 'idle';
  }
  // Новое значение ещё ждёт своей очереди на сохранение
  return value === progress.value ? progress.status : 'pending';
}
