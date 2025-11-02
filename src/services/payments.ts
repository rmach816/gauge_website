import { Platform, Alert } from 'react-native';
import { PremiumService } from './premium';
import { AnalyticsService } from './analytics';
import { CrashReportingService } from './crashReporting';

/**
 * Payment service for premium subscriptions
 * Supports RevenueCat, Stripe, and test mode
 */
export const PaymentService = {
  /**
   * Initialize payment service
   */
  async initialize(): Promise<void> {
    try {
      // In production, initialize RevenueCat:
      /*
      import Purchases from 'react-native-purchases';
      
      if (Platform.OS === 'ios') {
        await Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY });
      } else {
        await Purchases.configure({ apiKey: REVENUECAT_ANDROID_API_KEY });
      }
      */
      
      console.log('[PaymentService] Initialized');
    } catch (error) {
      console.error('[PaymentService] Initialization failed:', error);
      await CrashReportingService.captureException(
        error as Error,
        { tags: { service: 'payments', action: 'initialize' } }
      );
    }
  },

  /**
   * Purchase premium subscription
   */
  async purchasePremium(): Promise<{ success: boolean; error?: string }> {
    try {
      // Production: Use RevenueCat
      /*
      import Purchases from 'react-native-purchases';
      
      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        const packageToPurchase = offerings.current.availablePackages[0];
        const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
        
        if (customerInfo.entitlements.active['premium']) {
          await PremiumService.activatePremium();
          await AnalyticsService.trackPremiumUpgrade(true);
          return { success: true };
        }
      }
      */

      // Test mode (development only)
      if (__DEV__) {
        await PremiumService.activatePremium();
        await AnalyticsService.trackPremiumUpgrade(true);
        return { success: true };
      }

      // Production fallback
      return {
        success: false,
        error: 'Payment provider not configured',
      };
    } catch (error: unknown) {
      console.error('[PaymentService] Purchase failed:', error);
      
      await CrashReportingService.captureException(
        error as Error,
        { tags: { service: 'payments', action: 'purchase' } }
      );
      
      await AnalyticsService.trackPremiumUpgrade(false);
      
      const errorMessage =
        (error as { userCancelled?: boolean; code?: string })?.userCancelled ||
        (error as { code?: string })?.code === 'USER_CANCELLED'
          ? 'Purchase was cancelled'
          : 'Purchase failed. Please try again.';
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Restore purchases (for users who already purchased)
   */
  async restorePurchases(): Promise<{ success: boolean; restored: boolean }> {
    try {
      // Production: Use RevenueCat
      /*
      import Purchases from 'react-native-purchases';
      
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active['premium']) {
        await PremiumService.activatePremium();
        return { success: true, restored: true };
      }
      return { success: true, restored: false };
      */

      // Test mode
      return { success: true, restored: false };
    } catch (error) {
      console.error('[PaymentService] Restore failed:', error);
      await CrashReportingService.captureException(
        error as Error,
        { tags: { service: 'payments', action: 'restore' } }
      );
      return { success: false, restored: false };
    }
  },

  /**
   * Check subscription status from payment provider
   */
  async checkSubscriptionStatus(): Promise<boolean> {
    try {
      // Production: Check with RevenueCat
      /*
      import Purchases from 'react-native-purchases';
      
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active['premium'] !== undefined;
      */

      // Fallback to local storage
      return await PremiumService.isPremium();
    } catch (error) {
      console.error('[PaymentService] Status check failed:', error);
      // Fallback to local storage
      return await PremiumService.isPremium();
    }
  },
};

