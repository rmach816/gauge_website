import { StorageService } from './storage';
import { PremiumStatus } from '../types';

const FREE_TIER_CHECKS = 10;

export const PremiumService = {
  async isPremium(): Promise<boolean> {
    const status = await StorageService.getPremiumStatus();
    return status.isPremium;
  },

  async getStatus(): Promise<PremiumStatus> {
    return await StorageService.getPremiumStatus();
  },

  async canPerformCheck(): Promise<{ allowed: boolean; reason?: string }> {
    const status = await StorageService.getPremiumStatus();

    if (status.isPremium) {
      return { allowed: true };
    }

    const remaining = status.checksRemaining ?? FREE_TIER_CHECKS;
    if (remaining <= 0) {
      return {
        allowed: false,
        reason: `You've used all ${FREE_TIER_CHECKS} free checks. Upgrade to Premium for unlimited checks!`,
      };
    }

    return { allowed: true };
  },

  async decrementCheck(): Promise<void> {
    const status = await StorageService.getPremiumStatus();
    
    if (!status.isPremium) {
      const remaining = (status.checksRemaining ?? FREE_TIER_CHECKS) - 1;
      await StorageService.savePremiumStatus({
        ...status,
        checksRemaining: remaining,
      });
    }
  },

  async activatePremium(): Promise<void> {
    const now = new Date();
    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1);

    await StorageService.savePremiumStatus({
      isPremium: true,
      purchaseDate: now.toISOString(),
      expiryDate: expiry.toISOString(),
    });
  },

  async deactivatePremium(): Promise<void> {
    await StorageService.savePremiumStatus({
      isPremium: false,
      checksRemaining: FREE_TIER_CHECKS,
    });
  },
};

