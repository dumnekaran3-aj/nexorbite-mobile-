import { useState } from "react";
import { View, Text } from "react-native";
import { Link, useRouter } from "expo-router";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    setError("");
    if (!username.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      router.replace({ pathname: "/(auth)/verify-otp", params: { email: email.trim() } });
    } catch (err: any) {
      setError(err.response?.data?.msg || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-navy-900 justify-center px-6">
      <View className="items-center mb-10">
        <View className="w-16 h-16 rounded-2xl bg-navy-700 items-center justify-center mb-4">
          <Text className="text-brand-400 text-3xl font-bold">Σ</Text>
        </View>
        <Text className="text-white text-2xl font-bold tracking-tight">Create Account</Text>
        <Text className="text-navy-400 mt-1 text-center">A verification code will be sent to your email</Text>
      </View>

      <View className="gap-3">
        <Input placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

        {!!error && <Text className="text-red-400 text-sm">{error}</Text>}

        <Button title="Continue" onPress={handleRegister} loading={loading} />
      </View>

      <Link href="/(auth)/login" className="text-brand-300 text-center mt-6">
        Already have an account? Log in
      </Link>
    </View>
  );
}
