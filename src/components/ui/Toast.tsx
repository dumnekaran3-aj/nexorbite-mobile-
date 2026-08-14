import { View, Text } from "react-native";
import { useToastStore } from "@/store/toastStore";
import { Bell } from "lucide-react-native";

export default function Toast() {
  const message = useToastStore((s) => s.message);
  if (!message) return null;

  return (
    <View className="absolute top-14 left-4 right-4 z-50 flex-row items-center gap-2 bg-navy-800 border border-brand-500/40 rounded-2xl px-4 py-3 shadow-lg">
      <Bell size={15} color="#8478bb" />
      <Text className="text-white text-sm flex-1" numberOfLines={2}>{message}</Text>
    </View>
  );
}
