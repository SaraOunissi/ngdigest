/**
 * Pure decision logic for the /jobs dead-link monitor.
 *
 * Kept free of any I/O (no fetch, no fs) so it can be unit-tested with the
 * built-in Node test runner. The CLI wrapper `scripts/check-jobs-links.mjs`
 * performs the network probes and file writes, delegating every *decision* to
 * the functions below.
 *
 * Model: within a single run the CLI probes an offer's `url` several times, a
 * few seconds apart, and each probe produces an Outcome. Consecutive DEAD
 * outcomes accumulate "strikes"; once an active offer reaches FAIL_THRESHOLD
 * strikes it is flipped to `expired` for Sara to review (a PR is opened, never
 * merged automatically). ALIVE resets the strikes so a single healthy response
 * cancels the run; INCONCLUSIVE (bot-blocked / server hiccup) holds them, so a
 * transient 403 or 500 never wrongly expires a good pépite. Keeping the whole
 * decision inside one run means no cross-run state has to be persisted.
 */

/** Number of *consecutive* dead probes within a run before expiring an offer. */
export const FAIL_THRESHOLD = 2;

/** Classification of a single URL probe. */
export const Outcome = Object.freeze({
  /** 2xx / 3xx — the offer page is reachable. Resets strikes. */
  ALIVE: 'alive',
  /** 404 / 410 or a network-level failure. Counts a strike. */
  DEAD: 'dead',
  /** 401 / 403 / 429 / 5xx — reachable but we can't tell. Holds strikes. */
  INCONCLUSIVE: 'inconclusive',
});

/**
 * Classify an HTTP probe result into an {@link Outcome}.
 *
 * @param {{ status?: number, networkError?: boolean }} probe
 *   `networkError` is true when the request never produced a response
 *   (DNS failure, connection refused, timeout, …).
 * @returns {string} one of {@link Outcome}
 */
export function classifyOutcome({ status, networkError } = {}) {
  if (networkError) {
    return Outcome.DEAD;
  }
  if (typeof status !== 'number') {
    return Outcome.INCONCLUSIVE;
  }
  if (status >= 200 && status < 400) {
    return Outcome.ALIVE;
  }
  if (status === 404 || status === 410) {
    return Outcome.DEAD;
  }
  // 401 / 403 / 405 / 429 / 5xx and anything else: don't punish a live page
  // that merely blocks bots or hiccuped server-side.
  return Outcome.INCONCLUSIVE;
}

/**
 * Compute the next health record from the previous one and a probe outcome.
 *
 * @param {{ strikes?: number } | null | undefined} previous
 * @param {string} outcome one of {@link Outcome}
 * @param {{ status?: number | null }} [meta]
 * @returns {{ strikes: number, lastOutcome: string, lastStatus: number | null }}
 */
export function updateHealth(previous, outcome, meta = {}) {
  const priorStrikes = previous?.strikes ?? 0;
  let strikes = priorStrikes;
  if (outcome === Outcome.ALIVE) {
    strikes = 0;
  } else if (outcome === Outcome.DEAD) {
    strikes = priorStrikes + 1;
  }
  // Outcome.INCONCLUSIVE leaves the strike count untouched.
  return {
    strikes,
    lastOutcome: outcome,
    lastStatus: meta.status ?? null,
  };
}

/**
 * Decide the offer status after a probe.
 *
 * The flip is an *event*: an `active` offer expires only on the run whose own
 * DEAD outcome pushes it to {@link FAIL_THRESHOLD} consecutive strikes. This
 * keeps status and ledger consistent and means a held threshold under an
 * INCONCLUSIVE probe never re-expires an offer Sara has just re-activated.
 * An already-expired offer is never auto-resurrected — that stays a human call.
 *
 * @param {string} currentStatus `active` | `expired`
 * @param {string} outcome one of {@link Outcome}
 * @param {{ strikes?: number }} health the *post-probe* health record
 * @returns {string} the status the offer should now carry
 */
export function decideStatus(currentStatus, outcome, health) {
  const strikes = health?.strikes ?? 0;
  if (currentStatus === 'active' && outcome === Outcome.DEAD && strikes >= FAIL_THRESHOLD) {
    return 'expired';
  }
  return currentStatus;
}

/**
 * Read a scalar frontmatter field from a raw Markdown file.
 * Returns the unquoted string value, or `null` when absent.
 *
 * @param {string} raw full file contents (frontmatter + body)
 * @param {string} field frontmatter key, e.g. `url`
 * @returns {string | null}
 */
export function readFrontmatterField(raw, field) {
  const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) {
    return null;
  }
  const line = frontmatter[1].match(new RegExp(`^${field}:[ \\t]*(.+?)[ \\t]*$`, 'm'));
  if (!line) {
    return null;
  }
  return line[1].replace(/^["']|["']$/g, '');
}

/**
 * Replace the `status:` line inside the Markdown frontmatter block, preserving
 * every other byte so diffs stay minimal. No-ops (returns `raw` unchanged) when
 * there is no frontmatter, no status line, or the value already matches.
 *
 * @param {string} raw full file contents
 * @param {string} newStatus the status to write
 * @returns {string}
 */
export function setFrontmatterStatus(raw, newStatus) {
  const frontmatter = raw.match(/^---\r?\n[\s\S]*?\r?\n---/);
  if (!frontmatter) {
    return raw;
  }
  const block = frontmatter[0];
  const rewritten = block.replace(/^(status:[ \t]*).*$/m, `$1${newStatus}`);
  if (rewritten === block) {
    return raw;
  }
  // Function replacement avoids `$` sequences in `rewritten` being interpreted.
  return raw.replace(block, () => rewritten);
}

/**
 * End-to-end evaluation of one offer for a single run — the seam the CLI and
 * the tests both drive.
 *
 * @param {{ currentStatus: string, previousHealth?: object | null, probe: { status?: number | null, networkError?: boolean } }} input
 * @returns {{ outcome: string, health: object, newStatus: string, changed: boolean }}
 */
export function evaluateOffer({ currentStatus, previousHealth, probe }) {
  const outcome = classifyOutcome(probe);
  const health = updateHealth(previousHealth, outcome, {
    status: probe?.status ?? null,
  });
  const newStatus = decideStatus(currentStatus, outcome, health);
  return {
    outcome,
    health,
    newStatus,
    changed: newStatus !== currentStatus,
  };
}
