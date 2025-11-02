import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  UserMeasurements,
  ClosetItem,
  CheckHistory,
  PremiumStatus,
} from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: '@gauge_user_profile',
  CLOSET_ITEMS: '@gauge_closet_items',
  CHECK_HISTORY: '@gauge_check_history',
  PREMIUM_STATUS: '@gauge_premium_status',
} as const;

export const StorageService = {
  // USER PROFILE
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[StorageService] Failed to get user profile:', error);
      return null;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(profile)
      );
    } catch (error) {
      console.error('[StorageService] Failed to save user profile:', error);
      throw error;
    }
  },

  async updateMeasurements(measurements: UserMeasurements): Promise<void> {
    try {
      const profile = await this.getUserProfile();
      if (profile) {
        profile.measurements = measurements;
        profile.updatedAt = new Date().toISOString();
        await this.saveUserProfile(profile);
      }
    } catch (error) {
      console.error('[StorageService] Failed to update measurements:', error);
      throw error;
    }
  },

  // CLOSET ITEMS
  async getClosetItems(): Promise<ClosetItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CLOSET_ITEMS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[StorageService] Failed to get closet items:', error);
      return [];
    }
  },

  async saveClosetItem(item: ClosetItem): Promise<void> {
    try {
      const items = await this.getClosetItems();
      items.push(item);
      await AsyncStorage.setItem(
        STORAGE_KEYS.CLOSET_ITEMS,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error('[StorageService] Failed to save closet item:', error);
      throw error;
    }
  },

  async deleteClosetItem(itemId: string): Promise<void> {
    try {
      const items = await this.getClosetItems();
      const filtered = items.filter((item) => item.id !== itemId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.CLOSET_ITEMS,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error('[StorageService] Failed to delete closet item:', error);
      throw error;
    }
  },

  // CHECK HISTORY
  async getCheckHistory(): Promise<CheckHistory[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHECK_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[StorageService] Failed to get check history:', error);
      return [];
    }
  },

  async saveCheckToHistory(check: CheckHistory): Promise<void> {
    try {
      const history = await this.getCheckHistory();
      history.unshift(check);
      const trimmed = history.slice(0, 100); // Keep last 100
      await AsyncStorage.setItem(
        STORAGE_KEYS.CHECK_HISTORY,
        JSON.stringify(trimmed)
      );
    } catch (error) {
      console.error('[StorageService] Failed to save check history:', error);
      throw error;
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CHECK_HISTORY);
    } catch (error) {
      console.error('[StorageService] Failed to clear history:', error);
      throw error;
    }
  },

  // PREMIUM STATUS
  async getPremiumStatus(): Promise<PremiumStatus> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PREMIUM_STATUS);
      return data
        ? JSON.parse(data)
        : { isPremium: false, checksRemaining: 10 };
    } catch (error) {
      console.error('[StorageService] Failed to get premium status:', error);
      return { isPremium: false, checksRemaining: 10 };
    }
  },

  async savePremiumStatus(status: PremiumStatus): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PREMIUM_STATUS,
        JSON.stringify(status)
      );
    } catch (error) {
      console.error('[StorageService] Failed to save premium status:', error);
      throw error;
    }
  },
};

