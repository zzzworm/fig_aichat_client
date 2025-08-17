import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const expoConfig: ExpoConfig = {
    ...config,
  name: 'aichatDemo',
  slug: 'aichatDemo',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'aichatDemo',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSAllowsLocalNetworking: true,
      },
      NSPhotoLibraryUsageDescription: 'The app needs access to your photo library so you can select images for processing.',
      NSMicrophoneUsageDescription: 'The app needs access to your microphone so you can perform voice input.',
      NSCameraUsageDescription: 'The app needs access to your camera so you can take photos or videos.',
      NSPhotoLibraryAddUsageDescription: 'The app needs access to your photo library so you can save images.',
      NSSpeechRecognitionUsageDescription: 'The app needs access to your speech recognition feature so you can perform voice input.',
      NSLocalNetworkUsageDescription: 'The app needs access to your local network so you can use LAN features.',
      NSBonjourServices: [
        '_pulse._tcp',
        '_pulse._tcp',
      ],
    },
    bundleIdentifier: 'com.fig.example.aichatrn',
  },
  android: {
    permissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
      'android.permission.ACCESS_WIFI_STATE',
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.READ_MEDIA_VIDEO',
      'android.permission.READ_MEDIA_AUDIO',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.WAKE_LOCK',
      'android.permission.BLUETOOTH',
    ],
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    package: 'com.fig.example.aichatrn',
    usesCleartextTraffic: true,
    networkSecurityConfig: '@xml/network_security_config',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
    extra: {
      ...config.extra,
      env: process.env.ENV ?? 'development',
      apiUrl: process.env.API_URL ?? 'https://fig-aichat-server.onrender.com',
    },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    [
      'expo-secure-store',
      {
        configureAndroidBackup: true,
        faceIDPermission: 'Allow $(PRODUCT_NAME) to access your Face ID biometric data.',
      },
    ],
    'expo-speech-recognition',
    'expo-audio',
    '@livekit/react-native-expo-plugin',
    '@config-plugins/react-native-webrtc',
  ],
  experiments: {
    typedRoutes: true,
      "tsconfigPaths": true
  }
  };
  // console.log('[##] expo config', expoConfig);
  return expoConfig;
};
