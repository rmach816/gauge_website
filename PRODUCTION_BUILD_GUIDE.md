# Production Build Guide - GAUGE App

## Current Status

✅ **Project Setup Complete:**
- React version fixed (19.1.1 matches React Native 0.82.1)
- Git repository initialized
- EAS project linked (ID: 393435b7-6591-45c6-895d-1f9d5764b2a2)
- Production build profile configured (APK for easy testing)
- All assets in place

## Building Your Production APK

### Current Build Command
```bash
eas build --profile production --platform android
```

This command is currently running. When prompted:

1. **Keystore Generation (First Time Only)**
   - EAS will ask: "Generate a new Android Keystore?"
   - Answer: **Yes**
   - EAS will automatically create and manage your keystore securely

2. **Build Process**
   - Build will take **10-20 minutes**
   - You'll see build progress in the terminal
   - Build happens on Expo's servers (cloud build)

3. **Build Completion**
   - You'll receive a download link when build completes
   - Or visit: https://expo.dev/accounts/rmach816/projects/gauge/builds

### Important Notes

**Environment Variables:**
Currently using placeholder values from `eas.json`:
- `ANTHROPIC_API_KEY`: "production_key_here"
- `AMAZON_AFFILIATE_TAG`: "production_tag_here"  
- `NORDSTROM_AFFILIATE_ID`: "production_id_here"

**To use real API keys (recommended for testing):**

1. Set EAS secrets:
```bash
eas secret:create --scope project --name ANTHROPIC_API_KEY --value your_actual_key
eas secret:create --scope project --name AMAZON_AFFILIATE_TAG --value your_actual_tag
eas secret:create --scope project --name NORDSTROM_AFFILIATE_ID --value your_actual_id
```

2. Update `eas.json` production profile to use secrets:
```json
"env": {
  "ANTHROPIC_API_KEY": "@anthropic_api_key",
  "AMAZON_AFFILIATE_TAG": "@amazon_affiliate_tag",
  "NORDSTROM_AFFILIATE_ID": "@nordstrom_affiliate_id"
}
```

## Installing and Testing the APK

### After Build Completes:

1. **Download the APK**
   - Click the download link from EAS
   - Or visit your builds page

2. **Transfer to Android Device**
   - Use USB cable
   - Or upload to Google Drive/Dropbox and download on device
   - Or use: `adb install path/to/app.apk` if you have ADB set up

3. **Install on Device**
   - Enable "Install from Unknown Sources" in Android settings
   - Tap the APK file on your device
   - Follow installation prompts

4. **Test the App**
   - All features should work:
     ✅ Camera/Photo picker
     ✅ Style analysis with Claude API
     ✅ Shopping links
     ✅ Closet management
     ✅ History
     ✅ Premium features

## Build Profiles Available

1. **production** - Production build (currently configured as APK for testing)
   ```bash
   eas build --profile production --platform android
   ```

2. **preview** - Preview build (same as production, good for testing)
   ```bash
   eas build --profile preview --platform android
   ```

3. **development** - Development build with dev client
   ```bash
   eas build --profile development --platform android
   ```

## For App Store Submission

When ready for Play Store:
1. Change `eas.json` production profile:
   ```json
   "android": {
     "buildType": "app-bundle"  // Required for Play Store
   }
   ```

2. Build production bundle:
   ```bash
   eas build --profile production --platform android
   ```

3. Submit to Play Store:
   ```bash
   eas submit --platform android --profile production
   ```

## Monitoring Your Build

- **Terminal**: Watch build progress in real-time
- **Dashboard**: https://expo.dev/accounts/rmach816/projects/gauge/builds
- **Email**: You'll receive email notifications when build completes

## Troubleshooting

**Build fails?**
- Check build logs in EAS dashboard
- Verify all assets exist (icon.png, splash.png)
- Ensure environment variables are set correctly

**APK won't install?**
- Check Android version compatibility (requires Android 6.0+)
- Verify "Unknown Sources" is enabled
- Try downloading again (may be corrupted)

**App crashes on launch?**
- Check if API keys are set correctly
- Review crash logs (if CrashReporting is configured)
- Test in development build first to debug

## Next Steps

1. ✅ Wait for current build to complete
2. ⏳ Download APK when ready
3. ⏳ Install on Android device
4. ⏳ Test all features thoroughly
5. ⏳ Set up real API keys if needed
6. ⏳ Build for iOS when ready (`eas build --profile production --platform ios`)

---

**Current Build Status:** Running in background. Check terminal or EAS dashboard for progress.

