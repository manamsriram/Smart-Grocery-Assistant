import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { arrayUnion, collection, doc, getDocs, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { firestore } from "../../../firebaseConfig";
import TabBar from "../../components/TabBar";

type Item = {
  id: string;             
  name: string;           
  category: string;       
  quantity: string;      
  unit: string;           
  price: string;          
  expirationDate: string;  
};

export default function AddListItemScreen() {
  const router = useRouter();
  const [item, setItem] = useState<string>("");
  const [allItems, setAllItems] = useState<Item[]>([]);
  const { id: listId } = useLocalSearchParams<{ id: string }>();
  const filtered = !item
    ? []
    : allItems.filter((i) => i.name.toLowerCase().includes(item.toLowerCase()));

  useEffect(() => {
    async function fetchData() {
      const snapshot = await getDocs(collection(firestore, "items"));
      setAllItems(
        snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              name: doc.data().name as string,
              category: doc.data().category as string,
            }) as Item
        )
      );
    }
    fetchData();
  }, []);  

  async function addItemToCurrentList(item: Item) {
    if (!listId) return;
    const listRef = doc(firestore, "lists", listId);
    try {
      await updateDoc(listRef, {
        items: arrayUnion(item)
      });
      Alert.alert("Success", `${item.name} was added to your list.`);
    } catch (error) {
      console.warn("Failed to add item to current list:", error);
      Alert.alert("Error", "Failed to add item to your list. Please try again.");
    }
  }

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.iconLeft}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        {/* Search/Add Input */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={19} color="#aaa" />
          <TextInput
            style={styles.input}
            placeholder="Add new item"
            placeholderTextColor="#aaa"
            value={item}
            onChangeText={setItem}
            returnKeyType="done"
          />
          {!!item && (
            <TouchableOpacity onPress={() => setItem("")} style={styles.clearButton}>
              <MaterialIcons name="close" size={19} color="#aaa" />
            </TouchableOpacity>
          )}
        </View>

        {/* Camera Icon */}
        <TouchableOpacity style={styles.iconRight}>
          <Ionicons name="camera" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
      {filtered.map((item) => (
        <TouchableOpacity key={item.id} style={styles.resultRow} onPress={() => addItemToCurrentList(item)}>
          <Text style={styles.resultText}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>

      {/* Tab Bar */}
      <TabBar
        activeTab="Lists"
        onTabPress={(tab) => {
          if (tab === "Lists") return;
          if (tab === "Pantry") router.push("/pantry");
          if (tab === "Profile") router.push("/profile");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerBar: {
    width: "100%",
    backgroundColor: "#36AF27",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    paddingTop: 60,
  },
  iconLeft: {
    marginRight: 2,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 3,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 9,
    color: "#222",
  },
  clearButton: {
    padding: 2,
    marginLeft: 6,
  },
  iconRight: {
    marginLeft: 2,
  },  
  mainContent: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  resultRow: {
    borderBottomWidth: 1,
    borderColor: "#d7d7d7",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  resultText: {
    fontSize: 16,
    color: "#444",
  },
});
