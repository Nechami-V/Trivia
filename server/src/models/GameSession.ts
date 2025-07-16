import mongoose, { Schema, Document } from 'mongoose';

export interface IGameSession extends Document {
  userId: mongoose.Types.ObjectId;
  username: string;
  score: number;
  lives: number;
  currentQuestion: number;
  questionsAnswered: mongoose.Types.ObjectId[];
  correctAnswers: number;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  finalScore?: number;
}

const GameSessionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  lives: {
    type: Number,
    default: 3,
    min: 0,
    max: 10
  },
  currentQuestion: {
    type: Number,
    default: 0,
    min: 0
  },
  questionsAnswered: [{
    type: Schema.Types.ObjectId,
    ref: 'Question'
  }],
  correctAnswers: {
    type: Number,
    default: 0,
    min: 0
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  finalScore: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes
GameSessionSchema.index({ userId: 1, isActive: 1 });
GameSessionSchema.index({ finalScore: -1 });

export default mongoose.model<IGameSession>('GameSession', GameSessionSchema);
