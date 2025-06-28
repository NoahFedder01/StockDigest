import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

// Helper to get token from localStorage (web) or SecureStore (mobile)
async function getToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token');
  } else {
    const SecureStore = require('expo-secure-store');
    return await SecureStore.getItemAsync('token');
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
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) throw new Error('Gemini API key not found');
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const promptText = `Give me a concise, plain-English summary of notable recent events relating to the stock or company: "${detail}". 
        Use bullet points, avoid financial advice, mention if the stock has been doing well lately, and keep it under 100 words. If the stock is not publically traded, explicitly mention that it isn't. Use the precise stock ticker in your response. DO NOT USE ITALICS OR BOLDING.`;
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
          }),
        });
        const data = await response.json();
        if (isMounted) setSummary(data.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary found.');
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
      style={{
        padding: 8,
        backgroundColor: '#fff',
        marginTop: 16,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}>
      <ThemedView style={{ flex: 1 }}>
        <ThemedText style={{ fontWeight: 'bold', fontSize: 24 }}>{detail}</ThemedText>
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
  const [input, setInput] = useState('');
  const [details, setDetails] = useState<{ id: string; detail: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Always use light mode
  const iconColor = Colors.light.tint;

  // Fetch stocks from backend on mount
  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const response = await fetch('http://192.168.0.21:3001/mystocks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch stocks');
        const data = await response.json();
        setDetails(
          data.stocks.map((symbol: string) => ({
            id: symbol,
            detail: symbol,
          }))
        );
      } catch (e: any) {
        setError(e.message || 'Failed to load stocks');
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  // Add a new stock to backend and UI
  const handleAddDetail = async () => {
    if (input.trim() === '') return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch('http://192.168.0.21:3001/mystocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ symbol: input }),
      });
      if (!response.ok) {
        throw new Error('Failed to add stock');
      }
      setDetails((prev) => [
        ...prev,
        { id: input, detail: input },
      ]);
      setInput('');
    } catch (e: any) {
      setError(e.message || 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  // Delete a stock from backend and UI
  const handleDeleteDetail = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch('http://192.168.0.21:3001/mystocks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ symbol: id }),
      });
      if (!response.ok) throw new Error('Failed to remove stock');
      setDetails((prev) => prev.filter((item) => item.id !== id));
    } catch (e: any) {
      setError(e.message || 'Failed to remove stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Ionicons
          name="bar-chart-outline"
          size={230}
          color={iconColor}
          style={{ marginTop: 15 }} // <-- Add this line to push the icon down
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
        {loading && <ThemedText>Loading...</ThemedText>}
        {error && <ThemedText style={{ color: 'red' }}>{error}</ThemedText>}
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