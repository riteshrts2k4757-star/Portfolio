// ─────────────────────────────────────────────────────────────
//  Renderer.js – Full canvas renderer for RC PATHFINDER
// ─────────────────────────────────────────────────────────────
import { CELL } from './GameState.js';

export class Renderer {
  constructor(canvas, minimapCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.minimapCanvas = minimapCanvas ?? null;
    this.minimapCtx = minimapCanvas?.getContext('2d') ?? null;
  }

  // ── Public entry point ────────────────────────────────────

  render(gs) {
    const t = Date.now() / 1000;
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Light green background
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(0, 0, W, H);

    if (!gs.mapData) return;

    let cx = 0, cy = 0;
    if (gs.car) {
      const mapW = gs.mapData.cols * gs.mapData.cellSize;
      const mapH = gs.mapData.rows * gs.mapData.cellSize;
      cx = gs.car.x - W / 2;
      cy = gs.car.y - H / 2;
      cx = Math.max(0, Math.min(cx, mapW - W));
      cy = Math.max(0, Math.min(cy, mapH - H));
    }

    // Viewport bounds for culling optimization
    const cellSize = gs.mapData.cellSize;
    const bounds = {
      startC: Math.max(0, Math.floor(cx / cellSize)),
      startR: Math.max(0, Math.floor(cy / cellSize)),
      endC: Math.min(gs.mapData.cols, Math.ceil((cx + W) / cellSize)),
      endR: Math.min(gs.mapData.rows, Math.ceil((cy + H) / cellSize))
    };

    ctx.save();
    ctx.translate(-cx, -cy);

    this._drawRoadsAndWalls(gs.mapData, bounds);
    this._drawObstacles(gs.mapData, bounds);

    if (gs.playerRoute?.length > 1) this._drawPlayerRoute(gs.playerRoute);
    if (gs.showOptimalPath && gs.optimalPath?.length > 1) this._drawOptimalPath(gs.optimalPath);

    this._drawSource(gs.mapData, t);
    this._drawDestination(gs.mapData, t);
    this._drawCar(gs.car, gs.isColliding);

    ctx.restore();

    if (this.minimapCtx) this._drawMinimap(gs, t);
  }

  // ── Map layers ───────────────────────────────────────────

  _drawRoadsAndWalls({ grid, cellSize }, bounds) {
    const ctx = this.ctx;
    // Draw simple grid pattern
    ctx.strokeStyle = '#bbf7d0';
    ctx.lineWidth = 1;
    for (let r = bounds.startR; r <= bounds.endR; r++) {
      ctx.beginPath(); ctx.moveTo(bounds.startC * cellSize, r * cellSize); ctx.lineTo(bounds.endC * cellSize, r * cellSize); ctx.stroke();
    }
    for (let c = bounds.startC; c <= bounds.endC; c++) {
      ctx.beginPath(); ctx.moveTo(c * cellSize, bounds.startR * cellSize); ctx.lineTo(c * cellSize, bounds.endR * cellSize); ctx.stroke();
    }

    for (let r = bounds.startR; r < bounds.endR; r++) {
      for (let c = bounds.startC; c < bounds.endC; c++) {
        const cell = grid[r][c];
        const x = c * cellSize, y = r * cellSize;
        if (cell === CELL.ROAD || cell === CELL.CHECKPOINT) {
          ctx.fillStyle = '#d1fae5';
          ctx.fillRect(x, y, cellSize, cellSize);
        } else if (cell === CELL.WALL) {
          ctx.fillStyle = '#34d399';
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, cellSize, cellSize);
        }
      }
    }
  }

  _drawObstacles({ grid, cellSize }, bounds) {
    const ctx = this.ctx;
    for (let r = bounds.startR; r < bounds.endR; r++) {
      for (let c = bounds.startC; c < bounds.endC; c++) {
        if (grid[r][c] === CELL.OBSTACLE) {
          const x = c * cellSize, y = r * cellSize;
          const padding = cellSize * 0.2;
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2);
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2);
        }
      }
    }
  }

  _drawPlayerRoute(route) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(5, 150, 105, 0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(route[0].x, route[0].y);
    for (let i = 1; i < route.length; i++) ctx.lineTo(route[i].x, route[i].y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  _drawOptimalPath(path) {
    const ctx = this.ctx;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.stroke();
  }

  _drawSource({ source, cellSize }, t) {
    if (!source) return;
    const ctx = this.ctx;
    const x = source.c * cellSize + cellSize / 2;
    const y = source.r * cellSize + cellSize / 2;
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath(); ctx.arc(x, y, cellSize * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('START', x, y - cellSize * 0.3);
  }

  _drawDestination({ destination, cellSize }, t) {
    if (!destination) return;
    const ctx = this.ctx;
    const x = destination.c * cellSize + cellSize / 2;
    const y = destination.r * cellSize + cellSize / 2;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(x, y, cellSize * 0.25 + Math.sin(t * 5) * 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7f1d1d';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH', x, y - cellSize * 0.4);
  }

  _drawCar(car, isColliding) {
    if (!car) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.rotation);

    const HW = 18; // Half length (front to back)
    const HH = 10; // Half width (side to side)

    // Drop shadow for the entire car
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 5;

    // ── Wheels (drawn underneath) ──
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#1f2937'; // Dark gray tires
    const wL = 8, wH = 4;
    // Front wheels
    ctx.fillRect(HW - 11, -HH - wH + 1, wL, wH);
    ctx.fillRect(HW - 11, HH - 1, wL, wH);
    // Rear wheels
    ctx.fillRect(-HW + 3, -HH - wH + 1, wL, wH);
    ctx.fillRect(-HW + 3, HH - 1, wL, wH);

    // ── Main Car Body ──
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.fillStyle = isColliding ? '#ef4444' : '#10b981';
    ctx.beginPath();
    ctx.roundRect(-HW, -HH, HW * 2, HH * 2, 6);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ── Roof / Cabin ──
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.roundRect(-HW * 0.3, -HH + 2, HW * 0.9, HH * 2 - 4, 4);
    ctx.fill();

    // ── Windshield (Dark Glass) ──
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(HW * 0.6, -HH + 2.5);
    ctx.lineTo(HW * 0.8, -HH + 3.5);
    ctx.lineTo(HW * 0.8, HH - 3.5);
    ctx.lineTo(HW * 0.6, HH - 2.5);
    ctx.fill();

    // ── Rear Window ──
    ctx.beginPath();
    ctx.moveTo(-HW * 0.3, -HH + 2.5);
    ctx.lineTo(-HW * 0.45, -HH + 3.5);
    ctx.lineTo(-HW * 0.45, HH - 3.5);
    ctx.lineTo(-HW * 0.3, HH - 2.5);
    ctx.fill();

    // ── Headlights (Yellow/White) ──
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(HW - 2, -HH + 2, 2, 4);
    ctx.fillRect(HW - 2, HH - 6, 2, 4);

    // Subtle Headlight Glow
    ctx.shadowColor = 'rgba(253, 224, 71, 0.7)';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(HW, -HH + 2, 1, 4);
    ctx.fillRect(HW, HH - 6, 1, 4);
    ctx.shadowBlur = 0;

    // ── Taillights (Red) ──
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-HW, -HH + 2, 2, 4);
    ctx.fillRect(-HW, HH - 6, 2, 4);

    ctx.restore();
  }

  _drawMinimap(gs, t) {
    const ctx = this.minimapCtx;
    const mc = this.minimapCanvas;
    if (!ctx || !mc || !gs.mapData) return;

    const { grid, cellSize, source, destination } = gs.mapData;
    const mW = mc.width, mH = mc.height;
    const sx = mW / (grid[0].length * cellSize);
    const sy = mH / (grid.length * cellSize);

    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(0, 0, mW, mH);

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        const cell = grid[r][c];
        if (cell === CELL.WALL) {
          ctx.fillStyle = '#34d399';
          ctx.fillRect(c * cellSize * sx, r * cellSize * sy, cellSize * sx + 0.5, cellSize * sy + 0.5);
        }
      }
    }

    if (destination) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc((destination.c * cellSize + cellSize / 2) * sx, (destination.r * cellSize + cellSize / 2) * sy, 3, 0, Math.PI * 2); ctx.fill();
    }

    if (gs.car) {
      ctx.fillStyle = '#059669';
      ctx.beginPath(); ctx.arc(gs.car.x * sx, gs.car.y * sy, 4, 0, Math.PI * 2); ctx.fill();
    }

    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, mW, mH);
  }
}
