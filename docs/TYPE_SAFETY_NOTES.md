# Type Safety Notes

## Known Type Workarounds

### LinearGradient Type Issues

**Files**: `src/components/GoldButton.tsx`, `src/screens/ChatScreen.tsx`

**Issue**: `expo-linear-gradient`'s `LinearGradient` component expects `readonly string[]` for `colors` and `readonly number[]` for `locations`, but our `DevicePerformance.getAdaptiveGradient()` returns mutable arrays.

**Solution**: Type assertions (`as any`) are used as a workaround. This is safe because:
- The arrays are created fresh each time
- The values are validated before use
- The runtime behavior is correct

**Future Improvement**: Consider creating a wrapper type that matches `expo-linear-gradient`'s exact requirements, or update `DevicePerformance` to return readonly arrays.

### FileSystem Encoding Type

**File**: `src/services/claude.ts`

**Issue**: `expo-file-system`'s TypeScript definitions may not include `'base64'` in the `EncodingType` enum, but it's valid at runtime.

**Solution**: Type assertion is used. The runtime behavior is correct.

**Future Improvement**: Update to use proper enum if available in newer versions of `expo-file-system`.

---

## Type Safety Checklist

- ✅ All component props properly typed
- ✅ All service methods properly typed
- ✅ All navigation params properly typed
- ✅ Type guards used where needed
- ⚠️ Two known type workarounds documented above
- ✅ No untyped `any` in business logic

---

## Recommendations

1. **Strict TypeScript**: Consider enabling `strict: true` in `tsconfig.json` (currently using recommended settings)
2. **Type Guards**: Add runtime type validation for API responses
3. **Discriminated Unions**: Use for complex state types (e.g., `CheckHistory` with different result types)

