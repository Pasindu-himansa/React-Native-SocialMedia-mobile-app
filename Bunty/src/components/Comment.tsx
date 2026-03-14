import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Avatar from "./Avatar";
import { colors, spacing } from "../styles/theme";
import { formatDate } from "../utils/formatDate";
import { Comment as CommentType } from "../types";

interface CommentProps {
  comment: CommentType;
}

const Comment = ({ comment }: CommentProps) => {
  return (
    <View style={styles.container}>
      <Avatar uri={comment.avatarUrl} username={comment.username} size={32} />
      <View style={styles.content}>
        <View style={styles.bubble}>
          <Text style={styles.username}>{comment.username}</Text>
          <Text style={styles.text}>{comment.text}</Text>
        </View>
        <Text style={styles.time}>{formatDate(comment.createdAt)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  username: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  text: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    marginLeft: spacing.sm,
  },
});

export default Comment;
