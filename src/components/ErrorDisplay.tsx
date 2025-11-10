import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TailorColors, TailorTypography, TailorSpacing, TailorBorderRadius } from '../utils/constants';
import { ErrorInfo } from '../utils/errorMessages';
import { GoldButton } from './GoldButton';
import { Icon, AppIcons } from './Icon';

interface ErrorDisplayProps {
  error: ErrorInfo;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
  style?: any;
}

/**
 * ErrorDisplay
 * Displays user-friendly error messages with retry option
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  retryCount = 0,
  maxRetries = 3,
  style,
}) => {
  const canRetry = error.retryable && onRetry && retryCount < maxRetries;
  const retriesRemaining = maxRetries - retryCount;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.content}>
        <Icon name={AppIcons.warning.name} size={64} color={TailorColors.gold} library={AppIcons.warning.library} style={styles.icon} />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>{error.userMessage}</Text>

        {canRetry && (
          <View style={styles.retryContainer}>
            <GoldButton
              title={retriesRemaining > 1 ? `Retry (${retriesRemaining} attempts left)` : 'Retry'}
              onPress={onRetry}
              style={styles.retryButton}
              accessibilityLabel={retriesRemaining > 1 ? `Retry, ${retriesRemaining} attempts remaining` : 'Retry'}
            />
          </View>
        )}

        {!canRetry && error.retryable && retryCount >= maxRetries && (
          <Text style={styles.maxRetriesText}>
            Maximum retry attempts reached. Please try again later.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: TailorSpacing.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  icon: {
    fontSize: 64,
    marginBottom: TailorSpacing.md,
  },
  title: {
    ...TailorTypography.h2,
    color: TailorColors.cream,
    textAlign: 'center',
    marginBottom: TailorSpacing.sm,
  },
  message: {
    ...TailorTypography.body,
    color: TailorColors.cream,
    textAlign: 'center',
    marginBottom: TailorSpacing.lg,
    opacity: 0.9,
  },
  retryContainer: {
    width: '100%',
    marginTop: TailorSpacing.md,
  },
  retryButton: {
    width: '100%',
  },
  maxRetriesText: {
    ...TailorTypography.caption,
    color: TailorColors.grayMedium,
    textAlign: 'center',
    marginTop: TailorSpacing.md,
  },
});

