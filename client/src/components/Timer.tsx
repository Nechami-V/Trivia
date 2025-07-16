import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useGameStore } from '../store/gameStore';

const { width } = Dimensions.get('window');

interface TimerProps {
  onTimeUp: () => void;
  isPaused?: boolean;
  key?: string | number; // For resetting the timer
}

export const Timer: React.FC<TimerProps> = ({ onTimeUp, isPaused = false }) => {
  const { timeLeft, gameSettings, setTimeLeft } = useGameStore();
  const animatedValue = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const maxTime = gameSettings.difficulty === 'fast' ? 5 : 10;

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      useGameStore.setState((state) => {
        const newTimeLeft = state.timeLeft - 1;
        if (newTimeLeft <= 0) {
          onTimeUp();
          return { timeLeft: 0 };
        }
        return { timeLeft: newTimeLeft };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, onTimeUp]);

  useEffect(() => {
    const progress = timeLeft / maxTime;
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, maxTime, animatedValue]);

  const getTimerColor = () => {
    if (timeLeft <= 2) return '#ff4444';
    if (timeLeft <= 5) return '#ff9500';
    return '#4CAF50';
  };

  const progressWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width - 60],
  });

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={[styles.timeText, { color: getTimerColor() }]}>
          {timeLeft}s
        </Text>
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
                backgroundColor: getTimerColor(),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBarContainer: {
    width: width - 60,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});
