import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { useGameStore } from '../store/gameStore';
import { getTimeLimit } from '../../../shared';
import apiClient from '../services/api';

const { width } = Dimensions.get('window');

const GameScreen = ({ route, navigation }: any) => {
  const { sessionId } = route.params;
  const {
    user,
    gameSettings,
    score,
    lives,
    setScore,
    setLives,
    setCurrentQuestion,
    currentQuestion,
  } = useGameStore();

  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(getTimeLimit(gameSettings.difficulty));
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadNextQuestion();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      timerInterval.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }

    return () => {
      if (timerInterval.current) {
        clearTimeout(timerInterval.current);
      }
    };
  }, [timeLeft, showResult]);

  const loadNextQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getRandomQuestion([]);
      if (response.success && response.data) {
        setCurrentQuestion(response.data);
        setTimeLeft(getTimeLimit(gameSettings.difficulty));
        setSelectedAnswer(null);
        setShowResult(false);
        
        // Play animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
          }),
        ]).start();

        // Play audio if enabled
        if (gameSettings.soundEnabled && response.data.audioFile) {
          playAudio(response.data.audioFile);
        }
      } else {
        Alert.alert('שגיאה', 'לא נמצאו שאלות נוספות');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Load question error:', error);
      Alert.alert('שגיאה', 'שגיאה בטעינת השאלה');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = async (audioFile: string) => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `http://localhost:3000/audio/${audioFile}` },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const handleAnswerPress = async (answerIndex: number) => {
    if (showResult || selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    try {
      const response = await apiClient.submitAnswer({
        sessionId,
        questionId: currentQuestion!.id,
        selectedAnswer: answerIndex,
        timeLeft,
      });

      if (response.success && response.data) {
        setIsCorrect(response.data.isCorrect);
        setScore(response.data.score);
        setLives(response.data.lives);

        if (response.data.gameOver) {
          setGameOver(true);
          setTimeout(() => {
            navigation.navigate('GameOver', {
              finalScore: response.data.finalScore,
              correctAnswers: response.data.correctAnswers || 0,
            });
          }, 2000);
        } else {
          setTimeout(() => {
            loadNextQuestion();
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Submit answer error:', error);
      Alert.alert('שגיאה', 'שגיאה בשליחת התשובה');
    }
  };

  const handleTimeUp = () => {
    setShowResult(true);
    setIsCorrect(false);
    
    // Simulate wrong answer
    handleAnswerPress(-1);
  };

  const handlePauseGame = () => {
    Alert.alert(
      'השהיית משחק',
      'מה תרצה לעשות?',
      [
        { text: 'חזור למשחק', style: 'cancel' },
        {
          text: 'השהה משחק',
          onPress: () => {
            // TODO: Implement pause functionality
          },
        },
        {
          text: 'סיים משחק',
          onPress: () => {
            Alert.alert(
              'סיום משחק',
              'האם אתה בטוח שברצונך לסיים את המשחק?',
              [
                { text: 'ביטול', style: 'cancel' },
                {
                  text: 'כן',
                  onPress: async () => {
                    try {
                      await apiClient.endGame(sessionId);
                      navigation.goBack();
                    } catch (error) {
                      console.error('End game error:', error);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return [styles.option, selectedAnswer === index && styles.selectedOption];
    }

    if (index === currentQuestion?.correctAnswer) {
      return [styles.option, styles.correctOption];
    }

    if (selectedAnswer === index && !isCorrect) {
      return [styles.option, styles.wrongOption];
    }

    return styles.option;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>טוען שאלה...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>שגיאה בטעינת השאלה</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handlePauseGame}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>נקודות</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{lives}</Text>
            <Text style={styles.statLabel}>חיים</Text>
          </View>
        </View>
      </View>

      <View style={styles.timerContainer}>
        <Text style={[styles.timer, timeLeft <= 3 && styles.timerWarning]}>
          {timeLeft}
        </Text>
        <View style={styles.timerBar}>
          <View
            style={[
              styles.timerFill,
              {
                width: `${(timeLeft / getTimeLimit(gameSettings.difficulty)) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <Animated.View
        style={[
          styles.questionContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.questionText}>{currentQuestion.aramaic}</Text>
        <Text style={styles.questionSubtext}>בחר את התרגום הנכון:</Text>
      </Animated.View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(index)}
            onPress={() => handleAnswerPress(index)}
            disabled={showResult}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {showResult && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultText, isCorrect ? styles.correctText : styles.wrongText]}>
            {isCorrect ? 'נכון! 🎉' : 'לא נכון 😔'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  timerContainer: {
    alignItems: 'center',
    padding: 20,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  timerWarning: {
    color: '#e74c3c',
  },
  timerBar: {
    width: width - 40,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  questionContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  questionText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  questionSubtext: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    padding: 20,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedOption: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  correctOption: {
    borderColor: '#27ae60',
    backgroundColor: '#d5f4e6',
  },
  wrongOption: {
    borderColor: '#e74c3c',
    backgroundColor: '#fdeaea',
  },
  optionText: {
    fontSize: 18,
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resultContainer: {
    alignItems: 'center',
    padding: 20,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  correctText: {
    color: '#27ae60',
  },
  wrongText: {
    color: '#e74c3c',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 10,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
  },
});

export default GameScreen;
