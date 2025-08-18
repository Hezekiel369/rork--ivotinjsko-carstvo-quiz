// Optimized image mapping using the actual uploaded images from categories.ts
// This prevents slow loading and network dependency issues
const animalImageMap: Record<string, string> = {

  // Fallback images for premium categories (optimized for performance)
  monkey: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=300&h=300&fit=crop&auto=format&q=75",
  gorilla: "https://images.unsplash.com/photo-1555371363-27a37f8e8c46?w=300&h=300&fit=crop&auto=format&q=75",
  jaguar: "https://images.unsplash.com/photo-1517825738774-7de9363ef735?w=300&h=300&fit=crop&auto=format&q=75",
  camel: "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=300&h=300&fit=crop&auto=format&q=75",
  t_rex: "https://images.unsplash.com/photo-1606856110002-d0991ce78250?w=300&h=300&fit=crop&auto=format&q=75",
};

export function getAnimalImage(imageUrl: string): string {
  console.log('Loading image:', imageUrl);
  
  // If it's already a full URL (from categories.ts), return it directly
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Otherwise, check the fallback map for premium categories
  return animalImageMap[imageUrl] || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&h=300&fit=crop&auto=format&q=75";
}