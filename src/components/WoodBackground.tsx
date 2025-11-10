import React, { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';
import { TailorGradients } from '../utils/constants';
import { DevicePerformance } from '../utils/devicePerformance';

interface WoodBackgroundProps {
  children: ReactNode;
  gradient?: {
    colors: string[];
    locations?: number[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  };
  style?: ViewStyle;
}

/**
 * WoodBackground Component
 * Provides consistent wood texture background using LinearGradient
 * Implements adaptive performance for low-end devices (FIX #6)
 */
export const WoodBackground: React.FC<WoodBackgroundProps> = ({
  children,
  gradient = TailorGradients.woodDarkGradient,
  style,
}) => {
  // Get adaptive gradient based on device performance
  const adaptiveGradient = DevicePerformance.getAdaptiveGradient(gradient);
  
  return (
    <LinearGradient
      colors={adaptiveGradient.colors}
      locations={adaptiveGradient.locations}
      start={adaptiveGradient.start}
      end={adaptiveGradient.end}
      style={[styles.background, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});

