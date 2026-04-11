import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "../src/components/Avatar";
import {
  searchUsers,
  searchPosts,
  searchHangouts,
} from "../src/services/userService";
import { User, Post, Place } from "../src/types";
import { colors, spacing } from "../src/styles/theme";

const { width } = Dimensions.get("window");

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hangouts, setHangouts] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setPosts([]);
      setHangouts([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        console.log("Searching for:", query);
        const [u, p, h] = await Promise.all([
          searchUsers(query.trim()),
          searchPosts(query.trim()),
          searchHangouts(query.trim()),
        ]);
        console.log(
          "Users:",
          u.length,
          "Posts:",
          p.length,
          "Hangouts:",
          h.length,
        );
        setUsers(u);
        setPosts(p);
        setHangouts(h);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults =
    users.length > 0 || posts.length > 0 || hangouts.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={18}
          color={colors.textSecondary}
        />
        <TextInput
          style={styles.input}
          placeholder="Search users, posts, hangouts..."
          placeholderTextColor={colors.placeholder}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <ActivityIndicator
          style={styles.loader}
          size="small"
          color={colors.primary}
        />
      )}

      {!loading && query.length > 0 && !hasResults && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No results for "{query}"</Text>
        </View>
      )}

      <FlatList
        data={[
          ...users.map((u) => ({ type: "user", data: u })),
          ...posts.map((p) => ({ type: "post", data: p })),
          ...hangouts.map((h) => ({ type: "hangout", data: h })),
        ]}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {users.length > 0 && (
              <Text style={styles.sectionTitle}>People</Text>
            )}
          </>
        }
        renderItem={({ item, index }) => {
          const prevType =
            index > 0
              ? [
                  ...users.map(() => "user"),
                  ...posts.map(() => "post"),
                  ...hangouts.map(() => "hangout"),
                ][index - 1]
              : null;

          return (
            <>
              {item.type === "post" && prevType !== "post" && (
                <Text style={styles.sectionTitle}>Posts</Text>
              )}
              {item.type === "hangout" && prevType !== "hangout" && (
                <Text style={styles.sectionTitle}>Hangouts</Text>
              )}

              {item.type === "user" && (
                <TouchableOpacity
                  style={styles.userRow}
                  onPress={() =>
                    router.push(`/user/${(item.data as User).uid}`)
                  }
                >
                  <Avatar
                    uri={(item.data as User).avatarUrl}
                    username={(item.data as User).username}
                    size={44}
                  />
                  <Text style={styles.username}>
                    {(item.data as User).username}
                  </Text>
                </TouchableOpacity>
              )}

              {item.type === "post" && (
                <TouchableOpacity
                  style={styles.postRow}
                  onPress={() => router.push(`/post/${(item.data as Post).id}`)}
                >
                  <Image
                    source={{ uri: (item.data as Post).imageUrl }}
                    style={styles.postThumb}
                  />
                  <View style={styles.postInfo}>
                    <Text style={styles.postUsername}>
                      {(item.data as Post).username}
                    </Text>
                    {(item.data as Post).caption ? (
                      <Text style={styles.postCaption} numberOfLines={2}>
                        {(item.data as Post).caption}
                      </Text>
                    ) : null}
                    {(item.data as Post).location ? (
                      <View style={styles.locationRow}>
                        <Ionicons
                          name="location-outline"
                          size={11}
                          color={colors.textSecondary}
                        />
                        <Text style={styles.locationText}>
                          {(item.data as Post).location}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              )}

              {item.type === "hangout" && (
                <TouchableOpacity
                  style={styles.hangoutRow}
                  onPress={() => router.push("/hangouts")}
                >
                  <View
                    style={[
                      styles.hangoutDot,
                      (item.data as Place).visited && styles.hangoutDotVisited,
                    ]}
                  />
                  <View style={styles.hangoutInfo}>
                    <Text style={styles.hangoutName}>
                      {(item.data as Place).name}
                    </Text>
                    {(item.data as Place).notes ? (
                      <Text style={styles.hangoutNotes} numberOfLines={1}>
                        {(item.data as Place).notes}
                      </Text>
                    ) : null}
                  </View>
                  {(item.data as Place).visited && (
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#2d8a4e"
                    />
                  )}
                </TouchableOpacity>
              )}
            </>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  loader: {
    marginTop: spacing.sm,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  postRow: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  postThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  postInfo: {
    flex: 1,
  },
  postUsername: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  postCaption: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  locationText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  hangoutRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hangoutDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  hangoutDotVisited: {
    backgroundColor: "#2d8a4e",
  },
  hangoutInfo: {
    flex: 1,
  },
  hangoutName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  hangoutNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
