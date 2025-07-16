import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  aramaic: string;
  hebrew: string;
  options: string[];
  correctAnswer: number;
  audioFile?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema({
  aramaic: {
    type: String,
    required: true,
    trim: true
  },
  hebrew: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(options: string[]) {
        return options.length === 4;
      },
      message: 'Question must have exactly 4 options'
    }
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  audioFile: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    default: 'general'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
QuestionSchema.index({ category: 1, difficulty: 1 });
QuestionSchema.index({ isActive: 1 });

export default mongoose.model<IQuestion>('Question', QuestionSchema);
