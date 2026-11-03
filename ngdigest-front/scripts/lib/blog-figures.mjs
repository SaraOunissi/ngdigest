/**
 * Éléments visuels du blog générés au build (charte éditoriale NgDigest).
 *
 * `:::chart` — graphique en barres horizontales, sans librairie ni JavaScript :
 *
 *   :::chart Titre | unité | légende du repère | source
 *   - Junior (0-2 ans) | 250-450 | 350
 *   - Senior (5-8 ans) | 500-700 | 580
 *   :::
 *
 * Chaque ligne : libellé | valeur ou fourchette `min-max` | repère facultatif (ex. médiane).
 * Les libellés et valeurs restent du texte HTML (lisible, traduisible, accessible) ;
 * seule la barre est un petit SVG décoratif, dont la géométrie passe par des attributs
 * (pas de style en ligne). L'échelle part de 0 : une barre ne grossit pas un écart.
 *
 * Titres `## Texte {#id}` : l'ancre explicite est retirée du texte affiché et sert d'id.
 */

const NUMBER = /^-?\d+(?:[.,]\d+)?$/;

function toNumber(raw) {
  const text = String(raw ?? '').trim().replace(/\s/g, '').replace(',', '.');
  return NUMBER.test(text) ? Number(text) : null;
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Lit une ligne `- libellé | 250-450 | 350` ; null si la valeur est illisible. */
export function parseChartRow(line) {
  const [label, value, marker] = line.replace(/^\s*-\s*/, '').split('|').map((part) => part.trim());
  if (!label || !value) return null;
  const range = value.match(/^(.+?)\s*[-–]\s*(.+)$/);
  const min = range ? toNumber(range[1]) : 0;
  const max = range ? toNumber(range[2]) : toNumber(value);
  const markerValue = marker ? toNumber(marker) : null;
  if (min === null || max === null || max < min || (marker && markerValue === null)) return null;
  return { label, min, max, isRange: Boolean(range), marker: markerValue };
}

/** Format affiché d'un nombre : séparateur de milliers fin, virgule décimale. */
export function formatChartNumber(value) {
  const [integer, decimals] = String(value).split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return decimals ? `${grouped},${decimals}` : grouped;
}

const round = (value) => Math.round(value * 100) / 100;

/**
 * HTML d'un graphique. `inline` rend le Markdown en ligne (gras, liens) des libellés.
 * Lève une erreur sur une ligne illisible : mieux vaut un build rouge qu'un graphique faux.
 */
export function renderChart(header, rowsText, inline = escapeHtml) {
  const [title = '', unit = '', markerLegend = '', source = ''] = header.split('|').map((part) => part.trim());
  const lines = rowsText.split('\n').filter((line) => line.trim());
  const rows = lines.map((line) => {
    const row = parseChartRow(line);
    if (!row) throw new Error(`:::chart « ${title} » : ligne illisible « ${line.trim()} »`);
    return row;
  });
  if (rows.length === 0) throw new Error(`:::chart « ${title} » : aucune ligne`);

  const scaleMax = Math.max(...rows.map((row) => Math.max(row.max, row.marker ?? 0))) * 1.05;
  const x = (value) => round((value / scaleMax) * 100);
  const suffix = unit ? ` ${escapeHtml(unit)}` : '';

  const items = rows
    .map((row) => {
      const valueText = row.isRange
        ? `${formatChartNumber(row.min)} – ${formatChartNumber(row.max)}${suffix}`
        : `${formatChartNumber(row.max)}${suffix}`;
      const markerText = row.marker !== null ? ` <b class="chart__marker-value">${formatChartNumber(row.marker)}${suffix}</b>` : '';
      const markerRect =
        row.marker !== null ? `<rect class="chart__marker" x="${round(x(row.marker) - 0.6)}" y="0" width="1.2" height="12"/>` : '';
      return (
        `<li class="chart__row"><span class="chart__label">${inline(row.label)}</span>` +
        `<svg class="chart__bar" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">` +
        `<rect class="chart__track" x="0" y="3" width="100" height="6"/>` +
        `<rect class="chart__fill" x="${x(row.min)}" y="3" width="${round(x(row.max) - x(row.min))}" height="6"/>` +
        `${markerRect}</svg>` +
        `<span class="chart__value">${valueText}${markerText}</span></li>`
      );
    })
    .join('');

  const legend = markerLegend ? `<span class="chart__legend"><span class="chart__legend-mark" aria-hidden="true"></span>${inline(markerLegend)}</span>` : '';
  const caption = `<figcaption class="chart__head"><span class="chart__title">${inline(title)}</span>${legend}</figcaption>`;
  const footer = source ? `<p class="chart__source">${inline(source)}</p>` : '';
  return `<figure class="chart">${caption}<ul class="chart__rows">${items}</ul>${footer}</figure>`;
}

/** Remplace chaque bloc `:::chart … :::` du Markdown par son HTML. */
export function transformCharts(md, inline = escapeHtml) {
  return md.replace(/^:::chart([^\n]*)\n([\s\S]*?)\n:::/gm, (_match, header, rows) => `\n\n${renderChart(header, rows, inline)}\n\n`);
}

/** `Texte {#mon-id}` → `{ text: 'Texte', id: 'mon-id' }` ; id null sans ancre explicite. */
export function explicitHeadingId(inner) {
  const match = inner.match(/^([\s\S]*?)\s*\{#([a-z0-9][a-z0-9-]*)\}\s*$/i);
  return match ? { inner: match[1], id: match[2].toLowerCase() } : { inner, id: null };
}
