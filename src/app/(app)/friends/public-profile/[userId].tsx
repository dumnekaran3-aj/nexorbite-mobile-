import { useState, useEffect } from "react";
import { View, Text, Image, ActivityIndicator, ScrollView, Pressable, Modal } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { GraduationCap, Check, MessageCircle, Handshake, Lock, X, ShieldCheck, Users, UserPlus } from "lucide-react-native";
import * as friendsService from "@/services/friendsService";
import * as discoverService from "@/services/discoverService";
import * as chatService from "@/services/chatService";
import * as portfolioService from "@/services/portfolioService";

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 items-center bg-navy-800 border border-navy-600 rounded-2xl py-2.5">
      <Text className="text-white font-bold text-sm">{value ?? 0}</Text>
      <Text className="text-navy-400 text-[10px] mt-0.5">{label}</Text>
    </View>
  );
}

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState<string>("none");
  const [collabing, setCollabing] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestSent, setSuggestSent] = useState<Set<string>>(new Set());
  const [suggestCollab, setSuggestCollab] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [collabBusy, setCollabBusy] = useState(false);
  const [enlarge, setEnlarge] = useState(false);

  useEffect(() => {
    friendsService
      .getPublicProfile(userId)
      .then(async (profileRes) => {
        setProfile(profileRes.user);
        setIsPrivate(!!profileRes.user?.isPrivate);

        const [statusRes, collabRes, projRes, prodRes, suggestRes] = await Promise.all([
          friendsService.checkFriendshipStatus(userId).catch(() => null),
          discoverService.getCollabStatus(userId).catch(() => null),
          portfolioService.getUserProjects(userId).catch(() => null),
          portfolioService.getUserProducts(userId).catch(() => null),
          friendsService.getSuggestions(8).catch(() => null),
        ]);
        if (statusRes) setStatus(statusRes.status);
        if (collabRes) setCollabing(!!collabRes.isCollabing);
        if (projRes) setProjects(projRes.projects || []);
        if (prodRes) setProducts(prodRes.data || []);
        if (suggestRes) setSuggestions(suggestRes.suggestions || []);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleAddFriend = async () => {
    setActionLoading(true);
    try {
      await friendsService.sendFriendRequest(userId);
      setStatus("pending");
    } catch (err) {
      console.error("Send request error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      const res = await chatService.getOrCreateDirectChat(userId);
      router.push({ pathname: "/(app)/chat/[chatId]", params: { chatId: res.chatId, friendName: profile?.fullName || profile?.username } });
    } catch (err) {
      console.error("Open chat error:", err);
    }
  };

  const toggleCollab = async () => {
    setCollabBusy(true);
    const next = !collabing;
    setCollabing(next);
    try {
      if (next) await discoverService.collabWith(userId);
      else await discoverService.uncollab(userId);
    } catch (err) {
      setCollabing(!next);
      console.error("Collab toggle error:", err);
    } finally {
      setCollabBusy(false);
    }
  };

  const handleSuggestRequest = async (targetId: string) => {
    setSuggestSent((prev) => new Set(prev).add(targetId));
    try { await friendsService.sendFriendRequest(targetId); } catch (err) { console.error(err); }
  };

  const handleSuggestCollab = async (targetId: string) => {
    setSuggestCollab((prev) => new Set(prev).add(targetId));
    try { await discoverService.collabWith(targetId); } catch (err) { console.error(err); }
  };

  if (loading) {
    return <View className="flex-1 bg-navy-900 items-center justify-center"><ActivityIndicator color="#8478bb" /></View>;
  }

  if (notFound || !profile) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center px-6">
        <Text className="text-navy-400 text-center">This profile isn't available.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: profile.username || "Profile", headerStyle: { backgroundColor: "#12172a" }, headerTintColor: "#fff" }} />
      <ScrollView className="flex-1 bg-navy-900" contentContainerClassName="px-6 py-8">
        <View className="items-center">
          <Pressable onPress={() => setEnlarge(true)}>
            <View className="w-24 h-24 rounded-full bg-navy-700 border-2 border-brand-500 items-center justify-center overflow-hidden">
              {profile.avatar ? <Image source={{ uri: profile.avatar }} className="w-full h-full" /> : <GraduationCap size={30} color="#a79fd3" />}
            </View>
          </Pressable>

          <Text className="text-white text-xl font-bold mt-3">{profile.fullName || profile.username}</Text>
          {!!profile.username && <Text className="text-navy-400 text-sm mt-0.5">@{profile.username}</Text>}
          {!!profile.stream && <Text className="text-brand-300 text-xs mt-2">{profile.stream}</Text>}
        </View>

        {isPrivate ? (
          <View className="items-center mt-6">
            <Lock size={22} color="#4d5569" />
            <Text className="text-navy-400 text-sm text-center mt-2 px-6">This account is private.</Text>
          </View>
        ) : (
          <>
            {!!profile.bio && <Text className="text-navy-400 text-sm text-center mt-3">{profile.bio}</Text>}

            {!!profile.skills?.length && (
              <View className="flex-row flex-wrap gap-1.5 justify-center mt-3">
                {profile.skills.map((s: string) => (
                  <View key={s} className="px-2.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
                    <Text className="text-brand-300 text-[11px]">{s}</Text>
                  </View>
                ))}
              </View>
            )}

            <View className="flex-row gap-2 mt-6">
              {status === "accepted" ? (
                <Pressable onPress={handleMessage} className="flex-1 bg-brand-500 rounded-2xl py-3 flex-row items-center justify-center gap-2">
                  <MessageCircle size={15} color="#fff" />
                  <Text className="text-white font-semibold text-sm">Message</Text>
                </Pressable>
              ) : status === "pending" ? (
                <View className="flex-1 items-center py-3 border border-yellow-500/30 bg-yellow-500/10 rounded-2xl">
                  <Text className="text-yellow-400 text-sm font-semibold">Pending</Text>
                </View>
              ) : (
                <Pressable onPress={handleAddFriend} disabled={actionLoading} className="flex-1 bg-brand-500 rounded-2xl py-3 items-center">
                  <Text className="text-white font-semibold text-sm">{actionLoading ? "..." : "Add Friend"}</Text>
                </Pressable>
              )}

              <Pressable
                onPress={toggleCollab}
                disabled={collabBusy}
                className={collabing ? "flex-1 border border-navy-600 rounded-2xl py-3 flex-row items-center justify-center gap-2" : "flex-1 bg-navy-800 border border-brand-500/40 rounded-2xl py-3 flex-row items-center justify-center gap-2"}
              >
                {collabing ? <Check size={15} color="#8478bb" /> : <Handshake size={15} color="#8478bb" />}
                <Text className="text-brand-300 font-semibold text-sm">{collabing ? "Collabing" : "Collab"}</Text>
              </Pressable>
            </View>

            <View className="flex-row gap-2 mt-3">
              <StatPill label="Trust Score" value={profile.trustScore} />
              <StatPill label="Collaborators" value={profile.collabCount} />
              <StatPill label="Friends" value={profile.friendsCount} />
              <StatPill label="Products" value={products.length} />
            </View>

            {(projects.length > 0 || products.length > 0) && (
              <View className="mt-8">
                {projects.length > 0 && (
                  <View className="mb-5">
                    <Text className="text-navy-400 text-xs font-bold uppercase tracking-wide mb-3">Projects ({projects.length})</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {projects.map((p: any) => (
                        <View key={p._id} className="w-[31%] bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
                          <View className="aspect-square bg-navy-900 items-center justify-center">
                            {p.image ? <Image source={{ uri: p.image }} className="w-full h-full" /> : <Text style={{ fontSize: 20 }}>📁</Text>}
                          </View>
                          <Text className="text-white text-[10px] font-semibold px-1.5 py-1" numberOfLines={1}>{p.title}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {products.length > 0 && (
                  <View>
                    <Text className="text-navy-400 text-xs font-bold uppercase tracking-wide mb-3">Digital Products ({products.length})</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {products.map((p: any) => (
                        <View key={p._id} className="w-[31%] bg-navy-800 border border-navy-600 rounded-xl overflow-hidden">
                          <View className="aspect-square bg-navy-900 items-center justify-center">
                            {p.thumbnailUrl ? <Image source={{ uri: p.thumbnailUrl }} className="w-full h-full" /> : <Text style={{ fontSize: 20 }}>🛍️</Text>}
                          </View>
                          <Text className="text-white text-[10px] font-semibold px-1.5 py-1" numberOfLines={1}>{p.title}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {suggestions.length > 0 && (
              <View className="mt-8">
                <Text className="text-navy-400 text-xs font-bold uppercase tracking-wide mb-3">People You May Know</Text>
                {suggestions.map((s: any) => (
                  <View key={s._id} className="flex-row items-center gap-3 bg-navy-800 border border-navy-600 rounded-2xl px-3.5 py-3 mb-2">
                    <Pressable onPress={() => router.push(`/(app)/friends/public-profile/${s._id}` as any)} className="flex-row items-center gap-3 flex-1 min-w-0">
                      <View className="w-10 h-10 rounded-full bg-navy-700 border border-navy-600 items-center justify-center overflow-hidden">
                        {s.avatar ? <Image source={{ uri: s.avatar }} className="w-full h-full" /> : <GraduationCap size={14} color="#a79fd3" />}
                      </View>
                      <View className="flex-1 min-w-0">
                        <Text className="text-white text-sm font-semibold" numberOfLines={1}>{s.fullName || s.username}</Text>
                        <Text className="text-navy-400 text-[11px]" numberOfLines={1}>
                          {s.mutualFriendsCount} mutual friend{s.mutualFriendsCount === 1 ? "" : "s"}
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable
                      onPress={() => handleSuggestRequest(s._id)}
                      disabled={suggestSent.has(s._id)}
                      className={suggestSent.has(s._id) ? "w-8 h-8 rounded-full bg-navy-700 items-center justify-center" : "w-8 h-8 rounded-full bg-brand-500/15 border border-brand-500/40 items-center justify-center"}
                    >
                      {suggestSent.has(s._id) ? <Check size={13} color="#4ade80" /> : <UserPlus size={13} color="#8478bb" />}
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Modal visible={enlarge} transparent animationType="fade" onRequestClose={() => setEnlarge(false)}>
        <Pressable className="flex-1 bg-black/85 items-center justify-center" onPress={() => setEnlarge(false)}>
          <Pressable onPress={() => setEnlarge(false)} className="absolute top-14 right-6 z-10"><X size={26} color="#fff" /></Pressable>
          {profile.avatar ? <Image source={{ uri: profile.avatar }} className="w-80 h-80 rounded-full" resizeMode="cover" /> : <GraduationCap size={100} color="#a79fd3" />}
        </Pressable>
      </Modal>
    </>
  );
}
