import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ✅ Import all screens
import LoginScreen from './src/LoginScreen';
import Dashboard from './src/DashBoard';
import AdminDashboard from './src/AdminDashboard';
import MenuScreen from './src/MenuScreen';
import ViewAllUsers from './src/ViewAllUsers';
import ManageInventory from './src/ManageInventory';
import ViewOrders from './src/ViewOrders';  
import ViewUsersOrders from './src/ViewUsersOrders';
import ScanQR from './src/ScanQR';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">

        {/* LOGIN SCREEN */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        {/* USER DASHBOARD */}
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            headerShown: true,
            title: 'Dashboard',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />

        {/* ADMIN DASHBOARD */}
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboard}
          options={{
            headerShown: true,
            title: 'Admin Panel',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />

        {/* MENU SCREEN */}
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* VIEW ALL USERS (Admin) */}
        <Stack.Screen
          name="ViewAllUsers"
          component={ViewAllUsers}
          options={{
            title: 'All Users',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="ViewUsersOrders"
          component={ViewUsersOrders}
          options={{
          title: 'User Orders',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          }}
        />
        {/* MANAGE INVENTORY (Admin) */}
        <Stack.Screen
          name="ManageInventory"
          component={ManageInventory}
          options={{
            title: 'Manage Inventory',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
          }}
        />

        {/* 👇 NEW: VIEW ORDERS PAGE */}
        <Stack.Screen
          name="ViewOrders"
          component={ViewOrders}
          options={{
            title: 'My Orders',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
         name="ScanQR"
         component={ScanQR}
         options={{
          title: 'Scan QR Code',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          }}
/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}
