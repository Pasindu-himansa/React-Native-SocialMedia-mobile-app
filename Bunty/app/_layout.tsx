import { useEffect, useRef } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "../src/styles/theme";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { Vibration } from "react-native";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const lastBuzzRef = useRef<number>(0);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, "buzz", "latest"), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();

      // Only vibrate if buzz is from someone else and is recent (last 5 seconds)
      if (
        data.from !== user.uid &&
        data.timestamp > lastBuzzRef.current &&
        Date.now() - data.timestamp < 5000
      ) {
        lastBuzzRef.current = data.timestamp;
        Vibration.vibrate(400);
      }
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(tabs)";

    if (user && !inAuthGroup) {
      router.replace("/(tabs)/feed");
    } else if (!user && inAuthGroup) {
      router.replace("/");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
        headerTintColor: colors.text,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="post/[id]" options={{ title: "Post" }} />
      <Stack.Screen name="user/[uid]" options={{ title: "Profile" }} />
      <Stack.Screen name="chat/[uid]" options={{ title: "Chat" }} />
      <Stack.Screen name="search" options={{ title: "Search" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.white} />
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
