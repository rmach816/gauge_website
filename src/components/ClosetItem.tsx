import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ClosetItem as ClosetItemType } from '../types';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/constants';

interface ClosetItemProps {
  item: ClosetItemType;
  onPress?: () => void;
  onDelete?: () => void;
}

export const ClosetItemComponent: React.FC<ClosetItemProps> = ({
  item,
  onPress,
  onDelete,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.imageUri }} style={styles.image} />
      <View style={styles.overlay}>
        <View style={styles.info}>
          <Text style={styles.garmentType}>{item.garmentType}</Text>
          <Text style={styles.color}>{item.color}</Text>
          {item.brand && <Text style={styles.brand}>{item.brand}</Text>}
        </View>
        {onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Text style={styles.deleteText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: Spacing.sm,
  },
  info: {
    marginBottom: Spacing.xs,
  },
  garmentType: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  color: {
    ...Typography.caption,
    color: Colors.white,
    fontSize: 12,
    opacity: 0.9,
  },
  brand: {
    ...Typography.caption,
    color: Colors.white,
    fontSize: 11,
    opacity: 0.8,
  },
  deleteButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.danger,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 20,
  },
});

