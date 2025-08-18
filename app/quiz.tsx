import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useGame } from "@/contexts/GameContext";
import { categories } from "@/data/categories";
import { getAnimalImage } from "@/utils/animalImages";
import * as Haptics from "expo-haptics";
import ConfettiView from "@/components/ConfettiView";

const { width } = Dimensions.get("window");

export default function QuizScreen() {
  const { categoryId } = useLocalSearchParams();
  const { backgroundGradient, completeCategory } = useGame();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const category = categories.find(c => c.id === parseInt(categoryId as string));

  useEffect(() => {
    if (category) {
      generateQuestions();
    }
  }, [category]);

  const generateQuestions = () => {
    if (!category) return;
    
    const shuffled = [...category.animals].sort(() => Math.random() - 0.5);
    const questionList = shuffled.slice(0, 10).map(correctAnimal => {
      const wrongAnswers = category.animals
        .filter(a => a.id !== correctAnimal.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const allAnswers = [correctAnimal, ...wrongAnswers].sort(() => Math.random() - 0.5);
      
      return {
        correctAnimal,
        answers: allAnswers,
        correctIndex: allAnswers.findIndex(a => a.id === correctAnimal.id)
      };
    });
    
    setQuestions(questionList);
  };

  const handleAnswer = async (answerIndex: number) => {
    if (showFeedback) return;
    
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setSelectedAnswer(answerIndex);
    const correct = answerIndex === questions[currentQuestion].correctIndex;
    setIsCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      if (currentQuestion < 9) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setCurrentQuestion(prev => prev + 1);
          setSelectedAnswer(null);
          setShowFeedback(false);
        });
      } else {
        const stars = correctAnswers + (correct ? 1 : 0);
        completeCategory(category!.id, stars);
        router.replace({
          pathname: "/level-complete",
          params: { 
            categoryId: categoryId as string,
            stars: stars.toString(),
            correctAnswers: (correctAnswers + (correct ? 1 : 0)).toString()
          }
        });
      }
    }, 2000);
  };

  if (!category || questions.length === 0) {
    return (
      <LinearGradient colors={backgroundGradient} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.loadingText}>Učitavanje...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const question = questions[currentQuestion];

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
          <Text style={styles.categoryName}>{category.name}</Text>
          <View style={styles.progress}>
            <Text style={styles.progressText}>{currentQuestion + 1}/10</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{question.correctAnimal.name}</Text>
            <Text style={styles.instruction}>Izaberi tačnu sliku:</Text>
          </View>

          <View style={styles.answersGrid}>
            {question.answers.map((animal: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.answerCard,
                  selectedAnswer === index && styles.selectedCard,
                  showFeedback && index === question.correctIndex && styles.correctCard,
                  showFeedback && selectedAnswer === index && !isCorrect && styles.wrongCard,
                ]}
                onPress={() => handleAnswer(index)}
                disabled={showFeedback}
                testID={`answer-${index}`}
              >
                <Image
                  source={{ uri: getAnimalImage(animal.image) }}
                  style={styles.answerImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>

          {showFeedback && (
            <Animated.View 
              style={[
                styles.feedbackContainer,
                { opacity: fadeAnim }
              ]}
            >
              <View style={[
                styles.feedbackBackground,
                isCorrect ? styles.correctBackground : styles.wrongBackground
              ]}>
                <Text style={[
                  styles.feedbackText,
                  isCorrect ? styles.correctText : styles.wrongText
                ]}>
                  {isCorrect ? "BRAVO!!!" : "POKUŠAJTE PONOVO"}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Tačnih odgovora: {correctAnswers}</Text>
        </View>
      </SafeAreaView>
      {showConfetti && <ConfettiView />}
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
  categoryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    flex: 1,
    textAlign: "center",
  },
  progress: {
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  progressText: {
    color: "#FFF",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  questionContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  questionText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
    marginBottom: 8,
  },
  instruction: {
    fontSize: 16,
    color: "#FFF",
    opacity: 0.9,
  },
  answersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  answerCard: {
    width: (width - 48) / 2,
    height: (width - 48) / 2,
    backgroundColor: "#2E7D32",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: "#FFD700",
  },
  correctCard: {
    borderColor: "#4CAF50",
    borderWidth: 4,
  },
  wrongCard: {
    borderColor: "#F44336",
    borderWidth: 4,
  },
  answerImage: {
    width: "100%",
    height: "100%",
  },
  feedbackContainer: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  feedbackBackground: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
  },
  correctBackground: {
    backgroundColor: "#4CAF50",
  },
  wrongBackground: {
    backgroundColor: "#FFF",
  },
  feedbackText: {
    fontSize: 36,
    fontWeight: "900",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  correctText: {
    color: "#FFD700",
    textShadowColor: "#000",
  },
  wrongText: {
    color: "#F44336",
    textShadowColor: "#FFF",
  },
  scoreContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  scoreText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "600",
  },
  loadingText: {
    fontSize: 24,
    color: "#FFF",
    textAlign: "center",
    marginTop: 100,
  },
});