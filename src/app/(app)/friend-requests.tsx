import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { GraduationCap, Check, X } from "lucide-react-native";
import * as friendsService from "@/services/friendsService";
import { useFriendsStore } from "@/store/friendsStore";

type Segment = "incoming" | "outgoing";

export default function FriendRequestsScreen() {
  const [segment, setSegment] = useState<Segment>("incoming");
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const setIncomingCount = useFriendsStore((s) => s.setIncomingCount);

  const load = useCallback(async () => {
    try {
      const [incomingRes, outgoingRes] = await Promise.all([
        friendsService.getIncomingRequests(),
        friendsService.getOutgoingRequests(),
      ]);
      setIncoming(incomingRes.requests || []);
      setOutgoing(outgoingRes.requests || []);
      setIncomingCount((incomingRes.requests || []).length);
    } catch (err) {
      console.error("Friend requests load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (requestId: string) => {
    try {
      await friendsService.acceptFriendRequest(requestId);
      load();
    } catch (err) { console.error("Accept error:", err); }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await friendsService.declineFriendRequest(requestId);
      setIncoming((prev) => prev.filter((r) => r._id !== requestId));
      setIncomingCount(Math.max(0, incoming.length - 1));
    } catch (err) { console.error("Decline error:", err); }
  };

  if (loading) {
    return <View className="flex-1 bg-navy-900 items-center justify-center"><ActivityIndicator color="#8478bb" /></View>;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "Friend Requests", headerStyle: { backgroundColor: "#12172a" }, headerTintColor: "#fff" }} />
      <View className="flex-1 bg-navy-900">
        <View className="flex-row border-b border-navy-700">
          <Pressable onPress={() => setSegment("incoming")} className={segment === "incoming" ? "flex-1 items-center py-2.5 border-b-2 border-brand-500" : "flex-1 items-center py-2.5 border-b-2 border-transparent"}>
            <Text className={segment === "incoming" ? "text-white text-sm font-semibold" : "text-navy-400 text-sm"}>Incoming ({incoming.length})</Text>
          </Pressable>
          <Pressable onPress={() => setSegment("outgoing")} className={segment === "outgoing" ? "flex-1 items-center py-2.5 border-b-2 border-brand-500" : "flex-1 items-center py-2.5 border-b-2 border-transparent"}>
            <Text className={segment === "outgoing" ? "text-white text-sm font-semibold" : "text-navy-400 text-sm"}>Sent ({outgoing.length})</Text>
          </Pressable>
        </View>

        {segment === "incoming" ? (
          <FlatList
            data={incoming}
            keyExtractor={(item) => item._id}
            contentContainerClassName="px-4 py-3"
            renderItem={({ item }) => (
              <View className="flex-row items-center gap-3 py-3 border-b border-navy-800">
                <View className="w-11 h-11 rounded-full bg-navy-700 border border-navy-600 items-center justify-center overflow-hidden">
                  {item.from?.avatar ? <Image source={{ uri: item.from.avatar }} className="w-full h-full" /> : <GraduationCap size={16} color="#a79fd3" />}
                </View>
                <Text className="text-white font-semibold flex-1">{item.from?.fullName || item.from?.username}</Text>
                <Pressable onPress={() => handleAccept(item._id)} className="w-9 h-9 rounded-full bg-green-500/15 items-center justify-center">
                  <Check size={16} color="#4ade80" />
                </Pressable>
                <Pressable onPress={() => handleDecline(item._id)} className="w-9 h-9 rounded-full bg-red-500/15 items-center justify-center">
                  <X size={16} color="#f87171" />
                </Pressable>
              </View>
            )}
            ListEmptyComponent={<Text className="text-navy-400 text-center py-16">No incoming requests.</Text>}
          />
        ) : (
          <FlatList
            data={outgoing}
            keyExtractor={(item) => item._id}
            contentContainerClassName="px-4 py-3"
            renderItem={({ item }) => (
              <View className="flex-row items-center gap-3 py-3 border-b border-navy-800">
                <View className="w-11 h-11 rounded-full bg-navy-700 border border-navy-600 items-center justify-center overflow-hidden">
                  {item.to?.avatar ? <Image source={{ uri: item.to.avatar }} className="w-full h-full" /> : <GraduationCap size={16} color="#a79fd3" />}
                </View>
                <Text className="text-white font-semibold flex-1">{item.to?.fullName || item.to?.username}</Text>
                <Text className="text-navy-400 text-xs">Pending</Text>
              </View>
            )}
            ListEmptyComponent={<Text className="text-navy-400 text-center py-16">No sent requests.</Text>}
          />
        )}
      </View>
    </>
  );
}
