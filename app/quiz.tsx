import React, { useState, useEffect, useCallback } from "react";
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
import { getAnimalImage, preloadImages, playApplauseSound, playSighSound } from "@/utils/animalImages";
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

  const generateQuestions = useCallback(() => {
    if (!category) {
      console.log('No category found');
      return;
    }
    
    console.log('Generating questions for category:', category.name, 'with', category.animals.length, 'animals');
    
    if (category.animals.length < 4) {
      console.error('Category has less than 4 animals, cannot generate proper quiz');
      return;
    }
    
    // Ensure we have enough animals for proper quiz generation
    const availableAnimals = [...category.animals];
    const shuffled = availableAnimals.sort(() => Math.random() - 0.5);
    const questionList = shuffled.slice(0, Math.min(10, availableAnimals.length)).map((correctAnimal, questionIndex) => {
      // Get wrong answers, ensuring we always have exactly 3
      const wrongAnswers = availableAnimals
        .filter(a => a.id !== correctAnimal.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      // Safety check: ensure we have exactly 3 wrong answers
      while (wrongAnswers.length < 3 && availableAnimals.length > 1) {
        const randomAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
        if (randomAnimal.id !== correctAnimal.id && !wrongAnswers.find(a => a.id === randomAnimal.id)) {
          wrongAnswers.push(randomAnimal);
        }
        // Prevent infinite loop
        if (wrongAnswers.length >= availableAnimals.length - 1) break;
      }
      
      // Create exactly 4 answers: 1 correct + 3 wrong
      const allAnswers = [correctAnimal, ...wrongAnswers.slice(0, 3)];
      
      // Shuffle the answers so correct answer isn't always first
      const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);
      
      // Find the correct answer's new position after shuffling
      const correctIndex = shuffledAnswers.findIndex(a => a.id === correctAnimal.id);
      
      if (__DEV__) {
        console.log(`Question ${questionIndex + 1}: ${correctAnimal.name} at position ${correctIndex}, answers:`, shuffledAnswers.map(a => a.name));
      }
      
      return {
        correctAnimal,
        answers: shuffledAnswers,
        correctIndex
      };
    });
    
    // Preload all images for better performance (especially Android)
    const allImages = questionList.flatMap(q => q.answers.map(a => a.image));
    preloadImages(allImages);
    
    setQuestions(questionList);
    console.log('Generated', questionList.length, 'questions with 4 answers each.');
  }, [category]);

  useEffect(() => {
    if (category) {
      generateQuestions();
    }
  }, [category, generateQuestions]);

  const handleAnswer = useCallback(async (answerIndex: number) => {
    if (showFeedback) return;
    
    console.log('Answer selected:', answerIndex, 'Correct index:', questions[currentQuestion]?.correctIndex);
    
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
      playApplauseSound();
      setTimeout(() => setShowConfetti(false), 2500);
    } else {
      playSighSound();
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
        const finalCorrectCount = correctAnswers + (correct ? 1 : 0);
        console.log('Quiz completed. Final score:', finalCorrectCount);
        completeCategory(category!.id, finalCorrectCount);
        router.replace({
          pathname: "/level-complete",
          params: { 
            categoryId: categoryId as string,
            stars: finalCorrectCount.toString(),
            correctAnswers: finalCorrectCount.toString()
          }
        });
      }
    }, 2000);
  }, [showFeedback, questions, currentQuestion, correctAnswers, completeCategory, category, categoryId, fadeAnim]);

  if (!category) {
    return (
      <LinearGradient colors={backgroundGradient} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>Kategorija nije pronađena</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }
  
  if (questions.length === 0) {
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
            {question.answers && question.answers.length === 4 ? (
              <>
                {/* First row - Top 2 answers */}
                <View style={styles.answerRow}>
                  {question.answers.slice(0, 2).map((animal: any, index: number) => (
                    <TouchableOpacity
                      key={`${animal.id}-${currentQuestion}-${index}`}
                      style={[
                        styles.answerCard,
                        selectedAnswer === index && styles.selectedCard,
                        showFeedback && index === question.correctIndex && styles.correctCard,
                        showFeedback && selectedAnswer === index && !isCorrect && styles.wrongCard,
                      ]}
                      onPress={() => handleAnswer(index)}
                      disabled={showFeedback}
                      testID={`answer-${index}`}
                      activeOpacity={0.8}
                    >
                      <View style={styles.imageWrapper}>
                        <Image
                          source={{ uri: getAnimalImage(animal.image) }}
                          style={styles.answerImage}
                          resizeMode="cover"
                          onError={(error) => {
                            if (__DEV__) {
                              console.log('Image load error for', animal.name, ':', error.nativeEvent?.error);
                            }
                          }}
                          onLoad={() => {
                            if (__DEV__) {
                              console.log('Image loaded:', animal.name);
                            }
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Second row - Bottom 2 answers */}
                <View style={styles.answerRow}>
                  {question.answers.slice(2, 4).map((animal: any, index: number) => {
                    const actualIndex = index + 2;
                    return (
                      <TouchableOpacity
                        key={`${animal.id}-${currentQuestion}-${actualIndex}`}
                        style={[
                          styles.answerCard,
                          selectedAnswer === actualIndex && styles.selectedCard,
                          showFeedback && actualIndex === question.correctIndex && styles.correctCard,
                          showFeedback && selectedAnswer === actualIndex && !isCorrect && styles.wrongCard,
                        ]}
                        onPress={() => handleAnswer(actualIndex)}
                        disabled={showFeedback}
                        testID={`answer-${actualIndex}`}
                        activeOpacity={0.8}
                      >
                        <View style={styles.imageWrapper}>
                          <Image
                            source={{ uri: getAnimalImage(animal.image) }}
                            style={styles.answerImage}
                            resizeMode="cover"
                            onError={(error) => {
                              if (__DEV__) {
                                console.log('Image load error for', animal.name, ':', error.nativeEvent?.error);
                              }
                            }}
                            onLoad={() => {
                              if (__DEV__) {
                                console.log('Image loaded:', animal.name);
                              }
                            }}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Greška u učitavanju pitanja
                </Text>
                <Text style={styles.errorSubText}>
                  Očekivano: 4 odgovora, Pronađeno: {question.answers?.length || 0}
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => generateQuestions()}
                >
                  <Text style={styles.retryButtonText}>Pokušaj ponovo</Text>
                </TouchableOpacity>
              </View>
            )}
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
    paddingHorizontal: 8,
  },
  answerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  answerCard: {
    width: (width - 64) / 2,
    height: (width - 64) / 2,
    backgroundColor: "#2E7D32",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
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
  imageWrapper: {
    width: "85%",
    height: "85%",
    borderRadius: 1000,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FFF",
    backgroundColor: "#4CAF50",
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
  errorText: {
    fontSize: 18,
    color: "#FFF",
    textAlign: "center",
    marginTop: 50,
  },
  errorContainer: {
    alignItems: "center",
    padding: 20,
  },
  errorSubText: {
    fontSize: 14,
    color: "#FFF",
    textAlign: "center",
    marginTop: 10,
    opacity: 0.8,
  },
  retryButton: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});