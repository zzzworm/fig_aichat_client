import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader
} from '@/components/ui/alert-dialog';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';

import "@/global.css";
import { FontAwesome5 } from '@expo/vector-icons';

import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Image, TouchableOpacity } from "react-native";

export default function IndexScreen() {
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
      <View className="h-full w-full bg-white">
        {/* Header Section */}
        <View className="flex-1 items-center justify-center pt-16 pb-4">
          <Text className="text-4xl font-bold text-blue-600 mb-4 text-center">
            AI Chat Demo
          </Text>
          <Text className="text-lg text-blue-500 text-center font-medium mb-8">
            Connect with AI Characters
          </Text>
        </View>
        
        {/* Logo Section */}
        <View className="items-center justify-center pb-8">
          <View className="bg-blue-50 rounded-full p-6 border border-blue-200">
            <Image
              source={require('@/assets/images/react-logo.png')}
              className="w-24 h-24"
              resizeMode="contain"
              alt="Splash Logo"
            />
          </View>
        </View>


        {/* Action Buttons Section */}
        <View className="mx-6 mb-8 space-y-4 mt-10">
          <TouchableOpacity
            onPress={() => {
              if (!isChecked) {
                setIsPrivacyAlertVisible(true);
                return;
              }
              navigateToScreen('/auth/sign-in');
            }}
            className="w-full rounded-2xl items-center py-4 flex-row justify-center bg-blue-600 mb-4 border border-blue-500"
            activeOpacity={0.8}
          >
            <View className="rounded-full p-2 mr-3">
              <FontAwesome5 name="envelope" size={20} color="#ffffff" />
            </View>
            <Text className="font-bold text-lg text-center text-white">
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
            className="w-full rounded-2xl items-center py-4 flex-row justify-center bg-cyan-500 mb-4 border border-cyan-400"
            activeOpacity={0.8}
          >
            <View className="rounded-full p-2 mr-3">
              <FontAwesome5 name="user-plus" size={20} color="#ffffff" />
            </View>
            <Text className="font-bold text-lg text-center text-white">
              Sign Up
            </Text>
          </TouchableOpacity>
          
          {/* Terms and Privacy Checkbox */}
          <TouchableOpacity
            onPress={() => {
              setIsChecked(!isChecked);
              setIsPrivacyAlertVisible(false);
            }}
            className="w-full items-center p-4 flex-row justify-center bg-gray-50 rounded-2xl border border-gray-200"
            activeOpacity={0.8}
          >
            <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
              isChecked 
                ? 'bg-blue-600 border-blue-600' 
                : 'bg-white border-blue-300'
            }`}>
              {isChecked && (
                <FontAwesome5 name="check" size={12} color="#ffffff" />
              )}
            </View>
            <View className="flex-1 flex-row flex-wrap items-center">
              <Text className="text-sm text-gray-700 font-medium">
                I have read and agree to{' '}
              </Text>
              <TouchableOpacity onPress={() => openLink(Constants.expoConfig?.extra?.terms_url)}>
                <Text className="text-sm text-blue-600 font-semibold underline">Terms of Service</Text>
              </TouchableOpacity>
              <Text className="text-sm text-gray-700 font-medium"> and </Text>
              <TouchableOpacity onPress={() => openLink(Constants.expoConfig?.extra?.privacy_url)}>
                <Text className="text-sm text-blue-600 font-semibold underline">Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* GlueStack Alert Dialog */}
        <AlertDialog isOpen={isPrivacyAlertVisible} onClose={() => setIsPrivacyAlertVisible(false)}>
          <AlertDialogBackdrop />
          <AlertDialogContent className="max-w-sm mx-4 bg-white rounded-xl">
            <AlertDialogHeader className="border-b border-gray-100 pb-3">
              <Text className="font-bold text-gray-900 text-lg">
                Terms & Privacy
              </Text>
            </AlertDialogHeader>
            
            <AlertDialogBody className="py-4">
              <Text className="text-gray-700 text-base mb-3 leading-relaxed">
                Please agree to the terms and privacy policy to continue.
              </Text>
              <View className="flex-row flex-wrap items-center">
                <Text className="text-sm text-gray-700 mr-1">Read our </Text>
                <TouchableOpacity onPress={() => openLink(Constants.expoConfig?.extra?.terms_url)}>
                  <Text className="text-sm text-blue-600 font-semibold underline">
                    Terms of Service
                  </Text>
                </TouchableOpacity>
                <Text className="text-sm text-gray-700 mx-1"> and </Text>
                <TouchableOpacity onPress={() => openLink(Constants.expoConfig?.extra?.privacy_url)}>
                  <Text className="text-sm text-blue-600 font-semibold underline">
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>
            </AlertDialogBody>
            
            <AlertDialogFooter className="border-t border-gray-100 pt-3">
              <HStack space="md" className="w-full justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700"
                  onPress={() => setIsPrivacyAlertVisible(false)}
                >
                  <ButtonText className="text-gray-700">Cancel</ButtonText>
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 px-6"
                  onPress={() => {
                    setIsChecked(true);
                    setIsPrivacyAlertVisible(false);
                  }}
                >
                  <ButtonText className="text-white font-semibold">Agree</ButtonText>
                </Button>
              </HStack>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </View>
  );
}