import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MeasurementInput } from '../components/MeasurementInput';
import { OccasionPicker } from '../components/OccasionPicker';
import { StorageService } from '../services/storage';
import { PremiumService } from '../services/premium';
import { MeasurementsService } from '../services/measurements';
import {
  UserProfile,
  UserMeasurements,
  StylePreference,
  Occasion,
} from '../types';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/constants';
import uuid from 'react-native-uuid';

export const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [measurements, setMeasurements] = useState<Partial<UserMeasurements>>({});
  const [stylePreference, setStylePreference] = useState<StylePreference>(
    StylePreference.MODERN
  );
  const [favoriteOccasions, setFavoriteOccasions] = useState<Occasion[]>([]);
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false });

  useEffect(() => {
    loadProfile();
    loadPremiumStatus();
  }, []);

  const loadProfile = async () => {
    const p = await StorageService.getUserProfile();
    if (p) {
      setProfile(p);
      setMeasurements(p.measurements || {});
      setStylePreference(p.stylePreference);
      setFavoriteOccasions(p.favoriteOccasions);
    }
  };

  const loadPremiumStatus = async () => {
    const status = await PremiumService.getStatus();
    setPremiumStatus(status);
  };

  const handleSave = async () => {
    const validation = MeasurementsService.validateMeasurements(measurements);
    if (!validation.valid) {
      Alert.alert('Invalid Measurements', validation.errors.join('\n'));
      return;
    }

    const fullMeasurements: UserMeasurements = {
      height: measurements.height || 70,
      weight: measurements.weight || 170,
      chest: measurements.chest || 40,
      waist: measurements.waist || 32,
      inseam: measurements.inseam || 32,
      neck: measurements.neck || 15,
      sleeve: measurements.sleeve || 33,
      shoulder: measurements.shoulder || 18,
      preferredFit: measurements.preferredFit || 'regular',
      updatedAt: new Date().toISOString(),
    };

    const updatedProfile: UserProfile = {
      id: profile?.id || (uuid.v4() as string),
      measurements: fullMeasurements,
      stylePreference,
      favoriteOccasions,
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await StorageService.saveUserProfile(updatedProfile);
      Alert.alert('Success', 'Profile saved successfully');
      loadProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const toggleOccasion = (occasion: Occasion) => {
    if (favoriteOccasions.includes(occasion)) {
      setFavoriteOccasions(favoriteOccasions.filter((o) => o !== occasion));
    } else {
      setFavoriteOccasions([...favoriteOccasions, occasion]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Profile & Settings</Text>

        {premiumStatus.isPremium && (
          <View style={styles.premiumBanner}>
            <Text style={styles.premiumText}>✨ Premium Member</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Measurements</Text>
          <MeasurementInput
            label="Height"
            value={measurements.height?.toString() || ''}
            onChangeText={(text) =>
              setMeasurements({ ...measurements, height: parseFloat(text) || undefined })
            }
            unit="in"
          />
          <MeasurementInput
            label="Weight"
            value={measurements.weight?.toString() || ''}
            onChangeText={(text) =>
              setMeasurements({ ...measurements, weight: parseFloat(text) || undefined })
            }
            unit="lbs"
          />
          <MeasurementInput
            label="Chest"
            value={measurements.chest?.toString() || ''}
            onChangeText={(text) =>
              setMeasurements({ ...measurements, chest: parseFloat(text) || undefined })
            }
            unit="in"
          />
          <MeasurementInput
            label="Waist"
            value={measurements.waist?.toString() || ''}
            onChangeText={(text) =>
              setMeasurements({ ...measurements, waist: parseFloat(text) || undefined })
            }
            unit="in"
          />
          <MeasurementInput
            label="Inseam"
            value={measurements.inseam?.toString() || ''}
            onChangeText={(text) =>
              setMeasurements({ ...measurements, inseam: parseFloat(text) || undefined })
            }
            unit="in"
          />
          <MeasurementInput
            label="Neck"
            value={measurements.neck?.toString() || ''}
            onChangeText={(text) =>
              setMeasurements({ ...measurements, neck: parseFloat(text) || undefined })
            }
            unit="in"
          />
          <MeasurementInput
            label="Sleeve"
            value={measurements.sleeve?.toString() || ''}
            onChangeText={(text) =>
              setMeasurements({ ...measurements, sleeve: parseFloat(text) || undefined })
            }
            unit="in"
          />
          <MeasurementInput
            label="Shoulder"
            value={measurements.shoulder?.toString() || ''}
            onChangeText={(text) =>
              setMeasurements({ ...measurements, shoulder: parseFloat(text) || undefined })
            }
            unit="in"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Preference</Text>
          <View style={styles.optionsRow}>
            {Object.values(StylePreference).map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.optionButton,
                  stylePreference === style && styles.optionButtonSelected,
                ]}
                onPress={() => setStylePreference(style)}
              >
                <Text
                  style={[
                    styles.optionText,
                    stylePreference === style && styles.optionTextSelected,
                  ]}
                >
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Occasions</Text>
          <OccasionPicker
            selectedOccasions={favoriteOccasions}
            onSelect={toggleOccasion}
            multiSelect={true}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Profile</Text>
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
  title: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  premiumBanner: {
    backgroundColor: Colors.primary + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  premiumText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    ...Typography.caption,
    color: Colors.text,
  },
  optionTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  saveButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
});

