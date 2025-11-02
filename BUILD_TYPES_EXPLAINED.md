# Build Types Explained - Expo Go vs Development Build vs Production

## Important: Your App CANNOT Use Expo Go ❌

**Expo Go** is NOT a build type - it's a generic app from the app stores that has **limited native module support**.

Your GAUGE app uses these native modules that **may not work in Expo Go**:
- `expo-image-picker` (camera/photo library)
- `expo-image-manipulator` (image compression)
- `expo-file-system` (file operations)
- `@react-native-community/netinfo` (network detection)

## What You Actually Need for Testing

### ✅ Option 1: Development Build (RECOMMENDED for Testing)
**What it is:**
- Custom-built app with ALL your native dependencies
- Still allows hot reloading and fast refresh
- Perfect for real device testing during development
- Can test camera, file system, network detection, etc.

**How to build:**
```bash
# iOS Development Build
eas build --profile development --platform ios

# Android Development Build  
eas build --profile development --platform android
```

**After building:**
1. Install the development build on your device
2. Run `npm start` or `expo start --dev-client`
3. Scan QR code with your development build app (NOT Expo Go)
4. You'll get hot reloading + all native features working

### ✅ Option 2: Preview Build (For Testing Without Dev Tools)
**What it is:**
- Standalone app (APK/IPA) for testing
- No development tools (no hot reload)
- Simulates production experience
- Good for final testing before release

**How to build:**
```bash
# iOS Preview Build
eas build --profile preview --platform ios

# Android Preview Build
eas build --profile preview --platform android
```

**After building:**
- Install APK/IPA on device
- Test like a real user would
- Report bugs, test performance

### ✅ Option 3: Production Build (For App Stores)
**What it is:**
- Final build for App Store / Play Store
- Optimized, no dev tools
- Production environment variables
- Ready for submission

**How to build:**
```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

## Comparison Table

| Feature | Expo Go | Development Build | Preview Build | Production Build |
|---------|---------|-------------------|---------------|------------------|
| Native modules | ❌ Limited | ✅ All | ✅ All | ✅ All |
| Hot reloading | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| Camera/Photos | ⚠️ Maybe | ✅ Yes | ✅ Yes | ✅ Yes |
| File system | ⚠️ Maybe | ✅ Yes | ✅ Yes | ✅ Yes |
| Network detection | ⚠️ Maybe | ✅ Yes | ✅ Yes | ✅ Yes |
| Dev tools | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| App Store ready | ❌ No | ❌ No | ❌ No | ✅ Yes |
| Use case | Quick tests only | Daily development | Final testing | Release |

## For Real Testing: Use Development Build

**Workflow:**
1. **First time:** Build development build (takes ~10-20 minutes)
   ```bash
   eas build --profile development --platform ios
   ```
   
2. **Install** the development build on your device

3. **Daily development:**
   ```bash
   npm start
   # Or: expo start --dev-client
   ```
   
4. **Open** your development build app (not Expo Go)

5. **Scan** QR code - app reloads instantly with hot reloading

6. **Test** camera, photo picking, file operations, everything works!

## Why Not Expo Go?

Expo Go only includes modules from the Expo SDK that are pre-built. Your app uses:
- Custom native modules
- Third-party native libraries
- Native plugins

These require a **custom build** - either Development or Production.

## Recommendation

**For your workflow:**
1. ✅ Build **Development Build** once (iOS and/or Android)
2. ✅ Use it daily for testing with hot reload
3. ✅ Build **Preview Build** before major releases for final testing
4. ✅ Build **Production Build** when ready for app stores

Your `eas.json` already has all three profiles configured! ✅

