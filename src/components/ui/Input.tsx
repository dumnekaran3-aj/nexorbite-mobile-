import { useState } from "react";
import { View, TextInput, TextInputProps, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

export default function Input(props: TextInputProps) {
  const [hidden, setHidden] = useState(!!props.secureTextEntry);

  if (!props.secureTextEntry) {
    return (
      <TextInput
        placeholderTextColor="#4d5569"
        className="bg-navy-800 border border-navy-600 rounded-2xl px-4 py-3.5 text-white"
        {...props}
      />
    );
  }

  return (
    <View className="bg-navy-800 border border-navy-600 rounded-2xl flex-row items-center pr-3">
      <TextInput
        placeholderTextColor="#4d5569"
        className="flex-1 px-4 py-3.5 text-white"
        {...props}
        secureTextEntry={hidden}
      />
      <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
        {hidden ? <Eye size={18} color="#4d5569" /> : <EyeOff size={18} color="#4d5569" />}
      </Pressable>
    </View>
  );
}
