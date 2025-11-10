/**
 * Analytics service for tracking user behavior
 * Supports multiple analytics providers (Expo Analytics, Firebase, etc.)
 */

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

export const AnalyticsService = {
  /**
   * Track a custom event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      console.log('[Analytics] Event:', event.name, event.properties);
      
      // In production, integrate with your analytics provider
      // Example integrations:
      
      // Expo Analytics (if using)
      // if (Platform.OS !== 'web') {
      //   await Analytics.logEvent(event.name, event.properties);
      // }
      
      // Firebase Analytics
      // await analytics().logEvent(event.name, event.properties);
      
      // Amplitude
      // Amplitude.getInstance().logEvent(event.name, event.properties);
    } catch (error) {
      console.error('[Analytics] Failed to track event:', error);
      // Fail silently - don't break app if analytics fails
    }
  },

  /**
   * Track screen view
   */
  async trackScreenView(screenName: string): Promise<void> {
    await this.trackEvent({
      name: 'screen_view',
      properties: { screen_name: screenName },
    });
  },

  /**
   * Track user action
   */
  async trackAction(action: string, properties?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      name: 'user_action',
      properties: {
        action,
        ...properties,
      },
    });
  },

  /**
   * Track style check
   */
  async trackStyleCheck(rating: string, photoCount: number): Promise<void> {
    await this.trackEvent({
      name: 'style_check',
      properties: {
        rating,
        photo_count: photoCount,
      },
    });
  },

  /**
   * Track premium upgrade attempt
   */
  async trackPremiumUpgrade(success: boolean): Promise<void> {
    await this.trackEvent({
      name: 'premium_upgrade',
      properties: {
        success,
      },
    });
  },

  /**
   * Track shopping link click
   */
  async trackShoppingClick(retailer: string, garmentType: string): Promise<void> {
    await this.trackEvent({
      name: 'shopping_click',
      properties: {
        retailer,
        garment_type: garmentType,
      },
    });
  },

  // ============================================
  // USER JOURNEY EVENTS
  // ============================================

  async trackOnboardingStarted(): Promise<void> {
    await this.trackEvent({ name: 'onboarding_started' });
  },

  async trackOnboardingCompleted(hasSkipped: boolean): Promise<void> {
    await this.trackEvent({
      name: 'onboarding_completed',
      properties: { has_skipped: hasSkipped },
    });
  },

  async trackMeasurementsEntered(complete: boolean): Promise<void> {
    await this.trackEvent({
      name: 'measurements_entered',
      properties: { complete },
    });
  },

  // ============================================
  // FEATURE USAGE EVENTS
  // ============================================

  async trackOutfitGenerated(occasion: string, mode: string, priceRange: string): Promise<void> {
    await this.trackEvent({
      name: 'outfit_generated',
      properties: {
        occasion,
        mode,
        price_range: priceRange,
      },
    });
  },

  async trackOutfitGenerationFailed(occasion: string, mode: string, errorType: string): Promise<void> {
    await this.trackEvent({
      name: 'outfit_generation_failed',
      properties: {
        occasion,
        mode,
        error_type: errorType,
      },
    });
  },

  async trackItemRegenerated(garmentType: string): Promise<void> {
    await this.trackEvent({
      name: 'item_regenerated',
      properties: { garment_type: garmentType },
    });
  },

  async trackChatMessageSent(messageLength: number, hasPhoto: boolean): Promise<void> {
    await this.trackEvent({
      name: 'chat_message_sent',
      properties: {
        message_length: messageLength,
        has_photo: hasPhoto,
      },
    });
  },

  async trackWardrobeItemAdded(garmentType: string, source: 'manual' | 'photo'): Promise<void> {
    await this.trackEvent({
      name: 'wardrobe_item_added',
      properties: {
        garment_type: garmentType,
        source,
      },
    });
  },

  async trackOutfitFavorited(outfitId: string): Promise<void> {
    await this.trackEvent({
      name: 'outfit_favorited',
      properties: { outfit_id: outfitId },
    });
  },

  // ============================================
  // PREMIUM EVENTS
  // ============================================

  async trackPaywallShown(context: string): Promise<void> {
    await this.trackEvent({
      name: 'paywall_shown',
      properties: { context },
    });
  },

  async trackPremiumPurchaseStarted(): Promise<void> {
    await this.trackEvent({ name: 'premium_purchase_started' });
  },

  async trackPremiumPurchaseCompleted(productId: string, price: number): Promise<void> {
    await this.trackEvent({
      name: 'premium_purchase_completed',
      properties: {
        product_id: productId,
        price,
      },
    });
  },

  async trackFreeLimitReached(limitType: 'checks' | 'chat'): Promise<void> {
    await this.trackEvent({
      name: 'free_limit_reached',
      properties: { limit_type: limitType },
    });
  },

  // ============================================
  // ERROR EVENTS
  // ============================================

  async trackError(screen: string, errorType: string, errorMessage: string): Promise<void> {
    await this.trackEvent({
      name: 'error_occurred',
      properties: {
        screen,
        error_type: errorType,
        error_message: errorMessage,
      },
    });
  },

  async trackApiRetry(context: string, attempt: number): Promise<void> {
    await this.trackEvent({
      name: 'api_retry',
      properties: {
        context,
        attempt,
      },
    });
  },
};

