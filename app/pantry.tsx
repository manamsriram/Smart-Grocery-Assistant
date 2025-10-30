import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { Fragment, useEffect, useState } from "react";
import { Alert, Animated, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { firestore } from "../firebaseConfig";
import BodySubtitle from "./components/BodySubtitle";
import BodyTitle from "./components/BodyTitle";
import Header from "./components/Header";
import TabBar from "./components/TabBar";

type Item = {
  id: string;
  name: string;
  category: string;
  quantity: string;
  unit: string;
  price: string;
  expirationDate: string;
};

export default function PantryScreen() {
  const router = useRouter();
  const [pantryItems, setPantryItems] = useState<Item[]>([]);
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const addButtonOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.3],
    extrapolate: "clamp",
  });
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Item> | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<Item>>({});

  const onItemPress = (item: Item) => {
    setEditingItem(item);
    // Prefill editedValues with item data
    setEditedValues({
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      expirationDate: item.expirationDate
    });
    setDetailsModalVisible(true);
  }; 

  // Listen to a user pantry collection or single pantry doc
  useEffect(() => {
    // Change this to match your Firestore structure
    const pantryCol = collection(firestore, "pantry");
    const unsubscribe = onSnapshot(pantryCol, (snapshot) => {
      setPantryItems(
        snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              name: doc.data().name,
              category: doc.data().category,
              quantity: doc.data().quantity || "",
              unit: doc.data().unit || "",
              price: doc.data().price || "",
              expirationDate: doc.data().expirationDate || "",
            }) as Item
        )
      );
    });
    return () => unsubscribe();
  }, []);

  // Group pantry items by category
  const groupedPantryItems = pantryItems.reduce<{ [cat: string]: Item[] }>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

 async function deleteItemFromPantry(itemId: string) {
  try {
    await deleteDoc(doc(firestore, "pantry", itemId));
  } catch (error) {
    console.warn("Failed to delete item:", error);
    Alert.alert("Error", "Failed to delete item. Please try again.");
  }
}
  const hasItems = pantryItems.length > 0;

  function dedupeItems(items: Item[]) {
    const seen = new Set<string>();
    return items.filter(item => {
      const key = (item.name.trim().toLowerCase() || "") + "||" + (item.category.trim().toLowerCase() || "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const handleInputChange = (field: keyof Item, value: string) => {
    setEditedValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!editingItem) return;

    // Compose the new values over the old item
    const updatedItem: Item = {
      ...editingItem,
      ...editedValues,
      // always keep required fields and defaults
      id: editingItem.id!,
      name: editingItem.name!,
      category: editingItem.category!,
      quantity: editedValues.quantity ?? editingItem.quantity ?? "",
      unit: editedValues.unit ?? editingItem.unit ?? "",
      price: editedValues.price ?? editingItem.price ?? "",
      expirationDate: editedValues.expirationDate ?? editingItem.expirationDate ?? "",
    };

    try {
      // Update the document in Firestore
      await updateDoc(doc(firestore, "pantry", editingItem.id!), {
        ...updatedItem,
      });
      setDetailsModalVisible(false);
    } catch (error) {
      console.error("Failed to save pantry item:", error);
      Alert.alert("Error", "Failed to save item. Please try again.");
    }
  };

  function getItemDetailLine(item: Item) {
    const parts: string[] = [];
    // Price with $ prefix if not already present
    if (item.price && item.price.trim() !== "") {
      const price = item.price.startsWith("$") ? item.price : `$${item.price}`;
      parts.push(price);
    }
    // Quantity + Unit combined or individually
    if (item.quantity && item.quantity.trim() !== "" && item.unit && item.unit.trim() !== "") {
      parts.push(`${item.quantity} ${item.unit}`);
    } else if (item.quantity && item.quantity.trim() !== "") {
      parts.push(item.quantity);
    } else if (item.unit && item.unit.trim() !== "") {
      parts.push(item.unit);
    }
    // Expiration date if present
    if (item.expirationDate && item.expirationDate.trim() !== "") {
      parts.push(item.expirationDate);
    }
    return parts.join(" - ");
  }

  return (
    <View style={styles.container}>
      <Header title="My Pantry" titleAlign="left" />
      {hasItems ? (
        <Animated.ScrollView contentContainerStyle={styles.listContent}>
          {Object.entries(groupedPantryItems).map(([category, items]) => (
            <Fragment key={category}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>

              {items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemRow}
                  onPress={() => onItemPress(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemText}>{item.name}</Text>
                    {getItemDetailLine(item) !== "" && (
                      <Text style={styles.itemDetailText}>{getItemDetailLine(item)}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteItemFromPantry(item.id)}
                  >
                    <MaterialIcons name="delete-outline" size={22} color="#dc3545" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}

            </Fragment>
          ))}
        </Animated.ScrollView>
      ) : (
        <View style={styles.centeredContent}>
          <Image source={require("../assets/apple.png")} style={styles.illustration} resizeMode="contain" />
          <BodyTitle>Let’s plan your shopping</BodyTitle>
          <BodySubtitle>Tap the plus button to start adding products</BodySubtitle>
        </View>
      )}

      <Modal
        visible={detailsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.detailsModalOverlay}>
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.background} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.detailsModalContainer}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems:"center", marginBottom: 15 }}>
              <Text style={{ fontWeight: "bold", fontSize: 26 }}>{editingItem?.name}</Text>
              <TouchableOpacity onPress={handleSaveChanges}>
                <Text style={{ fontSize: 18, color: "#36AF27", fontWeight: "600" }}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1, marginRight: 5 }}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={styles.inputBoxText}
                  value={editedValues.quantity ?? ""}
                  onChangeText={(v) => handleInputChange("quantity", v)}
                  placeholder="1"
                  keyboardType="numeric"
                />
                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={styles.inputBoxText}
                  value={editedValues.price ?? ""}
                  onChangeText={(v) => handleInputChange("price", v.replace(/[^0-9.]/g, ""))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex:1, marginLeft: 5 }}>
                <Text style={styles.label}>Unit</Text>
                <TextInput
                  style={styles.inputBoxText}
                  value={editedValues.unit ?? ""}
                  onChangeText={(v) => handleInputChange("unit", v)}
                  placeholder="Unit"
                />
                <Text style={styles.label}>Expiration Date</Text>
                <TextInput
                  style={styles.inputBoxText}
                  value={editedValues.expirationDate ?? ""}
                  onChangeText={(v) => handleInputChange("expirationDate", v)}
                  placeholder="MM/DD/YYYY"
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Add Button */}
      <TouchableOpacity onPress={() => router.push("/pantry/add-item")}>
        <Animated.View style={[styles.addButton, { opacity: addButtonOpacity }]}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </Animated.View>
      </TouchableOpacity>

      <TabBar
        activeTab="Pantry"
        onTabPress={(tab) => {
          if (tab === "Pantry") return;
          if (tab === "Lists") router.push("/lists");
          if (tab === "Profile") router.push("/profile");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F6F6F6" },
  listContent: { paddingBottom: 80 },
  categoryHeader: {
    backgroundColor: "#36AF27",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  categoryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E1E4E8",
    paddingHorizontal: 14,
  },
  itemText: { flex: 1, fontSize: 16, color: "#333" },
  deleteButton: { padding: 4, marginLeft: 10 },
  centeredContent: {
    marginTop: 50,
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },
  illustration: {
    height: 210,
    width: 270,
    marginTop: 60,
  },
  addButton: {
    position: "absolute",
    bottom: 180,
    alignSelf: "flex-end",
    backgroundColor: "#36AF27",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 30,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 50,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
  },

  // Detail Item Modal
    detailsModalOverlay: {
        flex: 1,
        backgroundColor: "rgba(32,32,32,0.4)",
        justifyContent: "flex-end",
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "transparent"
    },
    detailsModalContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 22,
        paddingBottom: 28, 
    },
    label: {
        fontSize: 16,
        color: "#888",
        marginBottom: 10,
    },   
    inputBoxText: {
        fontSize: 18,
        color: "#222",
        borderRadius: 11,
        paddingVertical: 13,
        paddingHorizontal: 15,
        backgroundColor: "#f8f8f8",
        marginBottom: 40,
    },
    saveButton: {
        backgroundColor: "#36AF27",
        borderRadius: 28,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        marginTop: 5,
        marginBottom: 20,
    },
    itemDetailText: {
        fontSize: 15,
        color: "#888",
        marginTop: 3,
        marginLeft: 2,
    },
});
