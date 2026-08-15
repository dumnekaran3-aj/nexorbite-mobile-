import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as collegeService from "@/services/collegeService";
import { useCollegeStore } from "@/store/collegeStore";
import { useAuthStore } from "@/store/authStore";
import { connectSocket } from "@/sockets/socketClient";
import { registerSocketListeners } from "@/sockets/socketListeners";
import { useChatStore } from "@/store/chatStore";
import Toast from "@/components/ui/Toast";

export default function AppLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isJoined, collegeId, setCollegeStatus } = useCollegeStore();
  const user = useAuthStore((s) => s.user);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    collegeService
      .getCollegeStatus()
      .then((res) => setCollegeStatus(res.collegeStatus))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (checking) return;
    const onGateScreen = segments[segments.length - 1] === "join-college";

    if (!isJoined && !onGateScreen) {
      router.replace("/(app)/join-college");
    } else if (isJoined && onGateScreen) {
      // Already joined but somehow sitting on the gate screen — send them home.
      router.replace("/(app)");
    }
  }, [checking, isJoined, segments]);

  useEffect(() => {
    if (!checking && isJoined && user?._id) {
      connectSocket(user._id, collegeId || undefined);
      registerSocketListeners();
      useChatStore.getState().loadChats();
    }
  }, [checking, isJoined, user?._id, collegeId]);

  if (checking) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <ActivityIndicator color="#8478bb" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </View>
  );
}
