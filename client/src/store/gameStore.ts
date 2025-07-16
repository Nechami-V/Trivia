import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define types locally until we fix the shared import
interface User {
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

interface Question {
  id: string;
  aramaic: string;
  hebrew: string;
  options: string[];
  correctAnswer: number;
  audioFile?: string;
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface GameSession {
  id: string;
  userId: string;
  score: number;
  lives: number;
  currentQuestion: number;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
}

interface GameSettings {
  difficulty: 'normal' | 'fast';
  pronunciation: 'ashkenazi' | 'sephardic';
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

interface GameState {
  // User state
  user: User | null;
  token: string | null;
  
  // Game state
  currentSession: GameSession | null;
  currentQuestion: Question | null;
  score: number;
  lives: number;
  timeLeft: number;
  isGameActive: boolean;
  gameSettings: GameSettings;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setCurrentSession: (session: GameSession | null) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setScore: (score: number) => void;
  setLives: (lives: number) => void;
  setTimeLeft: (time: number) => void;
  setIsGameActive: (active: boolean) => void;
  setGameSettings: (settings: Partial<GameSettings>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetGame: () => void;
  logout: () => void;
}

const initialGameSettings: GameSettings = {
  difficulty: 'normal',
  pronunciation: 'ashkenazi',
  soundEnabled: true,
  animationsEnabled: true,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      currentSession: null,
      currentQuestion: null,
      score: 0,
      lives: 3,
      timeLeft: 10,
      isGameActive: false,
      gameSettings: initialGameSettings,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setCurrentSession: (session) => set({ currentSession: session }),
      setCurrentQuestion: (question) => set({ currentQuestion: question }),
      setScore: (score) => set({ score }),
      setLives: (lives) => set({ lives }),
      setTimeLeft: (time) => set({ timeLeft: time }),
      setIsGameActive: (active) => set({ isGameActive: active }),
      setGameSettings: (settings) => 
        set({ gameSettings: { ...get().gameSettings, ...settings } }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      resetGame: () => set({
        currentSession: null,
        currentQuestion: null,
        score: 0,
        lives: 3,
        timeLeft: get().gameSettings.difficulty === 'fast' ? 5 : 10,
        isGameActive: false,
        error: null,
      }),
      
      logout: () => set({
        user: null,
        token: null,
        currentSession: null,
        currentQuestion: null,
        score: 0,
        lives: 3,
        timeLeft: 10,
        isGameActive: false,
        error: null,
      }),
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        gameSettings: state.gameSettings,
      }),
    }
  )
);
