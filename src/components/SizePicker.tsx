import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';

interface SizePickerProps {
  label: string;
  selectedValue?: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
}

export const SizePicker: React.FC<SizePickerProps> = ({
  label,
  selectedValue,
  options,
  onSelect,
  placeholder = 'Select...',
}) => {
  const [modalVisible, setModalVisible] = useState(false);

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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    selectedValue === item && styles.optionItemSelected,
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
                      selectedValue === item && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedValue === item && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              ListFooterComponent={
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    onSelect('');
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.clearButtonText}>Clear Selection</Text>
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
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: TailorSpacing.md,
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

