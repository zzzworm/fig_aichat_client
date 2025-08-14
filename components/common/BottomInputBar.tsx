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
    <VStack className="border-t border-gray-200 dark:border-gray-700">
      {isSpeechMode ? (
        <HoldRecordButton onRecordingComplete={handleRecordingComplete} className='h-8' />
      ) : (
        <TextInput
            value={message}
            onChangeText={(text) => {
              onChangeText?.(text);
              setMessage(text);
            }}
            placeholder={placeholder}
            multiline={true}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            className="bg-white dark:bg-gray-800 ml-2 mr-2 min-h-10"
            editable={!isSpeechMode} // Disable text input when in speech mode
            blurOnSubmit={false}
            autoFocus={false}
            keyboardType="default"
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
