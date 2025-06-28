import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export async function getGeminiSummary(promptText: string) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Gemini API key is not defined. Make sure EXPO_PUBLIC_GEMINI_API_KEY is set in your .env file.");
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
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error("Unexpected response structure from Gemini API:", data);
      return "Could not extract summary.";
    }
  } catch (error) {
    console.error('Failed to fetch summary from Gemini:', error);
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
    const textToSummarize = "Using Google Search for grounding, identify key financial events of the past 24 hours and relevant companies. Respond in 200 words, employing clear, understandable technical terms. Say the general trend (up / down) that the stock is having. Include bullet points after the first half of the answer, and do not use italics or bolding.";
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
    fetchSummary();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFFFFF', dark: '#141414' }}
      headerImage={
        <Image
          source={require('@/assets/images/best-stock-photo.png')}
          style={styles.reactLogo}
          contentFit="cover"
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Daily Summary of Recent Financial Events</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        {isLoading && <ThemedText>Loading...</ThemedText>}
        {error && <ThemedText style={{ color: 'red' }}>Error: {error}</ThemedText>}
        {summary && <ThemedText>{summary}</ThemedText>}
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
    width: '100%',
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
