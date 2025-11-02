import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MatchRating } from '../types';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/constants';

interface MatchResultProps {
  rating: MatchRating;
  analysis: string;
}

const getRatingConfig = (rating: MatchRating) => {
  switch (rating) {
    case 'great':
      return { emoji: '✅', label: 'Great Match', color: Colors.success };
    case 'okay':
      return { emoji: '⚠️', label: 'Okay', color: Colors.warning };
    case 'poor':
      return { emoji: '❌', label: 'Needs Work', color: Colors.danger };
    default:
      return { emoji: '❓', label: 'Unknown', color: Colors.textSecondary };
  }
};

export const MatchResult: React.FC<MatchResultProps> = ({ rating, analysis }) => {
  const config = getRatingConfig(rating);

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
      </View>
      <Text style={styles.analysis}>{analysis}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.md,
  },
  emoji: {
    fontSize: 24,
    marginRight: Spacing.xs,
  },
  label: {
    ...Typography.button,
    fontSize: 14,
  },
  analysis: {
    ...Typography.body,
    color: Colors.text,
    lineHeight: 22,
  },
});

