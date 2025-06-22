import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Button, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

type SignUpScreenProps = {
  setShowSignUp: (show: boolean) => void;
};

async function saveToken(token: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem('token', token);
  } else {
    await SecureStore.setItemAsync('token', token);
  }
}

export default function SignUpScreen({ setShowSignUp }: SignUpScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    const res = await fetch('http://localhost:3001/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (data.token) {
      // Save JWT token for persistent login
      await saveToken(data.token);

      // Navigate to index.tsx (main app)
      router.replace('/');

      // Optionally clear form/message
      setUsername('');
      setPassword('');
      setMessage('');
    } else {
      setMessage(data.error || 'Sign up failed');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
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
        }}
        autoCapitalize="none"
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
        }}
      />
      <TouchableOpacity
        onPress={handleSignUp}
        style={{
          backgroundColor: '#007AFF',
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Sign Up</Text>
      </TouchableOpacity>
      <Text>{message}</Text>
      <View style={{ marginTop: 32 }}>
        <Button
          title="Already have an account? Log in"
          onPress={() => setShowSignUp(false)}
          color="#007AFF"
        />
      </View>
    </View>
  );
}