import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { SkeletonList } from '../components/SkeletonList';
import { EmptyState } from '../components/EmptyState';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WoodBackground } from '../components/WoodBackground';
import { StorageService } from '../services/storage';
import { Icon, AppIcons } from '../components/Icon';
import {
  RootStackParamList,
  FavoriteOutfit,
  CompleteOutfit,
} from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';
import { formatDate } from '../utils/formatting';

type NavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * FavoritesScreen
 * Displays all saved favorite outfits with options to view, edit, and delete
 */
export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [favorites, setFavorites] = useState<FavoriteOutfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<FavoriteOutfit | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  // Reload when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadFavorites();
    });
    return unsubscribe;
  }, [navigation]);

  const loadFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedFavorites = await StorageService.getFavoriteOutfits();
      // Sort by most recently saved
      savedFavorites.sort((a, b) => 
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );
      setFavorites(savedFavorites);
    } catch (error) {
      console.error('[FavoritesScreen] Failed to load favorites:', error);
      Alert.alert('Error', 'Failed to load favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleViewFavorite = useCallback((favorite: FavoriteOutfit) => {
    // Create a temporary history entry to view the outfit
    // We'll navigate to ResultScreen with a special favorite ID
    navigation.navigate('ViewFavorite', { favoriteId: favorite.id });
  }, [navigation]);

  const handleDeleteFavorite = useCallback((favorite: FavoriteOutfit) => {
    Alert.alert(
      'Delete Favorite',
      `Are you sure you want to delete "${favorite.name || 'this outfit'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.deleteFavoriteOutfit(favorite.id);
              await loadFavorites();
              Alert.alert('Success', 'Favorite deleted.');
            } catch (error) {
              console.error('[FavoritesScreen] Failed to delete favorite:', error);
              Alert.alert('Error', 'Failed to delete favorite. Please try again.');
            }
          },
        },
      ]
    );
  }, [loadFavorites]);

  const handleEditFavorite = useCallback((favorite: FavoriteOutfit) => {
    setEditingFavorite(favorite);
    setEditName(favorite.name || '');
    setEditModalVisible(true);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingFavorite) return;
    
    try {
      await StorageService.updateFavoriteOutfit(editingFavorite.id, {
        name: editName.trim() || undefined,
      });
      await loadFavorites();
      setEditModalVisible(false);
      setEditingFavorite(null);
      setEditName('');
    } catch (error) {
      console.error('[FavoritesScreen] Failed to update favorite:', error);
      Alert.alert('Error', 'Failed to update favorite. Please try again.');
    }
  }, [editingFavorite, editName, loadFavorites]);

  const handleCancelEdit = useCallback(() => {
    setEditModalVisible(false);
    setEditingFavorite(null);
    setEditName('');
  }, []);

  const renderFavoriteItem = useCallback(({ item }: { item: FavoriteOutfit }) => {
    const outfit = item.outfit;
    const firstItem = outfit.items[0];
    const hasWardrobeItems = outfit.items.some((it) => it.existingItem);

    return (
      <TouchableOpacity
        style={styles.favoriteCard}
        onPress={() => handleViewFavorite(item)}
        activeOpacity={0.7}
      >
        {/* Show first wardrobe item image if available */}
        {firstItem?.existingItem?.imageUri && (
          <Image
            source={{ uri: firstItem.existingItem.imageUri }}
            style={styles.favoriteImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
        )}
        <View style={styles.favoriteContent}>
          <View style={styles.favoriteHeader}>
            <Text style={styles.favoriteName}>
              {item.name || `Outfit for ${outfit.occasion}`}
            </Text>
            <Text style={styles.favoriteDate}>
              {formatDate(item.savedAt)}
            </Text>
          </View>
          <Text style={styles.favoriteOccasion}>
            {outfit.occasion}
          </Text>
          <Text style={styles.favoriteItems}>
            {outfit.items.length} items
            {hasWardrobeItems && ' • Includes wardrobe items'}
          </Text>
          <View style={styles.favoriteActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditFavorite(item)}
            >
              <Icon name={AppIcons.edit.name} size={16} color={TailorColors.gold} library={AppIcons.edit.library} style={{ marginRight: 4 }} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteFavorite(item)}
            >
              <Icon name={AppIcons.delete.name} size={16} color={TailorColors.navy} library={AppIcons.delete.library} style={{ marginRight: 4 }} />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleViewFavorite, handleEditFavorite, handleDeleteFavorite]);

  if (isLoading) {
    return (
      <WoodBackground>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Text style={styles.title}>Favorite Outfits</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <SkeletonList count={5} variant="list" />
        </SafeAreaView>
      </WoodBackground>
    );
  }

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorite Outfits</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {favorites.length === 0 ? (
          <EmptyState
            type="favorites"
            onAction={() => navigation.navigate('BuildOutfit')}
          />
        ) : (
          <FlatList
            data={favorites}
            renderItem={renderFavoriteItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={10}
            updateCellsBatchingPeriod={50}
          />
        )}

        {/* Edit Name Modal */}
        <Modal
          visible={editModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancelEdit}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Favorite Name</Text>
              <Text style={styles.modalSubtitle}>Enter a new name for this favorite:</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter name..."
                placeholderTextColor={TailorColors.ivory}
                autoFocus={true}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.modalButtonTextSave}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </WoodBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: TailorSpacing.xl,
    paddingBottom: TailorSpacing.md,
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
  },
  closeButton: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodDark,
    fontSize: 28,
  },
  listContent: {
    padding: TailorSpacing.xl,
    paddingTop: 0,
  },
  favoriteCard: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.md,
    overflow: 'hidden',
    ...TailorShadows.small,
  },
  favoriteImage: {
    width: '100%',
    height: 200,
    backgroundColor: TailorColors.woodLight,
  },
  favoriteContent: {
    padding: TailorSpacing.md,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: TailorSpacing.xs,
  },
  favoriteName: {
    ...TailorTypography.h3,
    color: TailorColors.gold,
    flex: 1,
    marginRight: TailorSpacing.sm,
  },
  favoriteDate: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
  },
  favoriteOccasion: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
  },
  favoriteItems: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginBottom: TailorSpacing.sm,
  },
  favoriteActions: {
    flexDirection: 'row',
    gap: TailorSpacing.sm,
    marginTop: TailorSpacing.xs,
  },
  actionButton: {
    flex: 1,
    paddingVertical: TailorSpacing.xs,
    paddingHorizontal: TailorSpacing.sm,
    borderRadius: TailorBorderRadius.sm,
    borderWidth: 1,
    borderColor: TailorColors.gold,
    alignItems: 'center',
  },
  deleteButton: {
    borderColor: TailorColors.woodLight,
  },
  actionButtonText: {
    ...TailorTypography.caption,
    color: TailorColors.gold,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: TailorColors.ivory,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: TailorSpacing.xl,
  },
  emptyStateText: {
    fontSize: 64,
    marginBottom: TailorSpacing.md,
  },
  emptyStateTitle: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.sm,
  },
  emptyStateDescription: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: TailorSpacing.xl,
  },
  modalContent: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.lg,
    padding: TailorSpacing.xl,
    width: '100%',
    maxWidth: 400,
    ...TailorShadows.large,
  },
  modalTitle: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
  },
  modalSubtitle: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    marginBottom: TailorSpacing.md,
  },
  modalInput: {
    backgroundColor: TailorColors.woodLight,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    ...TailorTypography.body,
    color: TailorContrasts.onWoodLight,
    marginBottom: TailorSpacing.md,
    borderWidth: 1,
    borderColor: TailorColors.gold,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: TailorSpacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: TailorColors.woodLight,
    borderWidth: 1,
    borderColor: TailorColors.ivory,
  },
  modalButtonSave: {
    backgroundColor: TailorColors.gold,
  },
  modalButtonTextCancel: {
    ...TailorTypography.button,
    color: TailorContrasts.onWoodLight,
  },
  modalButtonTextSave: {
    ...TailorTypography.button,
    color: TailorContrasts.onGold,
  },
});

