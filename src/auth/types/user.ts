import { User as ChatUser } from 'react-native-gifted-chat';

export enum Sex {
  Male = 'male',
  Female = 'female',
  Unknown = 'unknown',
}


/**
 * User interface representing the user data structure from the API
 */
export interface UserProfile {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  userIconUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

/**
 * Authentication response containing user data and JWT token
 */
export const userToChatUser = (user: UserProfile): ChatUser => {
    return {
        _id: user.documentId, // Use a unique string ID
        name: user.username,
        avatar: user.userIconUrl ?? undefined,
    };
};

/**
 * Authentication response containing user data and JWT token
 */
export interface AuthResponse {
  jwt: string;
  user: UserProfile;
}

