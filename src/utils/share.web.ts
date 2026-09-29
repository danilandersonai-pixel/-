// В браузерном превью (артефакт) скачивание и печать запрещены — эти функции не вызываются,
// экраны показывают подсказку «это делает приложение на телефоне».

const api = {
  canShareFiles: false,
  async shareTextFile(): Promise<void> {
    throw new Error('В браузере сохранение файлов недоступно');
  },
  async sharePdf(): Promise<void> {
    throw new Error('В браузере создание PDF недоступно');
  },
  async imageAsDataUri(uri: string): Promise<string> {
    return uri;
  },
} satisfies typeof import('./share');

export const { canShareFiles, shareTextFile, sharePdf, imageAsDataUri } = api;
