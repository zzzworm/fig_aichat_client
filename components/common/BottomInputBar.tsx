import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { KeyboardIcon, MicIcon, SendIcon } from 'lucide-react-native';

import React, { useState } from 'react';
import { TextInput } from 'react-native';

interface BottomInputBarProps {
  value?: string;
  placeholder?: string;
  speechMode?: boolean;
  onChangeText?: (text: string) => void;
  onSubmit: (text: string) => void;
}

export const BottomInputBar = ({ value, onChangeText, placeholder, speechMode, onSubmit: onSubmit }: BottomInputBarProps) => {
  const [message, setMessage] = useState(value ?? "");

  const handleSend = () => {
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isSpeechMode, setIsSpeechMode] = useState(speechMode ?? false);

  useSpeechRecognitionEvent('start', () => {
    setIsRecognizing(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsRecognizing(false);
    setIsSpeechMode(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    if (event.results && event.results[0]) {
      onChangeText?.(event.results[0].transcript);
      setMessage(event.results[0].transcript);
      setIsSpeechMode(false);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error', event.error, event.message);
    setIsRecognizing(false);
  });

  const handlePermissions = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn('Permissions not granted for speech recognition');
    }
    return result.granted;
  };

  const startRecognition = async () => {
    const hasPermissions = await handlePermissions();
    if (!hasPermissions) return;

    const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();
    console.log("Speech recognition available:", available);
    // e.g. ["com.google.android.as", "com.google.android.tts", "com.samsung.android.bixby.agent"]

    await ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: true, // Keep recognizing until stopped
    });
  };

  const stopRecognition = async () => {
    await ExpoSpeechRecognitionModule.stop();
  };

  const toggleInputMode = () => {
    setIsSpeechMode(!isSpeechMode);
    if (isRecognizing) {
        stopRecognition();
    }
  };


  return (
    <VStack className="border-t border-gray-200 dark:border-gray-700">
      {isSpeechMode ? (
        <Button 
          onPressIn={startRecognition}
          onPressOut={stopRecognition}
          className="bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 h-10 justify-center items-center"
        >
          <ButtonText className="text-dark dark:text-white">
            {isRecognizing ? '正在识别...' : '按住说话'}
          </ButtonText>
        </Button>
      ) : (
        <TextInput
            value={message}
            onChangeText={(text) => {
              onChangeText?.(text);
              setIsSpeechMode(false);
              setMessage(text);
            }}
            placeholder={placeholder}
            multiline={true}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            className="bg-white dark:bg-gray-800 ml-2 mr-2 min-h-10"
          />
      )}
      <HStack className="bg-clear border-t border-gray-200 dark:border-gray-700 items-center">
        <Button onPress={toggleInputMode} className="bg-clear">
          <ButtonIcon as={isSpeechMode ? KeyboardIcon : MicIcon} size="lg" className="text-dark dark:text-white" />
        </Button>
        <Text className=' flex-1 text-xs text-gray-500 text-center'>
              AI Response is for reference only
        </Text>
        <Button onPress={handleSend} className="bg-clear">
          <ButtonIcon as={SendIcon} size="lg" className="text-dark dark:text-white" />
        </Button>
      </HStack>
    </VStack>
  );
};
