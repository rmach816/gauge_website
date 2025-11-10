import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SectionList,
} from 'react-native';
import { GarmentType } from '../types';
import {
  GarmentCategory,
  CATEGORY_TO_GARMENTS,
} from '../utils/garmentCategories';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';

interface GarmentTypePickerProps {
  label: string;
  selectedValue?: GarmentType;
  onSelect: (value: GarmentType) => void;
  placeholder?: string;
}

interface CategorySection {
  title: GarmentCategory;
  data: GarmentType[];
}

export const GarmentTypePicker: React.FC<GarmentTypePickerProps> = ({
  label,
  selectedValue,
  onSelect,
  placeholder = 'Select garment type...',
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Organize garment types by category
  const sections: CategorySection[] = Object.values(GarmentCategory).map((category) => ({
    title: category,
    data: CATEGORY_TO_GARMENTS[category],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.pickerText,
            !selectedValue && styles.pickerTextPlaceholder,
          ]}
        >
          {selectedValue || placeholder}
        </Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>

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
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <SectionList
              sections={sections}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = selectedValue === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                    ]}
                    onPress={() => {
                      onSelect(item);
                      setModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
              )}
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    onSelect(selectedValue || GarmentType.SHIRT); // Can't clear, must have a value
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.clearButtonText}>Cancel</Text>
                </TouchableOpacity>
              }
              stickySectionHeadersEnabled={false}
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
  label: {
    ...TailorTypography.label,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.xs,
  },
  picker: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: TailorColors.woodLight,
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
    ...TailorTypography.caption,
    color: TailorColors.grayMedium,
    marginLeft: TailorSpacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: TailorColors.woodDark,
    borderRadius: TailorBorderRadius.lg,
    ...TailorShadows.large,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: TailorSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: TailorColors.woodMedium,
  },
  modalTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodDark,
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
  sectionHeader: {
    backgroundColor: TailorColors.woodMedium,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: TailorColors.woodLight,
  },
  sectionHeaderText: {
    ...TailorTypography.h3,
    color: TailorColors.gold,
    fontWeight: '600',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: TailorSpacing.md,
    paddingLeft: TailorSpacing.xl, // Indent sub-items
    borderBottomWidth: 1,
    borderBottomColor: TailorColors.woodMedium,
  },
  optionItemSelected: {
    backgroundColor: TailorColors.woodMedium,
  },
  optionText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    flex: 1,
  },
  optionTextSelected: {
    color: TailorColors.gold,
    fontWeight: '600',
  },
  checkmark: {
    ...TailorTypography.body,
    color: TailorColors.gold,
    marginLeft: TailorSpacing.sm,
  },
  clearButton: {
    padding: TailorSpacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: TailorColors.woodMedium,
  },
  clearButtonText: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    textDecorationLine: 'underline',
  },
});

