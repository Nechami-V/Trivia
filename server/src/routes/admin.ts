import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Question from '../models/Question';
import GameSession from '../models/GameSession';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(mp3|wav|m4a|aac)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Admin authentication middleware
router.use(authenticateToken);
router.use(requireAdmin);

// Get admin statistics
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    const [totalUsers, totalQuestions, totalGames, avgScoreResult] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments({ isActive: true }),
      GameSession.countDocuments({ isActive: false }),
      GameSession.aggregate([
        { $match: { isActive: false } },
        { $group: { _id: null, avgScore: { $avg: '$finalScore' } } }
      ])
    ]);

    const averageScore = avgScoreResult[0]?.avgScore || 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalQuestions,
        totalGames,
        averageScore: Math.round(averageScore * 100) / 100
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get all questions for admin
router.get('/questions', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const questions = await Question.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalQuestions = await Question.countDocuments();

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalQuestions / limit),
          totalQuestions,
          hasNext: page * limit < totalQuestions,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Add new question
router.post('/questions', upload.single('audio'), async (req: AuthRequest, res) => {
  try {
    const { aramaic, hebrew, options, correctAnswer, category, difficulty } = req.body;

    // Validate required fields
    if (!aramaic || !hebrew || !options || correctAnswer === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Parse options if it's a string
    let parsedOptions;
    try {
      parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid options format'
      });
    }

    // Validate options
    if (!Array.isArray(parsedOptions) || parsedOptions.length !== 4) {
      return res.status(400).json({
        success: false,
        error: 'Options must be an array of 4 strings'
      });
    }

    // Validate correct answer
    const answerIndex = parseInt(correctAnswer);
    if (isNaN(answerIndex) || answerIndex < 0 || answerIndex > 3) {
      return res.status(400).json({
        success: false,
        error: 'Correct answer must be between 0 and 3'
      });
    }

    const question = new Question({
      aramaic,
      hebrew,
      options: parsedOptions,
      correctAnswer: answerIndex,
      category: category || 'general',
      difficulty: difficulty || 'medium',
      audioFile: req.file ? req.file.filename : undefined
    });

    await question.save();

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Update question
router.put('/questions/:id', upload.single('audio'), async (req: AuthRequest, res) => {
  try {
    const { aramaic, hebrew, options, correctAnswer, category, difficulty, isActive } = req.body;
    
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Update fields if provided
    if (aramaic) question.aramaic = aramaic;
    if (hebrew) question.hebrew = hebrew;
    if (options) {
      let parsedOptions;
      try {
        parsedOptions = typeof options === 'string' ? JSON.parse(options) : options;
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid options format'
        });
      }
      
      if (!Array.isArray(parsedOptions) || parsedOptions.length !== 4) {
        return res.status(400).json({
          success: false,
          error: 'Options must be an array of 4 strings'
        });
      }
      question.options = parsedOptions;
    }
    
    if (correctAnswer !== undefined) {
      const answerIndex = parseInt(correctAnswer);
      if (isNaN(answerIndex) || answerIndex < 0 || answerIndex > 3) {
        return res.status(400).json({
          success: false,
          error: 'Correct answer must be between 0 and 3'
        });
      }
      question.correctAnswer = answerIndex;
    }
    
    if (category) question.category = category;
    if (difficulty) question.difficulty = difficulty;
    if (isActive !== undefined) question.isActive = isActive;
    
    if (req.file) {
      // Delete old audio file if exists
      if (question.audioFile) {
        const oldPath = path.join(__dirname, '../../uploads/audio', question.audioFile);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      question.audioFile = req.file.filename;
    }

    await question.save();

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Delete question
router.delete('/questions/:id', async (req: AuthRequest, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    // Delete audio file if exists
    if (question.audioFile) {
      const audioPath = path.join(__dirname, '../../uploads/audio', question.audioFile);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get all users for admin
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      data: {
        users,
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
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Delete user
router.delete('/users/:id', async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Don't allow deleting other admins
    if (user.isAdmin && user._id.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete other admin users'
      });
    }

    // Delete user's game sessions
    await GameSession.deleteMany({ userId: req.params.id });
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Reset leaderboard
router.post('/reset-leaderboard', async (req: AuthRequest, res) => {
  try {
    await User.updateMany({}, {
      score: 0,
      highScore: 0,
      gamesPlayed: 0,
      correctAnswers: 0
    });

    await GameSession.deleteMany({});

    res.json({
      success: true,
      message: 'Leaderboard reset successfully'
    });
  } catch (error) {
    console.error('Reset leaderboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router;
