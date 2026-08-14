import { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Eye, ShoppingBag, GraduationCap, ImageOff, Flame } from "lucide-react-native";
import * as feedService from "@/services/feedService";

export default function FeedPostDetailScreen() {
  const { postId, fallback } = useLocalSearchParams<{ postId: string; fallback?: string }>();
  const [post, setPost] = useState<any>(fallback ? JSON.parse(fallback) : null);
  const [loading, setLoading] = useState(!fallback);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    feedService
      .getPostById(postId)
      .then((data) => setPost(data.post || data))
      .catch(() => {
        // Fine to fail silently — we already have fallback data from the feed list
      })
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading && !post) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <ActivityIndicator color="#8478bb" />
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center px-6">
        <Text className="text-navy-400 text-center">This post isn't available anymore.</Text>
      </View>
    );
  }

  const product = post.product || {};
  const seller = post.seller || {};
  const hasImage = !!product.thumbnailUrl && !imgError;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Post",
          headerStyle: { backgroundColor: "#12172a" },
          headerTintColor: "#fff",
        }}
      />
      <ScrollView className="flex-1 bg-navy-900">
        <View className="w-full aspect-square bg-navy-800 border-b border-navy-700">
          {hasImage ? (
            <Image
              source={{ uri: product.thumbnailUrl }}
              className="w-full h-full"
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View className="flex-1 items-center justify-center gap-2">
              <ImageOff size={32} color="#4d5569" />
              <Text className="text-navy-400 text-sm">No preview available</Text>
            </View>
          )}
        </View>

        <View className="px-5 py-5">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="w-8 h-8 rounded-full bg-navy-700 border border-navy-600 items-center justify-center overflow-hidden">
              {seller.avatar ? (
                <Image source={{ uri: seller.avatar }} className="w-full h-full" />
              ) : (
                <GraduationCap size={14} color="#a79fd3" />
              )}
            </View>
            <Text className="text-white text-sm font-semibold">{seller.fullName || "Independent Seller"}</Text>
            {post.isTrending && (
              <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25 ml-1">
                <Flame size={10} color="#fb923c" />
                <Text className="text-[10px] font-bold text-orange-400">Trending</Text>
              </View>
            )}
          </View>

          <Text className="text-white text-xl font-bold leading-snug">{product.title || "Untitled Product"}</Text>
          <Text className={product.isPaid ? "text-brand-300 text-lg font-bold mt-1" : "text-green-400 text-lg font-bold mt-1"}>
            {product.isPaid ? `₹${product.price || 0}` : "Free"}
          </Text>

          {!!product.description && (
            <Text className="text-navy-400 text-[15px] leading-relaxed mt-4">{product.description}</Text>
          )}

          <View className="flex-row items-center gap-5 mt-6 pt-4 border-t border-navy-700">
            <View className="flex-row items-center gap-1.5">
              <Eye size={16} color="#4d5569" />
              <Text className="text-navy-400 text-sm">{product.viewCount || 0} views</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <ShoppingBag size={16} color="#4d5569" />
              <Text className="text-navy-400 text-sm">{product.salesCount || 0} sold</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
