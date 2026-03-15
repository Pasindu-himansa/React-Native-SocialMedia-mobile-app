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
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import { getUserPosts } from "../../src/services/postService";
import { logoutUser, updateUserAvatar } from "../../src/services/authService";
import { uploadImage } from "../../src/services/storageService";
import Avatar from "../../src/components/Avatar";
import { Post } from "../../src/types";
import { colors, spacing } from "../../src/styles/theme";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width / 3;

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserPosts(user.uid)
      .then(setPosts)
      .finally(() => setLoading(false));
  }, [user]);

  const handleAvatarPress = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && user) {
      setUploadingAvatar(true);
      try {
        const avatarUrl = await uploadImage(result.assets[0].uri);
        await updateUserAvatar(user.uid, avatarUrl);
        await refreshUser();
      } catch (error: any) {
        Alert.alert("Error", error.message);
      } finally {
        setUploadingAvatar(false);
      }
    }
  };

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
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.7}>
          <View>
            <Avatar uri={user.avatarUrl} username={user.username} size={72} />
            {uploadingAvatar ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator size="small" color={colors.white} />
              </View>
            ) : (
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>
                  <Ionicons name="pencil" size={12} color="green" />
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

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
    </SafeAreaView>
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
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 999,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBadgeText: {
    fontSize: 11,
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
