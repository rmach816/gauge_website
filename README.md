# GAUGE - Men's Style Assistant

An AI-powered mobile app for men's style matching, fit recommendations, and shopping assistance built with React Native and Expo.

## Features

- **Instant Match Check** - Photo → AI analysis → Style feedback (✅⚠️❌)
- **Measurement-Based Sizing** - Body measurements → Size recommendations per garment
- **Occasion-Based Outfit Builder** - Select occasion/style → Complete outfit with shopping links
- **Smart Closet** - Save wardrobe items → Match with new purchases
- **Shopping Integration** - Affiliate links to Amazon, Nordstrom, J.Crew, Bonobos
- **Freemium Model** - 10 free checks → $6.99/mo unlimited + measurements

## Tech Stack

- **Expo SDK**: ~54.0.0
- **React Native**: 0.81.5
- **React**: 19.2.0
- **TypeScript**: ^5.9.3
- **Claude AI**: Anthropic SDK for style analysis

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```
ANTHROPIC_API_KEY=your_claude_api_key_here
AMAZON_AFFILIATE_TAG=your_amazon_tag
NORDSTROM_AFFILIATE_ID=your_nordstrom_id
```

### 3. Add Assets

Place the following files in the `assets/` folder:
- `icon.png` - App icon (1024x1024px)
- `splash.png` - Splash screen image

### 4. Run the App

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
gauge/
├── App.tsx                 # App entry point
├── index.js                # Root component registration
├── app.json                # Expo configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── babel.config.js         # Babel configuration
├── .env                    # Environment variables (create this)
│
├── src/
│   ├── types/             # TypeScript type definitions
│   ├── config/             # API and app configuration
│   ├── utils/              # Constants, formatting helpers
│   ├── services/           # Business logic services
│   ├── components/         # Reusable UI components
│   ├── screens/            # Screen components
│   └── navigation/         # Navigation setup
│
└── assets/                 # App icons and splash screens
```

## Development Notes

### Expo SDK 54 Features
- New Architecture enabled by default (significant performance improvements)
- React 19.2 included
- Precompiled React Native for iOS (10x faster builds)
- Android 16 & iOS 26 support

### Important
- Reanimated plugin is automatically handled by babel-preset-expo - do NOT add manually
- All code is compatible with New Architecture
- Use `react-native-safe-area-context` for safe areas

## Testing Checklist

- [ ] Photo capture (camera + library)
- [ ] Claude API integration
- [ ] Match rating display
- [ ] Size recommendations
- [ ] Shopping links open correctly
- [ ] Premium gate at 10 checks
- [ ] Measurements save/load
- [ ] Closet add/delete
- [ ] History persistence
- [ ] All navigation flows

## API Costs

- Estimated cost: ~$0.016 per style check
- Images are automatically compressed before sending
- Monitor usage in production

## Premium Features

- Free tier: 10 checks
- Premium: $6.99/month for unlimited checks + measurements

## License

Private - All rights reserved

