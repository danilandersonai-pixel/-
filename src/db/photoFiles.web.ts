// В браузерном превью файловой системы нет: уменьшаем снимок и храним его как data:-строку.

/** Длинная сторона после уменьшения — хватает для сравнения «до/после», а хранилище браузера не переполняется */
const MAX_SIDE = 720;

function loadImage(uri: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Не удалось открыть изображение'));
    image.src = uri;
  });
}

const api = {
  async storePhoto(sourceUri: string): Promise<string> {
    const image = await loadImage(sourceUri);
    const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      return sourceUri;
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.75);
  },
} satisfies typeof import('./photoFiles');

export const { storePhoto } = api;
