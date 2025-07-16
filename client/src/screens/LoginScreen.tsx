import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { apiClient } from '../services/api';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken } = useGameStore();

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert('שגיאה', 'אנא הכנס שם משתמש');
      return;
    }

    if (username.length < 2 || username.length > 20) {
      Alert.alert('שגיאה', 'שם המשתמש חייב להיות בין 2-20 תווים');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.guestLogin(username);
      
      if (response.success && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        apiClient.setToken(response.data.token);
        onLogin();
      } else {
        Alert.alert('שגיאה', response.error || 'שגיאה בכניסה למשחק');
      }
    } catch (error) {
      Alert.alert('שגיאה', 'שגיאה בחיבור לשרת');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>משחק טריוויה בארמית</Text>
          <Text style={styles.subtitle}>למען לימוד שפת הגמרא הקדושה</Text>
          
          <View style={styles.formContainer}>
            <Text style={styles.label}>שם משתמש:</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="הכנס שם משתמש"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'נכנס...' : 'התחל משחק'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              • המשחק מתחיל עם 3 חיים
            </Text>
            <Text style={styles.infoText}>
              • כל 50 תשובות נכונות = חיים נוספים
            </Text>
            <Text style={styles.infoText}>
              • 4 אפשרויות לכל שאלה
            </Text>
            <Text style={styles.infoText}>
              • הקראה וואקלית במבטא אשכנזי או ספרדי
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    marginBottom: 8,
  },
});
