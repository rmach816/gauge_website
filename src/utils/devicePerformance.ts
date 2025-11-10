import { Platform } from 'react-native';
import * as Device from 'expo-device';

/**
 * Device Performance Detection Utility
 * Used to optimize rendering for low-end devices (FIX #6)
 */
export const DevicePerformance = {
  /**
   * Detect if device is low-end based on available criteria
   * Conservative approach: assumes Android devices may need optimization
   */
  isLowEndDevice(): boolean {
    if (Platform.OS === 'ios') {
      // iOS devices generally handle gradients well
      // Only flag very old devices (iPhone 6s and older)
      // For now, assume iOS is fine (can be enhanced with actual device detection)
      return false;
    }
    
    if (Platform.OS === 'android') {
      // Check if device info is available
      if (Device.isDevice) {
        // For MVP, use conservative approach
        // In production, you could check:
        // - Total RAM (if available via expo-device)
        // - Device model (known low-end models)
        // - CPU cores
        // For now, return false to use full gradients
        // Test on actual low-end device and adjust
        return false;
      }
      
      // Simulator/emulator - assume it's fine
      return false;
    }
    
    return false;
  },
  
  /**
   * Get appropriate gradient based on device capability
   * Simplifies gradients on low-end devices for better performance
   */
  getAdaptiveGradient<T extends {
    colors: readonly string[] | string[];
    locations?: readonly number[] | number[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  }>(fullGradient: T): {
    colors: readonly string[];
    locations?: readonly number[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  } {
    if (this.isLowEndDevice()) {
      // Simplify to solid color (use first color)
      return {
        colors: [fullGradient.colors[0]] as const,
        locations: [0] as const,
        start: fullGradient.start,
        end: fullGradient.end,
      };
    }
    
    return {
      colors: fullGradient.colors,
      locations: fullGradient.locations,
      start: fullGradient.start,
      end: fullGradient.end,
    };
  },
};

