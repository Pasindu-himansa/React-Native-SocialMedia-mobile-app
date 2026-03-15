import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import Avatar from "../../src/components/Avatar";
import { subscribeToChats, Chat } from "../../src/services/chatService";
import { formatDate } from "../../src/utils/formatDate";
import { colors, spacing } from "../../src/styles/theme";

export default function ChatsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToChats(user.uid, (data) => {
      setChats(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {chats.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No chats yet</Text>
          <Text style={styles.emptySubText}>
            Search for a user and start chatting!
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const otherUid = item.participants.find(
              (p) => p !== user?.uid,
            ) as string;
            const otherName = item.participantNames[otherUid];
            const otherAvatar = item.participantAvatars[otherUid];
            const isUnread = item.unreadBy?.includes(user?.uid || "");

            return (
              <TouchableOpacity
                style={styles.chatRow}
                onPress={() => router.push(`/chat/${otherUid}`)}
              >
                <Avatar
                  uri={otherAvatar || undefined}
                  username={otherName}
                  size={48}
                />
                <View style={styles.chatInfo}>
                  <View style={styles.chatHeader}>
                    <Text style={styles.username}>{otherName}</Text>
                    <Text style={styles.time}>
                      {formatDate(item.lastMessageAt)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.lastMessage,
                      isUnread && styles.unreadMessage,
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage || "Say hello! 👋"}
                  </Text>
                </View>
                {isUnread && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  lastMessage: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  unreadMessage: {
    color: colors.text,
    fontWeight: "600",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
