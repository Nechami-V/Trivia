import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useGameStore } from '../store/gameStore';

const SettingsScreen = ({ navigation }: any) => {
  const { gameSettings, setGameSettings } = useGameStore();

  const toggleDifficulty = () => {
    setGameSettings({
      difficulty: gameSettings.difficulty === 'normal' ? 'fast' : 'normal',
    });
  };

  const togglePronunciation = () => {
    setGameSettings({
      pronunciation: gameSettings.pronunciation === 'ashkenazi' ? 'sephardic' : 'ashkenazi',
    });
  };

  const toggleSound = (value: boolean) => {
    setGameSettings({ soundEnabled: value });
  };

  const toggleAnimations = (value: boolean) => {
    setGameSettings({ animationsEnabled: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>הגדרות</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>הגדרות משחק</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>רמת קושי</Text>
              <Text style={styles.settingDescription}>
                {gameSettings.difficulty === 'normal' ? 'רגיל (10 שניות)' : 'מהיר (5 שניות)'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, gameSettings.difficulty === 'fast' && styles.toggleActive]}
              onPress={toggleDifficulty}
            >
              <Text style={styles.toggleText}>
                {gameSettings.difficulty === 'normal' ? 'רגיל' : 'מהיר'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>הברה</Text>
              <Text style={styles.settingDescription}>
                {gameSettings.pronunciation === 'ashkenazi' ? 'אשכנזי' : 'ספרדי'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, gameSettings.pronunciation === 'sephardic' && styles.toggleActive]}
              onPress={togglePronunciation}
            >
              <Text style={styles.toggleText}>
                {gameSettings.pronunciation === 'ashkenazi' ? 'אשכנזי' : 'ספרדי'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>צלילים</Text>
              <Text style={styles.settingDescription}>
                הפעלת צלילי הקראה ואפקטים
              </Text>
            </View>
            <Switch
              value={gameSettings.soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: '#e0e0e0', true: '#3498db' }}
              thumbColor={gameSettings.soundEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>אנימציות</Text>
              <Text style={styles.settingDescription}>
                הפעלת אנימציות במשחק
              </Text>
            </View>
            <Switch
              value={gameSettings.animationsEnabled}
              onValueChange={toggleAnimations}
              trackColor={{ false: '#e0e0e0', true: '#3498db' }}
              thumbColor={gameSettings.animationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>מידע נוסף</Text>
          
          <TouchableOpacity style={styles.infoItem}>
            <Text style={styles.infoText}>גירסה: 1.0.0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.infoItem}>
            <Text style={styles.infoText}>פותח על ידי: צוות הפיתוח</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  topBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  settingDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  toggle: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#3498db',
  },
  toggleText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  infoItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoText: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'right',
  },
});

export default SettingsScreen;
