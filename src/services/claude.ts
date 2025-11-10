import Anthropic from '@anthropic-ai/sdk';
import * as FileSystem from 'expo-file-system/legacy';
import { ANTHROPIC_API_KEY } from '@env';
import {
  ClaudeVisionRequest,
  ClaudeVisionResponse,
  Suggestion,
  OutfitItem,
  ClosetItem,
} from '../types';
import { ImageCompressionService } from '../utils/imageCompression';
import { apiCache } from '../utils/apiCache';
import { retryWithBackoff } from '../utils/retry';

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

export const ClaudeVisionService = {
  async imageToBase64(uri: string): Promise<string> {
    try {
      // Note: expo-file-system types may not include 'base64' in EncodingType enum
      // but it's valid at runtime. Using type assertion as workaround.
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64' as FileSystem.EncodingType,
      });
      return base64;
    } catch (error) {
      console.error('[ClaudeVision] Failed to convert image:', error);
      throw error;
    }
  },

  buildPrompt(request: ClaudeVisionRequest): string {
    const { requestType, userMeasurements, occasion, stylePreference, shoeSize } = request;

    let basePrompt = `You are an expert men's style consultant. Analyze the clothing and provide professional, actionable advice.

Keep responses concise and beginner-friendly.`;

    if (userMeasurements) {
      basePrompt += `\n\nUSER MEASUREMENTS:
- Height: ${Math.floor(userMeasurements.height / 12)}' ${userMeasurements.height % 12}"
- Weight: ${userMeasurements.weight} lbs
- Chest: ${userMeasurements.chest}"
- Waist: ${userMeasurements.waist}"
- Inseam: ${userMeasurements.inseam}"
- Neck: ${userMeasurements.neck}"
- Sleeve: ${userMeasurements.sleeve}"
- Preferred fit: ${userMeasurements.preferredFit}`;
    }

    if (shoeSize) {
      basePrompt += `\n\nSHOE SIZE: ${shoeSize}
When recommending shoes, always suggest items in this size.`;
    }

    switch (requestType) {
      case 'instant-check':
        basePrompt += `\n\nTASK: Instant Match Check
Rate as "great", "okay", or "poor" and suggest improvements.

RESPOND IN JSON:
{
  "rating": "great" | "okay" | "poor",
  "analysis": "Brief explanation (2-3 sentences)",
  "suggestions": [
    {
      "garmentType": "Shirt" | "Pants" | "Jacket" | "Shoes" | "Accessories",
      "description": "Specific item description",
      "reasoning": "Why this works",
      "colors": ["color1", "color2"],
      "styles": ["style1", "style2"]
    }
  ],
  "sizeRecommendations": [
    {
      "garmentType": "string",
      "recommendedSize": "e.g. 40R, 32x32",
      "fitNotes": ["note1", "note2"],
      "tailoringTips": ["tip1"]
    }
  ]
}`;
        break;

      case 'outfit-builder':
        basePrompt += `\n\nTASK: Complete Outfit Builder
Occasion: ${occasion}
Style: ${stylePreference}

Create complete outfit with all garments needed.

RESPOND IN JSON:
{
  "analysis": "Overall concept and why it works",
  "completeOutfit": [
    {
      "garmentType": "Shirt" | "Pants" | "Jacket" | "Shoes" | "Accessories",
      "description": "Specific description with colors and style",
      "shoppingKeywords": ["keyword1", "keyword2"],
      "colors": ["color1"],
      "styles": ["style1"]
    }
  ],
  "sizeRecommendations": [...]
}`;
        break;

      case 'closet-match':
        basePrompt += `\n\nTASK: Match with Existing Items
User owns: ${request.existingItems?.join(', ')}

Analyze photo and suggest what from their closet would match.

RESPOND IN JSON (same as instant-check)`;
        break;

      case 'find-to-match':
        basePrompt += `\n\nTASK: Find Items to Match
Analyze photo and suggest what items would match this piece.

RESPOND IN JSON (same as instant-check)`;
        break;

      case 'wardrobe-outfit': {
        const wardrobeItems = request.wardrobeItems || [];
        let wardrobeContext = '';
        if (wardrobeItems.length > 0) {
          wardrobeContext = '\n\nUSER\'S WARDROBE:\n';
          wardrobeItems.forEach(item => {
            wardrobeContext += `- [ID: ${item.id}] ${item.garmentType}: ${item.color}${item.secondaryColor ? ` / ${item.secondaryColor} (reversible)` : ''}${item.material ? ` (${item.material})` : ''}${item.pattern && item.pattern !== 'solid' ? ` [${item.pattern}]` : ''}${item.brand ? ` - ${item.brand}` : ''}${item.size ? ` - Size: ${item.size}` : ''}\n`;
          });
        }
        
        basePrompt += `\n\nTASK: Generate Outfit from Wardrobe
Occasion: ${occasion}
Style: ${stylePreference}${wardrobeContext}

CRITICAL INSTRUCTIONS:
1. USE items from the user's wardrobe whenever possible. Reference items by their ID using "existingItem": "item-id"
2. If a required garment type is missing from the wardrobe (e.g., user needs a blazer for Wedding Guest but doesn't have one), include shopping suggestions ONLY for that missing piece
3. For items from wardrobe, set "existingItem" to the item's ID and do NOT include shoppingKeywords
4. For missing items, include "shoppingKeywords" and "priceRange" but do NOT set "existingItem"

RESPOND IN JSON:
{
  "analysis": "Overall concept, which items are from wardrobe, which need to be purchased",
  "completeOutfit": [
    {
      "garmentType": "Shirt" | "Pants" | "Jacket" | "Blazer" | "Shoes" | "Accessories",
      "description": "Specific description",
      "existingItem": "item-id-if-from-wardrobe" (REQUIRED if using wardrobe item),
      "shoppingKeywords": ["keyword1", "keyword2"] (ONLY if item is missing from wardrobe),
      "colors": ["color1"],
      "styles": ["style1"],
      "priceRange": "budget" | "mid" | "premium" (ONLY if item is missing from wardrobe)
    }
  ]
}`;
        break;
      }

      case 'shopping-outfit':
        basePrompt += `\n\nTASK: Generate Complete Shopping Outfit
Occasion: ${occasion}
Style: ${stylePreference}
Price Range: ${request.priceRange || 'Not specified'}

Create a complete outfit with all items to purchase. Include specific descriptions for shopping.

RESPOND IN JSON:
{
  "analysis": "Overall concept and why this outfit works for the occasion",
  "completeOutfit": [
    {
      "garmentType": "Shirt" | "Pants" | "Jacket" | "Shoes" | "Accessories",
      "description": "Specific item description with colors, style, and materials",
      "shoppingKeywords": ["keyword1", "keyword2", "keyword3"],
      "colors": ["color1"],
      "styles": ["style1"],
      "priceRange": "budget" | "mid" | "premium"
    }
  ],
  "sizeRecommendations": [...]
}`;
        break;

      case 'mixed-outfit': {
        const wardrobeItems = request.wardrobeItems || [];
        let wardrobeContext = '';
        if (wardrobeItems.length > 0) {
          wardrobeContext = '\n\nUSER\'S WARDROBE:\n';
          wardrobeItems.forEach(item => {
            wardrobeContext += `- [ID: ${item.id}] ${item.garmentType}: ${item.color}${item.secondaryColor ? ` / ${item.secondaryColor} (reversible)` : ''}${item.material ? ` (${item.material})` : ''}${item.pattern && item.pattern !== 'solid' ? ` [${item.pattern}]` : ''}${item.brand ? ` - ${item.brand}` : ''}${item.size ? ` - Size: ${item.size}` : ''}\n`;
          });
        }
        
        basePrompt += `\n\nTASK: Generate Mixed Outfit (Wardrobe + Shopping)
Occasion: ${occasion}
Style: ${stylePreference}
Price Range: ${request.priceRange || 'Not specified'}${wardrobeContext}

CRITICAL INSTRUCTIONS:
1. USE items from the user's wardrobe whenever possible. Reference items by their ID using "existingItem": "item-id"
2. For items from wardrobe, set "existingItem" to the item's ID and do NOT include shoppingKeywords
3. For items to purchase, include "shoppingKeywords" and "priceRange" but do NOT set "existingItem"
4. Prefer using wardrobe items over shopping when both options exist

RESPOND IN JSON:
{
  "analysis": "Overall concept, which items are from wardrobe, which to buy",
  "completeOutfit": [
    {
      "garmentType": "Shirt" | "Pants" | "Jacket" | "Blazer" | "Shoes" | "Accessories",
      "description": "Specific description",
      "existingItem": "item-id-if-from-wardrobe" (REQUIRED if using wardrobe item),
      "shoppingKeywords": ["keyword1", "keyword2"] (ONLY if item needs purchase),
      "colors": ["color1"],
      "styles": ["style1"],
      "priceRange": "budget" | "mid" | "premium" (ONLY if item needs purchase)
    }
  ]
}`;
        break;
      }

      case 'wardrobe-categorization': {
        basePrompt += `\n\nTASK: Categorize Wardrobe Item
Analyze the photo and identify:
- Garment type: Be specific. Options include: Shirt, Dress Shirt, Henley, T-Shirt, Polo, Sweater, Hoodie, Pants, Chinos, Jeans, Shorts, Jacket, Blazer, Suit, Coat, Vest, Shoes, Boots, Dress Shoes, Loafers, Sneakers, Tie, Belt, Watch, Hat, or Accessories
- Color: Primary color (be specific: navy, charcoal, olive, etc. not just "blue" or "dark")
- Secondary color: If item is reversible (e.g., reversible belts with black on one side, brown on the other), note the secondary color
- Material: Fabric/material type (e.g., cotton, wool, linen, silk, polyester, denim, leather, suede, canvas, etc.)
- Pattern: Visual pattern (e.g., solid, striped, checked/plaid, paisley, polka dot, floral, geometric, herringbone, pinstripe, windowpane, gingham, etc.)
- Brand: If visible on tags or labels
- Style description: Fit, style details, etc.
- Photo quality: Assess if the photo is clear enough for accurate categorization. Consider: lighting, background (neutral vs cluttered), focus, whether the entire item is visible, if other items are in the frame.

IMPORTANT: 
- For garment type, choose the MOST SPECIFIC option (e.g., "Blazer" not "Jacket", "Chinos" not "Pants")
- For color, use specific color names (navy, charcoal, olive, burgundy, etc.)
- For material, be specific (e.g., "cotton" not "fabric", "wool" not "material")
- For pattern, be specific (e.g., "striped" not "patterned", "checked" not "plaid" - use "checked" for the pattern name)
- If pattern is not visible or item is solid, use "solid"
- If uncertain, choose the closest match
- Photo quality: If photo is blurry, has poor lighting, cluttered background, or shows multiple items, mark quality as "poor" and provide specific feedback

RESPOND IN JSON:
{
  "analysis": "Brief description of the item",
  "photoQuality": "good" | "poor",
  "photoQualityFeedback": "Specific feedback if quality is poor (e.g., 'Photo is blurry' or 'Background is cluttered - use neutral background')",
  "suggestions": [
    {
      "garmentType": "Shirt" | "Dress Shirt" | "Henley" | "T-Shirt" | "Polo" | "Sweater" | "Hoodie" | "Pants" | "Chinos" | "Jeans" | "Shorts" | "Jacket" | "Blazer" | "Suit" | "Coat" | "Vest" | "Shoes" | "Boots" | "Dress Shoes" | "Loafers" | "Sneakers" | "Tie" | "Belt" | "Watch" | "Hat" | "Accessories",
      "description": "Detailed description of the item including material, fit, and style",
      "colors": ["primary color", "secondary color if reversible (e.g., reversible belts)"],
      "material": "material type (e.g., cotton, wool, linen, etc.)",
      "pattern": "pattern type (e.g., solid, striped, checked, paisley, etc.)",
      "styles": ["style descriptor"]
    }
  ]
}`;
        break;
      }

      case 'item-regeneration': {
        const { garmentTypeToRegenerate, currentOutfitContext, occasion, stylePreference, priceRange } = request;
        const wardrobeItems = request.wardrobeItems || [];
        
        let wardrobeContext = '';
        if (wardrobeItems.length > 0) {
          wardrobeContext = '\n\nUSER\'S WARDROBE:\n';
          wardrobeItems.forEach(item => {
            wardrobeContext += `- [ID: ${item.id}] ${item.garmentType}: ${item.color}${item.secondaryColor ? ` / ${item.secondaryColor} (reversible)` : ''}${item.material ? ` (${item.material})` : ''}${item.pattern && item.pattern !== 'solid' ? ` [${item.pattern}]` : ''}${item.brand ? ` - ${item.brand}` : ''}${item.size ? ` - Size: ${item.size}` : ''}\n`;
          });
        }

        let outfitContext = '';
        if (currentOutfitContext && currentOutfitContext.length > 0) {
          outfitContext = '\n\nCURRENT OUTFIT:\n';
          currentOutfitContext.forEach((item, idx) => {
            outfitContext += `${idx + 1}. ${item.garmentType}: ${item.description}${item.existingItem ? ` (from wardrobe: ${item.existingItem})` : ''}\n`;
          });
        }

        basePrompt += `\n\nTASK: Regenerate Single Outfit Item
Occasion: ${occasion}
Style: ${stylePreference}
Item to Replace: ${garmentTypeToRegenerate}${wardrobeContext}${outfitContext}

CRITICAL INSTRUCTIONS:
1. Generate a DIFFERENT recommendation for ${garmentTypeToRegenerate} that still works with the rest of the outfit
2. The new item should match the occasion, style, and complement the other items in the outfit
3. If the user has ${garmentTypeToRegenerate} in their wardrobe, prefer using an existing item (set "existingItem" to the item ID)
4. If no suitable wardrobe item exists, provide shopping suggestions with "shoppingKeywords" and "priceRange"
5. Price range should be: ${priceRange || 'mid'}

RESPOND IN JSON:
{
  "analysis": "Brief explanation of why this new ${garmentTypeToRegenerate} works with the outfit",
  "completeOutfit": [
    {
      "garmentType": "${garmentTypeToRegenerate}",
      "description": "Specific description of the new item",
      "existingItem": "item-id-if-from-wardrobe",
      "shoppingKeywords": ["keyword1", "keyword2"],
      "colors": ["color1"],
      "styles": ["style1"],
      "priceRange": "${priceRange || 'mid'}"
    }
  ]
}`;
        break;
      }

      default:
        // Unknown request type - return base prompt only
        break;
    }

    return basePrompt;
  },

  async analyzeStyle(request: ClaudeVisionRequest): Promise<ClaudeVisionResponse> {
    try {
      console.log('[ClaudeVision] Starting analysis...');
      
      // Check cache for non-image requests (wardrobe, shopping, etc.)
      // Don't cache requests with images as they're unique
      const hasImages = request.imageBase64 && request.imageBase64.length > 0;
      if (!hasImages) {
        const cached = apiCache.get<ClaudeVisionResponse>(request);
        if (cached) {
          console.log('[ClaudeVision] Returning cached response');
          return cached;
        }
      }
      
      // request.imageBase64 can be either URIs or base64 strings
      // Check if first item is a URI (starts with file://, http://, https://, or content://)
      const firstImage = request.imageBase64[0];
      const isUri = firstImage && (
        firstImage.startsWith('file://') || 
        firstImage.startsWith('http://') || 
        firstImage.startsWith('https://') || 
        firstImage.startsWith('content://')
      );
      
      let imageContents: Array<{
        type: 'image';
        source: {
          type: 'base64';
          media_type: 'image/jpeg';
          data: string;
        };
      }>;
      
      if (isUri) {
        // These are URIs, need to compress and convert
        const compressedUris = await ImageCompressionService.compressImages(
          request.imageBase64 as string[]
        );
        
        // Validate compressed images
        const validImages = await Promise.all(
          compressedUris.map(async (uri) => {
            try {
              const isValid = await ImageCompressionService.validateImageSize(uri);
              return isValid ? uri : null;
            } catch (error) {
              console.error('[ClaudeVision] Image validation failed:', error);
              return null;
            }
          })
        );
        
        const validUris = validImages.filter((uri): uri is string => uri !== null);
        
        if (validUris.length === 0) {
          throw new Error('No valid images after compression');
        }
        
        // Convert compressed images to base64
        imageContents = await Promise.all(
          validUris.map(async (uri) => {
            const base64 = await this.imageToBase64(uri);
            return {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: 'image/jpeg' as const,
                data: base64,
              },
            };
          })
        );
      } else {
        // These are already base64 strings, use them directly
        imageContents = request.imageBase64.map((base64) => ({
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: 'image/jpeg' as const,
            data: base64,
          },
        }));
      }

      const prompt = this.buildPrompt(request);

      // Call Claude API with retry logic
      const response = await retryWithBackoff(
        () => anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: [
                ...imageContents,
                {
                  type: 'text',
                  text: prompt,
                },
              ],
            },
          ],
        }),
        {
          maxAttempts: 3,
          initialDelay: 1000,
          maxDelay: 10000,
        }
      );

      console.log('[ClaudeVision] Received response');

      // Parse response
      const textContent = response.content.find((c) => c.type === 'text');
      if (!textContent || textContent.type !== 'text') {
        throw new Error('No text response from Claude');
      }

      // Extract JSON (handle markdown code blocks)
      let jsonText = textContent.text.trim();
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const parsed = JSON.parse(jsonText);
      
      // Ensure suggestions have IDs
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        parsed.suggestions = parsed.suggestions.map((s: Partial<Suggestion> & { id?: string }, index: number) => ({
          ...s,
          id: s.id || `suggestion-${index}`,
        }));
      }
      
      // Ensure completeOutfit items have proper structure and match wardrobe items
      if (parsed.completeOutfit && Array.isArray(parsed.completeOutfit)) {
        const wardrobeItems = request.wardrobeItems || [];
        parsed.completeOutfit = parsed.completeOutfit.map((item: Partial<OutfitItem> & { existingItem?: string | ClosetItem }) => {
          // If existingItem is an ID string, find the matching wardrobe item
          let existingItemObj: ClosetItem | undefined = undefined;
          if (item.existingItem && typeof item.existingItem === 'string') {
            existingItemObj = wardrobeItems.find(w => w.id === item.existingItem) || undefined;
          } else if (item.existingItem && typeof item.existingItem === 'object') {
            // Already a ClosetItem object
            existingItemObj = item.existingItem;
          }
          
          return {
            ...item,
            existingItem: existingItemObj,
            shoppingOptions: item.shoppingOptions || [],
          };
        });
      }
      
      console.log('[ClaudeVision] Analysis complete');
      
      // Cache non-image responses for 5 minutes
      if (!hasImages) {
        apiCache.set(request, parsed, 5 * 60 * 1000);
      }
      
      return parsed;
    } catch (error) {
      console.error('[ClaudeVision] Analysis failed:', error);
      throw error;
    }
  },
};

