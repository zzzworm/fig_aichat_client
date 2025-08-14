import { useSpeechStore } from '../stores/speech.store';
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

const setSpeeching = useSpeechStore.getState().setSpeeching;

interface SystemSpeechOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  onDone?: () => void;
  onError?: (error: any) => void;
}

/**
 * System Speech Synthesis Service
 * Uses the device's built-in text-to-speech engine
 * Supports both web and React Native platforms
 */
class SystemSpeechService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Convert text to speech using system TTS
   */
  async speak(text: string, options: SystemSpeechOptions = {}) {
    if (!text || text.trim().length === 0) {
      console.warn('Empty text provided for speech synthesis');
      return;
    }

    // Stop any previously playing speech to avoid overlaps
    this.stop();

    // Set the global state to indicate speech has started
    setSpeeching(true);

    try {
      console.log('🎤 Starting system speech synthesis for text:', text.substring(0, 100) + '...');

      if (Platform.OS === 'web') {
        await this.speakWeb(text, options);
      } else {
        await this.speakReactNative(text, options);
      }

      console.log('✅ System speech synthesis completed successfully');
    } catch (error) {
      console.error('❌ System speech synthesis error:', error);
      setSpeeching(false);
      options.onError?.(error);
    }
  }

  /**
   * Speak using Web Speech API
   */
  private async speakWeb(text: string, options: SystemSpeechOptions) {
    return new Promise<void>((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      this.currentUtterance = new SpeechSynthesisUtterance(text);
      
      // Set voice properties
      if (options.language) {
        this.currentUtterance.lang = options.language;
      }
      if (options.rate !== undefined) {
        this.currentUtterance.rate = options.rate;
      }
      if (options.pitch !== undefined) {
        this.currentUtterance.pitch = options.pitch;
      }

      // Set event handlers
      this.currentUtterance.onend = () => {
        console.log('✅ Web speech synthesis completed');
        setSpeeching(false);
        options.onDone?.();
        resolve();
      };

      this.currentUtterance.onerror = (event) => {
        console.error('❌ Web speech synthesis error:', event.error);
        setSpeeching(false);
        options.onError?.(new Error(event.error));
        reject(new Error(event.error));
      };

      // Start speaking
      window.speechSynthesis.speak(this.currentUtterance);
    });
  }

  /**
   * Speak using Expo Speech (React Native)
   */
  private async speakReactNative(text: string, options: SystemSpeechOptions) {
    const speechOptions: Speech.SpeechOptions = {
      language: options.language || 'en-US',
      rate: options.rate || 1.0,
      pitch: options.pitch || 1.0,
      onDone: () => {
        console.log('✅ React Native speech synthesis completed');
        setSpeeching(false);
        options.onDone?.();
      },
      onError: (error) => {
        console.error('❌ React Native speech synthesis error:', error);
        setSpeeching(false);
        options.onError?.(error);
      },
    };

    await Speech.speak(text, speechOptions);
  }

  /**
   * Stop current speech playback
   */
  stop() {
    if (Platform.OS === 'web') {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      this.currentUtterance = null;
    } else {
      Speech.stop();
    }
    
    setSpeeching(false);
  }

  /**
   * Check if currently speaking
   */
  async isSpeakingAsync(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return window.speechSynthesis?.speaking || false;
    } else {
      return Speech.isSpeakingAsync();
    }
  }

  /**
   * Get available voices (web only)
   */
  async getAvailableVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
    if (Platform.OS === 'web' && 'speechSynthesis' in window) {
      return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        
        if (voices.length === 0) {
          // Some browsers need a moment to load voices
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            resolve(voices);
          };
        } else {
          resolve(voices);
        }
      });
    }
    return [];
  }
}

// Create singleton instance
const systemSpeech = new SystemSpeechService();

export default systemSpeech;
