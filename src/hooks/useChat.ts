import { useState, useEffect, useCallback } from 'react';
import { ChatService } from '../services/chat';
import { PremiumService } from '../services/premium';
import { ChatSession, ChatMessage } from '../types';

/**
 * Hook for managing chat sessions
 */
export const useChatSession = () => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [canUseFreeMessage, setCanUseFreeMessage] = useState(false);

  // Load or create session
  const loadSession = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check premium status
      const premiumStatus = await PremiumService.getStatus();
      setIsPremium(premiumStatus.isPremium);

      // Check free message availability
      const freeChatStatus = await PremiumService.getFreeChatStatus();
      setCanUseFreeMessage(freeChatStatus.canUseFreeMessage);

      // Load existing session or create new one
      const existingSession = await ChatService.loadRecentSession();
      if (existingSession && existingSession.active) {
        setSession(existingSession);
      } else {
        const newSession = await ChatService.startSession();
        setSession(newSession);
      }
    } catch (error) {
      console.error('[useChatSession] Failed to load session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new session
  const createNewSession = useCallback(async () => {
    try {
      const newSession = await ChatService.startSession();
      setSession(newSession);
      return newSession;
    } catch (error) {
      console.error('[useChatSession] Failed to create session:', error);
      throw error;
    }
  }, []);

  // Refresh premium status
  const refreshPremiumStatus = useCallback(async () => {
    try {
      const premiumStatus = await PremiumService.getStatus();
      setIsPremium(premiumStatus.isPremium);

      const freeChatStatus = await PremiumService.getFreeChatStatus();
      setCanUseFreeMessage(freeChatStatus.canUseFreeMessage);
    } catch (error) {
      console.error('[useChatSession] Failed to refresh premium status:', error);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return {
    session,
    isLoading,
    isPremium,
    canUseFreeMessage,
    loadSession,
    createNewSession,
    refreshPremiumStatus,
  };
};

/**
 * Hook for managing chat messages
 */
export const useChatMessages = (session: ChatSession | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load messages from session
  useEffect(() => {
    if (session) {
      setMessages(session.messages);
    } else {
      setMessages([]);
    }
  }, [session]);

  // Add message to local state
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Update message in local state
  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  }, []);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    addMessage,
    updateMessage,
    clearMessages,
  };
};

