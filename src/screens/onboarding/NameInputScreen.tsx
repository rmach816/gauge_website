import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { WoodBackground } from '../../components/WoodBackground';
import { GoldButton } from '../../components/GoldButton';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
} from '../../utils/constants';
import { RootStackParamList } from '../../types';
import { StorageService } from '../../services/storage';

type NameInputScreenNavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * NameInputScreen
 * First step of onboarding - collects user's last name for formal address
 */
export const NameInputScreen: React.FC = () => {
  const navigation = useNavigation<NameInputScreenNavigationProp>();
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleContinue = async () => {
    const trimmedName = lastName.trim();
    
    if (!trimmedName) {
      setError('Please enter your last name');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Please enter a valid last name');
      return;
    }

    setError('');

    // Save name to user profile
    try {
      const profile = await StorageService.getUserProfile();
      if (profile) {
        profile.lastName = trimmedName;
        await StorageService.saveUserProfile(profile);
      } else {
        // Create new profile if it doesn't exist
        const newProfile = {
          id: `user-${Date.now()}`,
          lastName: trimmedName,
          stylePreference: [],
          favoriteOccasions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await StorageService.saveUserProfile(newProfile);
      }
    } catch (error) {
      console.error('[NameInputScreen] Failed to save name:', error);
    }

    // Navigate to greeting screen
    navigation.navigate('Greeting');
  };

  const handleSkip = () => {
    // Skip name input and go to greeting
    navigation.navigate('Greeting');
  };

  return (
    <WoodBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.content}>
          <Text style={styles.title}>What should I call you?</Text>
          
          <Text style={styles.subtitle}>
            I'd like to address you properly. Please enter your last name.
          </Text>

          {/* Input Field at Top */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                setError('');
              }}
              placeholder="Enter your last name"
              placeholderTextColor={TailorColors.grayMedium}
              autoFocus
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Text style={styles.helperText}>
            I'll address you as "Mr. [Your Last Name]" throughout the app, as is traditional in fine tailoring.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <GoldButton
            title="Continue"
            onPress={handleContinue}
            style={styles.continueButton}
          />
          
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    padding: TailorSpacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: TailorSpacing.xxxl,
    paddingHorizontal: TailorSpacing.lg,
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
    textAlign: 'center',
    marginBottom: TailorSpacing.lg,
  },
  subtitle: {
    ...TailorTypography.bodyLarge,
    color: TailorContrasts.onWoodDark,
    textAlign: 'center',
    marginBottom: TailorSpacing.xl,
    lineHeight: 28,
  },
  inputContainer: {
    backgroundColor: TailorColors.parchment,
    borderRadius: TailorBorderRadius.md,
    paddingHorizontal: TailorSpacing.md,
    marginBottom: TailorSpacing.sm,
    borderWidth: 2,
    borderColor: TailorColors.gold,
  },
  input: {
    ...TailorTypography.h2,
    color: TailorColors.navy,
    paddingVertical: TailorSpacing.md,
    textAlign: 'center',
  },
  inputError: {
    borderColor: TailorColors.burgundy,
  },
  errorText: {
    ...TailorTypography.caption,
    color: TailorColors.burgundy,
    textAlign: 'center',
    marginBottom: TailorSpacing.sm,
  },
  helperText: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: TailorSpacing.md,
  },
  buttonContainer: {
    width: '100%',
    paddingBottom: TailorSpacing.xl,
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

