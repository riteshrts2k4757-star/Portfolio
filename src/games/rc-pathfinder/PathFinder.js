// ─────────────────────────────────────────────────────────────
//  PathFinder.js – A* pathfinding on the map grid
// ─────────────────────────────────────────────────────────────
import { CELL } from './GameState.js';

export class PathFinder {
  /**
   * @param {MapData} mapData - returned by MapGenerator.generate()
   */
  constructor(mapData) {
    this.grid     = mapData.grid;
    this.rows     = mapData.rows ?? this.grid.length;
    this.cols     = mapData.cols ?? this.grid[0].length;
    this.cellSize = mapData.cellSize;
  }

  /**
   * Find the shortest path from (startC, startR) to (destC, destR) using A*.
   *
   * @returns {Array<{c,r,x,y}>|null}  Array of cell + pixel-centre coordinates,
   *                                    or null if no path exists.
   */
  findPath(startC, startR, destC, destR) {
    const key    = (c, r) => `${c},${r}`;
    const openSet   = [];
    const closedSet = new Set();
    const gScore    = {};
    const fScore    = {};
    const cameFrom  = {};

    const startKey = key(startC, startR);
    openSet.push({ c: startC, r: startR, key: startKey });
    gScore[startKey] = 0;
    fScore[startKey] = this._h(startC, startR, destC, destR);

    while (openSet.length > 0) {
      // Pick node with lowest f-score
      let bestIdx = 0;
      for (let i = 1; i < openSet.length; i++) {
        if ((fScore[openSet[i].key] ?? Infinity) < (fScore[openSet[bestIdx].key] ?? Infinity)) {
          bestIdx = i;
        }
      }

      const curr = openSet.splice(bestIdx, 1)[0];

      // Reached destination
      if (curr.c === destC && curr.r === destR) {
        return this._reconstruct(cameFrom, curr.key);
      }

      closedSet.add(curr.key);

      // 4-directional neighbours
      for (const [dc, dr] of [[0,-1],[0,1],[-1,0],[1,0]]) {
        const nc = curr.c + dc;
        const nr = curr.r + dr;
        if (nr < 0 || nr >= this.rows || nc < 0 || nc >= this.cols) continue;
        if (this.grid[nr][nc] !== CELL.ROAD) continue;

        const nk = key(nc, nr);
        if (closedSet.has(nk)) continue;

        const tg = (gScore[curr.key] ?? 0) + 1;
        const inOpen = openSet.find(n => n.key === nk);

        if (!inOpen) {
          openSet.push({ c: nc, r: nr, key: nk });
        } else if (tg >= (gScore[nk] ?? Infinity)) {
          continue;
        }

        cameFrom[nk]  = curr.key;
        gScore[nk]    = tg;
        fScore[nk]    = tg + this._h(nc, nr, destC, destR);
      }
    }

    return null; // No path found
  }

  // ── Helpers ──────────────────────────────────────────────

  /** Manhattan distance heuristic. */
  _h(c1, r1, c2, r2) {
    return Math.abs(c1 - c2) + Math.abs(r1 - r2);
  }

  /** Walk cameFrom chain and build the path array with pixel centres. */
  _reconstruct(cameFrom, endKey) {
    const path = [];
    let curr   = endKey;
    while (curr) {
      const [c, r] = curr.split(',').map(Number);
      path.unshift({
        c, r,
        x: c * this.cellSize + this.cellSize / 2,
        y: r * this.cellSize + this.cellSize / 2,
      });
      curr = cameFrom[curr] ?? null;
    }
    return path;
  }
}
