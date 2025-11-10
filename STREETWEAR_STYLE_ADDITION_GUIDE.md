# Adding "Street" Style Preference - Build Guide

## Overview
Adding "Street/Streetwear" as a 5th style option to capture urban, casual, sneaker culture aesthetic.

---

## 1. Image Requirements

### ChatGPT Image Prompt:
```
Create a professional product-style photo of a complete streetwear outfit laid flat on a clean white background. The outfit should include:

- A black or charcoal gray hoodie (front view, laid flat)
- Dark wash or black slim-fit jeans
- White or cream-colored sneakers (Jordan 1 style or similar classic streetwear sneakers)
- A simple black or navy baseball cap placed near the top
- Optional: A simple silver chain or minimalist watch as an accessory

Style requirements:
- Clean, minimal aesthetic (not overly branded or loud)
- Items should be arranged to show a complete outfit
- Professional product photography style
- Bright, even lighting with soft shadows
- White or very light gray background
- High quality, crisp details
- The overall vibe should be "elevated streetwear" - casual but intentional and stylish

Composition: Items should be neatly arranged to form a cohesive outfit layout, similar to how a clothing store would display an outfit.
```

### Image Specifications:
- **Aspect Ratio**: Same as other outfit images (check existing images, likely square or 3:4)
- **File Name**: `street-outfit.png`
- **Location**: `/assets/street-outfit.png`
- **Format**: PNG (transparent or white background)

---

## 2. Code Changes

### Step 1: Update Type Definition
**File**: `src/types/index.ts`

**Location**: Around line 14-19 (StylePreference enum)

**Change**:
```typescript
export enum StylePreference {
  CONSERVATIVE = 'Conservative',
  MODERN = 'Modern',
  STYLISH = 'Stylish',
  FASHION_FORWARD = 'Fashion-Forward',
  STREET = 'Street',  // ADD THIS LINE
}
```

**Why**: Defines the new style option at the type level

---

### Step 2: Add Style Option to UI
**File**: `src/screens/onboarding/StylePreferencesScreen.tsx`

**Location**: Around line 39-68 (STYLE_OPTIONS array)

**Change**: Add this object to the STYLE_OPTIONS array (after FASHION_FORWARD):
```typescript
  {
    preference: StylePreference.STREET,
    name: 'Street',
    description: 'Urban, casual, sneaker culture',
    emoji: '👟',
    image: require('../../../assets/street-outfit.png'),
  },
```

**Why**: Adds the UI option to the style preferences screen

---

## 3. Testing Checklist

### Before Testing
- [ ] Image file `street-outfit.png` is placed in `/assets/` folder
- [ ] Both code files are saved
- [ ] Development server is restarted (if needed)

### Onboarding Flow Testing
1. **New User Experience**
   - [ ] Start fresh onboarding (clear app data if needed)
   - [ ] Navigate to Style Preferences screen
   - [ ] Verify "Street" option appears with image and emoji
   - [ ] Select "Street" - verify it highlights correctly
   - [ ] Deselect "Street" - verify it unhighlights correctly
   - [ ] Select multiple styles including "Street" - verify multi-select works
   - [ ] Continue through onboarding - verify no errors
   - [ ] Complete onboarding successfully

2. **Existing User Experience**
   - [ ] Go to Settings → Style Preferences (as existing user)
   - [ ] Verify "Street" option appears
   - [ ] Select/deselect "Street" - verify it saves correctly
   - [ ] Go back to Settings - verify "Street" is shown in "Current: Street" if selected

3. **Profile Integration**
   - [ ] After selecting "Street", check console logs for profile save
   - [ ] Verify no errors in saving profile with "Street" preference
   - [ ] Use chat and mention style - verify AI references "Street" preference

### Visual Testing
- [ ] "Street" option is same size as other options
- [ ] Image loads correctly and matches other outfit images in quality/style
- [ ] Emoji displays correctly (👟)
- [ ] Description text fits properly
- [ ] Selection state (highlighted/unhighlighted) works smoothly
- [ ] No layout shifts when selecting "Street"

### Data Testing
- [ ] Profile saves correctly with `stylePreference: ['Street']`
- [ ] Profile saves correctly with multiple selections including Street: `['Modern', 'Street']`
- [ ] AI chat receives "Street" in context when it's selected
- [ ] Settings screen displays "Current: Street" correctly

### Edge Cases
- [ ] Selecting only "Street" (single selection)
- [ ] Selecting all 5 styles including "Street" (max selection)
- [ ] Deselecting "Street" after selecting it
- [ ] Skipping style preferences (should not cause errors even with new option)
- [ ] Editing style preferences from Settings after initial onboarding

### Error Scenarios to Check
- [ ] Missing image file - does it show error or gracefully handle?
- [ ] TypeScript compilation - no new type errors
- [ ] Linter - no new warnings
- [ ] Console - no errors when selecting/deselecting "Street"

---

## 4. Verification Steps

### Console Logs to Check
When you select "Street" and continue, you should see:
```
[StylePreferencesScreen] Updated existing profile, measurements preserved: true
```

Or when creating new profile:
```
[StylePreferencesScreen] Creating new profile WITH measurements from onboarding state
```

### Profile Data Structure
Your saved profile should include:
```json
{
  "stylePreference": ["Street"],
  // or
  "stylePreference": ["Modern", "Street"],
  // etc.
}
```

### AI Context
When chatting, the AI should receive:
```
STYLE PREFERENCES (USE THESE WHEN MAKING RECOMMENDATIONS):
- Overall style: Street
- Favorite occasions: Not specified
```

---

## 5. Rollback Plan

If something breaks:

### Quick Rollback
1. Remove the line from `src/types/index.ts`:
   ```typescript
   STREET = 'Street',  // REMOVE THIS
   ```

2. Remove the object from `src/screens/onboarding/StylePreferencesScreen.tsx`:
   ```typescript
   {
     preference: StylePreference.STREET,  // REMOVE THIS ENTIRE OBJECT
     ...
   },
   ```

3. Restart dev server
4. Existing users with "Street" selected will see it in their data but won't break the app

---

## 6. Expected Behavior

### What Should Happen
✅ Users can select "Street" along with other styles
✅ "Street" saves to profile correctly
✅ AI receives and uses "Street" preference for recommendations
✅ Settings shows current style including "Street"
✅ Multi-select still works with 5 options instead of 4
✅ Image displays correctly and matches other outfit images
✅ No TypeScript errors
✅ No runtime errors

### What Should NOT Happen
❌ TypeScript compilation errors
❌ Missing image errors
❌ Profile save failures
❌ Layout breaking or shifting
❌ Other style options breaking
❌ AI not receiving "Street" preference
❌ Settings not displaying "Street" correctly

---

## 7. Post-Addition Tasks

After successfully adding and testing:

1. **Update AI Context** (Optional Enhancement)
   If you want the AI to give better streetwear advice, you could add specific guidance in `src/services/chat.ts`:
   ```typescript
   // Add to style preferences section:
   if (stylePrefs.includes('Street')) {
     context += `\n- When recommending streetwear, consider: sneakers (Jordans, Dunks, New Balance), 
     hoodies, joggers, graphic tees, bomber jackets, and contemporary casual pieces.`;
   }
   ```

2. **User Communication**
   - Existing users won't automatically see this unless they re-visit Style Preferences
   - Consider in-app message: "New style option available: Street!"

3. **Analytics** (Future)
   - Track how many users select "Street"
   - Most popular style combinations

---

## 8. File Checklist

Files that WILL be modified:
- [ ] `src/types/index.ts` - Add STREET enum value
- [ ] `src/screens/onboarding/StylePreferencesScreen.tsx` - Add STREET option
- [ ] `assets/street-outfit.png` - New image file

Files that WILL NOT be modified:
- ✅ `src/services/storage.ts` - No changes needed (already handles any StylePreference)
- ✅ `src/services/chat.ts` - No changes needed (already receives all style preferences)
- ✅ `src/screens/SettingsScreen.tsx` - No changes needed (auto displays any preferences)

---

## 9. Success Criteria

The addition is successful when:
1. ✅ All 25 test items pass
2. ✅ No TypeScript errors
3. ✅ No runtime errors
4. ✅ Image loads correctly
5. ✅ Profile saves with "Street" preference
6. ✅ AI chat receives and can reference "Street" preference
7. ✅ Settings displays "Street" correctly
8. ✅ Multi-select works with 5 options
9. ✅ Existing functionality unchanged

---

## Quick Start

1. Generate image using ChatGPT prompt above
2. Save as `street-outfit.png` in `/assets/`
3. Make code changes to 2 files
4. Restart dev server
5. Test using checklist
6. Verify console logs and profile data
7. Done! 🎉

