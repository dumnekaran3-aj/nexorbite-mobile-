import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Users, KeyRound, Plus } from "lucide-react-native";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import * as collegeService from "@/services/collegeService";
import { useCollegeStore } from "@/store/collegeStore";

type Mode = "choose" | "join" | "create";

export default function JoinCollegeScreen() {
  const router = useRouter();
  const setCollegeStatus = useCollegeStore((s) => s.setCollegeStatus);
  const [mode, setMode] = useState<Mode>("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [inviteCode, setInviteCode] = useState("");

  const [collegeName, setCollegeName] = useState("");
  const [university, setUniversity] = useState("");
  const [description, setDescription] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");

  const afterSuccess = async () => {
    const res = await collegeService.getCollegeStatus();
    setCollegeStatus(res.collegeStatus);
    router.replace("/(app)");
  };

  const handleJoin = async () => {
    setError("");
    if (!inviteCode.trim()) {
      setError("Enter the invite code your college gave you.");
      return;
    }
    setLoading(true);
    try {
      await collegeService.joinCollege(inviteCode.trim());
      await afterSuccess();
    } catch (err: any) {
      setError(err.response?.data?.msg || "Couldn't join. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setError("");
    if (!collegeName.trim() || !university.trim() || !description.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
     if (!collegeEmail.trim()) {
  setError("Please enter a college email.");
  setLoading(false);
  return;
}
await collegeService.createCollege({
  college_name: collegeName.trim(),
  college_email: collegeEmail.trim(),
  university: university.trim(),
  description: description.trim(),
});
      await afterSuccess();
    } catch (err: any) {
      setError(err.response?.data?.msg || "Couldn't create community. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "choose") {
    return (
      <View className="flex-1 bg-navy-900 justify-center px-6">
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-2xl bg-navy-700 items-center justify-center mb-4">
            <Users size={28} color="#8478bb" />
          </View>
          <Text className="text-white text-2xl font-bold tracking-tight text-center">
            Join your college community
          </Text>
          <Text className="text-navy-400 mt-2 text-center px-4">
            You need to be part of a college to see the feed, chat, and connect with classmates.
          </Text>
        </View>

        <Pressable
          onPress={() => setMode("join")}
          className="flex-row items-center gap-3 bg-navy-800 border border-navy-600 rounded-2xl p-4 mb-3"
        >
          <View className="w-10 h-10 rounded-full bg-brand-500/15 items-center justify-center">
            <KeyRound size={18} color="#8478bb" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold">I have an invite code</Text>
            <Text className="text-navy-400 text-xs mt-0.5">Join an existing college community</Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => setMode("create")}
          className="flex-row items-center gap-3 bg-navy-800 border border-navy-600 rounded-2xl p-4"
        >
          <View className="w-10 h-10 rounded-full bg-brand-500/15 items-center justify-center">
            <Plus size={18} color="#8478bb" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold">Create a new community</Text>
            <Text className="text-navy-400 text-xs mt-0.5">Set up your college for the first time</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  if (mode === "join") {
    return (
      <ScrollView className="flex-1 bg-navy-900" contentContainerClassName="px-6 py-16 justify-center flex-grow">
        <Text className="text-white text-xl font-bold mb-1">Enter invite code</Text>
        <Text className="text-navy-400 text-sm mb-6">Ask a classmate or your college admin for this.</Text>

        <Input placeholder="e.g. A1B2C3D4E5F6" value={inviteCode} onChangeText={setInviteCode} autoCapitalize="characters" />

        {!!error && <Text className="text-red-400 text-sm mt-3">{error}</Text>}

        <View className="mt-4">
          <Button title="Join Community" onPress={handleJoin} loading={loading} />
        </View>
        <Button title="Back" onPress={() => setMode("choose")} variant="outline" />
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-navy-900" contentContainerClassName="px-6 py-16 justify-center flex-grow">
      <Text className="text-white text-xl font-bold mb-1">Create your community</Text>
      <Text className="text-navy-400 text-sm mb-6">You'll become the owner of this college's space.</Text>

      <View className="gap-3">
        <Input placeholder="College name" value={collegeName} onChangeText={setCollegeName} />
        <Input placeholder="University" value={university} onChangeText={setUniversity} />
        <Input placeholder="College email" value={collegeEmail} onChangeText={setCollegeEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input placeholder="Short description" value={description} onChangeText={setDescription} multiline numberOfLines={3} />
      </View>

      {!!error && <Text className="text-red-400 text-sm mt-3">{error}</Text>}

      <View className="mt-4">
        <Button title="Create Community" onPress={handleCreate} loading={loading} />
      </View>
      <Button title="Back" onPress={() => setMode("choose")} variant="outline" />
    </ScrollView>
  );
}
