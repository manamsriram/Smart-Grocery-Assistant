import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { firestore } from "../firebaseConfig";
import TabBar from "./components/TabBar";

const SPOONACULAR_API_KEY = "cb11c1f40950476785ea9a00368c000d";

const filters = [
  { label: "All", key: "all" },
  { label: "Healthy", key: "healthy" },
  { label: "Quick", key: "quick" },
  { label: "Budget", key: "budget" },
  { label: "Uses Expiring", key: "expiring" },
];

export default function RecipesScreen() {
    const router = useRouter()
    const [activeFilter, setActiveFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [pantryItems, setPantryItems] = useState<string[]>([]);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);


  // Fetch items in pantry from Firestore
  useEffect(() => {
    async function fetchPantry() {
      const snap = await getDocs(collection(firestore, "pantry"));
      setPantryItems(
        snap.docs.map(doc => doc.data().name).filter(Boolean)
      );
    }
    fetchPantry();
  }, []);

  // Fetch recipes from API when pantry updates
  useEffect(() => {
    if (pantryItems.length === 0) return;
    async function fetchRecipes() {
      setLoading(true);
      const ingredientsParam = encodeURIComponent(pantryItems.join(","));
      // You can adjust number=10 to return more results
      const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientsParam}&number=10&apiKey=${SPOONACULAR_API_KEY}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        setRecipes(data);
      } catch (e) {
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipes();
  }, [pantryItems]);

  // Filter and search logic (Spoonacular response has no "label" field, so adapt these as needed)
  const filteredRecipes =
  activeFilter === "all"
    ? recipes || []
    : recipes.filter(r =>
        (r.badges || []).some((badge: string) =>
          badge.toLowerCase() === activeFilter.toLowerCase()
        )
      ) || [];

const searchedRecipes = search
  ? filteredRecipes.filter(r =>
      r.title.toLowerCase().includes(search.toLowerCase())
    )
  : filteredRecipes;

  return (
    <View style={styles.container}>
      {/* Header and Search */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Recipes</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#aaa" />
          <TextInput
            placeholder="Search recipes"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#aaa"
          />
        </View>
      </View>

      {/* Filter row */}
      <View style={styles.filtersRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterButton,
              activeFilter === f.key && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}>
          {searchedRecipes.length === 0 && (
            <Text style={{ alignSelf: "center", marginTop: 40, color: "#888" }}>
              No recipes found
            </Text>
          )}
          {searchedRecipes.map(recipe => (
            <View key={recipe.id} style={styles.recipeCard}>
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: recipe.image }}
                  style={styles.recipeImage}
                  resizeMode="cover"
                />
                {/* You can add more badges if API provides. */}
                {/* <View style={styles.labelBadge}><Text style={styles.labelText}>Healthy</Text></View> */}
              </View>
              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              <View style={styles.recipeSubInfo}>
                <Text style={styles.recipeSubText}>
                  {recipe.usedIngredientCount + recipe.missedIngredientCount} ingredients
                </Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.recipeSubText}>
                  {recipe.readyInMinutes ? `${recipe.readyInMinutes}-min` : ""}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <TabBar
        activeTab="Recipes"
        onTabPress={tab => {
             if (tab === "Lists") return;
            if (tab === "Pantry") router.push("/pantry");
            if (tab === "Recipes") return;
            if (tab === "Profile") router.push("/profile");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 65,
    marginBottom: 6,
    paddingHorizontal: 18,
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 28, fontWeight: "bold" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 13,
    paddingHorizontal: 12,
    height: 38,
    width: 180,
    marginLeft: 10,
  },
  input: {
    fontSize: 16,
    marginLeft: 7,
    flex: 1,
    color: "#222",
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    margin: 12,
    gap: 8,
  },
  filterButton: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    backgroundColor: "#eee",
    borderRadius: 21,
    marginRight: 9,
    marginBottom: 8,
  },
  filterText: { color: "#555", fontWeight: "600", fontSize: 16 },
  filterButtonActive: { backgroundColor: "#24c141" },
  filterTextActive: { color: "#fff" },
  recipeCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    position: "relative",
  },
  recipeImage: {
    width: "100%",
    height: 155,
    borderRadius: 16,
  },
  labelBadge: {
    position: "absolute",
    top: 11,
    left: 11,
    backgroundColor: "#24c141",
    paddingHorizontal: 11,
    paddingVertical: 3,
    borderRadius: 23,
  },
  labelText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  recipeTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  recipeSubInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  recipeSubText: { fontSize: 15, color: "#777" },
  dot: { fontSize: 20, color: "#bbb", marginHorizontal: 7 },
});

