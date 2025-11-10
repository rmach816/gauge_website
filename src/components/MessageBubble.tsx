import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatMessage } from '../types';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorGradients,
  TailorShadows,
} from '../utils/constants';
import { DevicePerformance } from '../utils/devicePerformance';
import { Icon, AppIcons } from './Icon';

interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
}

/**
 * MessageBubble
 * Renders chat messages (text and images)
 * AI messages: left-aligned, wood gradient
 * User messages: right-aligned, gold gradient
 */
export const MessageBubble: React.FC<MessageBubbleProps> = memo(({
  message,
  isUser,
}) => {
  const gradient = isUser
    ? TailorGradients.goldGradient
    : TailorGradients.woodMediumGradient;

  const adaptiveGradient = DevicePerformance.getAdaptiveGradient(gradient);

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      {/* Avatar */}
      {!isUser && (
        <View style={styles.avatar}>
          <ExpoImage
            source={require('../../assets/ai_tailor.png')}
            style={styles.avatarImage}
            contentFit="contain"
            transition={200}
          />
        </View>
      )}

      {/* Message Bubble */}
      <LinearGradient
        colors={adaptiveGradient.colors as any}
        locations={adaptiveGradient.locations as any}
        start={adaptiveGradient.start}
        end={adaptiveGradient.end}
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {message.content.map((content, index) => {
          if (content.type === 'text' && content.text) {
            return (
              <Text
                key={index}
                style={[
                  styles.text,
                  isUser ? styles.userText : styles.assistantText,
                ]}
              >
                {content.text}
              </Text>
            );
          } else if (content.type === 'image' && content.imageUri) {
            return (
              <ExpoImage
                key={index}
                source={{ uri: content.imageUri }}
                style={styles.image}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
            );
          }
          return null;
        })}

        {/* Display selected wardrobe items */}
        {message.wardrobeItems && message.wardrobeItems.length > 0 && (
          <View style={[
            styles.wardrobeItemsContainer,
            { borderTopColor: isUser ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' }
          ]}>
            <Text style={[styles.wardrobeItemsLabel, isUser ? styles.userText : styles.assistantText]}>
              Referenced items:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wardrobeItemsScroll}>
              {message.wardrobeItems.map((item) => (
                <View key={item.id} style={styles.wardrobeItemThumbnail}>
                  <ExpoImage
                    source={{ uri: item.imageUri }}
                    style={styles.wardrobeItemImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                  <Text
                    style={[styles.wardrobeItemText, isUser ? styles.userText : styles.assistantText]}
                    numberOfLines={1}
                  >
                    {item.garmentType}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </LinearGradient>

      {/* Avatar */}
      {isUser && (
        <View style={styles.avatar}>
          <Icon name={AppIcons.user.name} size={20} color={TailorColors.gold} library={AppIcons.user.library} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: TailorSpacing.md,
    alignItems: 'flex-end',
    paddingHorizontal: TailorSpacing.md,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: TailorColors.woodMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: TailorSpacing.xs,
    overflow: 'hidden',
    ...TailorShadows.small,
  },
  avatarImage: {
    width: 36,
    height: 36,
  },
  bubble: {
    maxWidth: '75%',
    padding: TailorSpacing.md,
    borderRadius: TailorBorderRadius.md,
    ...TailorShadows.small,
  },
  userBubble: {
    borderBottomRightRadius: TailorBorderRadius.sm,
  },
  assistantBubble: {
    borderBottomLeftRadius: TailorBorderRadius.sm,
  },
  text: {
    ...TailorTypography.body,
    lineHeight: 22,
  },
  userText: {
    color: TailorContrasts.onGold, // Navy text on gold background
  },
  assistantText: {
    color: TailorContrasts.onWoodMedium, // Cream text on wood background
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: TailorBorderRadius.sm,
    marginTop: TailorSpacing.xs,
  },
  wardrobeItemsContainer: {
    marginTop: TailorSpacing.sm,
    paddingTop: TailorSpacing.sm,
    borderTopWidth: 1,
  },
  wardrobeItemsLabel: {
    ...TailorTypography.caption,
    marginBottom: TailorSpacing.xs,
    opacity: 0.8,
  },
  wardrobeItemsScroll: {
    marginTop: TailorSpacing.xs,
  },
  wardrobeItemThumbnail: {
    width: 60,
    marginRight: TailorSpacing.xs,
    alignItems: 'center',
  },
  wardrobeItemImage: {
    width: 60,
    height: 60,
    borderRadius: TailorBorderRadius.sm,
    marginBottom: TailorSpacing.xs / 2,
  },
  wardrobeItemText: {
    ...TailorTypography.caption,
    fontSize: 10,
    textAlign: 'center',
  },
});

