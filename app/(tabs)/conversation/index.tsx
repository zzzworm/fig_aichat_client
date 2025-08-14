import { SafeAreaView } from '@/components/common/SafeAreaView';
import { CharacterCell } from '@/components/conversation/CharacterCell';
import { Button, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useAICharacterStore } from '@/src/conversation/store/character.store';
import { useCharacterConversationStore } from '@/src/conversation/store/conversation.store';
import { AICharacter } from '@/src/conversation/types/character';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const ConversationTabScreen = () => {
  const router = useRouter();

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
    if (dataLoadingStatus === 'notStarted') {
      fetchAICharacters();
    }
  }, [dataLoadingStatus, fetchAICharacters]);

  const handleCharacterPress = (character: AICharacter) => {
    setCharacter(character);
    router.push({ pathname: '/conversation/[id]' as any, params: { id: character.documentId, title: character.name } });
  };

  const renderContent = () => {
    if (dataLoadingStatus === 'loading' && aiCharacterList.length === 0) {
      return (
        <View className="flex-1 justify-center items-center">
          <Spinner size="large" />
        </View>
      );
    }

    if (dataLoadingStatus === 'error') {
      return (
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-center text-red-500 mb-4">
            {error?.message || 'Could not load AI Characters. Please try again.'}
          </Text>
          <Button onPress={() => fetchAICharacters()}>
            <ButtonText>Retry</ButtonText>
          </Button>
        </View>
      );
    }

    if (aiCharacterList.length === 0 && dataLoadingStatus === 'success') {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">No AI coaches found</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={aiCharacterList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleCharacterPress(item)}>
             <CharacterCell aiCharacter={item} />
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
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
