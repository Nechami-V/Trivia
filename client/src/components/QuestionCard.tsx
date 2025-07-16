import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Question } from '../../../shared/types';
import { audioService } from '../services/audio';
import { useGameStore } from '../store/gameStore';

const { width } = Dimensions.get('window');

interface QuestionCardProps {
  question: Question;
  onAnswer: (selectedAnswer: number) => void;
  disabled?: boolean;
  showResult?: boolean;
  selectedAnswer?: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onAnswer,
  disabled = false,
  showResult = false,
  selectedAnswer,
}) => {
  const { gameSettings } = useGameStore();
  const [animations] = useState(() => 
    question.options.map(() => new Animated.Value(0))
  );
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Animate card entrance
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Animate options
    if (gameSettings.animationsEnabled) {
      Animated.stagger(100, 
        animations.map(anim => 
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          })
        )
      ).start();
    } else {
      animations.forEach(anim => anim.setValue(1));
    }

    // Play audio if available
    if (question.audioFile) {
      audioService.playQuestionAudio(question.audioFile, gameSettings.pronunciation);
    }
  }, [question, animations, scaleAnim, gameSettings]);

  const handleAnswer = (index: number) => {
    if (disabled) return;
    onAnswer(index);
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) return styles.option;
    
    if (index === question.correctAnswer) {
      return [styles.option, styles.correctOption];
    }
    
    if (selectedAnswer === index && index !== question.correctAnswer) {
      return [styles.option, styles.wrongOption];
    }
    
    return [styles.option, styles.disabledOption];
  };

  const getOptionTextStyle = (index: number) => {
    if (!showResult) return styles.optionText;
    
    if (index === question.correctAnswer) {
      return [styles.optionText, styles.correctOptionText];
    }
    
    if (selectedAnswer === index && index !== question.correctAnswer) {
      return [styles.optionText, styles.wrongOptionText];
    }
    
    return [styles.optionText, styles.disabledOptionText];
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.questionContainer}>
        <Text style={styles.aramaicText}>{question.aramaic}</Text>
        <Text style={styles.hebrewText}>{question.hebrew}</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <Animated.View
            key={index}
            style={[
              styles.optionWrapper,
              {
                opacity: animations[index],
                transform: [
                  {
                    translateY: animations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={getOptionStyle(index)}
              onPress={() => handleAnswer(index)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text style={getOptionTextStyle(index)}>
                {option}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      
      {question.audioFile && (
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => audioService.playQuestionAudio(question.audioFile!, gameSettings.pronunciation)}
        >
          <Text style={styles.playButtonText}>🔊</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  aramaicText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'serif',
  },
  hebrewText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  optionsContainer: {
    gap: 12,
  },
  optionWrapper: {
    width: '100%',
  },
  option: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  correctOption: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  wrongOption: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  disabledOption: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    opacity: 0.6,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  correctOptionText: {
    color: '#155724',
    fontWeight: 'bold',
  },
  wrongOptionText: {
    color: '#721c24',
    fontWeight: 'bold',
  },
  disabledOptionText: {
    color: '#6c757d',
  },
  playButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 18,
  },
});
