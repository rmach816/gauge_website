# EAS Build TypeScript Stripping Error - Workaround

## Issue
EAS build fails with:
```
Stripping types is currently unsupported for files under node_modules, for "node_modules/expo-image/src/index.ts"
```

## Root Cause
EAS automatically tries to strip TypeScript types during the build process, but it cannot process TypeScript files in `node_modules` directories.

## Solution

### Option 1: Use Local Build (Recommended for Development)
Instead of using EAS cloud builds, build locally:

```bash
# For Android
npx expo run:android

# For iOS  
npx expo run:ios
```

### Option 2: Wait for EAS Update
This is a known limitation in EAS. The Expo team is working on a fix. You can:
- Monitor the Expo GitHub issues
- Use local builds in the meantime
- Try building with `--no-bundler` flag (if available)

### Option 3: Temporary Workaround
The error occurs during the config reading phase. The build might still work if you:
1. Ensure `tsconfig.json` properly excludes `node_modules` (✅ Already done)
2. Ensure `.easignore` excludes TypeScript files in node_modules (✅ Already done)
3. Try building with the `--local` flag if you have the build environment set up

## Current Configuration Status
- ✅ `tsconfig.json` excludes `node_modules`
- ✅ `.easignore` excludes TypeScript files in node_modules
- ✅ `metro.config.js` configured
- ✅ `app.config.js` properly formatted

## Next Steps
1. Try a local build first: `npx expo run:android`
2. If local build works, use that for development
3. For production builds, wait for EAS fix or use alternative build methods

