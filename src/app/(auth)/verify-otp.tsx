import { useState, useRef } from "react";
import { View, Text, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Button from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import * as authService from "@/services/authService";

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const verifyEmail = useAuthStore((s) => s.verifyEmail);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    setError("");
    if (otp.length !== 6) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(email, otp);
      router.replace("/(auth)/profile-setup");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setResending(true);
    try {
      await authService.resendOtp(email);
      setInfo("A new code has been sent to your email.");
    } catch {
      setError("Could not resend code. Try again shortly.");
    } finally {
      setResending(false);
    }
  };

  return (
    <View className="flex-1 bg-navy-900 justify-center px-6">
      <View className="items-center mb-8">
        <View className="w-16 h-16 rounded-2xl bg-navy-700 items-center justify-center mb-4">
          <Text className="text-brand-400 text-3xl font-bold">Σ</Text>
        </View>
        <Text className="text-white text-2xl font-bold tracking-tight">Check your email</Text>
        <Text className="text-navy-400 mt-2 text-center px-4">
          We sent a 6-digit code to{"\n"}
          <Text className="text-white font-semibold">{email}</Text>
        </Text>
      </View>

      <TextInput
        value={otp}
        onChangeText={(v) => setOtp(v.replace(/[^0-9]/g, "").slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="000000"
        placeholderTextColor="#4d5569"
        className="bg-navy-800 border border-navy-600 rounded-2xl px-4 py-4 text-white text-center text-2xl tracking-[8px] font-bold"
      />

      {!!error && <Text className="text-red-400 text-sm text-center mt-3">{error}</Text>}
      {!!info && <Text className="text-green-400 text-sm text-center mt-3">{info}</Text>}

      <View className="mt-4">
        <Button title="Verify" onPress={handleVerify} loading={loading} />
      </View>

      <Button title={resending ? "Sending..." : "Resend code"} onPress={handleResend} variant="outline" />
    </View>
  );
}
