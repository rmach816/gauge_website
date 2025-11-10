import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClosetService } from '../services/closet';
import { ClosetItem } from '../types';
import { ClosetItemComponent } from './ClosetItem';
import { Icon, AppIcons } from './Icon';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';

interface WardrobeSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (items: ClosetItem[]) => void;
  selectedItems?: ClosetItem[];
  multiSelect?: boolean;
}

export const WardrobeSelectorModal: React.FC<WardrobeSelectorModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedItems = [],
  multiSelect = true,
}) => {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(selectedItems.map((item) => item.id))
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadItems();
      // Reset selection when modal opens
      setSelected(new Set(selectedItems.map((item) => item.id)));
    }
  }, [visible, selectedItems]);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const closetItems = await ClosetService.getClosetItems();
      setItems(closetItems);
    } catch (error) {
      console.error('[WardrobeSelectorModal] Failed to load items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (itemId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      if (!multiSelect) {
        newSelected.clear();
      }
      newSelected.add(itemId);
    }
    setSelected(newSelected);
  };

  const handleConfirm = () => {
    const selectedItemsList = items.filter((item) => selected.has(item.id));
    onSelect(selectedItemsList);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const renderItem = ({ item }: { item: ClosetItem }) => {
    const isSelected = selected.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.itemContainer, isSelected && styles.itemContainerSelected]}
        onPress={() => toggleSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.itemImageContainer}>
          <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
          {isSelected && (
            <View style={styles.checkmarkOverlay}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemType}>{item.garmentType}</Text>
          <Text style={styles.itemColor}>{item.color}</Text>
          {item.brand && <Text style={styles.itemBrand}>{item.brand}</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalOverlay} edges={['top', 'bottom']}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {multiSelect ? 'Select Items from Wardrobe' : 'Select Item from Wardrobe'}
            </Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={TailorColors.gold} size="large" />
              <Text style={styles.loadingText}>Loading wardrobe...</Text>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name={AppIcons.wardrobe.name} size={48} color={TailorColors.grayMedium} library={AppIcons.wardrobe.library} style={styles.emptyIcon} />
              <Text style={styles.emptyText}>Your wardrobe is empty</Text>
              <Text style={styles.emptySubtext}>
                Add items to your wardrobe to reference them in chat
              </Text>
            </View>
          ) : (
            <>
              <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />

              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    selected.size === 0 && styles.confirmButtonDisabled,
                  ]}
                  onPress={handleConfirm}
                  disabled={selected.size === 0}
                >
                  <Text style={styles.confirmButtonText}>
                    {multiSelect
                      ? `Select ${selected.size} Item${selected.size !== 1 ? 's' : ''}`
                      : 'Select Item'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: TailorColors.woodDark,
    borderTopLeftRadius: TailorBorderRadius.lg,
    borderTopRightRadius: TailorBorderRadius.lg,
    ...TailorShadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: TailorSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: TailorColors.woodMedium,
  },
  title: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodDark,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    ...TailorTypography.h2,
    color: TailorContrasts.onWoodDark,
    fontSize: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    marginTop: TailorSpacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: TailorSpacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: TailorSpacing.md,
  },
  emptyText: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.xs,
  },
  emptySubtext: {
    ...TailorTypography.body,
    color: TailorColors.grayMedium,
    textAlign: 'center',
  },
  listContent: {
    padding: TailorSpacing.md,
  },
  itemContainer: {
    flex: 1,
    margin: TailorSpacing.sm,
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemContainerSelected: {
    borderColor: TailorColors.gold,
  },
  itemImageContainer: {
    width: '100%',
    aspectRatio: 0.75,
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  checkmarkOverlay: {
    position: 'absolute',
    top: TailorSpacing.xs,
    right: TailorSpacing.xs,
    backgroundColor: TailorColors.gold,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...TailorShadows.small,
  },
  checkmark: {
    color: TailorContrasts.onGold,
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemInfo: {
    padding: TailorSpacing.sm,
  },
  itemType: {
    ...TailorTypography.caption,
    color: TailorColors.gold,
    fontWeight: '600',
    marginBottom: TailorSpacing.xs / 2,
  },
  itemColor: {
    ...TailorTypography.caption,
    color: TailorContrasts.onWoodMedium,
    fontSize: 12,
  },
  itemBrand: {
    ...TailorTypography.caption,
    color: TailorColors.grayMedium,
    fontSize: 11,
    marginTop: TailorSpacing.xs / 2,
  },
  footer: {
    flexDirection: 'row',
    padding: TailorSpacing.md,
    borderTopWidth: 1,
    borderTopColor: TailorColors.woodMedium,
    gap: TailorSpacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    backgroundColor: TailorColors.woodMedium,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    backgroundColor: TailorColors.gold,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: TailorColors.grayMedium,
    opacity: 0.5,
  },
  confirmButtonText: {
    ...TailorTypography.body,
    color: TailorContrasts.onGold,
    fontWeight: '600',
  },
});

