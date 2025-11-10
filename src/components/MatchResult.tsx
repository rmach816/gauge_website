import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MatchRating } from '../types';
import {
  TailorColors,
  TailorSpacing,
  TailorTypography,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';
import { Icon, AppIcons } from './Icon';

interface MatchResultProps {
  rating: MatchRating;
  analysis: string;
}

const getRatingConfig = (rating: MatchRating) => {
  switch (rating) {
    case 'great':
      return { icon: AppIcons.check, label: 'Great Match', color: TailorColors.gold };
    case 'okay':
      return { icon: AppIcons.warning, label: 'Okay', color: TailorColors.gold };
    case 'poor':
      return { icon: AppIcons.error, label: 'Needs Work', color: TailorColors.gold };
    default:
      return { icon: AppIcons.info, label: 'Unknown', color: TailorColors.gold };
  }
};

export const MatchResult: React.FC<MatchResultProps> = ({ rating, analysis }) => {
  const config = getRatingConfig(rating);

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { borderColor: config.color }]}>
        <Icon name={config.icon.name} size={20} color={config.color} library={config.icon.library} style={styles.icon} />
        <Text style={styles.label}>{config.label}</Text>
      </View>
      <Text style={styles.analysis}>{analysis}</Text>
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    borderRadius: TailorBorderRadius.round,
    marginBottom: TailorSpacing.md,
    borderWidth: 2,
    backgroundColor: TailorColors.woodDark,
  },
  icon: {
    marginRight: TailorSpacing.xs,
  },
  label: {
    ...TailorTypography.button,
    fontSize: 14,
    color: TailorColors.gold,
    fontWeight: '700',
  },
  analysis: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    lineHeight: 22,
  },
});

