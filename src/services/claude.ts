import Anthropic from '@anthropic-ai/sdk';
import * as FileSystem from 'expo-file-system';
import { ANTHROPIC_API_KEY } from '@env';
import {
  ClaudeVisionRequest,
  ClaudeVisionResponse,
  Suggestion,
  OutfitItem,
} from '../types';
import { ImageCompressionService } from '../utils/imageCompression';

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

export const ClaudeVisionService = {
  async imageToBase64(uri: string): Promise<string> {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('[ClaudeVision] Failed to convert image:', error);
      throw error;
    }
  },

  buildPrompt(request: ClaudeVisionRequest): string {
    const { requestType, userMeasurements, occasion, stylePreference } = request;

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
    }

    return basePrompt;
  },

  async analyzeStyle(request: ClaudeVisionRequest): Promise<ClaudeVisionResponse> {
    try {
      console.log('[ClaudeVision] Starting analysis...');
      
      // Compress images before processing (reduces API costs by ~80-90%)
      const compressedUris = await ImageCompressionService.compressImages(
        request.imageBase64
      );
      
      // Validate compressed images
      const validImages = await Promise.all(
        compressedUris.map(async (uri) => {
          const isValid = await ImageCompressionService.validateImageSize(uri);
          return isValid ? uri : null;
        })
      );
      
      const validUris = validImages.filter((uri): uri is string => uri !== null);
      
      if (validUris.length === 0) {
        throw new Error('No valid images after compression');
      }
      
      // Convert compressed images to base64
      const imageContents = await Promise.all(
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

      const prompt = this.buildPrompt(request);

      // Call Claude API
      const response = await anthropic.messages.create({
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
      });

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
      
      // Ensure completeOutfit items have proper structure
      if (parsed.completeOutfit && Array.isArray(parsed.completeOutfit)) {
        parsed.completeOutfit = parsed.completeOutfit.map((item: Partial<OutfitItem>) => ({
          ...item,
          shoppingOptions: item.shoppingOptions || [],
        }));
      }
      
      console.log('[ClaudeVision] Analysis complete');
      return parsed;
    } catch (error) {
      console.error('[ClaudeVision] Analysis failed:', error);
      throw error;
    }
  },
};

