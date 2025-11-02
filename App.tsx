import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OfflineBanner } from './src/components/OfflineBanner';
import { CrashReportingService } from './src/services/crashReporting';

export default function App() {
  useEffect(() => {
    // Initialize crash reporting
    CrashReportingService.initialize();
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

