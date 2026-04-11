import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import {
  subscribeToHangouts,
  addHangout,
  completeHangout,
  updateHangout,
  deleteHangout,
} from "../../src/services/hangoutService";
import { Place } from "../../src/types";
import { colors, spacing } from "../../src/styles/theme";
import { useScrollToTop } from "@react-navigation/native";
import { useRef } from "react";

export default function HangoutsScreen() {
  const { user } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const [addVisible, setAddVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [editVisible, setEditVisible] = useState(false);
  const [editPlace, setEditPlace] = useState<Place | null>(null);
  const [editName, setEditName] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDate, setEditDate] = useState("");

  const [completeVisible, setCompleteVisible] = useState(false);
  const [completePlace, setCompletePlace] = useState<Place | null>(null);
  const [completeDate, setCompleteDate] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToHangouts((data) => {
      setPlaces(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "Please enter a place name");
      return;
    }
    setSaving(true);
    try {
      await addHangout(newName.trim(), newNotes.trim(), user?.uid || "");
      setNewName("");
      setNewNotes("");
      setAddVisible(false);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };
  const scrollRef = useRef<FlatList>(null);
  useScrollToTop(scrollRef);

  const handleComplete = async () => {
    if (!completePlace) return;
    if (!completeDate.trim()) {
      Alert.alert("Error", "Please enter a date");
      return;
    }
    setSaving(true);
    try {
      await completeHangout(completePlace.id, completeDate.trim());
      setCompleteVisible(false);
      setCompletePlace(null);
      setCompleteDate("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editPlace) return;
    if (!editName.trim()) {
      Alert.alert("Error", "Please enter a place name");
      return;
    }
    setSaving(true);
    try {
      await updateHangout(editPlace.id, {
        name: editName.trim(),
        notes: editNotes.trim(),
        visitedDate: editDate.trim() || undefined,
      });
      setEditVisible(false);
      setEditPlace(null);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (place: Place) => {
    Alert.alert("Delete", `Delete "${place.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHangout(place.id);
          } catch (error: any) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  const openEdit = (place: Place) => {
    setEditPlace(place);
    setEditName(place.name);
    setEditNotes(place.notes || "");
    setEditDate(place.visitedDate || "");
    setEditVisible(true);
  };

  const openComplete = (place: Place) => {
    setCompletePlace(place);
    setCompleteDate("");
    setCompleteVisible(true);
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
      <FlatList
        ref={scrollRef}
        data={places}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No hangouts yet!</Text>
            <Text style={styles.emptySubText}>
              Tap + to add your first place 🗺️
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, item.visited && styles.cardVisited]}>
            <View style={styles.cardContent}>
              <View style={styles.cardLeft}>
                <Text style={styles.placeName}>{item.name}</Text>
                {item.notes ? (
                  <Text style={styles.placeNotes}>{item.notes}</Text>
                ) : null}
                {item.visited && item.visitedDate ? (
                  <View style={styles.visitedRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={14}
                      color="#2d8a4e"
                    />
                    <Text style={styles.visitedDate}>{item.visitedDate}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => openEdit(item)}
                  style={styles.iconBtn}
                >
                  <Ionicons
                    name="pencil-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  style={styles.iconBtn}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.heart}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {!item.visited && (
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => openComplete(item)}
              >
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={colors.textSecondary}
                />
                <Text style={styles.completeBtnText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      {/* FAB Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddVisible(true)}>
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Add Modal */}
      <Modal
        visible={addVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "android" ? 30 : 0}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setAddVisible(false)}
          >
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Add a Hangout</Text>

              <Text style={styles.label}>Place Name</Text>
              <TextInput
                style={styles.input}
                placeholder="place ..."
                placeholderTextColor={colors.placeholder}
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                placeholder="notes here..."
                placeholderTextColor={colors.placeholder}
                value={newNotes}
                onChangeText={setNewNotes}
                multiline
              />

              <View style={styles.sheetButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setAddVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleAdd}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.saveText}>Add</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Complete Modal */}
      <Modal
        visible={completeVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCompleteVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setCompleteVisible(false)}
          >
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>
                Mark "{completePlace?.name}" as Visited
              </Text>

              <Text style={styles.label}>When did you visit?</Text>
              <TextInput
                style={styles.input}
                placeholder="Date DD/MM/YYYY ... "
                placeholderTextColor={colors.placeholder}
                value={completeDate}
                onChangeText={setCompleteDate}
              />

              <View style={styles.sheetButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setCompleteVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleComplete}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.saveText}>Done ✓</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
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
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setEditVisible(false)}
          >
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Edit Hangout</Text>

              <Text style={styles.label}>Place Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Place name..."
                placeholderTextColor={colors.placeholder}
                value={editName}
                onChangeText={setEditName}
              />

              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                placeholder="Any notes..."
                placeholderTextColor={colors.placeholder}
                value={editNotes}
                onChangeText={setEditNotes}
                multiline
              />

              {editPlace?.visited && (
                <>
                  <Text style={styles.label}>Visited Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. April 2026..."
                    placeholderTextColor={colors.placeholder}
                    value={editDate}
                    onChangeText={setEditDate}
                  />
                </>
              )}

              <View style={styles.sheetButtons}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleEdit}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.saveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
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
  list: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardVisited: {
    backgroundColor: "#f0faf4",
    borderColor: "#a8d5b5",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardLeft: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  placeNotes: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  visitedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  visitedDate: {
    fontSize: 12,
    color: "#2d8a4e",
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  iconBtn: {
    padding: 4,
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    alignSelf: "flex-end",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
  },
  completeBtnText: {
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    textAlignVertical: "top",
  },
  sheetButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    color: colors.text,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  saveText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: "600",
  },
});
