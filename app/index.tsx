import React, { useEffect } from "react";
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
import { ChartBar, Settings, Lock, Star } from "lucide-react-native";
import { useGame } from "@/contexts/GameContext";
import { categories } from "@/data/categories";
import { getAnimalImage, initializeAudio } from "@/utils/animalImages";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");
const cardWidth = (width - 48) / 2;

export default function HomeScreen() {
  const { unlockedCategories, categoryStars, backgroundGradient, isLoading } = useGame();
  
  useEffect(() => {
    // Initialize audio with error handling
    const setupAudio = async () => {
      try {
        await initializeAudio();
      } catch (error) {
        console.log('Audio initialization failed in HomeScreen:', error);
      }
    };
    setupAudio();
  }, []);
  
  // Show loading state while game state is loading
  if (isLoading) {
    return (
      <LinearGradient
        colors={["#1B5E20", "#FFEB3B"]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Učitavanje...</Text>
            <Text style={styles.loadingSubText}>Platform: {Platform.OS}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const handleCategoryPress = async (categoryId: number) => {
    if (Platform.OS !== "web") {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (hapticsError) {
        console.log('Haptics failed:', hapticsError);
      }
    }
    
    if (categoryId > unlockedCategories && categoryId <= 5) {
      return;
    }
    
    if (categoryId > 5 && categoryId <= 13) {
      handlePremiumPress();
      return;
    }
    
    router.push({
      pathname: "/quiz",
      params: { categoryId: categoryId.toString() }
    });
  };

  const handlePremiumPress = async () => {
    if (Platform.OS !== "web") {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (hapticsError) {
        console.log('Haptics failed:', hapticsError);
      }
    }
    console.log('Premium upgrade requested');
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
      case 5: // Insekti - use hornet (STRŠLJEN)
        categoryAnimal = category.animals.find(a => a.name === "STRŠLJEN") || category.animals[0];
        break;
      case 6: // Kišna šuma - use bear (MEDVED)
        categoryAnimal = category.animals.find(a => a.name === "MEDVED") || category.animals[0];
        break;
      case 7: // Savana - use ostrich (NOJ)
        categoryAnimal = category.animals.find(a => a.name === "NOJ") || category.animals[0];
        break;
      case 8: // Australija - use kangaroo (KENGUR)
        categoryAnimal = category.animals.find(a => a.name === "KENGUR") || category.animals[0];
        break;
      case 9: // Okean - use whale (KIT)
        categoryAnimal = category.animals.find(a => a.name === "KIT") || category.animals[0];
        break;
      case 10: // Prerija - use wolf (VUK)
        categoryAnimal = category.animals.find(a => a.name === "VUK") || category.animals[0];
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
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getAnimalImage(categoryAnimal.image) }}
              style={styles.cardImage}
              resizeMode="cover"
            />
          </View>
          {isLocked && (
            <View style={styles.lockOverlay}>
              {isPremium ? (
                <TouchableOpacity 
                  style={styles.premiumButton}
                  onPress={handlePremiumPress}
                  activeOpacity={0.8}
                >
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.premiumButtonText}>PREMIJUM</Text>
                </TouchableOpacity>
              ) : (
                <Lock size={40} color="#FFF" />
              )}
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

        <View style={styles.premiumMessage}>
          <Text style={styles.premiumMessageText}>IGRAJTE SVE NIVOE ZA SAMO 1 EVRO</Text>
          <TouchableOpacity 
            style={styles.mainPremiumButton}
            onPress={handlePremiumPress}
            activeOpacity={0.8}
          >
            <Star size={20} color="#FFD700" fill="#FFD700" />
            <Text style={styles.mainPremiumButtonText}>PREMIJUM</Text>
          </TouchableOpacity>
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
            <View style={styles.buttonBackground}>
              <ChartBar size={24} color="#FFF" />
              <Text style={styles.bottomButtonText}>Statistika</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={() => router.push("/settings")}
            testID="settings-button"
          >
            <View style={styles.buttonBackground}>
              <Settings size={24} color="#FFF" />
              <Text style={styles.bottomButtonText}>Podešavanja</Text>
            </View>
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
  imageContainer: {
    width: "100%",
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  cardImage: {
    width: "85%",
    height: "85%",
    borderRadius: 1000,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "#FFF",
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
    borderRadius: 25,
  },
  buttonBackground: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
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
  premiumMessage: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  premiumMessageText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 8,
    textAlign: "center",
  },
  mainPremiumButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  mainPremiumButtonText: {
    color: "#FFD700",
    fontSize: 16,
    fontWeight: "bold",
  },
  premiumButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
  },
  premiumButtonText: {
    color: "#FFD700",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  loadingSubText: {
    fontSize: 16,
    color: "#FFF",
    opacity: 0.8,
    marginTop: 10,
  },
});