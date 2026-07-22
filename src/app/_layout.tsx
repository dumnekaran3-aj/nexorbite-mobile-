import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "@/store/authStore";

SplashScreen.preventAutoHideAsync();

function useProtectedRoute(isAuthenticated: boolean, isLoading: boolean) {
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; 
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login" as any);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)" as any);
    }
  }, [isAuthenticated, isLoading, segments]);
}

export default function RootLayout() {
  const { hydrate, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    hydrate().then(() => SplashScreen.hideAsync());
  }, []);

  useProtectedRoute(isAuthenticated, isLoading);

  if (isLoading) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}