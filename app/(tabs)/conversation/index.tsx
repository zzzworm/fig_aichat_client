import { SafeAreaView } from '@/components/common/SafeAreaView';
import { CharacterCell } from '@/components/conversation/CharacterCell';
import { Button, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useAuthStore } from '@/src/auth/stores/auth.store';
import { useAICharacterStore } from '@/src/conversation/store/character.store';
import { useCharacterConversationStore } from '@/src/conversation/store/conversation.store';
import { AICharacter } from '@/src/conversation/types/character';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList } from 'react-native';

const ConversationTabScreen = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

  const {
    aiCharacterList,
    dataLoadingStatus,
    fetchAICharacters,
    error,
  } = useAICharacterStore();

  const { setCharacter } = useCharacterConversationStore();

  // Refresh AI characters every time the tab is focused
  // useFocusEffect(
  //   React.useCallback(() => {
  //     fetchAICharacters();
  //   }, [fetchAICharacters])
  // );

  useEffect(() => {
    // 只有在用户已登录时才获取角色列表
    if (isLoggedIn && dataLoadingStatus === 'notStarted') {
      console.log('🔐 User is logged in, fetching AI characters...');
      fetchAICharacters();
    } else if (!isLoggedIn) {
      console.log('🚫 User not logged in, skipping character list fetch');
    }
  }, [isLoggedIn, dataLoadingStatus, fetchAICharacters]);

  const handleCharacterPress = (character: AICharacter) => {
    setCharacter(character);
    router.push({ pathname: '/conversation/[id]' as any, params: { id: character.documentId, title: character.name } });
  };

  const renderContent = () => {
    if (dataLoadingStatus === 'loading' && aiCharacterList.length === 0) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 items-center shadow-md border border-gray-100 dark:border-gray-700">
            <Spinner size="large" />
            <Text className="text-gray-600 dark:text-gray-400 mt-4 text-center font-medium">
              Loading AI Characters...
            </Text>
          </View>
        </View>
      );
    }

    if (dataLoadingStatus === 'error') {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 items-center shadow-md border border-gray-100 dark:border-gray-700">
            <Text className="text-center text-red-500 mb-6 text-base font-medium leading-relaxed">
              {error?.message || 'Could not load AI Characters. Please try again.'}
            </Text>
            <Button 
              onPress={() => fetchAICharacters()}
              className="bg-blue-600 rounded-2xl px-6 py-3 border border-blue-500"
            >
              <ButtonText className="text-white font-semibold">Retry</ButtonText>
            </Button>
          </View>
        </View>
      );
    }

    if (aiCharacterList.length === 0 && dataLoadingStatus === 'success') {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 items-center shadow-md border border-gray-100 dark:border-gray-700">
            <Text className="text-gray-500 dark:text-gray-400 text-base font-medium">
              No AI Characters found
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm mt-2 text-center">
              Check back later for new characters
            </Text>
          </View>
        </View>
      );
    }

    return (
      <FlatList
        data={aiCharacterList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable 
            onPress={() => handleCharacterPress(item)}
            className="active:opacity-70 transition-opacity"
          >
             <CharacterCell aiCharacter={item} />
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        onRefresh={() => fetchAICharacters()}
        refreshing={dataLoadingStatus === 'loading'}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-900">
        {renderContent()}
    </SafeAreaView>
  );
};

export default ConversationTabScreen;
