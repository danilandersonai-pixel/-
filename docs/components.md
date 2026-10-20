# Состав приложения «Спортивный Треккер»

Опись всех файлов приложения: что за что отвечает. Презентация (`docs/presentation/`, `scripts/build-presentation.mjs`,
`scripts/presentation-template.html`) сюда не входит.

## Как устроено

```
Экраны (app/)                — что видит тренер; маршрут = путь файла (expo-router)
  └─ Компоненты (src/components/) — кнопки, карточки, формы, вкладки
       ├─ Хуки форм (src/hooks/)   — состояние формы и автосохранение
       ├─ Данные (src/db/)         — база SQLite: схема, миграции, запросы, резервная копия
       ├─ Логика (src/lib/)        — расчёты и правила без интерфейса и базы, все с тестами
       └─ Телефон (src/device/)    — Face ID / отпечаток и уведомления
Общее: тема (src/theme/), тексты (src/i18n/), даты и числа (src/utils/)
```

- Экраны не ходят в базу напрямую: запросы — в `src/db/`, расчёты — в `src/lib/`.
- Все тексты интерфейса — в `src/i18n/ru.ts`, все цвета — в `src/theme/`.
- У модулей `src/db/` есть пары `*.web.ts`: те же функции, но данные в браузере (`localStorage`) — для веб-превью.

**В цифрах:** 321 файл, около 19 700 строк кода на TypeScript, 37 файлов тестов (217 тестов),
12 таблиц базы, 9 миграций.

## Экраны — `app/` (24 файла)

| Файл | Экран |
| --- | --- |
| `_layout.tsx` | Корень: шрифты, миграции базы, тема, защита входа, напоминания о тренировках |
| `(tabs)/_layout.tsx` | Нижние вкладки: Подопечные, Календарь, Настройки |
| `(tabs)/index.tsx` | Список подопечных: поиск, блок «Сегодня», напоминание о копии |
| `(tabs)/calendar.tsx` | Календарь тренировок всех подопечных |
| `(tabs)/settings.tsx` | Настройки: тренер, копия, корзина, защита, напоминания, пример, тема |
| `client/new.tsx` | Новый подопечный (обязательно только имя) |
| `client/[id]/index.tsx` | Карточка подопечного с вкладками |
| `client/[id]/consent.tsx` | Согласие на обработку данных о здоровье (152-ФЗ) |
| `client/[id]/measure.tsx` | Пошаговый ввод замера |
| `client/[id]/measurement/[mid].tsx` | Результат замера: состав тела, метод, погрешность |
| `client/[id]/quick-weight.tsx` | Быстрый замер: только вес |
| `client/[id]/compare.tsx` | Сравнение любых двух замеров |
| `client/[id]/goal.tsx` | Цель с прогнозом |
| `client/[id]/progress.tsx` | Графики и фото «до/после» |
| `client/[id]/photo/[pid].tsx` | Фото на весь экран |
| `client/[id]/workout.tsx` | Тренировка: упражнения, подходы, таймер отдыха, серия |
| `client/[id]/exercise.tsx` | Упражнение: рекорды и график расчётного максимума |
| `client/[id]/membership.tsx` | Абонемент |
| `client/[id]/parq.tsx` | Анкета PAR-Q |
| `client/[id]/report.tsx` | PDF-отчёт «Прогресс за период» |
| `workout/new.tsx` | Тренировка из календаря: сначала выбор подопечного |
| `archive.tsx` | Архив подопечных |
| `restore.tsx` | Восстановление из резервной копии |
| `trash.tsx` | Корзина: вернуть удалённое |

## Компоненты — `src/components/` (89 файлов)

**Основа интерфейса:** `AppText` (текст из темы), `Button`, `IconButton`, `Icon` (все иконки приложения),
`TabBarIcon`, `Card`, `InfoRow`, `Notice` (плашка-предупреждение), `EmptyState` (пустой экран с подсказкой),
`Screen` и `FormScreen` (каркас экрана), `TextField`, `CompactInput`, `SearchField`, `Chips`, `SegmentedControl`,
`ConfirmButton` (действие с подтверждением), `InfoButton` и `InfoPanel` (кнопка «?» и объяснение),
`SaveStatusLabel` («Сохранено»), `StepProgress`, `ActionTile`, `StatTile`, `MetricTile`, `DeltaBadge` (стрелка изменения),
`Avatar`.

**Подопечные и карточка:** `ClientRow`, `ArchiveLink`, `ClientForm`, `ClientSummary`, `ClientTabs`,
`ClientProfileTab`, `ClientHealthTab`, `ClientMeasurementsTab`, `ClientWorkoutsTab`, `ClientNutritionTab`,
`ContactButtons` (звонок, WhatsApp, Telegram), `ConsentForm`, `ConsentStatusCard`, `HealthForm`.

**Замеры и калькулятор:** `MeasurementWizard` (пошаговый ввод), `MeasureHint` (где мерить), `MeasurementResult`,
`BodyFatHero`, `MeasurementRow`, `QuickWeightForm`, `CompareRowView`.

**Прогресс и цель:** `ProgressCharts`, `MetricChart`, `GoalCard`, `GoalEditor`, `PhotoSection`, `PhotoFrame`,
`PhotoCompareSlider` (шторка «до/после»), `AddPhotoPanel`.

**Тренировки:** `WorkoutEditor`, `ExerciseEditor`, `WorkoutRow`, `MonthCalendar`, `RecurringPanel` и `WeekdayPicker`
(серии по дням недели), `RestTimer` и `TimerButton` (таймер отдыха), `RecordsCard`, `ExerciseRecordRow`,
`ExerciseSessionRow`, `ExerciseProgress`, `MembershipCard`, `MembershipEditor`.

**Здоровье:** `ParqCard`, `ParqEditor`, `ParqQuestionRow`, `ParqSummary`.

**Питание:** `NutritionEditor`, `MacroBar`.

**Главный экран «Сегодня»:** `TodayCard`, `TodayRow`, `TodayWorkoutRow`, `BackupReminder`.

**Отчёт и резервная копия:** `ReportPreview` (+ `.web.tsx`), `RestorePreview`, `TrashRow`.

**Настройки и защита:** `TrainerProfileForm`, `SecuritySettings`, `ReminderSettings`, `AppLock`, `LockScreen`,
`WorkoutReminderSync` (держит уведомления в соответствии с календарём).

## Данные — `src/db/` (76 файлов)

- **Схема и миграции:** `schema.ts` — все 12 таблиц (clients, health, consents, measurements, photos, workouts,
  workout_exercises, sets, nutrition_plans, goals, memberships, parq_forms); `migrations/0000…0008` — миграции только вперёд;
  `migrations/meta/` — снимки схемы для drizzle-kit; `migrations/migrations.js` — подключение миграций.
- **Запросы по разделам** (у каждого есть `.web.ts`): `clients`, `consents`, `health`, `measurements`, `photos`,
  `workouts`, `nutrition`, `goals`, `memberships`, `parq`, `trash`.
- **Живые данные для экранов:** `useLiveData` и `changes` (экран перечитывает данные, когда таблица изменилась),
  хуки `useClients`, `useConsent`, `useHealth`, `useMeasurements`, `usePhotos`, `useWorkouts`, `useNutrition`, `useGoal`,
  `useMembership`, `useParq`, `useTrash`.
- **Резервная копия:** `backup` (чтение и запись всех таблиц), `backupFiles` (ZIP-файл, выбор файла, восстановление),
  `saveBackup` (копия + отметка времени).
- **Фото:** `photoFiles` (копирование снимка в папку приложения), `photoStorage` (папка с фото).
- **Настройки телефона:** `kv` (хранилище «ключ — значение»), `settings` (профиль тренера, защита, напоминания,
  отметки копии), `useSetting`.
- **Служебное:** `database` (подключение SQLite и миграции при запуске), `ids` (UUID), `demo` («Заполнить примером»),
  `webTable` (таблица в браузере для превью), `testing/testDatabase` (настоящий SQLite для тестов).

## Логика — `src/lib/` (66 файлов, у каждого модуля — тесты)

- **Калькулятор состава тела — `calc/`:** `bodyFat` (ВМС США, Jackson–Pollock + Siri), `mass` (безжировая и жировая масса,
  Boer), `indices` (ИМТ, FFMI), `skeletalMuscle` (мышечная масса по Lee), `composition` (выбор метода и сборка результата),
  `types`; тесты `calc.test.ts` — все контрольные примеры из CLAUDE.md.
- **Подопечные и формы:** `clients`, `clientForm`, `healthForm`, `consent`, `contacts`, `trainer`.
- **Замеры:** `measurements`, `measurementForm`, `measurementSteps`, `compare`, `progress`, `goals`.
- **Тренировки:** `workouts`, `workoutForm`, `records` (рекорды и 1ПМ), `memberships`, `workoutReminders`.
- **Здоровье и питание:** `parq`, `nutrition`.
- **Главный экран:** `today`.
- **Отчёты и выгрузка:** `report` (PDF), `csv` (Excel).
- **Резервная копия:** `backup` (формат и слияние), `backupArchive`, `zip` (свой ZIP без сжатия), `photoPaths`,
  `backupReminder`.
- **Прочее:** `settingStore` (настройки с подпиской), `appLock` (когда закрывать приложение), `trash`, `demoData`.

## Остальное в `src/`

- **`device/`** — `biometrics` (Face ID / отпечаток / код телефона), `notifications` (+ `.web.ts`) — локальные уведомления.
- **`hooks/`** — `useAutosave` (сохранение без кнопки «Сохранить») и состояние форм: `useClientEditor`,
  `useHealthEditor`, `useMeasurementEditor`, `useNutritionEditor`, `useWorkoutEditor`.
- **`theme/`** — `colors` (палитра «Энергия», светлая и тёмная), `contrast` (проверка читаемости, тесты),
  `typography`, `fonts`, `fontFiles`, `layout` (отступы, кнопки ≥ 44 pt), `navigationTheme`, `print` (цвета PDF),
  `themePreference`, `themePreferenceStore`, `useColorSchemeName` (+ `.web.ts`), `index`.
- **`i18n/`** — `ru.ts` (все тексты интерфейса), `calc.ts`, `records.ts`, `backup.ts` (тексты, собранные из чисел).
- **`utils/`** — `date` (ДД.ММ.ГГГГ), `format` (числа с запятой), `plural` (склонение по числу), `calendar`,
  `share` (+ `.web.ts`).

## Файлы проекта

| Файл | Назначение |
| --- | --- |
| `package.json`, `package-lock.json` | Зависимости и команды (`npm install` ставит всё нужное) |
| `app.json` | Настройки Expo: название, иконки, заставка, разрешения (камера, Face ID, уведомления) |
| `tsconfig.json` | TypeScript в строгом режиме |
| `babel.config.js`, `metro.config.js` | Сборка (подключение SQL-миграций) |
| `eslint.config.js` | Линтер |
| `drizzle.config.ts` | Генерация миграций базы |
| `expo-env.d.ts` | Типы Expo |
| `assets/images/` | Иконка приложения, иконки Android, заставка, значок для браузера |
| `scripts/build-preview.mjs`, `scripts/preview-template.html` | Сборка веб-превью в один HTML-файл |
| `docs/demo/` | Живое демо для githack: `index.html` (рамка) и `app.html` (сборка, `npm run demo:build`) |
| `README.md` | Коротко о приложении и как запустить |
| `CLAUDE.md`, `AGENTS.md` | Правила разработки для Claude и других ИИ-помощников |
| `PROGRESS.md`, `DECISIONS.md` | Ход работ, проверка на телефоне, журнал решений |
| `.claude/`, `.vscode/` | Настройки Claude Code и редактора |

Не хранятся в репозитории и появляются сами: `node_modules/` (после `npm install`), `dist-preview/` (после сборки превью).
