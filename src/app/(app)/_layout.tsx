import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="chat/[chatId]"
        options={{ headerShown: true, headerStyle: { backgroundColor: "#12172a" }, headerTintColor: "#fff" }}
      />
      <Stack.Screen
        name="groups/[groupId]"
        options={{ headerShown: true, headerStyle: { backgroundColor: "#12172a" }, headerTintColor: "#fff" }}
      />
      <Stack.Screen
        name="friends/public-profile/[userId]"
        options={{ headerShown: true, headerStyle: { backgroundColor: "#12172a" }, headerTintColor: "#fff" }}
      />
    </Stack>
  );
}
