import { StorageService } from './storage';
import { ClosetItem, GarmentType } from '../types';

/**
 * Closet management service
 * Provides business logic for managing user's wardrobe
 */
export const ClosetService = {
  /**
   * Get all closet items
   */
  async getClosetItems(): Promise<ClosetItem[]> {
    return await StorageService.getClosetItems();
  },

  /**
   * Add item to closet
   */
  async addItem(item: ClosetItem): Promise<void> {
    await StorageService.saveClosetItem(item);
  },

  /**
   * Remove item from closet
   */
  async removeItem(itemId: string): Promise<void> {
    await StorageService.deleteClosetItem(itemId);
  },

  /**
   * Get items by garment type
   */
  async getItemsByType(garmentType: GarmentType): Promise<ClosetItem[]> {
    const items = await this.getClosetItems();
    return items.filter((item) => item.garmentType === garmentType);
  },

  /**
   * Get items by color
   */
  async getItemsByColor(color: string): Promise<ClosetItem[]> {
    const items = await this.getClosetItems();
    return items.filter(
      (item) => item.color.toLowerCase() === color.toLowerCase()
    );
  },

  /**
   * Search closet items
   */
  async searchItems(query: string): Promise<ClosetItem[]> {
    const items = await this.getClosetItems();
    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.garmentType.toLowerCase().includes(lowerQuery) ||
        item.color.toLowerCase().includes(lowerQuery) ||
        item.brand?.toLowerCase().includes(lowerQuery) ||
        item.notes?.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Get closet statistics
   */
  async getClosetStats(): Promise<{
    total: number;
    byType: Record<GarmentType, number>;
    byColor: Record<string, number>;
  }> {
    const items = await this.getClosetItems();
    const byType: Record<string, number> = {};
    const byColor: Record<string, number> = {};

    items.forEach((item) => {
      byType[item.garmentType] = (byType[item.garmentType] || 0) + 1;
      byColor[item.color] = (byColor[item.color] || 0) + 1;
    });

    return {
      total: items.length,
      byType: byType as Record<GarmentType, number>,
      byColor,
    };
  },
};

