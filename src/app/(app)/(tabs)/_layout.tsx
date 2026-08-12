import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Newspaper, UsersRound, MessageCircle, UserCircle, Users } from "lucide-react-native";
import { useFriendsStore } from "@/store/friendsStore";
import { useChatStore } from "@/store/chatStore";

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <View className="absolute -top-1 -right-2.5 bg-red-500 rounded-full min-w-[16px] h-4 items-center justify-center px-1">
      <Text className="text-white text-[9px] font-bold">{count > 9 ? "9+" : count}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const incomingCount = useFriendsStore((s) => s.incomingCount);
  const chats = useChatStore((s) => s.chats);
  const unreadTotal = chats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#8478bb",
        tabBarInactiveTintColor: "#4d5569",
        tabBarStyle: { backgroundColor: "#0a0d16", borderTopColor: "#1c2338" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Feed", tabBarIcon: ({ color, size }) => <Newspaper color={color} size={size} /> }} />
      <Tabs.Screen name="groups" options={{ title: "Groups", tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }} />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color, size }) => (
            <View><UsersRound color={color} size={size} /><Badge count={incomingCount} /></View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <View><MessageCircle color={color} size={size} /><Badge count={unreadTotal} /></View>
          ),
        }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <UserCircle color={color} size={size} /> }} />
    </Tabs>
  );
}
