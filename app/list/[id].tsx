import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { arrayRemove, doc, onSnapshot, updateDoc } from "firebase/firestore";
import React, { Fragment, useEffect, useState } from "react";
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { firestore } from "../../firebaseConfig";
import BodySubtitle from "../components/BodySubtitle";
import BodyTitle from "../components/BodyTitle";
import Header from "../components/Header";
import TabBar from "../components/TabBar";

type Item = {
    id: string;             
    name: string;           
    category: string;       
    quantity: string;      
    unit: string;           
    price: string;          
    expirationDate: string;  
    completed?: boolean;
};

export default function ListDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);
    const [listItems, setListItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const hasItems = listItems.length > 0;
    const activeItems = listItems.filter(item => !item.completed);
    const completedItems = listItems.filter(item => item.completed);
    const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
    
    useEffect(() => {
        if (!id) return;
        const listRef = doc(firestore, "lists", id);
        // Subscribe to real-time updates for the list document
        const unsubscribe = onSnapshot(listRef, (listSnap) => {
            if (listSnap.exists()) {
            setListItems(listSnap.data().items || []);
            }
            setIsLoading(false);
        });
        // Clean up the subscriber when component unmounts or id changes
        return () => unsubscribe();
    }, [id]);

    // Group items by category (works even with all props present)
    const groupedActiveItems = activeItems.reduce<{ [cat: string]: Item[] }>((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    const groupedCompletedItems = completedItems.reduce<{ [cat: string]: Item[] }>((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {}); 

    async function deleteItem(item: Item) {
        if (!id) return;
        const listRef = doc(firestore, "lists", id);
        try {
            await updateDoc(listRef, {
                items: arrayRemove(item)
            });
        } catch (error) {
            console.error("Failed to delete item:", error);
        }
    };

    async function toggleItemCompletion(item: Item) {
        if (!id) return;
        const listRef = doc(firestore, "lists", id);

        try {
            const updatedItem = { ...item, completed: !item.completed };
            await updateDoc(listRef, {
                items: listItems.map(i => i.id === item.id ? updatedItem : i)
            });
        } catch (error) {
            console.error("Failed to update item:", error);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header
                title="New Grocery List"
                titleAlign="center"
                showLeftIcon
                showRightIcon
                onRightPress={() => setOptionsModalVisible(true)}
            />

            {/* Modal for Options */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={optionsModalVisible}
                onRequestClose={() => setOptionsModalVisible(false)}
                >
                <View style={styles.overlay}>
                    {/* overlay close tap */}
                    <TouchableOpacity style={styles.background} onPress={() => setOptionsModalVisible(false)} />   

                    <View style={styles.modalContainer}>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={()=> setOptionsModalVisible(false)}>
                            <Ionicons name="close" size={32} color="#979797" />
                        </TouchableOpacity>

                        {/* Options */}
                        <TouchableOpacity style={styles.option} onPress={() => {/* your logic */}}>
                            <MaterialIcons name="refresh" size={24} color="#8D8D90" />
                            <Text style={styles.optionText}>Uncheck all items</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.option} onPress={() => {/* your logic */}}>
                            <MaterialIcons name="done-all" size={24} color="#8D8D90" />
                            <Text style={styles.optionText}>Check off all items</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.option} onPress={() => { /* your logic */ }}>
                            <MaterialCommunityIcons name="cart-arrow-right" size={24} color="#8D8D90" />
                            <Text style={styles.optionText}>Move checked items to pantry</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.option} onPress={() => {/* your logic */}}>
                            <MaterialIcons name="delete-outline" size={24} color="#dc3545" />
                            <Text style={[styles.optionText, { color: "#dc3545" }]}>Delete all items</Text>
                        </TouchableOpacity>

                </View>     
            </View>
        </Modal>

        {hasItems ? (
            <ScrollView contentContainerStyle={styles.listContent}>
  {/* Tabs */}
  <View style={styles.tabHeader}>
    <TouchableOpacity onPress={() => setActiveTab("active")}>
      <Text style={activeTab === "active" ? styles.tabActive : styles.tabInactive}>Your list</Text>
      <Text style={activeTab === "active" ? styles.tabCountActive : styles.tabCountInactive}>
        {activeItems.length} Items
      </Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => setActiveTab("completed")}>
      <Text style={activeTab === "completed" ? styles.tabActive : styles.tabInactive}>Completed Items</Text>
      <Text style={activeTab === "completed" ? styles.tabCountActive : styles.tabCountInactive}>
        {completedItems.length} Items
      </Text>
    </TouchableOpacity>
  </View>

  {/* Render only the selected tab items */}
  {activeTab === "active" &&
    Object.entries(groupedActiveItems).map(([category, items]) => (
      <Fragment key={category}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemRow}
            onPress={() => toggleItemCompletion(item)}
          >
            <View style={[styles.circle, item.completed && styles.checkedCircle]}>
              {item.completed && <MaterialIcons name="check" size={16} color="#fff" />}
            </View>
            <Text style={styles.itemText}>{item.name}</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(item)}>
              <MaterialIcons name="delete-outline" size={22} color="#dc3545" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </Fragment>
    ))}

  {activeTab === "completed" &&
    Object.entries(groupedCompletedItems).map(([category, items]) => (
      <Fragment key={category}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemRow}
            onPress={() => toggleItemCompletion(item)}
          >
            <View style={[styles.circle, item.completed && styles.checkedCircle]}>
              {item.completed && <MaterialIcons name="check" size={16} color="#fff" />}
            </View>
            <Text style={[styles.itemText, { textDecorationLine: 'line-through', color: '#888' }]}>
              {item.name}
            </Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(item)}>
              <MaterialIcons name="delete-outline" size={22} color="#dc3545" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </Fragment>
    ))}
</ScrollView>

        ) : (
            <View style={styles.centeredContent}>
            <Image source={require("../../assets/cheese.png")} style={styles.illustration} resizeMode="contain" />
            <BodyTitle>Let’s plan your shopping</BodyTitle>
            <BodySubtitle>Tap the plus button to start adding products</BodySubtitle>
            <TouchableOpacity style={styles.scanBarcodesButton}>
                <Ionicons name="camera" size={20} color="#22c55e" />
                <Text style={styles.scanText}>Scan Barcodes</Text>
            </TouchableOpacity>
            </View>
        )}
        {/* Positioned absolutely - always visible */}
        <TouchableOpacity style={styles.addButton} onPress={() => router.push(`/list/${id}/add-list-item`)}>
            <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>

        {/* Tab Bar */}
        <TabBar
            activeTab="Lists"
            onTabPress={(tab) => {
            if (tab === "Lists") return;
            if (tab === "Profile") router.push("/profile");
            }}
        />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#F6F6F6" 
    },
    listContent: { 
        paddingBottom: 80 
    },
    tabHeader: {
        flexDirection: "row",
        backgroundColor: "#F6F6F6",
        justifyContent: "space-around",
        alignItems: "flex-end",
        gap: 8,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderColor: "#36AF27",
    },
    tabActive: { 
        color: "#36AF27",
        fontWeight: "600", 
        fontSize: 18 
    },
    tabInactive: { 
        color: "#888", 
        fontSize: 18, 
        fontWeight: "500" 
    },
    tabCountActive: { 
        color: "#36AF27", 
        fontSize: 13, 
        fontWeight: "400", 
        textAlign: "center" 
    },
    tabCountInactive: { 
        color: "#888", 
        fontSize: 13, 
        fontWeight: "400", 
        textAlign: "center" 
    },
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
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#E1E4E8",
        paddingHorizontal: 14,
    },
    circle: {
        height: 24,
        width: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#CBCBCB",
        marginRight: 20,
    },
    checkedCircle: {
        backgroundColor: "#36AF27",
        justifyContent: "center",
        alignItems: "center",
    },
    itemText: { 
        flex: 1, 
        fontSize: 16, 
        color: "#333" 
    },
    deleteButton: {
        padding: 4,
        marginLeft: 10
    },
    // Modal for options
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(32,32,32,0.3)",
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "transparent"
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 16, // Android-only property that controls the visual depth
    },  
    modalCloseButton: {
        position: "absolute",
        top: 18,
        right: 18,
        zIndex: 1,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 25,
        paddingLeft: 30,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        gap: 20,
    },
    optionText: {
        fontSize: 17,
        color: "#222",
        fontWeight: "500",
    },
    centeredContent: {
        marginTop: 50,
        alignItems: "center",
        justifyContent: "flex-start",
        flex: 1
    },
    illustration: {
        height: 210,
        width: 270,
        marginTop: 60,
    },
    scanBarcodesButton: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 28,
    },
    scanText: {
        fontSize: 16,
        color: "#36AF27",
        marginLeft: 6
    },
    addButton: {
        position: "absolute",
        bottom: 150,
        right: 50,
        alignSelf: "center",
        backgroundColor: "#36AF27",
        borderRadius: 999,
        paddingVertical: 16,
        paddingHorizontal: 35,
        marginBottom: 36,
        flexDirection: "row",
        alignItems: "center",
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 22
    },  
});
