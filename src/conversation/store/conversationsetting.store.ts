import { create } from 'zustand';

export type SpeechEngine = 'elevenlabs' | 'system';

interface ConversationSettingState {
  language: string;
  speed: number;
  autoSpeech: boolean;
  speechEngine: SpeechEngine;
  setLanguage: (language: string) => void;
  setSpeed: (speed: number) => void;
  setAutoSpeech: (autoSpeech: boolean) => void;
  setSpeechEngine: (speechEngine: SpeechEngine) => void;
}

export const useConversationSettingStore = create<ConversationSettingState>((set) => ({
  language: 'en-US',
  speed: 1.0,
  autoSpeech: true,
  speechEngine: 'elevenlabs',
  setLanguage: (language) => set({ language }),
  setSpeed: (speed) => set({ speed }),
  setAutoSpeech: (autoSpeech) => set({ autoSpeech }),
  setSpeechEngine: (speechEngine) => set({ speechEngine }),
}));
