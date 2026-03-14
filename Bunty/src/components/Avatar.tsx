import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { colors, radius } from "../styles/theme";

interface AvatarProps {
  uri?: string;
  username: string;
  size?: number;
}

const Avatar = ({ uri, username, size = 36 }: AvatarProps) => {
  const initials = username.charAt(0).toUpperCase();

  return uri ? (
    <Image
      source={{ uri }}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    />
  ) : (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: colors.border,
  },
  placeholder: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: colors.white,
    fontWeight: "600",
  },
});

export default Avatar;
