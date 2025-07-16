import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';

const { width } = Dimensions.get('window');

interface ScoreDisplayProps {
  score: number;
  showTitle?: boolean;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ 
  score, 
  showTitle = false 
}) => {
  const { user } = useGameStore();

  const getUserTitle = (score: number): string => {
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

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>ניקוד</Text>
        <Text style={styles.scoreValue}>{score.toLocaleString()}</Text>
      </View>
      {showTitle && (
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>
            {getUserTitle(score)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  titleContainer: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
