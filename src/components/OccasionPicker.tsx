import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { Occasion } from '../types';
import {
  TailorColors,
  TailorSpacing,
  TailorTypography,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';

interface OccasionPickerProps {
  selectedOccasion?: Occasion | string;
  onSelect: (occasion: Occasion | string) => void;
  multiSelect?: boolean;
  selectedOccasions?: Occasion[];
}

export const OccasionPicker: React.FC<OccasionPickerProps> = ({
  selectedOccasion,
  onSelect,
  multiSelect = false,
  selectedOccasions = [],
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [customOccasion, setCustomOccasion] = useState('');
  const occasions = Object.values(Occasion);

  const isSelected = (occasion: Occasion): boolean => {
    if (multiSelect) {
      return selectedOccasions.includes(occasion);
    }
    return selectedOccasion === occasion;
  };

  const handleSelectOccasion = (occasion: Occasion) => {
    onSelect(occasion);
    setModalVisible(false);
    setCustomOccasion(''); // Clear custom input when selecting from list
  };

  const handleCustomOccasion = () => {
    if (customOccasion.trim()) {
      onSelect(customOccasion.trim());
      setModalVisible(false);
      setCustomOccasion(''); // Clear after selection
    }
  };

  const isCustomOccasion = selectedOccasion && !Object.values(Occasion).includes(selectedOccasion as Occasion);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.pickerText,
            !selectedOccasion && styles.pickerTextPlaceholder,
          ]}
        >
          {selectedOccasion || 'Select occasion...'}
        </Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>

      {/* Custom Occasion Input */}
      <View style={styles.customInputContainer}>
        <Text style={styles.customLabel}>Or enter your own:</Text>
        <TextInput
          style={styles.customInput}
          value={customOccasion}
          onChangeText={setCustomOccasion}
          placeholder="e.g., Christmas party, Thanksgiving with family"
          placeholderTextColor={TailorColors.grayMedium}
          onSubmitEditing={handleCustomOccasion}
          returnKeyType="done"
        />
        {customOccasion.trim() && (
          <TouchableOpacity
            style={styles.customButton}
            onPress={handleCustomOccasion}
            activeOpacity={0.7}
          >
            <Text style={styles.customButtonText}>Use Custom</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Occasion</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={occasions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const selected = isSelected(item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      selected && styles.optionItemSelected,
                    ]}
                    onPress={() => handleSelectOccasion(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {selected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: TailorSpacing.md,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    borderWidth: 1,
    borderColor: TailorColors.woodLight,
    ...TailorShadows.small,
  },
  pickerText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    flex: 1,
  },
  pickerTextPlaceholder: {
    color: TailorColors.grayMedium,
  },
  pickerArrow: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    marginLeft: TailorSpacing.sm,
  },
  customInputContainer: {
    marginTop: TailorSpacing.md,
  },
  customLabel: {
    ...TailorTypography.caption,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.xs,
    fontWeight: '600',
  },
  customInput: {
    backgroundColor: TailorColors.woodMedium,
    borderWidth: 1,
    borderColor: TailorColors.woodLight,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.sm,
  },
  customButton: {
    backgroundColor: TailorColors.gold,
    paddingVertical: TailorSpacing.sm,
    paddingHorizontal: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    alignSelf: 'flex-start',
    ...TailorShadows.small,
  },
  customButtonText: {
    ...TailorTypography.button,
    color: TailorContrasts.onGold,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: TailorColors.woodDark,
    borderTopLeftRadius: TailorBorderRadius.lg,
    borderTopRightRadius: TailorBorderRadius.lg,
    padding: TailorSpacing.md,
    maxHeight: '80%',
    ...TailorShadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TailorSpacing.md,
  },
  modalTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodDark,
  },
  closeButton: {
    padding: TailorSpacing.sm,
  },
  closeButtonText: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodDark,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: TailorSpacing.md,
    paddingHorizontal: TailorSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: TailorColors.woodMedium,
  },
  optionItemSelected: {
    backgroundColor: TailorColors.gold,
  },
  optionText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
  },
  optionTextSelected: {
    fontWeight: 'bold',
    color: TailorContrasts.onGold, // Use navy text on gold background
  },
  checkmark: {
    ...TailorTypography.body,
    color: TailorContrasts.onGold, // Use navy text on gold background
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: TailorSpacing.md,
    padding: TailorSpacing.md,
    alignItems: 'center',
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
  },
  cancelButtonText: {
    ...TailorTypography.button,
    color: TailorContrasts.onWoodMedium,
  },
});

