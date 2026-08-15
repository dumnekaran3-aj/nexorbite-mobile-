import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Send, Info } from "lucide-react-native";
import * as groupsService from "@/services/groupsService";
import { getSocket, connectSocket } from "@/sockets/socketClient";
import { useAuthStore } from "@/store/authStore";

export default function GroupChatScreen() {
  const { groupId, groupName } = useLocalSearchParams<{ groupId: string; groupName?: string }>();
  const router = useRouter();
  const myId = useAuthStore((s) => s.user?._id || s.user?.id);

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [permissionError, setPermissionError] = useState("");

  const loadMessages = useCallback(async () => {
    try {
      const data = await groupsService.getGroupMessages(groupId, 1, 50);
      setMessages(data.messages || []);
      groupsService.markGroupMessagesSeen(groupId).catch(() => {});
    } catch (err) {
      console.error("Load group messages error:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadMessages();
    const socket = getSocket() || connectSocket(myId || "");
    socket.emit("join_room", { roomType: "group", roomId: groupId });

    const handleIncoming = (message: any) => {
      if (message.groupId === groupId) setMessages((prev) => [message, ...prev]);
    };
    socket.on("receive_group_message", handleIncoming);
    return () => {
      socket.off("receive_group_message", handleIncoming);
    };
  }, [groupId]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setPermissionError("");
    setText("");
    try {
      const data = await groupsService.sendGroupMessage(groupId, trimmed);
      setMessages((prev) => [data.message, ...prev]);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setPermissionError("Only group admins can send messages right now.");
      }
      console.error("Send group message error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: groupName || "Group",
          headerStyle: { backgroundColor: "#12172a" },
          headerTintColor: "#fff",
          headerRight: () => (
            <Pressable onPress={() => router.push({ pathname: "/(app)/groups/[groupId]/info", params: { groupId } })} className="mr-1">
              <Info size={20} color="#fff" />
            </Pressable>
          ),
        }}
      />
      <KeyboardAvoidingView className="flex-1 bg-navy-900" behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        {loading ? (
          <View className="flex-1 items-center justify-center"><ActivityIndicator color="#8478bb" /></View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item._id}
            inverted
            contentContainerClassName="px-4 py-3"
            renderItem={({ item }) => {
              const isMe = item.sender?._id === myId;
              return (
                <View className={isMe ? "items-end mb-2" : "items-start mb-2"}>
                  {!isMe && <Text className="text-navy-400 text-[11px] mb-0.5 ml-1">{item.sender?.username}</Text>}
                  <View className={isMe ? "bg-brand-500 rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[80%]" : "bg-navy-800 border border-navy-600 rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[80%]"}>
                    <Text className="text-white text-[15px]">{item.text}</Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={<View className="items-center py-16"><Text className="text-navy-400">No messages yet. Say hi 👋</Text></View>}
          />
        )}

        {!!permissionError && (
          <Text className="text-yellow-400 text-xs text-center px-4 pb-1">{permissionError}</Text>
        )}

        <View className="flex-row items-center gap-2 px-3 py-2.5 border-t border-navy-700 bg-navy-900">
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            placeholderTextColor="#4d5569"
            className="flex-1 bg-navy-800 border border-navy-600 rounded-full px-4 py-2.5 text-white"
            multiline
          />
          <Pressable onPress={handleSend} disabled={!text.trim() || sending} className="w-10 h-10 rounded-full bg-brand-500 items-center justify-center">
            <Send size={16} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
