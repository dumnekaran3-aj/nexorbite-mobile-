import { Pressable, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "solid" | "outline";
}

export default function Button({ title, onPress, loading, variant = "solid" }: ButtonProps) {
  const isSolid = variant === "solid";
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className={
        isSolid
          ? "bg-brand-500 rounded-full py-3.5 items-center active:bg-brand-600"
          : "border border-brand-500/40 bg-brand-500/10 rounded-full py-3.5 items-center active:bg-brand-500/20"
      }
    >
      {loading ? (
        <ActivityIndicator color={isSolid ? "#fff" : "#8478bb"} />
      ) : (
        <Text className={isSolid ? "text-white font-semibold" : "text-brand-300 font-semibold"}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}