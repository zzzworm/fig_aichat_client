import { useAuthStore } from "@/src/auth/stores/auth.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
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
    } catch (_) {
      setError("root", {
        message: "Registration failed. Please check your email and password.",
      });
    }
  });

  return (
    <View className="flex-1 p-6 bg-gray-50 dark:bg-gray-800">
      <View className="items-center justify-start pt-[15%] bg-transparent">
                      <Image
                        source={require('@/assets/images/react-logo.png')}
                        className="w-50 h-50"
                        resizeMode="contain"
                        alt="Splash Logo"
                      />
                    </View>

      {errors.root && (
        <Text className="text-red-500 mb-4 text-center">
          {errors.root.message}
        </Text>
      )}

      <View className="mb-4">
        <Text className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Username
        </Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`border rounded-md p-3 ${
                errors.name
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } text-black dark:text-white`}
              placeholder="username"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.name && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.name.message}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Email
        </Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`border rounded-md p-3 ${
                errors.email
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } text-black dark:text-white`}
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
          <Text className="text-red-500 text-xs mt-1">
            {errors.email.message}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Password
        </Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`border rounded-md p-3 ${
                errors.password
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } text-black dark:text-white`}
              placeholder="******"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.password.message}
          </Text>
        )}
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Confirm Password
        </Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className={`border rounded-md p-3 ${
                errors.confirmPassword
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } text-black dark:text-white`}
              placeholder="******"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.confirmPassword && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.confirmPassword.message}
          </Text>
        )}
      </View>

      <TouchableOpacity
        className="bg-blue-500 rounded-md p-3 items-center dark:bg-blue-700"
        onPress={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-medium">Sign Up</Text>
        )}
      </TouchableOpacity>

      <View className="mt-6 text-center">
        <Link asChild push href={"/auth/sign-in"}>
          <TouchableOpacity>
            <Text className="text-sm font-medium text-blue-500 dark:text-blue-400">
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
