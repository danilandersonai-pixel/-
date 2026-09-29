// Профиль тренера: имя и контакты для шапки PDF-отчёта. Хранится в настройках телефона.

export type TrainerProfile = { name: string; phone: string; messenger: string };

export const emptyTrainerProfile: TrainerProfile = { name: '', phone: '', messenger: '' };

export function isTrainerProfile(value: unknown): value is TrainerProfile {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const v = value as Record<string, unknown>;
  return typeof v.name === 'string' && typeof v.phone === 'string' && typeof v.messenger === 'string';
}

/** Строка для отчёта: «Иван Петров · +7 900 000-00-00 · @ivan_coach»; null — ничего не заполнено */
export function trainerContacts(profile: TrainerProfile): string | null {
  const parts = [profile.name, profile.phone, profile.messenger].map((part) => part.trim()).filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : null;
}
