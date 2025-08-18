import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function DebugScreen() {
  return (
    <LinearGradient colors={['#1B5E20', '#FFEB3B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Debug Screen</Text>
          <Text style={styles.info}>Platform: {Platform.OS}</Text>
          <Text style={styles.info}>Version: {Platform.Version}</Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/')}
          >
            <Text style={styles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => {
              console.log('Test log from debug screen');
              console.log('Platform details:', {
                OS: Platform.OS,
                Version: Platform.Version
              });
            }}
          >
            <Text style={styles.buttonText}>Test Console Log</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  info: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 10,
    opacity: 0.9,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 15,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});