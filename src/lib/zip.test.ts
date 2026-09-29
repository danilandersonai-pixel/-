import { bytesSource, crc32, createZipWriter, looksLikeZip, readZipEntries, readZipEntry, ZipError } from './zip';

function buildZip(files: Record<string, Uint8Array>): Uint8Array {
  const chunks: Uint8Array[] = [];
  const writer = createZipWriter((chunk) => chunks.push(chunk.slice()), new Date(2026, 8, 29, 14, 30, 10));
  for (const [name, data] of Object.entries(files)) {
    writer.addFile(name, data);
  }
  writer.finish();
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

const text = (value: string) => new TextEncoder().encode(value);

describe('ZIP-архив', () => {
  it('CRC-32 совпадает с эталоном', () => {
    expect(crc32(text('123456789'))).toBe(0xcbf43926);
    expect(crc32(new Uint8Array())).toBe(0);
  });

  it('записывает и читает файлы, в том числе с русским текстом', () => {
    const photo = Uint8Array.from({ length: 5000 }, (_, i) => (i * 7) % 256);
    const zip = buildZip({ 'backup.json': text('{"имя":"Анна"}'), 'photos/a.jpg': photo, 'пусто.txt': new Uint8Array() });
    expect(looksLikeZip(zip)).toBe(true);

    const source = bytesSource(zip);
    const entries = readZipEntries(source);
    expect(entries.map((e) => [e.name, e.size])).toEqual([
      ['backup.json', text('{"имя":"Анна"}').length],
      ['photos/a.jpg', 5000],
      ['пусто.txt', 0],
    ]);
    expect(new TextDecoder().decode(readZipEntry(source, entries[0]))).toBe('{"имя":"Анна"}');
    expect(readZipEntry(source, entries[1])).toEqual(photo);
    expect(readZipEntry(source, entries[2])).toEqual(new Uint8Array());
  });

  it('пустой архив читается без ошибок', () => {
    expect(readZipEntries(bytesSource(buildZip({})))).toEqual([]);
  });

  it('замечает повреждение данных', () => {
    const zip = buildZip({ 'a.txt': text('Привет, мир') });
    const entry = readZipEntries(bytesSource(zip))[0];
    zip[entry.offset + 30 + 'a.txt'.length] ^= 0xff; // портим первый байт содержимого
    expect(() => readZipEntry(bytesSource(zip), entry)).toThrow(ZipError);
  });

  it('не принимает файлы, которые не являются архивом', () => {
    const notZip = text('{"app":"sport-tracker"}');
    expect(looksLikeZip(notZip)).toBe(false);
    expect(() => readZipEntries(bytesSource(notZip))).toThrow(ZipError);
  });

  it('обрезанный архив — понятная ошибка', () => {
    const zip = buildZip({ 'a.txt': text('данные') });
    expect(() => readZipEntries(bytesSource(zip.subarray(0, zip.length - 10)))).toThrow(ZipError);
  });
});
