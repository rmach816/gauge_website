import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OccasionPicker } from '../components/OccasionPicker';
import { ShoppingCard } from '../components/ShoppingCard';
import { StorageService } from '../services/storage';
import { ClaudeVisionService } from '../services/claude';
import { AffiliateLinkService } from '../services/affiliateLinks';
import { RootStackParamList, Occasion, StylePreference, PriceRange, OutfitItem } from '../types';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/constants';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const ShopScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | undefined>();
  const [stylePreference, setStylePreference] = useState<StylePreference>(
    StylePreference.MODERN
  );
  const [priceRange, setPriceRange] = useState<PriceRange>(PriceRange.MID);
  const [isBuilding, setIsBuilding] = useState(false);
  const [outfitItems, setOutfitItems] = useState<OutfitItem[]>([]);

  const handleBuildOutfit = async () => {
    if (!selectedOccasion) {
      Alert.alert('Select Occasion', 'Please select an occasion first.');
      return;
    }

    setIsBuilding(true);
    try {
      const profile = await StorageService.getUserProfile();
      
      // For outfit builder, we need a sample image or description
      // In production, you'd use a stock image or user's style preferences
      const result = await ClaudeVisionService.analyzeStyle({
        imageBase64: [], // Empty for text-based outfit generation
        requestType: 'outfit-builder',
        occasion: selectedOccasion,
        stylePreference: stylePreference || profile?.stylePreference,
        userMeasurements: profile?.measurements,
      });

      if (result.completeOutfit) {
        const items = await Promise.all(
          result.completeOutfit.map(async (item) => {
            const shoppingOptions = AffiliateLinkService.generateShoppingOptions({
              garmentType: item.garmentType,
              description: item.description,
              colors: item.colors,
              priceRange,
            });
            return {
              ...item,
              shoppingOptions,
            };
          })
        );
        setOutfitItems(items);
      }
    } catch (error) {
      console.error('[ShopScreen] Build failed:', error);
      Alert.alert('Error', 'Failed to build outfit. Please try again.');
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Build Complete Outfit</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Occasion</Text>
          <OccasionPicker
            selectedOccasion={selectedOccasion}
            onSelect={setSelectedOccasion}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.priceRow}>
            {Object.values(PriceRange).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.priceButton,
                  priceRange === range && styles.priceButtonSelected,
                ]}
                onPress={() => setPriceRange(range)}
              >
                <Text
                  style={[
                    styles.priceText,
                    priceRange === range && styles.priceTextSelected,
                  ]}
                >
                  {range === PriceRange.BUDGET ? '$' : range === PriceRange.MID ? '$$' : '$$$'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, (!selectedOccasion || isBuilding) && styles.buttonDisabled]}
          onPress={handleBuildOutfit}
          disabled={!selectedOccasion || isBuilding}
        >
          {isBuilding ? (
            <>
              <ActivityIndicator color={Colors.white} style={styles.loader} />
              <Text style={styles.buttonText}>Building Outfit...</Text>
            </>
          ) : (
            <Text style={styles.buttonText}>Build Outfit</Text>
          )}
        </TouchableOpacity>

        {outfitItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Complete Outfit</Text>
            {outfitItems.map((item, index) => (
              <View key={index} style={styles.outfitGroup}>
                <Text style={styles.outfitItemTitle}>{item.garmentType}</Text>
                <Text style={styles.outfitItemDescription}>{item.description}</Text>
                {item.shoppingOptions?.map((option, optIndex) => (
                  <ShoppingCard key={optIndex} item={option} />
                ))}
              </View>
            ))}
          </View>
        )}
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
    padding: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  priceButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  priceText: {
    ...Typography.button,
    color: Colors.text,
  },
  priceTextSelected: {
    color: Colors.white,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.button,
    color: Colors.white,
  },
  loader: {
    marginRight: Spacing.sm,
  },
  outfitGroup: {
    marginBottom: Spacing.lg,
  },
  outfitItemTitle: {
    ...Typography.h3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  outfitItemDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
});

