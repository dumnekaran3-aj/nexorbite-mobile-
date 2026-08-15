
import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl, Image, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Users, Plus, Clock } from "lucide-react-native";
import * as groupsService from "@/services/groupsService";
import { useCollegeStore } from "@/store/collegeStore";

type Segment = "all" | "mine";
const CAN_CREATE_ROLES = ["teacher", "hod", "principal", "owner"];

export default function GroupsScreen() {
  const router = useRouter();
  const role = useCollegeStore((s) => s.role);
  const canCreate = CAN_CREATE_ROLES.includes(role || "");

  const [segment, setSegment] = useState<Segment>("all");
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [allRes, mineRes] = await Promise.all([groupsService.getGroups(), groupsService.getMyGroups()]);
      setAllGroups(allRes.groups || []);
      setMyGroups(mineRes.groups || []);
    } catch (err) {
      console.error("Groups load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const confirmRequestJoin = (group: any) => {
    Alert.alert(
      "Request to join?",
      `Your request to join "${group.name}" will be sent to the group admin for approval.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request",
          onPress: async () => {
            setBusyId(group._id);
            try {
              await groupsService.joinGroup(group._id);
            } catch (err) {
              console.error("Join request error:", err);
            } finally {
              setRequestedIds((prev) => new Set(prev).add(group._id));
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  const myGroupIds = new Set(myGroups.map((g) => g._id));
  const data = segment === "all" ? allGroups : myGroups;

  const openGroup = (item: any) => {
    if (myGroupIds.has(item._id)) {
      router.push({ pathname: "/(app)/groups/[groupId]", params: { groupId: item._id, groupName: item.name } });
    } else {
      confirmRequestJoin(item);
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
    <View className="flex-1 bg-navy-900">
      <View className="flex-row items-center justify-between px-4 pt-14 pb-2">
        <Text className="text-white text-xl font-bold tracking-tight">Groups</Text>
        {canCreate && (
          <Pressable onPress={() => router.push("/(app)/groups/create")} className="w-9 h-9 rounded-full bg-brand-500/15 border border-brand-500/40 items-center justify-center">
            <Plus size={18} color="#8478bb" />
          </Pressable>
        )}
      </View>

      <View className="flex-row border-b border-navy-700 mb-1">
        <Pressable onPress={() => setSegment("all")} className={segment === "all" ? "flex-1 items-center py-2.5 border-b-2 border-brand-500" : "flex-1 items-center py-2.5 border-b-2 border-transparent"}>
          <Text className={segment === "all" ? "text-white text-sm font-semibold" : "text-navy-400 text-sm"}>All Groups</Text>
        </Pressable>
        <Pressable onPress={() => setSegment("mine")} className={segment === "mine" ? "flex-1 items-center py-2.5 border-b-2 border-brand-500" : "flex-1 items-center py-2.5 border-b-2 border-transparent"}>
          <Text className={segment === "mine" ? "text-white text-sm font-semibold" : "text-navy-400 text-sm"}>My Groups ({myGroups.length})</Text>
        </Pressable>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8478bb" />}
        contentContainerClassName="px-4 py-3"
        renderItem={({ item }) => {
          const isMember = myGroupIds.has(item._id);
          const isRequested = requestedIds.has(item._id);
          return (
            <Pressable onPress={() => openGroup(item)} className="flex-row items-center gap-3 bg-navy-800 border border-navy-600 rounded-2xl p-3 mb-2.5">
              <View className="w-12 h-12 rounded-xl bg-brand-600/40 items-center justify-center overflow-hidden">
                {item.avatar ? <Image source={{ uri: item.avatar }} className="w-full h-full" /> : <Text className="text-white font-extrabold text-lg">{item.name?.[0]?.toUpperCase() || "G"}</Text>}
              </View>

              <View className="flex-1 min-w-0">
                <Text className="text-white font-semibold text-sm" numberOfLines={1}>{item.name}</Text>
                <Text className="text-navy-400 text-xs mt-0.5" numberOfLines={1}>{item.description || `${item.memberDetails?.length || 0} members`}</Text>
              </View>

              <View className="items-end gap-1">
                <Text className="text-[10px] text-navy-400">{item.memberDetails?.length || 0}/{item.maxMembers || 500}</Text>
                {!isMember && (
                  isRequested ? (
                    <View className="flex-row items-center gap-1 px-2.5 py-1 rounded-full bg-navy-700">
                      <Clock size={10} color="#4d5569" />
                      <Text className="text-navy-400 text-[10px] font-semibold">Requested</Text>
                    </View>
                  ) : (
                    <View className="px-2.5 py-1 rounded-full bg-brand-500/15 border border-brand-500/40">
                      <Text className="text-brand-300 text-[10px] font-semibold">{busyId === item._id ? "..." : "Ask to join"}</Text>
                    </View>
                  )
                )}
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-20 px-6">
            <Text className="text-navy-400 text-center">{segment === "all" ? "No groups in your college yet." : "You haven't joined any groups yet."}</Text>
          </View>
        }
      />
    </View>
  );
}
