export * from './types';

// Utility functions that can be shared between client and server
export const formatScore = (score: number): string => {
  return score.toLocaleString();
};

export const getTimeLimit = (difficulty: 'normal' | 'fast'): number => {
  return difficulty === 'fast' ? 5 : 10;
};

export const getUserTitle = (score: number): string => {
  const titles = [
    { minScore: 0, title: 'מתחיל' },
    { minScore: 10, title: 'חניך' },
    { minScore: 25, title: 'תלמיד' },
    { minScore: 50, title: 'בחור' },
    { minScore: 100, title: 'אברך' },
    { minScore: 200, title: 'חכם' },
    { minScore: 500, title: 'רב' },
    { minScore: 1000, title: 'גאון' },
  ];
  
  const userTitle = titles
    .slice()
    .reverse()
    .find(title => score >= title.minScore);
    
  return userTitle?.title || 'מתחיל';
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateUsername = (username: string): boolean => {
  return username.length >= 2 && username.length <= 20;
};
