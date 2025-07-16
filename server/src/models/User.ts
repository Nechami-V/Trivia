import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email?: string;
  passwordHash?: string;
  score: number;
  highScore: number;
  gamesPlayed: number;
  correctAnswers: number;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    select: false
  },
  score: {
    type: Number,
    default: 0,
    min: 0
  },
  highScore: {
    type: Number,
    default: 0,
    min: 0
  },
  gamesPlayed: {
    type: Number,
    default: 0,
    min: 0
  },
  correctAnswers: {
    type: Number,
    default: 0,
    min: 0
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for leaderboard queries
UserSchema.index({ highScore: -1 });
UserSchema.index({ username: 1 });

export default mongoose.model<IUser>('User', UserSchema);
