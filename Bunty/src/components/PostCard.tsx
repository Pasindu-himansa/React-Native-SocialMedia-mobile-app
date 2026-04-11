import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  GestureResponderEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "./Avatar";
import HeartButton from "./HeartButton";
import { colors, spacing } from "../styles/theme";
import { formatDate } from "../utils/formatDate";
import { Post } from "../types";
import { toggleLike, updatePost, deletePost } from "../services/postService";
import { useAuth } from "../context/AuthContext";

interface PostCardProps {
  post: Post;
  onLikeToggle?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onUpdate?: (postId: string) => void;
}
const HeartImage = require("../../assets/images/lips-01.png");
const { width } = Dimensions.get("window");

const PostCard = ({
  post,
  onLikeToggle,
  onDelete,
  onUpdate,
}: PostCardProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const liked = user ? post.likes.includes(user.uid) : false;
  const isOwner = user?.uid === post.userId;

  const [menuVisible, setMenuVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption || "");
  const [editLocation, setEditLocation] = useState(post.location || "");
  const [saving, setSaving] = useState(false);
  const [heartVisible, setHeartVisible] = useState(false);
  const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const lastTap = useRef<number>(0);

  const handleLike = async () => {
    if (!user) return;
    await toggleLike(post.id, user.uid, liked);
    onLikeToggle?.(post.id);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await updatePost(post.id, {
        caption: editCaption,
        location: editLocation,
      });
      setEditVisible(false);
      onUpdate?.(post.id);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost(post.id);
            onDelete?.(post.id);
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const handleImageDoubleTap = (event: GestureResponderEvent) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap detected
      const { locationX, locationY } = event.nativeEvent;
      setHeartPosition({ x: locationX, y: locationY });
      setHeartVisible(true);

      // Like the post
      if (!liked) {
        handleLike();
      }

      // Animate heart
      heartScale.setValue(0);
      heartOpacity.setValue(1);

      Animated.sequence([
        Animated.spring(heartScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 15,
        }),
        Animated.delay(400),
        Animated.timing(heartOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setHeartVisible(false));
    }
    lastTap.current = now;
  };

  return (
    <View style={styles.container}>
      {/* Header - tappable to go to profile */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => router.push(`/user/${post.userId}`)}
        activeOpacity={0.7}
      >
        <Avatar uri={post.avatarUrl} username={post.username} size={36} />
        <View style={styles.headerText}>
          <Text style={styles.username}>{post.username}</Text>
          {post.location ? (
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={11}
                color={colors.textSecondary}
              />
              <Text style={styles.location}>{post.location}</Text>
            </View>
          ) : (
            <Text style={styles.time}>{formatDate(post.createdAt)}</Text>
          )}
        </View>
        {post.location ? (
          <Text style={styles.timeRight}>{formatDate(post.createdAt)}</Text>
        ) : null}
      </TouchableOpacity>

      {/* Image */}

      {post.images && post.images.length > 1 ? (
        <View onTouchEnd={handleImageDoubleTap}>
          <FlatList
            data={post.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          />
          <View style={styles.imageDots}>
            {post.images.map((_, i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>
          {heartVisible && (
            <Animated.View
              style={[
                styles.floatingHeart,
                {
                  left: heartPosition.x - 75,
                  top: heartPosition.y - 75,
                  transform: [{ scale: heartScale }],
                  opacity: heartOpacity,
                },
              ]}
            >
              <Image
                source={HeartImage}
                style={{ width: 150, height: 150 }}
                resizeMode="contain"
              />
            </Animated.View>
          )}
        </View>
      ) : (
        // single image stays the same with TouchableOpacity
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleImageDoubleTap}
          style={{ position: "relative" }}
        >
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          {heartVisible && (
            <Animated.View
              style={[
                styles.floatingHeart,
                {
                  left: heartPosition.x - 75,
                  top: heartPosition.y - 75,
                  transform: [{ scale: heartScale }],
                  opacity: heartOpacity,
                },
              ]}
            >
              <Image
                source={HeartImage}
                style={{ width: 150, height: 150 }}
                resizeMode="contain"
              />
            </Animated.View>
          )}
        </TouchableOpacity>
      )}

      {/* Footer */}
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
          <Ionicons
            name="chatbubble-outline"
            size={22}
            color={colors.textSecondary}
          />
          <Text style={styles.commentCount}>{post.commentCount}</Text>
        </TouchableOpacity>

        {isOwner && (
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => setMenuVisible(true)}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {post.caption ? (
        <View style={styles.captionRow}>
          <Text style={styles.captionUsername}>{post.username}</Text>
          <Text style={styles.caption}>{post.caption}</Text>
        </View>
      ) : null}

      {/* Options Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuSheet}>
            <View style={styles.menuHandle} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setEditCaption(post.caption || "");
                setEditLocation(post.location || "");
                setEditVisible(true);
              }}
            >
              <Ionicons name="pencil-outline" size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Edit Caption & Location</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleDelete();
              }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.heart} />
              <Text style={[styles.menuItemText, { color: colors.heart }]}>
                Delete Post
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuCancel]}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.menuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.editOverlay}>
            <View style={styles.editSheet}>
              <Text style={styles.editTitle}>Edit Post</Text>

              <Text style={styles.editLabel}>Caption</Text>
              <TextInput
                style={styles.editInput}
                value={editCaption}
                onChangeText={setEditCaption}
                multiline
                maxLength={300}
                placeholder="Write a caption..."
                placeholderTextColor={colors.placeholder}
              />

              <Text style={styles.editLabel}>Location</Text>
              <TextInput
                style={styles.editInput}
                value={editLocation}
                onChangeText={setEditLocation}
                placeholder="Add a location..."
                placeholderTextColor={colors.placeholder}
              />

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.editCancelBtn}
                  onPress={() => setEditVisible(false)}
                >
                  <Text style={styles.editCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editSaveBtn}
                  onPress={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.editSaveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
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
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 1,
  },
  location: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  timeRight: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  image: {
    width: width,
    height: width,
    alignSelf: "center",
  },
  imageDots: {
    position: "absolute",
    bottom: spacing.sm,
    alignSelf: "center",
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
    opacity: 0.8,
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
  commentCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  moreBtn: {
    marginLeft: "auto",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  menuSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text,
  },
  menuCancel: {
    justifyContent: "center",
    borderBottomWidth: 0,
    marginTop: spacing.sm,
  },
  menuCancelText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    width: "100%",
  },
  editOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  editSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  editInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    minHeight: 48,
  },
  editButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  editCancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  editCancelText: {
    fontSize: 15,
    color: colors.text,
  },
  editSaveBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  editSaveText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: "600",
  },
  floatingHeart: {
    position: "absolute",
    zIndex: 999,
  },
});

export default PostCard;
