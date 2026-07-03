// Observatoire — market store. Append-only, dedup-aware persistence of the LARGE
// (unfiltered) collection layer. One JSONL file = the running market state.
// Dedup by fingerprint: known offer → bump lastSeen (still online), not recounted
// as new. Yields two measures: stock (live offers) vs flux (new this week).
// Source: cadrage §9 (dedup) + §5 (storage: _state raw, recommended).
// by project-worker 2026-06-14

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/** Load the store as a Map<fingerprint, ObserveOffer>. */
export function loadStore(path) {
  const map = new Map();
  if (!existsSync(path)) return map;
  const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const o = JSON.parse(line);
      map.set(o.fingerprint, o);
    } catch {
      /* skip malformed line (audit-tolerant) */
    }
  }
  return map;
}

/** Persist the store as JSONL (one offer per line, sorted by fingerprint). */
export function saveStore(path, map) {
  mkdirSync(dirname(path), { recursive: true });
  const out = [...map.values()]
    .sort((a, b) => a.fingerprint.localeCompare(b.fingerprint))
    .map((o) => JSON.stringify(o))
    .join('\n');
  writeFileSync(path, out + '\n', 'utf8');
}

/**
 * Merge a batch of freshly normalized offers into the store.
 * Returns { newCount, updatedCount } = (flux, still-online).
 */
export function mergeBatch(map, offers, scanDate) {
  let newCount = 0;
  let updatedCount = 0;
  for (const offer of offers) {
    const existing = map.get(offer.fingerprint);
    if (existing) {
      existing.lastSeen = scanDate;
      updatedCount += 1;
    } else {
      map.set(offer.fingerprint, { ...offer, firstSeen: scanDate, lastSeen: scanDate });
      newCount += 1;
    }
  }
  return { newCount, updatedCount };
}
