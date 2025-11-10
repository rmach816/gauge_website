import { TailorColors } from './constants';

/**
 * Calculate relative luminance of a color (hex format)
 * Based on WCAG 2.1 specification
 */
const getLuminance = (hex: string): number => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  
  // Apply gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

/**
 * Test contrast ratio between foreground and background colors
 * Returns ratio and WCAG compliance status
 */
export const testContrast = (
  foreground: string,
  background: string
): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} => {
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  
  // Calculate contrast ratio
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  
  return {
    ratio: Math.round(ratio * 100) / 100, // Round to 2 decimal places
    passesAA: ratio >= 4.5,    // WCAG AA standard (for normal text)
    passesAAA: ratio >= 7.0,   // WCAG AAA standard (for enhanced accessibility)
  };
};

/**
 * Test all critical color combinations in development mode
 */
if (__DEV__) {
  console.log('=== TAILOR DESIGN SYSTEM CONTRAST TESTS ===');
  console.log('');
  
  // Test cream on woodDark
  const creamOnWoodDark = testContrast(TailorColors.cream, TailorColors.woodDark);
  console.log('cream on woodDark:', {
    ratio: creamOnWoodDark.ratio,
    passesAA: creamOnWoodDark.passesAA ? '✅' : '❌',
    passesAAA: creamOnWoodDark.passesAAA ? '✅' : '❌',
  });
  
  // Test gold on woodDark (should fail - this is why we use cream)
  const goldOnWoodDark = testContrast(TailorColors.gold, TailorColors.woodDark);
  console.log('gold on woodDark:', {
    ratio: goldOnWoodDark.ratio,
    passesAA: goldOnWoodDark.passesAA ? '✅' : '❌',
    passesAAA: goldOnWoodDark.passesAAA ? '✅' : '❌',
    note: goldOnWoodDark.passesAA ? '' : '⚠️ This combination should NOT be used',
  });
  
  // Test navy on parchment
  const navyOnParchment = testContrast(TailorColors.navy, TailorColors.parchment);
  console.log('navy on parchment:', {
    ratio: navyOnParchment.ratio,
    passesAA: navyOnParchment.passesAA ? '✅' : '❌',
    passesAAA: navyOnParchment.passesAAA ? '✅' : '❌',
  });
  
  // Test navy on gold (for buttons)
  const navyOnGold = testContrast(TailorColors.navy, TailorColors.gold);
  console.log('navy on gold:', {
    ratio: navyOnGold.ratio,
    passesAA: navyOnGold.passesAA ? '✅' : '❌',
    passesAAA: navyOnGold.passesAAA ? '✅' : '❌',
  });
  
  // Test cream on woodMedium
  const creamOnWoodMedium = testContrast(TailorColors.cream, TailorColors.woodMedium);
  console.log('cream on woodMedium:', {
    ratio: creamOnWoodMedium.ratio,
    passesAA: creamOnWoodMedium.passesAA ? '✅' : '❌',
    passesAAA: creamOnWoodMedium.passesAAA ? '✅' : '❌',
  });
  
  console.log('');
  console.log('=== CONTRAST TEST COMPLETE ===');
  console.log('All critical combinations should pass WCAG AA (4.5:1)');
}

