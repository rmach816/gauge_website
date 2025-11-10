# AI Chat Measurement Issue - Debug Guide

## Background
The AI chat should have access to your measurements, style preferences, and shoe size, but it's currently not working on iOS. This guide will help diagnose the exact problem.

## Pre-Test Setup (CRITICAL)

### 1. Enable Console Logging on iOS
- Connect your iPhone to your Mac with USB cable
- Open **Xcode** on your Mac
- Go to **Window → Devices and Simulators**
- Select your connected iPhone in the left sidebar
- Click the **"Open Console"** button in the top right
- In the filter box at the top, type: `Gauge` or `ChatScreen` or `ChatDiagnostics`
- Leave this console window open while testing

### 2. Verify Your Profile Data is Actually Saved
- Open the Gauge app on your iPhone
- Go to **Profile** or **Settings** screen
- Verify ALL measurements are shown:
  - ✅ Height (feet and inches)
  - ✅ Weight (pounds)
  - ✅ Chest (inches)
  - ✅ Waist (inches)
  - ✅ Neck (inches)
  - ✅ Sleeve (inches)
  - ✅ Shoulder (inches)
  - ✅ Inseam (inches)
  - ✅ Shoe size
  - ✅ Style preferences (at least one selected)
  - ✅ Favorite occasions (at least one selected)
- **IMPORTANT**: If ANY are missing, RE-ENTER them and click SAVE

---

## Test Procedure

### Test 1: Comprehensive Profile Data Check

**Step 1:** Open the Gauge app on iPhone
**Step 2:** Navigate to **AI Chat** screen  
**Step 3:** In the Xcode console, you should see logs from when the chat screen loads

**Step 4:** Type this message: `"What are my measurements?"`

**Step 5:** Click SEND

**Step 6:** IMMEDIATELY check the Xcode console. You should see output like this:

```
═══════════════════════════════════════════════════════════
[ChatDiagnostics] Starting diagnostic check...
═══════════════════════════════════════════════════════════
[ChatDiagnostics] ✅ Profile found: abc-123-def-456
[ChatDiagnostics] ✅ All required measurements present:
  - Height: 70" (5' 10")
  - Weight: 175 lbs
  - Chest: 40"
  - Waist: 32"
  - Neck: 15"
  - Sleeve: 33"
  - Shoulder: 18"
  - Inseam: 32"
  - Preferred Fit: regular
[ChatDiagnostics] ✅ Shoe size present: 10
[ChatDiagnostics] ✅ Style preferences present: modern, stylish
[ChatDiagnostics] ✅ Favorite occasions present: business, casual
[ChatDiagnostics] ⚠️  INFO: No last name (optional)
═══════════════════════════════════════════════════════════
[ChatDiagnostics] DIAGNOSTIC SUMMARY:
  Profile: ✅
  Measurements: ✅
  Shoe Size: ✅
  Style Preferences: ✅
  Favorite Occasions: ✅
  Last Name: ⚠️  Optional
═══════════════════════════════════════════════════════════
```

**Step 7:** Wait for the AI's response. Read what it says about your measurements.

---

### Test 2: Style Preferences Check

**Step 1:** In the chat, type: `"What's my style preference?"`
**Step 2:** Send the message
**Step 3:** Check console for diagnostic logs
**Step 4:** Check AI's response - does it mention your actual style preferences?

---

### Test 3: Shoe Size Check

**Step 1:** In the chat, type: `"What size shoes do I wear?"`
**Step 2:** Send the message
**Step 3:** Check console for diagnostic logs  
**Step 4:** Check AI's response - does it give your exact shoe size?

---

## Interpreting Results

### ✅ Scenario A: Console shows all ✅ checkmarks, but AI says it doesn't have the data

**What This Means:**
- Data IS saved in storage ✅
- Data IS being loaded by ChatScreen ✅
- Data is being passed to ChatService ✅
- BUT: Data is NOT being included in the system context sent to Claude API ❌

**Root Cause:** Issue in `ChatService.buildSystemContext()` function or API request formatting

**Evidence to Collect:**
1. Copy the full diagnostic output from console
2. Look for these additional console logs:
   ```
   [ChatService] Building context with profile: ...
   [ChatService] Building context with VALID measurements: ...
   [ChatService] Sending to Claude: ...
   [ChatService] Measurements section in context: ...
   ```
3. If you see "ERROR: Measurements NOT found in context!" - that's the smoking gun

---

### ❌ Scenario B: Console shows ❌ or ⚠️ for measurements/shoe size/style

**What This Means:**
- Data is NOT saved in storage properly
- Something went wrong during save or onboarding

**Root Causes (in order of likelihood):**

#### B1: Profile Save is Failing
**Symptoms:** You entered data in Profile screen, clicked Save, but console shows missing data
**Test:**
1. Go to Profile screen
2. Enter a measurement (e.g., chest: 40)
3. Click Save
4. Check console for: `[StorageService] Failed to save user profile:` errors
5. Go back to Chat and send a message
6. Check if measurement appears in diagnostics

#### B2: Onboarding Data Not Transferring to Profile  
**Symptoms:** You completed onboarding, but profile is empty
**Test:**
1. Check console for: `[OnboardingService]` logs
2. Look for: `Failed to save onboarding state` errors
3. Check if there's a `[ProfileScreen]` or `[CompletionScreen]` log showing profile was created

#### B3: AsyncStorage Corruption
**Symptoms:** Data was there before but now it's gone
**Test:**
1. Force close the app completely
2. Reopen it
3. Go to Profile screen - is data still there?
4. If no, storage is corrupted or app was reinstalled (which clears data)

---

### 🔇 Scenario C: No Diagnostic Logs Appear at All

**What This Means:**
- Console is not connected, OR
- Diagnostic code isn't running, OR  
- App is running a different build

**Solutions:**
1. Verify iPhone is connected via USB (not Wi-Fi)
2. In Xcode, verify the console is showing ANY logs from the device
3. Try filtering by just your iPhone's name
4. Close app completely and reopen
5. Send another chat message
6. If still nothing, the build may not include the diagnostic code

---

## What to Report Back to Me

Please provide the following information so I can pinpoint the exact issue:

### 1. Which Scenario?
Tell me: **A**, **B1**, **B2**, **B3**, or **C**

### 2. Console Output
Copy and paste the COMPLETE diagnostic output from between these lines:
```
═══════════════════════════════════════════════════════════
[ChatDiagnostics] Starting diagnostic check...
...
═══════════════════════════════════════════════════════════
```

### 3. Screenshots
- **Screenshot 1:** AI's response when you ask "What are my measurements?"
- **Screenshot 2:** Your Profile screen showing measurements are filled in
- **Screenshot 3:** Xcode console showing the diagnostic logs (if visible)

### 4. Additional Console Logs
Search the console for these and copy/paste any matches:
- `[ChatService] ERROR:`
- `[StorageService] Failed:`
- `[ChatDiagnostics] ERROR:`
- `[ChatDiagnostics] WARNING:`

---

## Common Issues and Quick Fixes

### Issue: "Profile not found in storage"
**Fix:** Complete onboarding again OR go to Profile screen and enter all data

### Issue: "Missing measurement fields: chest, waist..."
**Fix:** Go to Profile screen and fill in the missing measurements

### Issue: AI says "I don't have access to your measurements"
**If diagnostics show ✅:** This is Scenario A - the system context bug
**If diagnostics show ❌:** This is Scenario B - data not saved properly

### Issue: No console logs at all
**Fix:** 
1. Disconnect and reconnect iPhone
2. In Xcode, Window → Devices, remove device and re-add it
3. Close and reopen console
4. Make sure you're looking at logs from your iPhone (not simulator)

---

## Technical Details (For Debugging)

### What the Diagnostic Tool Checks
1. **Storage Access:** Can we read from AsyncStorage?
2. **Profile Existence:** Is there a UserProfile object?
3. **Measurements Object:** Does profile.measurements exist?
4. **Measurements Validity:** Are all required fields (chest, waist, neck, sleeve, shoulder, inseam) present?
5. **Shoe Size:** Is profile.shoeSize populated?
6. **Style Preferences:** Is profile.stylePreference array populated?
7. **Favorite Occasions:** Is profile.favoriteOccasions array populated?

### Data Flow
```
Onboarding Screens
    ↓
OnboardingService.saveOnboardingState()
    ↓
AsyncStorage (@gauge_onboarding_state)
    ↓
CompletionScreen: OnboardingService → StorageService.saveUserProfile()
    ↓
AsyncStorage (@gauge_user_profile)
    ↓
ChatScreen: StorageService.getUserProfile()
    ↓
ChatService.sendMessage(profile, ...)
    ↓
ChatService.buildSystemContext(profile, ...)
    ↓
Claude API (system: context string with measurements)
```

If data is lost at any step in this chain, the AI won't have it.

---

## Next Steps

1. Follow the test procedure above
2. Identify which scenario matches your situation
3. Collect the requested information (console logs, screenshots)
4. Report back with findings

Once I know the exact scenario, I can provide a targeted fix!

