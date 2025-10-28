import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Header from "../components/Header";
import { TabBar } from "../components/TabBar";

export default function ListDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);

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


                {/* Delete */}
                <View>
                    <TouchableOpacity style={styles.deleteOption} onPress={() => {/* your logic */}}>
                        <MaterialIcons name="delete-outline" size={24} color="#dc3545" />
                        <Text style={styles.deleteText}>Delete all items</Text>
                    </TouchableOpacity>
                </View>
            </View>     
        </View>
    </Modal>


      {/* Illustration and messages */}
      <View style={styles.centeredContent}>
        <Image source={require("../../assets/cheese.png")} style={styles.illustration} resizeMode="contain" />
        <Text style={styles.mainText}>Let’s plan your shopping</Text>
        <Text style={styles.subText}>Tap the plus button to start adding products</Text>
        <TouchableOpacity style={styles.scanBarcodesButton}>
          <Ionicons name="camera" size={20} color="#22c55e" />
          <Text style={styles.scanText}>Scan Barcodes</Text>
        </TouchableOpacity>
        {/* Add Button */}
        <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>      

      {/* Tab Bar */}
        <TabBar
            activeTab="Lists" // set dynamically per screen if needed
            onTabPress={(tab) => {
                if (tab === "Lists") return;
                // if (tab === "Pantry") router.push("/pantry");
                // if (tab === "Recipes") router.push("/recipes");
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
        padding: 0,
        paddingTop: 0,
        paddingBottom: 12,
        marginBottom: 0,
        elevation: 16,
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
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        gap: 20,
    },
    optionText: {
        fontSize: 17,
        color: "#222",
        fontWeight: "500",
    },
    
    deleteOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        padding: 22,
    },
    deleteText: {
        fontSize: 17,
        color: "#dc3545",
        fontWeight: "600",
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
        marginBottom: 28 
    },
    mainText: { 
        fontSize: 19,
        fontWeight: "600", 
        marginBottom: 6, color: "#222" 
    },
    subText: { 
        color: "#6c6c6c", 
        fontSize: 15, 
        marginBottom: 18 
    },
    scanBarcodesButton: { 
        flexDirection: "row",
        alignItems: "center", 
        marginBottom: 28 
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
        paddingHorizontal: 58, 
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