/**
 * Input Validators
 * Provides validation logic for user inputs across the app
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Shoe Size Validator
 * Validates and normalizes shoe size inputs
 */
export const ShoeSizeValidator = {
  /**
   * Validates shoe size input
   * Accepts: "10", "10.5", "10 1/2", "10½"
   * Rejects: "ten", "big", "abc"
   */
  validate(size: string): ValidationResult {
    const trimmed = size.trim();
    
    if (!trimmed) {
      return { valid: false, error: 'Please enter your shoe size' };
    }
    
    // Allow: numbers, decimals, fractions, unicode fraction characters
    const validPattern = /^(\d+(\.\d+)?|\d+\s*\d+\/\d+|\d+[½¼¾⅓⅔⅛⅜⅝⅞])$/;
    
    if (!validPattern.test(trimmed)) {
      return { 
        valid: false, 
        error: 'Please enter a valid shoe size (e.g., 10, 10.5, or 10 1/2)' 
      };
    }
    
    // Extract numeric value for range check
    let numericSize: number;
    
    if (trimmed.includes('/')) {
      // Handle fractions like "10 1/2"
      const parts = trimmed.split(/\s+/);
      const whole = parts.length > 1 ? parseInt(parts[0]) : 0;
      const fraction = parts[parts.length - 1];
      const [numerator, denominator] = fraction.split('/').map(Number);
      numericSize = whole + (numerator / denominator);
    } else if (/[½¼¾⅓⅔⅛⅜⅝⅞]/.test(trimmed)) {
      // Handle unicode fractions
      const fractionMap: Record<string, number> = {
        '½': 0.5, '¼': 0.25, '¾': 0.75,
        '⅓': 0.33, '⅔': 0.67,
        '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
      };
      const whole = parseInt(trimmed.replace(/[½¼¾⅓⅔⅛⅜⅝⅞]/, '')) || 0;
      const fractionChar = trimmed.match(/[½¼¾⅓⅔⅛⅜⅝⅞]/)?.[0];
      numericSize = whole + (fractionChar ? fractionMap[fractionChar] : 0);
    } else {
      // Handle decimal or whole number
      numericSize = parseFloat(trimmed);
    }
    
    // Check reasonable range (US sizes 4-18)
    if (numericSize < 4 || numericSize > 18) {
      return {
        valid: false,
        error: 'Please enter a shoe size between 4 and 18'
      };
    }
    
    return { valid: true };
  },
  
  /**
   * Normalize shoe size to standard decimal format
   * "10 1/2" → "10.5"
   * "10½" → "10.5"
   * "10" → "10"
   */
  normalize(size: string): string {
    const trimmed = size.trim();
    
    if (trimmed.includes('/')) {
      // Handle fractions like "10 1/2"
      const parts = trimmed.split(/\s+/);
      const whole = parts.length > 1 ? parseInt(parts[0]) : 0;
      const fraction = parts[parts.length - 1];
      const [numerator, denominator] = fraction.split('/').map(Number);
      const decimal = whole + (numerator / denominator);
      
      // Format to one decimal place if needed
      return decimal % 1 === 0 ? decimal.toString() : decimal.toFixed(1);
    }
    
    if (/[½¼¾⅓⅔⅛⅜⅝⅞]/.test(trimmed)) {
      // Handle unicode fractions
      const fractionMap: Record<string, number> = {
        '½': 0.5, '¼': 0.25, '¾': 0.75,
        '⅓': 0.33, '⅔': 0.67,
        '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875,
      };
      const whole = parseInt(trimmed.replace(/[½¼¾⅓⅔⅛⅜⅝⅞]/, '')) || 0;
      const fractionChar = trimmed.match(/[½¼¾⅓⅔⅛⅜⅝⅞]/)?.[0];
      const decimal = whole + (fractionChar ? fractionMap[fractionChar] : 0);
      
      // Format to one decimal place if needed
      return decimal % 1 === 0 ? decimal.toString() : decimal.toFixed(1);
    }
    
    // Already a decimal or whole number - just clean it up
    const numericSize = parseFloat(trimmed);
    return numericSize % 1 === 0 ? numericSize.toString() : numericSize.toFixed(1);
  },
};

/**
 * Name Validator
 * Validates name inputs (first name, last name)
 */
export const NameValidator = {
  validate(name: string, maxLength: number = 50): ValidationResult {
    const trimmed = name.trim();
    
    if (!trimmed) {
      return { valid: false, error: 'Please enter a name' };
    }
    
    if (trimmed.length > maxLength) {
      return { valid: false, error: `Name must be ${maxLength} characters or less` };
    }
    
    // Allow letters, spaces, hyphens, apostrophes (for names like O'Brien, Mary-Jane)
    const validPattern = /^[a-zA-Z\s\-']+$/;
    if (!validPattern.test(trimmed)) {
      return { 
        valid: false, 
        error: 'Name can only contain letters, spaces, hyphens, and apostrophes' 
      };
    }
    
    return { valid: true };
  },
};

/**
 * Text Length Validator
 * Generic validator for text input with max length
 */
export const TextLengthValidator = {
  validate(text: string, maxLength: number, fieldName: string = 'Input'): ValidationResult {
    if (text.length > maxLength) {
      return { 
        valid: false, 
        error: `${fieldName} must be ${maxLength} characters or less` 
      };
    }
    
    return { valid: true };
  },
  
  /**
   * Get warning threshold (e.g., 90% of max length)
   */
  getWarningThreshold(maxLength: number, percentage: number = 0.9): number {
    return Math.floor(maxLength * percentage);
  },
};

export default {
  ShoeSizeValidator,
  NameValidator,
  TextLengthValidator,
};

