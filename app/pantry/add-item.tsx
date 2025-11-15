import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { firestore } from "../../firebaseConfig";
import BarcodeScannerModal from "../components/BarcodeScannerModal";

type Item = {
  id: string;             
  name: string;           
  category: string;       
  quantity: string;      
  unit: string;           
  price: string;          
  expirationDate: string;  
};

export default function AddPantryItemScreen() {
  const router = useRouter();
  const [item, setItem] = useState<string>("");
  const [allItems, setAllItems] = useState<Item[]>([]);
  const filtered = !item
    ? []
    : allItems.filter((i) => i.name.toLowerCase().includes(item.toLowerCase()));
  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scanLockRef = React.useRef(false);
  
// Listen to pantry collection
useEffect(() => {
  async function fetchData() {
    const snapshot = await getDocs(collection(firestore, "items"));
    setAllItems(
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
  }
  fetchData();
}, []);

  async function addItemToPantry(item: Item) {
  // Query pantry by name and category
  const pantryCol = collection(firestore, "pantry");
  const q = query(
    pantryCol,
    where("name", "==", item.name),
    where("category", "==", item.category)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    setTimeout(() => {  // ← ADD setTimeout
        Alert.alert(
          "Already in pantry",
          `${item.name} is already in your pantry.`,
          [{ text: "OK", onPress: () => { scanLockRef.current = false; } }]  
        );
      }, 500);
    return;
  }

  try {
    const { id, ...pantryItem } = item;
    await addDoc(pantryCol, pantryItem);
    setTimeout(() => {  // ← ADD setTimeout
        Alert.alert(
          "Success",
          `${item.name} was added to your pantry.`,
          [{ text: "OK", onPress: () => { scanLockRef.current = false; } }]  // ← UNLOCK
        );
    }, 500);
  } catch (error) {
    console.warn("Failed to add item to pantry:", error);
    setTimeout(() => {  // ← ADD setTimeout
        Alert.alert(
          "Error",
          "Failed to add item to your pantry. Please try again.",
          [{ text: "OK", onPress: () => { scanLockRef.current = false; } }]  // ← UNLOCK
        );
    }, 500);
  }
}

  // Barcode Scanner Function
  const openScanner = async () => {
    scanLockRef.current = false;

    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Camera Permission Needed",
          "Please enable camera access to scan barcodes."
        );
        return;
      }
    }

    setScannerVisible(true);
  };

   const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanLockRef.current) return;
    scanLockRef.current = true;

    setScannerVisible(false);

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const result = await response.json();

      if (result.status === 1) {
        const product = result.product;

        const newItem: Item = {
          id: Date.now().toString(),
          name: product.product_name || "Unknown Product",
          category: product.categories_tags?.[0]?.replace("en:", "") || "Other",
          quantity: "1",
          unit: "",
          price: "",
          expirationDate: "",
        };

        await addItemToPantry(newItem);
        return;
      }

      setTimeout(() => {
        Alert.alert(
          "Not Found",
          `Barcode: ${data}\nThis item is not in the database. Add manually?`,
          [
            { text: "Cancel", style: "cancel", onPress: () => { scanLockRef.current = false; } },
            { text: "Add Manually", onPress: () => { scanLockRef.current = false; } },
          ]
        );
      }, 500);

    } catch (error) {
      console.error("Scan error:", error);
      setTimeout(() => {
        Alert.alert(
          "Error",
          "Unable to scan barcode. Try again.",
          [{ text: "OK", onPress: () => { scanLockRef.current = false; } }]
        );
      }, 500);
    }
  };

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
        <TouchableOpacity style={styles.iconRight} onPress={openScanner}>
          <Ionicons name="camera" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {filtered.map((item) => (
          <TouchableOpacity key={item.id} style={styles.resultRow} onPress={() => addItemToPantry(item)}>
            <Text style={styles.resultText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => {
          setScannerVisible(false);
          scanLockRef.current = false;
        }}
        permissionGranted={!!permission?.granted}
        onBarcodeScanned={handleBarCodeScanned}
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

