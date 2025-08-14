import { create } from 'zustand';

interface SpeechState {
  speeching: boolean;
  setSpeeching: (speeching: boolean) => void;
}

export const useSpeechStore = create<SpeechState>((set) => ({
  speeching: false,
  setSpeeching: (speeching) => set({ speeching }),
}));
