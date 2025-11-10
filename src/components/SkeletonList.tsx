import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonCard } from './SkeletonCard';
import { TailorSpacing } from '../utils/constants';

interface SkeletonListProps {
  count?: number;
  cardHeight?: number;
  variant?: 'card' | 'list';
}

/**
 * SkeletonList
 * Loading placeholder for list screens (History, Favorites, etc.)
 */
export const SkeletonList: React.FC<SkeletonListProps> = ({
  count = 5,
  cardHeight = 120,
  variant = 'list',
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard
          key={`skeleton-${index}`}
          height={cardHeight}
          variant={variant}
          style={styles.card}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: TailorSpacing.md,
  },
  card: {
    marginBottom: TailorSpacing.md,
  },
});

