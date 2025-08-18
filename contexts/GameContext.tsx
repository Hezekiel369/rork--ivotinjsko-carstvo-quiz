import { useState, useEffect, useMemo, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { Platform } from "react-native";

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
  backgroundGradient: ["#1B5E20", "#FFEB3B"] as const,
};

export const [GameProvider, useGame] = createContextHook(() => {
  const [gameState, setGameState] = useState<GameState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGameState();
  }, []);

  const loadGameState = async () => {
    try {
      console.log('Loading game state for platform:', Platform.OS);
      
      // Simple AsyncStorage access for all platforms
      const stored = await AsyncStorage.getItem("gameState");
      
      if (stored) {
        try {
          const parsedState = JSON.parse(stored);
          console.log('Successfully loaded and parsed game state');
          
          // Validate the loaded state structure
          if (parsedState && 
              typeof parsedState === 'object' &&
              typeof parsedState.unlockedCategories === 'number' &&
              parsedState.unlockedCategories >= 1) {
            
            // Ensure background gradient uses the sun-like yellow
            const updatedState = {
              ...defaultState,
              ...parsedState,
              backgroundGradient: ["#1B5E20", "#FFEB3B"] as const
            };
            
            console.log('Using validated stored state');
            setGameState(updatedState);
          } else {
            console.log('Invalid stored state structure, using default');
            setGameState(defaultState);
          }
        } catch (parseError) {
          console.log('Failed to parse stored state JSON:', parseError);
          setGameState(defaultState);
        }
      } else {
        console.log('No stored state found, using default state');
        setGameState(defaultState);
      }
    } catch (error) {
      console.error("Error loading game state:", error);
      setGameState(defaultState);
    } finally {
      console.log('Game state loading completed');
      setIsLoading(false);
    }
  };

  const saveGameState = async (newState: GameState) => {
    try {
      console.log('Saving game state');
      
      // Validate state before saving
      if (!newState || typeof newState !== 'object') {
        console.error('Invalid state to save:', newState);
        return;
      }
      
      const stateToSave = {
        ...newState,
        backgroundGradient: ["#1B5E20", "#FFEB3B"] as const
      };
      
      // Update local state first for immediate UI response
      setGameState(stateToSave);
      
      // Save to AsyncStorage
      try {
        await AsyncStorage.setItem("gameState", JSON.stringify(stateToSave));
        console.log('Save completed successfully');
      } catch (saveError) {
        console.log('Save failed (UI already updated):', saveError);
      }
    } catch (error) {
      console.error("Error saving game state:", error);
      setGameState(newState);
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