import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  UserMeasurements,
  ClosetItem,
  CheckHistory,
  PremiumStatus,
  OnboardingState,
  FavoriteOutfit,
} from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: '@gauge_user_profile',
  CLOSET_ITEMS: '@gauge_closet_items',
  CHECK_HISTORY: '@gauge_check_history',
  PREMIUM_STATUS: '@gauge_premium_status',
  ONBOARDING_STATE: '@gauge_onboarding_state',
  FAVORITE_OUTFITS: '@gauge_favorite_outfits',
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

  async saveClosetItems(items: ClosetItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.CLOSET_ITEMS,
        JSON.stringify(items)
      );
    } catch (error) {
      console.error('[StorageService] Failed to save closet items:', error);
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
      const existingIndex = history.findIndex((c) => c.id === check.id);
      if (existingIndex !== -1) {
        // Update existing check
        history[existingIndex] = check;
      } else {
        // Add new check
        history.unshift(check);
      }
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

  // ONBOARDING STATE
  async getOnboardingState(): Promise<OnboardingState | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('[StorageService] Failed to get onboarding state:', error);
      return null;
    }
  },

  async saveOnboardingState(state: OnboardingState): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ONBOARDING_STATE,
        JSON.stringify(state)
      );
    } catch (error) {
      console.error('[StorageService] Failed to save onboarding state:', error);
      throw error;
    }
  },

  // FAVORITE OUTFITS
  async getFavoriteOutfits(): Promise<FavoriteOutfit[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_OUTFITS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[StorageService] Failed to get favorite outfits:', error);
      return [];
    }
  },

  async saveFavoriteOutfit(favorite: FavoriteOutfit): Promise<void> {
    try {
      const favorites = await this.getFavoriteOutfits();
      favorites.push(favorite);
      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITE_OUTFITS,
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error('[StorageService] Failed to save favorite outfit:', error);
      throw error;
    }
  },

  async updateFavoriteOutfit(favoriteId: string, updates: Partial<FavoriteOutfit>): Promise<void> {
    try {
      const favorites = await this.getFavoriteOutfits();
      const index = favorites.findIndex(f => f.id === favoriteId);
      if (index !== -1) {
        favorites[index] = { ...favorites[index], ...updates };
        await AsyncStorage.setItem(
          STORAGE_KEYS.FAVORITE_OUTFITS,
          JSON.stringify(favorites)
        );
      }
    } catch (error) {
      console.error('[StorageService] Failed to update favorite outfit:', error);
      throw error;
    }
  },

  async deleteFavoriteOutfit(favoriteId: string): Promise<void> {
    try {
      const favorites = await this.getFavoriteOutfits();
      const filtered = favorites.filter(f => f.id !== favoriteId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.FAVORITE_OUTFITS,
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error('[StorageService] Failed to delete favorite outfit:', error);
      throw error;
    }
  },
};

