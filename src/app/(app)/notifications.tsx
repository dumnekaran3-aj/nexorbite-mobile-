import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from "react-native";
import { useRouter, Stack } from "expo-router";
import { Bell } from "lucide-react-native";
import * as notificationService from "@/services/notificationService";
import { useNotificationStore } from "@/store/notificationStore";

const NOTIF_META: Record<string, { icon: string; dot: string }> = {
  friend_request: { icon: "👋", dot: "bg-sky-500" },
  friend_accepted: { icon: "🤝", dot: "bg-green-500" },
  new_message: { icon: "💬", dot: "bg-brand-500" },
  new_group_message: { icon: "💬", dot: "bg-brand-500" },
  new_community_member: { icon: "🏫", dot: "bg-yellow-500" },
  new_product: { icon: "🛒", dot: "bg-green-500" },
  new_feed: { icon: "📢", dot: "bg-sky-500" },
  member_suggestion: { icon: "🔍", dot: "bg-navy-500" },
  group_join_request: { icon: "🙋", dot: "bg-yellow-500" },
  group_join_accepted: { icon: "🎉", dot: "bg-green-500" },
  group_join_declined: { icon: "🚫", dot: "bg-red-500" },
  added_to_group: { icon: "👥", dot: "bg-brand-500" },
  promoted_to_group_admin: { icon: "⭐", dot: "bg-yellow-500" },
};
const DEFAULT_META = { icon: "🔔", dot: "bg-brand-500" };

function dateGroupLabel(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This Week";
  return "Earlier";
}
const GROUP_ORDER = ["Today", "Yesterday", "This Week", "Earlier"];

export default function NotificationsScreen() {
  const router = useRouter();
  const { unreadCount, setUnreadCount } = useNotificationStore();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifs = useCallback(async (pg: number) => {
    try {
      const res = await notificationService.getNotifications(pg, 20);
      const data = res.notifications || [];
      setNotifs((prev) => (pg === 1 ? data : [...prev, ...data]));
      setUnreadCount(res.unreadCount || 0);
      setHasMore(data.length === 20);
      setPage(pg);
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchNotifs(1); }, []);

  const handleRead = async (id: string, url?: string) => {
    setNotifs((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount(Math.max(0, unreadCount - 1));
    notificationService.markRead(id).catch(() => {});
  };

  const handleReadAll = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try { await notificationService.markAllRead(); } catch (err) { console.error(err); }
  };

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    fetchNotifs(page + 1);
  };

  const grouped: Record<string, any[]> = {};
  notifs.forEach((n) => {
    const label = dateGroupLabel(n.createdAt);
    if (!grouped[label]) grouped[label] = [];
    grouped[label].push(n);
  });

  const sections = GROUP_ORDER.filter((label) => grouped[label]?.length).flatMap((label) => [
    { type: "header", label },
    ...grouped[label].map((n) => ({ type: "item", ...n })),
  ]);

  if (loading) {
    return <View className="flex-1 bg-navy-900 items-center justify-center"><ActivityIndicator color="#8478bb" /></View>;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Notifications",
          headerStyle: { backgroundColor: "#12172a" },
          headerTintColor: "#fff",
          headerRight: () =>
            unreadCount > 0 ? (
              <Pressable onPress={handleReadAll} className="mr-2">
                <Text className="text-brand-300 text-xs font-semibold">Mark all read</Text>
              </Pressable>
            ) : null,
        }}
      />
      <FlatList
        className="flex-1 bg-navy-900"
        data={sections}
        keyExtractor={(item, i) => (item.type === "header" ? `h-${item.label}` : item._id)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={loadingMore ? <ActivityIndicator className="my-4" color="#8478bb" /> : null}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <View className="px-4 py-2 bg-navy-850">
                <Text className="text-brand-300 text-[11px] font-bold uppercase tracking-wider">{item.label}</Text>
              </View>
            );
          }
          const meta = NOTIF_META[item.type] || DEFAULT_META;
          const unread = !item.isRead;
          return (
            <Pressable
              onPress={() => {
                handleRead(item._id);
                if (item.url) router.push(item.url as any);
              }}
              className={unread ? "flex-row items-center gap-3 px-4 py-3.5 bg-brand-500/[0.07] border-b border-navy-800" : "flex-row items-center gap-3 px-4 py-3.5 border-b border-navy-800"}
            >
              <View className="relative">
                {item.sender?.avatar ? (
                  <Image source={{ uri: item.sender.avatar }} className="w-12 h-12 rounded-full" />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-navy-700 items-center justify-center">
                    <Text style={{ fontSize: 20 }}>{meta.icon}</Text>
                  </View>
                )}
                <View className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2 border-navy-900 ${meta.dot}`}>
                  <Text style={{ fontSize: 10 }}>{meta.icon}</Text>
                </View>
              </View>

              <View className="flex-1 min-w-0">
                <View className="flex-row items-center justify-between">
                  <Text className={unread ? "text-white font-bold text-sm flex-1" : "text-navy-300 font-semibold text-sm flex-1"} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className={unread ? "text-brand-300 text-[11px] font-semibold ml-2" : "text-navy-500 text-[11px] ml-2"}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mt-0.5">
                  <Text className={unread ? "text-navy-200 text-xs flex-1" : "text-navy-500 text-xs flex-1"} numberOfLines={2}>
                    {item.body}
                  </Text>
                  {unread && <View className="w-2 h-2 rounded-full bg-brand-500 ml-2" />}
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-24 px-6">
            <View className="w-16 h-16 rounded-full bg-brand-500/10 items-center justify-center mb-4">
              <Bell size={26} color="#8478bb" />
            </View>
            <Text className="text-white font-semibold mb-1">All caught up!</Text>
            <Text className="text-navy-400 text-sm">You don't have any notifications yet</Text>
          </View>
        }
      />
    </>
  );
}
