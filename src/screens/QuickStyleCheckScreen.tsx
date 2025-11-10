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
import * as ImagePicker from 'expo-image-picker';
import { WoodBackground } from '../components/WoodBackground';
import { GoldButton } from '../components/GoldButton';
import { PremiumService } from '../services/premium';
import { ClaudeVisionService } from '../services/claude';
import { StorageService } from '../services/storage';
import { HistoryService } from '../services/history';
import { RootStackParamList, MatchRating, MatchCheckResult } from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';
import { validateApiKey } from '../config/api';
import { Icon, AppIcons } from '../components/Icon';
import uuid from 'react-native-uuid';

type NavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * QuickStyleCheckScreen
 * One-shot style analysis without conversation
 * Implements CRITICAL FIX #4: Privacy messaging prominently displayed
 */
export const QuickStyleCheckScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [photos, setPhotos] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<{ 
    isPremium: boolean; 
    checksRemaining: number 
  }>({ 
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

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === 'granted' && libraryStatus === 'granted';
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.6, // Lower quality for faster processing
      allowsEditing: false, // Skip editing for speed
      exif: false, // Don't include EXIF data
    });

    if (!result.canceled && result.assets[0] && photos.length < 3) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleSelectPhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6, // Lower quality for faster processing
      allowsEditing: false, // Skip editing for speed
      allowsMultipleSelection: true,
      exif: false, // Don't include EXIF data
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets
        .slice(0, 3 - photos.length)
        .map((asset) => asset.uri);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (!validateApiKey()) {
      Alert.alert('Configuration Error', 'API key not configured.');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('No Photos', 'Please add at least one photo.');
      return;
    }

    const canCheck = await PremiumService.canPerformCheck();
    if (!canCheck.allowed) {
      navigation.navigate('Paywall');
      return;
    }

    setIsAnalyzing(true);

    try {
      const profile = await StorageService.getUserProfile();
      
      const result = await ClaudeVisionService.analyzeStyle({
        imageBase64: photos,
        requestType: 'instant-check',
        occasion: undefined,
        stylePreference: profile?.stylePreference?.[0],
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
    } catch (error) {
      console.error('[QuickStyleCheckScreen] Analysis failed:', error);
      Alert.alert(
        'Analysis Failed',
        'Unable to analyze your outfit. Please try again.',
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Quick Style Check</Text>
            <View style={styles.badge}>
              {premiumStatus.isPremium ? (
                <Text style={styles.badgeText}>✨ Unlimited</Text>
              ) : (
                <Text style={styles.badgeText}>
                  {premiumStatus.checksRemaining} remaining
                </Text>
              )}
            </View>
          </View>

          {/* PRIVACY MESSAGING - CRITICAL FIX #4 */}
          <View style={styles.privacySection}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
            <Text style={styles.privacyText}>
              Photos are processed instantly and never stored on our servers.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Photos (1-3)</Text>
            <Text style={styles.sectionSubtitle}>
              Take or select photos of your outfit
            </Text>

            {/* Photo Grid */}
            {photos.length > 0 && (
              <View style={styles.photoGrid}>
                {photos.map((uri, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <View style={styles.photoPlaceholder}>
                      <Icon name={AppIcons.camera.name} size={24} color={TailorColors.grayMedium} library={AppIcons.camera.library} />
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add Photo Buttons */}
            {photos.length < 3 && (
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={handleTakePhoto}
                >
                  <Icon name={AppIcons.camera.name} size={20} color={TailorColors.gold} library={AppIcons.camera.library} style={styles.photoButtonIcon} />
                  <Text style={styles.photoButtonText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoButton}
                  onPress={handleSelectPhoto}
                >
                  <Icon name={AppIcons.image.name} size={20} color={TailorColors.gold} library={AppIcons.image.library} style={styles.photoButtonIcon} />
                  <Text style={styles.photoButtonText}>Choose from Library</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <GoldButton
            title={isAnalyzing ? 'Analyzing...' : 'Check My Style'}
            onPress={handleAnalyze}
            disabled={isAnalyzing || photos.length === 0}
            loading={isAnalyzing}
            style={styles.analyzeButton}
          />
        </ScrollView>
      </SafeAreaView>
    </WoodBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: TailorSpacing.xl,
  },
  header: {
    marginBottom: TailorSpacing.lg,
    alignItems: 'center',
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.sm,
  },
  badge: {
    backgroundColor: TailorColors.woodMedium,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.xs,
    borderRadius: TailorBorderRadius.round,
  },
  badgeText: {
    ...TailorTypography.caption,
    color: TailorContrasts.onWoodMedium,
    fontWeight: '600',
  },
  privacySection: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: TailorColors.gold,
  },
  privacyIcon: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: TailorSpacing.xs,
  },
  privacyTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    textAlign: 'center',
    marginBottom: TailorSpacing.xs,
  },
  privacyText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    textAlign: 'center',
  },
  section: {
    marginBottom: TailorSpacing.xl,
  },
  sectionTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.xs,
  },
  sectionSubtitle: {
    ...TailorTypography.caption,
    color: TailorColors.ivory,
    marginBottom: TailorSpacing.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TailorSpacing.md,
    marginBottom: TailorSpacing.md,
  },
  photoContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: TailorColors.gold,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    fontSize: 32,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: TailorColors.burgundy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    ...TailorTypography.body,
    color: TailorColors.white,
    fontSize: 18,
    lineHeight: 20,
  },
  photoActions: {
    flexDirection: 'row',
    gap: TailorSpacing.md,
  },
  photoButton: {
    flex: 1,
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: TailorColors.gold,
  },
  photoButtonIcon: {
    fontSize: 32,
    marginBottom: TailorSpacing.xs,
  },
  photoButtonText: {
    ...TailorTypography.button,
    color: TailorContrasts.onWoodMedium,
    fontSize: 14,
  },
  analyzeButton: {
    marginTop: TailorSpacing.md,
  },
});

