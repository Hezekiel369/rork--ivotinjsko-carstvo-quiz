import { Platform } from 'react-native';
import { Audio } from 'expo-av';

// Optimized image mapping with caching and Android compatibility
// Using smaller, faster loading images for better Android performance
const animalImageMap: Record<string, string> = {
  // Fallback images for premium categories (optimized for Android)
  monkey: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=200&h=200&fit=crop&auto=format&q=60",
  gorilla: "https://images.unsplash.com/photo-1555371363-27a37f8e8c46?w=200&h=200&fit=crop&auto=format&q=60",
  jaguar: "https://images.unsplash.com/photo-1517825738774-7de9363ef735?w=200&h=200&fit=crop&auto=format&q=60",
  camel: "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=200&h=200&fit=crop&auto=format&q=60",
  t_rex: "https://images.unsplash.com/photo-1606856110002-d0991ce78250?w=200&h=200&fit=crop&auto=format&q=60",
  orangutan: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=200&h=200&fit=crop&auto=format&q=60",
  panther: "https://images.unsplash.com/photo-1517825738774-7de9363ef735?w=200&h=200&fit=crop&auto=format&q=60",
  sloth: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
  toucan: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
  anaconda: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
  chameleon: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
  tapir: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
  scorpion: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
  snake: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
  lizard: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
  coyote: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
  fennec_fox: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
  meerkat: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
  desert_eagle: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
  antelope: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
  desert_tortoise: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60",
};

// Cache for loaded images to improve performance
const imageCache = new Map<string, string>();

export function getAnimalImage(imageUrl: string): string {
  // Check cache first for performance
  if (imageCache.has(imageUrl)) {
    return imageCache.get(imageUrl)!;
  }
  
  let finalUrl: string;
  
  // If it's already a full URL (from categories.ts), return it directly
  if (imageUrl && imageUrl.startsWith('http')) {
    finalUrl = imageUrl;
  } else {
    // Otherwise, check the fallback map for premium categories
    finalUrl = animalImageMap[imageUrl] || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=200&fit=crop&auto=format&q=60";
  }
  
  // Add to cache for faster subsequent loads
  imageCache.set(imageUrl, finalUrl);
  
  // Only log in development for performance
  if (__DEV__) {
    console.log('Loading image:', imageUrl.substring(0, 50), '...');
  }
  
  return finalUrl;
}

// Audio cache for sound effects
let applauseSound: Audio.Sound | null = null;
let sighSound: Audio.Sound | null = null;

// Initialize audio with better Android compatibility
export async function initializeAudio(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('Audio not supported on web platform');
    return;
  }
  
  try {
    // Set audio mode with Android-optimized settings
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    
    // Load applause sound with shorter timeout for better Android performance
    const loadApplausePromise = Audio.Sound.createAsync(
      { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
      { shouldPlay: false, volume: 0.7, isLooping: false }
    );
    
    const applauseTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Applause sound load timeout')), 3000)
    );
    
    try {
      const { sound: applause } = await Promise.race([loadApplausePromise, applauseTimeout]) as any;
      applauseSound = applause;
      console.log('Applause sound loaded successfully');
    } catch (error) {
      console.log('Failed to load applause sound (using fallback):', error);
      applauseSound = null;
    }
    
    // Load sigh sound with shorter timeout for better Android performance
    const loadSighPromise = Audio.Sound.createAsync(
      { uri: 'https://actions.google.com/sounds/v1/alarms/buzzer.ogg' },
      { shouldPlay: false, volume: 0.5, isLooping: false }
    );
    
    const sighTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Sigh sound load timeout')), 3000)
    );
    
    try {
      const { sound: sigh } = await Promise.race([loadSighPromise, sighTimeout]) as any;
      sighSound = sigh;
      console.log('Sigh sound loaded successfully');
    } catch (error) {
      console.log('Failed to load sigh sound (using fallback):', error);
      sighSound = null;
    }
    
    console.log('Audio initialization completed');
  } catch (error) {
    console.log('Audio initialization failed (continuing without audio):', error);
    applauseSound = null;
    sighSound = null;
  }
}

// Play applause sound for correct answers with Android optimization
export async function playApplauseSound(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('🎉 BRAVO! (Audio not available on web)');
    return;
  }
  
  try {
    if (applauseSound) {
      // Stop any currently playing sound first (Android compatibility)
      await applauseSound.stopAsync();
      await applauseSound.setPositionAsync(0);
      await applauseSound.playAsync();
    } else {
      console.log('🎉 BRAVO! (Audio not loaded)');
    }
  } catch (error) {
    console.log('🎉 BRAVO! (Audio playback failed):', error);
  }
}

// Play sigh sound for wrong answers with Android optimization
export async function playSighSound(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('😔 Try again! (Audio not available on web)');
    return;
  }
  
  try {
    if (sighSound) {
      // Stop any currently playing sound first (Android compatibility)
      await sighSound.stopAsync();
      await sighSound.setPositionAsync(0);
      await sighSound.playAsync();
    } else {
      console.log('😔 Try again! (Audio not loaded)');
    }
  } catch (error) {
    console.log('😔 Try again! (Audio playback failed):', error);
  }
}

// Preload images for better performance, especially on Android
export function preloadImages(imageUrls: string[]): void {
  if (Platform.OS === 'web') {
    // For web, preload images using Image constructor
    imageUrls.forEach(url => {
      try {
        const img = new Image();
        img.src = getAnimalImage(url);
      } catch {
        console.log('Failed to preload image on web:', url);
      }
    });
  } else {
    // For mobile (especially Android), prefetch images to improve loading
    imageUrls.forEach(url => {
      try {
        const finalUrl = getAnimalImage(url);
        // React Native will cache these automatically
        if (finalUrl && finalUrl.startsWith('http')) {
          // Trigger image loading by creating a temporary Image component reference
          const prefetchPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Prefetch timeout')), 3000);
            // This will trigger React Native's image caching
            const img = { uri: finalUrl };
            clearTimeout(timeout);
            resolve(img);
          });
          prefetchPromise.catch(() => {
            // Silently fail for prefetch errors
          });
        }
      } catch {
        // Silently continue if prefetch fails
      }
    });
  }
}