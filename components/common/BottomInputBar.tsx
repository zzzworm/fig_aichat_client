import { Button, ButtonIcon } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import speechTranscribeService from '@/src/api/speech.transcribe.service';
import { KeyboardIcon, MicIcon, SendIcon } from 'lucide-react-native';

import React, { useState } from 'react';
import { Alert, TextInput } from 'react-native';
import HoldRecordButton from './HoldRecordButton';

interface BottomInputBarProps {
  value?: string;
  placeholder?: string;
  speechMode?: boolean;
  onChangeText?: (text: string) => void;
  onSubmit: (text: string) => void;
}

export const BottomInputBar = ({ value, onChangeText, placeholder, speechMode, onSubmit: onSubmit }: BottomInputBarProps) => {
  const [message, setMessage] = useState(value ?? "");
  const [isSpeechMode, setIsSpeechMode] = useState(speechMode ?? false);

  const handleSend = () => {
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage('');
    }
  };

  // Handle recording completion
  const handleRecordingComplete = async (uri: string | null) => {
    if (!uri) {
      console.warn('Recording failed, no audio file obtained');
      Alert.alert('Recording Failed', 'Failed to obtain audio file, please try again');
      return;
    }

    console.log('Recording completed, starting transcription:', uri);

    try {
      // Call transcription API
      const result = await speechTranscribeService.transcribe(uri);
      console.log('💬 Transcription result:', result.transcription);
      
      // Update text content and switch back to text mode
      if (result.transcription && result.transcription.trim()) {
        const transcribedText = result.transcription.trim();
        setMessage(transcribedText);
        onChangeText?.(transcribedText);
        
        // Switch back to text input mode
        setIsSpeechMode(false);
        
        // Show transcription success prompt
        if (result.confidence && result.confidence > 0.8) {
          console.log(`Transcription successful, confidence: ${(result.confidence * 100).toFixed(1)}%`);
        }
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Transcription failed, please try again';
      
      Alert.alert('Transcription Failed', errorMsg);
      // Switch back to text input mode even on error
      setIsSpeechMode(false);
    }
  };

  const toggleInputMode = () => {
    setIsSpeechMode(!isSpeechMode);
  };


  return (
    <VStack className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
      {isSpeechMode ? (
        <VStack className="px-4 py-3">
          <HoldRecordButton onRecordingComplete={handleRecordingComplete} className="h-12" />
        </VStack>
      ) : (
        <VStack className="px-4 py-3">
          <TextInput
            value={message}
            onChangeText={(text) => {
              onChangeText?.(text);
              setMessage(text);
            }}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline={true}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-4 py-3 text-gray-900 dark:text-white text-base min-h-[44px] max-h-32"
            editable={!isSpeechMode}
            blurOnSubmit={false}
            autoFocus={false}
            keyboardType="default"
            style={{ textAlignVertical: 'top' }}
          />
        </VStack>
      )}
      <HStack className="px-4 pb-3 items-center justify-between">
        <Button 
          onPress={toggleInputMode} 
          className="bg-gray-100 dark:bg-gray-700 rounded-full p-3 border border-gray-200 dark:border-gray-600"
        >
          <ButtonIcon 
            as={isSpeechMode ? KeyboardIcon : MicIcon} 
            size="md" 
            className="text-blue-600 dark:text-blue-400" 
          />
        </Button>
        <Text className="flex-1 text-xs text-gray-500 dark:text-gray-400 text-center px-4 font-medium">
          AI Response is for reference only
        </Text>
        <Button 
          onPress={handleSend} 
          className="bg-blue-600 dark:bg-blue-500 rounded-full p-3 border border-blue-500 dark:border-blue-400"
        >
          <ButtonIcon 
            as={SendIcon} 
            size="md" 
            className="text-white" 
          />
        </Button>
      </HStack>
    </VStack>
  );
};
