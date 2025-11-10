# GAUGE - TestFlight Testing Guide

## What to Test

Thank you for testing GAUGE! Please test the following features and report any issues you encounter.

---

## 🎯 Core Features

### 1. **Onboarding Flow**
- [ ] Complete the initial onboarding (measurements, shoe size, style preferences)
- [ ] Verify "Skip for Now" bypasses onboarding correctly
- [ ] Check that measurements are saved and accessible
- [ ] Confirm style preferences (including new "Street" option) save correctly
- [ ] Test navigation flow: Measurements → Shoe Size → Style Preferences → Wardrobe

### 2. **Virtual Tailor Chat**
- [ ] Start a conversation with the AI tailor
- [ ] Ask about clothing recommendations
- [ ] Ask "What are my measurements?" - should show ALL your measurements
- [ ] Verify the AI uses your measurements for sizing suggestions
- [ ] Test photo upload (wardrobe items or clothing questions)
- [ ] Try the "New Chat" button (top right)
- [ ] Check free trial banner (should show remaining conversations)
- [ ] Verify chat stays on-topic (fashion/clothing only)

### 3. **Wardrobe Management**
- [ ] Add items via camera or photo library
- [ ] Verify all categories work (Shirts, Pants, Jackets, Shoes, Hats, Accessories)
- [ ] Search for items in your wardrobe
- [ ] Filter by category
- [ ] Check item count display (free users see limit)
- [ ] Test "Unlock Unlimited" button for free users

### 4. **Shopping Feature** ⭐ **PRIORITY TESTING**
- [ ] Build an outfit or use "Shop for [Item]" from outfit results
- [ ] Verify 3 retailers show initially
- [ ] Test "Show More Retailers" button (should rotate through all 9-10 retailers)
- [ ] Click "Shop Now" on each retailer - verify links open correctly
- [ ] **IMPORTANT**: For retailers that don't work (like J.Crew), test the "Share/Copy search term" button
- [ ] Verify search terms are specific (e.g., "men sweater gray crew neck" not just "sweater")
- [ ] Check that size recommendations are correct:
  - Dress shirts: Should show neck/sleeve (e.g., "15.5/34")
  - Casual shirts: Should show S/M/L based on chest size
  - At 5'9" with 42" chest, should show **M** (Medium), not L
- [ ] Verify no size or price info in search terms (only garment, color, style)

### 5. **Style Preferences**
- [ ] Access from Settings → Style Preferences
- [ ] Verify all 5 options show (Conservative, Modern, Stylish, Fashion-Forward, Street)
- [ ] Select multiple preferences
- [ ] Check that "Current: [your selections]" displays correctly
- [ ] Verify Street style option works and shows correct image

### 6. **Measurements**
- [ ] Access from Settings → Your Measurements
- [ ] Verify all measurements display correctly
- [ ] Edit measurements and confirm they save
- [ ] Check "All measurements are correct" button works
- [ ] Verify measurements are used in chat recommendations

### 7. **History & Favorites**
- [ ] Complete a Quick Style Check and verify it saves to History
- [ ] Search history by type or keyword
- [ ] Filter history (All, Quick Style Check, Outfit Builder, etc.)
- [ ] Save favorite outfits
- [ ] View and edit favorites

---

## 🐛 Known Issues to Verify Fixed

### Shopping Links
- [ ] J.Crew links may redirect to homepage - use "Share/Copy search term" as workaround
- [ ] All other retailers (Amazon, Nordstrom, Target, etc.) should work directly
- [ ] Search terms should be detailed but not include size/price

### Size Recommendations
- [ ] **CRITICAL**: With 42" chest at 5'9", shirts should show **M** (Medium), not L
- [ ] Dress shirts should use neck/sleeve sizing
- [ ] Casual shirts should use S/M/L sizing
- [ ] Height should be considered (shorter users get appropriately sized recommendations)

### Navigation
- [ ] No loops between measurement steps and style preferences
- [ ] Settings → Edit preferences should go back to settings (not continue onboarding)
- [ ] Initial onboarding should flow: Measurements → Shoe Size → Style Preferences → Wardrobe

---

## 📱 Platform-Specific Testing

### iOS
- [ ] App launches without crashes
- [ ] Camera permissions work correctly
- [ ] Photo library access works
- [ ] Links open in Safari (not in-app browser)
- [ ] Share sheet works for copying search terms
- [ ] Keyboard doesn't cover input fields
- [ ] No layout issues on different screen sizes

### Android
- [ ] App launches without crashes
- [ ] Camera permissions work correctly
- [ ] Photo library access works
- [ ] Links open in Chrome/browser
- [ ] Share functionality works
- [ ] Keyboard pushes content up (doesn't resize)
- [ ] No layout issues on different screen sizes

---

## 🎨 UI/UX Testing

- [ ] No headers on main screens (Home, History, Closet, Shop, Settings)
- [ ] History screen boxes are appropriately sized (not too tall)
- [ ] Search bars are clickable and functional
- [ ] Icons display correctly (no emojis, all use icon system)
- [ ] Colors and contrast are readable
- [ ] Buttons are tappable and responsive
- [ ] Loading states show appropriately
- [ ] Error messages are clear and helpful

---

## 🔒 Premium Features

- [ ] Free users see trial banner in chat (3 conversations)
- [ ] Free users see item limit in wardrobe (20 items)
- [ ] "Unlock Unlimited" buttons navigate to paywall
- [ ] Premium status displays correctly in settings

---

## 🚨 Critical Issues to Report

Please report immediately if you encounter:
- App crashes
- Data loss (measurements, wardrobe items disappear)
- AI chat not using measurements
- Shopping links completely broken (all retailers)
- Size recommendations way off (e.g., showing XXL when you're M)
- Navigation loops that prevent completing tasks
- Payment/subscription issues

---

## 📝 How to Report Issues

When reporting issues, please include:
1. **What you were trying to do**
2. **What actually happened**
3. **Steps to reproduce** (if possible)
4. **Screenshots** (if helpful)
5. **Device/OS version**

---

## ✅ Success Criteria

The app is working correctly if:
- ✅ You can complete onboarding smoothly
- ✅ Chat AI knows your measurements and uses them
- ✅ Shopping links work (or copy function works as fallback)
- ✅ Size recommendations are accurate for your body type
- ✅ All features are accessible and functional
- ✅ No crashes or data loss

---

## 🆕 NEW FEATURES TO TEST (November 10, 2025)

### **Enhanced Error Messages**
When things go wrong, you should now see helpful, context-aware error messages:
- **Test**: Turn on airplane mode → Try to generate outfit
- **Expected**: "Can't connect to generate outfit. Check your internet and try again."
- **Expected**: "Try Again" button appears (allows retry)

### **Shoe Size Validation**
The app now validates shoe size format:
- **Test Valid Inputs**:
  - Enter "10" → Should accept ✅
  - Enter "10.5" → Should accept ✅
  - Enter "10 1/2" → Should accept and convert to "10.5" ✅
  - Enter "10½" → Should accept and convert to "10.5" ✅
  
- **Test Invalid Inputs**:
  - Enter "ten" → Should show error: "Please enter a valid shoe size" ❌
  - Enter "big" → Should show error ❌
  - Enter "3" → Should show error: "Please enter a shoe size between 4 and 18" ❌
  - Enter "19" → Should show error: "Please enter a shoe size between 4 and 18" ❌

- **Test AI Chat**:
  - After entering shoe size "10 1/2"
  - Ask AI: "What's my shoe size?"
  - Expected: AI should say "10.5" (normalized format)

### **Input Length Limits**
Some inputs now have character limits:
- **Test**: In shoe size field, try typing more than 10 characters
- **Expected**: Input stops accepting characters after 10

---

## 📝 Known Issues & Limitations

- Shopping links may require copying and pasting in some apps
- First-time onboarding might take 2-3 minutes
- Photo uploads work best with good lighting

---

Thank you for your thorough testing! Your feedback helps make GAUGE better.

