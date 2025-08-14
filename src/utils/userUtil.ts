import { UserProfile } from "../auth/types/user";

const transformUserData = (userData: any): UserProfile => {
    return {
      id: userData.id,
      documentId: userData.documentId || '',
      username: userData.username || '',
      email: userData.email,
      provider: userData.provider || 'local',
      confirmed: userData.confirmed || false,
      blocked: userData.blocked || false,
      userIconUrl: userData.userIconUrl || null,
      city: userData.city || null,
      phoneNumber: userData.phoneNumber || null,
      sex: userData.sex || 'other',
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      publishedAt: userData.publishedAt || new Date().toISOString(),
      study_setting: userData.study_setting || null,
    };
  }

  export default transformUserData;