export interface Question {
  id: string;
  aramaic: string;
  hebrew: string;
  options: string[];
  correctAnswer: number;
  audioFile?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface User {
  id: string;
  username: string;
  email?: string;
  score: number;
  highScore: number;
  gamesPlayed: number;
  correctAnswers: number;
  createdAt: Date;
  isAdmin?: boolean;
}

export interface GameSession {
  id: string;
  userId: string;
  score: number;
  lives: number;
  currentQuestion: number;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
}

export interface GameSettings {
  difficulty: 'normal' | 'fast';
  pronunciation: 'ashkenazi' | 'sephardic';
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  rank: number;
  title: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalGames: number;
  averageScore: number;
}

export const GAME_CONSTANTS = {
  INITIAL_LIVES: 3,
  BONUS_LIFE_THRESHOLD: 50,
  NORMAL_TIME_LIMIT: 10, // seconds
  FAST_TIME_LIMIT: 5, // seconds
  QUESTIONS_PER_GAME: 100,
} as const;

export const TITLES = [
  { minScore: 0, title: 'מתחיל' },
  { minScore: 10, title: 'חניך' },
  { minScore: 25, title: 'תלמיד' },
  { minScore: 50, title: 'בחור' },
  { minScore: 100, title: 'אברך' },
  { minScore: 200, title: 'חכם' },
  { minScore: 500, title: 'רב' },
  { minScore: 1000, title: 'גאון' },
] as const;
