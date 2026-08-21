import * as discoverService from "@/services/discoverService";
import { useRouter } from "expo-router";
import { Check, Crown, GraduationCap, Handshake, Search, Shield, Sparkles, UserPlus, Users } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, Text, TextInput, View } from "react-native";

export default function DiscoverScreen() {
  const router = useRouter();
  const [people, setPeople] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [locked, setLocked] = useState(false);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchPage = useCallback(async (pageNum: number) => {
    try {
      const res = await discoverService.getDiscoverFeed(pageNum, 20);
     setPeople((prev) => (pageNum === 1 ? res.users || [] : [...prev, ...(res.users || [])]));
setHasMore((res.users || []).length === 20);
      setPage(pageNum);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setLocked(true);
      } else {
        console.error("Discover fetch error:", err);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { fetchPage(1); }, [fetchPage]);

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    fetchPage(page + 1);
  };

  const toggleCollab = async (person: any) => {
    setBusyId(person._id);
    const next = !person.isCollabing;
    setPeople((prev) => prev.map((p) => (p._id === person._id ? { ...p, isCollabing: next } : p)));
    try {
      if (next) await discoverService.collabWith(person._id);
      else await discoverService.uncollab(person._id);
    } catch (err) {
      setPeople((prev) => prev.map((p) => (p._id === person._id ? { ...p, isCollabing: !next } : p)));
      console.error("Collab toggle error:", err);
    } finally {
      setBusyId(null);
    }
  };

  const q = query.trim().toLowerCase();
  const filtered = !q
    ? people
    : people.filter(
        (p) =>
          p.username?.toLowerCase().includes(q) ||
          p.fullName?.toLowerCase().includes(q) ||
          p.stream?.toLowerCase().includes(q) ||
          p.skills?.some((s: string) => s.toLowerCase().includes(q))
      );

  if (loading) {
    return <View className="flex-1 bg-navy-900 items-center justify-center"><ActivityIndicator color="#8478bb" /></View>;
  }

  if (locked) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center px-6">
        <View className="w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/20 items-center justify-center mb-5">
          <Crown size={30} color="#facc15" />
        </View>
        <Text className="text-white text-xl font-extrabold mb-2 text-center">Discover is a Premium Feature</Text>
        <Text className="text-navy-400 text-sm text-center max-w-xs">
          Find same-skill, same-vibe people from every college on NexOrbite — matched by your skills, stream, and trust score.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy-900">
      <View className="px-4 pt-14 pb-3 border-b border-navy-700">
        <Text className="text-white text-xl font-bold tracking-tight mb-3">Discover</Text>
        <View className="flex-row items-center gap-2 bg-navy-800 border border-navy-600 rounded-full px-3.5 py-2">
          <Search size={15} color="#4d5569" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, stream, or skill..."
            placeholderTextColor="#4d5569"
            className="flex-1 text-white text-sm"
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={loadingMore ? <ActivityIndicator className="my-4" color="#8478bb" /> : null}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/(app)/friends/public-profile/${item._id}` as any)}
            className="flex-row items-center gap-3 px-4 py-3 border-b border-navy-800"
          >
            <View className="w-14 h-14 rounded-full bg-navy-700 border border-navy-600 items-center justify-center overflow-hidden">
              {item.avatar ? <Image source={{ uri: item.avatar }} className="w-full h-full" /> : <GraduationCap size={22} color="#a79fd3" />}
            </View>

            <View className="flex-1 min-w-0">
              <View className="flex-row items-center justify-between gap-2">
                <Text className="text-white font-bold text-sm flex-1" numberOfLines={1}>@{item.username}</Text>
                <View className="flex-row items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                  <Sparkles size={10} color="#facc15" />
                  <Text className="text-yellow-400 text-[10px] font-bold">{item.matchScore}%</Text>
                </View>
              </View>

              <Text className="text-navy-400 text-xs mt-0.5" numberOfLines={1}>
                {item.fullName}{item.stream ? ` · ${item.stream}` : ""}
              </Text>

              {!!item.skills?.length && (
                <View className="flex-row flex-wrap gap-1 mt-1.5">
                  {item.skills.slice(0, 4).map((s: string) => (
                    <View key={s} className="px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20">
                      <Text className="text-brand-300 text-[10px]">{s}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View className="flex-row items-center gap-3 mt-1.5">
                <View className="flex-row items-center gap-1">
                  <Shield size={11} color="#4d5569" />
                  <Text className="text-navy-500 text-[10px]">{item.trustScore || 0} Trust</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Handshake size={11} color="#4d5569" />
                  <Text className="text-navy-500 text-[10px]">{item.collabCount || 0} Collabs</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Users size={11} color="#4d5569" />
                  <Text className="text-navy-500 text-[10px]">{item.friendsCount || 0} Friends</Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={(e) => { e.stopPropagation(); toggleCollab(item); }}
              disabled={busyId === item._id}
              className={item.isCollabing ? "w-9 h-9 rounded-full bg-navy-700 border border-navy-600 items-center justify-center" : "w-9 h-9 rounded-full bg-brand-500 items-center justify-center"}
            >
              {item.isCollabing ? <Check size={16} color="#8478bb" /> : <UserPlus size={16} color="#fff" />}
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={<Text className="text-navy-400 text-center py-16">{query ? "No one matches your search." : "No one to discover right now."}</Text>}
      />
    </View>
  );
}
