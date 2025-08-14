import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import "@/global.css";
import { useAuthStore } from '@/src/auth/stores/auth.store';
import { ScrollView } from 'react-native';
import React from 'react';

const SettingScreen = () => {
  const { logout } = useAuthStore();
  return (
    <ScrollView className="flex-1 bg-gray-100 dark:bg-gray-900">
      <View className="p-4">
        <View className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <Pressable
            className="p-4"
            onPress={() => logout()}
          >
            <Text className="text-red-500 text-base font-semibold text-center">Logout</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingScreen;
