import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { ShoppingItem } from '../types';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/constants';
import { formatPrice } from '../utils/formatting';

interface ShoppingCardProps {
  item: ShoppingItem;
}

export const ShoppingCard: React.FC<ShoppingCardProps> = ({ item }) => {
  const handlePress = async () => {
    try {
      const canOpen = await Linking.canOpenURL(item.affiliateLink);
      if (canOpen) {
        await Linking.openURL(item.affiliateLink);
      }
    } catch (error) {
      console.error('[ShoppingCard] Failed to open link:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.retailer}>{item.retailer}</Text>
          {item.recommendedSize && (
            <View style={styles.sizeBadge}>
              <Text style={styles.sizeText}>{item.recommendedSize}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.brand}>{item.brand}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>
            {item.price > 0 ? formatPrice(item.price) : 'View Price'}
          </Text>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  content: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  retailer: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  sizeBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  sizeText: {
    ...Typography.caption,
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  name: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  brand: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    ...Typography.button,
    color: Colors.text,
    fontSize: 16,
  },
  arrow: {
    ...Typography.h2,
    color: Colors.primary,
  },
});

