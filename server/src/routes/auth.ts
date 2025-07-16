import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Register/Login (guest users)
router.post('/guest-login', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.length < 2 || username.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Username must be between 2-20 characters'
      });
    }

    // Check if username exists
    let user = await User.findOne({ username });
    
    if (!user) {
      // Create new guest user
      user = new User({
        username,
        isAdmin: false
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          score: user.score,
          highScore: user.highScore,
          gamesPlayed: user.gamesPlayed,
          isAdmin: user.isAdmin
        }
      }
    });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        score: user.score,
        highScore: user.highScore,
        gamesPlayed: user.gamesPlayed,
        correctAnswers: user.correctAnswers,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (username && username !== user.username) {
      // Check if new username is available
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username already taken'
        });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered'
        });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        score: user.score,
        highScore: user.highScore,
        gamesPlayed: user.gamesPlayed,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router;
