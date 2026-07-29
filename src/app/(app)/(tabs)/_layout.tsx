import { Tabs } from "expo-router";
import { Newspaper, UsersRound, MessageCircle, UserCircle, Users } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#8478bb",
        tabBarInactiveTintColor: "#4d5569",
        tabBarStyle: { backgroundColor: "#0a0d16", borderTopColor: "#1c2338" },
      }}
    >
      <Tabs.Screen name="feed" options={{ title: "Feed", tabBarIcon: ({ color, size }) => <Newspaper color={color} size={size} /> }} />
      <Tabs.Screen name="groups" options={{ title: "Groups", tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
      <Tabs.Screen name="friends" options={{ title: "Friends", tabBarIcon: ({ color, size }) => <UsersRound color={color} size={size} /> }} />
      <Tabs.Screen name="chat" options={{ title: "Chat", tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <UserCircle color={color} size={size} /> }} />
    </Tabs>
  );
}
