import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import React, { Fragment, useEffect, useState } from "react";
import { Alert, Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

  const dedupedPantryItems = dedupeItems(pantryItems);

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
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemText}>{item.name}</Text>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItemFromPantry(item.id)}>
                    <MaterialIcons name="delete-outline" size={22} color="#dc3545" />
                  </TouchableOpacity>
                </View>
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

      {/* Add Button */}
      <Animated.View style={[styles.addButton, { opacity: addButtonOpacity }]}>
        <TouchableOpacity onPress={() => router.push("/pantry/add-item")}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </Animated.View>

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
    bottom: 90,
    alignSelf: "flex-end",
    backgroundColor: "#36AF27",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 55,
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
});
