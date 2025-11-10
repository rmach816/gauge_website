import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
} from '../utils/constants';
import { Icon, AppIcons } from './Icon';

interface PhotoTipsModalProps {
  visible: boolean;
  onClose: () => void;
  onTakePhoto?: () => void | Promise<void>;
  onSelectPhoto?: () => void | Promise<void>;
}

/**
 * PhotoTipsModal
 * Displays best practices for taking photos of wardrobe items
 */
export const PhotoTipsModal: React.FC<PhotoTipsModalProps> = ({
  visible,
  onClose,
  onTakePhoto,
  onSelectPhoto,
}) => {
  const tips = [
    {
      icon: AppIcons.target,
      title: 'Neutral Background',
      description: 'Use a plain, light-colored background (white, gray, or beige wall or floor). Avoid busy patterns or cluttered backgrounds.',
    },
    {
      icon: AppIcons.shirt,
      title: 'One Item at a Time',
      description: 'Only include the single item you\'re photographing. Remove other clothes, hangers, or accessories from the shot.',
    },
    {
      icon: AppIcons.sparkles,
      title: 'Good Lighting',
      description: 'Take photos in natural light or well-lit areas. Avoid harsh shadows or dark corners. The item should be clearly visible.',
    },
    {
      icon: AppIcons.info,
      title: 'Lay Flat or Hang',
      description: 'Lay the item flat on a clean surface, or hang it on a plain hanger against a neutral wall. Make sure it\'s not wrinkled or bunched up.',
    },
    {
      icon: AppIcons.camera,
      title: 'Fill the Frame',
      description: 'Get close enough so the item fills most of the frame. We need to see details like color, pattern, and style clearly.',
    },
    {
      icon: AppIcons.sparkles,
      title: 'Clean and Wrinkle-Free',
      description: 'Make sure the item is clean and relatively wrinkle-free. This helps our AI identify the item more accurately.',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Icon name={AppIcons.camera.name} size={24} color={TailorColors.gold} library={AppIcons.camera.library} style={{ marginRight: 8 }} />
                <Text style={styles.title}>Photo Tips</Text>
              </View>
              <Text style={styles.subtitle}>
                Follow these tips for the best results
              </Text>
            </View>

            <View style={styles.tipsContainer}>
              {tips.map((tip, index) => (
                <View key={index} style={styles.tipCard}>
                  <Icon name={tip.icon.name} size={24} color={TailorColors.gold} library={tip.icon.library} style={styles.tipIcon} />
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDescription}>{tip.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            {onTakePhoto && onSelectPhoto ? (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.takePhotoButton]}
                  onPress={onTakePhoto}
                  activeOpacity={0.7}
                >
                  <Icon name={AppIcons.camera.name} size={18} color={TailorContrasts.onGold} library={AppIcons.camera.library} style={{ marginRight: 8 }} />
                  <Text style={[styles.actionButtonText, styles.takePhotoButtonText]}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.selectPhotoButton]}
                  onPress={onSelectPhoto}
                  activeOpacity={0.7}
                >
                  <Icon name={AppIcons.image.name} size={18} color={TailorContrasts.onGold} library={AppIcons.image.library} style={{ marginRight: 8 }} />
                  <Text style={[styles.actionButtonText, styles.selectPhotoButtonText]}>Choose from Library</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>Got It</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: TailorSpacing.xl,
  },
  modalContainer: {
    backgroundColor: TailorColors.woodDark,
    borderRadius: TailorBorderRadius.lg,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: TailorColors.gold,
    ...TailorShadows.large,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: TailorSpacing.xl,
  },
  header: {
    marginBottom: TailorSpacing.xl,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: TailorSpacing.sm,
  },
  title: {
    ...TailorTypography.h1,
    color: TailorContrasts.onWoodDark,
  },
  subtitle: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    textAlign: 'center',
  },
  tipsContainer: {
    gap: TailorSpacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: TailorColors.woodMedium,
    borderRadius: TailorBorderRadius.md,
    padding: TailorSpacing.md,
    borderWidth: 1,
    borderColor: TailorColors.woodLight,
  },
  tipIcon: {
    fontSize: 32,
    marginRight: TailorSpacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...TailorTypography.h3,
    color: TailorContrasts.onWoodMedium,
    marginBottom: TailorSpacing.xs,
  },
  tipDescription: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    lineHeight: 20,
  },
  buttonContainer: {
    padding: TailorSpacing.xl,
    paddingTop: TailorSpacing.md,
    borderTopWidth: 1,
    borderTopColor: TailorColors.woodLight,
  },
  closeButton: {
    backgroundColor: TailorColors.gold,
    borderRadius: TailorBorderRadius.md,
    paddingVertical: TailorSpacing.md,
    paddingHorizontal: TailorSpacing.xl,
    alignItems: 'center',
    ...TailorShadows.small,
  },
  closeButtonText: {
    ...TailorTypography.h3,
    color: TailorColors.navy,
    fontWeight: '600',
  },
  actionButton: {
    borderRadius: TailorBorderRadius.md,
    paddingVertical: TailorSpacing.md,
    paddingHorizontal: TailorSpacing.xl,
    alignItems: 'center',
    marginBottom: TailorSpacing.sm,
    ...TailorShadows.small,
  },
  takePhotoButton: {
    backgroundColor: TailorColors.gold,
  },
  selectPhotoButton: {
    backgroundColor: TailorColors.woodMedium,
    borderWidth: 2,
    borderColor: TailorColors.gold,
  },
  actionButtonText: {
    ...TailorTypography.h3,
    fontWeight: '600',
  },
  takePhotoButtonText: {
    color: TailorColors.navy,
  },
  selectPhotoButtonText: {
    color: TailorContrasts.onWoodMedium,
  },
  cancelButton: {
    paddingVertical: TailorSpacing.sm,
    alignItems: 'center',
    marginTop: TailorSpacing.xs,
  },
  cancelButtonText: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    textDecorationLine: 'underline',
  },
});

