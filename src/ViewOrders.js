import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

export default function ViewOrders({ route, navigation }) {
  const { user } = route.params || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://192.168.0.126:3000/orders/${user.id}`);
      if (res.data.success) setOrders(res.data.orders);
      else setOrders([]);
    } catch (err) {
      console.log('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // auto-refresh every 5s
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.foodName}>{item.food_name}</Text>
        <Text style={styles.details}>
          Qty: {item.quantity} × ₱{parseFloat(item.price || 0).toFixed(2)}
        </Text>
        <Text style={styles.total}>
          Total: ₱{parseFloat(item.total_price || 0).toFixed(2)}
        </Text>
        <Text
          style={[
            styles.status,
            item.status === 'Pending'
              ? styles.pending
              : item.status === 'Completed'
              ? styles.completed
              : styles.cancelled,
          ]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You have no active orders yet.</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Menu', { user })}>
            <Text style={styles.primaryBtnText}>Order Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backArrow: {
    fontSize: 28,
    color: '#000',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  orderCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  details: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  total: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 5,
  },
  status: {
    marginTop: 6,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  pending: {
    backgroundColor: '#ffeb99',
    color: '#a67c00',
  },
  completed: {
    backgroundColor: '#c8f7c5',
    color: '#2e7d32',
  },
  cancelled: {
    backgroundColor: '#ffcdd2',
    color: '#c62828',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
