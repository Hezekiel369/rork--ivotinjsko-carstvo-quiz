import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GameProvider } from "@/contexts/GameContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
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
        
        // Android-specific optimizations with better error handling
        if (Platform.OS === 'android') {
          try {
            // Set status bar style for better Android compatibility
            StatusBar.setBarStyle('light-content', true);
            StatusBar.setBackgroundColor('#1B5E20', true);
            console.log('Android status bar configured');
          } catch (statusError) {
            console.log('Status bar configuration failed:', statusError);
          }
        }
        
        // Improved splash screen handling with better Android support
        const hideDelay = Platform.OS === 'android' ? 1000 : 300;
        
        setTimeout(async () => {
          try {
            await SplashScreen.hideAsync();
            console.log('Splash screen hidden successfully');
          } catch (splashError) {
            console.log('Splash screen hide failed:', splashError);
          }
        }, hideDelay);
        
      } catch (error) {
        console.error('App initialization failed:', error);
        // Fallback: still try to hide splash screen
        setTimeout(() => {
          SplashScreen.hideAsync().catch(() => {
            console.log('Fallback splash screen hide also failed');
          });
        }, 1500);
      }
    };
    
    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <GameProvider>
          <RootLayoutNav />
        </GameProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}