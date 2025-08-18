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
  backgroundGradient: ["#1B5E20", "#FFF59D"] as const,
};

export const [GameProvider, useGame] = createContextHook(() => {
  const [gameState, setGameState] = useState<GameState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    try {
      console.log('Loading game state...');
      
      // Add timeout for Android compatibility
      const loadPromise = AsyncStorage.getItem("gameState");
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AsyncStorage timeout')), 5000)
      );
      
      const stored = await Promise.race([loadPromise, timeoutPromise]) as string | null;
      
      if (stored) {
        const parsedState = JSON.parse(stored);
        console.log('Loaded game state:', parsedState);
        
        // Validate the loaded state structure
        if (parsedState && 
            typeof parsedState.unlockedCategories === 'number' &&
            parsedState.backgroundGradient && 
            Array.isArray(parsedState.backgroundGradient) &&
            parsedState.backgroundGradient.length >= 2) {
          // Ensure background gradient uses the new lighter yellow
          const updatedState = {
            ...parsedState,
            backgroundGradient: parsedState.backgroundGradient[1] === '#FFEB3B' 
              ? ["#1B5E20", "#FFF59D"] as const
              : parsedState.backgroundGradient
          };
          setGameState(updatedState);
        } else {
          console.log('Invalid stored state structure, using default');
          setGameState(defaultState);
        }
      } else {
        console.log('No stored state found, using default');
        setGameState(defaultState);
      }
    } catch (error) {
      console.error("Error loading game state:", error);
      setGameState(defaultState);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGameState = async (newState: GameState) => {
    try {
      console.log('Saving game state:', newState);
      await AsyncStorage.setItem("gameState", JSON.stringify(newState));
      setGameState(newState);
    } catch (error) {
      console.error("Error saving game state:", error);
      // Don't update state if save failed
    }
  };

  const completeCategory = useCallback((categoryId: number, correctCount: number) => {
    const stars = correctCount === 10 ? 3 : correctCount >= 2 ? 2 : correctCount === 1 ? 1 : 0;
    
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