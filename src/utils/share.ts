import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/** Можно ли на этой платформе создать файл и отправить его (на телефоне — да) */
export const canShareFiles: boolean = true;

function freshCacheFile(fileName: string): File {
  const file = new File(Paths.cache, fileName);
  if (file.exists) {
    file.delete();
  }
  return file;
}

/** Сохраняет текст в файл и открывает системное меню «Поделиться» */
export async function shareTextFile(fileName: string, content: string, mimeType: string): Promise<void> {
  const file = freshCacheFile(fileName);
  file.create();
  file.write(content);
  await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: fileName });
}

/** Печатает HTML в PDF и открывает меню «Поделиться» — можно отправить подопечному */
export async function sharePdf(html: string, fileName: string): Promise<void> {
  const { uri } = await Print.printToFileAsync({ html });
  const target = freshCacheFile(fileName);
  await new File(uri).move(target);
  await Sharing.shareAsync(target.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: fileName });
}

/** Фото для PDF: файл с телефона превращаем в data:-строку, иначе PDF его не увидит */
export async function imageAsDataUri(uri: string): Promise<string> {
  if (uri.startsWith('data:')) {
    return uri;
  }
  return `data:image/jpeg;base64,${await new File(uri).base64()}`;
}
