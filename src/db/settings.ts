// Настройки телефона, кроме темы (она в src/theme): профиль тренера и служебные отметки.

import { createSetting, parseJson } from '@/lib/settingStore';
import { emptyTrainerProfile, isTrainerProfile, type TrainerProfile } from '@/lib/trainer';

import { kv } from './kv';

export const trainerProfile = createSetting<TrainerProfile>(
  kv,
  'trainerProfile',
  (raw) => parseJson(raw, emptyTrainerProfile, isTrainerProfile),
  (value) => JSON.stringify(value),
);
