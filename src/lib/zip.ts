// Минимальный ZIP-архив без сжатия (метод «stored»): резервная копия с фото в одном файле.
// Фото в JPEG уже сжаты, поэтому сжатие почти ничего не дало бы. Такой архив открывается
// на любом компьютере. Своя реализация вместо библиотеки: формат простой, а запись и чтение
// идут по частям, без загрузки всей копии в память.

export class ZipError extends Error {}

/** Куда писать архив: вызывается для каждого следующего куска байтов по порядку */
export type ByteSink = (chunk: Uint8Array) => void;

/** Откуда читать архив: произвольный доступ по смещению (файл на телефоне или массив в памяти) */
export type RandomAccessSource = {
  size: number;
  read(offset: number, length: number): Uint8Array;
};

export type ZipEntry = {
  name: string;
  size: number;
  crc: number;
  /** Смещение локального заголовка записи от начала архива */
  offset: number;
};

const LOCAL_HEADER = 0x04034b50;
const CENTRAL_HEADER = 0x02014b50;
const END_OF_CENTRAL = 0x06054b50;
const VERSION = 20;
/** Бит 11: имена файлов в UTF-8 */
const UTF8_FLAG = 0x0800;
const MAX_UINT32 = 0xffffffff;
const MAX_ENTRIES = 0xffff;

let crcTable: Uint32Array | null = null;

function getCrcTable(): Uint32Array {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c >>> 0;
    }
  }
  return crcTable;
}

/** Контрольная сумма CRC-32, как в ZIP */
export function crc32(bytes: Uint8Array): number {
  const table = getCrcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = table[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

/** Дата и время в формате MS-DOS, который использует ZIP */
function dosDateTime(date: Date): { time: number; date: number } {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function header(size: number): { bytes: Uint8Array; view: DataView } {
  const bytes = new Uint8Array(size);
  return { bytes, view: new DataView(bytes.buffer) };
}

export type ZipWriter = {
  addFile(name: string, data: Uint8Array): void;
  /** Дописывает оглавление архива. После этого добавлять файлы нельзя. */
  finish(): void;
};

export function createZipWriter(sink: ByteSink, modified: Date = new Date()): ZipWriter {
  const encoder = new TextEncoder();
  const stamp = dosDateTime(modified);
  const entries: (ZipEntry & { nameBytes: Uint8Array })[] = [];
  let offset = 0;
  let finished = false;

  const emit = (chunk: Uint8Array) => {
    sink(chunk);
    offset += chunk.length;
  };

  return {
    addFile(name, data) {
      if (finished) {
        throw new ZipError('Архив уже закрыт');
      }
      if (entries.length >= MAX_ENTRIES || offset + data.length > MAX_UINT32) {
        throw new ZipError('Слишком большой архив');
      }
      const nameBytes = encoder.encode(name);
      const crc = crc32(data);
      const { bytes, view } = header(30 + nameBytes.length);
      view.setUint32(0, LOCAL_HEADER, true);
      view.setUint16(4, VERSION, true);
      view.setUint16(6, UTF8_FLAG, true);
      view.setUint16(8, 0, true); // без сжатия
      view.setUint16(10, stamp.time, true);
      view.setUint16(12, stamp.date, true);
      view.setUint32(14, crc, true);
      view.setUint32(18, data.length, true);
      view.setUint32(22, data.length, true);
      view.setUint16(26, nameBytes.length, true);
      view.setUint16(28, 0, true);
      bytes.set(nameBytes, 30);
      entries.push({ name, nameBytes, size: data.length, crc, offset });
      emit(bytes);
      emit(data);
    },

    finish() {
      if (finished) {
        return;
      }
      finished = true;
      const centralStart = offset;
      for (const entry of entries) {
        const { bytes, view } = header(46 + entry.nameBytes.length);
        view.setUint32(0, CENTRAL_HEADER, true);
        view.setUint16(4, VERSION, true);
        view.setUint16(6, VERSION, true);
        view.setUint16(8, UTF8_FLAG, true);
        view.setUint16(10, 0, true);
        view.setUint16(12, stamp.time, true);
        view.setUint16(14, stamp.date, true);
        view.setUint32(16, entry.crc, true);
        view.setUint32(20, entry.size, true);
        view.setUint32(24, entry.size, true);
        view.setUint16(28, entry.nameBytes.length, true);
        // длина доп. поля, комментария, номер диска, атрибуты — нули
        view.setUint32(42, entry.offset, true);
        bytes.set(entry.nameBytes, 46);
        emit(bytes);
      }
      const { bytes, view } = header(22);
      view.setUint32(0, END_OF_CENTRAL, true);
      view.setUint16(8, entries.length, true);
      view.setUint16(10, entries.length, true);
      view.setUint32(12, offset - centralStart, true);
      view.setUint32(16, centralStart, true);
      emit(bytes);
    },
  };
}

/** Архив в памяти как источник для чтения — для тестов и браузерного превью */
export function bytesSource(bytes: Uint8Array): RandomAccessSource {
  return {
    size: bytes.length,
    read: (offset, length) => bytes.subarray(offset, Math.min(bytes.length, offset + length)),
  };
}

function viewOf(bytes: Uint8Array): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

/** Начинается ли файл как ZIP-архив */
export function looksLikeZip(firstBytes: Uint8Array): boolean {
  return firstBytes.length >= 4 && viewOf(firstBytes).getUint32(0, true) === LOCAL_HEADER;
}

/** Читает оглавление архива. Поддерживаются только записи без сжатия — такие пишет приложение. */
export function readZipEntries(source: RandomAccessSource): ZipEntry[] {
  // Конец оглавления — в последних 22 байтах плюс возможный комментарий до 64 КБ
  const tailLength = Math.min(source.size, 22 + 0xffff);
  const tailStart = source.size - tailLength;
  const tail = source.read(tailStart, tailLength);
  const tailView = viewOf(tail);
  let end = -1;
  for (let i = tail.length - 22; i >= 0; i -= 1) {
    if (tailView.getUint32(i, true) === END_OF_CENTRAL) {
      end = i;
      break;
    }
  }
  if (end < 0) {
    throw new ZipError('Не найдено оглавление архива');
  }
  const count = tailView.getUint16(end + 10, true);
  const centralSize = tailView.getUint32(end + 12, true);
  const centralStart = tailView.getUint32(end + 16, true);
  if (centralStart + centralSize > source.size) {
    throw new ZipError('Архив повреждён');
  }

  const central = source.read(centralStart, centralSize);
  const view = viewOf(central);
  const decoder = new TextDecoder();
  const entries: ZipEntry[] = [];
  let position = 0;
  for (let i = 0; i < count; i += 1) {
    if (position + 46 > central.length || view.getUint32(position, true) !== CENTRAL_HEADER) {
      throw new ZipError('Архив повреждён');
    }
    const method = view.getUint16(position + 10, true);
    const compressedSize = view.getUint32(position + 20, true);
    const size = view.getUint32(position + 24, true);
    const nameLength = view.getUint16(position + 28, true);
    const extraLength = view.getUint16(position + 30, true);
    const commentLength = view.getUint16(position + 32, true);
    const name = decoder.decode(central.subarray(position + 46, position + 46 + nameLength));
    if (method !== 0 || compressedSize !== size) {
      throw new ZipError(`Запись «${name}» сжата — такие архивы приложение не создаёт`);
    }
    entries.push({ name, size, crc: view.getUint32(position + 16, true), offset: view.getUint32(position + 42, true) });
    position += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

/** Читает содержимое записи и проверяет контрольную сумму */
export function readZipEntry(source: RandomAccessSource, entry: ZipEntry): Uint8Array {
  const local = source.read(entry.offset, 30);
  const view = viewOf(local);
  if (local.length < 30 || view.getUint32(0, true) !== LOCAL_HEADER) {
    throw new ZipError('Архив повреждён');
  }
  const dataStart = entry.offset + 30 + view.getUint16(26, true) + view.getUint16(28, true);
  const data = source.read(dataStart, entry.size);
  if (data.length !== entry.size || crc32(data) !== entry.crc) {
    throw new ZipError(`Файл «${entry.name}» в архиве повреждён`);
  }
  return data;
}
