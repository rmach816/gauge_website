# GAUGE - Quick Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Expo CLI** (optional, recommended)
4. **Anthropic API Key** (for Claude AI)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Create a `.env` file in the root directory:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
AMAZON_AFFILIATE_TAG=gaugeapp-20
NORDSTROM_AFFILIATE_ID=your_nordstrom_affiliate_id
```

**Important**: 
- Get your Anthropic API key from: https://console.anthropic.com/
- ✅ Amazon Associates ID is set: `gaugeapp-20` (already approved)
- Nordstrom affiliate ID can be set up later if not available now

### 3. Add App Assets

You need to add two image files to the `assets/` folder:

- **icon.png** - App icon (1024x1024px recommended)
  - Use any app icon generator or design tool
  - For now, you can use a placeholder

- **splash.png** - Splash screen (recommended: 1284x2778px)
  - Use Expo's splash screen generator or create manually
  - For now, you can use a placeholder

### 4. Start Development Server

```bash
npm start
```

This will:
- Start the Expo development server
- Open Expo DevTools in your browser
- Show a QR code for testing on physical devices

### 5. Run on Device/Emulator

**iOS Simulator** (Mac only):
```bash
npm run ios
```

**Android Emulator**:
```bash
npm run android
```

**Physical Device**:
- Install Expo Go app from App Store/Play Store
- Scan QR code from terminal/browser

## Testing the App

### First Run Checklist

1. ✅ App launches without errors
2. ✅ Home screen displays correctly
3. ✅ Can navigate between tabs
4. ✅ Photo capture works (camera/library)
5. ✅ Profile screen loads measurements form
6. ✅ Can add items to closet

### Testing Style Analysis

1. Take/select a photo of clothing
2. Click "Check My Style"
3. Verify API call works (check console for errors)
4. View results screen
5. Check shopping links open correctly

### Testing Premium Features

1. Use all 10 free checks
2. Verify paywall appears
3. Test premium activation (test mode)
4. Verify unlimited checks work

## Common Issues

### Issue: "API key not configured"
**Solution**: Check your `.env` file exists and has the correct variable name

### Issue: "Module not found: @env"
**Solution**: 
- Restart the development server
- Clear cache: `npx expo start -c`
- Verify `react-native-dotenv` is installed

### Issue: Images not loading
**Solution**: 
- Ensure assets folder has icon.png and splash.png
- Check app.json paths are correct

### Issue: Navigation errors
**Solution**: 
- Ensure all navigation dependencies are installed
- Try: `npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs`

## Next Steps

1. **Add Real Assets**: Replace placeholder icon/splash images
2. **Configure Affiliates**: Set up real affiliate accounts
3. **Test Payment**: Integrate real payment provider (RevenueCat, Stripe)
4. **Polish UI**: Customize colors, fonts, spacing
5. **Add Analytics**: Integrate analytics for user behavior
6. **Build for Production**: Prepare for App Store/Play Store

## Development Notes

- The app uses Expo SDK 54 with React Native 0.81.5
- New Architecture is enabled by default for better performance
- All code is TypeScript with strict type checking
- API calls use Claude Sonnet 4.5 model

## Support

For issues or questions, refer to:
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Docs](https://reactnavigation.org/)
- [Anthropic API Docs](https://docs.anthropic.com/)

