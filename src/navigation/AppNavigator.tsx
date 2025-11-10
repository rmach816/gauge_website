import React, { useEffect, useState } from 'react';
import { Text, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon, AppIcons } from '../components/Icon';

import { HomeScreen } from '../screens/HomeScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ClosetScreen } from '../screens/ClosetScreen';
import { ShopScreen } from '../screens/ShopScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { QuickStyleCheckScreen } from '../screens/QuickStyleCheckScreen';
import { BuildOutfitScreen } from '../screens/BuildOutfitScreen';
import { AddClosetItemScreen } from '../screens/AddClosetItemScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ItemShoppingScreen } from '../screens/ItemShoppingScreen';
import { OutfitGeneratingScreen } from '../screens/OutfitGeneratingScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { ViewFavoriteScreen } from '../screens/ViewFavoriteScreen';
import { RegenerateItemScreen } from '../screens/RegenerateItemScreen';

// Onboarding screens
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { NameInputScreen } from '../screens/onboarding/NameInputScreen';
import { GreetingScreen } from '../screens/onboarding/GreetingScreen';
import { MeasurementSelectionScreen } from '../screens/onboarding/MeasurementSelectionScreen';
import { MeasurementStepScreen } from '../screens/onboarding/MeasurementStepScreen';
import { StylePreferencesScreen } from '../screens/onboarding/StylePreferencesScreen';
import { ShoeSizeScreen } from '../screens/onboarding/ShoeSizeScreen';
import { WardrobePhotoScreen } from '../screens/onboarding/WardrobePhotoScreen';
import { CompletionScreen } from '../screens/onboarding/CompletionScreen';
import { TutorialScreen } from '../screens/onboarding/TutorialScreen';

import { RootStackParamList, TabParamList } from '../types';
import { TailorColors, TailorContrasts } from '../utils/constants';
import { OnboardingService } from '../services/onboarding';
import { WoodBackground } from '../components/WoodBackground';
import {
  fadeTransition,
  fadeCardStyleInterpolator,
  modalTransition,
  modalCardStyleInterpolator,
  scaleTransition,
  scaleCardStyleInterpolator,
} from '../utils/transitions';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: TailorColors.gold,
      tabBarInactiveTintColor: TailorColors.grayMedium,
      headerShown: false, // Remove headers from all tab screens
      tabBarStyle: { backgroundColor: TailorColors.woodDark },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name={AppIcons.home.name} size={24} color={color} library={AppIcons.home.library} />,
      }}
    />
    <Tab.Screen
      name="History"
      component={HistoryScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name={AppIcons.history.name} size={24} color={color} library={AppIcons.history.library} />,
      }}
    />
    <Tab.Screen
      name="Closet"
      component={ClosetScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name={AppIcons.closet.name} size={24} color={color} library={AppIcons.closet.library} />,
      }}
    />
    <Tab.Screen
      name="Shop"
      component={ShopScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name={AppIcons.shop.name} size={24} color={color} library={AppIcons.shop.library} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={SettingsScreen}
      options={{
        tabBarIcon: ({ color }) => <Icon name={AppIcons.settings.name} size={24} color={color} library={AppIcons.settings.library} />,
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasCompleted = await OnboardingService.hasCompletedOnboarding();
      setShowOnboarding(!hasCompleted);
    } catch (error) {
      console.error('[AppNavigator] Failed to check onboarding status:', error);
      // Default to showing onboarding on error
      setShowOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <WoodBackground>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={TailorColors.gold} />
        </View>
      </WoodBackground>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={showOnboarding ? 'Welcome' : 'MainTabs'}
        screenOptions={{
          headerStyle: { backgroundColor: TailorColors.woodDark },
          headerTintColor: TailorContrasts.onWoodDark,
          transitionSpec: {
            open: fadeTransition,
            close: fadeTransition,
          },
          cardStyleInterpolator: fadeCardStyleInterpolator,
        }}
      >
        {/* Always register all screens - use initialRouteName to control which shows first */}
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NameInput"
          component={NameInputScreen}
          options={{ 
            title: 'Your Name',
          }}
        />
            <Stack.Screen
              name="Greeting"
              component={GreetingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MeasurementSelection"
              component={MeasurementSelectionScreen}
              options={{ 
                title: 'Your Measurements',
              }}
            />
            <Stack.Screen
              name="MeasurementStep"
              component={MeasurementStepScreen}
              options={{ 
                title: 'Measurement',
              }}
            />
            <Stack.Screen
              name="StylePreferences"
              component={StylePreferencesScreen}
              options={{ 
                title: 'Style Preferences',
              }}
            />
            <Stack.Screen
              name="ShoeSize"
              component={ShoeSizeScreen}
              options={{ 
                title: 'Shoe Size',
              }}
            />
            <Stack.Screen
              name="WardrobePhoto"
              component={WardrobePhotoScreen}
              options={{ 
                title: 'Wardrobe',
              }}
            />
            <Stack.Screen
              name="Completion"
              component={CompletionScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Tutorial"
              component={TutorialScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MainTabs"
              component={TabNavigator}
              options={{ headerShown: false }}
            />
        {/* Shared screens */}
        <Stack.Screen
          name="QuickStyleCheck"
          component={QuickStyleCheckScreen}
          options={{ title: 'Quick Style Check' }}
        />
        <Stack.Screen
          name="BuildOutfit"
          component={BuildOutfitScreen}
          options={{ title: 'Build an Outfit' }}
        />
        <Stack.Screen
          name="AddClosetItem"
          component={AddClosetItemScreen}
          options={{ title: 'Add Item' }}
        />
        <Stack.Screen
          name="EditClosetItem"
          component={AddClosetItemScreen}
          options={{ title: 'Edit Item' }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: 'Chat with Your Tailor' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ title: 'Privacy Policy' }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{
            presentation: 'modal',
            title: 'Style Analysis',
            transitionSpec: {
              open: modalTransition,
              close: modalTransition,
            },
            cardStyleInterpolator: modalCardStyleInterpolator,
          }}
        />
        <Stack.Screen
          name="ItemShopping"
          component={ItemShoppingScreen}
          options={{ title: 'Shop for Item' }}
        />
        <Stack.Screen
          name="OutfitGenerating"
          component={OutfitGeneratingScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ title: 'Favorite Outfits' }}
        />
        <Stack.Screen
          name="ViewFavorite"
          component={ViewFavoriteScreen}
          options={{ title: 'Favorite Outfit' }}
        />
        <Stack.Screen
          name="RegenerateItem"
          component={RegenerateItemScreen}
          options={{ title: 'New Recommendation' }}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            presentation: 'modal',
            headerShown: false,
            transitionSpec: {
              open: modalTransition,
              close: modalTransition,
            },
            cardStyleInterpolator: modalCardStyleInterpolator,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
