# AI Chat Demo

## setup
This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Environment settings
modify .env or .env.dev as your need

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Architectural Decisions

This project is built on **Expo React Native** framework, based on the [react-native-tailwind-gluestack-starter](https://github.com/eriker75/react-native-tailwind-gluestack-starter) template for rapid development and consistent UI components.

### Frontend Architecture

- **Framework**: Expo React Native with TypeScript
- **UI Components**: Gluestack UI + Tailwind CSS for consistent design system
- **Authentication**: Email-based login system with landing page
- **Routing**: Advanced file-based routing using Expo Router for better page and route management

### Backend Integration

- **Backend Service**: Strapi CMS for content management and API
- **SDK Integration**: Strapi SDK for seamless backend communication
- **Data Models**: AI Character and Conversation management

### AI Chat Implementation

The project supports **two AI conversation modes**:

1. **Text Chat Mode**
   - Traditional text-based conversation interface
   - Voice input toggle for hands-free interaction
   - Text-to-speech auto-reading capability
   - Seamless mode switching

2. **Voice Chat Mode**
   - Direct voice interaction using ElevenLabs Conversation AI Agent
   - Real-time speech-to-text and text-to-speech
   - Bypasses server for direct AI communication
   - Optimized for voice-first user experience

### Technical Features

- **Cross-platform**: iOS, Android, and Web support
- **Responsive Design**: Tailwind CSS for adaptive layouts
- **Type Safety**: Full TypeScript implementation
- **State Management**: React hooks and context for state handling
- **Routing**: Expo Router for advanced page and route management



