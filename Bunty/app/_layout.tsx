import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";
import { colors } from "../src/styles/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.white,
            },
            headerTitleStyle: {
              fontWeight: "700",
            },
            headerShadowVisible: false,
            headerTintColor: colors.text,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="post/[id]" options={{ title: "Post" }} />
          <Stack.Screen name="user/[uid]" options={{ title: "Profile" }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
