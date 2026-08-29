import pool from '../../db.js';

export const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      player_id VARCHAR(50) GENERATED ALWAYS AS ('player' || LPAD(id::text, 2, '0')) STORED,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      profile_picture TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('✅ Users table is ready');
  } catch (error) {
    console.error('❌ Error creating users table:', error);
  }
};

export const findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query('SELECT id, player_id, username, email, profile_picture, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

export const createUser = async (username, email, hashedPassword) => {
  const result = await pool.query(
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, player_id, username, email, profile_picture, created_at',
    [username, email, hashedPassword]
  );
  return result.rows[0];
};

export const updateProfilePicture = async (id, base64String) => {
  const result = await pool.query(
    'UPDATE users SET profile_picture = $1 WHERE id = $2 RETURNING id, player_id, username, email, profile_picture, created_at',
    [base64String, id]
  );
  return result.rows[0];
};

export const updateUserProfile = async (id, username, email, hashedPassword) => {
  let query = 'UPDATE users SET username = $1, email = $2';
  let values = [username, email, id];
  
  if (hashedPassword) {
    query += ', password = $4';
    values = [username, email, id, hashedPassword];
  }
  
  query += ' WHERE id = $3 RETURNING id, player_id, username, email, profile_picture, created_at';
  
  const result = await pool.query(query, values);
  return result.rows[0];
};

// ─── Game Stats ─────────────────────────────────────────────

export const createGameStatsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS game_stats (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      high_score INTEGER DEFAULT 0,
      previous_score INTEGER DEFAULT 0,
      total_collisions INTEGER DEFAULT 0,
      total_play_time REAL DEFAULT 0,
      games_played INTEGER DEFAULT 0,
      best_rank VARCHAR(50),
      best_time REAL DEFAULT 0,
      last_played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    );
  `;
  try {
    await pool.query(query);
    console.log('✅ GameStats table is ready');
  } catch (error) {
    console.error('❌ Error creating game_stats table:', error);
  }
};

export const getGameStats = async (userId) => {
  const result = await pool.query('SELECT * FROM game_stats WHERE user_id = $1', [userId]);
  return result.rows[0] || null;
};

export const updateGameStats = async (userId, gameData) => {
  const { score, collisions, time, rank } = gameData;

  // Check if a row exists
  const existing = await getGameStats(userId);

  if (!existing) {
    // Insert first record
    const result = await pool.query(
      `INSERT INTO game_stats (user_id, high_score, previous_score, total_collisions, total_play_time, games_played, best_rank, best_time, last_played_at)
       VALUES ($1, $2, $3, $4, $5, 1, $6, $7, NOW())
       RETURNING *`,
      [userId, score, score, collisions, time, rank, time]
    );
    return result.rows[0];
  }

  // Update existing record
  const newHighScore = Math.max(existing.high_score, score);
  const newTotalCollisions = existing.total_collisions + collisions;
  const newTotalPlayTime = existing.total_play_time + time;
  const newGamesPlayed = existing.games_played + 1;

  // Rank ordering for comparison
  const rankOrder = { 'PERFECT DRIVER': 4, 'EXPERT DRIVER': 3, 'GOOD DRIVER': 2, 'ROOKIE DRIVER': 1 };
  const newBestRank = (rankOrder[rank] || 0) > (rankOrder[existing.best_rank] || 0) ? rank : existing.best_rank;
  
  // Best time = fastest completion (lowest non-zero time)
  const newBestTime = existing.best_time === 0 ? time : Math.min(existing.best_time, time);

  const result = await pool.query(
    `UPDATE game_stats 
     SET high_score = $1, previous_score = $2, total_collisions = $3, total_play_time = $4,
         games_played = $5, best_rank = $6, best_time = $7, last_played_at = NOW()
     WHERE user_id = $8
     RETURNING *`,
    [newHighScore, score, newTotalCollisions, newTotalPlayTime, newGamesPlayed, newBestRank, newBestTime, userId]
  );
  return result.rows[0];
};
