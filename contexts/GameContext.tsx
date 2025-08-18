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
      
      // Android-specific AsyncStorage handling with multiple fallback strategies
      let stored: string | null = null;
      const isAndroid = Platform.OS === ('android' as any);
      
      if (isAndroid) {
        // Android-specific loading with extended timeout and retries
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries && stored === null) {
          try {
            console.log(`Android AsyncStorage attempt ${retryCount + 1}/${maxRetries}`);
            
            const loadPromise = AsyncStorage.getItem("gameState");
            const timeoutPromise = new Promise<string | null>((_, reject) => 
              setTimeout(() => reject(new Error('AsyncStorage timeout')), 5000 + (retryCount * 2000))
            );
            
            stored = await Promise.race([loadPromise, timeoutPromise]);
            
            if (stored !== null) {
              console.log('Android AsyncStorage success on attempt', retryCount + 1);
              break;
            }
          } catch (attemptError) {
            console.log(`Android AsyncStorage attempt ${retryCount + 1} failed:`, attemptError);
            retryCount++;
            
            if (retryCount < maxRetries) {
              // Wait before retry with exponential backoff
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
        }
        
        // Final fallback for Android
        if (stored === null && retryCount >= maxRetries) {
          console.log('All Android AsyncStorage attempts failed, trying direct access...');
          try {
            stored = await AsyncStorage.getItem("gameState");
          } catch (directError) {
            console.log('Android direct AsyncStorage access failed:', directError);
            stored = null;
          }
        }
      } else {
        // Non-Android platforms (iOS, web) - simpler approach
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
      
      if (isAndroid) {
        // Android-specific saving with retries
        let saveSuccess = false;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (!saveSuccess && retryCount < maxRetries) {
          try {
            console.log(`Android save attempt ${retryCount + 1}/${maxRetries}`);
            
            const savePromise = AsyncStorage.setItem("gameState", JSON.stringify(stateToSave));
            const timeoutPromise = new Promise<void>((_, reject) => 
              setTimeout(() => reject(new Error('Save timeout')), 5000)
            );
            
            await Promise.race([savePromise, timeoutPromise]);
            saveSuccess = true;
            console.log('Android save successful on attempt', retryCount + 1);
          } catch (saveError) {
            console.log(`Android save attempt ${retryCount + 1} failed:`, saveError);
            retryCount++;
            
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
          }
        }
        
        if (!saveSuccess) {
          console.error('All Android save attempts failed');
          // Still update local state even if save failed
          setGameState(stateToSave);
          return;
        }
      } else {
        // Non-Android platforms
        await AsyncStorage.setItem("gameState", JSON.stringify(stateToSave));
      }
      
      // Update local state only after successful save
      setGameState(stateToSave);
      console.log('Game state saved and updated successfully');
    } catch (error) {
      console.error("Critical error saving game state:", error);
      // Update local state anyway to prevent UI inconsistency
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