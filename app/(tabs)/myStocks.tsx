import { Image } from 'expo-image';
import { Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native'; // <-- Add TouchableOpacity

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useEffect, useState } from 'react';

// This function creates the connection with Gemini
export async function getGeminiSummary(inputString: string) {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key not found');
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // Use the input string in your prompt
  const promptText = `Give me a concise, plain-English summary of notable recent events relating to the stock or company: "${inputString}". 
  Use bullet points, avoid financial advice, mention if the stock has been doing well lately, and keep it under 100 words. If the stock is not publically traded, explicitly mention that it isn't. Use the precise stock ticker in your response. DO NOT USE ITALICS OR BOLDING.`;

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

    const data = await response.json();

    // Adjust this depending on Gemini's response structure
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary found.';
  } catch (error) {
    throw new Error('Failed to fetch summary');
  }
}

// StockDetail now receives an onDelete prop and an id
function StockDetail({
  id,
  detail,
  onDelete,
}: {
  id: string;
  detail: string;
  onDelete: (id: string) => void;
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        // Pass the detail string as the query to Gemini
        const result = await getGeminiSummary(detail);
        if (isMounted) setSummary(result);
      } catch (e: any) {
        if (isMounted) setError(e.message || 'Failed to fetch summary');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, [detail]);

  return (
    <ThemedView
        style={{ padding: 8,
        backgroundColor: '#fff',
        marginTop: 16,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    }}>
      <ThemedView style={{ flex: 1 }}>
        <ThemedText>{detail}</ThemedText>
        {loading && <ThemedText>Loading summary...</ThemedText>}
        {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
        {summary && <ThemedText>{summary}</ThemedText>}
      </ThemedView>
      <TouchableOpacity
        onPress={() => onDelete(id)}
        style={{
          backgroundColor: '#FF3B30',
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 6,
          marginLeft: 12,
        }}
      >
        <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Remove</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

export default function TabTwoScreen() {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [input, setInput] = useState('');
  const [details, setDetails] = useState<{ id: string; detail: string }[]>([]);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    // Below is the fixed prompt
    const textToSummarize = "Using Google Search for grounding, identify real IPOs released in the past week. Respond in 200 words, employing clear, understandable technical terms. Do not mention the google search, and assume I know that this should not be financial advice. Use bullet points, and DO NOT USE ITALICS OR BOLDING.";
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

  // Add a new detail
  const handleAddDetail = () => {
    if (input.trim() === '') return;
    setDetails((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random().toString(36).slice(2), detail: input },
    ]);
    setInput('');
  };

  // Delete a detail by id
  const handleDeleteDetail = (id: string) => {
    setDetails((prev) => prev.filter((item) => item.id !== id));
  };

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
        <ThemedText type="title">Stocks You Are Watching</ThemedText>
      </ThemedView>
      <ThemedView style={{ flex: 1, padding: 24 }}>
        <TextInput
          placeholder="Enter Stock Ticker or Name"
          value={input}
          onChangeText={setInput}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 8,
            marginBottom: 12,
            borderRadius: 4,
          }}
        />
        <TouchableOpacity
          onPress={handleAddDetail}
          style={{
            backgroundColor: '#007A7F',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>
            Add Stock To Watchlist
          </ThemedText>
        </TouchableOpacity>
        {details.map((item) => (
          <StockDetail
            key={item.id}
            id={item.id}
            detail={item.detail}
            onDelete={handleDeleteDetail}
          />
        ))}
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