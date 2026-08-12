import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, ActivityIndicator, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import * as feedService from "@/services/feedService";
import FeedPost from "@/components/feed/FeedPost";

export default function FeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadFeed = useCallback(async (pageNum: number) => {
    try {
      const data = await feedService.getCommunityFeed(pageNum, 20);
      setPosts((prev) => (pageNum === 1 ? data.posts : [...prev, ...data.posts]));
      setHasMore(pageNum < data.pagination.pages);
      setPage(pageNum);
      setErrorMsg("");
    } catch (err: any) {
      setHasMore(false);
      setErrorMsg(err.response?.data?.msg || "Couldn't load feed right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(1);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    loadFeed(1);
  };

  const onLoadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    loadFeed(page + 1);
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
        <Text className="text-white text-xl font-bold tracking-tight">Feed</Text>
         <Pressable
          onPress={() => router.push("/(app)/feed/create")}
          className="w-9 h-9 rounded-full bg-brand-500/15 border border-brand-500/40 items-center justify-center"
        >
          <Plus size={18} color="#8478bb" />
        </Pressable>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <FeedPost
  post={item}
  onOpen={() =>
    router.push({
      pathname: "/(app)/feed/[postId]",
      params: { postId: item._id, fallback: JSON.stringify(item) },
    })
  }
/>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8478bb" />}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={loadingMore ? <ActivityIndicator className="my-4" color="#8478bb" /> : null}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 px-6">
            <Text className="text-navy-400 text-center">
              {errorMsg || "No posts yet in your college feed."}
            </Text>
          </View>
        }
      />
    </View>
  );
}
