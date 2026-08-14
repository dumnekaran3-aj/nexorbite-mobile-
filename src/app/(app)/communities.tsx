import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Users, Check } from "lucide-react-native";
import * as collegeService from "@/services/collegeService";
import * as communityService from "@/services/communityService";

export default function CommunitiesScreen() {
  const router = useRouter();
  const [myCommunities, setMyCommunities] = useState<{ privateCommunity: any; publicCommunities: any[] }>({
    privateCommunity: null,
    publicCommunities: [],
  });
  const [discover, setDiscover] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [mineRes, publicRes] = await Promise.all([
        collegeService.getMyCommunities(),
        communityService.getPublicCommunities(),
      ]);
      setMyCommunities({
        privateCommunity: mineRes.privateCommunity,
        publicCommunities: mineRes.publicCommunities || [],
      });
      setDiscover(publicRes.data || []);
    } catch (err) {
      console.error("Communities load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const joinedIds = new Set([
    myCommunities.privateCommunity?.collegeId,
    ...myCommunities.publicCommunities.map((c) => c.collegeId),
  ]);

  const openCommunity = (c: any) => {
    router.push({
      pathname: "/(app)/community/[collegeId]",
      params: {
        collegeId: c.collegeId,
        name: c.name,
        description: c.description || "",
        memberCount: String(c.memberCount || 0),
      },
    });
  };

  const handleJoin = async (community: any) => {
    setJoiningId(community._id);
    try {
      await collegeService.joinCollege(community.invite_code);
      load();
    } catch (err) {
      console.error("Join community error:", err);
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <ActivityIndicator color="#8478bb" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Communities",
          headerStyle: { backgroundColor: "#12172a" },
          headerTintColor: "#fff",
        }}
      />
      <FlatList
        className="flex-1 bg-navy-900"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8478bb" />}
        data={discover}
        keyExtractor={(item) => item._id}
        contentContainerClassName="px-4 py-4"
        ListHeaderComponent={
          <View className="mb-6">
            <Text className="text-navy-400 text-xs uppercase tracking-wide mb-2">Your Communities</Text>
            {myCommunities.privateCommunity && (
              <Pressable
                onPress={() => openCommunity(myCommunities.privateCommunity)}
                className="flex-row items-center gap-3 bg-navy-800 border border-brand-500/40 rounded-2xl px-4 py-3.5 mb-2"
              >
                <Users size={16} color="#8478bb" />
                <View className="flex-1">
                  <Text className="text-white font-semibold">{myCommunities.privateCommunity.name}</Text>
                  <Text className="text-navy-400 text-xs mt-0.5">Your main college</Text>
                </View>
              </Pressable>
            )}
            {myCommunities.publicCommunities.map((c) => (
              <Pressable
                key={c.collegeId}
                onPress={() => openCommunity(c)}
                className="flex-row items-center gap-3 bg-navy-800 border border-navy-600 rounded-2xl px-4 py-3.5 mb-2"
              >
                <Users size={16} color="#4d5569" />
                <Text className="text-white font-medium flex-1">{c.name}</Text>
              </Pressable>
            ))}
            {!myCommunities.privateCommunity && myCommunities.publicCommunities.length === 0 && (
              <Text className="text-navy-400 text-sm">You haven't joined any communities yet.</Text>
            )}

            <Text className="text-navy-400 text-xs uppercase tracking-wide mt-4 mb-2">Discover</Text>
          </View>
        }
        renderItem={({ item }) => {
          const alreadyJoined = joinedIds.has(item._id);
          return (
            <View className="flex-row items-center gap-3 bg-navy-800 border border-navy-600 rounded-2xl px-4 py-3.5 mb-2">
              <Users size={16} color="#4d5569" />
              <View className="flex-1">
                <Text className="text-white font-medium">{item.college_name}</Text>
                {!!item.description && (
                  <Text className="text-navy-400 text-xs mt-0.5" numberOfLines={1}>{item.description}</Text>
                )}
                <Text className="text-navy-400 text-xs mt-0.5">{item.memberCount || 0} members</Text>
              </View>
              {alreadyJoined ? (
                <View className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-navy-700">
                  <Check size={12} color="#4ade80" />
                  <Text className="text-green-400 text-xs font-semibold">Joined</Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => handleJoin(item)}
                  disabled={joiningId === item._id}
                  className="px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/40"
                >
                  <Text className="text-brand-300 text-xs font-semibold">{joiningId === item._id ? "..." : "Join"}</Text>
                </Pressable>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<Text className="text-navy-400 text-center py-10">No public communities to discover yet.</Text>}
      />
    </>
  );
}
