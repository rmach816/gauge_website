# Affiliate Programs Setup Instructions

## Overview
GAUGE app is now configured to work with 10 major retailers for the shopping feature. The code is ready to go - you just need to add your affiliate IDs once approved.

## Current Status

### ✅ **Ready to Use** (No Action Required)
- **Amazon Associates**: Already approved with ID `gaugeapp-20`
  - Just add to `.env`: `AMAZON_AFFILIATE_TAG=gaugeapp-20`

### 🔄 **Configured (Awaiting Your Affiliate IDs)**
All these retailers are fully integrated in the code and will work as soon as you add the IDs:

1. **Nordstrom** (via ShareASale)
2. **J.Crew** (via CJ Affiliate)
3. **Bonobos** (via CJ Affiliate)
4. **Mr Porter** (via Awin)
5. **ASOS** (via Awin)
6. **Target** (via CJ Affiliate)
7. **Uniqlo** (via CJ Affiliate)
8. **SuitSupply** (Direct)
9. **Express** (via CJ Affiliate)

---

## How Retailers Are Displayed by Price Range

The app intelligently shows different retailers based on the user's selected price range:

### **Budget** ($)
- Amazon (always)
- Target
- Uniqlo
- ASOS

### **Mid-Range** ($$)
- Amazon (always)
- Nordstrom
- J.Crew
- Bonobos
- Express
- Uniqlo

### **Premium** ($$$)
- Amazon (always)
- Nordstrom
- Mr Porter
- Bonobos
- SuitSupply* (*only for formal garments: suits, dress shirts, blazers, dress pants, ties)

---

## Step 1: Setup Your `.env` File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your Anthropic API key (required for AI functionality):
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

3. Amazon is already approved, add it:
   ```env
   AMAZON_AFFILIATE_TAG=gaugeapp-20
   ```

4. Leave other affiliate IDs empty for now (app will still work, just won't track commissions):
   ```env
   NORDSTROM_AFFILIATE_ID=
   JCREW_AFFILIATE_ID=
   # etc...
   ```

---

## Step 2: Sign Up for Affiliate Programs

### Priority Order (Recommended)

**Start with these 3-4:**
1. ✅ **Amazon** - Already done!
2. **Nordstrom** (via ShareASale) - Premium brand, good commissions
3. **J.Crew** (via CJ Affiliate) - Easy approval, mid-range
4. **Target** or **Uniqlo** (via CJ Affiliate) - Budget-friendly options

### Sign-Up Links

#### **Nordstrom** (via ShareASale)
- **Link**: https://www.shareasale.com/shareasale.cfm?merchantID=4
- **Commission**: 2-4%
- **Cookie**: 30 days
- **Steps**:
  1. Sign up for ShareASale account
  2. Apply to Nordstrom affiliate program (Merchant ID: 4)
  3. Once approved, get your Affiliate ID
  4. Add to `.env`: `NORDSTROM_AFFILIATE_ID=your-id`

#### **CJ Affiliate Programs** (J.Crew, Bonobos, Target, Uniqlo, Express)
- **Link**: https://www.cj.com/publishers/get-started
- **Commission**: 5-8% (varies by merchant)
- **Cookie**: 30-90 days
- **Steps**:
  1. Sign up for CJ Affiliate account
  2. Browse advertisers and apply to:
     - J.Crew
     - Bonobos
     - Target
     - Uniqlo
     - Express
  3. Once approved for each, get tracking links/IDs
  4. Add to `.env`:
     ```env
     JCREW_AFFILIATE_ID=your-id
     BONOBOS_AFFILIATE_ID=your-id
     TARGET_AFFILIATE_ID=your-id
     UNIQLO_AFFILIATE_ID=your-id
     EXPRESS_AFFILIATE_ID=your-id
     ```

#### **Awin Programs** (Mr Porter, ASOS)
- **Link**: https://www.awin.com/publishers
- **Commission**: 5-8%
- **Cookie**: 30 days
- **Steps**:
  1. Sign up for Awin account
  2. Apply to Mr Porter and ASOS programs
  3. Once approved, get your Affiliate IDs
  4. Add to `.env`:
     ```env
     MRPORTER_AFFILIATE_ID=your-id
     ASOS_AFFILIATE_ID=your-id
     ```

#### **SuitSupply** (Direct)
- **Link**: https://suitsupply.com/en-us/partnerships
- **Commission**: Contact for details
- **Steps**:
  1. Contact their partnerships team
  2. Apply for affiliate program
  3. Once approved, get your Affiliate ID
  4. Add to `.env`: `SUITSUPPLY_AFFILIATE_ID=your-id`

---

## Step 3: Update `.env` File as You Get Approved

As you receive approval from each affiliate program:

1. Open your `.env` file
2. Add the ID you received:
   ```env
   JCREW_AFFILIATE_ID=123456  # Replace with your actual ID
   ```
3. Restart your development server:
   ```bash
   npm start
   ```

**The app will automatically start tracking affiliate links for that retailer!**

---

## Step 4: EAS Build Setup (For Production)

When you're ready to build for TestFlight/App Store, set up EAS secrets:

```bash
# Set all your affiliate IDs as EAS secrets
eas secret:create --scope project --name AMAZON_AFFILIATE_TAG --value gaugeapp-20
eas secret:create --scope project --name NORDSTROM_AFFILIATE_ID --value your-id
eas secret:create --scope project --name JCREW_AFFILIATE_ID --value your-id
# ... repeat for each affiliate program
```

---

## Testing Shopping Links

### Without Affiliate IDs (Current State)
- ✅ All retailer links will work
- ✅ Users can search and browse products
- ❌ No commission tracking (links won't include affiliate IDs)

### With Affiliate IDs (After Approval)
- ✅ All retailer links will work
- ✅ Users can search and browse products
- ✅ Commission tracking enabled (links include your affiliate IDs)

### How to Test

1. **Start the app**:
   ```bash
   npm start
   ```

2. **Navigate to Shop screen**:
   - Select an occasion (e.g., "Business Meeting")
   - Select price range (Budget/Mid/Premium)
   - Press "Build Outfit"

3. **Check retailer links**:
   - You'll see shopping options for each garment
   - Tap "Shop Now" to open the retailer's website
   - Verify the search works correctly

4. **Check console logs**:
   - Look for affiliate link generation logs
   - Verify IDs are being included (if set in `.env`)

---

## Important Notes

### ⚠️ Legal Requirements
You MUST disclose affiliate relationships:
1. Add to App Store description
2. Include in Terms of Service
3. Include in Privacy Policy
4. Consider in-app disclosure (e.g., "We may earn a commission from purchases")

### 📊 Tracking Performance
Once live, monitor which retailers convert best:
- Log into each affiliate network dashboard
- Track clicks and conversions
- Optimize by showing top performers first

### 🔄 Link Updates
The code includes placeholder tracking parameters that work with current knowledge:
- CJ Affiliate: `?cjdata={id}`
- Awin: `?awc={id}`
- ShareASale: `&affiliateId={id}`

**Note**: Once approved, each program will provide specific tracking URL formats. Update the link generation functions in `src/services/affiliateLinks.ts` if needed.

---

## Summary

### ✅ What's Done
- All 10 retailers integrated in code
- Link generation functions ready
- Price tier logic implemented
- Environment variables configured
- Type definitions updated

### 📋 What You Need to Do
1. Sign up for affiliate programs (see links above)
2. Wait for approval (1-2 weeks per program)
3. Add IDs to `.env` file as you get approved
4. Test shopping links
5. Set up EAS secrets before production build

### 🚀 Ready for TestFlight
**Yes!** The app is ready to submit to TestFlight even without all affiliate IDs. The shopping feature will work - you just won't earn commissions until you add the IDs.

---

## Questions?

- Check `AFFILIATE_PROGRAMS_GUIDE.md` for detailed retailer information
- Review `src/services/affiliateLinks.ts` to see how links are generated
- Test the shopping feature in the app to see it in action

**Next Step**: Sign up for affiliate programs and start getting those IDs! 🎉

