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
  Dimensions,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { uploadImage } from "../../src/services/storageService";
import { createPost } from "../../src/services/postService";
import { colors, spacing } from "../../src/styles/theme";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
const { width } = Dimensions.get("window");

export default function NewPostScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    if (images.length >= 20) {
      Alert.alert("Limit reached", "You can only add up to 20 photos.");
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const detectLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Please allow location access.");
        return;
      }

      const coords = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: coords.coords.latitude,
        longitude: coords.coords.longitude,
      });

      if (geocode.length > 0) {
        const place = geocode[0];
        const locationStr = [place.city, place.country]
          .filter(Boolean)
          .join(", ");
        setLocation(locationStr);
      }
    } catch (error) {
      Alert.alert("Error", "Could not get location");
    } finally {
      setLoadingLocation(false);
    }
  };

  const handlePost = async () => {
    if (images.length === 0) {
      Alert.alert("No image", "Please select at least one photo.");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const uploadedUrls = await Promise.all(
        images.map((uri) => uploadImage(uri)),
      );
      await createPost(
        user.uid,
        user.username,
        uploadedUrls[0],
        caption,
        user.avatarUrl,
        location || undefined,
        uploadedUrls,
      );
      setImages([]);
      setCaption("");
      setLocation("");
      router.replace("/(tabs)/feed");
    } catch (error: any) {
      Alert.alert("Failed", error?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={150}
      contentContainerStyle={{ flexGrow: 1 }}
    >
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

        <View style={styles.locationRow}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Add a location..."
            placeholderTextColor={colors.placeholder}
            value={location}
            onChangeText={setLocation}
          />
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={detectLocation}
            disabled={loadingLocation}
          >
            {loadingLocation ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="location" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.imageSection}>
        {images.length > 0 && (
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.imageList}
            renderItem={({ item, index }) => (
              <View style={styles.imageThumb}>
                <Image source={{ uri: item }} style={styles.thumbImage} />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() =>
                    setImages(images.filter((_, i) => i !== index))
                  }
                >
                  <Ionicons
                    name="close-circle"
                    size={22}
                    color={colors.heart}
                  />
                </TouchableOpacity>
                {index === 0 && (
                  <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>Cover</Text>
                  </View>
                )}
              </View>
            )}
          />
        )}

        <TouchableOpacity style={styles.addPhotoBtn} onPress={pickImages}>
          <Ionicons
            name="camera-outline"
            size={28}
            color={colors.textSecondary}
          />
          <Text style={styles.addPhotoText}>
            {images.length === 0
              ? "Add Photos"
              : `Add More (${images.length}/20)`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TouchableOpacity
          style={[styles.button, images.length === 0 && styles.buttonDisabled]}
          onPress={handlePost}
          disabled={loading || images.length === 0}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>
              Share {images.length > 1 ? `(${images.length} photos)` : ""}
            </Text>
          )}
        </TouchableOpacity>

        {images.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setImages([])}
          >
            <Text style={styles.clearText}>Remove all photos</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  form: {
    padding: spacing.md,
    gap: spacing.sm,
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
    marginBottom: spacing.sm,
    minHeight: 50,
    textAlignVertical: "top",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  locationBtn: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
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
  ///////////////////////lscbsdb
  imageSection: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.md,
    minHeight: 350,
    justifyContent: "center",
  },
  imageList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  imageThumb: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: spacing.sm,
  },
  thumbImage: {
    width: 100,
    height: 100,
  },
  removeBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: colors.white,
    borderRadius: 11,
  },
  mainBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mainBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "600",
  },
  addPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addPhotoText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
