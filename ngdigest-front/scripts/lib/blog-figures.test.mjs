import { test } from 'node:test';
import assert from 'node:assert/strict';

import { explicitHeadingId, formatChartNumber, parseChartRow, renderChart, transformCharts } from './blog-figures.mjs';

test('lit une fourchette avec repère, une valeur seule, et refuse une ligne fausse', () => {
  assert.deepEqual(parseChartRow('- Junior (0-2 ans) | 250-450 | 350'), { label: 'Junior (0-2 ans)', min: 250, max: 450, isRange: true, marker: 350 });
  assert.deepEqual(parseChartRow('- Paris | 538'), { label: 'Paris', min: 0, max: 538, isRange: false, marker: null });
  assert.equal(parseChartRow('- Senior | 700-500'), null);
  assert.equal(parseChartRow('- Senior | beaucoup'), null);
  assert.equal(parseChartRow('- Senior | 500-700 | ?'), null);
});

test('écrit les nombres à la française', () => {
  assert.equal(formatChartNumber(12347), '12 347');
  assert.equal(formatChartNumber(4.5), '4,5');
});

test('dessine des barres proportionnelles à partir de zéro', () => {
  const html = renderChart('TJM | €/j | médiane | Source : Malt', '- A | 0-500 | 250\n- B | 1000');
  assert.match(html, /<figure class="chart">/);
  assert.match(html, /<rect class="chart__fill" x="0" y="3" width="47.62" height="6"\/>/);
  assert.match(html, /<rect class="chart__fill" x="0" y="3" width="95.24" height="6"\/>/);
  assert.match(html, /chart__marker" x="23.21"/);
  assert.match(html, /500 €\/j/);
  assert.match(html, /Source : Malt/);
  assert.doesNotMatch(html, /style=/);
});

test('refuse un graphique avec une ligne illisible plutôt que de dessiner faux', () => {
  assert.throws(() => renderChart('TJM | €', '- A | 300\n- B | n/a'), /ligne illisible/);
});

test('remplace le bloc dans le Markdown sans toucher au reste', () => {
  const md = 'Avant\n\n:::chart Titre | €\n- A | 1\n:::\n\nAprès';
  const out = transformCharts(md);
  assert.match(out, /^Avant\n\n\n\n<figure class="chart">/);
  assert.match(out, /<\/figure>\n\n\n\nAprès$/);
});

test("extrait l'ancre explicite d'un titre", () => {
  assert.deepEqual(explicitHeadingId('Barème actualisé {#bareme-2026}'), { inner: 'Barème actualisé', id: 'bareme-2026' });
  assert.deepEqual(explicitHeadingId('Sans ancre'), { inner: 'Sans ancre', id: null });
});
