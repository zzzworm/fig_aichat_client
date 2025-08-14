import * as Speech from 'expo-speech';
import { useSpeechStore } from '../stores/speech.store';

const setSpeeching = useSpeechStore.getState().setSpeeching;

const speak = (text: string, options?: Speech.SpeechOptions) => {
  // Stop any previously playing speech to avoid overlaps.
  Speech.stop();

  // Set the global state to indicate speech has started.
  setSpeeching(true);

  const onDone = () => {
    setSpeeching(false);
    // Execute original onDone callback if it exists
    if (options?.onDone) {
      options.onDone();
    }
  };

    const onError = (error: any) => {
    console.error('Expo Speech Error:', error);
    setSpeeching(false);
    // Execute original onError callback if it exists
    if (options?.onError) {
      options.onError(error);
    }
  };

  Speech.speak(text, { ...options, onDone, onError });
};

const stop = () => {
  Speech.stop();
  setSpeeching(false);
};

// A wrapped Speech object to be used across the app
const SystemSpeech = {
  speak,
  stop,
  isSpeakingAsync: Speech.isSpeakingAsync,
  getAvailableVoicesAsync: Speech.getAvailableVoicesAsync,
};

export default SystemSpeech;
