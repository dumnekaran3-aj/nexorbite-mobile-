import { useState, useEffect } from "react";
import { View, Text, Image, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { GraduationCap, UserPlus, Check } from "lucide-react-native";
import Button from "@/components/ui/Button";
import * as friendsService from "@/services/friendsService";

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [status, setStatus] = useState<string>("none");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      friendsService.getPublicProfile(userId),
      friendsService.checkFriendshipStatus(userId),
    ])
      .then(([profileRes, statusRes]) => {
        setProfile(profileRes.user);
        setStatus(statusRes.status);
      })
      .catch((err) => console.error("Profile load error:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleAddFriend = async () => {
    setActionLoading(true);
    try {
      await friendsService.sendFriendRequest(userId);
      setStatus("pending");
    } catch (err) {
      console.error("Send request error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <ActivityIndicator color="#8478bb" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center px-6">
        <Text className="text-navy-400 text-center">This profile isn't available.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: profile.username || "Profile" }} />
      <ScrollView className="flex-1 bg-navy-900" contentContainerClassName="items-center px-6 py-10">
        <View className="w-24 h-24 rounded-full bg-navy-700 border-2 border-brand-500 items-center justify-center overflow-hidden">
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} className="w-full h-full" />
          ) : (
            <GraduationCap size={30} color="#a79fd3" />
          )}
        </View>

        <Text className="text-white text-xl font-bold mt-3">{profile.fullName || profile.username}</Text>
        {!!profile.username && <Text className="text-navy-400 text-sm mt-0.5">@{profile.username}</Text>}
        {!!profile.stream && <Text className="text-brand-300 text-xs mt-2">{profile.stream}</Text>}
        {!!profile.bio && <Text className="text-navy-400 text-sm text-center mt-3">{profile.bio}</Text>}

        <View className="w-full mt-8">
          {status === "accepted" ? (
            <View className="flex-row items-center justify-center gap-2 py-3">
              <Check size={16} color="#4ade80" />
              <Text className="text-green-400 font-medium">Already friends</Text>
            </View>
          ) : status === "pending" ? (
            <View className="items-center py-3">
              <Text className="text-navy-400">Friend request pending</Text>
            </View>
          ) : (
            <Button title="Add Friend" onPress={handleAddFriend} loading={actionLoading} />
          )}
        </View>
      </ScrollView>
    </>
  );
}
