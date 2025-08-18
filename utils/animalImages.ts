import { Platform } from 'react-native';
import { Audio } from 'expo-av';

// Optimized image mapping with caching and Android compatibility
// This prevents slow loading and network dependency issues
const animalImageMap: Record<string, string> = {
  // Fallback images for premium categories (optimized for performance)
  monkey: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=300&h=300&fit=crop&auto=format&q=75",
  gorilla: "https://images.unsplash.com/photo-1555371363-27a37f8e8c46?w=300&h=300&fit=crop&auto=format&q=75",
  jaguar: "https://images.unsplash.com/photo-1517825738774-7de9363ef735?w=300&h=300&fit=crop&auto=format&q=75",
  camel: "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=300&h=300&fit=crop&auto=format&q=75",
  t_rex: "https://images.unsplash.com/photo-1606856110002-d0991ce78250?w=300&h=300&fit=crop&auto=format&q=75",
  orangutan: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=300&h=300&fit=crop&auto=format&q=75",
  panther: "https://images.unsplash.com/photo-1517825738774-7de9363ef735?w=300&h=300&fit=crop&auto=format&q=75",
  sloth: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
  toucan: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
  anaconda: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
  chameleon: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
  tapir: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
  scorpion: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
  snake: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
  lizard: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
  coyote: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
  fennec_fox: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
  meerkat: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
  desert_eagle: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
  antelope: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
  desert_tortoise: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75",
};

// Cache for loaded images to improve performance
const imageCache = new Map<string, string>();

export function getAnimalImage(imageUrl: string): string {
  // Check cache first
  if (imageCache.has(imageUrl)) {
    return imageCache.get(imageUrl)!;
  }
  
  let finalUrl: string;
  
  // If it's already a full URL (from categories.ts), return it directly
  if (imageUrl && imageUrl.startsWith('http')) {
    finalUrl = imageUrl;
  } else {
    // Otherwise, check the fallback map for premium categories
    finalUrl = animalImageMap[imageUrl] || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75";
  }
  
  // Add to cache
  imageCache.set(imageUrl, finalUrl);
  
  console.log('Loading image:', imageUrl, '-> Final URL:', finalUrl);
  return finalUrl;
}

// Audio cache for sound effects
let applauseSound: Audio.Sound | null = null;
let sighSound: Audio.Sound | null = null;

// Initialize audio
export async function initializeAudio(): Promise<void> {
  if (Platform.OS === 'web') {
    return; // Skip audio initialization on web for now
  }
  
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    
    // Load applause sound (using a simple audio URL)
    try {
      const { sound: applause } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
        { shouldPlay: false, volume: 0.7 }
      );
      applauseSound = applause;
    } catch (error) {
      console.log('Failed to load applause sound:', error);
    }
    
    // Load sigh sound (using a simple audio URL)
    try {
      const { sound: sigh } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/alarms/buzzer.ogg' },
        { shouldPlay: false, volume: 0.5 }
      );
      sighSound = sigh;
    } catch (error) {
      console.log('Failed to load sigh sound:', error);
    }
    
    console.log('Audio initialized successfully');
  } catch (error) {
    console.log('Audio initialization failed:', error);
  }
}

// Play applause sound for correct answers
export async function playApplauseSound(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('🎉 BRAVO! (Audio not available on web)');
    return;
  }
  
  try {
    if (applauseSound) {
      await applauseSound.replayAsync();
    }
  } catch (error) {
    console.log('Failed to play applause sound:', error);
  }
}

// Play sigh sound for wrong answers
export async function playSighSound(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('😔 Try again! (Audio not available on web)');
    return;
  }
  
  try {
    if (sighSound) {
      await sighSound.replayAsync();
    }
  } catch (error) {
    console.log('Failed to play sigh sound:', error);
  }
}

// Preload images for better performance
export function preloadImages(imageUrls: string[]): void {
  if (Platform.OS === 'web') {
    // For web, preload images using Image constructor
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = getAnimalImage(url);
    });
  }
  // For mobile, React Native handles image caching automatically
}