# Chat Screen Keyboard Fix - Testing Guide

## Testing Checklist

### Android Testing (Priority 1)

#### Test 1: Input Visibility When Keyboard Closed
- [ ] Open Chat screen
- [ ] **VERIFY:** Input box is visible at the bottom
- [ ] **VERIFY:** Input box is NOT hidden behind Android navigation bar
- [ ] **VERIFY:** All three buttons (camera, wardrobe, send) are visible

#### Test 2: Input Visibility When Keyboard Opens
- [ ] Tap on the text input
- [ ] **VERIFY:** Keyboard appears
- [ ] **VERIFY:** Input box moves up and remains visible above keyboard
- [ ] **VERIFY:** Can see what you're typing
- [ ] **VERIFY:** Send button is visible

#### Test 3: Scrolling with Keyboard Open
- [ ] With keyboard open, try scrolling through messages
- [ ] **VERIFY:** Messages scroll properly
- [ ] **VERIFY:** Input stays at bottom, above keyboard
- [ ] **VERIFY:** No overlap between messages and input

#### Test 4: Multiple Message Interaction
- [ ] Send several messages to fill the screen
- [ ] Tap input to open keyboard
- [ ] **VERIFY:** Screen auto-scrolls to show your message and input
- [ ] Type a message
- [ ] **VERIFY:** Can see the typed text
- [ ] Send message
- [ ] **VERIFY:** New message appears and screen scrolls to bottom

#### Test 5: Photo Button Interaction
- [ ] Open keyboard
- [ ] Close keyboard
- [ ] Tap photo button
- [ ] **VERIFY:** Dialog appears properly
- [ ] **VERIFY:** Input remains visible after dismissing dialog

#### Test 6: Wardrobe Button Interaction
- [ ] Open keyboard
- [ ] Close keyboard
- [ ] Tap wardrobe button
- [ ] **VERIFY:** Modal appears properly
- [ ] Select items
- [ ] **VERIFY:** Badge shows count
- [ ] **VERIFY:** Input remains visible

#### Test 7: Long Message Typing
- [ ] Type a very long message (multiline)
- [ ] **VERIFY:** Input expands vertically (up to maxHeight: 100)
- [ ] **VERIFY:** Input stays above keyboard
- [ ] **VERIFY:** Can scroll within the input if needed

#### Test 8: Keyboard Dismiss
- [ ] Open keyboard
- [ ] Scroll messages list
- [ ] **VERIFY:** Keyboard dismisses on scroll (keyboardDismissMode="interactive")
- [ ] **VERIFY:** Input returns to bottom position

#### Test 9: Navigation Bar Variants
- [ ] Test with Android gesture navigation (no buttons)
- [ ] **VERIFY:** Input visible and accessible
- [ ] Test with Android 3-button navigation
- [ ] **VERIFY:** Input NOT hidden behind buttons

### iOS Testing (Priority 2)

#### Test 10: iOS Keyboard Behavior
- [ ] Open chat on iOS device/simulator
- [ ] Tap input
- [ ] **VERIFY:** Keyboard appears smoothly
- [ ] **VERIFY:** Input stays visible above keyboard
- [ ] **VERIFY:** Safe area insets respected (notch/home indicator)

#### Test 11: iOS Scrolling
- [ ] With keyboard open, scroll messages
- [ ] **VERIFY:** Smooth scrolling
- [ ] **VERIFY:** No layout jumps

### Edge Cases

#### Test 12: Screen Rotation (Android)
- [ ] Open keyboard
- [ ] Rotate device to landscape
- [ ] **VERIFY:** Input still visible and above keyboard
- [ ] Rotate back to portrait
- [ ] **VERIFY:** Layout restored correctly

#### Test 13: Rapid Keyboard Toggle
- [ ] Quickly tap input multiple times
- [ ] Open/close keyboard rapidly
- [ ] **VERIFY:** No UI glitches
- [ ] **VERIFY:** Input position stable

#### Test 14: Premium/Non-Premium States
- [ ] Test as non-premium user
- [ ] **VERIFY:** Trial banner doesn't interfere with keyboard
- [ ] Use last free message
- [ ] **VERIFY:** Upgrade prompt appears correctly
- [ ] **VERIFY:** Input still visible during prompt

## Known Issues to Watch For

### ❌ WRONG: Input Hidden Behind Nav Bar
If you see the input partially or fully hidden behind the Android navigation bar when keyboard is closed, the fix is NOT working.

### ❌ WRONG: Input Covered by Keyboard
If the input is not visible when typing (covered by keyboard), the fix is NOT working.

### ❌ WRONG: Can't Scroll Messages
If the message list doesn't scroll, there's a problem with the FlatList configuration.

### ✅ CORRECT: Expected Behavior
- Input is ALWAYS visible when keyboard is closed
- Input is ALWAYS visible ABOVE keyboard when keyboard is open
- Messages scroll smoothly with keyboard open or closed
- Auto-scrolls to show latest message when sending
- No overlap between UI elements

## Testing Devices

### Minimum Test Devices
1. **Android 12+** with gesture navigation
2. **Android 10-11** with 3-button navigation
3. **iOS 15+** (iPhone with notch)
4. **iOS 15+** (iPhone with home button)

### Recommended Test Devices
- Samsung Galaxy (One UI)
- Google Pixel (Stock Android)
- OnePlus (OxygenOS)
- iPhone 13/14/15 series

## Automated Testing

Run the test suite to ensure no regressions:
```bash
npm test
```

## Performance Testing

### Memory
- [ ] Monitor memory usage during heavy keyboard interaction
- [ ] **VERIFY:** No memory leaks after 10+ message exchanges

### Frame Rate
- [ ] Monitor FPS during keyboard animations
- [ ] **VERIFY:** 60fps maintained (use React DevTools)

## Regression Testing

After confirming the fix works, test these features to ensure nothing broke:

- [ ] New chat button works
- [ ] Message history loads correctly
- [ ] Photo upload works
- [ ] Wardrobe item selection works
- [ ] Premium/free message tracking works
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Navigation works (back button, etc.)

## Sign-Off Criteria

✅ All Android tests pass (Tests 1-9)
✅ All iOS tests pass (Tests 10-11)
✅ All edge case tests pass (Tests 12-14)
✅ No regressions detected
✅ Performance acceptable

---

**Testing Date:** _____________
**Tester:** _____________
**Device(s) Used:** _____________
**Test Result:** ⬜ PASS  ⬜ FAIL
**Notes:** _____________

