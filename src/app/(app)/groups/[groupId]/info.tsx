import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Image, Pressable, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { GraduationCap, Check, X, Shield, UserMinus } from "lucide-react-native";
import Button from "@/components/ui/Button";
import * as groupsService from "@/services/groupsService";

type Segment = "members" | "requests";

export default function GroupInfoScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();

  const [group, setGroup] = useState<any>(null);
  const [segment, setSegment] = useState<Segment>("members");
  const [members, setMembers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = useCallback(async () => {
    try {
     const groupRes = await groupsService.getGroupById(groupId);
setGroup(groupRes.group);

const myRole = groupRes.myRole;

      const admin = myRole === "creator" || myRole === "admin";
      setIsAdmin(admin);

      if (admin) {
        const [membersRes, requestsRes] = await Promise.all([
          groupsService.getGroupMembers(groupId),
          groupsService.getJoinRequests(groupId),
        ]);
        setMembers(membersRes.members || []);
        setRequests(requestsRes.requests || []);
      } else {
        setMembers(groupRes.group?.memberDetails || []);
      }
    } catch (err) {
      console.error("Group info error:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const handleRespond = async (requestId: string, action: "accept" | "decline") => {
    try {
      await groupsService.respondToJoinRequest(groupId, requestId, action);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      if (action === "accept") load();
    } catch (err) {
      console.error("Respond error:", err);
    }
  };

  const handlePromote = async (userId: string) => {
    try { await groupsService.promoteToAdmin(groupId, userId); load(); } catch (err) { console.error(err); }
  };
  const handleDemote = async (userId: string) => {
    try { await groupsService.demoteAdmin(groupId, userId); load(); } catch (err) { console.error(err); }
  };
  const handleRemove = (userId: string, name: string) => {
    Alert.alert("Remove member?", `Remove ${name} from the group?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: async () => {
        try { await groupsService.removeMember(groupId, userId); load(); } catch (err) { console.error(err); }
      }},
    ]);
  };

  const handleLeave = () => {
    Alert.alert("Leave group?", `Leave "${group?.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Leave", style: "destructive", onPress: async () => {
        setLeaving(true);
        try {
          await groupsService.leaveGroup(groupId);
          router.push("/(app)/(tabs)/groups");
        } catch (err) {
          console.error(err);
        } finally { setLeaving(false); }
      }},
    ]);
  };

  if (loading) {
    return <View className="flex-1 bg-navy-900 items-center justify-center"><ActivityIndicator color="#8478bb" /></View>;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: group?.name || "Group Info", headerStyle: { backgroundColor: "#12172a" }, headerTintColor: "#fff" }} />
      <View className="flex-1 bg-navy-900">
        <View className="px-5 py-5 border-b border-navy-700">
          <Text className="text-white text-lg font-bold">{group?.name}</Text>
          {!!group?.description && <Text className="text-navy-400 text-sm mt-1">{group.description}</Text>}
        </View>

        {isAdmin && (
          <View className="flex-row border-b border-navy-700">
            <Pressable onPress={() => setSegment("members")} className={segment === "members" ? "flex-1 items-center py-2.5 border-b-2 border-brand-500" : "flex-1 items-center py-2.5 border-b-2 border-transparent"}>
              <Text className={segment === "members" ? "text-white text-xs font-semibold" : "text-navy-400 text-xs"}>Members ({members.length})</Text>
            </Pressable>
            <Pressable onPress={() => setSegment("requests")} className={segment === "requests" ? "flex-1 items-center py-2.5 border-b-2 border-brand-500" : "flex-1 items-center py-2.5 border-b-2 border-transparent"}>
              <Text className={segment === "requests" ? "text-white text-xs font-semibold" : "text-navy-400 text-xs"}>Requests ({requests.length})</Text>
            </Pressable>
          </View>
        )}

        {segment === "members" && (
          <FlatList
            data={members}
            keyExtractor={(item) => item._id || item.userId}
            contentContainerClassName="px-4 py-3"
            renderItem={({ item }) => (
              <View className="flex-row items-center gap-3 py-2.5 border-b border-navy-800">
                <View className="w-9 h-9 rounded-full bg-navy-700 border border-navy-600 items-center justify-center overflow-hidden">
                  {item.avatar ? <Image source={{ uri: item.avatar }} className="w-full h-full" /> : <GraduationCap size={14} color="#a79fd3" />}
                </View>
                <View className="flex-1">
                  <Text className="text-white text-sm">{item.username || item.fullName}</Text>
                  {!!item.role && item.role !== "member" && <Text className="text-brand-300 text-[10px] mt-0.5 uppercase">{item.role}</Text>}
                </View>
                {isAdmin && item.role !== "creator" && (
                  <View className="flex-row gap-2">
                    {item.role === "admin" ? (
                      <Pressable onPress={() => handleDemote(item._id || item.userId)} className="w-8 h-8 rounded-full bg-navy-700 items-center justify-center">
                        <Shield size={14} color="#4d5569" />
                      </Pressable>
                    ) : (
                      <Pressable onPress={() => handlePromote(item._id || item.userId)} className="w-8 h-8 rounded-full bg-brand-500/15 items-center justify-center">
                        <Shield size={14} color="#8478bb" />
                      </Pressable>
                    )}
                    <Pressable onPress={() => handleRemove(item._id || item.userId, item.username)} className="w-8 h-8 rounded-full bg-red-500/15 items-center justify-center">
                      <UserMinus size={14} color="#f87171" />
                    </Pressable>
                  </View>
                )}
              </View>
            )}
            ListEmptyComponent={<Text className="text-navy-400 text-center py-10">No members yet.</Text>}
          />
        )}

        {segment === "requests" && isAdmin && (
          <FlatList
            data={requests}
            keyExtractor={(item) => item._id}
            contentContainerClassName="px-4 py-3"
            renderItem={({ item }) => (
              <View className="flex-row items-center gap-3 py-2.5 border-b border-navy-800">
                <View className="w-9 h-9 rounded-full bg-navy-700 border border-navy-600 items-center justify-center overflow-hidden">
                  {item.user?.avatar ? <Image source={{ uri: item.user.avatar }} className="w-full h-full" /> : <GraduationCap size={14} color="#a79fd3" />}
                </View>
                <Text className="text-white text-sm flex-1">{item.user?.username || item.user?.fullName}</Text>
                <Pressable onPress={() => handleRespond(item._id, "accept")} className="w-9 h-9 rounded-full bg-green-500/15 items-center justify-center">
                  <Check size={16} color="#4ade80" />
                </Pressable>
                <Pressable onPress={() => handleRespond(item._id, "decline")} className="w-9 h-9 rounded-full bg-red-500/15 items-center justify-center">
                  <X size={16} color="#f87171" />
                </Pressable>
              </View>
            )}
            ListEmptyComponent={<Text className="text-navy-400 text-center py-10">No pending requests.</Text>}
          />
        )}

        <View className="px-4 pb-6 pt-2">
          <Button title={leaving ? "Leaving..." : "Leave Group"} onPress={handleLeave} variant="outline" loading={leaving} />
        </View>
      </View>
    </>
  );
}
