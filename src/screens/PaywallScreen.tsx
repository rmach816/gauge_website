import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaymentService } from '../services/payments';
import { RootStackParamList } from '../types';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/constants';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const PaywallScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handlePurchase = async () => {
    const result = await PaymentService.purchasePremium();
    
    if (result.success) {
      Alert.alert('Success', 'Premium activated!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      Alert.alert(
        'Purchase Failed',
        result.error || 'Failed to activate premium. Please try again.'
      );
    }
  };

  const handleRestore = async () => {
    const result = await PaymentService.restorePurchases();
    
    if (result.success && result.restored) {
      Alert.alert('Success', 'Purchases restored!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else if (result.success) {
      Alert.alert('No Purchases', 'No previous purchases found to restore.');
    } else {
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    }
  };

  const features = [
    '✨ Unlimited style checks',
    '📏 Personalized size recommendations',
    '👔 Closet matching suggestions',
    '🛍️ Priority shopping recommendations',
    '📊 Style analytics & insights',
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>
            Get unlimited access to all features
          </Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>$6.99</Text>
          <Text style={styles.pricePeriod}>/ month</Text>
        </View>

        <View style={styles.features}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
          <Text style={styles.purchaseButtonText}>Start Premium</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Cancel anytime. Subscription renews automatically.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: Spacing.sm,
  },
  closeButtonText: {
    ...Typography.h2,
    color: Colors.textSecondary,
    fontSize: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xl,
  },
  price: {
    ...Typography.h1,
    color: Colors.primary,
    fontSize: 48,
  },
  pricePeriod: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  features: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  featureItem: {
    paddingVertical: Spacing.sm,
  },
  featureText: {
    ...Typography.body,
    color: Colors.text,
  },
  purchaseButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  purchaseButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 18,
  },
  restoreButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  restoreButtonText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  footer: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});

