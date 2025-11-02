import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Suggestion } from '../types';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/constants';

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
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  garmentType: {
    ...Typography.h3,
    color: Colors.primary,
  },
  description: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  reasoning: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  colorsLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
  colorsText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  shopButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 14,
  },
});

