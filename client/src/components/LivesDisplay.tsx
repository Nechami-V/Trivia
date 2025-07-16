import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';

const { width } = Dimensions.get('window');

interface LivesDisplayProps {
  lives: number;
  maxLives?: number;
}

export const LivesDisplay: React.FC<LivesDisplayProps> = ({ lives, maxLives = 10 }) => {
  const { gameSettings } = useGameStore();

  const renderHearts = () => {
    const hearts = [];
    const displayLives = Math.min(lives, maxLives);
    
    for (let i = 0; i < displayLives; i++) {
      hearts.push(
        <Text key={i} style={styles.heart}>
          ♥
        </Text>
      );
    }
    
    return hearts;
  };

  return (
    <View style={styles.container}>
      <View style={styles.livesContainer}>
        {renderHearts()}
        {lives > maxLives && (
          <Text style={styles.extraLives}>
            +{lives - maxLives}
          </Text>
        )}
      </View>
      <Text style={styles.livesText}>
        {lives} {lives === 1 ? 'חיים' : 'חיים'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  livesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  heart: {
    fontSize: 24,
    color: '#ff4444',
    marginHorizontal: 2,
  },
  extraLives: {
    fontSize: 16,
    color: '#ff4444',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  livesText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
