import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import * as authService from "@/services/authService";

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      await authService.register({ fullName, username, email, password });
      router.replace("/(auth)/login");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-navy-900" contentContainerClassName="px-6 py-16">
      <View className="items-center mb-10">
        <View className="w-16 h-16 rounded-2xl bg-navy-700 items-center justify-center mb-4">
          <Text className="text-brand-400 text-3xl font-bold">Σ</Text>
        </View>
        <Text className="text-white text-2xl font-bold tracking-tight">Create Account</Text>
        <Text className="text-navy-400 mt-1">Join NexOrbite</Text>
      </View>

      <View className="gap-3">
        <Input placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <Input placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

        {!!error && <Text className="text-red-400 text-sm">{error}</Text>}

        <Button title="Register" onPress={handleRegister} loading={loading} />
      </View>

      <Link href="/(auth)/login" className="text-brand-300 text-center mt-6">
        Already have an account? Log in
      </Link>
    </ScrollView>
  );
}
