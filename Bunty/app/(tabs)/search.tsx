import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Avatar from "../../src/components/Avatar";
import { searchUsers } from "../../src/services/userService";
import { User } from "../../src/types";
import { colors, spacing } from "../../src/styles/theme";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const users = await searchUsers(query.trim());
      setResults(users);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search by username..."
          placeholderTextColor={colors.placeholder}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          autoCapitalize="none"
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={colors.primary}
        />
      ) : searched && results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubText}>Try a different username</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userRow}
              onPress={() => router.push(`/user/${item.uid}`)}
            >
              <Avatar uri={item.avatarUrl} username={item.username} size={44} />
              <Text style={styles.username}>{item.username}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
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
  searchRow: {
    flexDirection: "row",
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBtnText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 14,
  },
  loader: {
    marginTop: spacing.xl,
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
  list: {
    padding: spacing.md,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
});
