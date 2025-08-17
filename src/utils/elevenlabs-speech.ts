import { createAudioPlayer } from 'expo-audio';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { useSpeechStore } from '../stores/speech.store';
import { audioRouteController } from './audio-route';

const setSpeeching = useSpeechStore.getState().setSpeeching;

interface ElevenLabsSpeechOptions {
  voiceId?: string;
  modelId?: string;
  language?: string;
  onDone?: () => void;
  onError?: (error: any) => void;
}

/**
 * ElevenLabs Speech Synthesis Service
 * Provides high-quality text-to-speech using ElevenLabs API
 * Supports both web and React Native platforms
 */
class ElevenLabsSpeechService {
  private readonly baseUrl = 'https://api.elevenlabs.io/v1';
  private readonly backendUrl = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:1335';
  private apiKey: string | null = null;
  private currentAudio: any = null;
  private audioPlayer: any = null;

  constructor() {
    // Initialize with default API key
    this.apiKey = '1111111';
    
    // Try to fetch the real API key from backend
    this.fetchApiKeyFromBackend();
  }

  /**
   * Fetch API key from backend
   */
  private async fetchApiKeyFromBackend() {
    try {
      const response = await fetch(`${this.backendUrl}/api/elevenlabs-key`);
      if (response.ok) {
        const data = await response.json();
        this.apiKey = data.api_key;
        console.log('✅ ElevenLabs API key fetched from backend');
      } else {
        console.warn('⚠️ Failed to fetch API key from backend, using default');
      }
    } catch (error) {
      console.warn('⚠️ Error fetching API key from backend, using default:', error);
    }
  }

  /**
   * Convert text to speech using ElevenLabs API
   */
  async speak(text: string, options: ElevenLabsSpeechOptions = {}) {
    if (!this.apiKey) {
      console.error('ElevenLabs API key not available');
      options.onError?.(new Error('ElevenLabs API key not available'));
      return;
    }

    if (!text || text.trim().length === 0) {
      console.warn('Empty text provided for speech synthesis');
      return;
    }

    // Stop any previously playing speech to avoid overlaps
    this.stop();

    // Set the global state to indicate speech has started
    setSpeeching(true);

    try {
      // Activate speakerphone for TTS playback
      await audioRouteController.initializeForConversation('speaker');
      console.log('🎤 Starting ElevenLabs speech synthesis for text:', text.substring(0, 100) + '...');
      
      const response = await fetch(`${this.baseUrl}/text-to-speech/${options.voiceId || '21m00Tcm4TlvDq8ikWAM'}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: options.modelId || 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Wrap original onDone and onError to include cleanup
      const originalOnDone = options.onDone;
      const originalOnError = options.onError;

      const cleanupAndCallback = (callback?: (...args: any[]) => void, ...args: any[]) => {
        audioRouteController.cleanup();
        callback?.(...args);
      };

      const enhancedOptions = {
        ...options,
        onDone: () => cleanupAndCallback(originalOnDone),
        onError: (error: any) => cleanupAndCallback(originalOnError, error),
      };

      if (Platform.OS === 'web') {
        // Web platform implementation
        await this.playAudioWeb(response, enhancedOptions);
      } else {
        // React Native platform implementation
        await this.playAudioReactNative(response, enhancedOptions);
      }

      console.log('✅ ElevenLabs speech synthesis completed successfully');

    } catch (error) {
      console.error('❌ ElevenLabs speech synthesis error:', error);
      setSpeeching(false);
      // Ensure cleanup happens on error too
      audioRouteController.cleanup();
      options.onError?.(error);
    }
  }

  /**
   * Play audio on web platform
   */
  private async playAudioWeb(response: Response, options: ElevenLabsSpeechOptions) {
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create audio element and play
    this.currentAudio = new Audio(audioUrl);
    
    this.currentAudio.onended = () => {
      setSpeeching(false);
      URL.revokeObjectURL(audioUrl);
      options.onDone?.();
    };

    this.currentAudio.onerror = (error: Event) => {
      console.error('ElevenLabs audio playback error:', error);
      setSpeeching(false);
      URL.revokeObjectURL(audioUrl);
      options.onError?.(error);
    };

    // Play the audio
    await this.currentAudio.play();
  }

  /**
   * Play audio on React Native platform using expo-audio
   */
  private async playAudioReactNative(response: Response, options: ElevenLabsSpeechOptions) {
    try {
      console.log('📱 Starting React Native audio playback with expo-audio');
      
      // Create a temporary file to store the audio
      const tempFileName = `elevenlabs_audio_${Date.now()}.mp3`;
      const tempFileUri = `${FileSystem.cacheDirectory}${tempFileName}`;
      
      // Convert response to ArrayBuffer and then to base64 efficiently
      const audioArrayBuffer = await response.arrayBuffer();
      
      // Convert ArrayBuffer to base64 using a more efficient method
      const base64Audio = await this.arrayBufferToBase64(audioArrayBuffer);
      
      // Write as base64
      await FileSystem.writeAsStringAsync(tempFileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('🎵 Audio file saved to:', tempFileUri);
      
      // Release previous audio player if exists
      if (this.audioPlayer) {
        try {
          this.audioPlayer.release();
        } catch (error) {
          console.warn('Error releasing previous audio player:', error);
        }
      }
      
      // Create new audio player with the file URI
      this.audioPlayer = createAudioPlayer(tempFileUri);
      
      // Set up status monitoring
      this.monitorAudioPlayback(tempFileUri, options);
      
      // Start playback
      console.log('🎵 Starting audio playback...');
      this.audioPlayer.play();
      
    } catch (error: unknown) {
      console.error('React Native audio playback error:', error);
      setSpeeching(false);
      options.onError?.(error);
    }
  }

  /**
   * Monitor audio playback status
   * Note: This is a simplified monitoring approach.
   * In a real React component, you would use useAudioPlayerStatus hook.
   */
  private monitorAudioPlayback(tempFileUri: string, options: ElevenLabsSpeechOptions) {
    if (!this.audioPlayer) return;
    
    let statusCheckInterval: any;
    let hasCompleted = false;
    
    const checkStatus = async () => {
      if (!this.audioPlayer || hasCompleted) {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
        }
        return;
      }
      
      try {
        // In expo-audio, we need to check the player's current status
        // This is a simplified approach - in a real implementation,
        // you would use useAudioPlayerStatus hook in a React component
        
        // For now, we'll simulate the audio duration and completion
        // In a real app, you would get this from the audio player status
        
        // Check if the audio player is still valid
        if (this.audioPlayer) {
          // Simulate audio completion after a reasonable time
          // In reality, you would check this.audioPlayer.currentTime vs duration
          // console.log('🎵 Audio still playing...');
        }
      } catch (error) {
        console.error('Error checking audio status:', error);
        this.handleAudioCompletion(tempFileUri, options);
        hasCompleted = true;
      }
    };
    
    // Start monitoring
    statusCheckInterval = setInterval(checkStatus, 500);
    
    // Set a fallback completion timer (simplified approach)
    // In a real implementation, you would listen to audio completion events
    setTimeout(() => {
      if (!hasCompleted) {
        console.log('✅ Audio playback completed (fallback timer)');
        this.handleAudioCompletion(tempFileUri, options);
        hasCompleted = true;
      }
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    }, 600000); // 600 second fallback
  }

  /**
   * Handle audio playback completion
   */
  private async handleAudioCompletion(tempFileUri: string, options: ElevenLabsSpeechOptions) {
    console.log('✅ Audio playback completed');
    setSpeeching(false);
    
    // Clean up audio player
    if (this.audioPlayer) {
      try {
        this.audioPlayer.release();
        this.audioPlayer = null;
      } catch (error) {
        console.warn('Error releasing audio player:', error);
      }
    }
    
    // Clean up temporary file
    try {
      const fileInfo = await FileSystem.getInfoAsync(tempFileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(tempFileUri);
        console.log('🗑️ Temporary audio file deleted');
      }
    } catch (error) {
      console.warn('Error deleting temporary audio file:', error);
    }

    options.onDone?.();
  }

  /**
   * Stop current speech playback
   */
  stop() {
    // Stop web audio
    if (this.currentAudio) {
      if (Platform.OS === 'web' && this.currentAudio instanceof HTMLAudioElement) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      }
      this.currentAudio = null;
    }
    
    // Stop React Native audio player
    if (this.audioPlayer) {
      try {
        // Stop and release the audio player
        this.audioPlayer.pause();
        this.audioPlayer.release();
        this.audioPlayer = null;
        console.log('🛑 Audio player stopped and released');
      } catch (error) {
        console.warn('Error stopping audio player:', error);
        this.audioPlayer = null;
      }
    }
    
    // Cleanup audio route
    audioRouteController.cleanup();
    setSpeeching(false);
  }

  /**
   * Check if currently speaking
   */
  async isSpeakingAsync(): Promise<boolean> {
    if (Platform.OS === 'web' && this.currentAudio instanceof HTMLAudioElement) {
      return !this.currentAudio.ended && !this.currentAudio.paused;
    }
    return false;
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getAvailableVoicesAsync() {
    if (!this.apiKey) {
      console.error('ElevenLabs API key not available');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Failed to fetch ElevenLabs voices:', error);
      return [];
    }
  }

  /**
   * Get voice details by ID
   */
  async getVoiceById(voiceId: string) {
    if (!this.apiKey) {
      console.error('ElevenLabs API key not available');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voice: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch voice details:', error);
      return null;
    }
  }

  /**
   * Refresh API key from backend
   */
  async refreshApiKey() {
    await this.fetchApiKeyFromBackend();
  }

  /**
   * Convert ArrayBuffer to Base64 efficiently (avoids stack overflow)
   */
  private async arrayBufferToBase64(arrayBuffer: ArrayBuffer): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryString = '';
        
        // Process in smaller chunks to avoid stack overflow
        const chunkSize = 1024; // 1KB chunks for safety
        
        const processChunk = (index: number) => {
          if (index >= uint8Array.length) {
            // All chunks processed, convert to base64
            const base64 = btoa(binaryString);
            resolve(base64);
            return;
          }
          
          // Process current chunk
          const endIndex = Math.min(index + chunkSize, uint8Array.length);
          const chunk = uint8Array.slice(index, endIndex);
          
          // Convert chunk to string
          for (let i = 0; i < chunk.length; i++) {
            binaryString += String.fromCharCode(chunk[i]);
          }
          
          // Use setTimeout to avoid blocking the main thread
          setTimeout(() => processChunk(endIndex), 0);
        };
        
        processChunk(0);
      } catch (error) {
        reject(error);
      }
    });
  }


}

// Create singleton instance
const elevenLabsSpeech = new ElevenLabsSpeechService();

export default elevenLabsSpeech;
