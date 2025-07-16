import { Audio } from 'expo-av';
import { useGameStore } from '../store/gameStore';

export class AudioService {
  private static instance: AudioService;
  private sound: Audio.Sound | null = null;

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Audio initialization error:', error);
    }
  }

  async playQuestionAudio(audioFile: string, pronunciation: 'ashkenazi' | 'sephardic' = 'ashkenazi') {
    const { gameSettings } = useGameStore.getState();
    
    if (!gameSettings.soundEnabled) return;

    try {
      // Stop current audio if playing
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      }

      // Construct audio URL based on pronunciation
      const audioUrl = `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/audio/${audioFile}`;

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, volume: 1.0 }
      );

      this.sound = sound;
      
      // Auto-cleanup when finished
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.cleanup();
        }
      });

    } catch (error) {
      console.error('Audio playback error:', error);
    }
  }

  async playSuccessSound() {
    const { gameSettings } = useGameStore.getState();
    if (!gameSettings.soundEnabled) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/success.mp3'),
        { shouldPlay: true, volume: 0.8 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Success sound not found, using default');
    }
  }

  async playErrorSound() {
    const { gameSettings } = useGameStore.getState();
    if (!gameSettings.soundEnabled) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/error.mp3'),
        { shouldPlay: true, volume: 0.8 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error sound not found, using default');
    }
  }

  async playTimeUpSound() {
    const { gameSettings } = useGameStore.getState();
    if (!gameSettings.soundEnabled) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/timeup.mp3'),
        { shouldPlay: true, volume: 0.8 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Time up sound not found, using default');
    }
  }

  async playBonusLifeSound() {
    const { gameSettings } = useGameStore.getState();
    if (!gameSettings.soundEnabled) return;

    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/bonus.mp3'),
        { shouldPlay: true, volume: 0.8 }
      );
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Bonus sound not found, using default');
    }
  }

  async cleanup() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      } catch (error) {
        console.error('Audio cleanup error:', error);
      }
    }
  }
}

export const audioService = AudioService.getInstance();
