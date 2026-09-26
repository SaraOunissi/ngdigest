import { OBSERVATOIRE_2026_07, OBSERVATOIRE_2026_09, OBSERVATOIRE_LATEST } from './observatoire.data';

/**
 * Guards the editorial invariant of the observatoire: it publishes ONLY the
 * "🟢 assez solides pour publier" figures, every one of them carries a dated
 * public source, and the charts keep their expected shape.
 */
describe('OBSERVATOIRE_2026_07 snapshot', () => {
  const snapshot = OBSERVATOIRE_2026_07;

  it('carries dated baseline snapshot metadata', () => {
    expect(snapshot.meta.id).toBe('2026-07');
    expect(snapshot.meta.collected).toBe('2026-07-03');
    expect(snapshot.meta.baseline).toBe(true);
  });

  it('publishes only 🟢 figures — every KPI and chart is "published" and bilingual', () => {
    for (const kpi of snapshot.kpis) {
      expect(kpi.status).toBe('published');
      expect(kpi.value.fr).toBeTruthy();
      expect(kpi.value.en).toBeTruthy();
    }
    for (const chart of snapshot.charts) {
      expect(chart.status).toBe('published');
    }
  });

  it('gives every published figure a dated, clickable https source (E-E-A-T)', () => {
    const sources = [
      ...snapshot.kpis.map((kpi) => kpi.source),
      ...snapshot.charts.map((chart) => chart.source),
      ...snapshot.sources,
    ];
    for (const source of sources) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.label).toBeTruthy();
      expect(source.date).toBeTruthy();
    }
  });

  it('sums the remote donut segments to 100%', () => {
    const donut = snapshot.charts.find((chart) => chart.kind === 'donut');
    const total = (donut?.segments ?? []).reduce((sum, segment) => sum + segment.value, 0);
    expect(total).toBeCloseTo(100, 1);
  });

  it('keeps the scissors AI line’s known mid-point data gap (null, not invented)', () => {
    const scissors = snapshot.charts.find((chart) => chart.kind === 'scissors');
    const aiLine = scissors?.series?.find((serie) => serie.key === 'ia');
    expect(aiLine?.points.some((point) => point.v === null)).toBe(true);
  });

  it('exposes the three v2 "coming soon" blocks', () => {
    expect(snapshot.soon.map((block) => block.id)).toEqual([
      'front-vs-fullstack',
      'combos',
      'seniorite',
    ]);
  });
});

describe('OBSERVATOIRE_2026_09 snapshot', () => {
  const snapshot = OBSERVATOIRE_2026_09;

  it('is the latest snapshot rendered by the page, dated from the 22/09 reading', () => {
    expect(OBSERVATOIRE_LATEST).toBe(snapshot);
    expect(snapshot.meta.id).toBe('2026-09');
    expect(snapshot.meta.collected).toBe('2026-09-22');
    expect(snapshot.meta.baseline).toBe(false);
  });

  it('keeps every figure published, bilingual and backed by a dated https source', () => {
    for (const kpi of snapshot.kpis) {
      expect(kpi.status).toBe('published');
      expect(kpi.value.fr).toBeTruthy();
      expect(kpi.value.en).toBeTruthy();
    }
    const sources = [
      ...snapshot.kpis.map((kpi) => kpi.source),
      ...snapshot.charts.flatMap((chart) => [chart.source, ...(chart.source2 ? [chart.source2] : [])]),
      ...snapshot.sources,
    ];
    for (const source of sources) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.date).toBeTruthy();
    }
  });

  it('extends the July series instead of reshaping it (no August point is invented)', () => {
    const technos = snapshot.charts.find((chart) => chart.id === 'technos');
    for (const serie of technos?.series ?? []) {
      expect(serie.points.map((point) => point.t)).toEqual(['2026-07', '2026-09']);
    }
    const angular = technos?.series?.find((serie) => serie.key === 'angular');
    expect(angular?.points.map((point) => point.v)).toEqual([20.7, 22.1]);
  });

  it('shows the 22/09 Malt daily rates by seniority around the 536 € average', () => {
    const salary = snapshot.charts.find((chart) => chart.id === 'salary');
    expect(salary?.bars?.map((bar) => bar.value)).toEqual([299, 407, 536, 582]);
    expect(salary?.avg).toBe(536);
  });

  it('keeps the same chart layout as July so the page selects them by id', () => {
    expect(snapshot.charts.map((chart) => chart.id)).toEqual(
      OBSERVATOIRE_2026_07.charts.map((chart) => chart.id),
    );
  });
});
