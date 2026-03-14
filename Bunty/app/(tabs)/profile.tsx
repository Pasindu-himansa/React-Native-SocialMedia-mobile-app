import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { getUserPosts } from "../../src/services/postService";
import { logoutUser } from "../../src/services/authService";
import Avatar from "../../src/components/Avatar";
import { Post } from "../../src/types";
import { colors, spacing } from "../../src/styles/theme";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width / 3;

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserPosts(user.uid)
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logoutUser();
          router.replace("/");
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar uri={user.avatarUrl} username={user.username} size={72} />
        <View style={styles.headerInfo}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.postCount}>
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={colors.primary}
        />
      ) : posts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubText}>
            Tap ➕ to share your first photo!
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={3}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/post/${item.id}`)}>
              <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  postCount: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "500",
  },
  loader: {
    marginTop: spacing.xl,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  gridImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderWidth: 1,
    borderColor: colors.white,
  },
});
