import elevenLabsSpeech from '@/src/utils/elevenlabs-speech';
import systemSpeech from '@/src/utils/system-speech';
import { create } from 'zustand';
import { useAuthStore } from '../../auth/stores/auth.store';
import chatService from '../services/chat.service';
import { UserProfile } from '@/src/auth/types/user';
import { AICharacter, AIConversation, ChatMessage, ConversationUserMessage, conversationToAnswerMessage,conversationToChatMessage, Pagination, conversationToUserMessage } from '../types';
import { useConversationSettingStore } from './conversationsetting.store';
import removeMarkdown from 'remove-markdown';
import { v4 as uuidv4 } from 'uuid';

interface CharacterConversationState {
  character?: AICharacter;
  conversationHistory: ChatMessage[];
  pagination?: Pagination;
  dataLoadingStatus: 'idle' | 'loading' | 'success' | 'error';
  moreDataLoadingStatus: 'idle' | 'loading' | 'success' | 'error';
  hasMore: boolean;
  isNewMessage: boolean;
  setCharacter: (character: AICharacter) => void;
  fetchHistory: (characterId: string) => Promise<void>;
  fetchMoreHistory: (characterId: string) => Promise<void>;
  createMessage: (characterId: string, message: ConversationUserMessage) => Promise<void>;
  resetIsNewMessageFlag: () => void;

}

export const useCharacterConversationStore = create<CharacterConversationState>((set, get) => ({
  character: undefined,
  conversationHistory: [],
  pagination: undefined,
  dataLoadingStatus: 'idle',
  moreDataLoadingStatus: 'idle',
  hasMore: false,
  isNewMessage: false,

  setCharacter: (character) => set({ character }),


  fetchHistory: async (characterId: string) => {

    // console.log("fetchHistory called, getConversationHistory");
    try {
      // console.log("fetchHistory called, getCharacterConversationList");
      const response = await chatService.getConversationList(characterId, 1, 20);
      const conversations = response.data;
      const currenUser = useAuthStore.getState().user;
      const pagination = response.meta.pagination;
      const messages = conversations
        .map((item: AIConversation) => {
          if(!item.user) item.user = currenUser as UserProfile;
          return conversationToChatMessage(item);
        })
        .filter((msg): msg is ChatMessage => msg !== null);
      const hasMore = pagination.page < pagination.pageCount;
      
      // console.log("fetchHistory called, getConversationHistory");
      set({ 
        conversationHistory: messages, 
        pagination, 
        dataLoadingStatus: 'success', 
        hasMore: hasMore 
      });
    } catch (error) {
      console.error('Failed to fetch character conversation history:', error);
      set({ dataLoadingStatus: 'error' });
    }
  },

  fetchMoreHistory: async (characterId: string) => {
    const { hasMore, pagination, moreDataLoadingStatus } = get();
    if (!hasMore || moreDataLoadingStatus === 'loading' || !pagination) {
      return;
    }

    set({ moreDataLoadingStatus: 'loading', isNewMessage: false });
    try {
      const nextPage = pagination.page + 1;
      const response = await chatService.getConversationList(characterId, nextPage, 20);
      const newConversations = response.data;
      const currenUser = useAuthStore.getState().user;
      const newPagination = response.meta.pagination;
      const newMessages = newConversations
        .map((item: AIConversation) => {
          if(!item.user) item.user = currenUser as UserProfile;
          return conversationToChatMessage(item);
        })
        .filter((msg): msg is ChatMessage => msg !== null);
      const hasMore = newPagination.page < newPagination.pageCount;
      
      set({
        conversationHistory: newMessages,
        pagination: newPagination,
        moreDataLoadingStatus: 'success',
        hasMore: hasMore,
      });
    } catch (error) {
      console.error('Failed to fetch more character conversation history:', error);
      set({ moreDataLoadingStatus: 'error' });
    }
  },
  createMessage: async (characterId: string, userMessage: ConversationUserMessage) => {
    const { character } = get();
    const { user } = useAuthStore.getState();

    if (!character || !user) {
      console.error('Character not available', character);
      console.error('User not available', user);
      return;
    }
    console.log("user message:", userMessage.query);
    
    // Create temporary user message
    const tempUserConversation: AIConversation = {
      id: Date.now(),
      documentId: userMessage.message_id,
      query: userMessage.query,
      updatedAt: new Date(),
      createdAt: new Date(),
      user: user,
    };
    
    const tempMessage = conversationToUserMessage(tempUserConversation);

    // Create temporary answer message
    const tempAnswerConversation: AIConversation = {
      id: Date.now() + 1,
      documentId: uuidv4(),
      query: userMessage.query,
      answer: "Thinking",
      updatedAt: new Date(),
      createdAt: new Date(),
      user: user,
    };
    
    const tempAnswerMessage = conversationToAnswerMessage(tempAnswerConversation);
    
    if (!tempAnswerMessage) {
      console.error('Failed to create temporary answer message');
      return;
    }

    set(state => ({ 
      conversationHistory: [tempAnswerMessage, tempMessage, ...state.conversationHistory], 
      isNewMessage: false 
    }));

    try {
      const response = await chatService.createCharacterConversation(characterId, userMessage);
      const queryMessage = response.data[0];
      if(!queryMessage.user) queryMessage.user = user as UserProfile;
      const queryChatMessage = conversationToUserMessage(queryMessage);
      const answerMessage = response.data[1];
      console.log("answerMessage:", answerMessage.answer);
      const newMessage = conversationToAnswerMessage(answerMessage);
      
      if (!newMessage) {
        console.error('Failed to create answer message');
        return;
      }
      
      const allMessages = [newMessage, queryChatMessage, ...get().conversationHistory];
      
      // If autoSpeech is true, speak the message using selected speech engine
      if (useConversationSettingStore.getState().autoSpeech) {
        const pureText = removeMarkdown(newMessage.text);
        const { speechEngine, language } = useConversationSettingStore.getState();
        
        if (speechEngine === 'elevenlabs') {
          elevenLabsSpeech.speak(pureText, {
            language: language,
          });
        } else if (speechEngine === 'system') {
          systemSpeech.speak(pureText, {
            language: language,
          });
        }
      }
      
      set({
        conversationHistory: allMessages,
        dataLoadingStatus: 'success',
        isNewMessage: true,
      });

      setTimeout(() => {
        set({ isNewMessage: false });
      }, 1500);
    } catch (error) {
      console.error('Failed to create message:', error);
      set(state => ({ 
        conversationHistory: state.conversationHistory.filter(msg => msg._id !== tempMessage._id),
      }));
    }
  },
  resetIsNewMessageFlag: () => set({ isNewMessage: false }),
}));
