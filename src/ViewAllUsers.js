import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

export default function ViewAllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null); // store selected user
  const [form, setForm] = useState({ name: '', role: '', wallet: '' });
  const navigation = useNavigation();

  // ✅ Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://192.168.0.126:3000/users');
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Delete user
  const deleteUser = id => {
    Alert.alert('Confirm Delete', 'Are you sure you want to remove this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            const res = await axios.delete(`http://192.168.0.126:3000/users/${id}`);
            if (res.data.success) {
              Alert.alert('Success', 'User deleted.');
              fetchUsers();
            }
          } catch (err) {
            Alert.alert('Error', 'Failed to delete user.');
          }
        },
      },
    ]);
  };

  // ✅ Open edit modal
  const openEditModal = user => {
    setEditUser(user);
    setForm({
      name: user.user_name,
      role: user.role,
      wallet: user.wallet?.toString() || '0.00',
    });
  };

  // ✅ Update user
  const handleUpdate = async () => {
    if (!form.name || !form.role) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    try {
      const res = await axios.put(`http://192.168.0.126:3000/users/${editUser.user_id}`, {
        user_name: form.name,
        role: form.role,
        wallet: parseFloat(form.wallet || 0),
      });

      if (res.data.success) {
        Alert.alert('Success', 'User updated successfully.');
        setEditUser(null);
        fetchUsers();
      } else {
        Alert.alert('Error', res.data.message);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update user.');
    }
  };

  const renderItem = ({ item }) => (
  <View style={styles.card}>
    <View style={{ flex: 1 }}>
      <Text style={styles.name}>{item.user_name}</Text>
      <Text style={styles.email}>{item.user_email}</Text>
      <Text style={styles.role}>Role: {item.role}</Text>
      <Text style={styles.wallet}>
        Wallet: ₱{parseFloat(item.wallet || 0).toFixed(2)}
      </Text>
    </View>

    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
      <TouchableOpacity
        style={[styles.iconBtn, { marginBottom: 6 }]}
        onPress={() => openEditModal(item)}>
        <Text style={styles.iconText}>EDIT</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.iconBtn, { marginBottom: 6 }]}
        onPress={() => deleteUser(item.user_id)}>
        <Text style={styles.iconText}>DELETE</Text>
      </TouchableOpacity>

      {/* 👇 New Button: View User Orders */}
      <TouchableOpacity
        style={[styles.iconBtn, { backgroundColor: '#000' }]}
        onPress={() => navigation.navigate('ViewUsersOrders', { user: item })}>
        <Text style={{ color: '#fff' }}>ORDERS</Text>
      </TouchableOpacity>
    </View>
  </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>All Users</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.user_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      )}

      {/* ✅ EDIT MODAL */}
      <Modal
        visible={!!editUser}
        transparent
        animationType="slide"
        onRequestClose={() => setEditUser(null)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit User</Text>

            <TextInput
              placeholder="Name"
              value={form.name}
              onChangeText={v => setForm({ ...form, name: v })}
              style={styles.input}
            />
            <TextInput
              placeholder="Role (admin / user)"
              value={form.role}
              onChangeText={v => setForm({ ...form, role: v })}
              style={styles.input}
            />
            <TextInput
              placeholder="Wallet"
              keyboardType="numeric"
              value={form.wallet}
              onChangeText={v => setForm({ ...form, wallet: v })}
              style={styles.input}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditUser(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#000' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  name: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  email: { fontSize: 14, color: '#555' },
  role: { fontSize: 13, color: '#777' },
  wallet: { fontSize: 13, color: '#333', marginTop: 4 },
  iconBtn: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 6,
  },
  iconText: { fontSize: 16 },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#000',
  },
  saveBtn: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: {
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#333',
    fontSize: 14,
  },
});
