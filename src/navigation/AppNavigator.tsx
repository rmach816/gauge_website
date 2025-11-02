import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/HomeScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ClosetScreen } from '../screens/ClosetScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PaywallScreen } from '../screens/PaywallScreen';

import { RootStackParamList, TabParamList } from '../types';
import { Colors } from '../utils/constants';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      headerStyle: { backgroundColor: Colors.primary },
      headerTintColor: Colors.white,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'Match Check',
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>📸</Text>,
      }}
    />
    <Tab.Screen
      name="History"
      component={HistoryScreen}
      options={{
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text>,
      }}
    />
    <Tab.Screen
      name="Closet"
      component={ClosetScreen}
      options={{
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>👔</Text>,
      }}
    />
    <Tab.Screen
      name="Shop"
      component={ShopScreen}
      options={{
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>🛍️</Text>,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text>,
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ presentation: 'modal', title: 'Style Analysis' }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ presentation: 'modal', headerShown: false }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

