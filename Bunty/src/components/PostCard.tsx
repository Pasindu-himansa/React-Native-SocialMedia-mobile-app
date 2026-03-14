import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Avatar from "./Avatar";
import HeartButton from "./HeartButton";
import { colors, spacing } from "../styles/theme";
import { formatDate } from "../utils/formatDate";
import { Post } from "../types";
import { toggleLike } from "../services/postService";
import { useAuth } from "../context/AuthContext";

interface PostCardProps {
  post: Post;
  onLikeToggle?: (postId: string) => void;
}

const { width } = Dimensions.get("window");

const PostCard = ({ post, onLikeToggle }: PostCardProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const liked = user ? post.likes.includes(user.uid) : false;

  const handleLike = async () => {
    if (!user) return;
    await toggleLike(post.id, user.uid, liked);
    onLikeToggle?.(post.id);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/post/${post.id}`)}
      activeOpacity={0.95}
    >
      <View style={styles.header}>
        <Avatar uri={post.avatarUrl} username={post.username} size={36} />
        <View style={styles.headerText}>
          <Text style={styles.username}>{post.username}</Text>
          <Text style={styles.time}>{formatDate(post.createdAt)}</Text>
        </View>
      </View>

      <Image
        source={{ uri: post.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.footer}>
        <HeartButton
          liked={liked}
          count={post.likes.length}
          onPress={handleLike}
        />
        <TouchableOpacity
          style={styles.commentBtn}
          onPress={() => router.push(`/post/${post.id}`)}
        >
          <Text style={styles.commentIcon}>💬</Text>
          <Text style={styles.commentCount}>{post.commentCount}</Text>
        </TouchableOpacity>
      </View>

      {post.caption ? (
        <View style={styles.captionRow}>
          <Text style={styles.captionUsername}>{post.username}</Text>
          <Text style={styles.caption}>{post.caption}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  image: {
    width: width,
    height: width,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  commentBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentIcon: {
    fontSize: 22,
  },
  commentCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  captionRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: 6,
    flexWrap: "wrap",
  },
  captionUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  caption: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
});

export default PostCard;
