import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function AdminDashboard({navigation}) {
  return (
      <SafeAreaView style = {styles.container}><View style = {styles.header}>
          <Text style={styles.title}>Admin Dashboard 
              </Text>
        <Text style={styles.subtitle}>Welcome back, Admin!</Text>
      </View>

      <View style={styles.cards}>
    <TouchableOpacity
    style={styles.card}
    onPress={() => navigation.navigate('ViewAllUsers')}>
    <Text style={styles.cardTitle}>View All Users</Text>
    <Text style={styles.cardDesc}>See and manage registered accounts</Text>
  </TouchableOpacity>

      <TouchableOpacity
    style={styles.card}
    onPress={() => navigation.navigate('ManageInventory')}>
    <Text style={styles.cardTitle}>Manage Inventory</Text>
    <Text style={styles.cardDesc}>Add, update, and delete food items</Text>
  </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <Text style={styles.cardTitle}>System Settings</Text>
      <Text style = {styles.cardDesc}>Control app
          configurations</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logout}
        onPress={() => navigation.replace('Login')}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginTop: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  cards: {
    marginTop: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 14,
    color: '#555',
  },
  logout: {
    marginTop: 40,
    alignItems: 'center',
  },
  logoutText: {
    color: '#555',
    fontSize: 15,
  },
});
