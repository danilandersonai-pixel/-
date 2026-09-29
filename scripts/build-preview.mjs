// Собирает веб-превью приложения в один HTML-файл для артефакта Claude.
// Запуск: npm run preview:build  →  dist-preview/index.html
//
// Что делает:
// 1. `expo export --platform web` — обычная веб-сборка приложения.
// 2. Встраивает шрифты и картинки прямо в бандл (data: URI): в артефакте
//    нельзя загружать файлы по абсолютным путям.
// 3. Кладёт бандл в страницу с «телефоном» и панелью плана работ.

import { execSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const outFile = resolve(root, process.argv[2] ?? 'dist-preview/index.html');

// План работ для панели справа. Обновляется после каждого шага.
const roadmap = [
  { title: 'Каркас: вкладки, светлая и тёмная тема', status: 'done' },
  { title: 'База данных и список подопечных', status: 'done' },
  { title: 'Карточка подопечного и согласие на обработку данных', status: 'done' },
  { title: 'Замеры и калькулятор состава тела', status: 'done' },
  { title: 'Прогресс: графики и фото «до/после»', status: 'done' },
  { title: 'Тренировки и календарь', status: 'done' },
  { title: 'Питание: калории и КБЖУ', status: 'next' },
  { title: 'PDF-отчёт и резервная копия', status: 'todo' },
];

const mimeTypes = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function exportWeb() {
  const dir = mkdtempSync(join(tmpdir(), 'sport-tracker-web-'));
  execSync(`npx expo export --platform web --output-dir "${dir}"`, {
    cwd: root,
    stdio: ['ignore', 'ignore', 'inherit'],
    env: { ...process.env, EXPO_OFFLINE: '1', CI: '1' },
  });
  return dir;
}

function inlineAssets(bundle, exportDir) {
  return bundle.replace(/"(\/assets\/[^"]+)"/g, (match, assetPath) => {
    const mime = mimeTypes[extname(assetPath).toLowerCase()];
    if (!mime) {
      throw new Error(`Неизвестный тип ассета: ${assetPath}`);
    }
    const data = readFileSync(join(exportDir, assetPath)).toString('base64');
    return `"data:${mime};base64,${data}"`;
  });
}

// Внутри <script> нельзя встречать «</script» и «<!--»: браузер примет их за разметку.
function escapeForInlineScript(code) {
  return code.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
}

function formatToday() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${now.getFullYear()}`;
}

function renderRoadmap() {
  const labels = { done: 'Готово', next: 'Следующий шаг', todo: 'В плане' };
  return roadmap
    .map(
      (step) =>
        `<li class="step step--${step.status}"><span class="step__mark" aria-hidden="true"></span>` +
        `<span class="step__title">${step.title}</span><span class="step__status">${labels[step.status]}</span></li>`,
    )
    .join('\n          ');
}

function renderPage(bundle) {
  const version = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
  const done = roadmap.filter((step) => step.status === 'done').length;
  const template = readFileSync(join(root, 'scripts/preview-template.html'), 'utf8');
  return template
    .replace('{{ROADMAP}}', renderRoadmap())
    .replace('{{PROGRESS}}', `${done} из ${roadmap.length}`)
    .replace('{{UPDATED}}', `${formatToday()} · версия ${version}`)
    .replace('{{BUNDLE}}', () => bundle);
}

const exportDir = exportWeb();
try {
  const html = readFileSync(join(exportDir, 'index.html'), 'utf8');
  const bundlePath = html.match(/<script src="([^"]+\.js)"/)?.[1];
  if (!bundlePath) {
    throw new Error('Не нашёл JS-бандл в index.html веб-сборки');
  }
  const bundle = escapeForInlineScript(
    inlineAssets(readFileSync(join(exportDir, bundlePath), 'utf8'), exportDir),
  );
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, renderPage(bundle));
  const sizeMb = (Buffer.byteLength(readFileSync(outFile)) / 1024 / 1024).toFixed(1);
  console.log(`Готово: ${outFile} (${sizeMb} МБ)`);
} finally {
  rmSync(exportDir, { recursive: true, force: true });
}
