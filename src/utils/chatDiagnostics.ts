/**
 * Chat Diagnostics Tool
 * Helps identify why AI chat doesn't have access to measurements, style preferences, or shoe size
 * 
 * Usage: Call runChatDiagnostics() from ChatScreen before sending a message
 */

import { StorageService } from '../services/storage';
import { UserProfile } from '../types';

export interface DiagnosticReport {
  timestamp: string;
  profileExists: boolean;
  profileId?: string;
  measurementsExist: boolean;
  measurementsValid: boolean;
  measurementsDetails?: {
    height?: number;
    weight?: number;
    chest?: number;
    waist?: number;
    neck?: number;
    sleeve?: number;
    shoulder?: number;
    inseam?: number;
    preferredFit?: string;
  };
  shoeSizeExists: boolean;
  shoeSize?: string;
  stylePreferencesExist: boolean;
  stylePreferences?: string[];
  favoriteOccasionsExist: boolean;
  favoriteOccasions?: string[];
  lastNameExists: boolean;
  lastName?: string;
  rawProfile: UserProfile | null;
  storageErrors: string[];
  recommendations: string[];
}

/**
 * Run comprehensive diagnostics on user profile data for AI chat
 */
export async function runChatDiagnostics(): Promise<DiagnosticReport> {
  const report: DiagnosticReport = {
    timestamp: new Date().toISOString(),
    profileExists: false,
    measurementsExist: false,
    measurementsValid: false,
    shoeSizeExists: false,
    stylePreferencesExist: false,
    favoriteOccasionsExist: false,
    lastNameExists: false,
    rawProfile: null,
    storageErrors: [],
    recommendations: [],
  };

  try {
    // Step 1: Try to load profile from storage
    console.log('═══════════════════════════════════════════════════════════');
    console.log('[ChatDiagnostics] Starting diagnostic check...');
    console.log('═══════════════════════════════════════════════════════════');
    
    const profile = await StorageService.getUserProfile();
    report.rawProfile = profile;

    if (!profile) {
      console.error('[ChatDiagnostics] ❌ ERROR: No user profile found in storage!');
      report.storageErrors.push('Profile not found in storage');
      report.recommendations.push('User needs to complete onboarding or re-enter profile data');
      return report;
    }

    report.profileExists = true;
    report.profileId = profile.id;
    console.log(`[ChatDiagnostics] ✅ Profile found: ${profile.id}`);

    // Step 2: Check measurements
    if (profile.measurements) {
      report.measurementsExist = true;
      report.measurementsDetails = {
        height: profile.measurements.height,
        weight: profile.measurements.weight,
        chest: profile.measurements.chest,
        waist: profile.measurements.waist,
        neck: profile.measurements.neck,
        sleeve: profile.measurements.sleeve,
        shoulder: profile.measurements.shoulder,
        inseam: profile.measurements.inseam,
        preferredFit: profile.measurements.preferredFit,
      };

      // Validate measurements
      const requiredFields = ['chest', 'waist', 'neck', 'sleeve', 'shoulder', 'inseam'];
      const missingFields = requiredFields.filter(
        field => !profile.measurements![field as keyof typeof profile.measurements]
      );

      if (missingFields.length === 0) {
        report.measurementsValid = true;
        console.log('[ChatDiagnostics] ✅ All required measurements present:');
        console.log(`  - Height: ${profile.measurements.height}" (${Math.floor(profile.measurements.height / 12)}' ${profile.measurements.height % 12}")`);
        console.log(`  - Weight: ${profile.measurements.weight} lbs`);
        console.log(`  - Chest: ${profile.measurements.chest}"`);
        console.log(`  - Waist: ${profile.measurements.waist}"`);
        console.log(`  - Neck: ${profile.measurements.neck}"`);
        console.log(`  - Sleeve: ${profile.measurements.sleeve}"`);
        console.log(`  - Shoulder: ${profile.measurements.shoulder}"`);
        console.log(`  - Inseam: ${profile.measurements.inseam}"`);
        console.log(`  - Preferred Fit: ${profile.measurements.preferredFit}`);
      } else {
        console.error(`[ChatDiagnostics] ⚠️  WARNING: Missing measurement fields: ${missingFields.join(', ')}`);
        report.storageErrors.push(`Missing measurements: ${missingFields.join(', ')}`);
        report.recommendations.push('User needs to complete missing measurements');
      }
    } else {
      console.error('[ChatDiagnostics] ❌ ERROR: No measurements object in profile!');
      report.storageErrors.push('Measurements object is null or undefined');
      report.recommendations.push('User needs to enter measurements in profile settings');
    }

    // Step 3: Check shoe size
    if (profile.shoeSize) {
      report.shoeSizeExists = true;
      report.shoeSize = profile.shoeSize;
      console.log(`[ChatDiagnostics] ✅ Shoe size present: ${profile.shoeSize}`);
    } else {
      console.warn('[ChatDiagnostics] ⚠️  WARNING: No shoe size in profile');
      report.storageErrors.push('Shoe size missing');
      report.recommendations.push('User should add shoe size for shoe recommendations');
    }

    // Step 4: Check style preferences
    if (profile.stylePreference && profile.stylePreference.length > 0) {
      report.stylePreferencesExist = true;
      report.stylePreferences = profile.stylePreference;
      console.log(`[ChatDiagnostics] ✅ Style preferences present: ${profile.stylePreference.join(', ')}`);
    } else {
      console.warn('[ChatDiagnostics] ⚠️  WARNING: No style preferences in profile');
      report.storageErrors.push('Style preferences missing or empty');
      report.recommendations.push('User should select style preferences');
    }

    // Step 5: Check favorite occasions
    if (profile.favoriteOccasions && profile.favoriteOccasions.length > 0) {
      report.favoriteOccasionsExist = true;
      report.favoriteOccasions = profile.favoriteOccasions;
      console.log(`[ChatDiagnostics] ✅ Favorite occasions present: ${profile.favoriteOccasions.join(', ')}`);
    } else {
      console.warn('[ChatDiagnostics] ⚠️  WARNING: No favorite occasions in profile');
      report.storageErrors.push('Favorite occasions missing or empty');
      report.recommendations.push('User should select favorite occasions');
    }

    // Step 6: Check last name
    if (profile.lastName) {
      report.lastNameExists = true;
      report.lastName = profile.lastName;
      console.log(`[ChatDiagnostics] ✅ Last name present: ${profile.lastName}`);
    } else {
      console.warn('[ChatDiagnostics] ⚠️  INFO: No last name (optional)');
    }

    // Step 7: Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('[ChatDiagnostics] DIAGNOSTIC SUMMARY:');
    console.log(`  Profile: ${report.profileExists ? '✅' : '❌'}`);
    console.log(`  Measurements: ${report.measurementsValid ? '✅' : report.measurementsExist ? '⚠️  Incomplete' : '❌'}`);
    console.log(`  Shoe Size: ${report.shoeSizeExists ? '✅' : '❌'}`);
    console.log(`  Style Preferences: ${report.stylePreferencesExist ? '✅' : '❌'}`);
    console.log(`  Favorite Occasions: ${report.favoriteOccasionsExist ? '✅' : '❌'}`);
    console.log(`  Last Name: ${report.lastNameExists ? '✅' : '⚠️  Optional'}`);
    
    if (report.storageErrors.length > 0) {
      console.log('\n[ChatDiagnostics] ERRORS/WARNINGS:');
      report.storageErrors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n[ChatDiagnostics] RECOMMENDATIONS:');
      report.recommendations.forEach(rec => console.log(`  - ${rec}`));
    }
    console.log('═══════════════════════════════════════════════════════════');

    return report;
  } catch (error) {
    console.error('[ChatDiagnostics] ❌ FATAL ERROR during diagnostics:', error);
    report.storageErrors.push(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    report.recommendations.push('Check storage service and AsyncStorage permissions');
    return report;
  }
}

/**
 * Format diagnostic report as user-friendly message
 */
export function formatDiagnosticReport(report: DiagnosticReport): string {
  if (!report.profileExists) {
    return 'No profile found. Please complete your profile in Settings.';
  }

  const missing: string[] = [];
  
  if (!report.measurementsValid) {
    missing.push('measurements');
  }
  if (!report.shoeSizeExists) {
    missing.push('shoe size');
  }
  if (!report.stylePreferencesExist) {
    missing.push('style preferences');
  }
  if (!report.favoriteOccasionsExist) {
    missing.push('favorite occasions');
  }

  if (missing.length === 0) {
    return 'All profile data is complete!';
  }

  return `Missing or incomplete: ${missing.join(', ')}. Please update your profile in Settings for better recommendations.`;
}

/**
 * Quick check - returns true if profile has all required data for AI chat
 */
export async function isProfileCompleteForChat(): Promise<boolean> {
  const report = await runChatDiagnostics();
  return (
    report.profileExists &&
    report.measurementsValid &&
    report.shoeSizeExists &&
    report.stylePreferencesExist
  );
}

