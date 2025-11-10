/**
 * Profile Migration Utility
 * 
 * Handles one-time migrations to fix data issues for existing users
 */

import { StorageService } from '../services/storage';
import { OnboardingService } from '../services/onboarding';

const MIGRATION_KEY = '@gauge_profile_migrations';

interface MigrationStatus {
  measurementsMigration: boolean;
}

export const ProfileMigration = {
  /**
   * Check if a specific migration has already been run
   */
  async hasMigrationRun(migrationName: keyof MigrationStatus): Promise<boolean> {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const statusJson = await AsyncStorage.getItem(MIGRATION_KEY);
      if (!statusJson) return false;
      
      const status: MigrationStatus = JSON.parse(statusJson);
      return status[migrationName] === true;
    } catch (error) {
      console.error('[ProfileMigration] Failed to check migration status:', error);
      return false;
    }
  },

  /**
   * Mark a migration as completed
   */
  async markMigrationComplete(migrationName: keyof MigrationStatus): Promise<void> {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const statusJson = await AsyncStorage.getItem(MIGRATION_KEY);
      const status: MigrationStatus = statusJson ? JSON.parse(statusJson) : {};
      
      status[migrationName] = true;
      await AsyncStorage.setItem(MIGRATION_KEY, JSON.stringify(status));
      console.log(`[ProfileMigration] ✅ Migration "${migrationName}" marked as complete`);
    } catch (error) {
      console.error('[ProfileMigration] Failed to mark migration complete:', error);
    }
  },

  /**
   * Migrate measurements from onboarding state to user profile
   * 
   * This fixes the issue where measurements were entered during onboarding
   * but got lost when the profile was created by ShoeSizeScreen or StylePreferencesScreen
   */
  async migrateMeasurementsFromOnboarding(): Promise<void> {
    try {
      // Check if this migration has already been run
      const hasRun = await this.hasMigrationRun('measurementsMigration');
      if (hasRun) {
        console.log('[ProfileMigration] Measurements migration already completed, skipping');
        return;
      }

      console.log('[ProfileMigration] 🔄 Starting measurements migration...');

      // Get current profile
      const profile = await StorageService.getUserProfile();
      if (!profile) {
        console.log('[ProfileMigration] No profile found, skipping migration');
        await this.markMigrationComplete('measurementsMigration');
        return;
      }

      // Check if profile already has measurements
      if (profile.measurements) {
        console.log('[ProfileMigration] Profile already has measurements, skipping migration');
        await this.markMigrationComplete('measurementsMigration');
        return;
      }

      // Get measurements from onboarding state
      const onboardingState = await OnboardingService.getOnboardingState();
      if (!onboardingState.measurements) {
        console.log('[ProfileMigration] No measurements in onboarding state, skipping migration');
        await this.markMigrationComplete('measurementsMigration');
        return;
      }

      // Validate that we have the required measurement fields
      const m = onboardingState.measurements;
      const hasRequiredFields = m.chest && m.waist && m.neck && m.sleeve && m.shoulder && m.inseam;
      
      if (!hasRequiredFields) {
        console.warn('[ProfileMigration] ⚠️ Measurements in onboarding state are incomplete:', {
          hasChest: !!m.chest,
          hasWaist: !!m.waist,
          hasNeck: !!m.neck,
          hasSleeve: !!m.sleeve,
          hasShoulder: !!m.shoulder,
          hasInseam: !!m.inseam,
        });
        await this.markMigrationComplete('measurementsMigration');
        return;
      }

      // Migrate measurements to profile
      console.log('[ProfileMigration] 📦 Migrating measurements from onboarding state to profile...');
      console.log('[ProfileMigration] Measurements found:', {
        height: m.height,
        weight: m.weight,
        chest: m.chest,
        waist: m.waist,
        inseam: m.inseam,
        neck: m.neck,
        sleeve: m.sleeve,
        shoulder: m.shoulder,
      });

      profile.measurements = {
        ...onboardingState.measurements,
        preferredFit: onboardingState.measurements.preferredFit || 'regular',
        updatedAt: new Date().toISOString(),
      };

      profile.updatedAt = new Date().toISOString();
      
      await StorageService.saveUserProfile(profile);

      console.log('[ProfileMigration] ✅ Measurements successfully migrated to profile!');
      console.log('[ProfileMigration] Profile now has measurements:', !!profile.measurements);

      // Mark migration as complete
      await this.markMigrationComplete('measurementsMigration');

    } catch (error) {
      console.error('[ProfileMigration] ❌ Failed to migrate measurements:', error);
      // Don't mark as complete so it can retry next time
    }
  },

  /**
   * Run all pending migrations
   */
  async runAllMigrations(): Promise<void> {
    console.log('[ProfileMigration] 🚀 Checking for pending migrations...');
    
    try {
      // Run measurements migration
      await this.migrateMeasurementsFromOnboarding();

      console.log('[ProfileMigration] ✅ All migrations complete');
    } catch (error) {
      console.error('[ProfileMigration] ❌ Error running migrations:', error);
    }
  },
};

