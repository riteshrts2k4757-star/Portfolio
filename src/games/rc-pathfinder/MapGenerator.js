// ─────────────────────────────────────────────────────────────
//  MapGenerator.js – Procedural RC arena generator
// ─────────────────────────────────────────────────────────────
import { CELL, DIFF_CONFIG } from './GameState.js';

export class MapGenerator {
  constructor() {
    this.grid        = [];
    this.cols        = 0;
    this.rows        = 0;
    this.cellSize    = 44;
    this.source      = null;
    this.destination = null;
    this.checkpoints = [];
  }

  // ── Public API ────────────────────────────────────────────

  /**
   * Generate a new map sized to fit the canvas.
   * @param {number} canvasW
   * @param {number} canvasH
   * @param {string} difficulty - 'EASY' | 'MEDIUM' | 'HARD'
   * @returns {MapData}
   */
  generate(canvasW, canvasH, difficulty = 'MEDIUM') {
    const config = DIFF_CONFIG[difficulty] ?? DIFF_CONFIG.MEDIUM;
    this.cellSize = config.cellSize;

    // Grid dimensions must be odd for recursive-backtracker
    let cols = Math.floor(canvasW / this.cellSize);
    let rows = Math.floor(canvasH / this.cellSize);
    if (cols % 2 === 0) cols--;
    if (rows % 2 === 0) rows--;
    this.cols = Math.max(9, cols);
    this.rows = Math.max(9, rows);

    // Retry until BFS confirms the map is solvable
    let attempts = 0;
    do {
      this._buildMaze(config);
      attempts++;
    } while (attempts < 6 && !this._isSolvable());

    return {
      grid:        this.grid,
      source:      this.source,
      destination: this.destination,
      checkpoints: this.checkpoints,
      cellSize:    this.cellSize,
      cols:        this.cols,
      rows:        this.rows,
    };
  }

  /**
   * AABB + rotation corner collision check.
   * Returns true if any corner of the car rectangle falls inside a wall/obstacle.
   */
  isCollision(x, y, rotation, halfW, halfH) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const corners = [
      [ halfW, -halfH],
      [ halfW,  halfH],
      [-halfW,  halfH],
      [-halfW, -halfH],
    ];
    for (const [dx, dy] of corners) {
      const px  = x + dx * cos - dy * sin;
      const py  = y + dx * sin + dy * cos;
      const col = Math.floor(px / this.cellSize);
      const row = Math.floor(py / this.cellSize);
      if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return true;
      const cell = this.grid[row][col];
      if (cell === CELL.WALL || cell === CELL.OBSTACLE) return true;
    }
    return false;
  }

  /** World-space centre of a grid cell (r, c). */
  getCellCenter(r, c) {
    return {
      x: c * this.cellSize + this.cellSize / 2,
      y: r * this.cellSize + this.cellSize / 2,
    };
  }

  /** True when car centre is close enough to destination to trigger win. */
  isAtDestination(x, y) {
    if (!this.destination) return false;
    const { x: dx, y: dy } = this.getCellCenter(this.destination.r, this.destination.c);
    return Math.hypot(x - dx, y - dy) < this.cellSize * 0.65;
  }

  /**
   * Returns the index of the first un-collected checkpoint the car is over,
   * or -1 if none.
   */
  checkCheckpoints(x, y, collected) {
    if (!this.checkpoints?.length) return -1;
    for (let i = 0; i < this.checkpoints.length; i++) {
      if (collected[i]) continue;
      const { x: cx, y: cy } = this.getCellCenter(this.checkpoints[i].r, this.checkpoints[i].c);
      if (Math.hypot(x - cx, y - cy) < this.cellSize * 0.70) return i;
    }
    return -1;
  }

  // ── Private maze generation ───────────────────────────────

  _buildMaze(config) {
    // 1. Fill grid entirely with walls
    this.grid = Array.from({ length: this.rows }, () =>
      new Array(this.cols).fill(CELL.WALL)
    );

    // 2. Recursive backtracker DFS (steps of 2 → "room" cells at odd indices)
    const visited = new Set();
    const stack   = [];
    const DIRS    = [[-2, 0], [2, 0], [0, -2], [0, 2]];

    const startR = 1, startC = 1;
    this.grid[startR][startC] = CELL.ROAD;
    visited.add(`${startR},${startC}`);
    stack.push([startR, startC]);

    while (stack.length) {
      const [r, c] = stack[stack.length - 1];
      const shuffled = [...DIRS].sort(() => Math.random() - 0.5);
      let carved = false;

      for (const [dr, dc] of shuffled) {
        const nr = r + dr, nc = c + dc;
        const key = `${nr},${nc}`;
        if (
          nr > 0 && nr < this.rows - 1 &&
          nc > 0 && nc < this.cols - 1 &&
          !visited.has(key)
        ) {
          // Carve passage cell between room cells
          this.grid[r + dr / 2][c + dc / 2] = CELL.ROAD;
          this.grid[nr][nc] = CELL.ROAD;
          visited.add(key);
          stack.push([nr, nc]);
          carved = true;
          break;
        }
      }

      if (!carved) stack.pop();
    }

    // 3. Add extra loops to create multiple routes (difficulty-controlled)
    const totalCells = this.rows * this.cols;
    const numLoops   = Math.floor(totalCells * config.extraLoopRatio);
    for (let i = 0; i < numLoops; i++) {
      const r = 1 + Math.floor(Math.random() * (this.rows - 2));
      const c = 1 + Math.floor(Math.random() * (this.cols - 2));
      if (this.grid[r][c] === CELL.WALL) {
        // Only open wall if it connects two road cells (avoids islands)
        const adj = [[-1,0],[1,0],[0,-1],[0,1]].filter(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          return nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols &&
                 this.grid[nr][nc] === CELL.ROAD;
        });
        if (adj.length >= 2) this.grid[r][c] = CELL.ROAD;
      }
    }

    // 4. Place SOURCE in top-left quadrant
    this.source = this._findRoadInZone(
      1, 1,
      Math.floor(this.cols * 0.30),
      Math.floor(this.rows * 0.30)
    );

    // 5. Place DESTINATION in bottom-right quadrant, farthest from source
    this.destination = this._findFarthest(
      this.source,
      Math.floor(this.cols * 0.55), Math.floor(this.rows * 0.55),
      this.cols - 2,               this.rows - 2
    );

    // 6. Obstacles (not near source / destination)
    let placed = 0, attempts = 0;
    while (placed < config.numObstacles && attempts < 3000) {
      attempts++;
      const r = 1 + Math.floor(Math.random() * (this.rows - 2));
      const c = 1 + Math.floor(Math.random() * (this.cols - 2));
      if (
        this.grid[r][c] === CELL.ROAD &&
        this._manhattan(r, c, this.source.r,      this.source.c)      > 4 &&
        this._manhattan(r, c, this.destination.r, this.destination.c) > 4
      ) {
        this.grid[r][c] = CELL.OBSTACLE;
        placed++;
      }
    }

    // 7. Checkpoints – one per quadrant
    this.checkpoints = [];
    const qZones = [
      [Math.floor(this.cols * 0.20), Math.floor(this.rows * 0.20),
       Math.floor(this.cols * 0.50), Math.floor(this.rows * 0.50)],
      [Math.floor(this.cols * 0.50), Math.floor(this.rows * 0.20),
       Math.floor(this.cols * 0.80), Math.floor(this.rows * 0.50)],
      [Math.floor(this.cols * 0.20), Math.floor(this.rows * 0.50),
       Math.floor(this.cols * 0.50), Math.floor(this.rows * 0.80)],
      [Math.floor(this.cols * 0.50), Math.floor(this.rows * 0.50),
       Math.floor(this.cols * 0.80), Math.floor(this.rows * 0.80)],
    ];

    for (let i = 0; i < Math.min(config.numCheckpoints, qZones.length); i++) {
      const [c1, r1, c2, r2] = qZones[i];
      const cp = this._findRoadInZone(c1, r1, c2, r2);
      if (
        cp &&
        this._manhattan(cp.r, cp.c, this.source.r,      this.source.c)      > 3 &&
        this._manhattan(cp.r, cp.c, this.destination.r, this.destination.c) > 3
      ) {
        this.checkpoints.push(cp);
      }
    }
  }

  // ── Zone helpers ─────────────────────────────────────────

  _findRoadInZone(c1, r1, c2, r2) {
    const candidates = [];
    const rc1 = Math.max(1, r1), rc2 = Math.min(this.rows - 2, r2);
    const cc1 = Math.max(1, c1), cc2 = Math.min(this.cols - 2, c2);
    for (let r = rc1; r <= rc2; r++)
      for (let c = cc1; c <= cc2; c++)
        if (this.grid[r][c] === CELL.ROAD) candidates.push({ r, c });

    if (!candidates.length) {
      // Fallback: first road cell anywhere
      for (let r = 1; r < this.rows - 1; r++)
        for (let c = 1; c < this.cols - 1; c++)
          if (this.grid[r][c] === CELL.ROAD) return { r, c };
    }
    return candidates[Math.floor(Math.random() * candidates.length)] ?? { r: 1, c: 1 };
  }

  _findFarthest(from, c1, r1, c2, r2) {
    let best = null, bestDist = -1;
    const rc1 = Math.max(1, r1), rc2 = Math.min(this.rows - 2, r2);
    const cc1 = Math.max(1, c1), cc2 = Math.min(this.cols - 2, c2);
    for (let r = rc1; r <= rc2; r++) {
      for (let c = cc1; c <= cc2; c++) {
        if (this.grid[r][c] === CELL.ROAD) {
          const d = this._manhattan(r, c, from.r, from.c);
          if (d > bestDist) { bestDist = d; best = { r, c }; }
        }
      }
    }
    return best ?? this._findRoadInZone(1, 1, this.cols - 2, this.rows - 2);
  }

  _manhattan(r1, c1, r2, c2) {
    return Math.abs(r1 - r2) + Math.abs(c1 - c2);
  }

  // ── BFS solvability check ────────────────────────────────

  _isSolvable() {
    if (!this.source || !this.destination) return false;
    const vis = Array.from({ length: this.rows }, () => new Uint8Array(this.cols));
    const q = [[this.source.r, this.source.c]];
    vis[this.source.r][this.source.c] = 1;

    while (q.length) {
      const [r, c] = q.shift();
      if (r === this.destination.r && c === this.destination.c) return true;
      for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr = r + dr, nc = c + dc;
        if (
          nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols &&
          !vis[nr][nc] && this.grid[nr][nc] === CELL.ROAD
        ) {
          vis[nr][nc] = 1;
          q.push([nr, nc]);
        }
      }
    }
    return false;
  }
}
