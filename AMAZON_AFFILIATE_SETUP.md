# Amazon Associates Setup - Complete ✅

## Your Amazon Associates Account

**Status:** ✅ Approved  
**Associate ID:** `gaugeapp-20`  
**Account Holder:** Richard Machemehl

## Integration Status

Your Amazon Associates ID has been integrated into the GAUGE app. All Amazon shopping links will now include your affiliate tracking.

## Setup Instructions

### For Local Development

1. **Create `.env` file** (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. **Add your Amazon Associate ID** to `.env`:
   ```env
   AMAZON_AFFILIATE_TAG=gaugeapp-20
   ```

3. **Restart your development server**:
   ```bash
   npx expo start -c
   ```

### For Production Builds (EAS)

Your affiliate tag needs to be set as an EAS secret for production builds:

1. **Set the EAS secret**:
   ```bash
   eas secret:create --scope project --name amazon_affiliate_tag --value gaugeapp-20
   ```

   **Note:** The secret name in `eas.json` uses underscores (`amazon_affiliate_tag`), but EAS automatically converts hyphens to underscores.

2. **Verify the secret**:
   ```bash
   eas secret:list
   ```

3. **Build with the secret**:
   ```bash
   eas build --profile production --platform all
   ```

## How It Works

When users click on Amazon shopping links in the app, the links will automatically include your Associate ID:

```
https://www.amazon.com/s?k=men's+blue+shirt&tag=gaugeapp-20
```

## Commission Details

- **Commission Rate:** 1-10% depending on product category
- **Cookie Window:** 24 hours (user must purchase within 24 hours of clicking)
- **Payment:** Monthly payments via direct deposit or Amazon gift card
- **Minimum Payout:** $10

## Next Steps

1. ✅ Amazon Associates - **COMPLETE** (ID: `gaugeapp-20`)
2. ⏳ Nordstrom Affiliate - Apply at https://www.shareasale.com/shareasale.cfm?merchantID=4
3. ⏳ Test affiliate links in the app to ensure tracking works
4. ⏳ Monitor your Amazon Associates dashboard for clicks and conversions

## Testing

To test that affiliate links are working:

1. Generate an outfit or shopping recommendation in the app
2. Click on an Amazon shopping link
3. Check the URL - it should contain `tag=gaugeapp-20`
4. Make a test purchase (optional, to verify tracking)

## Important Notes

⚠️ **Account Review:** Your account will be reviewed after you've referred qualified sales. Make sure to:
- Follow Amazon Associates Operating Agreement
- Disclose affiliate relationships in your app (already done in Settings)
- Don't use misleading or deceptive practices
- Ensure your app provides value to users

📝 **Disclosure:** The app already includes affiliate disclosure in:
- Settings Screen
- Privacy Policy
- Terms of Service

## Support

- **Amazon Associates Central:** https://affiliate-program.amazon.com/
- **Associate Support:** Available in your Associates Central dashboard
- **Operating Agreement:** Review at https://affiliate-program.amazon.com/help/operating/agreement

---

**Last Updated:** Amazon Associates account approved with ID `gaugeapp-20`

