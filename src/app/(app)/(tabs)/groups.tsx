import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Users, Plus, Lock } from "lucide-react-native";
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
  const [joiningId, setJoiningId] = useState<string | null>(null);

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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleJoin = async (groupId: string) => {
    setJoiningId(groupId);
    try {
      await groupsService.joinGroup(groupId);
      load();
    } catch (err) {
      console.error("Join group error:", err);
    } finally {
      setJoiningId(null);
    }
  };

  const myGroupIds = new Set(myGroups.map((g) => g._id));
  const data = segment === "all" ? allGroups : myGroups;

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
          <Pressable
            onPress={() => router.push("/(app)/groups/create")}
            className="w-9 h-9 rounded-full bg-brand-500/15 border border-brand-500/40 items-center justify-center"
          >
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
          return (
            <Pressable
              onPress={() => router.push({ pathname: "/(app)/groups/[groupId]", params: { groupId: item._id } })}
              className="bg-navy-800 border border-navy-600 rounded-2xl p-4 mb-3"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-white font-bold text-[15px]">{item.name}</Text>
                  {!!item.description && (
                    <Text className="text-navy-400 text-sm mt-1" numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                  <View className="flex-row items-center gap-1.5 mt-2">
                    <Users size={13} color="#4d5569" />
                    <Text className="text-navy-400 text-xs">{item.memberDetails?.length || 0} members</Text>
                    {item.isPrivate && <Lock size={12} color="#4d5569" className="ml-1" />}
                  </View>
                </View>

                {!isMember && (
                  <Pressable
                    onPress={() => handleJoin(item._id)}
                    disabled={joiningId === item._id}
                    className="px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/40"
                  >
                    <Text className="text-brand-300 text-xs font-semibold">
                      {joiningId === item._id ? "..." : "Join"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View className="items-center py-20 px-6">
            <Text className="text-navy-400 text-center">
              {segment === "all" ? "No groups in your college yet." : "You haven't joined any groups yet."}
            </Text>
          </View>
        }
      />
    </View>
  );
}
