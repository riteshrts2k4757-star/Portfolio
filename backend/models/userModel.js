import supabase from '../../db.js';

// Tables are now created via Supabase SQL Editor.
// These functions are kept as no-ops for backward compatibility with server.js init.
export const createUsersTable = async () => {
  console.log('✅ Users table managed by Supabase');
};

export const createGameStatsTable = async () => {
  console.log('✅ GameStats table managed by Supabase');
};

export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code === 'PGRST116') {
    // PGRST116 = "JSON object requested, multiple (or no) rows returned" — means no row found
    return null;
  }
  if (error) throw error;
  return data;
};

export const findUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, player_id, username, email, profile_picture, created_at')
    .eq('id', id)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
};

export const createUser = async (username, email, hashedPassword) => {
  const { data, error } = await supabase
    .from('users')
    .insert({ username, email, password: hashedPassword })
    .select('id, player_id, username, email, profile_picture, created_at')
    .single();

  if (error) throw error;
  return data;
};

export const updateProfilePicture = async (id, base64String) => {
  const { data, error } = await supabase
    .from('users')
    .update({ profile_picture: base64String })
    .eq('id', id)
    .select('id, player_id, username, email, profile_picture, created_at')
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (id, username, email, hashedPassword) => {
  const updateData = { username, email };
  if (hashedPassword) {
    updateData.password = hashedPassword;
  }

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select('id, player_id, username, email, profile_picture, created_at')
    .single();

  if (error) throw error;
  return data;
};

// ─── Game Stats ─────────────────────────────────────────────

export const getGameStats = async (userId) => {
  const { data, error } = await supabase
    .from('game_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
};

export const updateGameStats = async (userId, gameData) => {
  const { score, collisions, time, rank } = gameData;

  // Check if a row exists
  const existing = await getGameStats(userId);

  if (!existing) {
    // Insert first record
    const { data, error } = await supabase
      .from('game_stats')
      .insert({
        user_id: userId,
        high_score: score,
        previous_score: score,
        total_collisions: collisions,
        total_play_time: time,
        games_played: 1,
        best_rank: rank,
        best_time: time,
        last_played_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
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

  const { data, error } = await supabase
    .from('game_stats')
    .update({
      high_score: newHighScore,
      previous_score: score,
      total_collisions: newTotalCollisions,
      total_play_time: newTotalPlayTime,
      games_played: newGamesPlayed,
      best_rank: newBestRank,
      best_time: newBestTime,
      last_played_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
};
