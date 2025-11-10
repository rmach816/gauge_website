import React, { useState, useEffect } from 'react';
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
import { WoodBackground } from '../components/WoodBackground';
import { Icon, AppIcons } from '../components/Icon';
import { GoldButton } from '../components/GoldButton';
import { OccasionPicker } from '../components/OccasionPicker';
import { RootStackParamList, Occasion, PriceRange } from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';
import { validateApiKey } from '../config/api';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type OutfitMode = 'wardrobe' | 'shopping' | 'mixed';

/**
 * BuildOutfitScreen
 * Structured outfit builder for users who prefer guided flows
 * Free/Premium feature - no conversation, structured input
 */
export const BuildOutfitScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | string | undefined>();
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | undefined>();
  const [selectedMode, setSelectedMode] = useState<OutfitMode | undefined>();

  const handleGenerate = async () => {
    if (!selectedOccasion || !selectedOccasion.trim()) {
      Alert.alert('Select Occasion', 'Please select an occasion or enter your own.');
      return;
    }

    if (!selectedMode) {
      Alert.alert('Select Mode', 'Please choose how you want to build your outfit.');
      return;
    }

    if (!validateApiKey()) {
      Alert.alert('Configuration Error', 'API key not configured.');
      return;
    }

    // Navigate to generating screen immediately
    navigation.navigate('OutfitGenerating', {
      occasion: selectedOccasion,
      mode: selectedMode,
      priceRange: selectedPriceRange,
    });
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Build an Outfit</Text>
            <Text style={styles.subtitle}>
              Choose occasion, we'll help you put together the perfect look
            </Text>
          </View>

          {/* Occasion Selection (Required) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Occasion *</Text>
            <OccasionPicker
              selectedOccasion={selectedOccasion}
              onSelect={setSelectedOccasion}
            />
          </View>

          {/* Mode Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How would you like to build?</Text>
            
            <TouchableOpacity
              style={[
                styles.modeCard,
                selectedMode === 'wardrobe' && styles.modeCardSelected,
              ]}
              onPress={() => setSelectedMode('wardrobe')}
              activeOpacity={0.7}
            >
              <Icon name={AppIcons.wardrobe.name} size={32} color={selectedMode === 'wardrobe' ? TailorContrasts.onGold : TailorContrasts.onWoodMedium} library={AppIcons.wardrobe.library} style={styles.modeIcon} />
              <Text style={styles.modeTitle}>Use My Wardrobe</Text>
              <Text style={styles.modeDescription}>
                Generate combinations from your existing items
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeCard,
                selectedMode === 'shopping' && styles.modeCardSelected,
              ]}
              onPress={() => setSelectedMode('shopping')}
              activeOpacity={0.7}
            >
              <Icon name={AppIcons.shopping.name} size={32} color={selectedMode === 'shopping' ? TailorContrasts.onGold : TailorContrasts.onWoodMedium} library={AppIcons.shopping.library} style={styles.modeIcon} />
              <Text style={styles.modeTitle}>Shop for New Items</Text>
              <Text style={styles.modeDescription}>
                Complete shopping outfit with purchase links
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeCard,
                selectedMode === 'mixed' && styles.modeCardSelected,
              ]}
              onPress={() => setSelectedMode('mixed')}
              activeOpacity={0.7}
            >
              <Text style={styles.modeIcon}>✨</Text>
              <Text style={styles.modeTitle}>Mix Both</Text>
              <Text style={styles.modeDescription}>
                Combine wardrobe items with new shopping suggestions
              </Text>
            </TouchableOpacity>
          </View>

          {/* Price Range Selection (Optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range (Optional)</Text>
            <Text style={styles.sectionSubtitle}>
              Help us suggest items in your budget
            </Text>

            <View style={styles.priceRangeContainer}>
              {Object.values(PriceRange).map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.priceRangeButton,
                    selectedPriceRange === range && styles.priceRangeButtonSelected,
                  ]}
                  onPress={() => setSelectedPriceRange(
                    selectedPriceRange === range ? undefined : range
                  )}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.priceRangeText,
                      selectedPriceRange === range && styles.priceRangeTextSelected,
                    ]}
                  >
                    {range === PriceRange.BUDGET && '$25-$50'}
                    {range === PriceRange.MID && '$50-$100'}
                    {range === PriceRange.PREMIUM && '$100-$200'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <GoldButton
            title="Generate Outfit"
            onPress={handleGenerate}
            disabled={!selectedOccasion || !selectedMode}
            style={styles.generateButton}
          />
        </ScrollView>
      </SafeAreaView>
    </WoodBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: TailorSpacing.xl,
  },
  header: {
    marginBottom: TailorSpacing.xl,
    alignItems: 'center',
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: TailorSpacing.xl,
  },
  sectionTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.sm,
  },
  sectionSubtitle: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginBottom: TailorSpacing.md,
  },
  modeCard: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.lg,
    marginBottom: TailorSpacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...TailorShadows.medium,
  },
  modeCardSelected: {
    borderColor: TailorColors.gold,
    borderWidth: 3,
  },
  modeIcon: {
    fontSize: 32,
    marginBottom: TailorSpacing.xs,
  },
  modeTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
  },
  modeDescription: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    gap: TailorSpacing.sm,
    flexWrap: 'wrap',
  },
  priceRangeButton: {
    backgroundColor: TailorColors.woodMedium,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    borderRadius: TailorBorderRadius.round,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priceRangeButtonSelected: {
    borderColor: TailorColors.gold,
    backgroundColor: TailorColors.woodLight,
  },
  priceRangeText: {
    ...TailorTypography.button,
    color: TailorContrasts.onWoodMedium,
    fontSize: 14,
  },
  priceRangeTextSelected: {
    color: TailorContrasts.onWoodDark,
  },
  generateButton: {
    marginTop: TailorSpacing.md,
  },
});

