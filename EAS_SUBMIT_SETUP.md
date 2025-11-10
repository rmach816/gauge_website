# EAS Submit Setup for TestFlight

## Quick Setup

Edit `eas.json` and replace these values in the `submit.production.ios` section:

```json
"ios": {
  "appleId": "your-email@example.com",           // Your Apple Developer account email
  "ascAppId": "1234567890",                      // App Store Connect App ID (numeric only)
  "appleTeamId": "ABC123DEF4"                    // Apple Team ID (10 uppercase letters/digits)
}
```

## Where to Find These Values:

### 1. Apple ID (`appleId`)
- Your Apple Developer account email address
- Example: `john.doe@example.com`

### 2. App Store Connect App ID (`ascAppId`)
- Go to: https://appstoreconnect.apple.com
- Click "My Apps" → Select your app
- Click "App Information"
- Find "Apple ID" (it's a numeric ID like `1234567890`)
- **Important**: Only digits, no letters or dashes

### 3. Apple Team ID (`appleTeamId`)
- Go to: https://developer.apple.com/account
- Click "Membership" in the sidebar
- Find "Team ID" (10 characters, uppercase letters/numbers)
- Example: `ABC123DEF4`
- **Important**: Must be exactly 10 uppercase letters/digits

## Alternative: Interactive Mode

If you don't want to hardcode values, you can run:

```bash
eas submit --platform ios
```

EAS will prompt you for these values interactively.

## Using EAS Secrets (Recommended for Teams)

Store values securely:

```bash
eas secret:create --scope project --name APPLE_ID --value "your-email@example.com"
eas secret:create --scope project --name ASC_APP_ID --value "1234567890"
eas secret:create --scope project --name APPLE_TEAM_ID --value "ABC123DEF4"
```

Then update `eas.json` to use:
```json
"appleId": "${APPLE_ID}",
"ascAppId": "${ASC_APP_ID}",
"appleTeamId": "${APPLE_TEAM_ID}"
```

## Commands

### Build and Submit:
```bash
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

### Or Build & Auto-Submit:
```bash
eas build --platform ios --profile production --auto-submit
```

