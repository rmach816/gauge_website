import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { TailorColors, TailorSpacing, TailorBorderRadius } from '../utils/constants';

interface SkeletonCardProps {
  width?: number | string;
  height?: number;
  style?: any;
  variant?: 'card' | 'list';
}

/**
 * SkeletonCard
 * Loading placeholder for wardrobe item cards
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  width = '100%',
  height = 200,
  style,
  variant = 'card',
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  if (variant === 'list') {
    return (
      <View style={[styles.listContainer, { width, height: height || 120 }, style]}>
        <Animated.View
          style={[
            styles.shimmer,
            {
              opacity,
            },
          ]}
        />
        <View style={styles.listContent}>
          <View style={styles.listImagePlaceholder} />
          <View style={styles.listTextContainer}>
            <View style={styles.listTitlePlaceholder} />
            <View style={styles.listSubtitlePlaceholder} />
            <View style={styles.listMetaPlaceholder} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            opacity,
          },
        ]}
      />
      <View style={styles.content}>
        <View style={styles.imagePlaceholder} />
        <View style={styles.textContainer}>
          <View style={styles.titlePlaceholder} />
          <View style={styles.subtitlePlaceholder} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: TailorBorderRadius.md,
    backgroundColor: TailorColors.woodMedium,
    overflow: 'hidden',
    marginBottom: TailorSpacing.md,
  },
  listContainer: {
    borderRadius: TailorBorderRadius.md,
    backgroundColor: TailorColors.woodMedium,
    overflow: 'hidden',
    marginBottom: TailorSpacing.md,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: TailorColors.woodLight,
  },
  content: {
    flex: 1,
    padding: TailorSpacing.sm,
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: TailorColors.woodDark,
    borderRadius: TailorBorderRadius.sm,
    marginBottom: TailorSpacing.xs,
  },
  textContainer: {
    paddingTop: TailorSpacing.xs,
  },
  titlePlaceholder: {
    height: 16,
    backgroundColor: TailorColors.woodDark,
    borderRadius: 4,
    marginBottom: TailorSpacing.xs,
    width: '70%',
  },
  subtitlePlaceholder: {
    height: 12,
    backgroundColor: TailorColors.woodDark,
    borderRadius: 4,
    width: '50%',
  },
  // List variant styles
  listContent: {
    flexDirection: 'row',
    padding: TailorSpacing.md,
  },
  listImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: TailorColors.woodDark,
    borderRadius: TailorBorderRadius.sm,
    marginRight: TailorSpacing.md,
  },
  listTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitlePlaceholder: {
    height: 18,
    backgroundColor: TailorColors.woodDark,
    borderRadius: 4,
    marginBottom: TailorSpacing.xs,
    width: '80%',
  },
  listSubtitlePlaceholder: {
    height: 14,
    backgroundColor: TailorColors.woodDark,
    borderRadius: 4,
    marginBottom: TailorSpacing.xs,
    width: '60%',
  },
  listMetaPlaceholder: {
    height: 12,
    backgroundColor: TailorColors.woodDark,
    borderRadius: 4,
    width: '40%',
  },
});

