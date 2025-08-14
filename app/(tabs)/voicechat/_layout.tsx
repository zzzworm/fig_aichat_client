import { Stack } from 'expo-router';
import React from 'react';

export default function ConversationLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: 'Voice Chat'}} />
    </Stack>
  );
}
