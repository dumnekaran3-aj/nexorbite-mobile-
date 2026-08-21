import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert, Linking, Modal } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Send, Info, Paperclip, FileText, Play, Download, MoreVertical, BellOff, Star, X, CornerUpLeft, Smile, Search, Check, Trash2 } from "lucide-react-native";
import * as groupsService from "@/services/groupsService";
import { getSocket, connectSocket } from "@/sockets/socketClient";
import { useAuthStore } from "@/store/authStore";

const QUICK_EMOJIS = ["❤️", "😂", "👍", "😮", "😢", "🔥"];

export default function GroupChatScreen() {
  const { groupId, groupName } = useLocalSearchParams<{ groupId: string; groupName?: string }>();
  const router = useRouter();
  const myId = useAuthStore((s) => s.user?._id || s.user?.id);

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [stickers, setStickers] = useState<any[]>([]);
  const [showStickers, setShowStickers] = useState(false);

  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
    groupsService.getGroupById(groupId).then((res) => {
      setIsMuted(!!res.isMuted);
      setIsFavorite(!!res.isFavorite);
    }).catch(() => {});
    groupsService.getStickerPack().then((res) => setStickers(res.stickers || [])).catch(() => {});

    const socket = getSocket() || connectSocket(myId || "");
    socket.emit("join_room", { roomType: "group", roomId: groupId });

    const handleIncoming = (message: any) => {
      if (message.groupId === groupId) setMessages((prev) => [message, ...prev]);
    };
    const handleReaction = ({ messageId, userId, emoji }: any) => {
      setMessages((prev) => prev.map((m) => {
        if (m._id !== messageId) return m;
        const reactions = (m.reactions || []).filter((r: any) => r.userId !== userId);
        reactions.push({ userId, emoji });
        return { ...m, reactions };
      }));
    };
    const handleReactionRemoved = ({ messageId, userId }: any) => {
      setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, reactions: (m.reactions || []).filter((r: any) => r.userId !== userId) } : m));
    };
    const handleBulkDeleted = ({ messageIds }: any) => {
      setMessages((prev) => prev.filter((m) => !messageIds.includes(m._id)));
    };

    socket.on("receive_group_message", handleIncoming);
    socket.on("group_message_reaction", handleReaction);
    socket.on("group_message_reaction_removed", handleReactionRemoved);
    socket.on("group_bulk_messages_deleted", handleBulkDeleted);
    return () => {
      socket.off("receive_group_message", handleIncoming);
      socket.off("group_message_reaction", handleReaction);
      socket.off("group_message_reaction_removed", handleReactionRemoved);
      socket.off("group_bulk_messages_deleted", handleBulkDeleted);
    };
  }, [groupId]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setPermissionError("");
    setText("");
    const replyId = replyingTo?._id;
    setReplyingTo(null);
    try {
      const data = await groupsService.sendGroupMessage(groupId, trimmed, replyId);
      setMessages((prev) => [data.message, ...prev]);
    } catch (err: any) {
      if (err.response?.status === 403) setPermissionError("Only group admins can send messages right now.");
      console.error("Send group message error:", err);
    } finally {
      setSending(false);
    }
  };

  const sendMedia = async (uri: string, mimeType: string, name: string) => {
    setSending(true);
    setPermissionError("");
    try {
      const data = await groupsService.sendGroupMediaMessage(groupId, uri, mimeType, name);
      setMessages((prev) => [data.message, ...prev]);
    } catch (err: any) {
      if (err.response?.status === 403) setPermissionError("Only group admins can send messages right now.");
      console.error("Send media error:", err);
    } finally {
      setSending(false);
    }
  };

  const pickPhotoVideo = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.8 });
    if (!result.canceled) {
      const asset = result.assets[0];
      const mime = asset.type === "video" ? "video/mp4" : "image/jpeg";
      sendMedia(asset.uri, mime, asset.fileName || `media_${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`);
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    sendMedia(asset.uri, asset.mimeType || "application/octet-stream", asset.name);
  };

  const handleAttach = () => {
    Alert.alert("Attach", "Choose what to send", [
      { text: "Photo / Video", onPress: pickPhotoVideo },
      { text: "File", onPress: pickFile },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSendSticker = async (stickerId: string) => {
    setShowStickers(false);
    try {
      const data = await groupsService.sendSticker(groupId, stickerId);
      setMessages((prev) => [data.message, ...prev]);
    } catch (err) {
      console.error("Send sticker error:", err);
    }
  };

  const toggleMute = async () => {
    const next = !isMuted;
    setIsMuted(next);
    try { await groupsService.toggleMuteGroup(groupId, next); } catch (err) { setIsMuted(!next); console.error(err); }
  };
  const toggleFavorite = async () => {
    const next = !isFavorite;
    setIsFavorite(next);
    try { await groupsService.toggleFavoriteGroup(groupId, next); } catch (err) { setIsFavorite(!next); console.error(err); }
  };
  const handleMenu = () => {
    Alert.alert("Group options", undefined, [
      { text: isMuted ? "Unmute notifications" : "Mute notifications", onPress: toggleMute },
      { text: isFavorite ? "Remove from favorites" : "Add to favorites", onPress: toggleFavorite },
      { text: "Select messages", onPress: () => setSelectMode(true) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleReactLocal = async (messageId: string, emoji: string) => {
    setMessages((prev) => prev.map((m) => {
      if (m._id !== messageId) return m;
      const reactions = (m.reactions || []).filter((r: any) => r.userId !== myId);
      reactions.push({ userId: myId, emoji });
      return { ...m, reactions };
    }));
    try { await groupsService.reactToMessage(groupId, messageId, emoji); } catch (err) { console.error("React error:", err); }
  };

  const handleLongPress = (message: any) => {
    if (selectMode) return;
    const buttons: any[] = [
      ...QUICK_EMOJIS.map((emoji) => ({ text: emoji, onPress: () => handleReactLocal(message._id, emoji) })),
      { text: "Reply", onPress: () => setReplyingTo(message) },
      { text: "Select", onPress: () => { setSelectMode(true); setSelectedIds(new Set([message._id])); } },
      { text: "Cancel", style: "cancel" },
    ];
    Alert.alert("Message", undefined, buttons);
  };

  const toggleSelect = (messageId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) next.delete(messageId);
      else next.add(messageId);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = (scope: "me" | "all") => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    Alert.alert(
      scope === "all" ? "Delete for everyone?" : "Delete for me?",
      `${ids.length} message(s) will be deleted${scope === "all" ? " for everyone in the group" : " from your view"}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (scope === "all") await groupsService.bulkDeleteForAll(groupId, ids);
              else await groupsService.bulkDeleteForMe(groupId, ids);
              setMessages((prev) => prev.filter((m) => !ids.includes(m._id)));
            } catch (err) {
              console.error("Bulk delete error:", err);
            } finally {
              exitSelectMode();
            }
          },
        },
      ]
    );
  };

  const runSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await groupsService.searchGroupMessages(groupId, searchQuery.trim());
      setSearchResults(res.results || res.messages || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const renderReactions = (message: any) => {
    const reactions = message.reactions || [];
    if (reactions.length === 0) return null;
    const counts: Record<string, number> = {};
    reactions.forEach((r: any) => { counts[r.emoji] = (counts[r.emoji] || 0) + 1; });
    return (
      <View className="flex-row flex-wrap gap-1 mt-1">
        {Object.entries(counts).map(([emoji, count]) => (
          <View key={emoji} className="flex-row items-center gap-0.5 bg-navy-800 border border-navy-600 rounded-full px-1.5 py-0.5">
            <Text className="text-[11px]">{emoji}</Text>
            {count > 1 && <Text className="text-[10px] text-navy-400">{count}</Text>}
          </View>
        ))}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: selectMode ? `${selectedIds.size} selected` : (groupName || "Group"),
          headerStyle: { backgroundColor: "#12172a" },
          headerTintColor: "#fff",
          headerLeft: selectMode ? () => (
            <Pressable onPress={exitSelectMode} hitSlop={10} className="p-2">
              <X size={20} color="#fff" />
            </Pressable>
          ) : undefined,
          headerRight: () => selectMode ? (
            <View className="flex-row items-center gap-1 mr-1">
              <Pressable onPress={() => handleBulkDelete("me")} hitSlop={10} className="p-2">
                <Trash2 size={18} color="#f87171" />
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center gap-1 mr-1">
              {isFavorite && <Star size={16} color="#facc15" fill="#facc15" />}
              {isMuted && <BellOff size={16} color="#4d5569" />}
              <Pressable onPress={() => setSearchMode(true)} hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }} className="p-2">
                <Search size={19} color="#fff" />
              </Pressable>
              <Pressable onPress={() => router.push({ pathname: "/(app)/groups/[groupId]/info", params: { groupId } })} hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }} className="p-2">
                <Info size={20} color="#fff" />
              </Pressable>
              <Pressable onPress={handleMenu} hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }} className="p-2">
                <MoreVertical size={20} color="#fff" />
              </Pressable>
            </View>
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
              const selected = selectedIds.has(item._id);
              return (
                <Pressable
                  onPress={() => selectMode && toggleSelect(item._id)}
                  onLongPress={() => handleLongPress(item)}
                  className={isMe ? "items-end mb-2 flex-row justify-end" : "items-start mb-2 flex-row"}
                >
                  {selectMode && !isMe && (
                    <View className={selected ? "w-5 h-5 rounded-full bg-brand-500 items-center justify-center mr-2 mt-1" : "w-5 h-5 rounded-full border border-navy-600 mr-2 mt-1"}>
                      {selected && <Check size={12} color="#fff" />}
                    </View>
                  )}
                  <View>
                    {!isMe && <Text className="text-navy-400 text-[11px] mb-0.5 ml-1">{item.sender?.username}</Text>}

                    {!!item.replyTo && (
                      <View className="border-l-2 border-brand-500 pl-2 mb-1 max-w-[75%]">
                        <Text className="text-brand-300 text-[11px] font-semibold">{item.replyTo.senderName}</Text>
                        <Text className="text-navy-400 text-[11px]" numberOfLines={1}>{item.replyTo.isDeletedForEveryone ? "Message deleted" : (item.replyTo.text || "Attachment")}</Text>
                      </View>
                    )}

                    {item.messageType === "sticker" ? (
                      <Text style={{ fontSize: 56 }}>{item.stickerEmoji || "🙂"}</Text>
                    ) : item.mediaType === "image" ? (
                      <View className="rounded-2xl overflow-hidden max-w-[75%] border border-navy-600">
                        <Image source={{ uri: item.mediaUrl }} className="w-56 h-56" resizeMode="cover" />
                        {!!item.text && <Text className="text-white text-sm px-3 py-2 bg-navy-800">{item.text}</Text>}
                      </View>
                    ) : item.mediaType ? (
                      <Pressable onPress={() => !selectMode && Linking.openURL(item.mediaUrl)} className={isMe ? "bg-brand-500 rounded-2xl rounded-br-sm px-3.5 py-3 max-w-[80%] flex-row items-center gap-2" : "bg-navy-800 border border-navy-600 rounded-2xl rounded-bl-sm px-3.5 py-3 max-w-[80%] flex-row items-center gap-2"}>
                        {item.mediaType === "video" ? <Play size={16} color="#fff" /> : <FileText size={16} color="#fff" />}
                        <View className="flex-1 min-w-0">
                          <Text className="text-white text-sm" numberOfLines={1}>{item.fileName || "Attachment"}</Text>
                          <Text className="text-white/60 text-[11px] mt-0.5">{item.mediaType === "video" ? "Video · tap to open" : "File · tap to open"}</Text>
                        </View>
                        <Download size={14} color="#fff" />
                      </Pressable>
                    ) : (
                      <View className={isMe ? "bg-brand-500 rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[80%]" : "bg-navy-800 border border-navy-600 rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[80%]"}>
                        <Text className="text-white text-[15px]">{item.text}</Text>
                      </View>
                    )}

                    {renderReactions(item)}
                  </View>

                  {selectMode && isMe && (
                    <View className={selected ? "w-5 h-5 rounded-full bg-brand-500 items-center justify-center ml-2 mt-1" : "w-5 h-5 rounded-full border border-navy-600 ml-2 mt-1"}>
                      {selected && <Check size={12} color="#fff" />}
                    </View>
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={<View className="items-center py-16"><Text className="text-navy-400">No messages yet. Say hi 👋 (long-press to react, reply, or select)</Text></View>}
          />
        )}

        {selectMode && selectedIds.size > 0 && (
          <View className="flex-row gap-2 px-4 py-2.5 border-t border-navy-700 bg-navy-800">
            <Pressable onPress={() => handleBulkDelete("me")} className="flex-1 items-center py-2 rounded-full bg-navy-700">
              <Text className="text-white text-xs font-semibold">Delete for me</Text>
            </Pressable>
            <Pressable onPress={() => handleBulkDelete("all")} className="flex-1 items-center py-2 rounded-full bg-red-500/20 border border-red-500/40">
              <Text className="text-red-400 text-xs font-semibold">Delete for everyone</Text>
            </Pressable>
          </View>
        )}

        {!selectMode && !!permissionError && <Text className="text-yellow-400 text-xs text-center px-4 pb-1">{permissionError}</Text>}

        {!selectMode && !!replyingTo && (
          <View className="flex-row items-center gap-2 px-4 py-2 bg-navy-800 border-t border-navy-700">
            <CornerUpLeft size={14} color="#8478bb" />
            <View className="flex-1">
              <Text className="text-brand-300 text-xs font-semibold">Replying to {replyingTo.sender?.username}</Text>
              <Text className="text-navy-400 text-xs" numberOfLines={1}>{replyingTo.text || "Attachment"}</Text>
            </View>
            <Pressable onPress={() => setReplyingTo(null)}><X size={16} color="#4d5569" /></Pressable>
          </View>
        )}

        {!selectMode && (
          <View className="flex-row items-center gap-2 px-3 py-2.5 border-t border-navy-700 bg-navy-900">
            <Pressable onPress={handleAttach} disabled={sending} className="w-10 h-10 rounded-full bg-navy-800 border border-navy-600 items-center justify-center">
              <Paperclip size={16} color="#8478bb" />
            </Pressable>
            <Pressable onPress={() => setShowStickers(true)} className="w-10 h-10 rounded-full bg-navy-800 border border-navy-600 items-center justify-center">
              <Smile size={16} color="#8478bb" />
            </Pressable>
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
        )}
      </KeyboardAvoidingView>

      <Modal visible={showStickers} transparent animationType="slide" onRequestClose={() => setShowStickers(false)}>
        <Pressable className="flex-1 bg-black/60 justify-end" onPress={() => setShowStickers(false)}>
          <Pressable className="bg-navy-800 rounded-t-3xl p-4 max-h-96" onPress={(e) => e.stopPropagation()}>
            <Text className="text-white font-bold mb-3">Stickers</Text>
            <FlatList
              data={stickers}
              numColumns={6}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleSendSticker(item.id)} className="w-1/6 items-center justify-center py-2">
                  <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={searchMode} animationType="slide" onRequestClose={() => setSearchMode(false)}>
        <View className="flex-1 bg-navy-900 pt-14">
          <View className="flex-row items-center gap-2 px-4 pb-3 border-b border-navy-700">
            <Pressable onPress={() => { setSearchMode(false); setSearchQuery(""); setSearchResults([]); }} hitSlop={10}>
              <X size={20} color="#fff" />
            </Pressable>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={runSearch}
              placeholder="Search messages..."
              placeholderTextColor="#4d5569"
              className="flex-1 bg-navy-800 border border-navy-600 rounded-full px-4 py-2 text-white"
              autoFocus
              returnKeyType="search"
            />
            <Pressable onPress={runSearch} className="px-3 py-2 rounded-full bg-brand-500/15 border border-brand-500/40">
              <Text className="text-brand-300 text-xs font-semibold">Go</Text>
            </Pressable>
          </View>
          {searching ? (
            <View className="flex-1 items-center justify-center"><ActivityIndicator color="#8478bb" /></View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item._id}
              contentContainerClassName="px-4 py-3"
              renderItem={({ item }) => (
                <View className="py-2.5 border-b border-navy-800">
                  <Text className="text-brand-300 text-xs font-semibold">{item.sender?.username}</Text>
                  <Text className="text-white text-sm mt-0.5">{item.text || `[${item.mediaType || item.messageType}]`}</Text>
                </View>
              )}
              ListEmptyComponent={<Text className="text-navy-400 text-center py-16">{searchQuery ? "No matches found." : "Type to search this group's messages."}</Text>}
            />
          )}
        </View>
      </Modal>
    </>
  );
}
