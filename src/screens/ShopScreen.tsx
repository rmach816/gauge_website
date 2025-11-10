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
import { WoodBackground } from '../components/WoodBackground';
import { Icon, AppIcons } from '../components/Icon';
import { RootStackParamList, GarmentType, PriceRange, OutfitItem } from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';
import uuid from 'react-native-uuid';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface QuickShopCategory {
  label: string;
  garmentType: GarmentType;
  icon: { name: string; library: 'feather' | 'ionicons' | 'material' };
  description: string;
}


export const ShopScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange>(PriceRange.MID);

  const quickShopCategories: QuickShopCategory[] = [
    {
      label: 'Shirts',
      garmentType: GarmentType.SHIRT,
      icon: AppIcons.shirt,
      description: "Men's dress shirts, casual shirts, polos",
    },
    {
      label: 'Pants',
      garmentType: GarmentType.PANTS,
      icon: AppIcons.pants,
      description: 'Dress pants, chinos, jeans',
    },
    {
      label: 'Jackets',
      garmentType: GarmentType.JACKET,
      icon: AppIcons.jacket,
      description: 'Blazers, sport coats, casual jackets',
    },
    {
      label: 'Shoes',
      garmentType: GarmentType.SHOES,
      icon: AppIcons.shoes,
      description: 'Dress shoes, casual shoes, sneakers',
    },
    {
      label: 'Accessories',
      garmentType: GarmentType.ACCESSORIES,
      icon: AppIcons.accessories,
      description: 'Ties, belts, watches, and more',
    },
  ];

  const handleQuickShop = (category: QuickShopCategory) => {
    // Create a basic outfit item for shopping
    const outfitItem: OutfitItem = {
      id: uuid.v4() as string,
      garmentType: category.garmentType,
      description: category.description,
      colors: [],
      material: undefined,
      brand: undefined,
      priceRange: selectedPriceRange,
      shoppingOptions: [],
    };

    navigation.navigate('ItemShopping', { outfitItem });
  };

  const handleBuildOutfit = () => {
    navigation.navigate('BuildOutfit');
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Shop</Text>
            <Text style={styles.subtitle}>
              Browse by category or build a complete outfit
            </Text>
          </View>

          {/* Price Range Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range</Text>
            <View style={styles.priceRow}>
              {Object.values(PriceRange).map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.priceButton,
                    selectedPriceRange === range && styles.priceButtonSelected,
                  ]}
                  onPress={() => setSelectedPriceRange(range)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.priceText,
                      selectedPriceRange === range && styles.priceTextSelected,
                    ]}
                  >
                    {range === PriceRange.BUDGET ? '$' : range === PriceRange.MID ? '$$' : '$$$'}
                  </Text>
                  <Text
                    style={[
                      styles.priceLabel,
                      selectedPriceRange === range && styles.priceLabelSelected,
                    ]}
                  >
                    {range}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Shop Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Shop</Text>
            <Text style={styles.sectionSubtitle}>
              Browse by category and find what you need
            </Text>

            <View style={styles.categoryGrid}>
              {quickShopCategories.map((category) => (
                <TouchableOpacity
                  key={category.garmentType}
                  style={styles.categoryCard}
                  onPress={() => handleQuickShop(category)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={category.icon.name}
                    size={40}
                    color={TailorColors.gold}
                    library={category.icon.library}
                    style={styles.categoryIcon}
                  />
                  <Text style={styles.categoryLabel}>{category.label}</Text>
                  <Text style={styles.categoryDescription} numberOfLines={2}>
                    {category.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Build Complete Outfit */}
          <View style={styles.section}>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Need a Complete Outfit?</Text>
            <Text style={styles.sectionSubtitle}>
              Let us help you put together the perfect look for any occasion
            </Text>
            <TouchableOpacity
              style={styles.buildOutfitButton}
              onPress={handleBuildOutfit}
              activeOpacity={0.7}
            >
              <Icon
                name={AppIcons.sparkles.name}
                size={20}
                color={TailorContrasts.onGold}
                library={AppIcons.sparkles.library}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.buildOutfitButtonText}>Build Complete Outfit</Text>
            </TouchableOpacity>
          </View>
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
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.xs,
  },
  subtitle: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    fontSize: 14,
  },
  section: {
    marginBottom: TailorSpacing.xl,
  },
  sectionTitle: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.xs,
  },
  sectionSubtitle: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginBottom: TailorSpacing.md,
    fontSize: 13,
  },
  priceRow: {
    flexDirection: 'row',
    gap: TailorSpacing.sm,
  },
  priceButton: {
    flex: 1,
    paddingVertical: TailorSpacing.sm,
    borderRadius: TailorBorderRadius.md,
    backgroundColor: TailorColors.woodMedium,
    borderWidth: 2,
    borderColor: TailorColors.woodLight,
    alignItems: 'center',
    ...TailorShadows.small,
  },
  priceButtonSelected: {
    backgroundColor: TailorColors.gold,
    borderColor: TailorColors.gold,
  },
  priceText: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    fontSize: 20,
    fontWeight: '700',
  },
  priceTextSelected: {
    color: TailorContrasts.onGold,
  },
  priceLabel: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 11,
    marginTop: 2,
  },
  priceLabelSelected: {
    color: TailorContrasts.onGold,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TailorSpacing.md,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: TailorColors.woodLight,
    ...TailorShadows.medium,
  },
  categoryIcon: {
    marginBottom: TailorSpacing.sm,
  },
  categoryLabel: {
    ...TailorTypography.h3,
    color: TailorColors.gold,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: TailorSpacing.xs / 2,
    textAlign: 'center',
  },
  categoryDescription: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  divider: {
    height: 1,
    backgroundColor: TailorColors.woodLight,
    marginVertical: TailorSpacing.lg,
  },
  buildOutfitButton: {
    backgroundColor: TailorColors.gold,
    paddingVertical: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...TailorShadows.medium,
  },
  buildOutfitButtonText: {
    ...TailorTypography.button,
    color: TailorContrasts.onGold,
    fontWeight: '700',
  },
});


