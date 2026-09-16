import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { findUserByEmail, findUserById, createUser, updateProfilePicture, updateUserProfile, getGameStats, updateGameStats } from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me';
const EMAIL_SECRET = process.env.EMAIL_SECRET || 'email_verification_secret_key';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate Verification Token
    const verificationToken = jwt.sign(
      { username, email, hashedPassword },
      EMAIL_SECRET,
      { expiresIn: '1h' }
    );

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || 'riteshrts2k4757@gmail.com',
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 10000 // 10 seconds max wait
    });

    // In production, use the deployed URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://portfolio-mocha-sigma-c3spyxg0mi.vercel.app'
      : 'http://localhost:5173';
      
    const verificationLink = `${baseUrl}/verify?token=${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'riteshrts2k4757@gmail.com',
      to: email,
      subject: 'Verify Your Email Address - Welcome!',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #22c55e; margin: 0;">Welcome to Our Platform!</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #111827; margin-top: 0;">Hi ${username},</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Thank you so much for joining us! We are thrilled to have you on board. Our platform offers the best tours, games, and secure chatting features for you to explore.
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Before you can log in and start exploring, we just need to quickly verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email Address</a>
            </div>
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${verificationLink}" style="color: #22c55e; word-break: break-all;">${verificationLink}</a>
            </p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 14px;">
            <p>With respectful regards,</p>
            <p style="font-weight: bold;">Ritesh (Admin)</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `
    };

    if (process.env.EMAIL_PASS) {
      try {
        await transporter.sendMail(mailOptions);
      } catch (emailErr) {
        console.error('Nodemailer Error:', emailErr);
        return res.status(500).json({ error: 'Failed to send verification email. Your email provider or server might be blocking the connection.' });
      }
    } else {
      console.log('⚠️ Simulating verification email:', verificationLink);
    }

    res.status(200).json({
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'No verification token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, EMAIL_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired verification link' });
    }

    const { username, email, hashedPassword } = decoded;

    // Check again just in case they verified twice
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already verified' });
    }

    // Finally create user
    await createUser(username, email, hashedPassword);

    res.status(200).json({ message: 'Email successfully verified' });
  } catch (error) {
    console.error('Email verification error:', error);
    
    // Check if it's a Supabase/Postgres unique constraint error
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Username or email is already taken by another account.' });
    }
    
    res.status(500).json({ error: error.message || 'Internal server error during email verification' });
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
      { id: user.id, email: user.email, role: user.role },
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
        role: user.role,
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
      { id: user.id, email: user.email, role: user.role },
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
        role: user.role,
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
      { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role },
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
