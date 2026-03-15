import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/context/AuthContext";
import Avatar from "../../src/components/Avatar";
import {
  createOrGetChat,
  sendMessage,
  subscribeToMessages,
  markAsRead,
  Message,
} from "../../src/services/chatService";
import { getUserProfile } from "../../src/services/authService";
import { User } from "../../src/types";
import { colors, spacing } from "../../src/styles/theme";
import { formatDate } from "../../src/utils/formatDate";

export default function ChatScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const init = async () => {
      if (!user) return;
      try {
        const other = await getUserProfile(uid);
        setOtherUser(other);

        if (other) {
          navigation.setOptions({ title: other.username });
          const id = await createOrGetChat(
            user.uid,
            user.username,
            user.avatarUrl,
            other.uid,
            other.username,
            other.avatarUrl,
          );
          setChatId(id);
          await markAsRead(id, user.uid);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [uid, user]);

  useEffect(() => {
    if (!chatId) return;
    const unsubscribe = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    });
    return unsubscribe;
  }, [chatId]);

  const handleSend = async () => {
    if (!text.trim() || !chatId || !user || !otherUser) return;
    setSending(true);
    try {
      await sendMessage(chatId, user.uid, text.trim(), otherUser.uid);
      setText("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 80}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Avatar
                uri={otherUser?.avatarUrl}
                username={otherUser?.username || "?"}
                size={64}
              />
              <Text style={styles.emptyChatName}>{otherUser?.username}</Text>
              <Text style={styles.emptyChatText}>
                Say hello to {otherUser?.username}! 👋
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.senderId === user?.uid;
            return (
              <View
                style={[
                  styles.messageRow,
                  isMe ? styles.messageRowMe : styles.messageRowThem,
                ]}
              >
                {!isMe && (
                  <Avatar
                    uri={otherUser?.avatarUrl}
                    username={otherUser?.username || "?"}
                    size={28}
                  />
                )}
                <View
                  style={[
                    styles.bubble,
                    isMe ? styles.bubbleMe : styles.bubbleThem,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      isMe ? styles.bubbleTextMe : styles.bubbleTextThem,
                    ]}
                  >
                    {item.text}
                  </Text>
                  <Text
                    style={[
                      styles.bubbleTime,
                      isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem,
                    ]}
                  >
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={colors.placeholder}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={sending || !text.trim()}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.sendBtnText}>↑</Text>
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
  messageList: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: spacing.sm,
  },
  emptyChatName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptyChatText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  messageRowMe: {
    justifyContent: "flex-end",
  },
  messageRowThem: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: colors.white,
  },
  bubbleTextThem: {
    color: colors.text,
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 3,
  },
  bubbleTimeMe: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "right",
  },
  bubbleTimeThem: {
    color: colors.textSecondary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
    backgroundColor: colors.surface,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    backgroundColor: colors.placeholder,
  },
  sendBtnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
});
