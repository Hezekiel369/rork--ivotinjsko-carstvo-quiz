import { useState, useEffect, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";

interface GameState {
  unlockedCategories: number;
  categoryStars: Record<number, number>;
  totalAttempts: number;
  correctAnswers: number;
  backgroundGradient: readonly [string, string, ...string[]];
}

const defaultState: GameState = {
  unlockedCategories: 1,
  categoryStars: {},
  totalAttempts: 0,
  correctAnswers: 0,
  backgroundGradient: ["#1B5E20", "#5D4037"] as const,
};

export const [GameProvider, useGame] = createContextHook(() => {
  const [gameState, setGameState] = useState<GameState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    try {
      const stored = await AsyncStorage.getItem("gameState");
      if (stored) {
        setGameState(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading game state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGameState = async (newState: GameState) => {
    try {
      await AsyncStorage.setItem("gameState", JSON.stringify(newState));
      setGameState(newState);
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  };

  const completeCategory = useCallback((categoryId: number, correctCount: number) => {
    const stars = correctCount === 0 ? 0 : correctCount === 1 ? 1 : correctCount <= 9 ? 2 : 3;
    
    const newState = {
      ...gameState,
      categoryStars: {
        ...gameState.categoryStars,
        [categoryId]: Math.max(gameState.categoryStars[categoryId] || 0, stars),
      },
      totalAttempts: gameState.totalAttempts + 10,
      correctAnswers: gameState.correctAnswers + correctCount,
      unlockedCategories: stars === 3 
        ? Math.max(gameState.unlockedCategories, Math.min(categoryId + 1, 5))
        : gameState.unlockedCategories,
    };
    
    saveGameState(newState);
  }, [gameState]);

  const setBackgroundGradient = useCallback((colors: readonly [string, string, ...string[]]) => {
    const newState = {
      ...gameState,
      backgroundGradient: colors,
    };
    saveGameState(newState);
  }, [gameState]);

  const resetProgress = useCallback(() => {
    saveGameState(defaultState);
  }, []);

  return useMemo(() => ({
    ...gameState,
    isLoading,
    completeCategory,
    setBackgroundGradient,
    resetProgress,
  }), [gameState, isLoading, completeCategory, setBackgroundGradient, resetProgress]);
});