import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';

export default function ManageInventory() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    category: 'Breakfast',
    price: '',
    quantity: '',
    image_url: '',
  });
  const [editId, setEditId] = useState(null);

  const categories = ['Breakfast', 'Lunch', 'Snacks', 'Drinks'];

  const fetchMenu = async () => {
    try {
      const res = await axios.get('http://192.168.0.126:3000/menu');
      if (res.data.success) setMenu(res.data.menu);
    } catch {
      Alert.alert('Error', 'Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // ✅ Pick image from gallery
  const handlePickImage = async () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, async response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', 'Image picker failed.');
        return;
      }

      const image = response.assets[0];
      const formData = new FormData();
      formData.append('image', {
        uri: image.uri,
        type: image.type,
        name: image.fileName,
      });

      try {
        const res = await axios.post('http://192.168.0.126:3000/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data.success) {
          setForm({ ...form, image_url: res.data.filename });
          Alert.alert('Uploaded', 'Image uploaded successfully!');
        }
      } catch {
        Alert.alert('Error', 'Failed to upload image.');
      }
    });
  };

  // ✅ Add or Update Food
  const handleAddOrUpdate = async () => {
    const { name, category, price, image_url, quantity } = form;
    if (!name || !category || !price) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    try {
      if (editId) {
        await axios.put(`http://192.168.0.126:3000/menu/${editId}`, form);
        Alert.alert('Success', 'Food item updated!');
      } else {
        await axios.post('http://192.168.0.126:3000/menu', form);
        Alert.alert('Success', 'Food item added!');
      }

      setForm({ name: '', category: 'Breakfast', price: '', quantity: '', image_url: '' });
      setEditId(null);
      fetchMenu();
    } catch {
      Alert.alert('Error', 'Unable to save item.');
    }
  };

  const handleDelete = async id => {
    Alert.alert('Confirm', 'Delete this food item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await axios.delete(`http://192.168.0.126:3000/menu/${id}`);
            Alert.alert('Deleted', 'Food item removed.');
            fetchMenu();
          } catch {
            Alert.alert('Error', 'Failed to delete.');
          }
        },
      },
    ]);
  };

  const handleEdit = item => {
    setForm(item);
    setEditId(item.id);
  };

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
      <View style={{ flex: 1 }}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodCat}>Category: {item.category}</Text>
        <Text style={styles.foodPrice}>₱{parseFloat(item.price).toFixed(2)}</Text>
        <Text style={styles.foodStock}>Stock: {item.quantity}</Text>
      </View>
      <View>
        <TouchableOpacity onPress={() => handleEdit(item)}>
          <Text style={styles.editBtn}>EDIT</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteBtn}>DELETE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Manage Inventory</Text>

      {/* ✅ Input Form */}
      <View style={styles.form}>
        <TextInput
          placeholder="Food Name"
          style={styles.input}
          value={form.name}
          onChangeText={v => setForm({ ...form, name: v })}
        />

        {/* ✅ Category Dropdown */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.category}
            onValueChange={v => setForm({ ...form, category: v })}
            style={styles.picker}>
            {categories.map(cat => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        <TextInput
          placeholder="Price"
          style={styles.input}
          keyboardType="numeric"
          value={form.price?.toString() || ''}
          onChangeText={v => setForm({ ...form, price: v })}
        />

        <TextInput
          placeholder="Quantity / Stock"
          style={styles.input}
          keyboardType="numeric"
          value={form.quantity?.toString() || ''}
          onChangeText={v => setForm({ ...form, quantity: v })}
        />

        {/* ✅ Image Upload */}
        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
          <Text style={{ color: '#000', fontWeight: 'bold' }}> Select Image</Text>
        </TouchableOpacity>

        {form.image_url ? (
          <Image
            source={{ uri: `http://192.168.0.126:3000/images/${form.image_url}` }}
            style={styles.preview}
          />
        ) : null}

        <TouchableOpacity style={styles.saveBtn} onPress={handleAddOrUpdate}>
          <Text style={styles.saveBtnText}>{editId ? 'Update Item' : 'Add Item'}</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Food List */}
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <FlatList
          data={menu}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 15 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  form: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: '#000',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  picker: { color: '#000' },
  imagePicker: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  preview: { width: '100%', height: 150, borderRadius: 10, marginBottom: 10 },
  saveBtn: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  foodImage: { width: 60, height: 60, borderRadius: 8, marginRight: 10 },
  foodName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  foodCat: { fontSize: 13, color: '#666' },
  foodPrice: { fontSize: 14, fontWeight: '600', color: '#111' },
  foodStock: { fontSize: 13, color: '#333' },
  editBtn: { fontSize: 18, marginBottom: 5 },
  deleteBtn: { fontSize: 18 },
});
