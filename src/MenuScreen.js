import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MenuScreen({ route, navigation }) {
  const { user } = route.params || {}; // ✅ user info from Dashboard
  const [selectedCategory, setSelectedCategory] = useState('Breakfast');
  const [menuData, setMenuData] = useState([]);

  const categories = ['Breakfast', 'Lunch', 'Snacks', 'Drinks'];

  const fetchMenu = async () => {
    try {
      const res = await axios.get('http://192.168.0.126:3000/menu');
      if (res.data.success) setMenuData(res.data.menu);
    } catch {
      console.log('Menu fetch error');
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // ✅ Place order + reduce stock
  const handleOrder = async (menu_id, name) => {
    try {
      const res = await axios.post('http://192.168.0.126:3000/order', {
        user_id: user?.id,
        menu_id,
      });

      if (res.data.success) {
        Alert.alert('Success', `You ordered: ${name}`);
        fetchMenu(); // refresh stock
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not place order.');
    }
  };

  const filteredMenu = menuData.filter(item => item.category === selectedCategory);

  const renderItem = ({ item }) => (
    <View style={styles.foodCard}>
      <Image
        source={
          item.image_url
            ? { uri: `http://192.168.0.126:3000/images/${item.image_url}` }
            : require('../assets/images/eat.png')
        }
        style={styles.foodImage}
      />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>₱{parseFloat(item.price || 0).toFixed(2)}</Text>
        <Text
          style={[
            styles.foodStock,
            item.quantity <= 5 && { color: '#ff5555' },
          ]}>
          Stock: {item.quantity > 0 ? item.quantity : 'Out of Stock'}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.addBtn, item.quantity <= 0 && { backgroundColor: '#777' }]}
        disabled={item.quantity <= 0}
        onPress={() => handleOrder(item.id, item.name)}>
        <Text style={styles.addBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[styles.tab, selectedCategory === cat && styles.activeTab]}>
            <Text
              style={[
                styles.tabText,
                selectedCategory === cat && styles.activeTabText,
              ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Food List */}
      <FlatList
        data={filteredMenu}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e2a30' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1e2a30',
  },
  backArrow: { color: '#fff', fontSize: 28, marginRight: 10 },
  headerTitle: { fontSize: 30, fontWeight: 'bold', color: '#fff' },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#2e3c42',
    paddingVertical: 10,
  },
  tab: { paddingVertical: 6, paddingHorizontal: 15, borderRadius: 10 },
  tabText: { color: '#ddd', fontWeight: '600' },
  activeTab: { backgroundColor: '#fff' },
  activeTabText: { color: '#000' },
  foodCard: {
    backgroundColor: '#32444a',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    padding: 10,
    marginHorizontal: 15,
    marginVertical: 8,
  },
  foodImage: { width: 70, height: 70, borderRadius: 10, marginRight: 10 },
  foodInfo: { flex: 1 },
  foodName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  foodPrice: { color: '#ccc', fontSize: 14, marginTop: 3 },
  foodStock: { color: '#8fda8f', fontSize: 13, marginTop: 2 },
  addBtn: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { color: '#000', fontSize: 20, fontWeight: 'bold' },
});
