# GAUGE Design System Documentation

**Last Updated**: 2024  
**Version**: 1.0

---

## Overview

The GAUGE Design System provides a consistent, premium visual language inspired by a high-end tailor shop. All components, screens, and interactions should follow these guidelines.

---

## Color Palette

### Wood Tones (Backgrounds)
- **woodDark** (`#3E2723`) - Primary background, main screens
- **woodMedium** (`#5D4037`) - Cards, panels, secondary backgrounds
- **woodLight** (`#8D6E63`) - Accents, borders

### Text Colors
- **cream** (`#F5F5DC`) - Primary text on dark backgrounds
- **ivory** (`#FFF8DC`) - Secondary text on dark backgrounds
- **parchment** (`#FDF6E3`) - Light backgrounds, cards
- **navy** (`#1A1A2E`) - Primary text on light backgrounds

### Accent Colors
- **gold** (`#D4AF37`) - Premium elements, buttons (background only)
- **goldLight** (`#F4D03F`) - Hover states
- **goldDark** (`#B8860B`) - Pressed states

### Status Colors
- **burgundy** (`#800020`) - Errors, destructive actions
- **forest** (`#2D5016`) - Success states
- **bronze** (`#CD7F32`) - Info states

### Neutral Grays
- **grayLight** (`#E8E8E8`) - Borders, dividers
- **grayMedium** (`#A0A0A0`) - Disabled text
- **grayDark** (`#505050`) - Placeholder text

---

## Contrast-Safe Color Pairings

**CRITICAL**: Always use these pairings to meet WCAG 4.5:1 contrast requirements.

### Text on Backgrounds
- **onWoodDark**: Use `cream` text
- **onWoodMedium**: Use `cream` text
- **onParchment**: Use `navy` text
- **onGold**: Use `navy` text

### Forbidden Combinations
- ❌ Gold text on dark wood (fails contrast)
- ❌ Gold text on medium wood (fails contrast)
- ❌ Cream text on parchment (fails contrast)

---

## Typography

### Font Families
- **iOS**: SF Pro (system default)
- **Android**: Roboto (system default)
- **Fallback**: System font stack

### Type Scale
- **display**: 48px, 700 weight - Hero titles
- **h1**: 36px, 700 weight - Page titles
- **h2**: 28px, 600 weight - Section headers
- **h3**: 24px, 600 weight - Subsection headers
- **body**: 16px, 400 weight - Body text
- **button**: 16px, 600 weight - Button text
- **caption**: 14px, 400 weight - Captions, metadata
- **label**: 12px, 500 weight - Form labels

### Usage Guidelines
- Use `TailorTypography` constants, never hardcode font sizes
- Maintain consistent line heights (1.5x for body, 1.2x for headings)
- Use appropriate weights (400 for body, 600+ for emphasis)

---

## Spacing System

### Spacing Scale
- **xs**: 4px - Tight spacing, icon padding
- **sm**: 8px - Small gaps, compact layouts
- **md**: 16px - Standard spacing, card padding
- **lg**: 24px - Section spacing, larger gaps
- **xl**: 32px - Screen margins, major sections
- **xxl**: 48px - Large sections, hero spacing
- **xxxl**: 64px - Maximum spacing, full-screen sections

### Usage Guidelines
- Always use `TailorSpacing` constants
- Maintain consistent padding/margin patterns
- Use multiples of 4px (xs, sm, md, lg, xl, xxl, xxxl)
- Never use arbitrary values (e.g., `padding: 13`)

---

## Border Radius

### Radius Scale
- **sm**: 8px - Small elements, badges
- **md**: 12px - Buttons, cards (standard)
- **lg**: 16px - Large cards, panels
- **xl**: 20px - Extra large elements
- **round**: 9999px - Fully rounded (pills, avatars)

### Usage Guidelines
- Buttons: `md` (12px) or `round` (pills)
- Cards: `md` (12px) or `lg` (16px)
- Images: `sm` (8px) or `md` (12px)
- Badges: `sm` (8px) or `round` (pills)

---

## Shadows

### Shadow Scale
- **small**: `0 2px 4px rgba(0, 0, 0, 0.1)` - Subtle elevation
- **medium**: `0 4px 8px rgba(0, 0, 0, 0.15)` - Standard cards
- **large**: `0 8px 16px rgba(0, 0, 0, 0.2)` - Modals, overlays

### Usage Guidelines
- Cards: `medium` shadow
- Buttons: `small` shadow (default), `medium` (selected/pressed)
- Modals: `large` shadow
- Use sparingly - too many shadows create visual noise

---

## Buttons

### GoldButton (Primary CTA)
- Background: Gold gradient
- Text: Navy (for contrast)
- Padding: `md` vertical, `xl` horizontal
- Border radius: `md` (12px)
- Min height: 48px
- Shadow: `small` (default), `medium` (pressed)

### Secondary Buttons
- Background: `woodMedium`
- Text: `cream`
- Border: `woodLight` (1.5px)
- Same padding and sizing as GoldButton

### Usage Guidelines
- Primary actions: Use `GoldButton`
- Secondary actions: Use secondary button style
- Disabled state: 50% opacity
- Loading state: Show `ActivityIndicator`

---

## Components

### Standard Components
- `WoodBackground` - Screen background wrapper
- `GoldButton` - Primary CTA button
- `SearchBar` - Enhanced search input
- `FilterChips` - Filter selection chips
- `EmptyState` - Empty state displays
- `ErrorDisplay` - Error message display
- `RetryButton` - Retry action button
- `SkeletonCard` - Loading skeleton
- `SkeletonList` - Loading skeleton list

### Component Guidelines
- All components use Tailor design system constants
- Consistent spacing, typography, and colors
- Accessible (44x44pt touch targets minimum)
- Responsive to different screen sizes

---

## Accessibility

### Contrast Requirements
- **WCAG AA**: 4.5:1 minimum for normal text
- **WCAG AAA**: 7:1 for enhanced accessibility
- All text must meet AA standards (verified in `contrastTest.ts`)

### Touch Targets
- Minimum: 44x44pt (iOS), 48x48dp (Android)
- Adequate spacing between targets (minimum 8px)

### Screen Reader Support
- All interactive elements have `accessibilityLabel`
- Complex actions have `accessibilityHint`
- Proper `accessibilityRole` assignments

---

## Performance Considerations

### Gradients
- Simplified on low-end devices (via `DevicePerformance`)
- Use `getAdaptiveGradient()` for performance optimization

### Images
- Use `expo-image` for caching
- Lazy load images in lists
- Optimize image sizes before upload

---

## Implementation Checklist

### Before Adding New Screens
- [ ] Use `WoodBackground` wrapper
- [ ] Use `TailorColors` for all colors
- [ ] Use `TailorTypography` for all text
- [ ] Use `TailorSpacing` for all spacing
- [ ] Use `TailorBorderRadius` for rounded corners
- [ ] Use `TailorShadows` for elevation
- [ ] Verify contrast ratios
- [ ] Test on iOS and Android
- [ ] Verify touch target sizes

### Before Adding New Components
- [ ] Follow existing component patterns
- [ ] Use design system constants
- [ ] Add accessibility labels
- [ ] Test with screen readers
- [ ] Verify contrast ratios
- [ ] Document component props and usage

---

## Common Mistakes to Avoid

1. **Hardcoded Values**
   - ❌ `padding: 13`
   - ✅ `padding: TailorSpacing.md`

2. **Wrong Text Colors**
   - ❌ `color: TailorColors.gold` on dark background
   - ✅ `color: TailorContrasts.onWoodDark`

3. **Inconsistent Spacing**
   - ❌ Mixing `padding: 10` and `padding: TailorSpacing.sm`
   - ✅ Always use `TailorSpacing` constants

4. **Missing Accessibility**
   - ❌ Button without `accessibilityLabel`
   - ✅ Always include accessibility props

---

## Resources

- Design System Constants: `src/utils/constants.ts`
- Contrast Testing: `src/utils/contrastTest.ts`
- Component Library: `src/components/`
- Design Guide: `PREMIUM_TAILOR_SHOP_REDESIGN.md`

---

**Questions or Issues?** Refer to `PREMIUM_TAILOR_SHOP_REDESIGN.md` for detailed specifications.

