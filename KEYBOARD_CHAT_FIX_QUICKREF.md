# 🔧 Quick Reference: Chat Keyboard Fix (v6)

## The Problem (That Kept Coming Back)
- Input hidden behind Android navigation bar (50%)
- Keyboard covers input when typing

## The Root Causes
1. SafeAreaView missing `'bottom'` edge ❌
2. No KeyboardAvoidingView wrapper ❌
3. Input was inside scrollable content ❌

## The Solution (v6 - CORRECT!)

```tsx
<SafeAreaView edges={['top', 'bottom']}> {/* ⚠️ MUST include 'bottom' */}
  <FlatList>
    {/* messages */}
    <ListFooterComponent>
      <View style={{ height: 120 }} /> {/* Space for input */}
    </ListFooterComponent>
  </FlatList>
  
  {/* ⚠️ CRITICAL: KeyboardAvoidingView wraps input */}
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={0}
  >
    <View style={styles.inputContainer}>
      {/* input, buttons, etc */}
    </View>
  </KeyboardAvoidingView>
</SafeAreaView>
```

## Critical Style Rules

```tsx
inputContainer: {
  paddingBottom: Platform.OS === 'ios' ? TailorSpacing.lg : TailorSpacing.lg,
  // ❌ NO position: 'absolute'
  // ❌ NO bottom: 0
}
```

## Required Elements
1. ✅ SafeAreaView with `edges={['top', 'bottom']}`
2. ✅ KeyboardAvoidingView wrapping input
3. ✅ FlatList ListFooterComponent height: 120
4. ✅ Input paddingBottom: TailorSpacing.lg

## DO NOT
- ❌ Remove `'bottom'` from SafeAreaView edges
- ❌ Remove KeyboardAvoidingView wrapper
- ❌ Put input inside ScrollView/KeyboardAwareScrollView
- ❌ Use `position: 'absolute'` on input
- ❌ Reduce FlatList footer below 120

## Testing Command
```bash
npm start
# Test on Android: Tap input, verify fully visible above keyboard AND nav bar
```

## If It Breaks Again...
1. Check: SafeAreaView has `edges={['top', 'bottom']}`? (line ~448)
2. Check: KeyboardAvoidingView wraps input? (line ~521-524)
3. Check: FlatList footer height is 120? (line ~515)
4. Check: inputContainer paddingBottom is TailorSpacing.lg? (line ~706)
5. Check: Input is NOT inside ScrollView?

## Why Previous Attempts Failed
- v1-v4: Just padding tweaks, didn't fix root cause
- v5: Put input inside KeyboardAwareScrollView (wrong pattern)
- **v6: SafeAreaView + KeyboardAvoidingView (CORRECT!)**

---

**Last Fixed:** 2025-11-10 (6th time - Architecture Fix)
**Location:** `src/screens/ChatScreen.tsx`
**Key Lines:** 
- 448: SafeAreaView edges
- 521-524: KeyboardAvoidingView
- 515: FlatList footer
- 706: inputContainer style


