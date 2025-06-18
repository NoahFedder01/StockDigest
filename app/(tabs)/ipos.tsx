import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useEffect, useState } from 'react'; // Import useEffect and useState

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

export default function TabTwoScreen() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    // Below is the fixed prompt
    const textToSummarize = "Using Google Search for grounding, identify real IPOs released in the past week. Respond in 200 words, employing clear, understandable technical terms. Do not mention the google search, and assume I know that this should not be financial advice. Use bullet points. DO NOT USE ITALICS OR BOLDING.";
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
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Summary of Recent IPO Activity</ThemedText>
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
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});