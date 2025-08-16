import { SafeAreaView } from "@/components/common/SafeAreaView";
import { useAuthStore } from "@/src/auth/stores/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";

// Zod schema for sign up validation
const signUpSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormInputs = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const { register: createAccount } = useAuthStore();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormInputs>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = handleSubmit(async (data: SignUpFormInputs) => {
    clearErrors("root");
    try {
      // Update auth store
      await createAccount(data.name, data.email, data.password);
      // Show toast
      router.replace("/(tabs)/conversation")
    } catch (error) {
      setError("root", {
        message: "Registration failed. Please check your email and password.",
      });
    }
  });

  return (
      <SafeAreaView className="flex-1 bg-white">
        {/* Header Section */}
        <View className="items-center justify-center m-8">
        <Text className="text-4xl font-bold text-blue-600 mb-4 text-center">
        Join us today
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

      {/* Form Section */}
      <View className="mx-6 mt-10">
        {errors.root && (
          <Text className="text-red-500 mb-4 text-center">
            {errors.root.message}
          </Text>
        )}

        {/* Username */}
        <View className="mb-4">
          <Text className="text-sm font-semibold mb-2 text-gray-700">
            Username
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`border rounded-2xl p-4 bg-gray-50 ${
                  errors.name
                    ? "border-red-500"
                    : "border-gray-200"
                } text-gray-900`}
                placeholder="Enter your username"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.name && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.name.message}
            </Text>
          )}
        </View>

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
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.email.message}
            </Text>
          )}
        </View>

        {/* Password */}
        <View className="mb-4">
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
            <Text className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </Text>
          )}
        </View>

        {/* Confirm Password */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-2 text-gray-700">
            Confirm Password
          </Text>
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className={`border rounded-2xl p-4 bg-gray-50 ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : "border-gray-200"
                } text-gray-900`}
                placeholder="Confirm your password"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.confirmPassword && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </Text>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity
          className="bg-cyan-500 rounded-2xl p-4 items-center mb-4 border border-cyan-400"
          onPress={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Link to Sign In */}
        <View className="items-center py-4 ">
          <Link asChild push href={"/auth/sign-in"}>
            <TouchableOpacity>
              <Text className="text-sm font-medium text-gray-700">
                Already have an account?{' '}
                <Text className="text-blue-600 font-semibold underline">
                  Sign in
                </Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
