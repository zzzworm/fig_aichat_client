import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { InfoIcon } from '@/components/ui/icon';
import { Link } from '@/components/ui/link';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { VStack } from '@/components/ui/vstack';

import "@/global.css";
import { useAuthStore } from '@/src/auth/stores/auth.store';
import { FontAwesome5 } from '@expo/vector-icons';

import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Image, TouchableOpacity } from "react-native";

export default function IndexScreen() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isPrivacyAlertVisible, setIsPrivacyAlertVisible] = useState(false);

  const router = useRouter();
  const navigateToScreen = (screenName: '/onboarding' | '/auth/sign-in' | '/auth/sign-up') => {
    setIsPrivacyAlertVisible(false);
    router.push(screenName);
  };

  const openLink = async (url: string) => {
    const result = await WebBrowser.openBrowserAsync(url);
    if (result.type === 'cancel') {
      console.log('Browser closed');
    }
  };

  return (

      <View className="h-full w-full safe-area">
        <View className="flex-1 items-center justify-start pt-[15%]">
          <Text className="text-2xl font-bold text-dark mt-2">
            AI Chat Demo
          </Text>
        </View>
        <View className="items-center justify-start bg-transparent">
                <Image
                  source={require('@/assets/images/react-logo.png')}
                  className="w-50 h-50"
                  resizeMode="contain"
                  alt="Splash Logo"
                />
              </View>
        <View className='m-4 justify-center rounded-lg p-4 items-center shadow-lg'>
          {isPrivacyAlertVisible && (
            <Alert
              action="warning"
              className="gap-4 max-w-[516px] w-full flex-row flex py-4 items-start self-center"
            >
              <AlertIcon as={InfoIcon} className="mt-1" />
              <HStack className="justify-between flex-1 items-center gap-1 sm:gap-8">
                <VStack className="flex-1">
                  <Text className="font-semibold text-typography-900">
                    Please agree to the terms and privacy policy
                  </Text>
                  <AlertText className="text-typography-900" size="sm">
                    <Text>Click &quot;OK&quot; to agree to the terms and privacy policy</Text>
                    <Text
                      className="text-sm text-blue-700"
                      onPress={() => openLink(Constants.expoConfig?.extra?.terms_url)}
                    >
                      Terms of Service
                    </Text>{' '}
                    and{' '}
                    <Text
                      className="text-sm text-blue-700"
                      onPress={() => openLink(Constants.expoConfig?.extra?.privacy_url)}
                    >
                      Privacy Policy
                    </Text>
                  </AlertText>
                </VStack>
                <Button size="xs" onPress={() => {
                  setIsChecked(true);
                  setIsPrivacyAlertVisible(false);
                  setError(null); 
                }}>
                  <ButtonText>OK</ButtonText>
                </Button>
              </HStack>
            </Alert>
          )}
        </View>

        <View className="m-4 justify-center rounded-lg p-4 items-center">
          <TouchableOpacity
            onPress={() => {
              if (!isChecked) {
                setIsPrivacyAlertVisible(true);
                return;
              }
              navigateToScreen('/auth/sign-in');
            }}
            className="w-full rounded-md items-center py-3 flex-row justify-center bg-blue-500 mb-4  shadow-md"
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="envelope" size={24} color="#000000" />
            <Text className="font-semibold text-base ml-4 text-center text-black">
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!isChecked) {
                setIsPrivacyAlertVisible(true);
                return;
              }
              navigateToScreen('/auth/sign-up');
            }}
            className="w-full rounded-md items-center py-3 flex-row justify-center bg-blue-500 mb-4  shadow-md"
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="user-plus" size={24} color="#000000" />
            <Text className="font-semibold text-base ml-4 text-center text-black">
              Sign Up
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => {
              setIsChecked(!isChecked);
              setIsPrivacyAlertVisible(false);
              setError(null); // Clear any previous error when toggling the checkbox
            }}
            className="w-full items-center py-3 flex-row justify-center"
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <View className="w-5 h-5 rounded-full border-2 border-white mr-2 items-center justify-center">
              {isChecked && (
                <FontAwesome5 name="check" size={12} color="#ffffff" />
              )}
            </View>
            <Text className="text-sm text-black">
              I have read and agree to{' '}
            </Text>
            <Link onPress={() => openLink(Constants.expoConfig?.extra?.terms_url)}>
              <Text>Terms of Service</Text>
            </Link>
            <Text className="text-sm text-black"> and </Text>
            <Link onPress={() => openLink(Constants.expoConfig?.extra?.privacy_url)}>
              <Text>Privacy Policy</Text>
            </Link>
          </TouchableOpacity>
        </View>
      </View>
  );
}