// Названия начертаний. Сами файлы шрифтов подключает fontFiles.ts при запуске приложения.
// Oswald — узкий «табло»-шрифт для заголовков и крупных цифр, Golos Text — основной текст.
// Оба с кириллицей и лежат внутри приложения: интернет для них не нужен.

export const fonts = {
  displayMedium: 'Oswald-Medium',
  display: 'Oswald-SemiBold',
  displayBold: 'Oswald-Bold',
  body: 'GolosText-Regular',
  bodyMedium: 'GolosText-Medium',
  bodySemiBold: 'GolosText-SemiBold',
  bodyBold: 'GolosText-Bold',
} as const;
