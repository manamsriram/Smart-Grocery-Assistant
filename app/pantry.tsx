import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BodySubtitle from './components/BodySubtitle';
import BodyTitle from './components/BodyTitle';
import Header from './components/Header';
import TabBar from './components/TabBar';


export default function PantryScreen() {
    const router = useRouter();
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const addButtonOpacity = scrollY.interpolate({
        inputRange: [0, 150],
        outputRange: [1, 0.3],
        extrapolate: "clamp",
    });
  return (
    <View style={styles.container}>
        {/* Header */}
        <Header title="Pantry"/>

         <View style={styles.centeredContent}>
                <Image source={require("../assets/apple.png")} style={styles.illustration} resizeMode="contain" />
                <BodyTitle>Let’s plan your shopping</BodyTitle>
                <BodySubtitle>Tap the plus button to start adding products</BodySubtitle>
                <TouchableOpacity style={styles.scanBarcodesButton}>
                    <Ionicons name="camera" size={20} color="#22c55e" />
                    <Text style={styles.scanText}>Scan Barcodes</Text>
                </TouchableOpacity>
          </View>

          <Animated.View style={[styles.addButton, { opacity: addButtonOpacity }]}>
              <TouchableOpacity>
                  <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
          </Animated.View>

        {/* Tab Bar */}
        <TabBar
            activeTab="Pantry" // set dynamically per screen if needed
            onTabPress={(tab) => {
            if (tab === "Lists") router.push("/lists");;
            if (tab === "Pantry") return;
            // if (tab === "Recipes") router.push("/recipes");
            if (tab === "Profile") router.push("/profile");
            }}
        />
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#f6f6f6",
    justifyContent: "flex-start",
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
        