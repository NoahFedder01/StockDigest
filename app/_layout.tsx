import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';

function RootLayoutInner() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { isSignedIn, setIsSignedIn } = useAuth(); // <-- add setIsSignedIn here
  const [showSignUp, setShowSignUp] = React.useState(false);

  if (!loaded) {
    return null;
  }

  if (!isSignedIn) {
    return showSignUp ? (
      <SignUpScreen setShowSignUp={setShowSignUp} />
    ) : (
      <LoginScreen setIsSignedIn={setIsSignedIn} setShowSignUp={setShowSignUp} /> // <-- pass setIsSignedIn
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" backgroundColor="#fff" translucent={false}/>
      </View>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}
