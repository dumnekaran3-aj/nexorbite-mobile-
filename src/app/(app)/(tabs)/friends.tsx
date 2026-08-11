import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Image, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { GraduationCap, UserPlus, Check, X } from "lucide-react-native";
import * as friendsService from "@/services/friendsService";
import * as membersService from "@/services/membersService";

type Segment = "friends" | "requests" | "find";

function Avatar({ uri, size = 44 }: { uri?: string; size?: number }) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-navy-700 border border-navy-600 items-center justify-center overflow-hidden"
    >
      {uri ? <Image source={{ uri }} className="w-full h-full" /> : <GraduationCap size={size * 0.4} color="#a79fd3" />}
    </View>
  );
}

export default function FriendsScreen() {
  const router = useRouter();
  const [segment, setSegment] = useState<Segment>("friends");

  const [friends, setFriends] = useState<any[]>([]);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [friendsRes, incomingRes, suggestRes] = await Promise.all([
        friendsService.getFriends(),
        friendsService.getIncomingRequests(),
        membersService.getSameBranchStudents(),
      ]);
      setFriends(friendsRes.friends || []);
      setIncoming(incomingRes.requests || []);
      setSuggestions(suggestRes.students || []);
    } catch (err) {
      console.error("Friends load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const handleAccept = async (requestId: string) => {
    try {
      await friendsService.acceptFriendRequest(requestId);
      loadAll();
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await friendsService.declineFriendRequest(requestId);
      setIncoming((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      console.error("Decline error:", err);
    }
  };

  const handleSendRequest = async (toUserId: string) => {
    setSentIds((prev) => new Set(prev).add(toUserId));
    try {
      await friendsService.sendFriendRequest(toUserId);
    } catch (err) {
      console.error("Send request error:", err);
      setSentIds((prev) => {
        const next = new Set(prev);
        next.delete(toUserId);
        return next;
      });
    }
  };

  const openProfile = (userId: string) => {
    router.push(`/(app)/friends/public-profile/${userId}` as any);
  };

  const SegmentButton = ({ id, label, count }: { id: Segment; label: string; count?: number }) => (
    <Pressable
      onPress={() => setSegment(id)}
      className={
        segment === id
          ? "flex-1 items-center py-2.5 border-b-2 border-brand-500"
          : "flex-1 items-center py-2.5 border-b-2 border-transparent"
      }
    >
      <Text className={segment === id ? "text-white text-sm font-semibold" : "text-navy-400 text-sm"}>
        {label}
        {!!count && count > 0 ? ` (${count})` : ""}
      </Text>
    </Pressable>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <ActivityIndicator color="#8478bb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-navy-900">
      <View className="px-4 pt-14 pb-2">
        <Text className="text-white text-xl font-bold tracking-tight">Friends</Text>
      </View>

      <View className="flex-row border-b border-navy-700 mb-1">
        <SegmentButton id="friends" label="Friends" />
        <SegmentButton id="requests" label="Requests" count={incoming.length} />
        <SegmentButton id="find" label="Find People" />
      </View>

      {segment === "friends" && (
        <FlatList
          data={friends}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8478bb" />}
          contentContainerClassName="px-4 py-3"
          renderItem={({ item }) => (
            <Pressable onPress={() => openProfile(item._id)} className="flex-row items-center gap-3 py-3 border-b border-navy-800">
              <Avatar uri={item.avatar} />
              <View className="flex-1">
                <Text className="text-white font-semibold">{item.fullName || item.username}</Text>
                {!!item.stream && <Text className="text-navy-400 text-xs mt-0.5">{item.stream}</Text>}
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-navy-400 text-center">
                No friends yet.{"\n"}Head to "Find People" to connect with classmates.
              </Text>
            </View>
          }
        />
      )}

      {segment === "requests" && (
        <FlatList
          data={incoming}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8478bb" />}
          contentContainerClassName="px-4 py-3"
          renderItem={({ item }) => (
            <View className="flex-row items-center gap-3 py-3 border-b border-navy-800">
              <Avatar uri={item.from?.avatar} />
              <View className="flex-1">
                <Text className="text-white font-semibold">{item.from?.fullName || item.from?.username}</Text>
                <Text className="text-navy-400 text-xs mt-0.5">wants to be friends</Text>
              </View>
              <Pressable onPress={() => handleAccept(item._id)} className="w-9 h-9 rounded-full bg-green-500/15 items-center justify-center">
                <Check size={16} color="#4ade80" />
              </Pressable>
              <Pressable onPress={() => handleDecline(item._id)} className="w-9 h-9 rounded-full bg-red-500/15 items-center justify-center">
                <X size={16} color="#f87171" />
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-navy-400">No pending requests.</Text>
            </View>
          }
        />
      )}

      {segment === "find" && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8478bb" />}
          contentContainerClassName="px-4 py-3"
          renderItem={({ item }) => {
            const alreadySent = sentIds.has(item._id);
            return (
              <Pressable onPress={() => openProfile(item._id)} className="flex-row items-center gap-3 py-3 border-b border-navy-800">
                <Avatar uri={item.avatar} />
                <View className="flex-1">
                  <Text className="text-white font-semibold">{item.fullName || item.username}</Text>
                  {!!item.stream && <Text className="text-navy-400 text-xs mt-0.5">{item.stream}</Text>}
                </View>
                <Pressable
                  onPress={() => handleSendRequest(item._id)}
                  disabled={alreadySent}
                  className={
                    alreadySent
                      ? "px-3 py-1.5 rounded-full bg-navy-800 border border-navy-600"
                      : "px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/40 flex-row items-center gap-1"
                  }
                >
                  {alreadySent ? (
                    <Text className="text-navy-400 text-xs">Sent</Text>
                  ) : (
                    <>
                      <UserPlus size={13} color="#8478bb" />
                      <Text className="text-brand-300 text-xs font-semibold">Add</Text>
                    </>
                  )}
                </Pressable>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-navy-400 text-center">No suggestions right now.{"\n"}Check back later.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
