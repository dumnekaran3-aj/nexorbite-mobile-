import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Link } from "expo-router";
import { Eye, ShoppingBag, ArrowUpRight, Flame, GraduationCap, ImageOff, Heart, Share2 } from "lucide-react-native";

interface FeedPostProps {
  post: any;
  onOpen: () => void;
}

export default function FeedPost({ post, onOpen }: FeedPostProps) {
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const product = post.product || {};
  const seller = post.seller || {};
  const hasImage = !!product.thumbnailUrl && !imgError;
  const hasAvatar = !!seller.avatar && !avatarError;
  const sellerName = seller.fullName || "Independent Seller";

  return (
    <View className="flex-row gap-3 px-3 py-4 border-b border-navy-700">
      <Link href={seller._id ? `/(app)/friends/public-profile/${seller._id}` : "#"} asChild>
        <Pressable className="w-11 h-11 rounded-full bg-brand-600/30 items-center justify-center overflow-hidden border border-navy-600 mt-0.5">
          {hasAvatar ? (
            <Image source={{ uri: seller.avatar }} className="w-full h-full" onError={() => setAvatarError(true)} />
          ) : (
            <GraduationCap size={18} color="#a79fd3" />
          )}
        </Pressable>
      </Link>

      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-1.5 mb-0.5">
          <Text className="font-bold text-[15px] text-white" numberOfLines={1}>
            {sellerName}
          </Text>
          {!!product.branch && (
            <View className="px-1.5 py-0.5 rounded-full bg-navy-700 ml-auto">
              <Text className="text-[10px] font-semibold uppercase text-navy-400">{product.branch}</Text>
            </View>
          )}
          {post.isTrending && (
            <View className="flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25">
              <Flame size={10} color="#fb923c" />
              <Text className="text-[10px] font-bold text-orange-400">Trending</Text>
            </View>
          )}
        </View>

        <Pressable onPress={onOpen}>
          <Text className="text-white text-[15px] leading-snug font-medium">
            {product.title || "Untitled Product"}
            <Text className={product.isPaid ? "text-brand-300 text-xs font-bold" : "text-green-400 text-xs font-bold"}>
              {"  "}{product.isPaid ? `₹${product.price || 0}` : "Free"}
            </Text>
          </Text>
          {!!product.description && (
            <Text className="text-navy-400 text-sm leading-relaxed mt-1" numberOfLines={2}>
              {product.description}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={onOpen} className="rounded-2xl overflow-hidden bg-navy-800 border border-navy-600 mt-3">
          {hasImage ? (
            <Image
              source={{ uri: product.thumbnailUrl }}
              className="w-full h-52"
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View className="w-full h-40 items-center justify-center gap-2">
              <ImageOff size={26} color="#4d5569" />
              <Text className="text-xs text-navy-400">No preview available</Text>
            </View>
          )}
        </Pressable>

        <View className="flex-row items-center justify-between mt-3">
          <View className="flex-row items-center gap-1.5">
            <Eye size={15} color="#4d5569" />
            <Text className="text-xs text-navy-400">{product.viewCount || 0}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <ShoppingBag size={15} color="#4d5569" />
            <Text className="text-xs text-navy-400">{product.salesCount || 0}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Heart size={15} color="#4d5569" />
          </View>
          <View className="flex-row items-center gap-1.5">
            <Share2 size={15} color="#4d5569" />
          </View>
          <Pressable onPress={onOpen} className="flex-row items-center gap-1">
            <Text className="text-brand-400 font-semibold text-xs">View</Text>
            <ArrowUpRight size={13} color="#8478bb" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}