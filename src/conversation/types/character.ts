import { User as ChatUser } from 'react-native-gifted-chat';

export interface AICharacter {
    id: number;
    documentId: string;
    name: string;
    introduce: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
    coverUrl: string;
    agentId: string;
}

export const characterToChatUser = (character: AICharacter): ChatUser => {
    return {
        _id: character.documentId, // Use a unique string ID
        name: character.name,
        avatar: character.coverUrl,
    };
};

