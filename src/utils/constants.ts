import { Platform } from 'react-native';

// ============================================
// TAILOR COLOR PALETTE
// ============================================

export const TailorColors = {
  // Wood Tones (Backgrounds)
  woodDark: '#3E2723',        // Dark stained wood (primary background)
  woodMedium: '#5D4037',      // Medium wood (cards, panels)
  woodLight: '#8D6E63',       // Light wood accents
  
  // Cream & Ivory (Text on Wood)
  cream: '#F5F5DC',           // Primary text on dark backgrounds
  ivory: '#FFF8DC',           // Secondary text
  parchment: '#FDF6E3',       // Light backgrounds, cards
  
  // Gold Accents (Premium Elements)
  gold: '#D4AF37',            // Premium badges, highlights
  goldLight: '#F4D03F',       // Hover states, active elements
  goldDark: '#B8860B',        // Pressed states
  
  // Deep Navy (Text & Contrast)
  navy: '#1A1A2E',            // Primary text on light backgrounds
  navyLight: '#2E2E4A',       // Secondary text
  
  // Accent Colors
  burgundy: '#800020',        // Error states, important actions
  forest: '#2D5016',          // Success states
  bronze: '#CD7F32',          // Info states
  
  // Neutral Grays (for UI elements)
  grayLight: '#E8E8E8',       // Borders, dividers
  grayMedium: '#A0A0A0',      // Disabled text
  grayDark: '#505050',        // Placeholder text
  
  // Legacy support (for backward compatibility during migration)
  white: '#FFFFFF',
  black: '#000000',
  
  // Semantic aliases (for backward compatibility)
  background: '#3E2723',        // Alias for woodDark
  text: '#F5F5DC',              // Alias for cream
  textSecondary: '#FFF8DC',      // Alias for ivory
  textTertiary: '#A0A0A0',      // Alias for grayMedium
  card: '#5D4037',              // Alias for woodMedium
  border: '#8D6E63',            // Alias for woodLight
  danger: '#800020',            // Alias for burgundy
  primary: '#D4AF37',           // Alias for gold
} as const;

// ============================================
// CONTRAST-SAFE COLOR PAIRINGS (CRITICAL FIX #1)
// ============================================

export const TailorContrasts = {
  // Text colors for backgrounds
  onWoodDark: TailorColors.cream,      // ALWAYS use cream on dark wood
  onWoodMedium: TailorColors.cream,    // ALWAYS use cream on medium wood
  onWoodLight: TailorColors.cream,    // ALWAYS use cream on light wood
  onParchment: TailorColors.navy,      // ALWAYS use navy on light backgrounds
  onGold: TailorColors.navy,           // ALWAYS use navy on gold buttons
  
  // Never use these combinations:
  // ❌ gold text on woodDark
  // ❌ gold text on woodMedium
  // ❌ cream text on parchment
} as const;

// ============================================
// COLOR USAGE GUIDELINES (CRITICAL FIX #1)
// ============================================

export const TailorColorUsage = {
  gold: {
    allowedUses: [
      'Button backgrounds',
      'Icon fills',
      'Borders and dividers',
      'Premium badges (as background)',
      'Accent highlights',
    ],
    forbiddenUses: [
      'Body text on dark backgrounds', // Fails contrast
      'Paragraph text on any background',
      'Labels on dark backgrounds',
    ],
  },
} as const;

// ============================================
// TYPOGRAPHY SYSTEM (with platform-specific fonts - FIX #7)
// ============================================

export const TailorTypography = {
  // Display (Hero Text, Greetings)
  display: {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
    letterSpacing: -0.5,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
  },
  
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
  },
  
  // Body Text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
  },
  
  // UI Elements
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
  },
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
  },
} as const;

// ============================================
// SPACING SYSTEM
// ============================================

export const TailorSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ============================================
// BORDER RADIUS
// ============================================

export const TailorBorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 9999,
} as const;

// ============================================
// SHADOWS & ELEVATION
// ============================================

export const TailorShadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ============================================
// BACKGROUND GRADIENTS (simplified to 2 colors - FIX #6)
// ============================================

export const TailorGradients = {
  // Main screen background - dark wood effect
  woodDarkGradient: {
    colors: ['#3E2723', '#1A0F0A'],  // Simplified to 2 colors for performance
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  // Card/panel background - medium wood effect
  woodMediumGradient: {
    colors: ['#5D4037', '#3E2723'],  // Simplified to 2 colors for performance
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  // Light accent panels
  parchmentGradient: {
    colors: ['#FDF6E3', '#EDE4C8'],  // Simplified to 2 colors for performance
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  // Premium buttons - gold shimmer
  goldGradient: {
    colors: ['#F4D03F', '#B8860B'],  // Simplified to 2 colors for performance
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
} as const;

// ============================================
// INPUT VALIDATION LIMITS
// ============================================

export const INPUT_LIMITS = {
  // User profile
  LAST_NAME: 50,
  SHOE_SIZE: 10,
  
  // Closet items
  BRAND: 100,
  NOTES: 500,
  
  // Chat
  CHAT_MESSAGE: 500,
  
  // Outfit notes
  OUTFIT_NOTES: 1000,
} as const;

// ============================================
// LEGACY EXPORTS (for backward compatibility during migration)
// ============================================

/**
 * @deprecated Use TailorColors instead
 */
export const Colors = TailorColors;

/**
 * @deprecated Use TailorSpacing instead
 */
export const Spacing = TailorSpacing;

/**
 * @deprecated Use TailorTypography instead
 */
export const Typography = TailorTypography;

/**
 * @deprecated Use TailorBorderRadius instead
 */
export const BorderRadius = TailorBorderRadius;
