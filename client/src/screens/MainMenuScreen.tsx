import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { getUserTitle } from '../../../shared';
import apiClient from '../services/api';

const MainMenuScreen = ({ navigation }: any) => {
  const { user, logout } = useGameStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartGame = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.startGame();
      if (response.success && response.data) {
        navigation.navigate('Game', { sessionId: response.data.sessionId });
      } else {
        Alert.alert('שגיאה', response.error || 'שגיאה בתחילת המשחק');
      }
    } catch (error) {
      console.error('Start game error:', error);
      Alert.alert('שגיאה', 'שגיאה בחיבור לשרת');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'יציאה',
      'האם אתה בטוח שברצונך לצאת?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'כן',
          onPress: () => {
            logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>משחק טריוויה ארמית</Text>
        <Text style={styles.welcomeText}>
          שלום {user?.username}! 
        </Text>
        <Text style={styles.userTitle}>
          {getUserTitle(user?.highScore || 0)}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.highScore || 0}</Text>
          <Text style={styles.statLabel}>שיא אישי</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.gamesPlayed || 0}</Text>
          <Text style={styles.statLabel}>משחקים</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user?.correctAnswers || 0}</Text>
          <Text style={styles.statLabel}>נכונות</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuButton, styles.primaryButton]}
          onPress={handleStartGame}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>משחק חדש</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Text style={styles.menuButtonText}>לוח שיאים</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.menuButtonText}>הגדרות</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('About')}
        >
          <Text style={styles.menuButtonText}>אודות</Text>
        </TouchableOpacity>

        {user?.isAdmin && (
          <TouchableOpacity
            style={[styles.menuButton, styles.adminButton]}
            onPress={() => navigation.navigate('Admin')}
          >
            <Text style={styles.menuButtonText}>ניהול</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.menuButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>יציאה</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: '#34495e',
    marginBottom: 5,
  },
  userTitle: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 5,
  },
  menuContainer: {
    flex: 1,
    padding: 20,
  },
  menuButton: {
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  primaryButton: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  adminButton: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  logoutButton: {
    backgroundColor: '#95a5a6',
    borderColor: '#95a5a6',
  },
  menuButtonText: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  primaryButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default MainMenuScreen;
