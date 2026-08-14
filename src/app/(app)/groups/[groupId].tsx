import { useState, useEffect } from "react";
import { View, Text, FlatList, Image, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { GraduationCap, Users } from "lucide-react-native";
import Button from "@/components/ui/Button";
import * as groupsService from "@/services/groupsService";

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    groupsService
      .getGroups()
      .then((res) => {
        const found = (res.groups || []).find((g: any) => g._id === groupId);
        setGroup(found || null);
      })
      .catch((err) => console.error("Group detail error:", err))
      .finally(() => setLoading(false));
  }, [groupId]);

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await groupsService.leaveGroup(groupId);
      router.back();
    } catch (err) {
      console.error("Leave group error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center">
        <ActivityIndicator color="#8478bb" />
      </View>
    );
  }

  if (!group) {
    return (
      <View className="flex-1 bg-navy-900 items-center justify-center px-6">
        <Text className="text-navy-400 text-center">This group isn't available.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: group.name,
          headerStyle: { backgroundColor: "#12172a" },
          headerTintColor: "#fff",
        }}
      />
      <View className="flex-1 bg-navy-900">
        <View className="px-5 py-5 border-b border-navy-700">
          <Text className="text-white text-xl font-bold">{group.name}</Text>
          {!!group.description && <Text className="text-navy-400 text-sm mt-2">{group.description}</Text>}
          <View className="flex-row items-center gap-1.5 mt-3">
            <Users size={14} color="#4d5569" />
            <Text className="text-navy-400 text-xs">{group.memberDetails?.length || 0} members</Text>
          </View>
        </View>

        <FlatList
          data={group.memberDetails || []}
          keyExtractor={(item) => item._id}
          contentContainerClassName="px-4 py-3"
          renderItem={({ item }) => (
            <View className="flex-row items-center gap-3 py-2.5 border-b border-navy-800">
              <View className="w-9 h-9 rounded-full bg-navy-700 border border-navy-600 items-center justify-center overflow-hidden">
                {item.avatar ? <Image source={{ uri: item.avatar }} className="w-full h-full" /> : <GraduationCap size={14} color="#a79fd3" />}
              </View>
              <Text className="text-white text-sm">{item.username}</Text>
            </View>
          )}
          ListEmptyComponent={<Text className="text-navy-400 text-center py-10">No members yet.</Text>}
        />

        <View className="px-4 pb-6 pt-2">
          <Button title="Leave Group" onPress={handleLeave} variant="outline" loading={actionLoading} />
        </View>
      </View>
    </>
  );
}
