/**
 * Example React Component using expo-audio hooks for ElevenLabs TTS
 * This shows how to properly integrate expo-audio with React hooks
 * for better status monitoring and lifecycle management
 */

import React, { useState, useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as FileSystem from 'expo-file-system';

interface ElevenLabsAudioPlayerProps {
  text: string;
  apiKey: string;
  voiceId?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: string) => void;
}

export const ElevenLabsAudioPlayer: React.FC<ElevenLabsAudioPlayerProps> = ({
  text,
  apiKey,
  voiceId = '21m00Tcm4TlvDq8ikWAM',
  onPlayStart,
  onPlayEnd,
  onError
}) => {
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  
  // Create audio player with the current audio URI
  const audioPlayer = useAudioPlayer(audioUri);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  // Monitor audio loading status and auto-play when ready
  useEffect(() => {
    if (audioStatus?.isLoaded && shouldAutoPlay && !audioStatus?.playing) {
      console.log('🎵 Auto-playing audio');
      audioPlayer.play();
      setShouldAutoPlay(false);
      onPlayStart?.();
    }
  }, [shouldAutoPlay, audioStatus?.isLoaded, audioStatus?.playing, audioPlayer, onPlayStart]);

  // Monitor audio playback status changes
  useEffect(() => {
    if (audioStatus?.isLoaded) {
      const isPlaying = audioStatus.playing === true;
      console.log('🎵 Audio status changed:', {
        isPlaying,
        isBuffering: audioStatus.isBuffering,
        currentTime: audioStatus.currentTime,
        duration: audioStatus.duration
      });
    }
  }, [audioStatus?.playing, audioStatus?.isLoaded, audioStatus?.currentTime]);

  // Monitor audio completion
  useEffect(() => {
    if (
      audioStatus?.isLoaded && 
      !audioStatus?.playing && 
      !audioStatus?.isBuffering &&
      audioStatus?.currentTime > 0 &&
      audioStatus?.duration > 0 &&
      Math.abs(audioStatus.currentTime - audioStatus.duration) < 0.1
    ) {
      console.log('✅ Audio playback completed');
      onPlayEnd?.();
      
      // Clean up the temporary file
      if (audioUri) {
        cleanupAudioFile(audioUri);
      }
    }
  }, [
    audioStatus?.isLoaded, 
    audioStatus?.playing, 
    audioStatus?.isBuffering,
    audioStatus?.currentTime,
    audioStatus?.duration,
    audioUri,
    onPlayEnd
  ]);

  /**
   * Generate speech using ElevenLabs API
   */
  const generateSpeech = async () => {
    if (!text || !apiKey) {
      onError?.('Text or API key is missing');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('🎤 Starting ElevenLabs TTS generation...');
      
      // Call ElevenLabs API
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      // Convert response to array buffer
      const audioArrayBuffer = await response.arrayBuffer();
      
      // Create temporary file
      const tempFileName = `elevenlabs_${Date.now()}.mp3`;
      const tempFileUri = `${FileSystem.cacheDirectory}${tempFileName}`;
      
      // Save audio to file
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));
      await FileSystem.writeAsStringAsync(tempFileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('✅ Audio file saved:', tempFileUri);
      
      // Set the audio URI (this will trigger the useAudioPlayer hook)
      setAudioUri(tempFileUri);
      setShouldAutoPlay(true);
      
    } catch (error) {
      console.error('❌ ElevenLabs TTS error:', error);
      onError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clean up temporary audio file
   */
  const cleanupAudioFile = async (fileUri: string) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
        console.log('🗑️ Temporary audio file deleted');
      }
    } catch (error) {
      console.warn('Error deleting temporary audio file:', error);
    }
  };

  /**
   * Stop current playback
   */
  const stopPlayback = () => {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.seekTo(0);
    }
  };

  /**
   * Toggle play/pause
   */
  const togglePlayback = () => {
    if (!audioStatus?.isLoaded) return;
    
    if (audioStatus.playing) {
      audioPlayer.pause();
    } else {
      audioPlayer.play();
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 10 }}>Text: {text}</Text>
      
      <Button 
        title={isLoading ? "Generating..." : "Generate & Play Speech"} 
        onPress={generateSpeech}
        disabled={isLoading || !text}
      />
      
      {audioStatus?.isLoaded && (
        <View style={{ marginTop: 10 }}>
          <Button
            title={audioStatus.playing ? "Pause" : "Play"}
            onPress={togglePlayback}
          />
          <Button
            title="Stop"
            onPress={stopPlayback}
          />
          <Text style={{ marginTop: 10 }}>
            Status: {audioStatus.playing ? "Playing" : "Paused"}
          </Text>
          {audioStatus.duration > 0 && (
            <Text>
              Progress: {Math.round(audioStatus.currentTime)}s / {Math.round(audioStatus.duration)}s
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default ElevenLabsAudioPlayer;
