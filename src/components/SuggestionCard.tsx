import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Suggestion } from '../types';
import {
  TailorColors,
  TailorSpacing,
  TailorTypography,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onShopPress?: () => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onShopPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.garmentType}>{suggestion.garmentType}</Text>
      </View>
      <Text style={styles.description}>{suggestion.description}</Text>
      <Text style={styles.reasoning}>{suggestion.reasoning}</Text>
      {suggestion.colors && suggestion.colors.length > 0 && (
        <View style={styles.colorsContainer}>
          <Text style={styles.colorsLabel}>Colors: </Text>
          <Text style={styles.colorsText}>{suggestion.colors.join(', ')}</Text>
        </View>
      )}
      {onShopPress && (
        <TouchableOpacity style={styles.shopButton} onPress={onShopPress}>
          <Text style={styles.shopButtonText}>Shop Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    marginBottom: TailorSpacing.md,
    borderWidth: 1,
    borderColor: TailorColors.woodLight,
    ...TailorShadows.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TailorSpacing.sm,
  },
  garmentType: {
    ...TailorTypography.h3,
    color: TailorColors.gold,
    fontWeight: '700',
  },
  description: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    fontWeight: '600',
    marginBottom: TailorSpacing.xs,
  },
  reasoning: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginBottom: TailorSpacing.sm,
    lineHeight: 20,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: TailorSpacing.sm,
  },
  colorsLabel: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontWeight: '600',
  },
  colorsText: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
  },
  shopButton: {
    backgroundColor: TailorColors.gold,
    paddingVertical: TailorSpacing.sm,
    paddingHorizontal: TailorSpacing.md,
    borderRadius: TailorBorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: TailorSpacing.xs,
    ...TailorShadows.small,
  },
  shopButtonText: {
    ...TailorTypography.button,
    color: TailorContrasts.onGold,
    fontSize: 14,
    fontWeight: '700',
  },
});

