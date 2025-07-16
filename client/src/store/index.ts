import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSettings, User } from '../../shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

interface GameState {
  settings: GameSettings;
  currentScore: number;
  lives: number;
  sessionId: string | null;
  questionsAnswered: string[];
  isGameActive: boolean;
  setSettings: (settings: Partial<GameSettings>) => void;
  setCurrentScore: (score: number) => void;
  setLives: (lives: number) => void;
  setSessionId: (sessionId: string | null) => void;
  addAnsweredQuestion: (questionId: string) => void;
  setGameActive: (active: boolean) => void;
  resetGame: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      settings: {
        difficulty: 'normal',
        pronunciation: 'ashkenazi',
        soundEnabled: true,
        animationsEnabled: true,
      },
      currentScore: 0,
      lives: 3,
      sessionId: null,
      questionsAnswered: [],
      isGameActive: false,
      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      setCurrentScore: (score) => set({ currentScore: score }),
      setLives: (lives) => set({ lives }),
      setSessionId: (sessionId) => set({ sessionId }),
      addAnsweredQuestion: (questionId) =>
        set((state) => ({
          questionsAnswered: [...state.questionsAnswered, questionId],
        })),
      setGameActive: (active) => set({ isGameActive: active }),
      resetGame: () =>
        set({
          currentScore: 0,
          lives: 3,
          sessionId: null,
          questionsAnswered: [],
          isGameActive: false,
        }),
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
