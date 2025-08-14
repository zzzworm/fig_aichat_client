import { SafeAreaView } from "@/components/common/SafeAreaView";
import AvatarProfileItem from "@/components/profile/AvatarProfileItem";
import { ProfileEntryCell } from "@/components/profile/EntryItem";
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import "@/global.css";
import { useAuthStore } from "@/src/auth/stores/auth.store";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView } from 'react-native';

const ProfileScreen = () => {
  const router = useRouter();
  const { user, refreshProfile } = useAuthStore();
  const appVersion = '1.0.0'; // Example version

  const handleEditPress = () => {
    // Navigate to edit profile screen, assuming it exists or will be created
    router.push('/profile/edit');
  };
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProfile?.(); // 只刷新 user
    } finally {
      setRefreshing(false);
    }
  }, [refreshProfile]);


  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
    <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900"
    refreshControl={
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor="#888"
        colors={["#888"]}
      />
    }>
      <View className="p-4">
        <AvatarProfileItem profile={user} onEditPress={handleEditPress} />
      </View>


      <View className="mt-4 mx-4">
        {/* Settings Group */}
        <View className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <Pressable 
            className="p-4 border-b border-gray-200 dark:border-gray-700 flex-row justify-between items-center"
            onPress={() => router.push("/profile/setting")}
          >
            <Text className="text-base text-black dark:text-white">Settings</Text>
            <Text className="text-gray-400 dark:text-gray-500">〉</Text>
          </Pressable>
          <View className="p-4 flex-row justify-between items-center">
            <Text className="text-base text-black dark:text-white">Version</Text>
            <Text className="text-base text-gray-500 dark:text-gray-400">{appVersion}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
