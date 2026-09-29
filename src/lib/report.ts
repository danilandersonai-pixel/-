// PDF-отчёт «Прогресс за период»: сбор данных и HTML. Чистые функции — без базы и UI.

import type { Client, Measurement, NutritionPlan, Photo, Workout } from '@/db/schema';
import { ru } from '@/i18n/ru';
import { printColors } from '@/theme/print';
import { addDays, isoToRuDate } from '@/utils/date';
import { fill, formatInteger, formatMeasure, lowerFirst } from '@/utils/format';

import { clientFullName } from './clients';
import { niceScale, progressMetrics, progressSeries, type ProgressMetricId, type ProgressPoint } from './progress';
import { workoutStats } from './workouts';

export type ReportPeriodPreset = 'month' | 'quarter' | 'all';

/** Границы периода «ГГГГ-ММ-ДД». Для «всё время» — с первого замера или тренировки. */
export function reportPeriod(preset: ReportPeriodPreset, todayIso: string, earliestIso: string | null): { from: string; to: string } {
  if (preset === 'month') {
    return { from: addDays(todayIso, -30), to: todayIso };
  }
  if (preset === 'quarter') {
    return { from: addDays(todayIso, -91), to: todayIso };
  }
  return { from: earliestIso ?? todayIso, to: todayIso };
}

export type ReportRow = {
  metric: ProgressMetricId;
  start: number;
  end: number;
  unit: string;
  direction: 'up' | 'down' | 'neutral';
};

export type ReportData = {
  clientName: string;
  goal: string | null;
  from: string;
  to: string;
  /** Даты первого и последнего замера в периоде */
  firstDate: string | null;
  lastDate: string | null;
  rows: ReportRow[];
  chart: { metric: ProgressMetricId; unit: string; points: ProgressPoint[] } | null;
  bodyFatMethod: 'jp3' | 'navy' | null;
  workouts: { done: number; hours: number; perWeek: number };
  plan: NutritionPlan | null;
  photos: { before: Photo; after: Photo } | null;
};

const REPORT_METRICS: readonly ProgressMetricId[] = [
  'weight',
  'bodyFat',
  'fatMass',
  'leanMass',
  'skeletalMuscle',
  'waist',
  'hips',
  'chest',
  'arm',
  'thigh',
];

export function buildReportData(input: {
  client: Client;
  /** Все замеры, новые сверху */
  measurements: Measurement[];
  workouts: Workout[];
  plans: NutritionPlan[];
  /** Все фото, старые сначала */
  photos: Photo[];
  from: string;
  to: string;
}): ReportData {
  const { client, from, to } = input;
  const inPeriod = input.measurements.filter((m) => m.date >= from && m.date <= to);
  const rows: ReportRow[] = [];
  let bodyFatMethod: ReportData['bodyFatMethod'] = null;

  for (const metricId of REPORT_METRICS) {
    const metric = progressMetrics.find((m) => m.id === metricId);
    const series = progressSeries(inPeriod, client, metricId);
    if (!metric || series.points.length === 0) {
      continue;
    }
    if (metricId === 'bodyFat') {
      bodyFatMethod = series.method;
    }
    const first = series.points[0];
    const last = series.points[series.points.length - 1];
    rows.push({
      metric: metricId,
      start: first.value,
      end: last.value,
      unit: ru.progress.units[metric.unit],
      direction: metric.direction,
    });
  }

  const chartMetric: ProgressMetricId | null =
    progressSeries(inPeriod, client, 'bodyFat').points.length > 1
      ? 'bodyFat'
      : progressSeries(inPeriod, client, 'weight').points.length > 1
        ? 'weight'
        : null;

  const periodWorkouts = input.workouts.filter((w) => w.date >= from && w.date <= to && w.deletedAt === null);
  const stats = workoutStats(periodWorkouts);
  const days = Math.max(1, Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1);

  const periodPhotos = input.photos.filter((p) => p.date >= from && p.date <= to && p.deletedAt === null);
  let photos: ReportData['photos'] = null;
  for (const angle of ['front', 'side', 'back'] as const) {
    const ofAngle = periodPhotos.filter((p) => p.angle === angle);
    if (ofAngle.length > 1) {
      photos = { before: ofAngle[0], after: ofAngle[ofAngle.length - 1] };
      break;
    }
  }

  return {
    clientName: clientFullName(client),
    goal: client.goal,
    from,
    to,
    firstDate: inPeriod.length > 0 ? inPeriod[inPeriod.length - 1].date : null,
    lastDate: inPeriod.length > 0 ? inPeriod[0].date : null,
    rows,
    chart: chartMetric
      ? {
          metric: chartMetric,
          unit: chartMetric === 'bodyFat' ? '%' : ru.progress.units.kg,
          points: progressSeries(inPeriod, client, chartMetric).points,
        }
      : null,
    bodyFatMethod,
    workouts: { done: stats.done, hours: stats.minutes / 60, perWeek: (stats.done * 7) / days },
    plan: input.plans.find((plan) => plan.startDate <= to) ?? null,
    photos,
  };
}

/** Экранирует текст, который ввёл тренер, прежде чем вставить его в HTML */
export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const COLORS = printColors;

/** Простой линейный график в SVG для PDF: линия 2 px, точки, круглые деления, подпись последнего значения */
export function lineChartSvg(points: ProgressPoint[], unit: string): string {
  const width = 520;
  const height = 200;
  const pad = { left: 44, right: 44, top: 16, bottom: 28 };
  const scale = niceScale(points.map((p) => p.value));
  const top = scale.min + scale.step * scale.sections;
  const x = (i: number) => pad.left + (points.length === 1 ? 0 : (i * (width - pad.left - pad.right)) / (points.length - 1));
  const y = (v: number) => pad.top + ((top - v) * (height - pad.top - pad.bottom)) / (top - scale.min);

  const grid = Array.from({ length: scale.sections + 1 }, (_, i) => {
    const value = scale.min + i * scale.step;
    return (
      `<line x1="${pad.left}" x2="${width - pad.right}" y1="${y(value)}" y2="${y(value)}" stroke="${COLORS.line}" stroke-width="1"/>` +
      `<text x="${pad.left - 8}" y="${y(value) + 4}" text-anchor="end" font-size="11" fill="${COLORS.faint}">${formatMeasure(value)}</text>`
    );
  }).join('');
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const dots = points
    .map((p, i) => `<circle cx="${x(i)}" cy="${y(p.value)}" r="4" fill="${COLORS.chart}" stroke="#fff" stroke-width="2"/>`)
    .join('');
  const last = points[points.length - 1];
  const labels =
    `<text x="${x(0)}" y="${height - 8}" text-anchor="middle" font-size="11" fill="${COLORS.faint}">${isoToRuDate(points[0].date)}</text>` +
    (points.length > 1
      ? `<text x="${x(points.length - 1)}" y="${height - 8}" text-anchor="middle" font-size="11" fill="${COLORS.faint}">${isoToRuDate(last.date)}</text>`
      : '') +
    `<text x="${x(points.length - 1)}" y="${y(last.value) - 10}" text-anchor="middle" font-size="12" font-weight="600" fill="${COLORS.text}">${formatMeasure(last.value)}${unit === '%' ? ' %' : ''}</text>`;

  return (
    `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" xmlns="http://www.w3.org/2000/svg">` +
    `${grid}<path d="${path}" fill="none" stroke="${COLORS.chart}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${dots}${labels}</svg>`
  );
}

function deltaCell(row: ReportRow): string {
  const delta = Number((row.end - row.start).toFixed(1));
  if (delta === 0) {
    return `<td class="num">0</td>`;
  }
  const better = row.direction === 'down' ? delta < 0 : row.direction === 'up' ? delta > 0 : null;
  const color = better === null ? COLORS.muted : better ? COLORS.good : COLORS.bad;
  const sign = delta > 0 ? '+' : '−';
  return `<td class="num" style="color:${color}">${sign}${formatMeasure(Math.abs(delta))}${row.unit ? ` ${row.unit}` : ''}</td>`;
}

const t = ru.report;

/** Стили отчёта. Все селекторы внутри .rpt, чтобы превью в браузере не задевало остальную страницу. */
export const reportCss = `
.rpt { font-family: -apple-system, 'Segoe UI', Roboto, Arial, sans-serif; color: ${COLORS.text}; font-size: 13px; line-height: 1.45; max-width: 720px; margin: 0 auto; padding: 8px 4px; }
.rpt h1 { font-size: 26px; margin: 0 0 4px; }
.rpt h2 { font-size: 16px; margin: 28px 0 10px; }
.rpt .muted { color: ${COLORS.muted}; }
.rpt .faint { color: ${COLORS.faint}; font-size: 11px; }
.rpt table { width: 100%; border-collapse: collapse; }
.rpt th { text-align: left; font-weight: 600; color: ${COLORS.muted}; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; padding: 6px 8px; border-bottom: 1px solid ${COLORS.line}; }
.rpt td { padding: 8px; border-bottom: 1px solid ${COLORS.line}; }
.rpt .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.rpt th.num { text-align: right; }
.rpt .tiles { display: flex; gap: 12px; }
.rpt .tile { flex: 1; border: 1px solid ${COLORS.line}; border-radius: 12px; padding: 12px; }
.rpt .tile b { display: block; font-size: 22px; margin-top: 2px; }
.rpt .photos { display: flex; gap: 12px; }
.rpt .photos figure { flex: 1; margin: 0; }
.rpt .photos img { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; border-radius: 12px; }
.rpt .photos figcaption { text-align: center; color: ${COLORS.muted}; font-size: 12px; margin-top: 4px; }
.rpt .note { margin-top: 28px; padding-top: 12px; border-top: 1px solid ${COLORS.line}; }
`;

/**
 * Тело отчёта (внутри .rpt). photoSources — фото «до/после» в виде data:-строк,
 * их готовит приложение: файлы с телефона в PDF вставляются только так.
 */
export function reportBody(data: ReportData, photoSources: { before: string; after: string } | null): string {
  const period = `${isoToRuDate(data.from)} — ${isoToRuDate(data.to)}`;
  const parts: string[] = [];
  parts.push(`<h1>${t.title}</h1>`);
  parts.push(`<div><b>${escapeHtml(data.clientName)}</b>${data.goal ? ` · <span class="muted">${escapeHtml(data.goal)}</span>` : ''}</div>`);
  parts.push(`<div class="muted">${fill(t.period, { period })}</div>`);

  parts.push(`<h2>${t.bodyTitle}</h2>`);
  if (data.rows.length === 0) {
    parts.push(`<p class="muted">${t.noMeasurements}</p>`);
  } else {
    const head = `<tr><th>${t.metric}</th><th class="num">${data.firstDate ? isoToRuDate(data.firstDate) : t.start}</th><th class="num">${data.lastDate ? isoToRuDate(data.lastDate) : t.end}</th><th class="num">${t.change}</th></tr>`;
    const body = data.rows
      .map(
        (row) =>
          `<tr><td>${ru.progress.metrics[row.metric]}</td><td class="num">${formatMeasure(row.start)}${row.unit ? ` ${row.unit}` : ''}</td><td class="num">${formatMeasure(row.end)}${row.unit ? ` ${row.unit}` : ''}</td>${deltaCell(row)}</tr>`,
      )
      .join('');
    parts.push(`<table>${head}${body}</table>`);
    if (data.bodyFatMethod) {
      parts.push(`<p class="faint">${fill(t.methodNote, { method: lowerFirst(ru.methods[data.bodyFatMethod]) })}</p>`);
    }
  }

  if (data.chart) {
    parts.push(`<h2>${fill(t.chartTitle, { metric: ru.progress.metrics[data.chart.metric] })}</h2>`);
    parts.push(lineChartSvg(data.chart.points, data.chart.unit));
  }

  parts.push(`<h2>${t.workoutsTitle}</h2>`);
  parts.push(
    `<div class="tiles"><div class="tile"><span class="muted">${t.workoutsDone}</span><b>${data.workouts.done}</b></div>` +
      `<div class="tile"><span class="muted">${t.workoutsHours}</span><b>${formatMeasure(data.workouts.hours)}</b></div>` +
      `<div class="tile"><span class="muted">${t.workoutsPerWeek}</span><b>${formatMeasure(data.workouts.perWeek)}</b></div></div>`,
  );

  if (data.plan) {
    const plan = data.plan;
    const macros = [
      plan.protein !== null ? `${ru.nutrition.protein} ${formatMeasure(plan.protein)} ${ru.nutrition.grams}` : null,
      plan.fat !== null ? `${ru.nutrition.fat} ${formatMeasure(plan.fat)} ${ru.nutrition.grams}` : null,
      plan.carbs !== null ? `${ru.nutrition.carbs} ${formatMeasure(plan.carbs)} ${ru.nutrition.grams}` : null,
    ].filter(Boolean);
    parts.push(`<h2>${t.nutritionTitle}</h2>`);
    parts.push(
      `<div>${plan.calories !== null ? `<b>${formatInteger(plan.calories)} ${ru.nutrition.perDay}</b>` : ''}${macros.length > 0 ? `<div class="muted">${macros.join(' · ')}</div>` : ''}${plan.notes ? `<div>${escapeHtml(plan.notes)}</div>` : ''}</div>`,
    );
  }

  if (data.photos && photoSources) {
    parts.push(`<h2>${t.photosTitle}</h2>`);
    parts.push(
      `<div class="photos"><figure><img src="${photoSources.before}" alt=""/><figcaption>${ru.progress.before} · ${isoToRuDate(data.photos.before.date)}</figcaption></figure>` +
        `<figure><img src="${photoSources.after}" alt=""/><figcaption>${ru.progress.after} · ${isoToRuDate(data.photos.after.date)}</figcaption></figure></div>`,
    );
  }

  parts.push(`<p class="faint note">${t.disclaimer}</p>`);
  return `<div class="rpt">${parts.join('')}</div>`;
}

/** Полный HTML-документ для печати в PDF */
export function reportDocument(body: string): string {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>@page { margin: 16mm; } body { margin: 0; }${reportCss}</style></head><body>${body}</body></html>`;
}

/** Имя файла отчёта: «Прогресс Анна Петрова 29.09.2026.pdf» — безопасные символы */
export function reportFileName(clientName: string, todayIso: string): string {
  const safe = clientName.replace(/[\\/:*?"<>|]/g, '').trim() || 'подопечный';
  return `${t.fileName} ${safe} ${isoToRuDate(todayIso)}.pdf`;
}
