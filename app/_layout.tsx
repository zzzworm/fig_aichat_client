import "@/global.css";
import { useAuthStore } from "@/src/auth/stores/auth.store";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import "react-native-reanimated";
import { ElevenLabsProvider } from "@elevenlabs/react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf")
  });
  const { isLoggedIn, hasCompletedOnboarding } = useAuthStore();
    // console.log("isLoggedIn", isLoggedIn);
    // console.log("hasCompletedOnboarding", hasCompletedOnboarding);
  if (!loaded) {
    return null;
  }

  return (
    <ElevenLabsProvider>
    <GluestackUIProvider mode="light">
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName= {!hasCompletedOnboarding ? "onboarding" : isLoggedIn ? "(tabs)" : "auth/index"}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Protected guard={isLoggedIn && hasCompletedOnboarding}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false , title: 'Home'}} />
        <Stack.Screen name="profile/setting" options={{ headerShown: true, title: 'Setting'}} />
        </Stack.Protected>
        <Stack.Screen name="auth/index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
        <Stack.Protected guard={!hasCompletedOnboarding}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
      </GluestackUIProvider>
      </ElevenLabsProvider>
  );
}
