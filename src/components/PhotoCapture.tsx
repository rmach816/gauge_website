import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Typography, BorderRadius } from '../utils/constants';

interface PhotoCaptureProps {
  onPhotoCaptured: (uri: string) => void;
  onPhotoRemoved?: (uri: string) => void;
  capturedPhotos?: string[];
  maxPhotos?: number;
  label?: string;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotoCaptured,
  onPhotoRemoved,
  capturedPhotos = [],
  maxPhotos = 3,
  label = 'Add Photo',
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === 'granted' && libraryStatus === 'granted';
  };

  const handleTakePhoto = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant camera access.');
        return;
      }

      setIsLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoCaptured(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPhoto = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant photo library access.');
        return;
      }

      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        onPhotoCaptured(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo');
    } finally {
      setIsLoading(false);
    }
  };

  const showOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose how to add a photo',
      [
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handleSelectPhoto },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleRemove = (uri: string) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onPhotoRemoved?.(uri) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {capturedPhotos.length > 0 && (
        <View style={styles.grid}>
          {capturedPhotos.map((uri) => (
            <View key={uri} style={styles.photoContainer}>
              <Image source={{ uri }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(uri)}
              >
                <Text style={styles.removeText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {capturedPhotos.length < maxPhotos && (
        <TouchableOpacity
          style={[styles.addButton, isLoading && styles.disabled]}
          onPress={showOptions}
          disabled={isLoading}
        >
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.label}>
            {isLoading ? 'Loading...' : label}
          </Text>
          {capturedPhotos.length > 0 && (
            <Text style={styles.count}>
              ({capturedPhotos.length}/{maxPhotos})
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  photoContainer: { position: 'relative', width: 100, height: 100 },
  photo: { width: '100%', height: '100%', borderRadius: BorderRadius.sm },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.danger,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: Colors.white, fontSize: 18, fontWeight: '600' },
  addButton: {
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  icon: { fontSize: 32, marginBottom: Spacing.xs },
  label: { ...Typography.body, color: Colors.text, fontWeight: '600' },
  count: { ...Typography.caption, color: Colors.textSecondary, marginTop: Spacing.xs },
});

