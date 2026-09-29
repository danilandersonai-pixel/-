import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

type Progress<T> = { status: Exclude<SaveStatus, 'pending'>; value: T | null };

/**
 * Сохраняет значение без кнопки «Сохранить»: через `delayMs` после последнего изменения,
 * а если экран закрыли раньше — сразу при закрытии.
 * `value = null` — сохранять нечего (например, не заполнено имя).
 * `save` должен быть стабильным (объявлен вне компонента или через useCallback).
 * `flush()` сохраняет немедленно — например, перед переходом на следующий экран.
 */
export function useAutosave<T>(
  value: T | null,
  save: (value: T) => Promise<void>,
  delayMs = 500,
): { status: SaveStatus; flush: () => Promise<void> } {
  const [progress, setProgress] = useState<Progress<T>>({ status: 'idle', value: null });
  const pending = useRef<{ value: T } | null>(null);
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const flush = useCallback(async () => {
    const toSave = pending.current;
    if (!toSave) {
      return;
    }
    pending.current = null;
    setProgress({ status: 'saving', value: toSave.value });
    const finish = (status: Progress<T>['status']) =>
      setProgress((current) => (current.value === toSave.value ? { status, value: toSave.value } : current));
    try {
      await saveRef.current(toSave.value);
      finish('saved');
    } catch (error) {
      finish('error');
      throw error;
    }
  }, []);

  useEffect(() => {
    if (value === null) {
      pending.current = null;
      return;
    }
    pending.current = { value };
    const timer = setTimeout(() => {
      flush().catch(() => {
        // Ошибка уже показана статусом «Не сохранилось»
      });
    }, delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs, flush]);

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

  let status: SaveStatus;
  if (value === null) {
    status = 'idle';
  } else {
    // Новое значение ещё ждёт своей очереди на сохранение
    status = value === progress.value ? progress.status : 'pending';
  }
  return { status, flush };
}
