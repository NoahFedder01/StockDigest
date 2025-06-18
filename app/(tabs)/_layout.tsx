import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'myStocks') {
            return <Ionicons name="bar-chart-outline" size={size} color={color} />;
          }
          if (route.name === 'ipos') {
            return <Ionicons name="trending-up-outline" size={size} color={color} />;
          }
          if (route.name === 'settings') {
            return <Ionicons name="settings-outline" size={size} color={color} />;
          }
          if (route.name === 'index') {
            return <Ionicons name="home-outline" size={size} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="myStocks"
        options={{
          title: 'My Stocks',
        }}
      />
      <Tabs.Screen
        name="ipos"
        options={{
          title: 'IPOs',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
