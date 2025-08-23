import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GameProvider } from "@/contexts/GameContext";

// Simple splash screen handling
try {
  SplashScreen.preventAutoHideAsync();
} catch (error) {
  console.log('SplashScreen preventAutoHideAsync failed:', error);
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="debug" options={{ headerShown: false }} />
      <Stack.Screen name="quiz" options={{ headerShown: false }} />
      <Stack.Screen name="level-complete" options={{ headerShown: false, presentation: "modal" }} />
      <Stack.Screen name="statistics" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app for platform:', Platform.OS);
        
        // Simple splash screen handling
        setTimeout(async () => {
          try {
            await SplashScreen.hideAsync();
            console.log('Splash screen hidden successfully');
          } catch (splashError) {
            console.log('Splash screen hide failed (continuing):', splashError);
          }
        }, 1000);
        
      } catch (error) {
        console.error('App initialization failed (continuing):', error);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GameProvider>
        <RootLayoutNav />
      </GameProvider>
    </GestureHandlerRootView>
  );
}