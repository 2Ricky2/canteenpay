import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

export default function ViewUsersOrders({ route }) {
  const { user } = route.params || {};
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch all orders of selected user
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://192.168.0.126:3000/orders/${user.user_id}`);
      if (res.data.success) setOrders(res.data.orders);
      else setOrders([]);
    } catch (err) {
      console.log('Error fetching orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Update order status (admin function)
  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`http://192.168.0.126:3000/orders/${orderId}`, {
        status: newStatus,
      });

      if (res.data.success) {
        Alert.alert('Success', res.data.message);
        fetchOrders();
      } else {
        Alert.alert('Error', res.data.message || 'Failed to update order.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.orderCard}>
      {/* LEFT SIDE - Order Info */}
      <View style={styles.orderInfo}>
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
            item.status === 'Active'
              ? styles.active
              : item.status === 'Paid'
              ? styles.paid
              : item.status === 'Completed'
              ? styles.completed
              : styles.cancelled,
          ]}
        >
          {item.status}
        </Text>
      </View>

      {/* RIGHT SIDE - Action Buttons */}
      <View style={styles.btnGroup}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#007bff' }]}
          onPress={() => updateStatus(item.id, 'Active')}
        >
          <Text style={styles.btnText}>Active</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#28a745' }]}
          onPress={() => updateStatus(item.id, 'Paid')}
        >
          <Text style={styles.btnText}>Paid</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#6c757d' }]}
          onPress={() => updateStatus(item.id, 'Completed')}
        >
          <Text style={styles.btnText}>Done</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#c62828' }]}
          onPress={() => updateStatus(item.id, 'Cancelled')}
        >
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders of {user.user_name}</Text>
      </View>

      {/* LOADING / EMPTY / LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No orders found for this user.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 60 }}
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

  // HEADER
  header: {
    marginBottom: 15,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },

  // ORDER CARD
  orderCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  orderInfo: {
    marginBottom: 10,
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

  // STATUS TAGS
  status: {
    marginTop: 8,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  active: { backgroundColor: '#fff3cd', color: '#856404' },
  paid: { backgroundColor: '#c8f7c5', color: '#2e7d32' },
  completed: { backgroundColor: '#d6d8d9', color: '#343a40' },
  cancelled: { backgroundColor: '#ffcdd2', color: '#c62828' },

  // BUTTONS
  btnGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: 3,
    marginTop: 4,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
