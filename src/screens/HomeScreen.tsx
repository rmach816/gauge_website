import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhotoCapture } from '../components/PhotoCapture';
import { PremiumService } from '../services/premium';
import { ClaudeVisionService } from '../services/claude';
import { StorageService } from '../services/storage';
import { HistoryService } from '../services/history';
import { RootStackParamList, MatchRating, MatchCheckResult } from '../types';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/constants';
import { validateApiKey } from '../config/api';
import uuid from 'react-native-uuid';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<{ isPremium: boolean; checksRemaining: number }>({ 
    isPremium: false, 
    checksRemaining: 10 
  });

  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    const status = await PremiumService.getStatus();
    setPremiumStatus({
      isPremium: status.isPremium,
      checksRemaining: status.checksRemaining ?? 10,
    });
  };

  const handlePhotoCaptured = (uri: string) => {
    if (photos.length < 3) {
      setPhotos([...photos, uri]);
    }
  };

  const handlePhotoRemoved = (uri: string) => {
    setPhotos(photos.filter((p) => p !== uri));
  };

  const handleCheckStyle = async () => {
    if (!validateApiKey()) {
      Alert.alert('Configuration Error', 'API key not configured. Please check your .env file.');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('No Photos', 'Please add at least one photo before checking.');
      return;
    }

    // Check network connectivity
    const { NetworkService } = await import('../utils/network');
    const isOnline = await NetworkService.isOnline();
    if (!isOnline) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.'
      );
      return;
    }

    const canCheck = await PremiumService.canPerformCheck();
    if (!canCheck.allowed) {
      navigation.navigate('Paywall');
      return;
    }

    // Check rate limiting
    const { RateLimiter } = await import('../utils/rateLimiter');
    const rateLimit = await RateLimiter.checkApiRateLimit();
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetAt);
      const secondsUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / 1000);
      Alert.alert(
        'Rate Limit Exceeded',
        `Please wait ${secondsUntilReset} seconds before making another request.`
      );
      return;
    }

    setIsAnalyzing(true);

    try {
      const profile = await StorageService.getUserProfile();
      
      const result = await ClaudeVisionService.analyzeStyle({
        imageBase64: photos,
        requestType: 'instant-check',
        occasion: undefined,
        stylePreference: profile?.stylePreference,
        userMeasurements: profile?.measurements,
      });

      await PremiumService.decrementCheck();

      const checkId = uuid.v4() as string;
      const checkResult: MatchCheckResult = {
        id: checkId,
        imageUris: photos,
        rating: result.rating || MatchRating.OKAY,
        analysis: result.analysis,
        suggestions: result.suggestions,
        createdAt: new Date().toISOString(),
      };

      await HistoryService.saveCheck({
        id: checkId,
        type: 'instant-check',
        result: checkResult,
        createdAt: new Date().toISOString(),
      });

      navigation.navigate('Result', { checkId });
      setPhotos([]);
      loadPremiumStatus();
      
      // Track analytics
      const { AnalyticsService } = await import('../services/analytics');
      AnalyticsService.trackStyleCheck(checkResult.rating, photos.length);
    } catch (error) {
      console.error('[HomeScreen] Analysis failed:', error);
      Alert.alert(
        'Analysis Failed',
        'Unable to analyze your outfit. Please try again.',
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Check Your Style</Text>
          <View style={styles.premiumBadge}>
            {premiumStatus.isPremium ? (
              <Text style={styles.premiumText}>✨ Premium</Text>
            ) : (
              <Text style={styles.checkText}>
                {premiumStatus.checksRemaining} checks remaining
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Photos</Text>
          <Text style={styles.sectionSubtitle}>
            Take or select up to 3 photos of your outfit
          </Text>
          <PhotoCapture
            onPhotoCaptured={handlePhotoCaptured}
            onPhotoRemoved={handlePhotoRemoved}
            capturedPhotos={photos}
            maxPhotos={3}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (isAnalyzing || photos.length === 0) && styles.buttonDisabled,
          ]}
          onPress={handleCheckStyle}
          disabled={isAnalyzing || photos.length === 0}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator color={Colors.white} style={styles.loader} />
              <Text style={styles.buttonText}>Analyzing...</Text>
            </>
          ) : (
            <Text style={styles.buttonText}>Check My Style</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.card,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  premiumText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  checkText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.button,
    color: Colors.white,
  },
  loader: {
    marginRight: Spacing.sm,
  },
});

