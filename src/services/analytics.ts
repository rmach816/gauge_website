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
};

