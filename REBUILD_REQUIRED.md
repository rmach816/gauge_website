# Rebuild Required - Native Modules

## Why Another Rebuild?

The Android build you just completed (build ID: `a7ae31cc-e15a-419d-b222-5147f84c2177`) was started **BEFORE** we installed these packages:

1. ✅ `expo-linear-gradient` - Added to package.json
2. ✅ `expo-device` - Added to package.json  
3. ✅ `expo-constants` - Added to package.json

## Native Modules Require Rebuild

These are **native modules** - they need to be compiled into the native Android app binary. Metro bundler can't resolve them because they're not in your current build.

## Solution: Rebuild Android Development Build

```bash
eas build --profile development --platform android
```

This new build will include:
- ✅ `expo-linear-gradient` (for gradients in ChatScreen, MessageBubble, GoldButton, etc.)
- ✅ `expo-device` (for device performance detection)
- ✅ `expo-constants` (for SettingsScreen app version)

## After Rebuild

1. Install the new build on your device
2. Restart Metro with cache cleared:
   ```bash
   npx expo start --clear
   ```
3. The app should work!

## Why This Happens

When you add native modules to an Expo project:
- JavaScript code can be hot-reloaded
- **Native code must be rebuilt** - it's compiled into the app binary

This is why you need a new build after adding native dependencies.

