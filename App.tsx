import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OfflineBanner } from './src/components/OfflineBanner';
import { CrashReportingService } from './src/services/crashReporting';
import { ProfileMigration } from './src/utils/profileMigration';
// Import contrast test to run in development mode
import './src/utils/contrastTest';

export default function App() {
  useEffect(() => {
    // Initialize crash reporting
    CrashReportingService.initialize();
    
    // Run profile migrations (recovers measurements from onboarding state if needed)
    ProfileMigration.runAllMigrations();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OfflineBanner />
        <AppNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

