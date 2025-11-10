import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { WoodBackground } from '../components/WoodBackground';
import { ClaudeVisionService } from '../services/claude';
import { StorageService } from '../services/storage';
import { HistoryService } from '../services/history';
import { validateApiKey } from '../config/api';
import { getContextualError, ErrorContext } from '../utils/errorMessages';
import { retryApiCall } from '../utils/retry';
import {
  RootStackParamList,
  Occasion,
  PriceRange,
  CompleteOutfit,
  OutfitMode,
} from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorContrasts,
} from '../utils/constants';
import uuid from 'react-native-uuid';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'OutfitGenerating'>;

/**
 * OutfitGeneratingScreen
 * Animated loading screen that generates the outfit and transitions to results
 */
export const OutfitGeneratingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { occasion, mode, priceRange } = route.params;

  // Animation values
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    startAnimations();
    // Start generation
    generateOutfit();
  }, []);

  const startAnimations = () => {
    // Spinning animation (for tailor's wheel/measuring tape)
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulsing animation (for text)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade in animation
    Animated.timing(fadeValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const generateOutfit = async () => {
    try {
      if (!validateApiKey()) {
        Alert.alert(
          'Configuration Error',
          'Service configuration missing. Please contact support.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      const profile = await StorageService.getUserProfile();
      const wardrobe = await StorageService.getClosetItems();

      let result;

      if (mode === 'wardrobe') {
        // Generate from wardrobe only - with automatic retry
        result = await retryApiCall(
          () => ClaudeVisionService.analyzeStyle({
            imageBase64: [],
            requestType: 'wardrobe-outfit',
            occasion: occasion,
            stylePreference: profile?.stylePreference?.[0],
            userMeasurements: profile?.measurements,
            shoeSize: profile?.shoeSize,
            wardrobeItems: wardrobe,
            priceRange: priceRange,
          }),
          'OutfitGeneration-Wardrobe'
        );
      } else if (mode === 'shopping') {
        // Generate complete shopping outfit - with automatic retry
        result = await retryApiCall(
          () => ClaudeVisionService.analyzeStyle({
            imageBase64: [],
            requestType: 'shopping-outfit',
            occasion: occasion,
            stylePreference: profile?.stylePreference?.[0],
            userMeasurements: profile?.measurements,
            shoeSize: profile?.shoeSize,
            priceRange: priceRange,
          }),
          'OutfitGeneration-Shopping'
        );
      } else {
        // Mixed mode - with automatic retry
        result = await retryApiCall(
          () => ClaudeVisionService.analyzeStyle({
            imageBase64: [],
            requestType: 'mixed-outfit',
            occasion: occasion,
            stylePreference: profile?.stylePreference?.[0],
            userMeasurements: profile?.measurements,
            shoeSize: profile?.shoeSize,
            wardrobeItems: wardrobe,
            priceRange: priceRange,
          }),
          'OutfitGeneration-Mixed'
        );
      }

      // Create outfit result
      const outfitId = uuid.v4() as string;
      const outfit: CompleteOutfit = {
        id: outfitId,
        occasion: occasion,
        stylePreference: profile?.stylePreference?.[0] || 'Modern' as any,
        items: result.completeOutfit || [],
        totalPrice: 0,
        createdAt: new Date().toISOString(),
      };

      await HistoryService.saveCheck({
        id: outfitId,
        type: 'outfit-builder',
        result: outfit,
        createdAt: new Date().toISOString(),
      });

      // Navigate to results
      navigation.replace('Result', { checkId: outfitId });
    } catch (error) {
      console.error('[OutfitGeneratingScreen] Generation failed:', error);
      const errorInfo = getContextualError(error, ErrorContext.OUTFIT_GENERATION);
      
      // Show context-aware error message with retry option if applicable
      Alert.alert(
        'Outfit Generation Failed',
        errorInfo.userMessage,
        [
          errorInfo.retryable 
            ? { text: 'Try Again', onPress: () => generateOutfit() }
            : undefined,
          { text: 'Go Back', onPress: () => navigation.goBack(), style: 'cancel' },
        ].filter(Boolean) as any
      );
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const opacity = fadeValue;
  const scale = pulseValue;

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity,
            },
          ]}
        >
          {/* Animated Tailor's Wheel/Measuring Tape Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <Text style={styles.icon}>📏</Text>
          </Animated.View>

          {/* Animated Title */}
          <Animated.View
            style={{
              transform: [{ scale }],
            }}
          >
            <Text style={styles.title}>Crafting Your Outfit</Text>
          </Animated.View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Our AI tailor is carefully selecting the perfect pieces for your{' '}
            {typeof occasion === 'string' ? occasion : occasion}
          </Text>

          {/* Loading Dots Animation */}
          <View style={styles.dotsContainer}>
            <LoadingDots />
          </View>

          {/* Status Messages */}
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {mode === 'wardrobe'
                ? 'Analyzing your wardrobe...'
                : mode === 'shopping'
                ? 'Finding the perfect items...'
                : 'Combining wardrobe & shopping options...'}
            </Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </WoodBackground>
  );
};

/**
 * LoadingDots Component
 * Animated dots that pulse in sequence
 */
const LoadingDots: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = animateDot(dot1, 0);
    const anim2 = animateDot(dot2, 200);
    const anim3 = animateDot(dot3, 400);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  return (
    <View style={styles.dots}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: TailorSpacing.xl,
  },
  iconContainer: {
    marginBottom: TailorSpacing.xl,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    textAlign: 'center',
    marginBottom: TailorSpacing.md,
  },
  subtitle: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    textAlign: 'center',
    marginBottom: TailorSpacing.xl,
    paddingHorizontal: TailorSpacing.lg,
    lineHeight: 24,
  },
  dotsContainer: {
    marginBottom: TailorSpacing.xl,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TailorSpacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: TailorColors.gold,
  },
  statusContainer: {
    marginTop: TailorSpacing.lg,
  },
  statusText: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

