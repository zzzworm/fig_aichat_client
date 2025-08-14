import { create } from 'zustand';
import CharacterService from '../services/chat.service';
import { AICharacter } from '../types/character';

type DataLoadingStatus = 'notStarted' | 'loading' | 'success' | 'error';

interface AICharacterState {
  aiCharacterList: AICharacter[];
  selectedCharacter: AICharacter | null;
  dataLoadingStatus: DataLoadingStatus;
  error: Error | null;
  fetchAICharacters: () => Promise<void>;
  selectCharacter: (character: AICharacter) => void;
  setSelectedCharacterID: (characterID: string) => void;
}

export const useAICharacterStore = create<AICharacterState>((set, get) => ({
  aiCharacterList: [],
  selectedCharacter: null,
  dataLoadingStatus: 'notStarted',
  error: null,

  fetchAICharacters: async () => {
    if (get().dataLoadingStatus === 'loading') return;

    set({ dataLoadingStatus: 'loading', error: null });

    try {
      const response = await CharacterService.getCharacterList();
      const characters = response.data;
      set({
        aiCharacterList: characters,
        selectedCharacter: characters.length > 0 ? characters[0] : null,
        dataLoadingStatus: 'success',
      });
    } catch (error: any) {
      console.error('Error fetching AI Characters:', error);
      set({ dataLoadingStatus: 'error', error });
    }
  },

  selectCharacter: (character) => {
    set({ selectedCharacter: character });
  },

  setSelectedCharacterID: (characterID: string) => {
    set({ selectedCharacter: get().aiCharacterList.find(t => t.documentId === characterID) });
  },
}));
