import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { GoldButton } from './GoldButton';
import {
  TailorColors,
  TailorTypography,
  TailorSpacing,
  TailorBorderRadius,
  TailorContrasts,
  TailorShadows,
  TailorGradients,
} from '../utils/constants';
import { LinearGradient } from 'expo-linear-gradient';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface UpgradePromptOverlayProps {
  onDismiss: () => void;
  visible: boolean;
}

/**
 * UpgradePromptOverlay
 * Shows after free user's first chat message (CRITICAL FIX #3)
 * Prompts upgrade to premium with feature list
 */
export const UpgradePromptOverlay: React.FC<UpgradePromptOverlayProps> = ({
  onDismiss,
  visible,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const handleUpgrade = () => {
    onDismiss();
    navigation.navigate('Paywall');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.card}>
          <LinearGradient
            colors={TailorGradients.parchmentGradient.colors}
            locations={TailorGradients.parchmentGradient.locations}
            start={TailorGradients.parchmentGradient.start}
            end={TailorGradients.parchmentGradient.end}
            style={styles.cardGradient}
          >
            <Text style={styles.icon}>✨</Text>
            <Text style={styles.title}>Enjoying the conversation?</Text>
            <Text style={styles.body}>
              Your personal tailor is ready to help with unlimited advice,
              outfit suggestions, and shopping assistance.
            </Text>

            <View style={styles.features}>
              <FeatureBullet icon="💬" text="Unlimited chat sessions" />
              <FeatureBullet icon="👔" text="Full wardrobe management" />
              <FeatureBullet icon="🛍️" text="Personalized shopping" />
              <FeatureBullet icon="📸" text="In-store assistance" />
            </View>

            <Text style={styles.price}>$6.99/month</Text>

            <GoldButton
              title="Upgrade to Premium"
              onPress={handleUpgrade}
              style={styles.upgradeButton}
            />

            <TouchableOpacity
              onPress={onDismiss}
              style={styles.dismissButton}
            >
              <Text style={styles.dismissText}>Maybe Later</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Animated.View>
    </Modal>
  );
};

interface FeatureBulletProps {
  icon: string;
  text: string;
}

const FeatureBullet: React.FC<FeatureBulletProps> = ({ icon, text }) => (
  <View style={styles.featureRow}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: TailorSpacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: TailorBorderRadius.lg,
    overflow: 'hidden',
    ...TailorShadows.large,
  },
  cardGradient: {
    padding: TailorSpacing.xl,
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: TailorSpacing.md,
  },
  title: {
    ...TailorTypography.h2,
    color: TailorContrasts.onParchment,
    textAlign: 'center',
    marginBottom: TailorSpacing.md,
  },
  body: {
    ...TailorTypography.body,
    color: TailorColors.navyLight,
    textAlign: 'center',
    marginBottom: TailorSpacing.lg,
    lineHeight: 24,
  },
  features: {
    width: '100%',
    marginBottom: TailorSpacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: TailorSpacing.sm,
    paddingLeft: TailorSpacing.md,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: TailorSpacing.sm,
  },
  featureText: {
    ...TailorTypography.body,
    color: TailorContrasts.onParchment,
    flex: 1,
  },
  price: {
    ...TailorTypography.h2,
    color: TailorContrasts.onParchment,
    marginBottom: TailorSpacing.md,
    fontWeight: '700',
  },
  upgradeButton: {
    width: '100%',
    marginBottom: TailorSpacing.md,
  },
  dismissButton: {
    padding: TailorSpacing.sm,
  },
  dismissText: {
    ...TailorTypography.body,
    color: TailorColors.grayDark,
    textDecorationLine: 'underline',
  },
});

