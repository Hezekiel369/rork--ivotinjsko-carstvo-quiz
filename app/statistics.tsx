import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Trophy, Target, Percent } from "lucide-react-native";
import { useGame } from "@/contexts/GameContext";
import { categories } from "@/data/categories";

const { width } = Dimensions.get("window");

export default function StatisticsScreen() {
  const { 
    backgroundGradient, 
    unlockedCategories, 
    categoryStars, 
    totalAttempts, 
    correctAnswers 
  } = useGame();

  const successRate = totalAttempts > 0 
    ? Math.round((correctAnswers / totalAttempts) * 100) 
    : 0;

  const totalStars = Object.values(categoryStars).reduce((sum, stars) => sum + stars, 0);

  return (
    <LinearGradient colors={backgroundGradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            testID="back-button"
          >
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>STATISTIKA</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Trophy size={32} color="#FFD700" />
              <Text style={styles.statValue}>{unlockedCategories}</Text>
              <Text style={styles.statLabel}>Otvorenih kategorija</Text>
            </View>

            <View style={styles.statCard}>
              <Target size={32} color="#4CAF50" />
              <Text style={styles.statValue}>{correctAnswers}/{totalAttempts}</Text>
              <Text style={styles.statLabel}>Tačnih odgovora</Text>
            </View>

            <View style={styles.statCard}>
              <Percent size={32} color="#2196F3" />
              <Text style={styles.statValue}>{successRate}%</Text>
              <Text style={styles.statLabel}>Uspešnost</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.starIcon}>⭐</Text>
              <Text style={styles.statValue}>{totalStars}</Text>
              <Text style={styles.statLabel}>Ukupno zvezdica</Text>
            </View>
          </View>

          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Progres po kategorijama</Text>
            {categories.slice(0, unlockedCategories).map((category) => {
              const stars = categoryStars[category.id] || 0;
              const progress = (stars / 3) * 100;
              
              return (
                <View key={category.id} style={styles.categoryProgress}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <View style={styles.categoryStars}>
                      {[1, 2, 3].map((star) => (
                        <Text key={star} style={styles.smallStar}>
                          {star <= stars ? "⭐" : "☆"}
                        </Text>
                      ))}
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[styles.progressFill, { width: `${progress}%` }]} 
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Grafikon uspešnosti</Text>
            <View style={styles.chart}>
              <View style={styles.chartBar}>
                <View 
                  style={[
                    styles.chartFill, 
                    { height: `${successRate}%`, backgroundColor: "#4CAF50" }
                  ]} 
                />
                <Text style={styles.chartLabel}>Tačno</Text>
              </View>
              <View style={styles.chartBar}>
                <View 
                  style={[
                    styles.chartFill, 
                    { height: `${100 - successRate}%`, backgroundColor: "#F44336" }
                  ]} 
                />
                <Text style={styles.chartLabel}>Netačno</Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFF",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#FFF",
    opacity: 0.9,
    textAlign: "center",
  },
  starIcon: {
    fontSize: 32,
  },
  categoriesSection: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 16,
  },
  categoryProgress: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: "#FFF",
  },
  categoryStars: {
    flexDirection: "row",
  },
  smallStar: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  chartContainer: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 16,
    padding: 16,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 150,
    alignItems: "flex-end",
  },
  chartBar: {
    width: 80,
    alignItems: "center",
  },
  chartFill: {
    width: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: "#FFF",
  },
});