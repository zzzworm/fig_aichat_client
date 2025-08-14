import { create } from 'zustand';

interface ConversationSettingState {
  language: string;
  speed: number;
  autoSpeech: boolean;
  setLanguage: (language: string) => void;
  setSpeed: (speed: number) => void;
  setAutoSpeech: (autoSpeech: boolean) => void;
}

export const useConversationSettingStore = create<ConversationSettingState>((set) => ({
  language: 'en-US',
  speed: 1.0,
  autoSpeech: false,
  setLanguage: (language) => set({ language }),
  setSpeed: (speed) => set({ speed }),
  setAutoSpeech: (autoSpeech) => set({ autoSpeech }),
}));
