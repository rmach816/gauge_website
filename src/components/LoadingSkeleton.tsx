import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../utils/constants';

import { StyleProp, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const LoadingSkeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const widthStyle = typeof width === 'string' 
    ? { width: width as `${number}%` }
    : { width };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          height,
          borderRadius,
          opacity,
          ...widthStyle,
        },
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <LoadingSkeleton width="60%" height={20} style={styles.title} />
      <LoadingSkeleton width="100%" height={16} style={styles.line} />
      <LoadingSkeleton width="80%" height={16} style={styles.line} />
      <LoadingSkeleton width="40%" height={32} style={styles.button} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.border,
  },
  card: {
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  line: {
    marginBottom: Spacing.xs,
  },
  button: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
});

