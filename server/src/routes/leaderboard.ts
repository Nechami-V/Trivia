import express from 'express';
import User from '../models/User';
import { getUserTitle } from '../../../shared';

const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ highScore: -1, correctAnswers: -1 })
      .skip(skip)
      .limit(limit)
      .select('username highScore correctAnswers gamesPlayed createdAt');

    const totalUsers = await User.countDocuments();

    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      username: user.username,
      score: user.highScore,
      correctAnswers: user.correctAnswers,
      gamesPlayed: user.gamesPlayed,
      title: getUserTitle(user.highScore),
      joinDate: user.createdAt
    }));

    res.json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          hasNext: page * limit < totalUsers,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get user rank
router.get('/rank/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const rank = await User.countDocuments({
      $or: [
        { highScore: { $gt: user.highScore } },
        { 
          highScore: user.highScore,
          correctAnswers: { $gt: user.correctAnswers }
        }
      ]
    }) + 1;

    res.json({
      success: true,
      data: {
        rank,
        username: user.username,
        score: user.highScore,
        title: getUserTitle(user.highScore)
      }
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get top players
router.get('/top/:count', async (req, res) => {
  try {
    const count = Math.min(parseInt(req.params.count) || 10, 100);
    
    const users = await User.find()
      .sort({ highScore: -1, correctAnswers: -1 })
      .limit(count)
      .select('username highScore correctAnswers');

    const topPlayers = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      score: user.highScore,
      correctAnswers: user.correctAnswers,
      title: getUserTitle(user.highScore)
    }));

    res.json({
      success: true,
      data: topPlayers
    });
  } catch (error) {
    console.error('Get top players error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router;
