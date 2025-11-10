import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TailorColors, TailorTypography, TailorSpacing, TailorBorderRadius } from '../utils/constants';
import { GoldButton } from './GoldButton';
import { Icon, AppIcons } from './Icon';

export type EmptyStateType = 
  | 'wardrobe'
  | 'wardrobe-search'
  | 'history'
  | 'history-search'
  | 'favorites'
  | 'chat';

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
  actionLabel?: string;
  style?: any;
}

/**
 * EmptyState
 * Reusable empty state component with illustrations, messages, and CTAs
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  onAction,
  actionLabel,
  style,
}) => {
  const config = getEmptyStateConfig(type, onAction, actionLabel);

  return (
    <View style={[styles.container, style]}>
      <Icon name={config.icon.name} size={64} color={TailorColors.gold} library={config.icon.library} style={styles.icon} />
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.message}>{config.message}</Text>
      
      {config.tips && config.tips.length > 0 && (
        <View style={styles.tipsContainer}>
          {config.tips.map((tip, index) => (
            <View key={index} style={styles.tip}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {config.actionLabel && onAction && (
        <GoldButton
          title={config.actionLabel}
          onPress={onAction}
          style={styles.actionButton}
          accessibilityLabel={config.actionLabel}
        />
      )}
    </View>
  );
};

interface EmptyStateConfig {
  icon: { name: string; library: 'feather' | 'ionicons' | 'material' };
  title: string;
  message: string;
  tips?: string[];
  actionLabel?: string;
}

function getEmptyStateConfig(
  type: EmptyStateType,
  onAction?: () => void,
  customActionLabel?: string
): EmptyStateConfig {
  switch (type) {
    case 'wardrobe':
      return {
        icon: AppIcons.wardrobe,
        title: 'Your Wardrobe is Empty',
        message: 'Start building your wardrobe to get personalized style recommendations and outfit suggestions.',
        tips: [
          'Take photos with a neutral background',
          'Ensure good lighting for best results',
          'Lay items flat or hang them up',
          'Make sure the entire item is visible',
        ],
        actionLabel: customActionLabel || 'Add Your First Item',
      };

    case 'wardrobe-search':
      return {
        icon: AppIcons.search,
        title: 'No Items Found',
        message: 'No items match your search. Try adjusting your search terms or filters.',
        tips: [
          'Check your spelling',
          'Try broader search terms',
          'Clear filters to see all items',
        ],
        actionLabel: undefined,
      };

    case 'history':
      return {
        icon: AppIcons.history,
        title: 'No History Yet',
        message: 'Your style checks, outfit recommendations, and chat sessions will appear here.',
        tips: [
          'Try a Quick Style Check',
          'Build an Outfit for an occasion',
          'Chat with your tailor for advice',
        ],
        actionLabel: customActionLabel || 'Try Quick Style Check',
      };

    case 'history-search':
      return {
        icon: AppIcons.search,
        title: 'No Results Found',
        message: 'No history items match your search. Try adjusting your search terms or filters.',
        tips: [
          'Check your spelling',
          'Try different date ranges',
          'Clear filters to see all history',
        ],
        actionLabel: undefined,
      };

    case 'favorites':
      return {
        icon: AppIcons.favorite,
        title: 'No Favorites Yet',
        message: 'Save outfits you love to access them anytime. Perfect for remembering great combinations!',
        tips: [
          'Build an outfit you like',
          'Tap the star icon to save',
          'Give favorites a name for easy recall',
        ],
        actionLabel: customActionLabel || 'Build an Outfit',
      };

    case 'chat':
      return {
        icon: AppIcons.chat,
        title: 'Start a Conversation',
        message: 'Ask your tailor anything about style, outfits, or wardrobe management.',
        tips: [
          'Ask about outfit combinations',
          'Get style advice for occasions',
          'Reference items from your wardrobe',
        ],
        actionLabel: undefined,
      };

    default:
      return {
        icon: AppIcons.info,
        title: 'Empty',
        message: 'Nothing to display here yet.',
        actionLabel: undefined,
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: TailorSpacing.xxxl * 2,
    paddingHorizontal: TailorSpacing.xl,
  },
  icon: {
    fontSize: 80,
    marginBottom: TailorSpacing.lg,
  },
  title: {
    ...TailorTypography.h2,
    color: TailorColors.cream,
    marginBottom: TailorSpacing.sm,
    textAlign: 'center',
  },
  message: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    textAlign: 'center',
    marginBottom: TailorSpacing.lg,
    paddingHorizontal: TailorSpacing.lg,
    lineHeight: 22,
  },
  tipsContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: TailorSpacing.xl,
    paddingHorizontal: TailorSpacing.md,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: TailorSpacing.sm,
  },
  tipBullet: {
    ...TailorTypography.body,
    color: TailorColors.gold,
    marginRight: TailorSpacing.sm,
    fontSize: 18,
    lineHeight: 22,
  },
  tipText: {
    ...TailorTypography.body,
    color: TailorColors.ivory,
    flex: 1,
    lineHeight: 22,
  },
  actionButton: {
    marginTop: TailorSpacing.md,
    minWidth: 200,
  },
});

