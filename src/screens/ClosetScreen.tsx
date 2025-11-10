import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WoodBackground } from '../components/WoodBackground';
import { Icon, AppIcons } from '../components/Icon';
import { GoldButton } from '../components/GoldButton';
import { ClosetItemComponent } from '../components/ClosetItem';
import { SkeletonCard } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { ClosetService } from '../services/closet';
import { PremiumService } from '../services/premium';
import { ClosetItem, GarmentType } from '../types';
import { GarmentCategory, isGarmentInCategory } from '../utils/garmentCategories';
import { RootStackParamList } from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';

type NavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * Premium Wardrobe Screen
 * Elegant grid layout with refined search, filtering, and premium styling
 */
export const ClosetScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GarmentCategory | 'all'>('all');
  const [isPremium, setIsPremium] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadItems();
      checkPremiumStatus();
    }, [])
  );

  // Memoized filtered items for performance
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by master category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) =>
        isGarmentInCategory(item.garmentType, selectedCategory)
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.color.toLowerCase().includes(query) ||
          item.secondaryColor?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query) ||
          item.garmentType.toLowerCase().includes(query) ||
          item.material?.toLowerCase().includes(query) ||
          item.pattern?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [items, searchQuery, selectedCategory]);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const closetItems = await ClosetService.getClosetItems();
      setItems(closetItems);
      setItemCount(closetItems.length);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkPremiumStatus = useCallback(async () => {
    const status = await PremiumService.getStatus();
    setIsPremium(status.isPremium);
  }, []);

  const handleAddItem = useCallback(() => {
    // Check free tier limit
    if (!isPremium && itemCount >= 20) {
      Alert.alert(
        'Wardrobe Limit Reached',
        'Free users can add up to 20 items. Upgrade to Premium for unlimited wardrobe items.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => navigation.navigate('Paywall'),
          },
        ]
      );
      return;
    }

    navigation.navigate('AddClosetItem');
  }, [isPremium, itemCount, navigation]);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this from your wardrobe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await ClosetService.removeItem(itemId);
              loadItems();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item.');
            }
          },
        },
      ]
    );
  }, [loadItems]);

  const renderItem = useCallback(({ item }: { item: ClosetItem }) => (
    <View style={styles.itemWrapper}>
      <ClosetItemComponent
        item={item}
        onPress={() => navigation.navigate('EditClosetItem', { itemId: item.id })}
        onDelete={() => handleDeleteItem(item.id)}
      />
    </View>
  ), [navigation, handleDeleteItem]);

  const categories: (GarmentCategory | 'all')[] = [
    'all',
    GarmentCategory.SHIRTS,
    GarmentCategory.PANTS,
    GarmentCategory.JACKETS,
    GarmentCategory.SHOES,
    GarmentCategory.HATS,
    GarmentCategory.ACCESSORIES,
  ];

  const getCategoryIcon = (category: GarmentCategory | 'all') => {
    switch (category) {
      case 'all':
        return AppIcons.wardrobe;
      case GarmentCategory.SHIRTS:
        return AppIcons.shirt;
      case GarmentCategory.PANTS:
        return AppIcons.pants;
      case GarmentCategory.JACKETS:
        return AppIcons.jacket;
      case GarmentCategory.SHOES:
        return AppIcons.shoes;
      case GarmentCategory.HATS:
        return AppIcons.hat;
      case GarmentCategory.ACCESSORIES:
        return AppIcons.accessories;
      default:
        return AppIcons.wardrobe;
    }
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header - Removed for cleaner look */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.subtitle}>
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
              {!isPremium && ` • ${20 - itemCount} remaining`}
            </Text>
            {!isPremium && (
              <TouchableOpacity
                style={styles.unlockButton}
                onPress={() => navigation.navigate('Paywall')}
                activeOpacity={0.8}
              >
                <Text style={styles.unlockButtonText}>Unlock Unlimited</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddItem}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by color, brand, material..."
          onClear={() => setSearchQuery('')}
        />

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterButton,
                  selectedCategory === category && styles.filterButtonSelected,
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.8}
              >
                {(() => {
                  const icon = getCategoryIcon(category);
                  if (!icon) {
                    return null;
                  }
                  return <Icon name={icon.name} size={20} color={selectedCategory === category ? TailorContrasts.onGold : TailorContrasts.onWoodMedium} library={icon.library} style={styles.filterIcon} />;
                })()}
                <Text
                  style={[
                    styles.filterText,
                    selectedCategory === category && styles.filterTextSelected,
                  ]}
                >
                  {category === 'all' ? 'All' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Count */}
        {(filteredItems.length !== items.length || searchQuery.trim().length > 0) && (
          <View style={styles.resultsCount}>
            <Text style={styles.resultsCountText}>
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
              {searchQuery.trim().length > 0 && ` found for "${searchQuery}"`}
            </Text>
          </View>
        )}

        {/* Items Grid */}
        {isLoading ? (
          <View style={styles.grid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={`skeleton-${index}`} style={styles.itemWrapper}>
                <SkeletonCard height={200} />
              </View>
            ))}
          </View>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            type={items.length === 0 ? 'wardrobe' : 'wardrobe-search'}
            onAction={items.length === 0 ? handleAddItem : undefined}
            actionLabel={items.length === 0 ? 'Add Your First Item' : undefined}
          />
        ) : (
          <FlatList
            data={filteredItems}
            numColumns={2}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            updateCellsBatchingPeriod={50}
          />
        )}

        {/* Free Tier Upgrade Prompt */}
        {!isPremium && itemCount >= 15 && itemCount < 20 && (
          <View style={styles.upgradePrompt}>
            <View style={styles.upgradePromptContent}>
              <Icon name={AppIcons.star.name} size={24} color={TailorColors.gold} library={AppIcons.star.library} style={styles.upgradeIcon} />
              <View style={styles.upgradeTextContainer}>
                <Text style={styles.upgradeTitle}>
                  {20 - itemCount} items remaining
                </Text>
                <Text style={styles.upgradeText}>
                  Upgrade to Premium for unlimited wardrobe items
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('Paywall')}
              activeOpacity={0.8}
            >
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </WoodBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: TailorSpacing.xl,
    paddingBottom: TailorSpacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.xs / 2,
  },
  subtitle: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 13,
    marginBottom: TailorSpacing.xs,
  },
  unlockButton: {
    marginTop: TailorSpacing.xs,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.xs,
    backgroundColor: TailorColors.gold,
    borderRadius: TailorBorderRadius.md,
    alignSelf: 'flex-start',
    ...TailorShadows.small,
  },
  unlockButtonText: {
    ...TailorTypography.caption,
    color: TailorContrasts.onGold,
    fontSize: 12,
    fontWeight: '600',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: TailorColors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...TailorShadows.medium,
  },
  addButtonIcon: {
    ...TailorTypography.h1,
    color: TailorContrasts.onGold,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },
  searchContainer: {
    paddingHorizontal: TailorSpacing.xl,
    marginBottom: TailorSpacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.lg,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    borderWidth: 1,
    borderColor: TailorColors.woodLight,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: TailorSpacing.sm,
  },
  searchInput: {
    flex: 1,
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    padding: 0,
    fontSize: 15,
  },
  clearSearch: {
    ...TailorTypography.h3,
    color: TailorColors.ivory,
    fontSize: 18,
    padding: TailorSpacing.xs,
  },
  filterContainer: {
    marginBottom: TailorSpacing.md,
    paddingHorizontal: TailorSpacing.xl,
  },
  filterContent: {
    gap: TailorSpacing.sm,
    paddingRight: TailorSpacing.xl,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: TailorSpacing.lg,
    paddingVertical: TailorSpacing.md,
    borderRadius: TailorBorderRadius.round,
    backgroundColor: TailorColors.woodMedium,
    borderWidth: 1.5,
    borderColor: TailorColors.woodLight,
    gap: TailorSpacing.xs,
    minWidth: 110,
    ...TailorShadows.small,
  },
  filterButtonSelected: {
    backgroundColor: TailorColors.gold,
    borderColor: TailorColors.gold,
    ...TailorShadows.medium,
  },
  filterIcon: {
    fontSize: 18,
  },
  filterText: {
    ...TailorTypography.caption,
    color: TailorContrasts.onWoodMedium,
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  filterTextSelected: {
    color: TailorContrasts.onGold,
    fontWeight: '700',
  },
  resultsCount: {
    paddingHorizontal: TailorSpacing.xl,
    paddingBottom: TailorSpacing.sm,
  },
  resultsCountText: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontStyle: 'italic',
    fontSize: 12,
  },
  grid: {
    padding: TailorSpacing.xl,
    paddingTop: TailorSpacing.md,
  },
  row: {
    justifyContent: 'space-between',
    gap: TailorSpacing.md,
  },
  itemWrapper: {
    width: '48%',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: TailorSpacing.xxxl * 2,
    paddingHorizontal: TailorSpacing.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: TailorSpacing.lg,
  },
  emptyText: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    textAlign: 'center',
    marginBottom: TailorSpacing.xl,
    paddingHorizontal: TailorSpacing.xl,
    lineHeight: 22,
  },
  emptyButton: {
    marginTop: TailorSpacing.md,
  },
  upgradePrompt: {
    backgroundColor: TailorColors.woodMedium,
    margin: TailorSpacing.xl,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: TailorColors.gold,
    ...TailorShadows.small,
  },
  upgradePromptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: TailorSpacing.md,
  },
  upgradeIcon: {
    fontSize: 24,
    marginRight: TailorSpacing.sm,
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    ...TailorTypography.label,
    color: TailorColors.gold,
    fontWeight: '700',
    marginBottom: 2,
  },
  upgradeText: {
    ...TailorTypography.caption,
    color: TailorContrasts.onWoodMedium,
    fontSize: 12,
  },
  upgradeButton: {
    backgroundColor: TailorColors.gold,
    paddingHorizontal: TailorSpacing.lg,
    paddingVertical: TailorSpacing.sm,
    borderRadius: TailorBorderRadius.md,
    ...TailorShadows.small,
  },
  upgradeButtonText: {
    ...TailorTypography.button,
    color: TailorContrasts.onGold,
    fontSize: 14,
    fontWeight: '700',
  },
});
