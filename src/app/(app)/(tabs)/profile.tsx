import { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { LogOut, GraduationCap, Pencil, ChevronRight, Users } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { useCollegeStore } from "@/store/collegeStore";
import * as profileService from "@/services/profileService";


export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const storeUser = useAuthStore((s) => s.user);
  const collegeName = useCollegeStore((s) => s.collegeName);

  const [profile, setProfile] = useState<any>(storeUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileService
      .getMyProfile()
      .then((data) => setProfile(data.profile))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  if (loading && !profile) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <ActivityIndicator color="#8478bb" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-navy-900" contentContainerClassName="pb-10">
      <View className="px-4 pt-14 pb-3">
        <Text className="text-white text-xl font-bold tracking-tight">Profile</Text>
      </View>

      <View className="items-center px-6 mt-2">
        <View className="w-24 h-24 rounded-full bg-navy-700 border-2 border-brand-500 items-center justify-center overflow-hidden">
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} className="w-full h-full" />
          ) : (
            <GraduationCap size={30} color="#a79fd3" />
          )}
        </View>

        <Text className="text-white text-xl font-bold mt-3">{profile?.full_name || profile?.username || "You"}</Text>
        {!!profile?.username && <Text className="text-navy-400 text-sm mt-0.5">@{profile.username}</Text>}
        {!!collegeName && <Text className="text-brand-300 text-xs mt-2">{collegeName}</Text>}

        {!!profile?.bio && (
          <Text className="text-navy-400 text-sm text-center mt-3 px-4">{profile.bio}</Text>
        )}
      </View>

      <View className="px-4 mt-8 gap-2">
     <Pressable
  onPress={() => router.push("/(app)/communities")}
  className="flex-row items-center justify-between bg-navy-800 border border-navy-600 rounded-2xl px-4 py-3.5 mb-2"
>
  <View className="flex-row items-center gap-3">
    <Users size={16} color="#8478bb" />
    <Text className="text-white text-sm font-medium">Communities</Text>
  </View>
  <ChevronRight size={16} color="#4d5569" />
</Pressable>

        <Pressable
          onPress={handleLogout}
          className="flex-row items-center justify-between bg-navy-800 border border-red-900/40 rounded-2xl px-4 py-3.5"
        >
          <View className="flex-row items-center gap-3">
            <LogOut size={16} color="#f87171" />
            <Text className="text-red-400 text-sm font-medium">Log Out</Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}
