import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function RecipeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [meal, setMeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeal() {
      try {
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        );
        const data = await res.json();
        if (data.meals && data.meals.length > 0) {
          setMeal(data.meals[0]);
        }
      } catch (err) {
        console.error("Error fetching meal details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMeal();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: "#777" }}>Meal not found.</Text>
      </View>
    );
  }

  // Extract ingredients and measures
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      ingredients.push({ ingredient, measure });
    }
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {meal.strMeal}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Meal Image */}
      <Image source={{ uri: meal.strMealThumb }} style={styles.mealImage} />

      {/* Info Card */}
      <View style={styles.contentCard}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {ingredients.map((item, idx) => (
          <Text key={idx} style={styles.ingredientText}>
            • {item.ingredient} — {item.measure}
          </Text>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
          Instructions
        </Text>
        <Text style={styles.instructions}>{meal.strInstructions}</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f6f6" },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 10,
    justifyContent: "space-between",
  },
  backButton: {
    padding: 6,
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
  mealImage: {
    width: "92%",
    height: 220,
    alignSelf: "center",
    borderRadius: 18,
    marginVertical: 12,
  },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111",
  },
  ingredientText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 6,
  },
  instructions: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
});
