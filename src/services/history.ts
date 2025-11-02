import { StorageService } from './storage';
import { CheckHistory, MatchCheckResult, CompleteOutfit } from '../types';
import { formatDate } from '../utils/formatting';

/**
 * Check history service
 * Provides business logic for managing style check history
 */
export const HistoryService = {
  /**
   * Get all check history
   */
  async getHistory(): Promise<CheckHistory[]> {
    return await StorageService.getCheckHistory();
  },

  /**
   * Save check to history
   */
  async saveCheck(check: CheckHistory): Promise<void> {
    await StorageService.saveCheckToHistory(check);
  },

  /**
   * Clear all history
   */
  async clearHistory(): Promise<void> {
    await StorageService.clearHistory();
  },

  /**
   * Get recent checks (last N)
   */
  async getRecentChecks(limit: number = 10): Promise<CheckHistory[]> {
    const history = await this.getHistory();
    return history.slice(0, limit);
  },

  /**
   * Get checks by type
   */
  async getChecksByType(
    type: 'instant-check' | 'outfit-builder' | 'closet-match'
  ): Promise<CheckHistory[]> {
    const history = await this.getHistory();
    return history.filter((check) => check.type === type);
  },

  /**
   * Get check by ID
   */
  async getCheckById(checkId: string): Promise<CheckHistory | null> {
    const history = await this.getHistory();
    return history.find((check) => check.id === checkId) || null;
  },

  /**
   * Get formatted history for display
   */
  async getFormattedHistory(): Promise<
    Array<{
      id: string;
      type: string;
      date: string;
      rating?: string;
      summary: string;
    }>
  > {
    const history = await this.getHistory();
    return history.map((check) => {
      if (check.type === 'instant-check') {
        const result = check.result as MatchCheckResult;
        return {
          id: check.id,
          type: check.type,
          date: formatDate(check.createdAt),
          rating: result.rating,
          summary: result.analysis.substring(0, 100) + '...',
        };
      } else {
        const result = check.result as CompleteOutfit;
        return {
          id: check.id,
          type: check.type,
          date: formatDate(check.createdAt),
          summary: `Outfit for ${result.occasion} with ${result.items.length} items`,
        };
      }
    });
  },
};

