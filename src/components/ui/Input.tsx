import { TextInput, TextInputProps } from "react-native";

export default function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#4d5569"
      className="bg-navy-800 border border-navy-600 rounded-2xl px-4 py-3.5 text-white"
      {...props}
    />
  );
}