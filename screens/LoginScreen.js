// screens/LoginScreen.js
import React, { useState, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { ThemeContext } from '../contexts/ThemeContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { theme, themes } = useContext(ThemeContext);
  const auth = getAuth();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themes[theme].background }]}>
      <TextInput
        style={[styles.input, { 
          borderColor: themes[theme].border,
          color: themes[theme].text 
        }]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor={themes[theme].text}
      />
      <TextInput
        style={[styles.input, { 
          borderColor: themes[theme].border,
          color: themes[theme].text 
        }]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={themes[theme].text}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: themes[theme].primary }]}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={{ color: themes[theme].text }}>
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  error: {
    color: '#F44336',
    marginBottom: 10,
  },
});