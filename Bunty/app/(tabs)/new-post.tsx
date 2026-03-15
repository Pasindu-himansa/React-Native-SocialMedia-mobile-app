import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { uploadImage } from "../../src/services/storageService";
import { createPost } from "../../src/services/postService";
import { colors, spacing } from "../../src/styles/theme";
import { Ionicons } from "@expo/vector-icons";

export default function NewPostScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!image) {
      Alert.alert("No image", "Please select a photo first.");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const imageUrl = await uploadImage(image);
      await createPost(
        user.uid,
        user.username,
        imageUrl,
        caption,
        user.avatarUrl,
      );
      setImage(null);
      setCaption("");
      router.replace("/(tabs)/feed");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>
              <Ionicons name="camera" size={50} color="#2c2727" />
            </Text>
            <Text style={styles.placeholderText}>Tap to select a photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Write a caption..."
          placeholderTextColor={colors.placeholder}
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={300}
        />

        <TouchableOpacity
          style={[styles.button, !image && styles.buttonDisabled]}
          onPress={handlePost}
          disabled={loading || !image}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Share</Text>
          )}
        </TouchableOpacity>

        {image && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setImage(null)}
          >
            <Text style={styles.clearText}>Remove photo</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imagePicker: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  placeholderIcon: {
    fontSize: 48,
  },
  placeholderText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  form: {
    padding: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    minHeight: 80,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: colors.placeholder,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  clearButton: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  clearText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
