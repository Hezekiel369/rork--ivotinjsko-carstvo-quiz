import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Trophy, RotateCcw, Home } from "lucide-react-native";
import { useGame } from "@/contexts/GameContext";
import { categories } from "@/data/categories";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

export default function LevelCompleteScreen() {
  const { categoryId, stars: starsParam, correctAnswers } = useLocalSearchParams();
  const { backgroundGradient } = useGame();
  const stars = parseInt(starsParam as string);
  const category = categories.find(c => c.id === parseInt(categoryId as string));

  useEffect(() => {
    if (Platform.OS !== "web" && stars > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const getStarCount = () => {
    if (stars === 0) return 0;
    if (stars === 1) return 1;
    if (stars >= 2 && stars <= 9) return 2;
    return 3;
  };

  const starCount = getStarCount();
  const isSuccess = starCount > 0;

  return (
    <LinearGradient colors={backgroundGradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {isSuccess ? (
              <Trophy size={80} color="#FFD700" />
            ) : (
              <RotateCcw size={80} color="#F44336" />
            )}
          </View>

          <Text style={[styles.title, isSuccess ? styles.successTitle : styles.failTitle]}>
            {isSuccess ? "ČESTITAMO !!!" : "POKUŠAJTE PONOVO"}
          </Text>

          <Text style={styles.subtitle}>
            {isSuccess 
              ? "OTVORILI STE SLEDEĆI NIVO" 
              : "DA OTVORITE SLEDEĆI NIVO"}
          </Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3].map((star) => (
              <Text key={star} style={styles.star}>
                {star <= starCount ? "⭐" : "☆"}
              </Text>
            ))}
          </View>

          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>Kategorija: {category?.name}</Text>
            <Text style={styles.statsText}>Tačnih odgovora: {correctAnswers}/10</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={() => {
                router.replace({
                  pathname: "/quiz",
                  params: { categoryId: categoryId as string }
                });
              }}
              testID="retry-button"
            >
              <RotateCcw size={24} color="#FFF" />
              <Text style={styles.buttonText}>Pokušaj ponovo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.homeButton]}
              onPress={() => router.replace("/")}
              testID="home-button"
            >
              <Home size={24} color="#FFF" />
              <Text style={styles.buttonText}>Početna</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 10,
    textAlign: "center",
  },
  successTitle: {
    color: "#FFD700",
    textShadowColor: "#000",
  },
  failTitle: {
    color: "#F44336",
    textShadowColor: "#FFF",
  },
  subtitle: {
    fontSize: 18,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 30,
  },
  star: {
    fontSize: 48,
    marginHorizontal: 5,
  },
  statsContainer: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    minWidth: width * 0.8,
  },
  statsText: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    marginVertical: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  retryButton: {
    backgroundColor: "#FF9800",
  },
  homeButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});