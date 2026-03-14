import React, { useEffect, useRef } from "react";
import { TouchableOpacity, Text, StyleSheet, Animated } from "react-native";
import { colors } from "../styles/theme";

interface HeartButtonProps {
  liked: boolean;
  count: number;
  onPress: () => void;
}

const HeartButton = ({ liked, count, onPress }: HeartButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (liked) {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.4,
          useNativeDriver: true,
          speed: 50,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
        }),
      ]).start();
    }
  }, [liked]);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Animated.Text style={[styles.heart, { transform: [{ scale }] }]}>
        {liked ? "❤️" : "🤍"}
      </Animated.Text>
      <Text style={styles.count}>{count}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heart: {
    fontSize: 22,
  },
  count: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
});

export default HeartButton;
