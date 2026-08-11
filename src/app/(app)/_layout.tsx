import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as collegeService from "@/services/collegeService";
import { useCollegeStore } from "@/store/collegeStore";

export default function AppLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isJoined, setCollegeStatus } = useCollegeStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    collegeService
      .getCollegeStatus()
      .then((res) => {
        setCollegeStatus(res.collegeStatus);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (checking) return;
    const onGateScreen = segments[segments.length - 1] === "join-college";
    if (!isJoined && !onGateScreen) {
      router.replace("/(app)/join-college");
    }
  }, [checking, isJoined, segments]);

  if (checking) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <ActivityIndicator color="#8478bb" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
