import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { TailorColors, TailorTypography, TailorSpacing, TailorBorderRadius } from '../utils/constants';

interface RetryButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  retryCount?: number;
  maxRetries?: number;
  style?: any;
}

/**
 * RetryButton
 * Reusable retry button with loading state and retry count
 */
export const RetryButton: React.FC<RetryButtonProps> = ({
  onPress,
  isLoading = false,
  retryCount = 0,
  maxRetries = 3,
  style,
}) => {
  const retriesRemaining = maxRetries - retryCount;
  const isDisabled = isLoading || retriesRemaining <= 0;

  return (
    <TouchableOpacity
      style={[styles.button, isDisabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={retriesRemaining > 0 ? `Retry, ${retriesRemaining} attempts remaining` : 'Max retries reached'}
      accessibilityHint={retriesRemaining > 0 ? 'Retries the failed operation' : 'Maximum retry attempts have been reached'}
      accessibilityState={{ disabled: isDisabled }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {isLoading ? (
        <ActivityIndicator color={TailorColors.navy} size="small" />
      ) : (
        <Text style={[styles.text, isDisabled && styles.textDisabled]}>
          {retriesRemaining > 0
            ? `Retry${retriesRemaining < maxRetries ? ` (${retriesRemaining} left)` : ''}`
            : 'Max retries reached'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: TailorColors.gold,
    paddingHorizontal: TailorSpacing.lg,
    paddingVertical: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    minHeight: 44, // Ensure minimum touch target size
  },
  buttonDisabled: {
    backgroundColor: TailorColors.woodMedium,
    opacity: 0.6,
  },
  text: {
    ...TailorTypography.button,
    color: TailorColors.navy,
  },
  textDisabled: {
    color: TailorColors.grayMedium,
  },
});

