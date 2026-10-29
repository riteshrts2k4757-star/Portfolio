// ─────────────────────────────────────────────────────────────
//  Renderer.js – Full canvas renderer for RC PATHFINDER
// ─────────────────────────────────────────────────────────────
import { CELL } from './GameState.js';

const CAR_COLORS = {
  paint: '#22c55e',
  paintLight: '#86efac',
  paintDark: '#15803d',
  outline: '#14532d',
  tire: '#18231d',
  tireHighlight: '#64736a',
  cabin: '#174d46',
  glass: '#67e8d2',
  glassHighlight: '#d9fff8',
  stripe: '#fff7cc',
  headlight: '#fff1b8',
  taillight: '#fb7185',
};

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
    const root = document.documentElement;
    const theme = root.dataset.theme;
    const accentName = root.dataset.accent;
    if (theme !== this.paletteTheme || accentName !== this.paletteAccent) {
      const dark = theme === 'dark';
      const style = getComputedStyle(root);
      const accent = style.getPropertyValue('--accent-2').trim() || '#22c55e';
      const accentBright = style.getPropertyValue('--accent-1').trim() || accent;
      const accentRgb = style.getPropertyValue('--accent-rgb').trim() || '34, 197, 94';
      this.paletteTheme = theme;
      this.paletteAccent = accentName;
      this.colors = {
        background: dark ? '#101311' : '#f5f7f5',
        grid: dark ? '#303a33' : '#ccd8cf',
        road: dark ? '#171b18' : '#edf3ee',
        wall: `rgba(${accentRgb}, ${dark ? 0.22 : 0.14})`,
        wallStroke: accentBright,
        minimapBackground: dark ? '#101311' : '#e5ebe6',
        minimapRoad: dark ? '#171b18' : '#f8faf8',
        minimapWall: `rgba(${accentRgb}, ${dark ? 0.34 : 0.28})`,
        minimapWallStroke: accent,
        minimapBorder: dark ? '#7f9485' : '#52645a',
        minimapMarkerOutline: dark ? '#101311' : '#ffffff',
        boundary: accentBright,
        path: accent,
        sourceLabel: dark ? '#d4e4d8' : '#1e3a8a',
        destinationLabel: dark ? '#ffd4d4' : '#7f1d1d',
      };
    }

    ctx.fillStyle = this.colors.background;
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
    this._drawCar(gs.car);

    ctx.restore();

    if (this.minimapCtx) this._drawMinimap(gs, t);
  }

  // ── Map layers ───────────────────────────────────────────

  _drawRoadsAndWalls({ grid, cellSize }, bounds) {
    const ctx = this.ctx;
    // Draw simple grid pattern
    ctx.strokeStyle = this.colors.grid;
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
          ctx.fillStyle = this.colors.road;
          ctx.fillRect(x, y, cellSize, cellSize);
        } else if (cell === CELL.WALL) {
          ctx.fillStyle = this.colors.wall;
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = this.colors.wallStroke;
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, cellSize, cellSize);
        }
      }
    }

    ctx.strokeStyle = this.colors.boundary;
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, grid[0].length * cellSize - 3, grid.length * cellSize - 3);
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
    ctx.strokeStyle = this.colors.path;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(route[0].x, route[0].y);
    for (let i = 1; i < route.length; i++) ctx.lineTo(route[i].x, route[i].y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  _drawOptimalPath(path) {
    const ctx = this.ctx;
    ctx.strokeStyle = this.colors.path;
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
    ctx.fillStyle = this.colors.sourceLabel;
    ctx.strokeStyle = this.colors.background;
    ctx.lineWidth = 3;
    ctx.font = '700 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText('START', x, y - cellSize * 0.3);
    ctx.fillText('START', x, y - cellSize * 0.3);
  }

  _drawDestination({ destination, cellSize }, t) {
    if (!destination) return;
    const ctx = this.ctx;
    const x = destination.c * cellSize + cellSize / 2;
    const y = destination.r * cellSize + cellSize / 2;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(x, y, cellSize * 0.25 + Math.sin(t * 5) * 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = this.colors.destinationLabel;
    ctx.strokeStyle = this.colors.background;
    ctx.lineWidth = 3;
    ctx.font = '700 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText('FINISH', x, y - cellSize * 0.4);
    ctx.fillText('FINISH', x, y - cellSize * 0.4);
  }

  _drawCar(car) {
    if (!car) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.rotation);

    const HW = 18;
    const HH = 10;
    const wheelX = [-HW + 3, HW - 11];
    const bodyGradient = ctx.createLinearGradient(-HW, 0, HW, 0);
    bodyGradient.addColorStop(0, CAR_COLORS.paintDark);
    bodyGradient.addColorStop(0.22, CAR_COLORS.paint);
    bodyGradient.addColorStop(0.68, CAR_COLORS.paintLight);
    bodyGradient.addColorStop(1, CAR_COLORS.paint);
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(-HW + 4, -HH);
    ctx.quadraticCurveTo(-HW, -HH, -HW, -HH + 4);
    ctx.lineTo(-HW, HH - 4);
    ctx.quadraticCurveTo(-HW, HH, -HW + 4, HH);
    ctx.lineTo(7, HH);
    ctx.quadraticCurveTo(13, HH, 16, HH - 5);
    ctx.lineTo(HW, 2);
    ctx.quadraticCurveTo(HW + 0.5, 0, HW, -2);
    ctx.lineTo(16, -HH + 5);
    ctx.quadraticCurveTo(13, -HH, 7, -HH);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = CAR_COLORS.outline;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sculpted fender panels and exposed tires define the chassis silhouette.
    ctx.fillStyle = CAR_COLORS.paintDark;
    ctx.beginPath();
    ctx.roundRect(-13.5, -8.5, 5, 2, 1);
    ctx.roundRect(7.5, -8.5, 5, 2, 1);
    ctx.roundRect(-13.5, 6.5, 5, 2, 1);
    ctx.roundRect(7.5, 6.5, 5, 2, 1);
    ctx.fill();

    ctx.fillStyle = CAR_COLORS.tire;
    ctx.strokeStyle = CAR_COLORS.tireHighlight;
    ctx.lineWidth = 1;
    for (const x of wheelX) {
      for (const y of [-HH - 2, HH + 2]) {
        ctx.beginPath();
        ctx.roundRect(x, y - 3.5, 8, 7, 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#cbd5ce';
        ctx.fillRect(x + 2, y - 0.7, 4, 1.4);
        ctx.fillStyle = CAR_COLORS.tire;
      }
    }

    // Compact cockpit with a broad windshield and rear window.
    ctx.fillStyle = CAR_COLORS.cabin;
    ctx.beginPath();
    ctx.roundRect(-8.5, -6.6, 16, 13.2, 4);
    ctx.fill();
    ctx.strokeStyle = CAR_COLORS.outline;
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.fillStyle = CAR_COLORS.glass;
    ctx.beginPath();
    ctx.moveTo(4, -5.3);
    ctx.lineTo(6, -4.2);
    ctx.lineTo(6, 4.2);
    ctx.lineTo(4, 5.3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5, -5);
    ctx.lineTo(-7, -4);
    ctx.lineTo(-7, 4);
    ctx.lineTo(-5, 5);
    ctx.fill();

    ctx.strokeStyle = CAR_COLORS.glassHighlight;
    ctx.lineWidth = 0.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, -4.4);
    ctx.lineTo(2.2, -4.4);
    ctx.stroke();

    ctx.strokeStyle = CAR_COLORS.stripe;
    ctx.lineWidth = 1.2;
    for (const y of [-2.4, 2.4]) {
      ctx.beginPath();
      ctx.moveTo(8, y);
      ctx.lineTo(15, y);
      ctx.stroke();
    }

    // Fixed-color front lamps and rear running lights.
    ctx.fillStyle = CAR_COLORS.headlight;
    ctx.beginPath();
    ctx.roundRect(15, -7, 2.5, 3, 1);
    ctx.roundRect(15, 4, 2.5, 3, 1);
    ctx.fill();
    ctx.fillStyle = CAR_COLORS.taillight;
    ctx.beginPath();
    ctx.roundRect(-17, -7, 2, 3, 1);
    ctx.roundRect(-17, 4, 2, 3, 1);
    ctx.fill();

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

    ctx.fillStyle = this.colors.minimapBackground;
    ctx.fillRect(0, 0, mW, mH);

    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        const cell = grid[r][c];
        const x = c * cellSize * sx;
        const y = r * cellSize * sy;
        const width = cellSize * sx;
        const height = cellSize * sy;
        if (cell === CELL.WALL) {
          ctx.fillStyle = this.colors.minimapWall;
          ctx.fillRect(x, y, width + 0.5, height + 0.5);
          ctx.strokeStyle = this.colors.minimapWallStroke;
          ctx.lineWidth = 0.75;
          ctx.strokeRect(x + 0.375, y + 0.375, Math.max(0, width - 0.75), Math.max(0, height - 0.75));
        } else if (cell === CELL.ROAD || cell === CELL.CHECKPOINT) {
          ctx.fillStyle = this.colors.minimapRoad;
          ctx.fillRect(x, y, width + 0.5, height + 0.5);
        }
      }
    }

    if (source) {
      ctx.fillStyle = '#3b82f6';
      ctx.strokeStyle = this.colors.minimapMarkerOutline;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc((source.c * cellSize + cellSize / 2) * sx, (source.r * cellSize + cellSize / 2) * sy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    if (destination) {
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = this.colors.minimapMarkerOutline;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc((destination.c * cellSize + cellSize / 2) * sx, (destination.r * cellSize + cellSize / 2) * sy, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    if (gs.car) {
      ctx.fillStyle = CAR_COLORS.paint;
      ctx.strokeStyle = this.colors.minimapMarkerOutline;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(gs.car.x * sx, gs.car.y * sy, 4, 0, Math.PI * 2); ctx.fill();
      ctx.stroke();
    }

    ctx.strokeStyle = this.colors.minimapBorder;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, mW, mH);
  }
}
