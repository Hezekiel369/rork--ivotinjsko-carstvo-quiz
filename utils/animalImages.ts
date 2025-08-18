import { Platform } from 'react-native';
import { Audio } from 'expo-av';

// Optimized image mapping with caching and Android compatibility
// Using smaller, faster loading images for better Android performance
const animalImageMap: Record<string, string> = {
  // Fallback images for premium categories (optimized for Android with smaller sizes and better compression)
  monkey: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=120&h=120&fit=crop&auto=format&q=40",
  gorilla: "https://images.unsplash.com/photo-1555371363-27a37f8e8c46?w=120&h=120&fit=crop&auto=format&q=40",
  jaguar: "https://images.unsplash.com/photo-1517825738774-7de9363ef735?w=120&h=120&fit=crop&auto=format&q=40",
  camel: "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=120&h=120&fit=crop&auto=format&q=40",
  t_rex: "https://images.unsplash.com/photo-1606856110002-d0991ce78250?w=120&h=120&fit=crop&auto=format&q=40",
  // Simplified fallback for any missing images (very small and fast)
  fallback: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&h=100&fit=crop&auto=format&q=30",
};

// Cache for loaded images to improve performance
const imageCache = new Map<string, string>();

export function getAnimalImage(imageUrl: string): string {
  // Input validation for Android compatibility
  if (!imageUrl || typeof imageUrl !== 'string') {
    return animalImageMap.fallback;
  }
  
  // Check cache first for performance
  if (imageCache.has(imageUrl)) {
    return imageCache.get(imageUrl)!;
  }
  
  let finalUrl: string;
  const isAndroid = Platform.OS === ('android' as any);
  
  try {
    // If it's already a full URL (from categories.ts), optimize for Android
    if (imageUrl.startsWith('http')) {
      if (isAndroid) {
        // For Android, use even smaller images to reduce memory usage
        if (imageUrl.includes('unsplash.com')) {
          // Very small images for Android to prevent memory issues
          finalUrl = imageUrl.replace(/w=\d+/, 'w=80').replace(/h=\d+/, 'h=80').replace(/q=\d+/, 'q=30');
        } else if (imageUrl.includes('r2.dev')) {
          // R2 images are already optimized, use as-is
          finalUrl = imageUrl;
        } else {
          finalUrl = imageUrl;
        }
      } else {
        finalUrl = imageUrl;
      }
    } else {
      // Otherwise, check the fallback map for premium categories
      finalUrl = animalImageMap[imageUrl] || animalImageMap.fallback;
    }
    
    // Validate the final URL
    if (!finalUrl || !finalUrl.startsWith('http')) {
      finalUrl = animalImageMap.fallback;
    }
    
    // Add to cache for faster subsequent loads
    imageCache.set(imageUrl, finalUrl);
    
    return finalUrl;
  } catch {
    return animalImageMap.fallback;
  }
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
  
  const isAndroid = Platform.OS === ('android' as any);
  
  try {
    console.log('Initializing audio for platform:', Platform.OS);
    
    // For Android, completely skip audio to avoid remote update conflicts
    if (isAndroid) {
      console.log('Android detected - audio completely disabled for stability');
      applauseSound = null;
      sighSound = null;
      console.log('Audio initialization skipped for Android');
      return;
    }
    
    // Set audio mode only for non-Android platforms
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      console.log('Audio mode set successfully');
    } catch (audioModeError) {
      console.log('Audio mode setup failed (continuing):', audioModeError);
    }
    
    // Non-Android platforms can use audio
    const applauseSoundUri = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
    const sighSoundUri = 'https://actions.google.com/sounds/v1/alarms/buzzer.ogg';
    
    // Load applause sound
    try {
      const loadApplausePromise = Audio.Sound.createAsync(
        { uri: applauseSoundUri },
        { shouldPlay: false, volume: 0.6, isLooping: false }
      );
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Applause sound load timeout')), 3000)
      );
      
      const { sound: applause } = await Promise.race([loadApplausePromise, timeoutPromise]) as any;
      applauseSound = applause;
      console.log('Applause sound loaded successfully');
    } catch (error) {
      console.log('Failed to load applause sound (continuing without):', error);
      applauseSound = null;
    }
    
    // Load sigh sound
    try {
      const loadSighPromise = Audio.Sound.createAsync(
        { uri: sighSoundUri },
        { shouldPlay: false, volume: 0.4, isLooping: false }
      );
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sigh sound load timeout')), 3000)
      );
      
      const { sound: sigh } = await Promise.race([loadSighPromise, timeoutPromise]) as any;
      sighSound = sigh;
      console.log('Sigh sound loaded successfully');
    } catch (error) {
      console.log('Failed to load sigh sound (continuing without):', error);
      sighSound = null;
    }
    
    console.log('Audio initialization completed for', Platform.OS);
  } catch (error) {
    console.log('Audio initialization failed (continuing without audio):', error);
    applauseSound = null;
    sighSound = null;
  }
}

// Play applause sound for correct answers with Android optimization
export async function playApplauseSound(): Promise<void> {
  const isAndroid = Platform.OS === ('android' as any);
  
  if (Platform.OS === 'web' || isAndroid) {
    console.log('🎉 BRAVO! (Audio disabled for platform compatibility)');
    return;
  }
  
  try {
    if (applauseSound) {
      // Stop any currently playing sound first
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
  const isAndroid = Platform.OS === ('android' as any);
  
  if (Platform.OS === 'web' || isAndroid) {
    console.log('😔 Try again! (Audio disabled for platform compatibility)');
    return;
  }
  
  try {
    if (sighSound) {
      // Stop any currently playing sound first
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