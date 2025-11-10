import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { NetworkService } from '../utils/network';
import { TailorColors, TailorSpacing, TailorTypography } from '../utils/constants';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Check initial state
    NetworkService.isOnline()
      .then((online) => {
        setIsOffline(!online);
        if (!online) {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      })
      .catch((error) => {
        console.error('[OfflineBanner] Failed to check network status:', error);
        // Default to online if check fails
        setIsOffline(false);
      });

    // Subscribe to network changes
    const unsubscribe = NetworkService.subscribe((state) => {
      const offline = !state.isConnected || state.isInternetReachable === false;
      setIsOffline(offline);
      
      if (offline) {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.spring(slideAnim, {
          toValue: -100,
          useNativeDriver: true,
        }).start();
      }
    });

    return () => unsubscribe();
  }, [slideAnim]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>📡</Text>
        <Text style={styles.text}>No internet connection</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: TailorColors.navy,
    paddingVertical: TailorSpacing.sm,
    paddingHorizontal: TailorSpacing.md,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: TailorSpacing.xs,
  },
  text: {
    ...TailorTypography.caption,
    color: TailorColors.cream,
    fontWeight: '600',
  },
});

