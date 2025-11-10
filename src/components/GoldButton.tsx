import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TailorGradients,
  TailorColors,
  TailorTypography,
  TailorBorderRadius,
  TailorSpacing,
  TailorContrasts,
} from '../utils/constants';
import { DevicePerformance } from '../utils/devicePerformance';
import { HapticFeedback } from '../utils/haptics';

interface GoldButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary';
  accessibilityLabel?: string;
}

/**
 * GoldButton Component
 * Premium CTA button with gold gradient background
 * Uses navy text (not gold) for proper contrast (CRITICAL FIX #1)
 * Implements adaptive performance for low-end devices (FIX #6)
 */
export const GoldButton: React.FC<GoldButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  variant = 'primary',
  accessibilityLabel,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Get adaptive gradient based on device performance
  const adaptiveGradient = DevicePerformance.getAdaptiveGradient(
    TailorGradients.goldGradient
  );

  const handlePressIn = () => {
    HapticFeedback.light();
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
    HapticFeedback.medium();
    onPress();
  };
  
  const buttonContent = (
    <LinearGradient
      colors={adaptiveGradient.colors as any}
      locations={adaptiveGradient.locations as any}
      start={adaptiveGradient.start}
      end={adaptiveGradient.end}
      style={[
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={TailorContrasts.onGold} size="small" />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'secondary' && styles.buttonTextSecondary,
            disabled && styles.buttonTextDisabled,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </LinearGradient>
  );
  
  if (disabled || loading) {
    return buttonContent;
  }
  
  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={(accessibilityLabel || title) || 'Button'}
      accessibilityHint={disabled ? 'Button is disabled' : loading ? 'Loading' : undefined}
      accessibilityState={{ disabled, busy: loading }}
    >
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {buttonContent}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: TailorSpacing.md,
    paddingHorizontal: TailorSpacing.xl,
    borderRadius: TailorBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonSecondary: {
    paddingVertical: TailorSpacing.sm,
    paddingHorizontal: TailorSpacing.lg,
    minHeight: 40,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...TailorTypography.button,
    color: TailorContrasts.onGold, // Navy text on gold (CRITICAL FIX #1)
  },
  buttonTextSecondary: {
    fontSize: 14,
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});

