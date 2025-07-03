import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Button, Platform, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_BASE_URL } from '../config/apiConfig'; // <-- updated import

type LoginScreenProps = {
  setIsSignedIn: (signedIn: boolean) => void;
  setShowSignUp: (show: boolean) => void;
};

async function saveToken(token: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem('token', token);
  } else {
    await SecureStore.setItemAsync('token', token);
  }
}

export default function LoginScreen({ setIsSignedIn, setShowSignUp }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage('Please enter username and password');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (e) {
        // If response is not JSON, data stays as {}
      }

      if (response.ok && data.token) {
        await saveToken(data.token);
        setIsSignedIn(true);
      } else {
        setMessage(data.error || 'Login failed');
      }
    } catch (error) {
      setMessage('Network error');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 6,
          marginBottom: 12,
          backgroundColor: '#fff',
          color: '#000',
        }}
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 6,
          marginBottom: 12,
          backgroundColor: '#fff',
          color: '#000',
        }}
        placeholderTextColor="#888"
      />
      <TouchableOpacity
        onPress={handleLogin}
        style={{
          backgroundColor: '#007AFF',
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Log In</Text>
      </TouchableOpacity>
      <Text style={{ color: '#000' }}>{message}</Text>
      <Button title="Don't have an account? Sign up" onPress={() => setShowSignUp(true)} />
    </View>
  );
}