import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import {
  AudioModule,
  AudioQuality,
  IOSOutputFormat,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type RecordingOptions,
} from 'expo-audio';
import { Mic } from 'lucide-react-native';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Alert, GestureResponderEvent } from 'react-native';

interface HoldRecordButtonProps {
  onRecordingComplete: (uri: string | null) => void;
  className?: string;
  isHodding?: boolean; // Read-only property exposed externally
  onHoddingChange?: (isHodding: boolean) => void; // State change callback
}

// Read-only property interface exposed externally
export interface HoldRecordButtonRef {
  readonly isHodding: boolean;
}

// Custom WAV format recording configuration, ensuring cross-platform consistency
const WAV_RECORDING_OPTIONS: RecordingOptions = {
  isMeteringEnabled: true,
  extension: '.wav',
  sampleRate: 44100,
  numberOfChannels: 1, // Mono channel, reducing file size
  bitRate: 128000,
  android: {
    extension: '.wav',
    outputFormat: 'default', // Android default format supports WAV
    audioEncoder: 'default',
    sampleRate: 44100,
  },
  ios: {
    extension: '.wav',
    outputFormat: IOSOutputFormat.LINEARPCM, // Linear PCM = WAV format
    audioQuality: AudioQuality.HIGH,
    sampleRate: 44100,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/wav',
    bitsPerSecond: 128000,
  },
};

const HoldRecordButton = forwardRef<HoldRecordButtonRef, HoldRecordButtonProps>(({ 
  onRecordingComplete, 
  className, 
  isHodding: externalIsHodding,
  onHoddingChange 
}, ref) => {
  const audioRecorder = useAudioRecorder(WAV_RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [internalIsHodding, setInternalIsHodding] = useState(false);
  
  // Use external state or internal state
  const isHodding = externalIsHodding !== undefined ? externalIsHodding : internalIsHodding;
  
  // Expose read-only property externally
  useImperativeHandle(ref, () => ({
    get isHodding() {
      return isHodding;
    }
  }), [isHodding]);
  
  // State change handler function
  const updateHoddingState = (newState: boolean) => {
    if (externalIsHodding === undefined) {
      setInternalIsHodding(newState);
    }
    onHoddingChange?.(newState);
  };

  useEffect(() => {
    const setupAudio = async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert('Permission Denied', 'Microphone permission is required for recording');
          return;
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (error) {
        console.error('Failed to setup audio:', error);
      }
    };

    setupAudio();
  }, []);

  const startRecording = async () => {
    try {
      console.log('Starting WAV recording...');
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Failed', 'Unable to start recording, please check microphone permissions');
    }
  };

  const stopRecording = async () => {
    try {
      console.log('Stopping WAV recording...');
      await audioRecorder.stop();
      // The recording URI is available on audioRecorder.uri
      const uri = audioRecorder.uri;
      console.log('WAV recording stopped and stored at:', uri);
      onRecordingComplete(uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      onRecordingComplete(null);
    }
  };

  const handlePressIn = (event: GestureResponderEvent) => {
    event.preventDefault();
    updateHoddingState(true);
    if (!recorderState.isRecording) {
      startRecording();
    }
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    event.preventDefault();
    updateHoddingState(false);
    if (recorderState.isRecording) {
      stopRecording();
    }
  };

  return (
    <Button
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className={`flex-row justify-center m-3 rounded-full border ${
        isHodding 
          ? 'bg-red-500 border-red-600' 
          : 'bg-gray-100 border-gray-300'
      } ${className || ''}`}
    >
      <ButtonIcon 
        as={Mic} 
        className={`mr-2 ${isHodding ? 'text-white' : 'text-gray-700'}`}
      />
      <ButtonText 
        className={`text-base font-bold ${
          recorderState.isRecording ? 'text-white' : 'text-gray-700'
        }`}
      >
        {recorderState.isRecording ? 'Release to stop' : (isHodding ? 'Preparing...' : 'Hold to speak')}
      </ButtonText>
    </Button>
  );
});

HoldRecordButton.displayName = 'HoldRecordButton';

export default HoldRecordButton;
