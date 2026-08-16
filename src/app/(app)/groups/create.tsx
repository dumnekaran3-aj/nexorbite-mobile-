import { useState } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import * as groupsService from "@/services/groupsService";

export default function CreateGroupScreen() {
  const router = useRouter();
  const { collegeId } = useLocalSearchParams<{ collegeId?: string }>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      aspect: [1, 1],
      allowsEditing: true,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const handleCreate = async () => {
    setError("");
    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }
    setLoading(true);
    try {
      const res = await groupsService.createGroup({ name: name.trim(), description: description.trim() }, collegeId);
      const groupId = res.group?._id;

if (avatarUri && groupId) {
  try {
    await groupsService.uploadGroupAvatar(groupId, avatarUri);
  } catch (avatarErr: any) {
    console.error("AVATAR UPLOAD FAILED:", JSON.stringify(avatarErr.response?.data || avatarErr.message, null, 2));
  }
}

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

      <Pressable onPress={pickAvatar} className="self-center mb-6">
        <View className="w-20 h-20 rounded-2xl bg-brand-600 items-center justify-center overflow-hidden">
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} className="w-full h-full" />
          ) : (
            <Text className="text-white font-extrabold text-2xl">{name?.[0]?.toUpperCase() || "G"}</Text>
          )}
        </View>
        <View className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-navy-700 border-2 border-navy-900 items-center justify-center">
          <Camera size={12} color="#a79fd3" />
        </View>
      </Pressable>

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
