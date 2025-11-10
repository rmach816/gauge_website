import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorContrasts,
} from '../utils/constants';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

/**
 * ProgressIndicator Component
 * Shows "Step X of Y" during onboarding
 * Visual progress bar
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Step {currentStep} of {totalSteps}
      </Text>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: TailorSpacing.md,
    paddingHorizontal: TailorSpacing.lg,
  },
  text: {
    ...TailorTypography.caption,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.xs,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    marginTop: TailorSpacing.xs,
  },
  progressBarBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: TailorColors.woodMedium,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: TailorColors.gold,
    borderRadius: 2,
  },
});

