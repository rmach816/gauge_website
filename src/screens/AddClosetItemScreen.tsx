import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Icon, AppIcons } from '../components/Icon';
import { WoodBackground } from '../components/WoodBackground';
import { GoldButton } from '../components/GoldButton';
import { PhotoTipsModal } from '../components/PhotoTipsModal';
import { ClosetService } from '../services/closet';
import { ClaudeVisionService } from '../services/claude';
import { ClosetItem, GarmentType, GarmentSizeDetails } from '../types';
import { SizePicker } from '../components/SizePicker';
import { GarmentTypePicker } from '../components/GarmentTypePicker';
import { RootStackParamList } from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';
import { validateApiKey } from '../config/api';
import uuid from 'react-native-uuid';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type AddClosetItemRouteProp = RouteProp<RootStackParamList, 'AddClosetItem' | 'EditClosetItem'>;

/**
 * AddClosetItemScreen / EditClosetItemScreen
 * Add or edit wardrobe items with AI auto-categorization
 * Implements CRITICAL FIX #4: Privacy messaging prominently displayed
 */
export const AddClosetItemScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<AddClosetItemRouteProp>();
  const itemId = (route.params as any)?.itemId; // For EditClosetItem route
  const isEditMode = !!itemId;

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [item, setItem] = useState<Partial<ClosetItem>>({
    garmentType: GarmentType.SHIRT,
    color: '',
    secondaryColor: undefined,
    size: '',
    sizeDetails: {},
    material: '',
    pattern: '',
    brand: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showPhotoTips, setShowPhotoTips] = useState(false);
  const [hasSeenPhotoTips, setHasSeenPhotoTips] = useState(false); // Track if user has seen tips
  const [photoConfirmed, setPhotoConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // NEW: Show preview card after AI analysis
  const [showEditDetails, setShowEditDetails] = useState(false); // NEW: Show full edit form
  const [photoQuality, setPhotoQuality] = useState<'good' | 'poor' | null>(null); // NEW: Photo quality from AI
  const [photoQualityFeedback, setPhotoQualityFeedback] = useState<string | null>(null); // NEW: Quality feedback

  useEffect(() => {
    if (isEditMode) {
      loadExistingItem();
    }
  }, [itemId]);

  const loadExistingItem = async () => {
    if (!itemId) return;
    
    setIsLoading(true);
    try {
      const items = await ClosetService.getClosetItems();
      const existingItem = items.find((i) => i.id === itemId);
      
      if (existingItem) {
        setItem({
          garmentType: existingItem.garmentType,
          color: existingItem.color,
          size: existingItem.size || '',
          sizeDetails: existingItem.sizeDetails || {},
          material: existingItem.material || '',
          pattern: existingItem.pattern || '',
          brand: existingItem.brand || '',
          notes: existingItem.notes || '',
        });
        setPhotoUri(existingItem.imageUri);
        setPhotoConfirmed(true); // Photo already exists, so it's confirmed
      }
    } catch (error) {
      console.error('[AddClosetItemScreen] Failed to load item:', error);
      Alert.alert('Error', 'Failed to load item details.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return cameraStatus === 'granted' && libraryStatus === 'granted';
  };

  const handleTakePhoto = async () => {
    // Show photo tips only on first time (not if photo already exists)
    if (!hasSeenPhotoTips && !photoUri) {
      setShowPhotoTips(true);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant camera access.');
      return;
    }

    try {
      // Optimized settings for faster photo capture
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.6, // Lower quality for faster processing
        allowsEditing: false, // Skip editing step for speed
        exif: false, // Don't include EXIF data for faster processing
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        // Immediate UI update - show photo right away
        setPhotoUri(uri);
        setPhotoConfirmed(true);
        setShowPreview(false);
        setShowEditDetails(false);
        
        // Trigger categorization in background (non-blocking)
        if (!isEditMode) {
          // Don't await - let it run in background
          categorizeItem(uri).catch(err => {
            console.error('[AddClosetItem] Background categorization error:', err);
            // Silent fail - user can still edit manually
          });
        }
      }
    } catch (error) {
      console.error('[AddClosetItem] Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSelectPhoto = async () => {
    // Show photo tips only on first time (not if photo already exists)
    if (!hasSeenPhotoTips && !photoUri) {
      setShowPhotoTips(true);
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant photo library access.');
      return;
    }

    try {
      // Optimized settings for faster photo selection
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.6, // Lower quality for faster processing
        allowsEditing: false, // Skip editing step for speed
        allowsMultipleSelection: false, // Single selection is faster
        exif: false, // Don't include EXIF data for faster processing
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        // Immediate UI update - show photo right away
        setPhotoUri(uri);
        setPhotoConfirmed(true);
        setShowPreview(false);
        setShowEditDetails(false);
        
        // Trigger categorization in background (non-blocking)
        if (!isEditMode) {
          // Don't await - let it run in background
          categorizeItem(uri).catch(err => {
            console.error('[AddClosetItem] Background categorization error:', err);
            // Silent fail - user can still edit manually
          });
        }
      }
    } catch (error) {
      console.error('[AddClosetItem] Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const categorizeItem = async (uri: string) => {
    if (!validateApiKey()) {
      Alert.alert('Configuration Error', 'API key not configured.');
      return;
    }

    setIsCategorizing(true);

    try {
      // Convert image to base64
      const base64 = await ClaudeVisionService.imageToBase64(uri);

      // Use Claude Vision to categorize
      const result = await ClaudeVisionService.analyzeStyle({
        imageBase64: [base64],
        requestType: 'wardrobe-categorization',
      });

      // Extract photo quality assessment
      const quality = result.photoQuality || 'good';
      setPhotoQuality(quality);
      setPhotoQualityFeedback(result.photoQualityFeedback || null);

      // Extract categorization from response
      if (result.suggestions && result.suggestions.length > 0) {
        const suggestion = result.suggestions[0];
        // Try to match garment type to enum, fallback to SHIRT if not found
        let detectedType = GarmentType.SHIRT;
        try {
          // Check if the detected type matches any enum value
          const typeKey = Object.keys(GarmentType).find(
            key => GarmentType[key as keyof typeof GarmentType] === suggestion.garmentType
          );
          if (typeKey) {
            detectedType = suggestion.garmentType as GarmentType;
          } else {
            // Try to map common variations
            const typeMap: Record<string, GarmentType> = {
              'blazer': GarmentType.BLAZER,
              'suit': GarmentType.SUIT,
              'sweater': GarmentType.SWEATER,
              'hoodie': GarmentType.HOODIE,
              'henley': GarmentType.HENLEY,
              'dress shirt': GarmentType.DRESS_SHIRT,
              'dressshirt': GarmentType.DRESS_SHIRT,
              't-shirt': GarmentType.T_SHIRT,
              't shirt': GarmentType.T_SHIRT,
              'polo': GarmentType.POLO,
              'chinos': GarmentType.CHINOS,
              'jeans': GarmentType.JEANS,
              'shorts': GarmentType.SHORTS,
              'coat': GarmentType.COAT,
              'vest': GarmentType.VEST,
              'waistcoat': GarmentType.VEST,
              'boots': GarmentType.BOOTS,
              'dress shoes': GarmentType.DRESS_SHOES,
              'loafers': GarmentType.LOAFERS,
              'sneakers': GarmentType.SNEAKERS,
              'tie': GarmentType.TIE,
              'belt': GarmentType.BELT,
              'watch': GarmentType.WATCH,
              'hat': GarmentType.HAT,
            };
            const lowerType = suggestion.garmentType.toLowerCase();
            detectedType = typeMap[lowerType] || GarmentType.SHIRT;
          }
        } catch (e) {
          console.error('[AddClosetItemScreen] Error parsing garment type:', e);
        }
        
        setItem({
          garmentType: detectedType,
          color: suggestion.colors?.[0] || '',
          secondaryColor: suggestion.colors?.[1] || undefined, // Second color for reversible items
          size: item.size || '', // Preserve existing size
          material: (suggestion as any).material || '', // Extract material from AI response
          pattern: (suggestion as any).pattern || 'solid', // Extract pattern from AI response, default to solid
          brand: item.brand || '', // Preserve existing brand
          notes: suggestion.description,
        });

        // Show preview card after successful categorization (only in add mode)
        if (!isEditMode) {
          setShowPreview(true);
        }
      }
    } catch (error) {
      console.error('[AddClosetItemScreen] Categorization failed:', error);
      Alert.alert(
        'Categorization Failed',
        'Unable to auto-categorize. You can still add the item manually.',
      );
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSave = async () => {
    if (!photoUri || !photoConfirmed) {
      Alert.alert('No Photo', 'Please add and confirm a photo first.');
      return;
    }

    if (!item.color || item.color.trim() === '') {
      Alert.alert('Color Required', 'Please enter a color for this item.');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditMode && itemId) {
        // Update existing item
        await ClosetService.updateItem(itemId, {
          imageUri: photoUri,
          garmentType: item.garmentType || GarmentType.SHIRT,
          color: item.color.trim(),
          secondaryColor: item.secondaryColor?.trim() || undefined,
          size: item.size?.trim(),
          sizeDetails: item.sizeDetails,
          material: item.material?.trim(),
          pattern: item.pattern?.trim(),
          brand: item.brand?.trim(),
          notes: item.notes?.trim(),
        });
        
        Alert.alert('Success', 'Item updated successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Create new item
        const newItem: ClosetItem = {
          id: uuid.v4() as string,
          imageUri: photoUri,
          garmentType: item.garmentType || GarmentType.SHIRT,
          color: item.color.trim(),
          secondaryColor: item.secondaryColor?.trim() || undefined,
          size: item.size?.trim(),
          sizeDetails: item.sizeDetails,
          material: item.material?.trim(),
          pattern: item.pattern?.trim(),
          brand: item.brand?.trim(),
          notes: item.notes?.trim(),
          addedAt: new Date().toISOString(),
        };

        await ClosetService.addItem(newItem);
        
        // Ask if user wants to add another item
        Alert.alert(
          'Item Saved!',
          'Would you like to add another item?',
          [
            {
              text: 'Done',
              onPress: () => navigation.goBack(),
            },
            {
              text: 'Add Another',
              onPress: () => {
                // Reset for next item
                setPhotoUri(null);
                setPhotoConfirmed(false);
                setShowPreview(false);
                setShowEditDetails(false);
                setPhotoQuality(null);
                setPhotoQualityFeedback(null);
                setItem({
                  garmentType: GarmentType.SHIRT,
                  color: '',
                  secondaryColor: undefined,
                  size: '',
                  sizeDetails: {},
                  material: '',
                  pattern: '',
                  brand: '',
                  notes: '',
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('[AddClosetItemScreen] Save failed:', error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoTipsClose = () => {
    setShowPhotoTips(false);
    setHasSeenPhotoTips(true); // Mark as seen
  };

  // Helper function to determine if garment is a shirt type
  const isShirtType = (type: GarmentType): boolean => {
    return [
      GarmentType.SHIRT,
      GarmentType.DRESS_SHIRT,
      GarmentType.HENLEY,
      GarmentType.T_SHIRT,
      GarmentType.POLO,
      GarmentType.SWEATER,
      GarmentType.HOODIE,
    ].includes(type);
  };

  // Helper function to determine if garment is a pants type
  const isPantsType = (type: GarmentType): boolean => {
    return [
      GarmentType.PANTS,
      GarmentType.CHINOS,
      GarmentType.JEANS,
      GarmentType.SHORTS,
    ].includes(type);
  };

  // Helper function to determine if garment is a jacket type
  const isJacketType = (type: GarmentType): boolean => {
    return [
      GarmentType.JACKET,
      GarmentType.BLAZER,
      GarmentType.SUIT,
      GarmentType.COAT,
      GarmentType.VEST,
    ].includes(type);
  };

  // Helper function to determine if garment is a shoe type
  const isShoeType = (type: GarmentType): boolean => {
    return [
      GarmentType.SHOES,
      GarmentType.BOOTS,
      GarmentType.DRESS_SHOES,
      GarmentType.LOAFERS,
      GarmentType.SNEAKERS,
    ].includes(type);
  };

  // Render size inputs based on garment type
  const renderSizeInputs = () => {
    const type = item.garmentType || GarmentType.SHIRT;
    const sizeDetails = item.sizeDetails || {};

    if (isShirtType(type)) {
      const shirtSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
      const neckSizes = ['14', '14.5', '15', '15.5', '16', '16.5', '17', '17.5', '18', '18.5', '19'];
      const sleeveLengths = ['30', '31', '32', '33', '34', '35', '36', '37', '38'];
      
      return (
        <>
          <SizePicker
            label="Shirt Size (Optional)"
            selectedValue={sizeDetails.shirtSize}
            options={shirtSizes}
            onSelect={(value) => setItem({
              ...item,
              sizeDetails: { ...sizeDetails, shirtSize: value },
              size: value, // Also update general size for backward compatibility
            })}
            placeholder="Select shirt size"
          />
          <SizePicker
            label="Neck Size (Optional)"
            selectedValue={sizeDetails.neckSize}
            options={neckSizes}
            onSelect={(value) => setItem({
              ...item,
              sizeDetails: { ...sizeDetails, neckSize: value },
            })}
            placeholder="Select neck size (inches)"
          />
          <SizePicker
            label="Sleeve Length (Optional)"
            selectedValue={sizeDetails.sleeveLength}
            options={sleeveLengths}
            onSelect={(value) => setItem({
              ...item,
              sizeDetails: { ...sizeDetails, sleeveLength: value },
            })}
            placeholder="Select sleeve length (inches)"
          />
        </>
      );
    }

    if (isPantsType(type)) {
      const waistSizes = ['28', '29', '30', '31', '32', '33', '34', '35', '36', '38', '40', '42', '44', '46', '48'];
      const inseamLengths = ['28', '29', '30', '31', '32', '33', '34', '35', '36', '38'];
      
      return (
        <>
          <SizePicker
            label="Waist Size (Optional)"
            selectedValue={sizeDetails.waistSize}
            options={waistSizes}
            onSelect={(value) => {
              const newSizeDetails = { ...sizeDetails, waistSize: value };
              const combinedSize = value && sizeDetails.inseamLength 
                ? `${value}x${sizeDetails.inseamLength}` 
                : value;
              setItem({
                ...item,
                sizeDetails: newSizeDetails,
                size: combinedSize, // Also update general size for backward compatibility
              });
            }}
            placeholder="Select waist size (inches)"
          />
          <SizePicker
            label="Inseam Length (Optional)"
            selectedValue={sizeDetails.inseamLength}
            options={inseamLengths}
            onSelect={(value) => {
              const newSizeDetails = { ...sizeDetails, inseamLength: value };
              const combinedSize = sizeDetails.waistSize && value
                ? `${sizeDetails.waistSize}x${value}` 
                : sizeDetails.waistSize || value;
              setItem({
                ...item,
                sizeDetails: newSizeDetails,
                size: combinedSize,
              });
            }}
            placeholder="Select inseam length (inches)"
          />
        </>
      );
    }

    if (isJacketType(type)) {
      const jacketSizes = ['34S', '34R', '34L', '36S', '36R', '36L', '38S', '38R', '38L', '40S', '40R', '40L', '42S', '42R', '42L', '44S', '44R', '44L', '46S', '46R', '46L', '48S', '48R', '48L'];
      const chestSizes = ['34', '36', '38', '40', '42', '44', '46', '48', '50', '52'];
      
      return (
        <>
          <SizePicker
            label="Jacket Size (Optional)"
            selectedValue={sizeDetails.jacketSize}
            options={jacketSizes}
            onSelect={(value) => setItem({
              ...item,
              sizeDetails: { ...sizeDetails, jacketSize: value },
              size: value, // Also update general size for backward compatibility
            })}
            placeholder="Select jacket size"
          />
          <SizePicker
            label="Chest Size (Optional)"
            selectedValue={sizeDetails.chestSize}
            options={chestSizes}
            onSelect={(value) => setItem({
              ...item,
              sizeDetails: { ...sizeDetails, chestSize: value },
            })}
            placeholder="Select chest size (inches)"
          />
        </>
      );
    }

    if (isShoeType(type)) {
      const shoeSizes = ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13', '13.5', '14', '15'];
      const shoeWidths = ['N (Narrow)', 'M (Medium)', 'W (Wide)', 'EW (Extra Wide)', 'D', 'E', 'EE', 'EEE'];
      
      return (
        <>
          <SizePicker
            label="Shoe Size (Optional)"
            selectedValue={sizeDetails.shoeSize}
            options={shoeSizes}
            onSelect={(value) => setItem({
              ...item,
              sizeDetails: { ...sizeDetails, shoeSize: value },
              size: value, // Also update general size for backward compatibility
            })}
            placeholder="Select shoe size (US)"
          />
          <SizePicker
            label="Width (Optional)"
            selectedValue={sizeDetails.shoeWidth}
            options={shoeWidths}
            onSelect={(value) => setItem({
              ...item,
              sizeDetails: { ...sizeDetails, shoeWidth: value },
            })}
            placeholder="Select width"
          />
        </>
      );
    }

    // Default: Generic size input for accessories and other types
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>Size (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={item.size || sizeDetails.accessorySize || ''}
          onChangeText={(text) => setItem({
            ...item,
            size: text,
            sizeDetails: { ...sizeDetails, accessorySize: text },
          })}
          placeholder="Enter size"
          placeholderTextColor={TailorColors.grayMedium}
        />
      </View>
    );
  };

  const handleTakePhotoAfterTips = async () => {
    setShowPhotoTips(false);
    setHasSeenPhotoTips(true); // Mark as seen
    setTimeout(async () => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant camera access.');
        return;
      }

      try {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          allowsEditing: false,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          setPhotoUri(result.assets[0].uri);
          setPhotoConfirmed(false); // Show photo for confirmation
        }
      } catch (error) {
        console.error('[AddClosetItem] Error taking photo after tips:', error);
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      }
    }, 300);
  };

  const handleSelectPhotoAfterTips = async () => {
    setShowPhotoTips(false);
    setHasSeenPhotoTips(true); // Mark as seen
    setTimeout(async () => {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Please grant photo library access.');
        return;
      }

      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
          allowsEditing: false,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          setPhotoUri(result.assets[0].uri);
          setPhotoConfirmed(false); // Show photo for confirmation
        }
      } catch (error) {
        console.error('[AddClosetItem] Error selecting photo after tips:', error);
        Alert.alert('Error', 'Failed to select photo. Please try again.');
      }
    }, 300);
  };

  return (
    <WoodBackground>
      <PhotoTipsModal
        visible={showPhotoTips}
        onClose={handlePhotoTipsClose}
        onTakePhoto={handleTakePhotoAfterTips}
        onSelectPhoto={handleSelectPhotoAfterTips}
      />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditMode ? 'Edit Wardrobe Item' : 'Add Wardrobe Item'}
            </Text>
          </View>

          {/* Photo Capture */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isEditMode ? 'Photo' : 'Add Photo'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {isEditMode 
                ? 'Current photo. Tap buttons below to change it.'
                : 'Photo must show the entire piece, one item at a time'}
            </Text>

            {photoUri ? (
              <View style={styles.photoContainer}>
                <Image 
                  source={{ uri: photoUri }} 
                  style={styles.photo}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
                {!photoConfirmed ? (
                  <View style={styles.confirmActions}>
                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={async () => {
                        setPhotoConfirmed(true);
                        // Only categorize if not in edit mode (to preserve existing data)
                        if (!isEditMode) {
                          await categorizeItem(photoUri);
                        }
                      }}
                    >
                      <Text style={styles.confirmButtonText}>✓ Looks Good</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.retakeButton}
                      onPress={() => {
                        setPhotoUri(null);
                        setPhotoConfirmed(false);
                        setItem({
                          garmentType: GarmentType.SHIRT,
                          color: '',
                          secondaryColor: undefined,
                          brand: '',
                          notes: '',
                        });
                      }}
                    >
                      <Text style={styles.retakeButtonText}>Retake</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.confirmActions}>
                    <TouchableOpacity
                      style={styles.retakeButton}
                      onPress={() => {
                        setPhotoUri(null);
                        setPhotoConfirmed(false);
                        if (!isEditMode) {
              setItem({
                garmentType: GarmentType.SHIRT,
                color: '',
                secondaryColor: undefined,
                size: '',
                sizeDetails: {},
                brand: '',
                notes: '',
              });
                        }
                      }}
                    >
                      <Text style={styles.retakeButtonText}>
                        {isEditMode ? 'Change Photo' : 'Retake'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
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

            {isCategorizing && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={TailorColors.gold} size="small" />
                <Text style={styles.loadingText}>Analyzing item...</Text>
              </View>
            )}
          </View>

          {/* Photo Quality Warning */}
          {photoUri && photoQuality === 'poor' && photoQualityFeedback && !isEditMode && (
            <View style={styles.qualityWarning}>
              <Icon name={AppIcons.warning.name} size={20} color={TailorColors.navy} library={AppIcons.warning.library} style={styles.qualityWarningIcon} />
              <Text style={styles.qualityWarningTitle}>Photo Quality Issue</Text>
              <Text style={styles.qualityWarningText}>{photoQualityFeedback}</Text>
              <Text style={styles.qualityWarningTips}>
                Tips: Use neutral background, good lighting, single item in frame
              </Text>
              <TouchableOpacity
                style={styles.retakeQualityButton}
                onPress={() => {
                  setPhotoUri(null);
                  setPhotoConfirmed(false);
                  setShowPreview(false);
                  setPhotoQuality(null);
                  setPhotoQualityFeedback(null);
                }}
              >
                <Text style={styles.retakeQualityButtonText}>Retake Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Preview Card (Quick Add Mode) */}
          {photoUri && showPreview && !showEditDetails && !isEditMode && (
            <View style={styles.previewCard}>
              <Text style={styles.previewCardTitle}>Detected Details</Text>
              <View style={styles.previewCardContent}>
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Type:</Text>
                  <Text style={styles.previewValue}>{item.garmentType}</Text>
                </View>
                {item.color && (
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Color:</Text>
                    <Text style={styles.previewValue}>
                      {item.color}
                      {item.secondaryColor ? ` / ${item.secondaryColor} (reversible)` : ''}
                    </Text>
                  </View>
                )}
                {item.material && (
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Material:</Text>
                    <Text style={styles.previewValue}>{item.material}</Text>
                  </View>
                )}
                {item.pattern && item.pattern !== 'solid' && (
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Pattern:</Text>
                    <Text style={styles.previewValue}>{item.pattern}</Text>
                  </View>
                )}
              </View>
              <View style={styles.previewActions}>
                <GoldButton
                  title="Save"
                  onPress={handleSave}
                  disabled={isSaving || !item.color}
                  loading={isSaving}
                  style={styles.previewSaveButton}
                />
                <TouchableOpacity
                  style={styles.editDetailsButton}
                  onPress={() => setShowEditDetails(true)}
                >
                  <Text style={styles.editDetailsButtonText}>Edit Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Item Details (Editable) - Show in edit mode or when Edit Details is pressed */}
          {photoUri && (showEditDetails || isEditMode) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Item Details</Text>
              <Text style={styles.sectionSubtitle}>
                Review and edit the auto-detected information
              </Text>

              {/* Garment Type - Hierarchical Dropdown */}
              <GarmentTypePicker
                label="Garment Type"
                selectedValue={item.garmentType}
                onSelect={(type) => setItem({ ...item, garmentType: type })}
                placeholder="Select garment type..."
              />

              {/* Color - Editable */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Color</Text>
                <TextInput
                  style={styles.textInput}
                  value={item.color || ''}
                  onChangeText={(text) => setItem({ ...item, color: text })}
                  placeholder="Enter color (e.g., navy, charcoal, olive)"
                  placeholderTextColor={TailorColors.grayMedium}
                />
              </View>

              {/* Secondary Color - For reversible items (e.g., belts) */}
              {(item.garmentType === GarmentType.BELT || item.secondaryColor) && (
                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>
                    Secondary Color (Reversible) {item.garmentType === GarmentType.BELT ? '(Optional)' : ''}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={item.secondaryColor || ''}
                    onChangeText={(text) => setItem({ ...item, secondaryColor: text || undefined })}
                    placeholder="e.g., brown (for black/brown reversible belt)"
                    placeholderTextColor={TailorColors.grayMedium}
                  />
                </View>
              )}

              {/* Size Details - Based on Garment Type (Optional, only show in edit mode or when explicitly editing) */}
              {(isEditMode || showEditDetails) && renderSizeInputs()}

              {/* Material - Editable */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Material (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={item.material || ''}
                  onChangeText={(text) => setItem({ ...item, material: text })}
                  placeholder="e.g., cotton, wool, linen, silk"
                  placeholderTextColor={TailorColors.grayMedium}
                />
              </View>

              {/* Pattern - Editable */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Pattern (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={item.pattern || ''}
                  onChangeText={(text) => setItem({ ...item, pattern: text })}
                  placeholder="e.g., solid, striped, checked, paisley"
                  placeholderTextColor={TailorColors.grayMedium}
                />
              </View>

              {/* Brand - Editable */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Brand (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={item.brand || ''}
                  onChangeText={(text) => setItem({ ...item, brand: text })}
                  placeholder="Enter brand name"
                  placeholderTextColor={TailorColors.grayMedium}
                />
              </View>
            </View>
          )}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={TailorColors.gold} size="small" />
              <Text style={styles.loadingText}>Loading item...</Text>
            </View>
            ) : (
              <>
                {/* PRIVACY MESSAGING - CRITICAL FIX #4 */}
                <View style={styles.privacySection}>
                  <Text style={styles.privacyIcon}>🔒</Text>
                  <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
                  <Text style={styles.privacyText}>
                    Photos are analyzed instantly and never stored on our servers. Only you can see your wardrobe items.
                  </Text>
                </View>

                <GoldButton
                  title={isSaving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Item' : 'Save to Wardrobe')}
                  onPress={handleSave}
                  disabled={isSaving || !photoUri || !photoConfirmed}
                  loading={isSaving}
                  style={styles.saveButton}
                />
              </>
            )}
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
  photoContainer: {
    alignItems: 'center',
    marginBottom: TailorSpacing.md,
  },
  photo: {
    width: 300,
    height: 300,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.md,
    backgroundColor: TailorColors.woodMedium,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: TailorSpacing.md,
    marginTop: TailorSpacing.sm,
  },
  confirmButton: {
    backgroundColor: TailorColors.gold,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    borderRadius: TailorBorderRadius.sm,
    borderWidth: 1,
    borderColor: TailorColors.gold,
  },
  confirmButtonText: {
    ...TailorTypography.button,
    color: TailorColors.navy,
    fontSize: 14,
    fontWeight: '600',
  },
  retakeButton: {
    backgroundColor: TailorColors.woodMedium,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    borderRadius: TailorBorderRadius.sm,
    borderWidth: 1,
    borderColor: TailorColors.gold,
  },
  retakeButtonText: {
    ...TailorTypography.button,
    color: TailorContrasts.onWoodMedium,
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: TailorSpacing.md,
    padding: TailorSpacing.md,
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
  },
  loadingText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    marginLeft: TailorSpacing.sm,
  },
  fieldContainer: {
    marginBottom: TailorSpacing.md,
  },
  fieldLabel: {
    ...TailorTypography.label,
    color: TailorContrasts.onWoodDark,
    marginBottom: TailorSpacing.xs,
  },
  textInput: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    borderWidth: 1,
    borderColor: TailorColors.woodLight,
  },
  saveButton: {
    marginTop: TailorSpacing.md,
  },
  qualityWarning: {
    backgroundColor: TailorColors.burgundy,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.md,
    alignItems: 'center',
  },
  qualityWarningIcon: {
    fontSize: 32,
    marginBottom: TailorSpacing.xs,
  },
  qualityWarningTitle: {
    ...TailorTypography.h3,
    color: TailorColors.white,
    marginBottom: TailorSpacing.xs,
    fontWeight: 'bold',
  },
  qualityWarningText: {
    ...TailorTypography.body,
    color: TailorColors.white,
    textAlign: 'center',
    marginBottom: TailorSpacing.sm,
  },
  qualityWarningTips: {
    ...TailorTypography.caption,
    color: TailorColors.white,
    textAlign: 'center',
    marginBottom: TailorSpacing.md,
    opacity: 0.9,
  },
  retakeQualityButton: {
    backgroundColor: TailorColors.white,
    paddingVertical: TailorSpacing.sm,
    paddingHorizontal: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
  },
  retakeQualityButtonText: {
    ...TailorTypography.button,
    color: TailorColors.burgundy,
  },
  previewCard: {
    backgroundColor: TailorColors.woodMedium,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    marginBottom: TailorSpacing.md,
    ...TailorShadows.medium,
  },
  previewCardTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.md,
    fontWeight: 'bold',
  },
  previewCardContent: {
    marginBottom: TailorSpacing.md,
  },
  previewRow: {
    flexDirection: 'row',
    marginBottom: TailorSpacing.sm,
    alignItems: 'center',
  },
  previewLabel: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodMedium,
    fontWeight: '600',
    width: 80,
  },
  previewValue: {
    ...TailorTypography.body,
    color: TailorColors.gold,
    flex: 1,
  },
  previewActions: {
    flexDirection: 'row',
    gap: TailorSpacing.md,
    marginTop: TailorSpacing.sm,
  },
  previewSaveButton: {
    flex: 1,
  },
  editDetailsButton: {
    flex: 1,
    backgroundColor: TailorColors.woodDark,
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editDetailsButtonText: {
    ...TailorTypography.button,
    color: TailorContrasts.onWoodDark,
  },
});

