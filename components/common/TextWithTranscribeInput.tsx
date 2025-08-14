import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import speechanalysisService from '@/src/api/speechanalysis.service';
import { KeyboardIcon, MicIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, TextInput } from 'react-native';
import HoldRecordButton from './HoldRecordButton';

interface TextWithTranscribeInputProps {
  value: string;
  transcribeMode?: boolean;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: (text: string) => void;
  onTranscribeStart?: () => void;
  onTranscribeEnd?: () => void;
  onTranscribeError?: (error: string) => void;
  onTranscribeModeChange?: (mode: boolean) => void; // New: External control of mode changes
}

export const TextWithTranscribeInput = ({
  value,
  transcribeMode = false,
  onChangeText,
  placeholder = 'Please enter...',
  onSubmit,
  onTranscribeStart,
  onTranscribeEnd,
  onTranscribeError,
  onTranscribeModeChange, // New: External control of mode changes
}: TextWithTranscribeInputProps) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranscribeMode, setIsTranscribeMode] = useState(transcribeMode ?? false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);

  // Listen for external transcribeMode changes
  React.useEffect(() => {
    setIsTranscribeMode(transcribeMode);
  }, [transcribeMode]);

  // Handle recording completion
  const handleRecordingComplete = async (uri: string | null) => {
    if (!uri) {
      console.warn('Recording failed, no audio file obtained');
      Alert.alert('Recording Failed', 'Failed to obtain audio file, please try again');
      return;
    }

    console.log('Recording completed, starting transcription:', uri);
    setRecordingUri(uri);
    setIsTranscribing(true);
    onTranscribeStart?.();

    try {
      // Call transcription API
      const result = await speechanalysisService.transcribe(uri);
      console.log('Transcription result:', result.transcription);
      
      // Update text content
      onChangeText(result.transcription);
      
      // Exit transcription mode
      const newMode = false;
      setIsTranscribeMode(newMode);
      onTranscribeModeChange?.(newMode); // Notify external mode change
      
      onTranscribeEnd?.();
      
      // Optional: Show transcription success prompt
      if (result.confidence && result.confidence > 0.8) {
        // console.log(`Transcription successful, confidence: ${(result.confidence * 100).toFixed(1)}%`);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Transcription failed, please try again';
      
      onTranscribeError?.(errorMsg);
      Alert.alert('Transcription Failed', errorMsg);
    } finally {
      setIsTranscribing(false);
      setRecordingUri(null);
    }
  };

  // Toggle input mode
  const toggleInputMode = () => {
    if (isTranscribing) {
      // If transcribing, switching is not allowed
      return;
    }
    
    const newMode = !isTranscribeMode;
    setIsTranscribeMode(newMode);
    onTranscribeModeChange?.(newMode); // Notify external mode change
  };

  return (
    <HStack space="sm" className="flex-1 items-start">
      {/* Mode toggle button */}
      <Button 
        onPress={toggleInputMode} 
        disabled={isTranscribing}
        className="bg-clear border border-gray-200 dark:border-gray-700"
      >
        <ButtonIcon 
          as={isTranscribeMode ? KeyboardIcon : MicIcon} 
          size="lg" 
          className="text-dark dark:text-white" 
        />
      </Button>

      {/* Transcription mode */}
      {isTranscribeMode ? (
        <HStack space="sm" className="flex-1 items-center">
          {isTranscribing ? (
            // Transcribing state
            <Button 
              disabled
              className="flex-1 mr-2 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-600 h-10 justify-center items-center"
            >
              <ButtonIcon as={Spinner} size="sm" className="mr-2" />
              <ButtonText className="text-blue-600 dark:text-blue-300">
                Transcribing...
              </ButtonText>
            </Button>
          ) : (
            // Recording button
            <HoldRecordButton onRecordingComplete={handleRecordingComplete} className='flex-1 bg-gray-100 border border-gray-300 dark:border-gray-600 h-10 justify-center items-center' />
          )}
        </HStack>
      ) : (
        // Text input mode
        <TextInput
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setIsTranscribeMode(false);
          }}
          placeholder={placeholder}
          multiline={true}
          onSubmitEditing={(e) => onSubmit && onSubmit(e.nativeEvent.text)}
          returnKeyType="send"
          className="bg-white dark:bg-gray-800 flex-1 mr-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-dark dark:text-white"
          editable={!isTranscribing}
        />
      )}
    </HStack>
  );
};
