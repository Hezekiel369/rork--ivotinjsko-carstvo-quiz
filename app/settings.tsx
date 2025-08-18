import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, Palette, RotateCcw, Lock } from "lucide-react-native";
import { useGame } from "@/contexts/GameContext";
import * as Haptics from "expo-haptics";

const gradientOptions = [
  { id: 1, colors: ["#1B5E20", "#5D4037"] as const, name: "Priroda" },
  { id: 2, colors: ["#1A237E", "#E91E63"] as const, name: "Sumrak" },
  { id: 3, colors: ["#E65100", "#FFD600"] as const, name: "Sunce" },
  { id: 4, colors: ["#4A148C", "#00BCD4"] as const, name: "Okean" },
  { id: 5, colors: ["#B71C1C", "#FFC107"] as const, name: "Vatra" },
];

export default function SettingsScreen() {
  const { backgroundGradient, setBackgroundGradient, resetProgress } = useGame();

  const handleGradientChange = async (colors: readonly [string, string, ...string[]]) => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setBackgroundGradient(colors);
  };

  const handleResetProgress = () => {
    Alert.alert(
      "Resetuj napredak",
      "Da li ste sigurni da želite da obrišete sav napredak?",
      [
        { text: "Otkaži", style: "cancel" },
        { 
          text: "Resetuj", 
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== "web") {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            resetProgress();
            Alert.alert("Uspešno", "Napredak je resetovan!");
          }
        }
      ]
    );
  };

  const handlePremiumUpgrade = () => {
    Alert.alert(
      "Premium verzija",
      "Premium verzija otključava kategorije 6-13. Ova funkcija trenutno nije dostupna.",
      [{ text: "OK" }]
    );
  };

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
          <Text style={styles.title}>PODEŠAVANJA</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Palette size={24} color="#FFF" />
              <Text style={styles.sectionTitle}>Pozadina</Text>
            </View>
            
            <View style={styles.gradientOptions}>
              {gradientOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.gradientOption}
                  onPress={() => handleGradientChange(option.colors)}
                  testID={`gradient-${option.id}`}
                >
                  <LinearGradient
                    colors={option.colors}
                    style={[
                      styles.gradientPreview,
                      JSON.stringify(backgroundGradient) === JSON.stringify(option.colors) && 
                      styles.selectedGradient
                    ]}
                  />
                  <Text style={styles.gradientName}>{option.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleResetProgress}
              testID="reset-button"
            >
              <RotateCcw size={24} color="#FFF" />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Resetuj napredak</Text>
                <Text style={styles.actionButtonSubtitle}>
                  Obriši sav napredak i počni ispočetka
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.actionButton, styles.premiumButton]}
              onPress={handlePremiumUpgrade}
              testID="premium-button"
            >
              <Lock size={24} color="#FFD700" />
              <View style={styles.actionButtonContent}>
                <Text style={[styles.actionButtonTitle, styles.premiumText]}>
                  Premium verzija
                </Text>
                <Text style={styles.actionButtonSubtitle}>
                  Otključaj kategorije 6-13
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>O aplikaciji</Text>
            <Text style={styles.aboutText}>
              Životinjsko Carstvo v1.0{"\n"}
              Edukativna igra za decu{"\n"}
              © 2025
            </Text>
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
  section: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  gradientOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gradientOption: {
    alignItems: "center",
    marginBottom: 12,
  },
  gradientPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 4,
  },
  selectedGradient: {
    borderWidth: 3,
    borderColor: "#FFF",
  },
  gradientName: {
    fontSize: 12,
    color: "#FFF",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  premiumButton: {
    backgroundColor: "rgba(255,215,0,0.2)",
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  premiumText: {
    color: "#FFD700",
  },
  actionButtonSubtitle: {
    fontSize: 12,
    color: "#FFF",
    opacity: 0.8,
  },
  aboutSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 12,
    color: "#FFF",
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 18,
  },
});