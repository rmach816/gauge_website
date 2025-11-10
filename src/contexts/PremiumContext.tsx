/**
 * PremiumContext
 * Provides premium status across the app with caching
 * Eliminates multiple AsyncStorage reads and ensures consistent state
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PremiumService } from '../services/premium';

interface PremiumContextValue {
  isPremium: boolean;
  checksRemaining: number;
  freeChatMessagesRemaining: number;
  canUseFreeMessage: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  decrementCheck: () => Promise<void>;
  markFreeChatMessageUsed: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextValue | undefined>(undefined);

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [checksRemaining, setChecksRemaining] = useState(10);
  const [freeChatMessagesRemaining, setFreeChatMessagesRemaining] = useState(0);
  const [canUseFreeMessage, setCanUseFreeMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load premium status on mount
  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    try {
      setIsLoading(true);
      const status = await PremiumService.getStatus();
      setIsPremium(status.isPremium);
      setChecksRemaining(status.checksRemaining ?? 10);

      // Load chat status if not premium
      if (!status.isPremium) {
        const chatStatus = await PremiumService.getFreeChatStatus();
        setCanUseFreeMessage(chatStatus.canUseFreeMessage);
        setFreeChatMessagesRemaining(chatStatus.messagesRemaining);
      }
    } catch (error) {
      console.error('[PremiumContext] Failed to load premium status:', error);
      // Set defaults on error
      setIsPremium(false);
      setChecksRemaining(10);
      setCanUseFreeMessage(false);
      setFreeChatMessagesRemaining(0);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = useCallback(async () => {
    await loadPremiumStatus();
  }, []);

  const decrementCheck = useCallback(async () => {
    try {
      await PremiumService.decrementCheck();
      // Update local state immediately for instant UI feedback
      setChecksRemaining(prev => Math.max(0, prev - 1));
      // Refresh from storage to ensure sync
      await refresh();
    } catch (error) {
      console.error('[PremiumContext] Failed to decrement check:', error);
      throw error;
    }
  }, [refresh]);

  const markFreeChatMessageUsed = useCallback(async () => {
    try {
      await PremiumService.markFreeChatMessageUsed();
      // Update local state immediately
      const { messagesRemaining, canUseFreeMessage } = await PremiumService.getFreeChatStatus();
      setFreeChatMessagesRemaining(messagesRemaining);
      setCanUseFreeMessage(canUseFreeMessage);
    } catch (error) {
      console.error('[PremiumContext] Failed to mark chat message used:', error);
      throw error;
    }
  }, []);

  const value: PremiumContextValue = {
    isPremium,
    checksRemaining,
    freeChatMessagesRemaining,
    canUseFreeMessage,
    isLoading,
    refresh,
    decrementCheck,
    markFreeChatMessageUsed,
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
};

/**
 * Hook to access premium context
 */
export const usePremium = (): PremiumContextValue => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
};

