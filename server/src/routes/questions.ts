import express from 'express';
import Question from '../models/Question';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get random question (excluding already answered ones)
router.get('/random', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { excludeIds = [] } = req.query;
    const excludeArray = Array.isArray(excludeIds) ? excludeIds : [excludeIds].filter(Boolean);

    const question = await Question.aggregate([
      {
        $match: {
          isActive: true,
          _id: { $nin: excludeArray.map(id => id) }
        }
      },
      { $sample: { size: 1 } }
    ]);

    if (!question.length) {
      return res.status(404).json({
        success: false,
        error: 'No more questions available'
      });
    }

    res.json({
      success: true,
      data: question[0]
    });
  } catch (error) {
    console.error('Get random question error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get question by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const question = await Question.findOne({ _id: req.params.id, isActive: true });
    
    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Get questions count
router.get('/stats/count', async (req, res) => {
  try {
    const count = await Question.countDocuments({ isActive: true });
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get questions count error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

export default router;
