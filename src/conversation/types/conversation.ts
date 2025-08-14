import { IChatMessage } from 'react-native-gifted-chat';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile, userToChatUser } from "../../auth/types/user";

export interface AICharacter {
    id: number;
    documentId: string;
    name: string;
    introduce: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
}


export interface ConversationUserMessage {
    query: string;
    message_id: string;
}


export interface AIConversation {
  id: number;
  documentId: string;
  query: string;
  answer?: string;
  message_id?: string | null;
  conversation_id?: string | null;
  user?: UserProfile;
  ai_character?: AICharacter;
  createdAt?: Date;
  publishAt?: Date;
  updatedAt: Date;
  message_status?: string;
}

export interface Association {
    id: string;
    type: string;
    icon?: string;
    title?: string;
    tag?: string;
    payload? : any;
}



export const conversationToUserMessage = (conversation: AIConversation): ChatMessage => {
    if (!conversation.user) throw new Error("User is not defined in the conversation");

    return {
        _id:  conversation.message_id || uuidv4(),
        text: conversation.query,
        createdAt: conversation.createdAt || new Date(),
        user: userToChatUser(conversation.user),
        sent: true,
        received: true
    };
};

export const conversationToAnswerMessage = (conversation: AIConversation): ChatMessage | null => {
    if (!conversation.answer ) return null;


    return {
        _id:  conversation.message_id || uuidv4(),
        text: conversation.answer,
        createdAt: conversation.updatedAt,
        user: {
            _id: 1,
            name: "AI",
            avatar: "https://via.placeholder.com/150",
        },
    };
};

export const conversationToChatMessage = (conversation: AIConversation): ChatMessage => {
    // console.log("conversationToChatMessage: ...", conversation);
    if (!conversation.answer ) return conversationToUserMessage(conversation);
    else{
        return conversationToAnswerMessage(conversation);
    }
};



export interface ChatMessage extends IChatMessage {
    _id: string | number;
}
    
