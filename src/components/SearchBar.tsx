import React, { useState, useCallback, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { TailorColors, TailorTypography, TailorSpacing, TailorBorderRadius, TailorShadows } from '../utils/constants';
import { debounce } from '../utils/debounce';
import { HapticFeedback } from '../utils/haptics';
import { Icon, AppIcons } from './Icon';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  showClearButton?: boolean;
  style?: ViewStyle;
}

/**
 * Enhanced SearchBar Component
 * Features: Real-time search with debouncing, clear button, haptic feedback
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  showClearButton = true,
  style,
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync localValue with value prop when it changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced search handler
  const debouncedOnChange = useCallback(
    debounce((text: string) => {
      onChangeText(text);
    }, 300),
    [onChangeText]
  );

  const handleChangeText = (text: string) => {
    setLocalValue(text);
    debouncedOnChange(text);
    if (text.length > 0) {
      HapticFeedback.selection();
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChangeText('');
    if (onClear) {
      onClear();
    }
    HapticFeedback.light();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchInputContainer}>
        <Icon name={AppIcons.search.name} size={18} color={TailorColors.grayMedium} library={AppIcons.search.library} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={localValue}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={TailorColors.grayMedium}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityRole="search"
          accessibilityLabel="Search input"
          accessibilityHint={`Enter text to search. ${localValue.length > 0 ? `Currently searching for ${localValue}` : ''}`}
        />
        {showClearButton && localValue.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            accessibilityHint="Clears the search input"
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: TailorSpacing.xl,
    paddingVertical: TailorSpacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.round,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    borderWidth: 1.5,
    borderColor: TailorColors.woodLight,
    ...TailorShadows.small,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: TailorSpacing.sm,
  },
  searchInput: {
    flex: 1,
    ...TailorTypography.body,
    color: TailorColors.cream,
    fontSize: 16,
    paddingVertical: TailorSpacing.xs,
  },
  clearButton: {
    padding: TailorSpacing.xs,
    marginLeft: TailorSpacing.xs,
  },
  clearIcon: {
    fontSize: 16,
    color: TailorColors.grayMedium,
    fontWeight: '600',
  },
});

