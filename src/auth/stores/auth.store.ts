import * as SecureStore from 'expo-secure-store';
import { StrapiAuthProvider } from "strapi-sdk-js";
import { create, StateCreator } from "zustand";
import { createJSONStorage, persist, PersistOptions, StateStorage } from "zustand/middleware";
import { setUnauthorizedCallback } from '../../api/client';
import authService from "../services/auth.service";
import { UserProfile } from "../types/user";

// Custom storage implementation for expo-secure-store
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return (await SecureStore.getItemAsync(name)) || null;
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  },
};

type AuthState = {
  onePassAvailable: boolean;
  isLoggedIn: boolean;
  shouldCreateAccount: boolean;
  hasCompletedOnboarding: boolean;
  user: UserProfile | null;
  authenticate: (email: string, password: string) => Promise<UserProfile>;
  authenticateProvider: (provider: StrapiAuthProvider, accessToken: string) => Promise<UserProfile>;
  register: (name: string, email: string, password: string) => Promise<UserProfile>;
  login: (userData: UserProfile) => void;
  logout: () => Promise<void>;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  resetUser: () => void;
  updateUser: (userData: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>;
  initializeAuth: () => Promise<void>;
};

type AuthStore = AuthState;

type MyPersist = (
  config: StateCreator<AuthStore>,
  options: PersistOptions<AuthStore>
) => StateCreator<AuthStore>;

export const useAuthStore = create<AuthStore>(
  (persist as MyPersist)(
    (set, get) => ({
      authenticate: async (email: string, password: string) => {
        try {
          const { jwt, user } = await authService.login(email, password);
          get().login(user);
          return user;
        } catch (error) {
          console.error("Authentication local error:", error);
          throw error;
        }
      },
      authenticateProvider: async (provider: StrapiAuthProvider, accessToken: string) => {
        try {
          const { jwt, user } = await authService.authenticateProvider(provider, accessToken);
          get().login(user);
          return user;
        } catch (error) {
          console.error("Authentication provider error:", error);
          throw error;
        }
      },
      register: async (name: string, email: string, password: string) => {
        try {
          const { jwt, user } = await authService.register(name, email, password);
          get().login(user);
          return user;
        } catch (error) {
          console.error("Registration error:", error);
          throw error;
        }
      },
      onePassAvailable: false,
      isLoggedIn: false,
      shouldCreateAccount: true,
      hasCompletedOnboarding: false,
      user: null,
      login: (userData: UserProfile) => {
        set({
          isLoggedIn: true,
          hasCompletedOnboarding: true,
          shouldCreateAccount: false,
          user: userData,
        });
      },
      logout: async () => {
        try {
          await authService.logout();
          get().resetUser();
        } catch (error) {
          console.error("Logout error:", error);
          throw error;
        }
      },
      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },
      resetOnboarding: () => {
        set({ hasCompletedOnboarding: false });
      },
      updateUser: (userData: Partial<UserProfile>) => {
        set((state: AuthState) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
      resetUser: () => {
        set({
          isLoggedIn: false,
          hasCompletedOnboarding: true,
          shouldCreateAccount: true,
          user: null,
        });
      },
      refreshProfile: async () => {
        try {
        const user = await authService.getCurrentUser();
          if (user) {
            set({ user });
          }
        } catch (error) {
          console.error("Failed to refresh profile:", error);
          throw error;
        }
      },
      initializeAuth: async () => {
        try {
          const user = await authService.getCurrentUser();
          if (user) {
            set({
              isLoggedIn: true,
              hasCompletedOnboarding: true,
              shouldCreateAccount: false,
              user,
            });
          }
        } catch (error) {
          console.error("Failed to initialize auth:", error);
        }
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => storage),
    }
  )
);

// Set the callback for unauthorized errors to log the user out.
setUnauthorizedCallback(() => useAuthStore.getState().resetUser());
