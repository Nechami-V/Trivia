import express from 'express';
import GameSession from '../models/GameSession';
import User from '../models/User';
import Question from '../models/Question';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Start new game
router.post('/start', authenticateToken, async (req: AuthRequest, res) => {
  try {
    // End any existing active game
    await GameSession.updateMany(
      { userId: req.userId, isActive: true },
      { isActive: false, endTime: new Date() }
    );

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const gameSession = new GameSession({
      userId: req.userId,
      username: user.username,
      score: 0,
      lives: 3,
      currentQuestion: 0,
      questionsAnswered: [],
      correctAnswers: 0,
      isActive: true
    });

    await gameSession.save();

    res.json({
      success: true,
      data: {
        sessionId: gameSession._id,
        lives: gameSession.lives,
        score: gameSession.score,
        currentQuestion: gameSession.currentQuestion
      }
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get current game session
router.get('/current', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const gameSession = await GameSession.findOne({
      userId: req.userId,
      isActive: true
    });

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        error: 'No active game found'
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: gameSession._id,
        lives: gameSession.lives,
        score: gameSession.score,
        currentQuestion: gameSession.currentQuestion,
        correctAnswers: gameSession.correctAnswers,
        questionsAnswered: gameSession.questionsAnswered
      }
    });
  } catch (error) {
    console.error('Get current game error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Submit answer
router.post('/answer', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId, questionId, selectedAnswer, timeLeft } = req.body;

    const gameSession = await GameSession.findOne({
      _id: sessionId,
      userId: req.userId,
      isActive: true
    });

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    const isCorrect = selectedAnswer === question.correctAnswer;
    
    // Update game session
    gameSession.questionsAnswered.push(questionId);
    gameSession.currentQuestion += 1;

    if (isCorrect) {
      gameSession.score += 1;
      gameSession.correctAnswers += 1;
      
      // Bonus life every 50 correct answers
      if (gameSession.correctAnswers % 50 === 0) {
        gameSession.lives += 1;
      }
    } else {
      gameSession.lives -= 1;
    }

    // Check if game over
    if (gameSession.lives <= 0) {
      gameSession.isActive = false;
      gameSession.endTime = new Date();
      gameSession.finalScore = gameSession.score;

      // Update user stats
      const user = await User.findById(req.userId);
      if (user) {
        user.gamesPlayed += 1;
        user.correctAnswers += gameSession.correctAnswers;
        if (gameSession.score > user.highScore) {
          user.highScore = gameSession.score;
        }
        user.score = gameSession.score; // Current score
        await user.save();
      }
    }

    await gameSession.save();

    res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        lives: gameSession.lives,
        score: gameSession.score,
        gameOver: !gameSession.isActive,
        finalScore: gameSession.finalScore,
        bonusLife: isCorrect && gameSession.correctAnswers % 50 === 0
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// End game
router.post('/end', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;

    const gameSession = await GameSession.findOne({
      _id: sessionId,
      userId: req.userId,
      isActive: true
    });

    if (!gameSession) {
      return res.status(404).json({
        success: false,
        error: 'Game session not found'
      });
    }

    gameSession.isActive = false;
    gameSession.endTime = new Date();
    gameSession.finalScore = gameSession.score;

    // Update user stats
    const user = await User.findById(req.userId);
    if (user) {
      user.gamesPlayed += 1;
      user.correctAnswers += gameSession.correctAnswers;
      if (gameSession.score > user.highScore) {
        user.highScore = gameSession.score;
      }
      user.score = gameSession.score;
      await user.save();
    }

    await gameSession.save();

    res.json({
      success: true,
      data: {
        finalScore: gameSession.finalScore,
        correctAnswers: gameSession.correctAnswers,
        totalQuestions: gameSession.currentQuestion
      }
    });
  } catch (error) {
    console.error('End game error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router;
