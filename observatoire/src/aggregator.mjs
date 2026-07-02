// Observatoire — aggregator. Reads the market store (large layer) and computes
// the weekly snapshot: the 6 metrics (cadrage §2) + Sara's enriched list (§8/§9):
// techno / posteType / seniority / remote / contract / typeRecruteur / city /
// hybrid office-days / median salary & TJM by seniority / DevRel / stock vs flux.
// by project-worker 2026-06-14

function isoWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const day = (d.getUTCDay() + 6) % 7; // Mon=0
  d.setUTCDate(d.getUTCDate() - day + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 + Math.round((d - firstThursday) / 86400000 / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function tally(offers, key, buckets) {
  const out = Object.fromEntries(buckets.map((b) => [b, 0]));
  for (const o of offers) {
    const v = o[key];
    if (v in out) out[v] += 1;
    else out[v] = (out[v] || 0) + 1;
  }
  return out;
}

function median(nums) {
  const a = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n)).sort((x, y) => x - y);
  if (a.length === 0) return null;
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : Math.round((a[mid - 1] + a[mid]) / 2);
}

function midpoint(min, max) {
  if (min == null && max == null) return null;
  if (min == null) return max;
  if (max == null) return min;
  return (min + max) / 2;
}

/**
 * @param {ObserveOffer[]} offers  all offers in the store
 * @param {object} opts  { asOf, windowDays=21, queries, sources }
 * @returns {ObservatoireSnapshot}
 */
export function aggregate(offers, opts = {}) {
  const asOf = opts.asOf || new Date().toISOString().slice(0, 10);
  const windowDays = opts.windowDays ?? 21;
  const asOfMs = new Date(asOf + 'T00:00:00Z').getTime();

  // stock = offers seen recently (lastSeen within window); flux = firstSeen this week
  const thisWeek = isoWeek(asOf);
  const live = offers.filter(
    (o) => (asOfMs - new Date(o.lastSeen + 'T00:00:00Z').getTime()) / 86400000 <= windowDays,
  );
  const flux = live.filter((o) => isoWeek(o.firstSeen) === thisWeek).length;

  const seniorityBuckets = ['junior', 'confirme', 'senior', 'lead', 'inconnu'];
  const cityCount = {};
  for (const o of live) {
    if (o.city) cityCount[o.city] = (cityCount[o.city] || 0) + 1;
  }
  const cityTop = Object.entries(cityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([city, count]) => ({ city, count }));

  // median CDI salary (use annual midpoint) & median TJM by seniority
  const cdiMedianBySeniority = {};
  const tjmMedianBySeniority = {};
  for (const s of seniorityBuckets) {
    const grp = live.filter((o) => o.seniority === s);
    const sal = grp
      .filter((o) => o.contractType === 'cdi')
      .map((o) => midpoint(o.salaryMin, o.salaryMax))
      .filter((n) => n != null);
    const tjm = grp.map((o) => midpoint(o.tjmMin, o.tjmMax)).filter((n) => n != null);
    const ms = median(sal);
    const mt = median(tjm);
    if (ms != null) cdiMedianBySeniority[s] = Math.round(ms / 1000); // k€
    if (mt != null) tjmMedianBySeniority[s] = mt;
  }

  const hybridDays = live
    .filter((o) => o.remote === 'hybride' && typeof o.officeDaysPerWeek === 'number')
    .map((o) => o.officeDaysPerWeek);
  const avgOfficeDays =
    hybridDays.length > 0
      ? Math.round((hybridDays.reduce((a, b) => a + b, 0) / hybridDays.length) * 10) / 10
      : null;

  return {
    week: thisWeek,
    generatedAt: asOf,
    methodology: {
      sources: opts.sources || ['france-travail'],
      queries: opts.queries || [],
      offersFound: live.length,
      period: `lastSeen ≤ ${windowDays}j avant ${asOf}`,
    },
    counts: { stock: live.length, flux },
    distributions: {
      techno: tally(live, 'techno', ['angular', 'react', 'vue', 'autre']),
      posteType: tally(live, 'posteType', ['front', 'fullstack', 'back', 'inconnu']),
      seniority: tally(live, 'seniority', seniorityBuckets),
      remote: tally(live, 'remote', ['full', 'hybride', 'onsite', 'inconnu']),
      contractType: tally(live, 'contractType', ['cdi', 'freelance', 'autre', 'inconnu']),
      typeRecruteur: tally(live, 'typeRecruteur', [
        'esn',
        'cabinet-recrutement',
        'client-final',
        'inconnu',
      ]),
      cityTop,
    },
    salary: { cdiMedianBySeniority, tjmMedianBySeniority },
    hybrid: { avgOfficeDaysPerWeek: avgOfficeDays },
    devRelCount: live.filter((o) => o.isDevRel).length,
  };
}
