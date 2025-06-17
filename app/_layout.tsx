import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { Platform, View, TouchableOpacity, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  // Unified get/set/remove for JWT
  const getJWT = async () => {
    if (Platform.OS === 'web') {
      return localStorage.getItem('jwt');
    } else {
      return await SecureStore.getItemAsync('jwt');
    }
  };

  const setJWT = async (token: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('jwt', token);
    } else {
      await SecureStore.setItemAsync('jwt', token);
    }
  };

  const removeJWT = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('jwt');
    } else {
      await SecureStore.deleteItemAsync('jwt');
    }
  };

  useEffect(() => {
    const checkToken = async () => {
      const token = await getJWT();
      setIsSignedIn(!!token);
    };
    checkToken();
  }, []);

  const handleSignOut = async () => {
    await removeJWT();
    setIsSignedIn(false);
  };

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  if (isSignedIn === null) {
    // Optionally show a splash/loading screen here
    return null;
  }

  if (!isSignedIn) {
    // Show authentication stack if not signed in
    return (
      <Stack>
        <Stack.Screen name="SignUpScreen" options={{ headerShown: false }} />
        <Stack.Screen name="LoginScreen" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // If signed in, render the rest of your app (tabs, etc.)
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingTop: 50, paddingHorizontal: 16, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              backgroundColor: '#FF3B30',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        <Stack>
          <Stack.Screen name="tabs" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}
