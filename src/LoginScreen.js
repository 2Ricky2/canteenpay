import axios from 'axios';
import React, {useState} from 'react';
import {Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function LoginScreen({navigation}) {
  const [mode, setMode] = useState('login');
  const [form, setForm] =
      useState({name: '', email: '', pass: '', confirm: ''});

  const updateField = (key, value) =>
      setForm(prev => ({...prev, [key]: value}));

  const handleAuth = async () => {
    const {name, email, pass, confirm} = form;

    if (!email || !pass || (mode === 'signup' && !name)) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    try {
      if (mode === 'login') {
        const res = await axios.post('http://192.168.0.126:3000/login', {
          user_email: email,
          user_pass: pass,
        });

        if (res.data.success) {
  const { username, role } = res.data.user;
  Alert.alert('Welcome', `Hello ${username}`);

          
          if (role === 'admin') {
            navigation.replace('AdminDashboard', { user: res.data.user });
          } else {
            navigation.replace('Dashboard', { user: res.data.user });
          }
        } else {
          Alert.alert('Login Failed', res.data.message);
        }
      } else {
        if (pass !== confirm) {
          Alert.alert('Error', 'Passwords do not match.');
          return;
        }

        const res = await axios.post('http://192.168.0.126:3000/signup',
          {
          user_name: name,
          user_email: email,
          user_pass: pass,
        });

        if (res.data.success) {
          Alert.alert('Success', 'Account created! Please log in.');
          setMode('login');
          setForm({name: '', email: '', pass: '', confirm: ''});
        } else {
          Alert.alert('Sign Up Failed', res.data.message);
        }
      }
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Could not connect to server.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/money.png')}
          style={
    styles.logo}
        />
        <Text style={styles.title}>CanteenPay</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#666"
            value={form.name}
            onChangeText={v => updateField('name', v)}
          />
        )
}

< TextInput
style = {styles.input} placeholder = 'Email'
placeholderTextColor = '#666'
keyboardType = 'email-address'
value = {form.email} onChangeText =
    {v => updateField(
         'email',
         v)} />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={form.pass}
          onChangeText={v => updateField('pass', v)}
        />

{mode === 'signup' && (
          <TextInput
  style = {styles.input} placeholder = 'Confirm Password'
  placeholderTextColor = '#666'
  secureTextEntry
  value = {form.confirm} onChangeText =
  {
    v => updateField('confirm', v)
  } />
        )}

        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </Text >
      </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          <Text style={styles.switchText}>
            {mode === 'login'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Login'}
          </Text>
      </TouchableOpacity>
      </View></SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
  },
  form: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    color: '#000',
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchText: {
    textAlign: 'center',
    color: '#555',
    marginTop: 10,
  },
});
