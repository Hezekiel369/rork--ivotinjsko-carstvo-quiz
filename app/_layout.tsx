import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, Component, ReactNode } from "react";
import { Platform, StatusBar, AppState, View, Text, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GameProvider } from "@/contexts/GameContext";

// Error Boundary for Android stability
class AndroidErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('AndroidErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AndroidErrorBoundary componentDidCatch:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ 
          flex: 1, 
          backgroundColor: '#1B5E20', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 20
        }}>
          <Text style={{ 
            color: '#FFF', 
            fontSize: 24, 
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20
          }}>
            Greška u aplikaciji
          </Text>
          <Text style={{ 
            color: '#FFF', 
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 30,
            opacity: 0.8
          }}>
            Platform: {Platform.OS}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#2E7D32',
              paddingHorizontal: 30,
              paddingVertical: 15,
              borderRadius: 25
            }}
            onPress={() => {
              this.setState({ hasError: false, error: undefined });
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '600' }}>
              Pokušaj ponovo
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Prevent auto-hide with better Android error handling
if (Platform.OS !== 'android') {
  try {
    SplashScreen.preventAutoHideAsync();
  } catch (error) {
    console.log('SplashScreen preventAutoHideAsync failed:', error);
  }
} else {
  // For Android, use simpler approach to avoid remote update issues
  console.log('Android detected - skipping splash screen prevention');
}

// Optimized QueryClient for Android with better error handling
const isAndroid = Platform.OS === ('android' as any);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: isAndroid ? 1 : 3,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
    mutations: {
      retry: isAndroid ? 1 : 2,
    },
  },
});

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
        
        // Android-specific optimizations with comprehensive error handling
        if (isAndroid) {
          try {
            // Set status bar style for better Android compatibility
            StatusBar.setBarStyle('light-content', true);
            StatusBar.setBackgroundColor('#1B5E20', true);
            console.log('Android status bar configured');
          } catch (statusError) {
            console.log('Status bar configuration failed (continuing):', statusError);
          }
          
          // Android-specific app state handling
          const handleAppStateChange = (nextAppState: string) => {
            console.log('App state changed to:', nextAppState);
            if (nextAppState === 'active') {
              console.log('App became active - Android optimization');
            }
          };
          
          const subscription = AppState.addEventListener('change', handleAppStateChange);
          
          // Cleanup function
          return () => {
            subscription?.remove();
          };
        }
        
        // Improved splash screen handling with progressive delays for Android
        const hideDelay = isAndroid ? 1000 : 500;
        
        setTimeout(async () => {
          try {
            if (Platform.OS !== 'android') {
              await SplashScreen.hideAsync();
              console.log('Splash screen hidden successfully');
            } else {
              console.log('Android - splash screen handling skipped for stability');
            }
          } catch (splashError) {
            console.log('Splash screen hide failed (continuing):', splashError);
            // Don't throw error, just continue
          }
        }, hideDelay);
        
      } catch (error) {
        console.error('App initialization failed (continuing):', error);
        // Fallback: still try to hide splash screen after longer delay
        if (Platform.OS !== 'android') {
          setTimeout(() => {
            SplashScreen.hideAsync().catch((fallbackError) => {
              console.log('Fallback splash screen hide also failed:', fallbackError);
            });
          }, 3000);
        }
      }
    };
    
    initializeApp();
  }, []);

  return (
    <AndroidErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GameProvider>
            <RootLayoutNav />
          </GameProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </AndroidErrorBoundary>
  );
}