import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChartBar, Settings, Lock } from "lucide-react-native";
import { useGame } from "@/contexts/GameContext";
import { categories } from "@/data/categories";
import { getAnimalImage } from "@/utils/animalImages";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function HomeScreen() {
  const { unlockedCategories, categoryStars, backgroundGradient } = useGame();

  const handleCategoryPress = async (categoryId: number) => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (categoryId > unlockedCategories && categoryId <= 5) {
      return;
    }
    
    if (categoryId > 5 && categoryId <= 13) {
      return;
    }
    
    router.push({
      pathname: "/quiz",
      params: { categoryId: categoryId.toString() }
    });
  };

  const renderCategoryCard = (category: typeof categories[0], index: number) => {
    const isUnlocked = index < unlockedCategories;
    const isPremium = index >= 5;
    const isLocked = !isUnlocked || (isPremium && index < 13);
    const stars = categoryStars[category.id] || 0;
    
    // Use specific animals for each category as requested
    let categoryAnimal;
    switch (category.id) {
      case 1: // Domaće životinje - use horse (KONJ)
        categoryAnimal = category.animals.find(a => a.name === "KONJ") || category.animals[0];
        break;
      case 2: // Divlje životinje - use tiger (TIGAR)
        categoryAnimal = category.animals.find(a => a.name === "TIGAR") || category.animals[0];
        break;
      case 3: // Ptice - use eagle (ORAO)
        categoryAnimal = category.animals.find(a => a.name === "ORAO") || category.animals[0];
        break;
      case 4: // Morske životinje - use whale (KIT)
        categoryAnimal = category.animals.find(a => a.name === "KIT") || category.animals[0];
        break;
      default:
        categoryAnimal = category.animals[0];
    }

    return (
      <TouchableOpacity
        key={category.id}
        style={[styles.card, isLocked && styles.cardLocked]}
        onPress={() => handleCategoryPress(category.id)}
        disabled={isLocked}
        testID={`category-${category.id}`}
      >
        <View style={styles.cardContent}>
          <Image
            source={{ uri: getAnimalImage(categoryAnimal.image) }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Lock size={40} color="#FFF" />
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {category.name}
            </Text>
            <View style={styles.cardBottom}>
              <View style={styles.starsContainer}>
                {[1, 2, 3].map((star) => (
                  <Text key={star} style={styles.star}>
                    {star <= stars ? "⭐" : "☆"}
                  </Text>
                ))}
              </View>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{category.emoji}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={backgroundGradient}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>ŽIVOTINJSKO</Text>
          <Text style={styles.title}>CARSTVO</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.categoriesGrid}>
            {categories.map((category, index) => renderCategoryCard(category, index))}
          </View>
        </ScrollView>

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => router.push("/statistics")}
            testID="statistics-button"
          >
            <ChartBar size={24} color="#FFF" />
            <Text style={styles.bottomButtonText}>Statistika</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => router.push("/settings")}
            testID="settings-button"
          >
            <Settings size={24} color="#FFF" />
            <Text style={styles.bottomButtonText}>Podešavanja</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFF",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    letterSpacing: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: cardWidth,
    height: cardWidth * 1.2,
    backgroundColor: "#2E7D32",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  cardLocked: {
    opacity: 0.7,
  },
  cardContent: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "60%",
    backgroundColor: "#4CAF50",
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    padding: 8,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
  },
  star: {
    fontSize: 12,
  },
  emojiContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 16,
  },
  bottomButtons: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  bottomButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  bottomButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});