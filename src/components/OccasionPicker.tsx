import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Occasion } from '../types';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/constants';

interface OccasionPickerProps {
  selectedOccasion?: Occasion;
  onSelect: (occasion: Occasion) => void;
  multiSelect?: boolean;
  selectedOccasions?: Occasion[];
}

export const OccasionPicker: React.FC<OccasionPickerProps> = ({
  selectedOccasion,
  onSelect,
  multiSelect = false,
  selectedOccasions = [],
}) => {
  const occasions = Object.values(Occasion);

  const isSelected = (occasion: Occasion): boolean => {
    if (multiSelect) {
      return selectedOccasions.includes(occasion);
    }
    return selectedOccasion === occasion;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {occasions.map((occasion) => {
        const selected = isSelected(occasion);
        return (
          <TouchableOpacity
            key={occasion}
            style={[styles.occasionButton, selected && styles.occasionButtonSelected]}
            onPress={() => onSelect(occasion)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.occasionText,
                selected && styles.occasionTextSelected,
              ]}
            >
              {occasion}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  occasionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  occasionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  occasionText: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '500',
  },
  occasionTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
});

