import { useState, useEffect } from "react";
import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { GraduationCap } from "lucide-react-native";
import * as friendsService from "@/services/friendsService";

export default function MyFriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    friendsService
      .getFriends()
      .then((res) => setFriends(res.friends || []))
      .catch((err) => console.error("Friends load error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <View className="flex-1 bg-navy-900 items-center justify-center"><ActivityIndicator color="#8478bb" /></View>;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Friends", headerStyle: { backgroundColor: "#12172a" }, headerTintColor: "#fff" }} />
      <FlatList
        className="flex-1 bg-navy-900"
        data={friends}
        keyExtractor={(item) => item._id}
        contentContainerClassName="px-4 py-3"
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(app)/friends/public-profile/${item._id}` as any)} className="flex-row items-center gap-3 py-3 border-b border-navy-800">
            <View className="w-11 h-11 rounded-full bg-navy-700 border border-navy-600 items-center justify-center overflow-hidden">
              {item.avatar ? <Image source={{ uri: item.avatar }} className="w-full h-full" /> : <GraduationCap size={16} color="#a79fd3" />}
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">{item.fullName || item.username}</Text>
              {!!item.stream && <Text className="text-navy-400 text-xs mt-0.5">{item.stream}</Text>}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text className="text-navy-400 text-center py-16">No friends yet.</Text>}
      />
    </>
  );
}
