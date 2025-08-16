import { SafeAreaView } from "@/components/common/SafeAreaView";
import "@/global.css";
import { useAuthStore } from "@/src/auth/stores/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { z } from "zod";

// Schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { authenticate } = useAuthStore();

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = handleSubmit(async (data: LoginFormInputs) => {
    clearErrors("root");
    try {
      await authenticate(data.email, data.password);
      router.replace('/(tabs)/conversation');
    } catch (error) {
      setError("root", {
        message: "Login failed. Please check your email and password.",
      });
    }
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
        {/* Header Section */}
        <View className="items-center justify-center m-8">
        <Text className="text-4xl font-bold text-blue-600 mb-4 text-center">
          Welcome Back
        </Text>
      </View>
      
      {/* Logo Section */}
      <View className="items-center justify-center">
        <View className="bg-blue-50 rounded-full p-6 border border-blue-200">
          <Image
            source={require('@/assets/images/react-logo.png')}
            className="w-24 h-24"
            resizeMode="contain"
            alt="Splash Logo"
          />
        </View>
      </View>

      {/* Form Section */}
      <View className="mx-6 mt-10">

        {errors.root && (
          <Text className="text-red-500 mb-4 text-center">
            {errors.root.message}
          </Text>
        )}

        {/* Email */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2 text-gray-700">
            Email
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`border rounded-2xl p-4 bg-gray-50 ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-200"
                } text-gray-900`}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && (
            <Text className="text-red-500 mt-1 text-sm">
              {errors.email.message}
            </Text>
          )}
        </View>

        {/* Password */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-2 text-gray-700">
            Password
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`border rounded-2xl p-4 bg-gray-50 ${
                  errors.password
                    ? "border-red-500"
                    : "border-gray-200"
                } text-gray-900`}
                placeholder="Enter your password"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.password && (
            <Text className="text-red-500 mt-1 text-sm">
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          className="bg-blue-600 rounded-2xl p-4 items-center mb-4 border border-blue-500"
          onPress={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Link to Sign Up */}
        <View className="items-center py-4">
          <Link asChild push href={"/auth/sign-up"}>
            <TouchableOpacity>
                              <Text className="text-sm font-medium text-gray-700">
                  Don&apos;t have an account?{' '}
                  <Text className="text-blue-600 font-semibold underline">
                    Sign up
                  </Text>
                </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
