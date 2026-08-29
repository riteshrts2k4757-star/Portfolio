import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, findUserById, createUser, updateProfilePicture, updateUserProfile, getGameStats, updateGameStats } from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await createUser(username, email, hashedPassword);

    // Create token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Don't send the password hash back
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        player_id: user.player_id,
        profile_picture: user.profile_picture,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Email not found in database' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Login successful via forgot password',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        player_id: user.player_id,
        profile_picture: user.profile_picture,
      },
      token,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    const { image } = req.body; // expecting base64 string
    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const updatedUser = await updateProfilePicture(req.user.id, image);
    
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    res.status(200).json({
      message: 'Profile picture updated',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error during upload' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    // Check if the email belongs to someone else
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const updatedUser = await updateUserProfile(req.user.id, username, email, hashedPassword);

    // Create a new token in case email/id is used in token (email is)
    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      message: 'Profile updated successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error during profile update' });
  }
};

export const getStats = async (req, res) => {
  try {
    const stats = await getGameStats(req.user.id);
    res.status(200).json({ stats: stats || null });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error fetching stats' });
  }
};

export const saveGameResult = async (req, res) => {
  try {
    const { score, collisions, time, rank } = req.body;

    if (score === undefined || collisions === undefined || time === undefined || !rank) {
      return res.status(400).json({ error: 'Missing game data fields' });
    }

    const stats = await updateGameStats(req.user.id, { score, collisions, time, rank });
    res.status(200).json({ message: 'Game stats updated', stats });
  } catch (error) {
    console.error('Save game result error:', error);
    res.status(500).json({ error: 'Internal server error saving game result' });
  }
};
