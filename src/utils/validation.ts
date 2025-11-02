/**
 * Input validation and sanitization utilities
 */

export const ValidationService = {
  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Sanitize string input (remove dangerous characters)
   */
  sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .slice(0, 1000); // Limit length
  },

  /**
   * Validate numeric input
   */
  isValidNumber(value: string, min?: number, max?: number): boolean {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
  },

  /**
   * Validate image URI format
   */
  isValidImageUri(uri: string): boolean {
    return (
      typeof uri === 'string' &&
      (uri.startsWith('file://') ||
        uri.startsWith('http://') ||
        uri.startsWith('https://') ||
        uri.startsWith('content://') ||
        uri.startsWith('ph://'))
    );
  },

  /**
   * Validate UUID format
   */
  isValidUUID(uuid: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  /**
   * Sanitize and validate user input for measurements
   */
  sanitizeMeasurement(value: string): number | null {
    const sanitized = value.replace(/[^\d.]/g, '');
    const num = parseFloat(sanitized);
    return isNaN(num) ? null : num;
  },
};

