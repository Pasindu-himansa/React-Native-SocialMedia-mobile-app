import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/styles/theme";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

function SearchButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push("/search")}
      style={{ marginRight: 16 }}
    >
      <Ionicons name="search-outline" size={22} color={colors.text} />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.white,
        },
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerShadowVisible: false,
        headerRight: () => <SearchButton />,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Bunty",
          tabBarLabel: "Clix",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="rose-sharp" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hangouts"
        options={{
          title: "Hangouts",
          tabBarLabel: "Outs",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="new-post"
        options={{
          title: "New Post",
          tabBarLabel: "Post",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarLabel: "Chats",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-circle-outline"
              size={size + 2}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
