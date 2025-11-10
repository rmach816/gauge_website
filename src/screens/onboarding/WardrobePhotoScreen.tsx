import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { WoodBackground } from '../../components/WoodBackground';
import { GoldButton } from '../../components/GoldButton';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { PhotoTipsModal } from '../../components/PhotoTipsModal';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
} from '../../utils/constants';
import { OnboardingService } from '../../services/onboarding';
import { Icon, AppIcons } from '../../components/Icon';
import { RootStackParamList } from '../../types';

type WardrobePhotoScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * WardrobePhotoScreen
 * Optional wardrobe cataloging during onboarding
 * Implements CRITICAL FIX #4: Privacy messaging prominently displayed
 */
export const WardrobePhotoScreen: React.FC = () => {
  const navigation = useNavigation<WardrobePhotoScreenNavigationProp>();
  const [photos, setPhotos] = useState<string[]>([]);
  const [showPhotoTips, setShowPhotoTips] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to catalog your wardrobe.'
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    // Show photo tips first time
    if (photos.length === 0) {
      setShowPhotoTips(true);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // Skip editing for speed
      quality: 0.6, // Lower quality for faster processing
      exif: false, // Don't include EXIF data
    });

    if (!result.canceled && result.assets[0]) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const handleChooseFromLibrary = async () => {
    // Show photo tips first time
    if (photos.length === 0) {
      setShowPhotoTips(true);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false, // Skip editing for speed
      quality: 0.6, // Lower quality for faster processing
      allowsMultipleSelection: true,
      exif: false, // Don't include EXIF data
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    // Save photos to onboarding state
    const state = await OnboardingService.getOnboardingState();
    state.wardrobePhotos = photos;
    await OnboardingService.saveOnboardingState(state);

    // Mark step as complete
    await OnboardingService.markStepComplete('wardrobe-photos');

    // Navigate to completion screen
    // For now, navigate to main app - will update when completion screen is created
    navigation.replace('MainTabs');
  };

  const handleSkip = async () => {
    await OnboardingService.markStepSkipped('wardrobe-photos');
    navigation.replace('MainTabs');
  };

  const handlePhotoTipsClose = () => {
    setShowPhotoTips(false);
  };

  const handleTakePhotoAfterTips = async () => {
    setShowPhotoTips(false);
    setTimeout(async () => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos([...photos, result.assets[0].uri]);
      }
    }, 300);
  };

  const handleChooseFromLibraryAfterTips = async () => {
    setShowPhotoTips(false);
    setTimeout(async () => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map((asset) => asset.uri);
        setPhotos([...photos, ...newPhotos]);
      }
    }, 300);
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <PhotoTipsModal
        visible={showPhotoTips}
        onClose={handlePhotoTipsClose}
        onTakePhoto={handleTakePhotoAfterTips}
        onSelectPhoto={handleChooseFromLibraryAfterTips}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <ProgressIndicator currentStep={10} totalSteps={10} />

        <View style={styles.content}>
          <Text style={styles.title}>Do you have a wardrobe you'd like to catalog?</Text>
          <Text style={styles.subtitle}>
            We can tailor combinations of the clothes you already have and suggest new items that pair well.
          </Text>

          {/* PRIVACY MESSAGING - CRITICAL FIX #4 */}
          <View style={styles.privacySection}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
            <View style={styles.privacyPoints}>
              <Text style={styles.privacyPoint}>
                • Photos are analyzed instantly on secure servers
              </Text>
              <Text style={styles.privacyPoint}>
                • We never save or store your photos
              </Text>
              <Text style={styles.privacyPoint}>
                • Only you can see your wardrobe items
              </Text>
              <Text style={styles.privacyPoint}>
                • All data stored locally on your device
              </Text>
            </View>
          </View>

          {/* Photo Guidelines */}
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>Photo Guidelines</Text>
            <Text style={styles.guidelineItem}>✓ Photo must show the entire piece</Text>
            <Text style={styles.guidelineItem}>✓ One item at a time</Text>
            <Text style={styles.guidelineItem}>✓ Works best with neutral background</Text>
            <Text style={styles.guidelineItem}>✗ Avoid multiple items in one photo</Text>
          </View>

          {/* Photo Actions */}
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
              onPress={handleChooseFromLibrary}
            >
              <Icon name={AppIcons.image.name} size={20} color={TailorColors.gold} library={AppIcons.image.library} style={styles.photoButtonIcon} />
              <Text style={styles.photoButtonText}>Choose from Library</Text>
            </TouchableOpacity>
          </View>

          {/* Photo Preview Grid */}
          {photos.length > 0 && (
            <View style={styles.photosContainer}>
              <Text style={styles.photosTitle}>
                {photos.length} photo{photos.length !== 1 ? 's' : ''} added
              </Text>
              <View style={styles.photoGrid}>
                {photos.map((uri, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri }} style={styles.photoPreview} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Text style={styles.removeButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <GoldButton
            title={photos.length > 0 ? "Continue" : "Skip for Now"}
            onPress={photos.length > 0 ? handleContinue : handleSkip}
            style={styles.continueButton}
          />

          {photos.length > 0 && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip Adding More</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      </SafeAreaView>
    </WoodBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: TailorSpacing.xl,
    paddingBottom: TailorSpacing.xxxl,
  },
  content: {
    flex: 1,
    marginTop: TailorSpacing.lg,
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    textAlign: 'center',
    marginBottom: TailorSpacing.md,
  },
  subtitle: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    textAlign: 'center',
    marginBottom: TailorSpacing.xl,
    lineHeight: 24,
  },
  privacySection: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.lg,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: TailorColors.gold,
  },
  privacyIcon: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: TailorSpacing.sm,
  },
  privacyTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    textAlign: 'center',
    marginBottom: TailorSpacing.md,
  },
  privacyPoints: {
    gap: TailorSpacing.xs,
  },
  privacyPoint: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    lineHeight: 24,
  },
  guidelinesContainer: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.xl,
  },
  guidelinesTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.sm,
  },
  guidelineItem: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
  },
  photoActions: {
    flexDirection: 'row',
    gap: TailorSpacing.md,
    marginBottom: TailorSpacing.xl,
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
  },
  photosContainer: {
    marginBottom: TailorSpacing.xl,
  },
  photosTitle: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: TailorSpacing.sm,
  },
  photoItem: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: TailorBorderRadius.sm,
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
  buttonContainer: {
    width: '100%',
    marginTop: TailorSpacing.xl,
  },
  continueButton: {
    marginBottom: TailorSpacing.md,
  },
  skipButton: {
    paddingVertical: TailorSpacing.sm,
    alignItems: 'center',
  },
  skipText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    textDecorationLine: 'underline',
  },
});

