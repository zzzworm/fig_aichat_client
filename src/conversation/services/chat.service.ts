import { useAuthStore } from '@/src/auth/stores/auth.store';
import { StrapiResponse } from 'strapi-sdk-js';
import strapi from '../../api/client';
import { AICharacter, AIConversation, ConversationUserMessage } from '../types';
import { StrapiResponseWithMeta } from '../types/strapi';

class ChatService {
  async getCharacterList(): Promise<StrapiResponse<AICharacter[]>> {
    try {
      const response = await strapi.find<AICharacter>('ai-characters', {
        populate: '*',
      });
      return response;
    } catch (error) {
      console.error('Error fetching AI Character list:', error);
      throw error;
    }
  }

  async getConversationList(characterId: string, page: number, pageSize: number): Promise<StrapiResponseWithMeta<AIConversation[]>> {
    try {
      const user = useAuthStore.getState().user;
      const response = await strapi.find<AIConversation>('chat-conversations', {
        filters: {
          ai_character: {
              documentId: {
                $eq: characterId,
              },
          },
          user: {
            documentId: {
              $eq: user?.documentId,
            },
          },
        },
        sort: 'createdAt:desc',
        pagination: {
          page,
          pageSize,
        },
        populate: '*',
      });
      // console.log("getConversationList response: ...", response);
      return response as StrapiResponseWithMeta<AIConversation[]>;
    } catch (error) {
      console.error('Error fetching AI character conversations:', error);
      throw error;
    }
  }

  async createCharacterConversation(AICharacterId: string, message: ConversationUserMessage): Promise<StrapiResponse<AIConversation[]>> {
    try {
      const response = await strapi.create('chat-conversations/create-message', {
        character_id:  AICharacterId ,
        query: message.query,
      });
      return response as StrapiResponse<AIConversation[]>;
    } catch (error) {
      console.error('Error creating AI character conversation:', error);
      throw error;
    }
  }

  
}

export default new ChatService();
