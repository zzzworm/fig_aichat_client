import { SafeAreaView } from '@/components/common/SafeAreaView';
import { renderInputToolbar, renderMessageText, renderSend } from '@/components/conversation/ConversationMessage';
import { Button, ButtonIcon } from "@/components/ui/button";
import { useAuthStore } from '@/src/auth/stores/auth.store';
import { userToChatUser } from '@/src/auth/types/user';
import { useCharacterConversationStore } from '@/src/conversation/store/conversation.store';
import { ConversationUserMessage } from '@/src/conversation/types';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { SettingsIcon } from "lucide-react-native";
import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { v4 as uuidv4 } from 'uuid';



const CreateConversationScreen = () => {
    const router = useRouter();
  const {id: characterId, title} = useLocalSearchParams<{ id: string, title: string }>();
  const { user } = useAuthStore();
  const chatUser = user ? userToChatUser(user) : { _id: -1 };
  const {
    conversationHistory,
    fetchHistory,
    createMessage,
    fetchMoreHistory,
    hasMore,
    moreDataLoadingStatus,
    isNewMessage,
    resetIsNewMessageFlag,
  } = useCharacterConversationStore();

  const [currentMessageText, setCurrentMessageText] = useState('');


  useEffect(() => {
    console.log("useEffect, fetchHistory, characterId: ", characterId);
    if (characterId) {
      fetchHistory(characterId);
    }
  }, [characterId, fetchHistory]);



  // Reset the new message flag after the animation
  useEffect(() => {
    if (isNewMessage) {
      const timer = setTimeout(() => {
        resetIsNewMessageFlag();
      }, 1600); // A bit longer than animation to be safe
      return () => clearTimeout(timer);
    }
  }, [isNewMessage, resetIsNewMessageFlag]);



  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerRight: () => (
        <Button
          size="lg"
          variant="link"
          onPress={() => {
            router.push({
              pathname: '/conversation/conversation-setting',
              params: { characterId },
            } as any);
          }}
        >
          <ButtonIcon as={SettingsIcon} />
        </Button>
      ),
    });
  }, [navigation, title, characterId, router]);

  const onSend = useCallback((messages: IMessage[] = []) => {
    if (characterId) {
      for (const message of messages) {
        const userMessage : ConversationUserMessage = {
          query: message.text,
          message_id: uuidv4(),
        };
        createMessage(characterId, userMessage);
      }
    }
  }, [characterId, createMessage]);


  const handleSubmitText = useCallback((text: string) => {
    if (characterId) {
      const userMessage : ConversationUserMessage = {
        query: text,
        message_id: uuidv4(),
      };
      createMessage(characterId, userMessage);
    }
  }, [characterId, createMessage]);


  const loadMoreMessages = () => {
    if (characterId) {
      // console.log("loadMoreMessages");
      fetchMoreHistory(characterId);
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">

       
        <GiftedChat
          alignTop={false}
          messages={conversationHistory}
          onSend={messages => onSend(messages)}
          user={chatUser}
          loadEarlier={hasMore}
          onLoadEarlier={loadMoreMessages}
          isLoadingEarlier={moreDataLoadingStatus === 'loading'}
          showUserAvatar={false}
          showAvatarForEveryMessage={false}
          renderMessageText={(props) => renderMessageText({ ...props, isNew: isNewMessage && props.currentMessage?._id === conversationHistory[0]?._id })}
          renderSend={renderSend}
          infiniteScroll
          renderInputToolbar={renderInputToolbar}
          alwaysShowSend={true}
        />
      
    </SafeAreaView>
  );
};

export default CreateConversationScreen;
