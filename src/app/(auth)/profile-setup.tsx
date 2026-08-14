import { useState } from "react";
import { View, Text, ScrollView, Image, Pressable, Switch } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import * as profileService from "@/services/profileService";
import { useAuthStore } from "@/store/authStore";

const STREAMS = [
  "Computer Science",
  "Mechanical",
  "Electrical",
  "Designing",
  "Civil",
  "Common (Arts & Commerce)",
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [stream, setStream] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo library permission is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      aspect: [1, 1],
      allowsEditing: true,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("full_name", fullName);
      formData.append("bio", bio);
      formData.append("stream", stream);
      formData.append("isPrivate", String(isPrivate));
      if (avatarUri) {
        formData.append("avatar", {
          uri: avatarUri,
          name: "avatar.jpg",
          type: "image/jpeg",
        } as any);
      }

      const data = await profileService.updateProfile(formData);
      setUser(data.profile);
      router.replace("/(app)");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-navy-900" contentContainerClassName="px-6 py-16">
      <Text className="text-white text-2xl font-bold text-center mb-8">Complete Profile</Text>

      <Pressable onPress={pickAvatar} className="self-center mb-8">
        <View className="w-28 h-28 rounded-full bg-navy-700 border-2 border-brand-500 items-center justify-center overflow-hidden">
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} className="w-full h-full" />
          ) : (
            <Camera size={28} color="#a79fd3" />
          )}
        </View>
        <Text className="text-brand-300 text-xs text-center mt-2">Add photo</Text>
      </Pressable>

      <View className="gap-3">
        <Input placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Input placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <Input placeholder="Bio" value={bio} onChangeText={setBio} multiline numberOfLines={3} />

        <Text className="text-navy-400 text-sm mt-2">Stream</Text>
        <View className="flex-row flex-wrap gap-2">
          {STREAMS.map((s) => (
            <Pressable
              key={s}
              onPress={() => setStream(s)}
              className={
                stream === s
                  ? "px-3 py-2 rounded-full bg-brand-500 border border-brand-500"
                  : "px-3 py-2 rounded-full bg-navy-800 border border-navy-600"
              }
            >
              <Text className={stream === s ? "text-white text-xs font-semibold" : "text-navy-400 text-xs"}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row items-center justify-between mt-3 px-1">
          <Text className="text-navy-400 text-sm">Private profile</Text>
          <Switch value={isPrivate} onValueChange={setIsPrivate} trackColor={{ true: "#5b54a4" }} />
        </View>

        {!!error && <Text className="text-red-400 text-sm">{error}</Text>}

        <Button title="Complete Profile" onPress={handleSubmit} loading={loading} />
      </View>
    </ScrollView>
  );
}
