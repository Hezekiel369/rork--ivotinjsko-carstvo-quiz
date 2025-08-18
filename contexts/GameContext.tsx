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
      
      // Simplified Android approach to avoid remote update conflicts
      let stored: string | null = null;
      const isAndroid = Platform.OS === ('android' as any);
      
      if (isAndroid) {
        // For Android, use very simple approach to avoid conflicts with remote updates
        try {
          console.log('Android - attempting simple AsyncStorage access');
          stored = await AsyncStorage.getItem("gameState");
          console.log('Android AsyncStorage access completed');
        } catch (androidError) {
          console.log('Android AsyncStorage failed, using default state:', androidError);
          stored = null;
        }
      } else {
        // Non-Android platforms (iOS, web) - with timeout
        try {
          const loadPromise = AsyncStorage.getItem("gameState");
          const timeoutPromise = new Promise<string | null>((_, reject) => 
            setTimeout(() => reject(new Error('AsyncStorage timeout')), 3000)
          );
          
          stored = await Promise.race([loadPromise, timeoutPromise]);
        } catch (nonAndroidError) {
          console.log('Non-Android AsyncStorage failed:', nonAndroidError);
          stored = null;
        }
      }
      
      if (stored) {
        try {
          const parsedState = JSON.parse(stored);
          console.log('Successfully loaded and parsed game state:', parsedState);
          
          // Validate the loaded state structure with more thorough checks
          if (parsedState && 
              typeof parsedState === 'object' &&
              typeof parsedState.unlockedCategories === 'number' &&
              parsedState.unlockedCategories >= 1 &&
              parsedState.backgroundGradient && 
              Array.isArray(parsedState.backgroundGradient) &&
              parsedState.backgroundGradient.length >= 2) {
            
            // Ensure background gradient uses the sun-like yellow
            const updatedState = {
              ...defaultState, // Start with defaults
              ...parsedState, // Override with stored values
              backgroundGradient: ["#1B5E20", "#FFEB3B"] as const // Force correct gradient
            };
            
            console.log('Using validated stored state');
            setGameState(updatedState);
          } else {
            console.log('Invalid stored state structure, using default. Stored:', parsedState);
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
      console.error("Critical error loading game state:", error);
      setGameState(defaultState);
    } finally {
      console.log('Game state loading completed');
      setIsLoading(false);
    }
  };

  const saveGameState = async (newState: GameState) => {
    try {
      console.log('Saving game state for platform:', Platform.OS);
      const isAndroid = Platform.OS === ('android' as any);
      
      // Validate state before saving
      if (!newState || typeof newState !== 'object') {
        console.error('Invalid state to save:', newState);
        return;
      }
      
      const stateToSave = {
        ...newState,
        backgroundGradient: ["#1B5E20", "#FFEB3B"] as const // Ensure correct gradient
      };
      
      // Update local state first for immediate UI response
      setGameState(stateToSave);
      
      if (isAndroid) {
        // For Android, use fire-and-forget approach to avoid blocking UI
        AsyncStorage.setItem("gameState", JSON.stringify(stateToSave))
          .then(() => {
            console.log('Android save completed successfully');
          })
          .catch((saveError) => {
            console.log('Android save failed (UI already updated):', saveError);
          });
      } else {
        // Non-Android platforms - still use await but with timeout
        try {
          const savePromise = AsyncStorage.setItem("gameState", JSON.stringify(stateToSave));
          const timeoutPromise = new Promise<void>((_, reject) => 
            setTimeout(() => reject(new Error('Save timeout')), 2000)
          );
          
          await Promise.race([savePromise, timeoutPromise]);
          console.log('Non-Android save completed successfully');
        } catch (saveError) {
          console.log('Non-Android save failed (UI already updated):', saveError);
        }
      }
    } catch (error) {
      console.error("Critical error saving game state:", error);
      // Still update local state for UI consistency
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