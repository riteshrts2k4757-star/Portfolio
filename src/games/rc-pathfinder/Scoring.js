// ─────────────────────────────────────────────────────────────
//  Scoring.js – Score calculation & rank assignment
// ─────────────────────────────────────────────────────────────

export class Scoring {
  /**
   * Compute a 0–1000 score from run statistics.
   * @param {Object} opts
   * @param {number} opts.time               - elapsed seconds
   * @param {number} opts.distanceTravelled  - pixels driven
   * @param {number} opts.optimalDistance    - A* path length in pixels
   * @param {number} opts.collisions         - collision count
   * @param {number} opts.checkpointsHit     - number of checkpoints collected
   * @param {number} opts.totalCheckpoints   - total checkpoints on map
   * @returns {{ score: number, rank: string }}
   */
  static compute({ time, distanceTravelled, optimalDistance, collisions, checkpointsHit, totalCheckpoints }) {
    let score = 1000;

    // ── Deductions ──────────────────────────────────────────
    // Each collision costs 50 points
    score -= (collisions || 0) * 50;

    // Extra distance penalty: -8 per 10 px over optimal
    const extraDist = Math.max(0, distanceTravelled - (optimalDistance || 0));
    score -= Math.floor(extraDist / 10) * 8;

    // Time penalty: -2 per second over 60 s
    const extraTime = Math.max(0, (time || 0) - 60);
    score -= Math.floor(extraTime) * 2;

    // Missed checkpoint penalty
    const missed = (totalCheckpoints || 0) - (checkpointsHit || 0);
    score -= missed * 20;

    // ── Bonuses ─────────────────────────────────────────────
    score += (checkpointsHit || 0) * 30;   // +30 per checkpoint
    if ((collisions || 0) === 0) score += 100; // perfect run bonus

    score = Math.max(0, Math.min(1000, Math.round(score)));

    // ── Rank ────────────────────────────────────────────────
    let rank;
    if (score >= 900)      rank = 'PERFECT DRIVER';
    else if (score >= 750) rank = 'EXPERT DRIVER';
    else if (score >= 500) rank = 'GOOD DRIVER';
    else                   rank = 'ROOKIE DRIVER';

    return { score, rank };
  }

  /**
   * Format elapsed seconds as MM:SS.cc
   * @param {number} seconds
   * @returns {string}
   */
  static formatTime(seconds) {
    if (!seconds || seconds < 0) return '00:00.00';
    const m  = Math.floor(seconds / 60);
    const s  = Math.floor(seconds % 60);
    const cs = Math.floor((seconds % 1) * 100);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }
}
