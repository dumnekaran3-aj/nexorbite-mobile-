import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as collegeService from "@/services/collegeService";
import { useCollegeStore } from "@/store/collegeStore";
import { useAuthStore } from "@/store/authStore";
import { connectSocket, getSocket } from "@/sockets/socketClient";
import { registerSocketListeners } from "@/sockets/socketListeners";
import { useChatStore } from "@/store/chatStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useToastStore } from "@/store/toastStore";
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
      router.replace("/(app)");
    }
  }, [checking, isJoined, segments]);

  useEffect(() => {
    if (!checking && isJoined && user?._id) {
      connectSocket(user._id, collegeId || undefined);
      registerSocketListeners();
      useChatStore.getState().loadChats();
      useNotificationStore.getState().refresh();

      const socket = getSocket();
      const handleNewNotification = (data: any) => {
        useNotificationStore.getState().increment();
        useToastStore.getState().show(data.payload?.message || "You have a new notification");
      };
      socket?.on("new_notification", handleNewNotification);
      return () => { socket?.off("new_notification", handleNewNotification); };
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
