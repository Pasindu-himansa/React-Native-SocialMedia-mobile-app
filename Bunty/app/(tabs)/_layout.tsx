import { Tabs } from "expo-router";
import { colors } from "../../src/styles/theme";
import { Ionicons } from "@expo/vector-icons";

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
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Bunty",
          tabBarLabel: "Feed",
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={28} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarLabel: "Search",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search-outline" size={28} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="new-post"
        options={{
          title: "New Post",
          tabBarLabel: "Post",
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle-outline" size={28} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={28} color="black" />
          ),
        }}
      />
    </Tabs>
  );
}

const TabIcon = ({ emoji, color }: { emoji: string; color: string }) => {
  const { Text } = require("react-native");
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
};
