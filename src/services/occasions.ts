import { Occasion } from '../types';

export interface OccasionGuideline {
  occasion: Occasion;
  description: string;
  dressCode: string;
  keyItems: string[];
  colorRecommendations: string[];
  styleTips: string[];
}

/**
 * Occasion guidelines service
 * Provides style guidance for different occasions
 */
export const OccasionsService = {
  /**
   * Get guidelines for a specific occasion
   */
  getGuidelines(occasion: Occasion): OccasionGuideline {
    const guidelines = this.getAllGuidelines();
    return guidelines.find((g) => g.occasion === occasion) || guidelines[0];
  },

  /**
   * Get all occasion guidelines
   */
  getAllGuidelines(): OccasionGuideline[] {
    return [
      {
        occasion: Occasion.BUSINESS_DINNER,
        description:
          'Professional yet stylish attire for dining with colleagues or clients',
        dressCode: 'Business Casual to Business Professional',
        keyItems: [
          'Button-down shirt or dress shirt',
          'Well-fitted blazer or suit jacket',
          'Dress pants or chinos',
          'Leather dress shoes',
          'Optional tie',
        ],
        colorRecommendations: ['Navy', 'Charcoal', 'White', 'Light Blue'],
        styleTips: [
          'Avoid overly casual items like jeans or sneakers',
          'Ensure clothes are well-fitted and pressed',
          'Choose quality materials that look professional',
          'Accessorize with a watch and belt',
        ],
      },
      {
        occasion: Occasion.WEDDING_GUEST,
        description: 'Appropriate attire for wedding ceremonies and receptions',
        dressCode: 'Semi-Formal to Formal (depends on invitation)',
        keyItems: [
          'Suit or sports coat',
          'Dress shirt',
          'Dress pants',
          'Dress shoes',
          'Optional tie or bow tie',
        ],
        colorRecommendations: ['Navy', 'Charcoal', 'Gray', 'Avoid White'],
        styleTips: [
          'Check invitation for specific dress code',
          'Avoid wearing white (reserved for bride/groom)',
          'Match formality to venue (outdoor = less formal)',
          'Consider season and weather',
        ],
      },
      {
        occasion: Occasion.JOB_INTERVIEW,
        description:
          'Professional attire that makes a strong first impression',
        dressCode: 'Business Professional',
        keyItems: [
          'Suit (navy or charcoal)',
          'Dress shirt (white or light blue)',
          'Tie (conservative pattern)',
          'Dress shoes (black or brown)',
          'Professional belt',
        ],
        colorRecommendations: ['Navy', 'Charcoal', 'White', 'Light Blue'],
        styleTips: [
          'When in doubt, overdress rather than underdress',
          'Ensure everything is clean, pressed, and well-fitted',
          'Avoid flashy colors or patterns',
          'Polish your shoes',
          'Keep accessories minimal and professional',
        ],
      },
      {
        occasion: Occasion.FIRST_DATE,
        description: 'Confident, approachable style for a first date',
        dressCode: 'Smart Casual',
        keyItems: [
          'Well-fitted button-down or polo',
          'Nice jeans or chinos',
          'Casual shoes (clean sneakers or boots)',
          'Optional light jacket or sweater',
        ],
        colorRecommendations: [
          'Navy',
          'Gray',
          'White',
          'Earth tones',
          'Avoid all black',
        ],
        styleTips: [
          'Show personality while staying polished',
          'Ensure clothes are clean and well-fitted',
          'Match the venue (casual restaurant = more relaxed)',
          'Don\'t overthink it - confidence is key',
          'Avoid overly flashy or attention-seeking items',
        ],
      },
      {
        occasion: Occasion.CASUAL,
        description: 'Relaxed, comfortable everyday style',
        dressCode: 'Casual',
        keyItems: [
          'T-shirt, polo, or casual shirt',
          'Jeans or casual pants',
          'Sneakers or casual shoes',
          'Optional hoodie or light jacket',
        ],
        colorRecommendations: ['Any', 'Neutrals work best', 'Add pops of color'],
        styleTips: [
          'Prioritize comfort without sacrificing style',
          'Ensure clothes fit well (not baggy or too tight)',
          'Choose quality basics that last',
          'Build a cohesive color palette',
        ],
      },
      {
        occasion: Occasion.FORMAL,
        description: 'Elegant attire for formal events and black-tie occasions',
        dressCode: 'Formal / Black Tie',
        keyItems: [
          'Tuxedo or dark suit',
          'Dress shirt (white)',
          'Bow tie or formal tie',
          'Formal dress shoes (black)',
          'Optional cummerbund',
        ],
        colorRecommendations: ['Black', 'Navy', 'White'],
        styleTips: [
          'Rent or invest in quality formal wear',
          'Ensure perfect fit - consider tailoring',
          'Match formality to event (black tie vs. black tie optional)',
          'Polish shoes to a shine',
          'Keep accessories elegant and minimal',
        ],
      },
    ];
  },

  /**
   * Get recommended colors for occasion
   */
  getRecommendedColors(occasion: Occasion): string[] {
    const guideline = this.getGuidelines(occasion);
    return guideline.colorRecommendations;
  },

  /**
   * Get style tips for occasion
   */
  getStyleTips(occasion: Occasion): string[] {
    const guideline = this.getGuidelines(occasion);
    return guideline.styleTips;
  },
};

