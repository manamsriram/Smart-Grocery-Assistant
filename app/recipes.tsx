import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { firestore } from "../firebaseConfig";
import TabBar from "./components/TabBar";

const filters = [
  { label: "All", key: "all" },
  { label: "Healthy", key: "healthy" },
  { label: "Quick", key: "quick" },
  { label: "Budget", key: "budget" },
  { label: "Uses Expiring", key: "expiring" },
];

// Define sets for tags and categories
const healthyTags = new Set(["Vegetarian", "Vegan", "Soup", "SideDish", "Salad"]);
const healthyCategories = new Set(["Vegetarian", "Vegan", "Soup", "Side", "Salad"]);

const quickTags = new Set(["Onthego", "Streetfood", "Snack", "Breakfast", "SideDish"]);
const quickCategories = new Set(["Breakfast", "Snack", "Side"]);

export default function RecipesScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pantryItems, setPantryItems] = useState<{ name: string; expirationDate: string | null }[]>([]);

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch pantry items from Firestore
  useEffect(() => {
    async function fetchPantry() {
      const snap = await getDocs(collection(firestore, "pantry"));
      setPantryItems(
        snap.docs
          .map(doc => ({
            name: doc.data().name,
            expirationDate: doc.data().expirationDate || null,
          }))
          .filter(item => item.name)
      );
    }
    fetchPantry();
  }, []);

  useEffect(() => {
  if (pantryItems.length === 0) return;

  async function fetchRecipes() {
    setLoading(true);
    try {
      let collectedMeals: any[] = [];

      // 1️⃣ Fetch meals for each pantry ingredient
      for (const item of pantryItems) {
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(item.name)}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.meals) {
          collectedMeals = [...collectedMeals, ...data.meals];
        }
      }

      // 2️⃣ Deduplicate by meal ID
      const uniqueMeals = Object.values(
        collectedMeals.reduce((acc: any, meal: any) => {
          acc[meal.idMeal] = meal;
          return acc;
        }, {})
      );

      // 3️⃣ Fetch full details for each unique meal
      const detailedMeals = await Promise.all(
        uniqueMeals.map(async (meal: any) => {
          const detailRes = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
          );
          const detailData = await detailRes.json();
          return detailData.meals?.[0]; // each returns an array with 1 meal
        })
      );

      // 4️⃣ Filter out any null responses
      const validMeals = detailedMeals.filter(Boolean);

      setRecipes(validMeals);
    } catch (e) {
      console.error("Error fetching from TheMealDB:", e);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }

  fetchRecipes();
}, [pantryItems]);

 const getExpiringIngredients = (daysAhead = 7) => {
  const now = new Date();
  const soon = new Date();
  soon.setDate(now.getDate() + daysAhead);

  return pantryItems
    .filter(item => {
      if (!item.expirationDate) return false;
      const [mm, dd, yyyy] = item.expirationDate.split("/");
      const expDate = new Date(`${yyyy}-${mm}-${dd}`);
      return expDate >= now && expDate <= soon;
    })
    .map(item => {
      const [mm, dd, yyyy] = item.expirationDate!.split("/");
      const expDate = new Date(`${yyyy}-${mm}-${dd}`);
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { name: item.name.toLowerCase(), daysLeft: diffDays };
    });
};

  // Filtering logic (placeholder for now, since TheMealDB doesn't have categories on filter endpoint)
  const filteredRecipes = recipes.filter(recipe => {
  if (activeFilter === "all") return true;

  const tags: string[] = recipe.strTags
    ? recipe.strTags.split(",").map((t: string) => t.trim())
    : [];
  const category = recipe.strCategory?.toLowerCase() || "";

  switch (activeFilter) {
     case "healthy":
      return (
        tags.some(tag => healthyTags.has(tag)) ||
        healthyCategories.has(category)
      );

    case "quick":
      return (
        tags.some(tag => quickTags.has(tag)) ||
        quickCategories.has(category)
      );
    case "budget":
      return tags.includes("budget") || category.includes("miscellaneous");
   case "expiring": {
  const expiringIngredients = getExpiringIngredients(7); // next 7 days
  if (expiringIngredients.length === 0) return false;

  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = recipe[`strIngredient${i}` as keyof typeof recipe];
    if (typeof ing === "string" && ing.trim() !== "") {
      ingredients.push(ing.toLowerCase());
    }
  }

  // Find which expiring ingredients appear in this recipe
  const matchedExpiring = expiringIngredients.filter(exp =>
    ingredients.some(ing => ing.includes(exp.name))
  );

  // Attach matched expiring ingredients to recipe for display
  (recipe as any).matchedExpiring = matchedExpiring;

  return matchedExpiring.length > 0;
}


    default:
      return true;
  }
});


// Search logic
  const searchedRecipes = search
    ? filteredRecipes.filter(r =>
        r.strMeal.toLowerCase().includes(search.toLowerCase())
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
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 80 }}>
          {searchedRecipes.length === 0 && (
            <Text style={{ alignSelf: "center", marginTop: 40, color: "#888" }}>
              No recipes found
            </Text>
          )}
          {searchedRecipes.map(recipe => (
            <TouchableOpacity
              key={recipe.idMeal}
              style={styles.recipeCard} 
              onPress={() => router.push(`/recipe/${recipe.idMeal}`)}
            >
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: recipe.strMealThumb }}
                  style={styles.recipeImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.recipeTitle}>{recipe.strMeal}</Text>
              <View style={styles.recipeSubInfo}>
                <Text style={styles.recipeSubText}>Ingredient match</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Bottom Tab Bar */}
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
  recipeTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  recipeSubInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  recipeSubText: { fontSize: 15, color: "#777" },
});
