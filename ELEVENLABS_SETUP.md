# ElevenLabs Integration Setup

## Overview
This project now uses ElevenLabs for high-quality text-to-speech synthesis instead of the default system speech.

## Setup Steps

### 1. Get ElevenLabs API Key
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up for an account
3. Navigate to your profile settings
4. Copy your API key

### 2. Configure Environment Variables
Create or update your `.env` file in the project root:

```bash
# ElevenLabs API Configuration
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_actual_api_key_here

# ASR Service Configuration
EXPO_PUBLIC_ASR_SERVICE_URL=http://localhost:8011
```

### 3. Available Voices
ElevenLabs provides many high-quality voices. You can customize the voice by modifying the `voiceId` in the speech service:

```typescript
// Default voice (Rachel - English)
voiceId: '21m00Tcm4TlvDq8ikWAM'

// Other popular voices:
// Adam (English): 'pNInz6obpgDQGcFmaJgB'
// Bella (English): 'EXAVITQu4vr4xnSDxMaL'
// Charlie (English): 'VR6AewLTigWG4xSOukaG'
```

### 4. Voice Settings
You can customize voice characteristics by modifying the `voice_settings` in the speech service:

```typescript
voice_settings: {
  stability: 0.5,        // 0-1: Higher = more stable
  similarity_boost: 0.5, // 0-1: Higher = more similar to original
}
```

## Features

### High-Quality Speech Synthesis
- Natural-sounding voices
- Multiple language support
- Customizable voice characteristics
- Consistent voice across platforms

### Integration Points
- **Text Chat Mode**: Auto-speech for AI responses
- **Voice Chat Mode**: Enhanced voice quality
- **Settings**: Language and voice preferences

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure `EXPO_PUBLIC_ELEVENLABS_API_KEY` is set in your `.env` file
   - Restart your development server after adding the environment variable

2. **Speech Not Working**
   - Check console for API errors
   - Verify your API key is valid
   - Ensure you have sufficient credits in your ElevenLabs account

3. **Voice Quality Issues**
   - Try different voice IDs
   - Adjust voice settings (stability, similarity_boost)
   - Check audio output device settings

### Fallback Behavior
If ElevenLabs is unavailable, the app will log an error but continue to function normally. Users can still read AI responses as text.

## Cost Considerations

ElevenLabs offers:
- **Free Tier**: 10,000 characters per month
- **Paid Plans**: Starting at $5/month for 30,000 characters
- **Pay-as-you-go**: $0.30 per 1,000 characters

Monitor your usage in the ElevenLabs dashboard to avoid unexpected charges.

## API Limits

- **Rate Limiting**: 100 requests per minute on free tier
- **Character Limits**: Varies by plan
- **Voice Selection**: All voices available on all plans

## Support

For ElevenLabs-specific issues:
- [ElevenLabs Documentation](https://docs.elevenlabs.io/)
- [ElevenLabs Discord](https://discord.gg/elevenlabs)
- [ElevenLabs Support](https://elevenlabs.io/support)
