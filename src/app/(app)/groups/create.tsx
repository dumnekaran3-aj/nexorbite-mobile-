import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import * as groupsService from "@/services/groupsService";

export default function CreateGroupScreen() {
  const router = useRouter();
  const { collegeId } = useLocalSearchParams<{ collegeId?: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError("");
    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }
    setLoading(true);
    try {
      await groupsService.createGroup({ name: name.trim(), description: description.trim() }, collegeId);
      router.back();
    } catch (err: any) {
      setError(err.response?.data?.msg || "Couldn't create group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-navy-900" contentContainerClassName="px-6 py-16">
      <Text className="text-white text-xl font-bold mb-1">Create a group</Text>
      <Text className="text-navy-400 text-sm mb-6">Groups help classmates organize around a class, club, or topic.</Text>

      <View className="gap-3">
        <Input placeholder="Group name" value={name} onChangeText={setName} />
        <Input placeholder="Description (optional)" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
      </View>

      {!!error && <Text className="text-red-400 text-sm mt-3">{error}</Text>}

      <View className="mt-4">
        <Button title="Create Group" onPress={handleCreate} loading={loading} />
      </View>
    </ScrollView>
  );
}
