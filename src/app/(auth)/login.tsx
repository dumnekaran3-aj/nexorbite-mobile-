import { useState } from "react";
import { View, Text } from "react-native";
import { Link, useRouter } from "expo-router";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {

      
       console.log("LOGIN ERROR STATUS:", err.response?.status);
  console.log("LOGIN ERROR DATA:", JSON.stringify(err.response?.data));
  console.log("REQUEST URL:", err.config?.baseURL, err.config?.url);

      if (err.response?.data?.needsVerification) {
        router.push({ pathname: "/(auth)/verify-otp", params: { email: email.trim() } });
        return;
      }
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
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
        <Text className="text-white text-2xl font-bold tracking-tight">NexOrbite</Text>
        <Text className="text-navy-400 mt-1">Sign in to continue</Text>
      </View>

      <View className="gap-3">
        <Input placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

        {!!error && <Text className="text-red-400 text-sm">{error}</Text>}

        <Button title="Log In" onPress={handleLogin} loading={loading} />
      </View>

      <Link href="/(auth)/register" className="text-brand-300 text-center mt-6">
        Don't have an account? Register
      </Link>
    </View>
  );
}
