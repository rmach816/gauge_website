import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { TailorColors, TailorTypography, TailorSpacing, TailorBorderRadius, TailorShadows } from '../utils/constants';
import { HapticFeedback } from '../utils/haptics';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
  count?: number;
}

/**
 * FilterChip Component
 * Individual filter button/chip
 */
const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onPress,
  icon,
  count,
}) => {
  const handlePress = () => {
    HapticFeedback.selection();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && styles.chipSelected,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${label} filter${selected ? ', selected' : ''}${count !== undefined && count > 0 ? `, ${count} items` : ''}`}
      accessibilityState={{ selected }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {icon && <Text style={styles.chipIcon}>{icon}</Text>}
      <Text
        style={[
          styles.chipText,
          selected && styles.chipTextSelected,
        ]}
      >
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.countBadge, selected && styles.countBadgeSelected]}>
          <Text style={[styles.countText, selected && styles.countTextSelected]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

interface FilterChipsProps {
  filters: Array<{
    id: string;
    label: string;
    icon?: string;
    count?: number;
  }>;
  selectedFilter: string;
  onFilterChange: (filterId: string) => void;
  showClearAll?: boolean;
  onClearAll?: () => void;
  style?: ViewStyle;
}

/**
 * FilterChips Component
 * Horizontal scrollable list of filter chips
 */
export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  selectedFilter,
  onFilterChange,
  showClearAll = false,
  onClearAll,
  style,
}) => {
  const activeFilterCount = filters.filter((f) => f.id === selectedFilter && f.id !== 'all').length;

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => (
          <FilterChip
            key={filter.id}
            label={filter.label}
            selected={selectedFilter === filter.id}
            onPress={() => onFilterChange(filter.id)}
            icon={filter.icon}
            count={filter.count}
          />
        ))}
        {showClearAll && activeFilterCount > 0 && onClearAll && (
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={() => {
              HapticFeedback.light();
              onClearAll();
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
            accessibilityHint="Removes all active filters"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: TailorSpacing.sm,
  },
  scrollContent: {
    paddingHorizontal: TailorSpacing.xl,
    gap: TailorSpacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    borderRadius: TailorBorderRadius.round,
    backgroundColor: TailorColors.woodMedium,
    borderWidth: 1.5,
    borderColor: TailorColors.woodLight,
    marginRight: TailorSpacing.sm,
    ...TailorShadows.small,
  },
  chipSelected: {
    backgroundColor: TailorColors.gold,
    borderColor: TailorColors.gold,
    ...TailorShadows.medium,
  },
  chipIcon: {
    fontSize: 16,
    marginRight: TailorSpacing.xs,
  },
  chipText: {
    ...TailorTypography.caption,
    color: TailorColors.cream,
    fontWeight: '600',
    fontSize: 14,
  },
  chipTextSelected: {
    color: TailorColors.navy,
    fontWeight: '700',
  },
  countBadge: {
    marginLeft: TailorSpacing.xs,
    paddingHorizontal: TailorSpacing.xs,
    paddingVertical: 2,
    borderRadius: TailorBorderRadius.sm,
    backgroundColor: TailorColors.woodDark,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeSelected: {
    backgroundColor: TailorColors.navy,
  },
  countText: {
    ...TailorTypography.caption,
    color: TailorColors.cream,
    fontSize: 11,
    fontWeight: '700',
  },
  countTextSelected: {
    color: TailorColors.cream,
  },
  clearAllButton: {
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    borderRadius: TailorBorderRadius.round,
    backgroundColor: TailorColors.woodDark,
    borderWidth: 1.5,
    borderColor: TailorColors.woodLight,
    justifyContent: 'center',
    marginLeft: TailorSpacing.xs,
  },
  clearAllText: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    fontSize: 13,
    fontWeight: '600',
  },
});

