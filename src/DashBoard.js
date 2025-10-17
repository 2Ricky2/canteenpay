import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import axios from 'axios';

export default function Dashboard({ route, navigation }) {
  const { user } = route.params || {};
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSideNavVisible, setSideNavVisible] = useState(false);
  const [activeOrders, setActiveOrders] = useState(0);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const toggleSideNav = () => setSideNavVisible(!isSideNavVisible);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://192.168.0.126:3000/orders/${user.id}`);
      if (res.data.success) setActiveOrders(res.data.orders.length);
    } catch (err) {
      console.log('Failed to fetch orders');
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSideNav}>
          <Image source={require('../assets/images/hamburger.png')} style={styles.headerIcon} />
        </TouchableOpacity>

        <Image source={require('../assets/images/bell.png')} style={styles.headerIcon} />

        <TouchableOpacity onPress={openModal}>
          <Image source={require('../assets/images/user.png')} style={styles.headerIcon} />
        </TouchableOpacity>
      </View>

      {/* SCROLLABLE MAIN CONTENT */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* GREETING */}
        <View style={styles.greeting}>
          <Text style={styles.hiText}>Hi, {user?.username || 'User'}!</Text>
          <Text style={styles.subText}>What would you like to eat today?</Text>
        </View>

        {/* BALANCE SECTION */}
        <View style={styles.balanceRow}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceValue}>₱{user?.wallet || '0.00'}</Text>
            <Text style={styles.balanceLabel}>Wallet Balance</Text>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceValue}>{activeOrders}</Text>
            <Text style={styles.balanceLabel}>Active Orders</Text>
          </View>
        </View>

        {/* MY ORDERS SECTION */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>MY ORDERS</Text>
            <Image source={require('../assets/images/grocery-store.png')} style={styles.cardIcon} />
          </View>
          <Text style={styles.sectionDesc}>Track ongoing & past orders</Text>

          <View style={styles.orderButtonsRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, { flex: 1, marginRight: 5 }]}
              onPress={() => navigation.navigate('Menu', { user })}
            >
              <Text style={styles.primaryBtnText}>ORDER NOW</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryBtn, { flex: 1, marginLeft: 5 }]}
              onPress={() => navigation.navigate('ViewOrders', { user })}
            >
              <Text style={styles.primaryBtnText}>VIEW ORDERS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MENU + SCAN QR */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.smallCard}
            onPress={() => navigation.navigate('Menu', { user })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Menu</Text>
              <Image source={require('../assets/images/menu.png')} style={styles.smallIcon} />
            </View>
            <Text style={styles.cardDesc}>Browse available meals</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallCard} onPress={() => navigation.navigate('ScanQR')}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Scan QR</Text>
              <Image source={require('../assets/images/qr-code.png')} style={styles.smallIcon} />
            </View>
            <Text style={styles.cardDesc}>For paying at the canteen</Text>
          </TouchableOpacity>
        </View>

        {/* WALLET / PAYMENT SECTION */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Wallet / Payment</Text>
            <Image source={require('../assets/images/wallet.png')} style={styles.cardIcon} />
          </View>
          <Text style={styles.sectionDesc}>Check your balance</Text>
        </View>
      </ScrollView>

      {/* USER DETAILS MODAL */}
      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modalCard}>
            <Image source={require('../assets/images/user.png')} style={styles.modalUserIcon} />
            <Text style={styles.modalTitle}>User Details</Text>

            <View style={styles.modalInfo}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{user?.username || 'N/A'}</Text>

              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user?.email || 'N/A'}</Text>

              <Text style={styles.label}>Wallet Balance:</Text>
              <Text style={styles.balanceValue}>₱{user?.wallet || '0.00'}</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SIDE NAV MENU */}
      <Modal visible={isSideNavVisible} transparent animationType="slide" onRequestClose={toggleSideNav}>
        <TouchableOpacity style={styles.sideNavOverlay} onPress={toggleSideNav}>
          <View style={styles.sideNav}>
            <Text style={styles.sideNavTitle}>Navigation</Text>

            <TouchableOpacity style={styles.sideNavItem} onPress={() => navigation.navigate('Menu', { user })}>
              <Text style={styles.sideNavText}> Menu</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideNavItem} onPress={() => navigation.navigate('ViewOrders', { user })}>
              <Text style={styles.sideNavText}> My Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideNavItem} onPress={() => navigation.replace('Login')}>
              <Text style={[styles.sideNavText, { color: '#c62828' }]}> Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- Layout ---
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerIcon: {
    width: 26,
    height: 26,
    tintColor: '#000',
  },

  // --- Greeting ---
  greeting: {
    marginBottom: 10,
  },
  hiText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  subText: {
    color: '#666',
    fontSize: 14,
  },

  // --- Balances ---
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
  },
  balanceValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },

  // --- Section Cards ---
  sectionCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIcon: {
    width: 28,
    height: 28,
    tintColor: '#000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionDesc: {
    color: '#666',
    fontSize: 13,
    marginTop: 5,
  },

  // --- Buttons ---
  primaryBtn: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  orderButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  // --- Menu Cards ---
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    elevation: 2,
  },
  smallIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  cardDesc: {
    color: '#666',
    fontSize: 13,
    marginTop: 5,
  },

  // --- User Modal ---
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    width: '85%',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },
  modalUserIcon: {
    width: 60,
    height: 60,
    tintColor: '#000',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  modalInfo: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  closeBtn: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // --- Side Navigation ---
  sideNavOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },
  sideNav: {
    width: '70%',
    backgroundColor: '#fff',
    padding: 20,
    elevation: 5,
  },
  sideNavTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  sideNavItem: {
    marginBottom: 15,
  },
  sideNavText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
});
