import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { ChatService } from '../services/chat';
import { Icon, AppIcons } from '../components/Icon';
import { StorageService } from '../services/storage';
import { PremiumService } from '../services/premium';
import { getErrorMessage } from '../utils/errorMessages';
import { ChatSession, ChatMessage, RootStackParamList } from '../types';
import { MessageBubble } from '../components/MessageBubble';
import { UpgradePromptOverlay } from '../components/UpgradePromptOverlay';
import { WoodBackground } from '../components/WoodBackground';
import { WardrobeSelectorModal } from '../components/WardrobeSelectorModal';
import { ClosetItem } from '../types';
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
import { runChatDiagnostics } from '../utils/chatDiagnostics';
import uuid from 'react-native-uuid';

type NavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * ChatScreen
 * Premium chat feature with AI tailor
 * Implements CRITICAL FIX #3: 1 free message for non-premium users
 * Implements CRITICAL FIX #4: Privacy messaging on photo button
 */
export const ChatScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [session, setSession] = useState<ChatSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [canUseFreeMessage, setCanUseFreeMessage] = useState(false);
  const [freeChatMessagesRemaining, setFreeChatMessagesRemaining] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWardrobeSelector, setShowWardrobeSelector] = useState(false);
  const [selectedWardrobeItems, setSelectedWardrobeItems] = useState<ClosetItem[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      // Check premium status
      const premium = await PremiumService.isPremium();
      setIsPremium(premium);

      if (!premium) {
        // Check free chat message status
        const { canUseFreeMessage: canUse, messagesRemaining } = await PremiumService.getFreeChatStatus();
        setCanUseFreeMessage(canUse);
        setFreeChatMessagesRemaining(messagesRemaining);

        if (!canUse) {
          // Already used all 3 trial conversations - show paywall
          navigation.navigate('Paywall');
          return;
        }
      }

      // Load or create session
      let existingSession = await ChatService.loadRecentSession();
      if (!existingSession || !existingSession.active) {
        existingSession = await ChatService.startSession();
      }
      setSession(existingSession);
    } catch (error) {
      console.error('[ChatScreen] Initialization failed:', error);
      setError('Failed to initialize chat. Please try again.');
    }
  };

  const handleNewChat = async () => {
    try {
      // Save current session before starting new one
      if (session) {
        await ChatService.saveSession(session);
      }

      // Start a new session
      const newSession = await ChatService.startSession();
      setSession(newSession);
      setError(null);
      
      // Scroll to top
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error('[ChatScreen] Failed to start new chat:', error);
      setError('Failed to start new chat. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !session) return;

    // Check if user can send message
    if (!isPremium && !canUseFreeMessage) {
      navigation.navigate('Paywall');
      return;
    }

    const userMessage: ChatMessage = {
      id: uuid.v4() as string,
      role: 'user',
      content: [{
        type: 'text',
        text: inputText.trim(),
      }],
      wardrobeItems: selectedWardrobeItems.length > 0 ? [...selectedWardrobeItems] : undefined,
      timestamp: new Date().toISOString(),
    };

    // Clear input and selected wardrobe items
    setInputText('');
    setSelectedWardrobeItems([]);
    setError(null);

    // Add message to UI immediately
    setSession((prev) => ({
      ...prev!,
      messages: [...prev!.messages, userMessage],
    }));

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Get AI response
    setIsLoading(true);
    try {
      // Run comprehensive diagnostics FIRST
      console.log('\n[ChatScreen] Running pre-message diagnostics...');
      const diagnosticReport = await runChatDiagnostics();
      
      // Get profile and wardrobe
      const profile = await StorageService.getUserProfile();
      const wardrobe = await StorageService.getClosetItems();

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Log profile data before sending to verify measurements exist
      console.log('[ChatScreen] Profile data before sending to ChatService (text message):', {
        hasProfile: !!profile,
        profileId: profile.id,
        hasMeasurements: !!profile.measurements,
        measurements: profile.measurements,
        chest: profile.measurements?.chest,
        waist: profile.measurements?.waist,
        neck: profile.measurements?.neck,
        sleeve: profile.measurements?.sleeve,
        shoulder: profile.measurements?.shoulder,
        inseam: profile.measurements?.inseam,
        hasShoeSize: !!profile.shoeSize,
        shoeSize: profile.shoeSize,
        stylePreference: profile.stylePreference,
      });

      const assistantMessage = await ChatService.sendMessage(
        session,
        userMessage,
        profile,
        wardrobe
      );

      // Update session with response
      setSession((prev) => ({
        ...prev!,
        messages: [...prev!.messages, assistantMessage],
        lastMessageAt: new Date().toISOString(),
      }));

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Save session
      await ChatService.saveSession(session);

      // Handle free message tracking
      if (!isPremium && canUseFreeMessage) {
        await PremiumService.markFreeChatMessageUsed();
        
        // Update remaining messages
        const { messagesRemaining, canUseFreeMessage: canStillUse } = await PremiumService.getFreeChatStatus();
        setFreeChatMessagesRemaining(messagesRemaining);
        setCanUseFreeMessage(canStillUse);

        // Show upgrade prompt after 3rd conversation (when remaining is 0)
        if (messagesRemaining === 0) {
          setTimeout(() => {
            setShowUpgradePrompt(true);
          }, 2000); // Let them read the response first
        }
      }
    } catch (error) {
      console.error('[ChatScreen] Send message failed:', error);
      const errorInfo = getErrorMessage(error, 'Failed to send message');
      setError(errorInfo.userMessage);
      
      // Remove user message on error
      setSession((prev) => ({
        ...prev!,
        messages: prev!.messages.filter((msg) => msg.id !== userMessage.id),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoButtonPress = () => {
    // Privacy messaging (CRITICAL FIX #4)
    Alert.alert(
      'Add Photo',
      'Photos are processed instantly and never stored on our servers. Only you can see your photos.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: handleTakePhoto },
        { text: 'Choose from Library', onPress: handleChoosePhoto },
      ]
    );
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

    if (!result.canceled && result.assets[0]) {
      await handlePhotoMessage(result.assets[0].uri);
    }
  };

  const handleChoosePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6, // Lower quality for faster processing
      allowsEditing: false, // Skip editing for speed
      exif: false, // Don't include EXIF data
    });

    if (!result.canceled && result.assets[0]) {
      await handlePhotoMessage(result.assets[0].uri);
    }
  };

  const handlePhotoMessage = async (uri: string) => {
    if (!session) return;

    // Check if user can send message
    if (!isPremium && !canUseFreeMessage) {
      navigation.navigate('Paywall');
      return;
    }

    const userMessage: ChatMessage = {
      id: uuid.v4() as string,
      role: 'user',
      content: [{
        type: 'image',
        imageUri: uri,
      }],
      wardrobeItems: selectedWardrobeItems.length > 0 ? [...selectedWardrobeItems] : undefined,
      timestamp: new Date().toISOString(),
    };

    // Clear selected wardrobe items after sending
    setSelectedWardrobeItems([]);
    setError(null);

    // Add message to UI immediately
    setSession((prev) => ({
      ...prev!,
      messages: [...prev!.messages, userMessage],
    }));

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Get AI response
    setIsLoading(true);
    try {
      // Run comprehensive diagnostics FIRST
      console.log('\n[ChatScreen] Running pre-message diagnostics...');
      const diagnosticReport = await runChatDiagnostics();
      
      // Get profile and wardrobe
      const profile = await StorageService.getUserProfile();
      const wardrobe = await StorageService.getClosetItems();

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Log profile data before sending to verify measurements exist
      console.log('[ChatScreen] Profile data before sending to ChatService (photo message):', {
        hasProfile: !!profile,
        profileId: profile.id,
        hasMeasurements: !!profile.measurements,
        measurements: profile.measurements,
        chest: profile.measurements?.chest,
        waist: profile.measurements?.waist,
        neck: profile.measurements?.neck,
        sleeve: profile.measurements?.sleeve,
        shoulder: profile.measurements?.shoulder,
        inseam: profile.measurements?.inseam,
        hasShoeSize: !!profile.shoeSize,
        shoeSize: profile.shoeSize,
        stylePreference: profile.stylePreference,
      });

      const assistantMessage = await ChatService.sendMessage(
        session,
        userMessage,
        profile,
        wardrobe
      );

      // Update session with response
      setSession((prev) => ({
        ...prev!,
        messages: [...prev!.messages, assistantMessage],
        lastMessageAt: new Date().toISOString(),
      }));

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Save session
      await ChatService.saveSession(session);

      // Handle free message tracking
      if (!isPremium && canUseFreeMessage) {
        await PremiumService.markFreeChatMessageUsed();
        
        // Update remaining messages
        const { messagesRemaining, canUseFreeMessage: canStillUse } = await PremiumService.getFreeChatStatus();
        setFreeChatMessagesRemaining(messagesRemaining);
        setCanUseFreeMessage(canStillUse);

        // Show upgrade prompt after 3rd conversation (when remaining is 0)
        if (messagesRemaining === 0) {
          setTimeout(() => {
            setShowUpgradePrompt(true);
          }, 2000); // Let them read the response first
        }
      }
    } catch (error) {
      console.error('[ChatScreen] Photo message failed:', error);
      const errorInfo = getErrorMessage(error, 'Failed to analyze photo');
      setError(errorInfo.userMessage);
      
      // Remove user message on error
      setSession((prev) => ({
        ...prev!,
        messages: prev!.messages.filter((msg) => msg.id !== userMessage.id),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const adaptiveGradient = DevicePerformance.getAdaptiveGradient({
    colors: [...TailorGradients.parchmentGradient.colors],
    locations: TailorGradients.parchmentGradient.locations ? [...TailorGradients.parchmentGradient.locations] : undefined,
    start: TailorGradients.parchmentGradient.start,
    end: TailorGradients.parchmentGradient.end,
  });

  if (!session) {
    return (
      <WoodBackground>
        <SafeAreaView style={styles.loadingContainer} edges={['top']}>
          <ActivityIndicator size="large" color={TailorColors.gold} />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </SafeAreaView>
      </WoodBackground>
    );
  }

  return (
    <LinearGradient
      colors={adaptiveGradient.colors as any}
      locations={adaptiveGradient.locations as any}
      start={adaptiveGradient.start}
      end={adaptiveGradient.end}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header with New Chat button */}
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={handleNewChat}
            activeOpacity={0.8}
          >
            <Icon name={AppIcons.add.name} size={18} color={TailorContrasts.onWoodMedium} library={AppIcons.add.library} style={{ marginRight: 4 }} />
            <Text style={styles.newChatButtonText}>New Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => setError(null)}
              style={styles.errorDismiss}
            >
              <Text style={styles.errorDismissText}>×</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Trial Message Banner - Only for free users */}
        {!isPremium && freeChatMessagesRemaining > 0 && (
          <TouchableOpacity
            style={styles.trialBanner}
            onPress={() => navigation.navigate('Paywall')}
            activeOpacity={0.8}
          >
            <Text style={styles.trialBannerText}>
              🎁 Trial: {freeChatMessagesRemaining} {freeChatMessagesRemaining === 1 ? 'conversation' : 'conversations'} remaining. Tap to upgrade for unlimited chat!
            </Text>
          </TouchableOpacity>
        )}

        {/* Message List - FlatList with proper keyboard handling */}
        <FlatList
          ref={flatListRef}
          data={session.messages}
          renderItem={({ item }) => (
            <MessageBubble message={item} isUser={item.role === 'user'} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          style={styles.flatList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          removeClippedSubviews={true}
          initialNumToRender={15}
          maxToRenderPerBatch={5}
          windowSize={10}
          updateCellsBatchingPeriod={50}
          ListFooterComponent={
            <>
              {isLoading && (
                <View style={styles.loadingIndicator}>
                  <ActivityIndicator color={TailorColors.gold} size="small" />
                  <Text style={styles.loadingText}>Thinking...</Text>
                </View>
              )}
              <View style={{ height: 120 }} />
            </>
          }
        />

        {/* KeyboardAvoidingView wraps ONLY the input container */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.inputContainer}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={handlePhotoButtonPress}
            >
              <Icon name={AppIcons.camera.name} size={20} color={TailorColors.gold} library={AppIcons.camera.library} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.wardrobeButton}
              onPress={() => setShowWardrobeSelector(true)}
            >
              <Icon name={AppIcons.wardrobe.name} size={20} color={TailorColors.gold} library={AppIcons.wardrobe.library} />
              {selectedWardrobeItems.length > 0 && (
                <View style={styles.selectedItemsBadge}>
                  <Text style={styles.selectedItemsText}>
                    {selectedWardrobeItems.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              !isPremium && !canUseFreeMessage
                ? 'Upgrade to continue chatting...'
                : 'Ask your tailor anything...'
            }
            placeholderTextColor={TailorColors.grayMedium}
            multiline
            maxLength={500}
            editable={isPremium || canUseFreeMessage}
            onFocus={() => {
              // Scroll to bottom when input is focused
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading || (!isPremium && !canUseFreeMessage)) &&
                styles.sendButtonDisabled,
            ]}
            onPress={
              isPremium || canUseFreeMessage
                ? handleSendMessage
                : () => navigation.navigate('Paywall')
            }
            disabled={!inputText.trim() || isLoading || (!isPremium && !canUseFreeMessage)}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Upgrade Prompt Overlay (CRITICAL FIX #3) */}
      <UpgradePromptOverlay
        visible={showUpgradePrompt}
        onDismiss={() => setShowUpgradePrompt(false)}
      />

      {/* Wardrobe Selector Modal */}
      <WardrobeSelectorModal
        visible={showWardrobeSelector}
        onClose={() => setShowWardrobeSelector(false)}
        onSelect={(items) => {
          setSelectedWardrobeItems(items);
          setShowWardrobeSelector(false);
        }}
        selectedItems={selectedWardrobeItems}
        multiSelect={true}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
  messageList: {
    padding: TailorSpacing.md,
    paddingBottom: TailorSpacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TailorTypography.body,
    color: TailorContrasts.onWoodDark,
    marginTop: TailorSpacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: TailorSpacing.xl,
    paddingTop: TailorSpacing.md,
    paddingBottom: TailorSpacing.sm,
  },
  headerSpacer: {
    flex: 1,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TailorColors.woodMedium,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.xs,
    borderRadius: TailorBorderRadius.md,
    borderWidth: 1,
    borderColor: TailorColors.woodLight,
    ...TailorShadows.small,
  },
  newChatButtonText: {
    ...TailorTypography.caption,
    color: TailorContrasts.onWoodMedium,
    fontSize: 13,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: TailorColors.burgundy,
    padding: TailorSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trialBanner: {
    backgroundColor: TailorColors.gold,
    padding: TailorSpacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialBannerText: {
    ...TailorTypography.caption,
    color: TailorContrasts.onGold,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    ...TailorTypography.body,
    color: TailorColors.white,
    flex: 1,
  },
  errorDismiss: {
    padding: TailorSpacing.xs,
  },
  errorDismissText: {
    ...TailorTypography.h2,
    color: TailorColors.white,
    fontSize: 24,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: TailorSpacing.md,
    paddingBottom: Platform.OS === 'ios' ? TailorSpacing.lg : TailorSpacing.lg,
    backgroundColor: TailorColors.woodMedium,
    borderTopWidth: 1,
    borderTopColor: TailorColors.gold,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: TailorSpacing.sm,
  },
  photoButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: TailorSpacing.xs,
  },
  photoIcon: {
    fontSize: 24,
  },
  wardrobeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  wardrobeIcon: {
    fontSize: 24,
  },
  selectedItemsBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: TailorColors.gold,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: TailorColors.woodDark,
  },
  selectedItemsText: {
    ...TailorTypography.caption,
    color: TailorContrasts.onGold,
    fontSize: 12,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    ...TailorTypography.body,
    backgroundColor: TailorColors.parchment,
    borderRadius: TailorBorderRadius.md,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    marginRight: TailorSpacing.sm,
    maxHeight: 100,
    color: TailorContrasts.onParchment,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TailorColors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: TailorColors.grayMedium,
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 24,
    color: TailorContrasts.onGold,
  },
});

