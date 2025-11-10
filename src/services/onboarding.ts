import { StorageService } from './storage';
import { OnboardingState } from '../types';

/**
 * OnboardingService
 * Manages onboarding state, progress, and completion
 * Implements CRITICAL FIX #2: "Skip All" functionality
 */
export const OnboardingService = {
  /**
   * Get current onboarding state
   */
  async getOnboardingState(): Promise<OnboardingState> {
    try {
      const state = await StorageService.getOnboardingState();
      if (state) {
        return state;
      }
      
      // Return default state
      return {
        hasCompletedOnboarding: false,
        skippedAll: false,
        completedSteps: [],
        skippedSteps: [],
        currentStep: 0,
      };
    } catch (error) {
      console.error('[OnboardingService] Failed to get onboarding state:', error);
      return {
        hasCompletedOnboarding: false,
        skippedAll: false,
        completedSteps: [],
        skippedSteps: [],
        currentStep: 0,
      };
    }
  },

  /**
   * Save onboarding state
   */
  async saveOnboardingState(state: OnboardingState): Promise<void> {
    try {
      await StorageService.saveOnboardingState(state);
    } catch (error) {
      console.error('[OnboardingService] Failed to save onboarding state:', error);
      throw error;
    }
  },

  /**
   * Mark a step as complete
   */
  async markStepComplete(step: string): Promise<void> {
    const state = await this.getOnboardingState();
    if (!state.completedSteps.includes(step)) {
      state.completedSteps.push(step);
    }
    // Remove from skipped if it was there
    state.skippedSteps = state.skippedSteps.filter(s => s !== step);
    await this.saveOnboardingState(state);
  },

  /**
   * Mark a step as skipped
   */
  async markStepSkipped(step: string): Promise<void> {
    const state = await this.getOnboardingState();
    if (!state.skippedSteps.includes(step)) {
      state.skippedSteps.push(step);
    }
    await this.saveOnboardingState(state);
  },

  /**
   * Check if onboarding has been completed
   */
  async hasCompletedOnboarding(): Promise<boolean> {
    const state = await this.getOnboardingState();
    return state.hasCompletedOnboarding || state.skippedAll === true;
  },

  /**
   * Mark onboarding as complete
   */
  async markOnboardingComplete(): Promise<void> {
    const state = await this.getOnboardingState();
    state.hasCompletedOnboarding = true;
    await this.saveOnboardingState(state);
  },

  /**
   * Reset onboarding (allows user to restart)
   */
  async resetOnboarding(): Promise<void> {
    await this.saveOnboardingState({
      hasCompletedOnboarding: false,
      skippedAll: false,
      completedSteps: [],
      skippedSteps: [],
      currentStep: 0,
    });
  },

  /**
   * Mark onboarding as skipped (CRITICAL FIX #2)
   * User can complete setup later from Settings
   */
  async markAsSkipped(): Promise<void> {
    await this.saveOnboardingState({
      hasCompletedOnboarding: false,
      skippedAll: true,
      completedSteps: [],
      skippedSteps: ['all'],
      currentStep: 0,
    });
  },

  /**
   * Check if setup reminder should be shown (CRITICAL FIX #2)
   * Shows for users who skipped onboarding but haven't completed it
   * Also checks if user has actually completed setup (has measurements, etc.)
   */
  async shouldShowSetupReminder(): Promise<boolean> {
    const state = await this.getOnboardingState();
    
    // If onboarding is marked as complete, don't show reminder
    if (state.hasCompletedOnboarding) {
      return false;
    }
    
    // If user skipped all, check if they've actually completed setup
    if (state.skippedAll === true) {
      // Check if user has completed essential setup steps
      const profile = await StorageService.getUserProfile();
      const hasMeasurements = profile?.measurements && Object.keys(profile.measurements).length > 0;
      const hasStylePreferences = profile?.stylePreference && profile.stylePreference.length > 0;
      
      // If they have measurements or style preferences, they've completed setup
      if (hasMeasurements || hasStylePreferences) {
        // Mark onboarding as complete since they've done the essential setup
        await this.markOnboardingComplete();
        return false;
      }
      
      return true; // Show reminder if they skipped and haven't completed setup
    }
    
    return false;
  },
};

