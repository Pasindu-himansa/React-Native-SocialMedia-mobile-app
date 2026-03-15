import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import Avatar from "../../src/components/Avatar";
import CommentComponent from "../../src/components/Comment";
import HeartButton from "../../src/components/HeartButton";
import {
  getPostById,
  getComments,
  addComment,
  toggleLike,
} from "../../src/services/postService";
import { Post, Comment } from "../../src/types";
import { colors, spacing } from "../../src/styles/theme";
import { formatDate } from "../../src/utils/formatDate";

const { width } = Dimensions.get("window");

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      const [postData, commentsData] = await Promise.all([
        getPostById(id),
        getComments(id),
      ]);
      setPost(postData);
      setComments(commentsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user || !post) return;
    const liked = post.likes.includes(user.uid);
    await toggleLike(post.id, user.uid, liked);
    const updated = await getPostById(post.id);
    setPost(updated);
  };

  const handleComment = async () => {
    if (!commentText.trim() || !user || !post) return;
    setPosting(true);
    try {
      await addComment(
        post.id,
        user.uid,
        user.username,
        commentText.trim(),
        user.avatarUrl,
      );
      setCommentText("");
      const updated = await getComments(post.id);
      setComments(updated);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  const liked = user ? post.likes.includes(user.uid) : false;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 80}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CommentComponent comment={item} />}
          ListHeaderComponent={
            <View>
              <View style={styles.postHeader}>
                <Avatar
                  uri={post.avatarUrl}
                  username={post.username}
                  size={36}
                />
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

              <View style={styles.actions}>
                <HeartButton
                  liked={liked}
                  count={post.likes.length}
                  onPress={handleLike}
                />
              </View>

              {post.caption ? (
                <View style={styles.captionRow}>
                  <Text style={styles.captionUsername}>{post.username}</Text>
                  <Text style={styles.caption}>{post.caption}</Text>
                </View>
              ) : null}

              <Text style={styles.commentsLabel}>Comments</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.noComments}>No comments yet</Text>
          }
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.inputRow}>
          <Avatar
            uri={user?.avatarUrl}
            username={user?.username || "?"}
            size={32}
          />
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={colors.placeholder}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity
            onPress={handleComment}
            disabled={posting || !commentText.trim()}
          >
            {posting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text
                style={[
                  styles.postBtn,
                  !commentText.trim() && styles.postBtnDisabled,
                ]}
              >
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  postHeader: {
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
  },
  image: {
    width: width,
    height: width,
    alignSelf: "center",
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  captionRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
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
  commentsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listContent: {
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  noComments: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.lg,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    maxHeight: 80,
    paddingVertical: spacing.sm,
  },
  postBtn: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  postBtnDisabled: {
    color: colors.placeholder,
  },
});
