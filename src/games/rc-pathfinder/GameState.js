// ─────────────────────────────────────────────────────────────
//  GameState.js – Shared enums & difficulty configuration
// ─────────────────────────────────────────────────────────────

export const STATUS = {
  READY:     'READY',
  PLAYING:   'PLAYING',
  PAUSED:    'PAUSED',
  COMPLETED: 'COMPLETED',
};

export const CELL = {
  ROAD:       0,
  WALL:       1,
  OBSTACLE:   2,
  CHECKPOINT: 3,
};

// Difficulty configuration
// cellSize  – canvas pixels per grid cell
// extraLoopRatio – fraction of cells opened as extra loops
// numObstacles   – obstacle cells placed on road
// numCheckpoints – checkpoint gates placed across the map
export const DIFF_CONFIG = {
  EASY: {
    cellSize:       120,
    extraLoopRatio: 0.20,
    numObstacles:   2,
    numCheckpoints: 0,
  },
  MEDIUM: {
    cellSize:       90,
    extraLoopRatio: 0.08,
    numObstacles:   6,
    numCheckpoints: 0,
  },
  HARD: {
    cellSize:       70,
    extraLoopRatio: 0.02,
    numObstacles:   14,
    numCheckpoints: 0,
  },
};
