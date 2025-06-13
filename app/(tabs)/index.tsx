import { Image } from 'expo-image';
import { Platform, StyleSheet, Button } from 'react-native';
import React, { useEffect, useState } from 'react'; // Import useEffect and useState

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// This function creates the connection with Gemini
export async function getGeminiSummary(promptText: string) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Gemini API key is not defined. Make sure EXPO_PUBLIC_GEMINI_API_KEY is set in your .env file.");
    // Handle the error appropriately, maybe return or throw
    return null;
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error from Gemini API:', errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    // Assuming the summary is in data.candidates[0].content.parts[0].text
    // The actual path might vary based on the Gemini API response structure
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected response structure from Gemini API:", data);
      return "Could not extract summary.";
    }
  } catch (error) {
    console.error('Failed to fetch summary from Gemini:', error);
    // Handle the error appropriately
    return null;
  }
}

export default function HomeScreen() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    // This is the fixed prompt.
    // You can adjust this to be more specific or to ask about a different topic.
    // The phrase "drawing on common knowledge typically found through Google searches"
    // is a hint to the model about the type of information to use.
    const textToSummarize = "Grounding your answer using google search, what are some important things that have happened in finance in the past 24 hours?. Do not use any styled text in your answer, answer in technical terms, and answer in 200 words. Use some bullet points half way through";
    try {
      const result = await getGeminiSummary(textToSummarize);
      setSummary(result);
    } catch (e: any) {
      setError(e.message || "Failed to fetch summary");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch the summary when the component mounts
    fetchSummary();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Daily Summary of Recent Financial Events</ThemedText>
        {isLoading && <ThemedText>Loading summary from Gemini...</ThemedText>}
        {error && <ThemedText style={{ color: 'red' }}>Error: {error}</ThemedText>}
        {summary && <ThemedText>{summary}</ThemedText>}
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
