import { Tabs } from "expo-router";
import { colors } from "../../src/styles/theme";

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
          title: "bunty",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarLabel: "Search",
          tabBarIcon: ({ color }) => <TabIcon emoji="🔍" color={color} />,
        }}
      />
      <Tabs.Screen
        name="new-post"
        options={{
          title: "New Post",
          tabBarLabel: "Post",
          tabBarIcon: ({ color }) => <TabIcon emoji="➕" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <TabIcon emoji="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}

const TabIcon = ({ emoji, color }: { emoji: string; color: string }) => {
  const { Text } = require("react-native");
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
};
