import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import "@/global.css";
import { UserProfile } from '@/src/auth/types/user';
import React from 'react';

interface AvatarProfileItemProps {
  profile: UserProfile;
  onEditPress: () => void;
}

const AvatarProfileItem: React.FC<AvatarProfileItemProps> = ({ profile, onEditPress }) => {
  const renderAvatar = () => {
    if (profile.userIconUrl) {
      return (
        <Image
          source={{ uri: profile.userIconUrl }}
          className="w-full h-full rounded-full"
          resizeMode="cover"
          alt={profile.username}
        />
      );
    }
    
    return (
      <Text className="text-5xl text-gray-600">
        {profile.username?.charAt(0)?.toUpperCase() || 'U'}
      </Text>
    );
  };

  return (
    <View className="items-center p-4">
      <View className="w-32 h-32 rounded-full bg-gray-200 justify-center items-center mb-4">
        {renderAvatar()}
      </View>
      
      <View className="items-center mb-4">
        {profile.phoneNumber && (
          <Text className="text-lg font-semibold text-black mb-1">
            {profile.phoneNumber}
          </Text>
        )}
        
        <Text className="text-base text-gray-600 mb-4">
          {profile.username}
        </Text>
      </View>
      
      <Pressable
        onPress={onEditPress}
        className="border border-gray-400 rounded-lg px-4 py-2 bg-black/5"
      >
        <Text className="text-black">Edit Profile</Text>
      </Pressable>
      
      {/* User ID section - uncomment if needed
      <View className="flex-row items-center mt-2">
        <Text className="text-sm text-gray-900">用户ID：{profile.id}</Text>
      </View>
      */}
    </View>
  );
};

export default AvatarProfileItem;
