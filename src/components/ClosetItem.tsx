import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ClosetItem as ClosetItemType } from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorShadows,
  TailorContrasts,
} from '../utils/constants';
import { HapticFeedback } from '../utils/haptics';

interface ClosetItemProps {
  item: ClosetItemType;
  onPress?: () => void;
  onDelete?: () => void;
}

/**
 * Premium wardrobe item card component
 * Features: Gradient overlay, elegant typography, smooth shadows
 */
export const ClosetItemComponent: React.FC<ClosetItemProps> = ({
  item,
  onPress,
  onDelete,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    HapticFeedback.light();
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const labelText = `${item.garmentType?.replace(/_/g, ' ') || 'Item'}, ${item.color || ''}${item.secondaryColor ? ` and ${item.secondaryColor}` : ''}${item.brand ? ` by ${item.brand}` : ''}${item.material ? `, ${item.material}` : ''}`;
  const accessibilityLabel = labelText.trim() || 'Closet item';

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={onPress ? "Tap to view details" : undefined}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
      <Image 
        source={{ uri: item.imageUri }} 
        style={styles.image}
        cachePolicy="memory-disk"
        contentFit="cover"
        transition={200}
      />
      
      {/* Gradient overlay for better text readability */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.85)']}
        style={styles.gradient}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0, y: 1 }}
      />

            {/* Delete button - top right corner */}
            {onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.garmentType.replace(/_/g, ' ')}`}
                accessibilityHint="Removes this item from your wardrobe"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.deleteButtonInner}>
                  <Text style={styles.deleteIcon}>✕</Text>
                </View>
              </TouchableOpacity>
            )}

      {/* Item info overlay */}
      <View style={styles.infoContainer}>
        <Text style={styles.garmentType} numberOfLines={1}>
          {item.garmentType.replace(/_/g, ' ')}
        </Text>
        <View style={styles.detailsRow}>
          <Text style={styles.color} numberOfLines={1}>
            {item.color}
            {item.secondaryColor ? ` / ${item.secondaryColor}` : ''}
          </Text>
          {item.material && (
            <>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.material} numberOfLines={1}>
                {item.material}
              </Text>
            </>
          )}
        </View>
        {item.brand && (
          <Text style={styles.brand} numberOfLines={1}>
            {item.brand}
          </Text>
        )}
      </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 0.85, // Slightly taller than square for better proportions
    borderRadius: TailorBorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: TailorColors.woodMedium,
    ...TailorShadows.medium,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  deleteButton: {
    position: 'absolute',
    top: TailorSpacing.sm,
    right: TailorSpacing.sm,
    zIndex: 10,
    minWidth: 44, // Ensure minimum touch target size
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  deleteIcon: {
    color: TailorColors.cream,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 18,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: TailorSpacing.md,
    paddingTop: TailorSpacing.lg,
  },
  garmentType: {
    ...TailorTypography.label,
    color: TailorColors.cream,
    fontWeight: '700',
    fontSize: 14,
    marginBottom: TailorSpacing.xs / 2,
    textTransform: 'capitalize',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: TailorSpacing.xs / 2,
  },
  color: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 12,
    fontWeight: '500',
  },
  separator: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 10,
    marginHorizontal: TailorSpacing.xs / 2,
    opacity: 0.6,
  },
  material: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
  },
  brand: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 11,
    opacity: 0.8,
    fontStyle: 'italic',
  },
});
