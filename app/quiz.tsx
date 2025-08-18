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
    
    console.log(`Generating questions for category: ${category.name} (Platform: ${Platform.OS})`);
    console.log(`Available animals: ${category.animals.length}`);
    
    // Validate all animals have valid images and names
    const validAnimals = category.animals.filter(animal => {
      const isValid = animal && 
                     animal.id && 
                     animal.name && 
                     animal.image && 
                     typeof animal.name === 'string' && 
                     typeof animal.image === 'string' &&
                     animal.name.length > 0 && 
                     animal.image.length > 0;
      
      return isValid;
    });
    
    console.log(`Valid animals after filtering: ${validAnimals.length}`);
    
    if (validAnimals.length < 4) {
      console.error(`Not enough valid animals (${validAnimals.length}/4 required). Cannot generate quiz.`);
      // Set empty questions to show error state
      setQuestions([]);
      return;
    }
    
    // Create a pool of animals for question generation
    const animalPool = [...validAnimals];
    
    // Generate exactly 10 questions (or as many as possible)
    const questionCount = Math.min(10, validAnimals.length);
    const questionList: any[] = [];
    
    for (let i = 0; i < questionCount; i++) {
      // Select correct animal (ensure we don't repeat too often)
      const correctAnimal = animalPool[i % animalPool.length];
      
      // Get 3 different wrong answers
      const wrongAnswers: any[] = [];
      const otherAnimals = validAnimals.filter(a => a.id !== correctAnimal.id);
      
      // Shuffle other animals and take first 3
      const shuffledOthers = [...otherAnimals].sort(() => Math.random() - 0.5);
      
      for (let j = 0; j < 3 && j < shuffledOthers.length; j++) {
        wrongAnswers.push(shuffledOthers[j]);
      }
      
      // If we don't have enough different animals, duplicate some
      while (wrongAnswers.length < 3) {
        const fallbackAnimal = otherAnimals[wrongAnswers.length % otherAnimals.length];
        if (fallbackAnimal && !wrongAnswers.find(a => a.id === fallbackAnimal.id)) {
          wrongAnswers.push(fallbackAnimal);
        } else {
          // Create a modified version to ensure we have 4 unique options
          const modifiedAnimal = {
            ...fallbackAnimal,
            id: fallbackAnimal.id + 1000 + wrongAnswers.length, // Unique ID
            name: fallbackAnimal.name // Same name is OK for display
          };
          wrongAnswers.push(modifiedAnimal);
        }
      }
      
      // Create exactly 4 answers: 1 correct + 3 wrong
      const allAnswers = [correctAnimal, ...wrongAnswers.slice(0, 3)];
      
      // Shuffle the answers so correct answer position varies
      const shuffledAnswers = [...allAnswers].sort(() => Math.random() - 0.5);
      
      // Find the correct answer's position after shuffling
      const correctIndex = shuffledAnswers.findIndex(a => a.id === correctAnimal.id);
      
      // Validate question structure
      if (shuffledAnswers.length !== 4) {
        console.error(`Question ${i + 1}: Invalid answer count: ${shuffledAnswers.length}`);
        continue;
      }
      
      if (correctIndex === -1) {
        console.error(`Question ${i + 1}: Correct answer not found in shuffled answers`);
        continue;
      }
      
      const question = {
        correctAnimal,
        answers: shuffledAnswers,
        correctIndex
      };
      
      questionList.push(question);
      

    }
    
    if (questionList.length === 0) {
      console.error('Failed to generate any valid questions');
      setQuestions([]);
      return;
    }
    
    // Preload all images for better performance (especially Android)
    try {
      const allImages = questionList.flatMap(q => 
        q.answers.map((a: any) => a.image).filter((img: string) => img && img.length > 0)
      );
      console.log(`Preloading ${allImages.length} images for Android optimization`);
      preloadImages(allImages);
    } catch (preloadError) {
      console.log('Image preloading failed (continuing):', preloadError);
    }
    
    setQuestions(questionList);
    console.log(`Successfully generated ${questionList.length} questions with 4 answers each`);
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
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (hapticsError) {
        console.log('Haptics failed:', hapticsError);
      }
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              testID="back-button"
            >
              <ArrowLeft size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.categoryName}>{category?.name || 'Quiz'}</Text>
            <View style={styles.progress} />
          </View>
          
          <View style={styles.errorContainer}>
            <Text style={styles.loadingText}>Učitavanje pitanja...</Text>
            <Text style={styles.errorSubText}>Platform: {Platform.OS}</Text>
            <Text style={styles.errorSubText}>
              Kategorija: {category?.name} ({category?.animals?.length || 0} životinja)
            </Text>
            
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                console.log('Manual retry from loading state');
                if (category) {
                  generateQuestions();
                } else {
                  router.back();
                }
              }}
            >
              <Text style={styles.retryButtonText}>
                {category ? 'Pokušaj ponovo' : 'Nazad'}
              </Text>
            </TouchableOpacity>
          </View>
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
            {question.answers && Array.isArray(question.answers) && question.answers.length === 4 ? (
              <>
                {/* First row - Top 2 answers */}
                <View style={styles.answerRow}>
                  {question.answers.slice(0, 2).map((animal: any, index: number) => {
                    if (!animal || !animal.image) {
                      console.warn(`Invalid animal at index ${index}:`, animal);
                      return null;
                    }
                    
                    return (
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

                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {/* Second row - Bottom 2 answers */}
                <View style={styles.answerRow}>
                  {question.answers.slice(2, 4).map((animal: any, index: number) => {
                    const actualIndex = index + 2;
                    
                    if (!animal || !animal.image) {
                      console.warn(`Invalid animal at index ${actualIndex}:`, animal);
                      return null;
                    }
                    
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
                  Platform: {Platform.OS}
                </Text>
                <Text style={styles.errorSubText}>
                  Očekivano: 4 odgovora, Pronađeno: {question.answers?.length || 0}
                </Text>
                <Text style={styles.errorSubText}>
                  Kategorija: {category?.name} ({category?.animals?.length || 0} životinja)
                </Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => {
                    console.log('Retrying question generation...');
                    generateQuestions();
                  }}
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