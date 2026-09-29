// Собирает HTML-версию презентации для githack: npm run presentation:build
// Исходники слайдов — docs/presentation/source (копия презентации из Claude), результат — docs/presentation/index.html.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(new URL('.', import.meta.url).pathname, '..');
const srcDir = join(root, 'docs/presentation/source');
const outFile = join(root, 'docs/presentation/index.html');
const deck = JSON.parse(readFileSync(join(srcDir, 'deck.json'), 'utf8'));

const images = {
  '1334f376c3e2db028a5b5d8b31fa6d35': '01-clients.png',
  '68e6ec97a08dc8a1b42548e6ee613077': '02-card-measurements.png',
  '18a273c831e373f80b599af876f314b7': '03-result.png',
  '3a6bda5bacc194294bfdcbae8184fa50': '04-progress.png',
  '8c6335d22e56a50c9b229cf399f1b6be': '05-workouts.png',
  'f35be463a6447dde3fb2dbb5f6a483e6': '06-records.png',
  '81be539053e8f7ac2102475bf3bb2bb6': '07-parq.png',
  '4cf75172a4fc73388504049f4fdf8d32': '08-calendar.png',
  '962ca697e1b6cfcd82a89a589383e986': '01-clients-light.png',
};

const icons = {
  Check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  CheckCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.8 2.8L16.2 9.6"/>',
  PaperPlane: '<path d="M21 3L3 10.5l7.2 3.3L13.5 21 21 3z"/><path d="M10.2 13.8L21 3"/>',
  Database: '<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13"/><path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"/>',
  Chat: '<path d="M4 5h16v11H9.5L4 20V5z"/>',
};

const total = deck.order.length;
const slides = deck.order.map((id, i) => {
  let html = readFileSync(join(srcDir, `slides/${id}.html`), 'utf8').trim();
  html = html.replace(/\/_blob\/([0-9a-f]{32})/g, (m, blob) => {
    if (!images[blob]) throw new Error(`Нет картинки для ${blob}`);
    return `img/${images[blob]}`;
  });
  html = html.replace(/<x-icon name="(\w+)" style="([^"]*)"><\/x-icon>/g, (m, name, style) => {
    if (!icons[name]) throw new Error(`Нет иконки ${name}`);
    return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="${style}">${icons[name]}</svg>`;
  });
  html = html.replace(/<a href="([^"]+)">/g, '<a href="$1" target="_blank" rel="noopener">');
  html = html.replace(/^<section id="([^"]+)"/, `<section id="$1" role="group" aria-roledescription="слайд" aria-label="Слайд ${i + 1} из ${total}"`);
  if (/<x-|\/_blob\//.test(html)) throw new Error(`Остались неподдержанные элементы в слайде ${id}`);
  return html;
});

const fonts = Object.values(deck.faces).map((f) => f.href.replace('https://fonts.googleapis.com/css2?', '').replace('&display=swap', '')).join('&');
const template = readFileSync(new URL('./presentation-template.html', import.meta.url), 'utf8');
writeFileSync(
  outFile,
  template
    .replace('{{FONTS}}', `https://fonts.googleapis.com/css2?${fonts}&display=swap`)
    .replace('{{TITLE}}', 'Спортивный Треккер — презентация')
    .replace('{{TOTAL}}', String(total))
    .replace('{{SLIDES}}', () => slides.join('\n')),
);
console.log(`Готово: ${outFile}, слайдов: ${total}`);
