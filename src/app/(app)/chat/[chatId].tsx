import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Send } from "lucide-react-native";
import * as chatService from "@/services/chatService";
import { connectSocket, getSocket } from "@/sockets/socketClient";
import { useAuthStore } from "@/store/authStore";

export default function ChatConversationScreen() {
  const { chatId, friendName } = useLocalSearchParams<{ chatId: string; friendName?: string }>();
  const myId = useAuthStore((s) => s.user?._id || s.user?.id);

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async () => {
    try {
      const data = await chatService.getChatMessages(chatId, 1, 50);
      setMessages(data.messages || []);
      chatService.markChatSeen(chatId).catch(() => {});
    } catch (err) {
      console.error("Load messages error:", err);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    loadMessages();

    const socket = getSocket() || connectSocket(myId || "");
    socket.emit("join_room", { roomType: "chat", roomId: chatId });

    const handleIncoming = (message: any) => {
      if (message.chatId === chatId) {
        setMessages((prev) => [message, ...prev]);
      }
    };
    socket.on("receive_message", handleIncoming);

    return () => {
      socket.off("receive_message", handleIncoming);
    };
  }, [chatId]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    try {
      const data = await chatService.sendMessage(chatId, trimmed);
      setMessages((prev) => [data.message, ...prev]);
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: friendName || "Chat",
          headerStyle: { backgroundColor: "#12172a" },
          headerTintColor: "#fff",
        }}
      />
      <KeyboardAvoidingView
        className="flex-1 bg-navy-900"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#8478bb" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item._id}
            inverted
            contentContainerClassName="px-4 py-3"
            renderItem={({ item }) => {
              const isMe = item.sender?._id === myId;
              return (
                <View className={isMe ? "items-end mb-2" : "items-start mb-2"}>
                  <View
                    className={
                      isMe
                        ? "bg-brand-500 rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[80%]"
                        : "bg-navy-800 border border-navy-600 rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[80%]"
                    }
                  >
                    <Text className="text-white text-[15px]">{item.text}</Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View className="items-center py-16">
                <Text className="text-navy-400">Say hi to start the conversation 👋</Text>
              </View>
            }
          />
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
          <Pressable
            onPress={handleSend}
            disabled={!text.trim() || sending}
            className="w-10 h-10 rounded-full bg-brand-500 items-center justify-center"
          >
            <Send size={16} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}
