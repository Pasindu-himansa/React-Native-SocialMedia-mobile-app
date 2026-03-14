import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Avatar from "../../src/components/Avatar";
import { getUserProfile } from "../../src/services/authService";
import { getUserPosts } from "../../src/services/postService";
import { User, Post } from "../../src/types";
import { colors, spacing } from "../../src/styles/theme";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width / 3;

export default function UserProfileScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profile, userPosts] = await Promise.all([
          getUserProfile(uid),
          getUserPosts(uid),
        ]);
        setUser(profile);
        setPosts(userPosts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uid]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

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
      </View>

      {posts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No posts yet</Text>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
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
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  gridImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderWidth: 1,
    borderColor: colors.white,
  },
});
