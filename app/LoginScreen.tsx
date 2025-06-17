import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Button } from 'react-native';
import { useRouter } from 'expo-router'; // If using Expo Router

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch('http://localhost:3001/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.token) {
      setMessage('Login successful!');
      // Save token securely (e.g., with expo-secure-store)
      // await SecureStore.setItemAsync('jwt', data.token);
      // router.replace('/MainAppScreen'); // Uncomment and adjust as needed
    } else {
      setMessage(data.error);
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
      <Text>{message}</Text>

      {/* Button to go to Sign Up */}
      <View style={{ marginTop: 32 }}>
        <Button
          title="Don't have an account? Sign up"
          onPress={() => router.push('/SignUpScreen')}
          color="#007AFF"
        />
      </View>
    </View>
  );
}