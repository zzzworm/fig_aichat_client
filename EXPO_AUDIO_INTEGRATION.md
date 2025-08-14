# Expo Audio Integration for ElevenLabs TTS

## Overview

This document explains how to integrate `expo-audio` with ElevenLabs text-to-speech functionality in React Native applications.

## Implementation Approaches

### 1. Service-Based Approach (Current Implementation)

The current `ElevenLabsSpeechService` uses a service class with `createAudioPlayer` from expo-audio. This approach is suitable for simple use cases but has limitations in status monitoring.

**Features:**
- ✅ Simple to use from any component
- ✅ Handles file management automatically
- ✅ Works with singleton pattern
- ❌ Limited status monitoring capabilities
- ❌ Cannot use React hooks for better integration

**Usage:**
```typescript
import elevenLabsSpeech from '@/src/utils/elevenlabs-speech';

// Simple usage
await elevenLabsSpeech.speak("Hello world");
```

### 2. Hook-Based Approach (Recommended)

For better React integration and status monitoring, use the hook-based approach with `useAudioPlayer` and `useAudioPlayerStatus`.

**Features:**
- ✅ Full React hooks integration
- ✅ Real-time status monitoring
- ✅ Better lifecycle management
- ✅ Precise playback control
- ✅ Automatic cleanup
- ❌ Requires React component context
- ❌ More complex setup

**Usage:**
```typescript
import { ElevenLabsAudioPlayer } from '@/src/utils/elevenlabs-speech-hook-example';

<ElevenLabsAudioPlayer
  text="Hello world"
  apiKey="your-api-key"
  onPlayStart={() => console.log('Started')}
  onPlayEnd={() => console.log('Finished')}
  onError={(error) => console.error(error)}
/>
```

## Key Implementation Details

### File Management

Both approaches use `expo-file-system` to handle temporary audio files:

```typescript
import * as FileSystem from 'expo-file-system';

// Save audio to temporary file
const tempFileName = `elevenlabs_${Date.now()}.mp3`;
const tempFileUri = `${FileSystem.cacheDirectory}${tempFileName}`;

await FileSystem.writeAsStringAsync(tempFileUri, base64Audio, {
  encoding: FileSystem.EncodingType.Base64,
});
```

### Audio Player Creation

```typescript
import { createAudioPlayer, useAudioPlayer } from 'expo-audio';

// Service approach
const player = createAudioPlayer(audioUri);

// Hook approach (in React component)
const player = useAudioPlayer(audioUri);
```

### Status Monitoring

**Service Approach (Limited):**
```typescript
// Simplified polling approach
const checkStatus = () => {
  // Limited status information available
  // Fallback to timers
};
```

**Hook Approach (Full Featured):**
```typescript
const audioStatus = useAudioPlayerStatus(audioPlayer);

useEffect(() => {
  if (audioStatus?.isLoaded) {
    console.log('Status:', {
      playing: audioStatus.playing,
      currentTime: audioStatus.currentTime,
      duration: audioStatus.duration,
      isBuffering: audioStatus.isBuffering
    });
  }
}, [audioStatus]);
```

## Audio Completion Detection

### Hook Approach (Accurate)
```typescript
useEffect(() => {
  const isComplete = audioStatus?.isLoaded && 
    !audioStatus?.playing && 
    !audioStatus?.isBuffering &&
    audioStatus?.currentTime > 0 &&
    audioStatus?.duration > 0 &&
    Math.abs(audioStatus.currentTime - audioStatus.duration) < 0.1;
    
  if (isComplete) {
    onPlayEnd?.();
  }
}, [audioStatus]);
```

### Service Approach (Fallback)
```typescript
// Use fallback timer since we can't reliably detect completion
setTimeout(() => {
  this.handleAudioCompletion(tempFileUri);
}, estimatedDuration);
```

## Configuration

### Required Dependencies

```json
{
  "expo-audio": "~0.4.8",
  "expo-file-system": "~17.0.1"
}
```

### Installation

```bash
npx expo install expo-audio expo-file-system
```

### Permissions (iOS)

Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-audio",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
        }
      ]
    ]
  }
}
```

## Best Practices

### 1. Use Hooks in React Components

For React components, always prefer the hook-based approach:

```typescript
const MyComponent = () => {
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const audioPlayer = useAudioPlayer(audioUri);
  const audioStatus = useAudioPlayerStatus(audioPlayer);
  
  // Your component logic here
};
```

### 2. Clean Up Temporary Files

Always clean up temporary audio files:

```typescript
const cleanupAudioFile = async (fileUri: string) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri);
    }
  } catch (error) {
    console.warn('Error deleting temporary file:', error);
  }
};
```

### 3. Handle Errors Gracefully

```typescript
try {
  await generateAndPlaySpeech();
} catch (error) {
  console.error('TTS Error:', error);
  // Fallback to text display or system TTS
}
```

### 4. Optimize for Performance

- Cache frequently used audio files
- Use appropriate audio quality settings
- Clean up players when components unmount

## Migration Guide

### From Service to Hook Approach

1. **Replace service calls** with hook-based components
2. **Update state management** to use React state
3. **Add proper cleanup** in useEffect
4. **Handle loading states** with React state

**Before:**
```typescript
elevenLabsSpeech.speak(text);
```

**After:**
```typescript
<ElevenLabsAudioPlayer 
  text={text} 
  apiKey={apiKey}
  onPlayStart={() => setIsPlaying(true)}
  onPlayEnd={() => setIsPlaying(false)}
/>
```

## Troubleshooting

### Common Issues

1. **Audio not playing**
   - Check file permissions
   - Verify audio file format (MP3 recommended)
   - Ensure proper base64 encoding

2. **Memory leaks**
   - Always call `player.release()` when done
   - Clean up temporary files
   - Remove event listeners

3. **Status not updating**
   - Use `useAudioPlayerStatus` hook in React components
   - Avoid mixing service and hook approaches

### Debug Tips

```typescript
// Log audio status changes
useEffect(() => {
  console.log('Audio Status:', audioStatus);
}, [audioStatus]);

// Check file existence
const fileInfo = await FileSystem.getInfoAsync(audioUri);
console.log('File exists:', fileInfo.exists);
```

## References

- [Expo Audio Documentation](https://docs.expo.dev/versions/latest/sdk/audio/)
- [ElevenLabs API Documentation](https://elevenlabs.io/docs)
- [Expo File System Documentation](https://docs.expo.dev/versions/latest/sdk/filesystem/)
