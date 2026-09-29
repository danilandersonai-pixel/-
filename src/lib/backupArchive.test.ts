import { backupTables, BackupError, makeBackup, type BackupRow, type BackupTable } from './backup';
import { choosePhotoUri, readBackupArchive, writeBackupArchive } from './backupArchive';
import { photoFileName, relativePhotoPath } from './photoPaths';
import { bytesSource, createZipWriter } from './zip';

function tablesWith(photos: BackupRow[]): Record<BackupTable, BackupRow[]> {
  const tables = Object.fromEntries(backupTables.map((t) => [t, []])) as unknown as Record<BackupTable, BackupRow[]>;
  tables.clients = [{ id: 'c1', firstName: 'Анна', archived: false, createdAt: 1, updatedAt: 1 }];
  tables.photos = photos;
  return tables;
}

const photo = (id: string, uri: string, deletedAt: number | null = null) => ({
  id,
  clientId: 'c1',
  date: '2026-09-01',
  angle: 'front',
  uri,
  deletedAt,
  createdAt: 1,
  updatedAt: 1,
});

async function archiveBytes(data: ReturnType<typeof makeBackup>, files: Record<string, Uint8Array>) {
  const chunks: Uint8Array[] = [];
  const result = await writeBackupArchive(
    createZipWriter((chunk) => chunks.push(chunk.slice())),
    data,
    async (row) => files[row.id as string] ?? null,
  );
  const bytes = new Uint8Array(chunks.reduce((sum, c) => sum + c.length, 0));
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return { bytes, result };
}

describe('файл резервной копии', () => {
  it('ZIP с фото: запись и чтение', async () => {
    const data = makeBackup(
      tablesWith([
        photo('p1', 'photos/x.jpg'),
        photo('p2', 'photos/missing.jpg'),
        photo('p3', 'photos/old.jpg', 5),
        photo('p4', 'data:image/jpeg;base64,AAAA'),
      ]),
      new Date(),
    );
    const { bytes, result } = await archiveBytes(data, { p1: Uint8Array.from([1, 2, 3]) });
    expect(result).toEqual({ photos: 1, missingPhotos: 1 });

    const archive = readBackupArchive(bytesSource(bytes));
    expect(archive.data.tables.clients[0].firstName).toBe('Анна');
    expect([...archive.photoEntries.keys()]).toEqual(['p1']);
  });

  it('старая копия (JSON) читается без фото', () => {
    const json = JSON.stringify({ ...makeBackup(tablesWith([]), new Date()), version: 1 });
    const archive = readBackupArchive(bytesSource(new TextEncoder().encode(json)));
    expect(archive.data.version).toBe(1);
    expect(archive.photoEntries.size).toBe(0);
  });

  it('чужой или повреждённый файл — понятная причина', async () => {
    const problem = (bytes: Uint8Array) => {
      try {
        readBackupArchive(bytesSource(bytes));
        return null;
      } catch (error) {
        return error instanceof BackupError ? error.problem : 'другая ошибка';
      }
    };
    expect(problem(new Uint8Array())).toBe('notBackup');
    expect(problem(new TextEncoder().encode('просто текст'))).toBe('notBackup');
    expect(problem(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 1, 2]))).toBe('notBackup');

    const { bytes } = await archiveBytes(makeBackup(tablesWith([]), new Date()), {});
    expect(problem(bytes.subarray(0, bytes.length - 30))).toBe('damaged');
  });

  it('выбор пути фото при восстановлении', async () => {
    const data = makeBackup(tablesWith([]), new Date());
    const { bytes } = await archiveBytes(
      makeBackup(tablesWith([photo('in-zip', 'photos/a.jpg')]), new Date()),
      { 'in-zip': Uint8Array.from([9]) },
    );
    const archive = { ...readBackupArchive(bytesSource(bytes)), data };
    const choose = choosePhotoUri(archive, {
      exists: (uri) => uri === 'photos/here.jpg',
      restoredUri: (id) => relativePhotoPath(`${id}.jpg`),
    });
    // фото уже есть на телефоне — не трогаем
    expect(choose(photo('in-zip', 'photos/a.jpg'), photo('in-zip', 'photos/here.jpg'))).toBe('photos/here.jpg');
    // есть в копии
    expect(choose(photo('in-zip', 'photos/a.jpg'), undefined)).toBe('photos/in-zip.jpg');
    // старая копия на том же телефоне: файл на месте
    expect(choose(photo('other', 'photos/here.jpg'), undefined)).toBe('photos/here.jpg');
    // фото из превью
    expect(choose(photo('web', 'data:image/jpeg;base64,AA'), undefined)).toBe('data:image/jpeg;base64,AA');
    // файла нигде нет
    expect(choose(photo('lost', 'photos/lost.jpg'), undefined)).toBeNull();
  });
});

describe('пути к фото', () => {
  it('понимает новые относительные и старые полные пути', () => {
    expect(relativePhotoPath('a.jpg')).toBe('photos/a.jpg');
    expect(photoFileName('photos/a.jpg')).toBe('a.jpg');
    expect(photoFileName('file:///var/mobile/Containers/Data/Application/ABC/Documents/photos/b.jpg')).toBe('b.jpg');
    expect(photoFileName('data:image/jpeg;base64,photos/x')).toBeNull();
    expect(photoFileName('file:///tmp/camera/c.jpg')).toBeNull();
  });
});
