# ChatScreen Keyboard Layout - DO NOT MODIFY

## Critical Values That Must Not Be Changed

### File: `src/screens/ChatScreen.tsx`

This file has been modified **6 times** to fix keyboard and bottom toolbar issues. The current values are **FINAL** and carefully calibrated for both iOS and Android.

---

## The Problem History

1. **Attempt 1**: Keyboard covered text input
2. **Attempt 2**: Fixed iOS but broke Android bottom nav
3. **Attempt 3**: Fixed Android but keyboard too close on iOS
4. **Attempt 4**: VirtualizedList nested in ScrollView warning
5. **Attempt 5**: Removed KeyboardAwareScrollView, broke keyboard avoidance
6. **Attempt 6**: Current fix - FINAL VERSION

---

## Current Implementation (DO NOT CHANGE)

### 1. KeyboardAvoidingView Settings

**Location:** Line ~520-527

```typescript
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
>
```

**Why These Values:**
- **iOS: `90` offset** - Provides proper spacing between keyboard and text input (tested)
- **Android: `20` offset** - Accounts for bottom navigation bar height (tested)
- **Behavior: `padding` (iOS) / `height` (Android)** - Different behaviors work best on each platform

**❌ DO NOT:**
- Change offset to 0 (keyboard will touch input)
- Use same value for both platforms (breaks one or the other)
- Remove KeyboardAvoidingView (input gets hidden)
- Wrap entire screen (causes VirtualizedList warning)

---

### 2. FlatList Footer Height

**Location:** Line ~516

```typescript
<View style={{ height: 100 }} />
```

**Why 100px:**
- Prevents last message from being hidden behind input container
- Accounts for input container height (~80px) + spacing (~20px)
- Ensures smooth scrolling to bottom

**❌ DO NOT:**
- Reduce below 80px (last message gets cut off)
- Increase above 120px (too much empty space)

---

### 3. Input Container Padding

**Location:** Line ~703 (styles)

```typescript
inputContainer: {
  paddingBottom: Platform.OS === 'ios' ? TailorSpacing.lg : TailorSpacing.lg,
  // TailorSpacing.lg = 16px
}
```

**Why This Value:**
- **iOS**: Spacing above home indicator (20px bottom safe area handled by SafeAreaView)
- **Android**: Spacing above navigation bar
- Both platforms use same value because SafeAreaView handles platform differences

**❌ DO NOT:**
- Remove paddingBottom (input touches bottom edge)
- Use different values per platform (SafeAreaView already handles it)
- Use smaller spacing (looks cramped)

---

### 4. SafeAreaView Edges

**Location:** Line ~441

```typescript
<SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
```

**Why `['top', 'bottom']`:**
- Handles iOS notch at top
- Handles iOS home indicator at bottom
- Handles Android system UI

**❌ DO NOT:**
- Remove 'bottom' edge (input goes behind home indicator)
- Remove SafeAreaView (content goes behind system UI)

---

## Testing Checklist (Before ANY Changes)

If you MUST modify this file, test on BOTH platforms:

### iOS Testing:
- [ ] Keyboard appears with ~20px space above text input
- [ ] Text input doesn't go behind home indicator
- [ ] Can scroll to see all messages when keyboard is open
- [ ] Last message has space before input container
- [ ] No VirtualizedList warnings in console

### Android Testing:
- [ ] Keyboard appears with proper spacing above text input
- [ ] Text input doesn't go behind navigation bar
- [ ] Bottom navigation bar doesn't overlap input
- [ ] Can scroll to see all messages when keyboard is open
- [ ] No VirtualizedList warnings in console

---

## Structure Overview

```
LinearGradient (full screen)
└── SafeAreaView (top & bottom edges)
    ├── Header (New Chat button)
    ├── Error/Trial banners
    ├── FlatList (messages with scrolling)
    │   └── Footer (100px padding + loading indicator)
    └── KeyboardAvoidingView (ONLY wraps input)
        └── Input Container (text input, buttons)
```

**Key Points:**
- ✅ FlatList handles all vertical scrolling
- ✅ KeyboardAvoidingView ONLY wraps input (not entire screen)
- ✅ No nested ScrollViews (prevents VirtualizedList warning)
- ✅ SafeAreaView handles safe areas
- ✅ Platform-specific offsets for keyboard

---

## If Something Breaks

**Before making changes:**
1. Read this document completely
2. Understand WHY the current values exist
3. Test on BOTH iOS and Android
4. Document your changes here

**Common mistakes to avoid:**
- ❌ Wrapping FlatList in ScrollView
- ❌ Using KeyboardAwareScrollView (causes nesting warning)
- ❌ Wrapping entire screen in KeyboardAvoidingView
- ❌ Using offset of 0 (keyboard touches input)
- ❌ Same offset values for iOS and Android

---

## Current Status: ✅ WORKING

**Date Fixed:** November 10, 2025  
**Last Modified By:** AI Assistant  
**Tested On:**
- iOS: ✅ Working  
- Android: ✅ Working  

**If this gets broken again, revert to this commit and read this document!**

