import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Image, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { GraduationCap, MessageCircleOff } from "lucide-react-native";
import * as chatService from "@/services/chatService";

function Avatar({ uri }: { uri?: string }) {
  return (
    <View className="w-12 h-12 rounded-full bg-navy-700 border border-navy-600 items-center justify-center overflow-hidden">
      {uri ? <Image source={{ uri }} className="w-full h-full" /> : <GraduationCap size={18} color="#a79fd3" />}
    </View>
  );
}

export default function ChatListScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadChats = useCallback(async () => {
    try {
      const data = await chatService.getMyChats();
      setChats(data.chats || []);
    } catch (err) {
      console.error("Chat list error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [loadChats])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <ActivityIndicator color="#8478bb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy-900">
      <View className="px-4 pt-14 pb-3 border-b border-navy-700">
        <Text className="text-white text-xl font-bold tracking-tight">Chat</Text>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8478bb" />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(app)/chat/[chatId]",
                params: { chatId: item._id, friendName: item.friend?.fullName || item.friend?.username || "Chat" },
              })
            }
            className="flex-row items-center gap-3 px-4 py-3.5 border-b border-navy-800"
          >
            <Avatar uri={item.friend?.avatar} />
            <View className="flex-1 min-w-0">
              <View className="flex-row items-center justify-between">
                <Text className="text-white font-semibold" numberOfLines={1}>
                  {item.friend?.fullName || item.friend?.username || "Unknown"}
                </Text>
                {item.unreadCount > 0 && (
                  <View className="bg-brand-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 ml-2">
                    <Text className="text-white text-[10px] font-bold">{item.unreadCount}</Text>
                  </View>
                )}
              </View>
              <Text className="text-navy-400 text-sm mt-0.5" numberOfLines={1}>
                {item.lastMessage || "Say hi 👋"}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center py-20 px-6">
            <MessageCircleOff size={28} color="#4d5569" />
            <Text className="text-navy-400 text-center mt-3">
              No conversations yet.{"\n"}Accept a friend request to start chatting.
            </Text>
          </View>
        }
      />
    </View>
  );
}
