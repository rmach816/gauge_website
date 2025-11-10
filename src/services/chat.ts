import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '@env';
import { StorageService } from './storage';
import { HistoryService } from './history';
import { ClaudeVisionService } from './claude';
import { UserProfile, ClosetItem, ChatMessage, ChatSession } from '../types';
import uuid from 'react-native-uuid';

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

/**
 * ChatService
 * Handles chat sessions, message sending, context building
 * Implements premium chat feature with context retention
 */
export const ChatService = {
  /**
   * Start new chat session
   */
  async startSession(): Promise<ChatSession> {
    const session: ChatSession = {
      id: uuid.v4() as string,
      messages: [],
      startedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      active: true,
    };
    
    // Get user profile for personalized greeting
    const profile = await StorageService.getUserProfile();
    const lastName = profile?.lastName;
    
    // Add personalized welcome message
    const greeting = lastName
      ? `Hello, Mr. ${lastName}! I'm your personal tailor. I know your measurements, style preferences, and wardrobe. How can I help you today?`
      : "Hi! I'm your personal tailor. I know your measurements, style preferences, and wardrobe. How can I help you today?";
    
    session.messages.push({
      id: uuid.v4() as string,
      role: 'assistant',
      content: [{
        type: 'text',
        text: greeting,
      }],
      timestamp: new Date().toISOString(),
    });
    
    return session;
  },

  /**
   * Build context for Claude API
   * Includes measurements, wardrobe, preferences, and price context (IMPORTANT FIX #5)
   */
  async buildSystemContext(profile: UserProfile, wardrobe: ClosetItem[]): Promise<string> {
    // Personalize context with client's name
    const clientName = profile.lastName ? `Mr. ${profile.lastName}` : 'your client';
    
    // Enhanced logging to debug measurement issues
    console.log('[ChatService] Building context with profile:', {
      profileId: profile.id,
      hasMeasurements: !!profile.measurements,
      measurementsType: typeof profile.measurements,
      measurements: profile.measurements,
      measurementsKeys: profile.measurements ? Object.keys(profile.measurements) : [],
      hasShoeSize: !!profile.shoeSize,
      shoeSize: profile.shoeSize,
      stylePreference: profile.stylePreference,
      profileKeys: Object.keys(profile),
    });
    
    let context = `You are a sophisticated personal tailor helping ${clientName} with style advice. 
You know them well and provide warm, professional guidance.

YOUR ROLE AND SCOPE:
You are EXCLUSIVELY a personal tailor and style advisor. Your expertise is in:
- Clothing fit, sizing, and measurements
- Fashion styling and outfit coordination
- Wardrobe recommendations
- Fabric and garment care
- Shopping guidance for clothing, shoes, and accessories
- Color coordination and style preferences

If asked about topics OUTSIDE of clothing, fashion, style, or appearance:
- Politely acknowledge the question
- Gently redirect to your area of expertise
- Example: "I appreciate the question, but I'm here to help with your wardrobe and style. Is there anything fashion-related I can assist you with today?"

IMPORTANT: Keep responses concise (3-4 sentences max) unless asked for detailed advice. 
Be conversational and natural, like a real tailor would speak.

ABSOLUTELY CRITICAL - YOU HAVE ACCESS TO ALL CLIENT DATA:
You have COMPLETE access to the client's measurements, style preferences, shoe size, and wardrobe.
When asked "what are my measurements?" or "do you know my measurements?", you MUST provide ALL measurements listed below.
NEVER say you don't have access to measurements - you have full access to all their data.`;
    
    // Add client's name for personalization
    if (profile.lastName) {
      context += `\n\nCLIENT NAME: ${profile.lastName}
Always address the client as "Mr. ${profile.lastName}" in your responses to maintain a formal, premium relationship.`;
    }

    // Add measurements if available - THIS IS CRITICAL
    if (profile.measurements && typeof profile.measurements === 'object') {
      const m = profile.measurements;
      
      // Validate that measurements have required fields
      const hasRequiredFields = m.chest && m.waist && m.neck && m.sleeve && m.shoulder && m.inseam;
      
      if (!hasRequiredFields) {
        console.error('[ChatService] ERROR: Measurements object exists but is missing required fields:', {
          hasChest: !!m.chest,
          hasWaist: !!m.waist,
          hasNeck: !!m.neck,
          hasSleeve: !!m.sleeve,
          hasShoulder: !!m.shoulder,
          hasInseam: !!m.inseam,
          measurementsObject: m,
        });
        context += `\n\nWARNING: Client measurements are incomplete. Some measurement fields are missing.`;
      } else {
        // Log measurements for debugging
        console.log('[ChatService] Building context with VALID measurements:', {
          chest: m.chest,
          waist: m.waist,
          neck: m.neck,
          sleeve: m.sleeve,
          shoulder: m.shoulder,
          inseam: m.inseam,
          height: m.height,
          weight: m.weight,
        });
        
        // Calculate jacket size: chest measurement IS the jacket size number
        // R/L/S is based on shoulder width and height
        const jacketSize = `${m.chest}${m.shoulder >= 18 ? 'L' : m.shoulder <= 16 ? 'S' : 'R'}`;
        
        context += `\n\n═══════════════════════════════════════════════════════════
CLIENT MEASUREMENTS - YOU HAVE COMPLETE ACCESS TO THESE VALUES
═══════════════════════════════════════════════════════════

YOUR CLIENT'S EXACT MEASUREMENTS:
- Height: ${Math.floor(m.height / 12)}' ${m.height % 12}" (${m.height} inches total)
- Weight: ${m.weight} lbs
- Chest: ${m.chest} inches
- Waist: ${m.waist} inches
- Inseam: ${m.inseam} inches
- Neck: ${m.neck} inches
- Sleeve: ${m.sleeve} inches
- Shoulder: ${m.shoulder} inches
- Preferred fit: ${m.preferredFit || 'regular'}

IF THE CLIENT ASKS "WHAT ARE MY MEASUREMENTS?" - RESPOND WITH ALL OF THE ABOVE.
NEVER say you don't have this information. You have complete access to all measurements.

EXACT SIZE RECOMMENDATIONS (USE THESE EXACT SIZES - DO NOT CALCULATE OR ESTIMATE):
- Shirt size: ${m.neck}/${m.sleeve} (based on Neck ${m.neck}" and Sleeve ${m.sleeve}")
- Jacket/Blazer size: ${jacketSize} (based on Chest ${m.chest}" - the jacket size number MUST match the chest measurement)
- Pants size: ${m.waist}x${m.inseam} (based on Waist ${m.waist}" and Inseam ${m.inseam}")

CRITICAL SIZING RULES - USE EXACT MEASUREMENTS, NO CALCULATIONS:
1. For jackets/blazers: Size MUST be "${jacketSize}" (chest ${m.chest}", shoulder ${m.shoulder}"). DO NOT subtract, add, or adjust. The number ${m.chest} is the exact jacket size.
2. For shirts: Size MUST be "${m.neck}/${m.sleeve}" (neck ${m.neck}", sleeve ${m.sleeve}"). Use these exact numbers.
3. For pants: Size MUST be "${m.waist}x${m.inseam}" (waist ${m.waist}", inseam ${m.inseam}"). Use these exact numbers.
4. For ALL garments: Use the measurements EXACTLY as provided. DO NOT:
   - Subtract inches for "fitted" looks
   - Add inches for "comfortable" fits
   - Round up or down
   - Make any adjustments whatsoever
5. When asked about ANY size (blazer, jacket, shirt, pants, etc.), respond with the EXACT size from the recommendations above.
6. If asked about shoulder width, respond with "${m.shoulder} inches" - the exact measurement.
7. If asked about sleeve length, respond with "${m.sleeve} inches" - the exact measurement.
8. NEVER say "approximately" or "around" - use the exact numbers provided.
9. If the client asks "what are my measurements?" or "do you know my measurements?", you MUST respond with ALL the measurements listed above. You have complete access to their measurements.`;
      }
    } else {
      // Even if measurements are missing, tell AI to check - this helps catch data issues
      console.error('[ChatService] ERROR: Profile has no measurements object!', {
        profileId: profile.id,
        measurementsValue: profile.measurements,
        measurementsType: typeof profile.measurements,
        profileKeys: Object.keys(profile),
      });
      context += `\n\nWARNING: Client measurements are not currently available in the system. 
If asked about measurements or sizing, inform the client that measurements need to be entered in the app settings.
DO NOT say you have access to measurements if they are not listed above.`;
    }

    // Add style preferences
    const stylePrefs = profile.stylePreference?.join(', ') || 'Not specified';
    const occasions = profile.favoriteOccasions?.join(', ') || 'Not specified';
    context += `\n\nSTYLE PREFERENCES (USE THESE WHEN MAKING RECOMMENDATIONS):
- Overall style: ${stylePrefs}
- Favorite occasions: ${occasions}

IMPORTANT: When suggesting outfits, clothing items, or style advice, ALWAYS consider and reference these style preferences. 
If the client's style is "${stylePrefs}", tailor your recommendations to match this aesthetic.
If they have favorite occasions like "${occasions}", suggest appropriate attire for those occasions.`;

    // Add shoe size if available
    if (profile.shoeSize) {
      context += `\n\nSHOE SIZE: ${profile.shoeSize}

CRITICAL: When recommending shoes, boots, dress shoes, sneakers, or any footwear:
- ALWAYS suggest size ${profile.shoeSize}
- NEVER suggest a different size
- Reference this size explicitly: "I recommend size ${profile.shoeSize} shoes"
- If asked "what size shoes should I wear?", respond with "${profile.shoeSize}"`;
    }

    // Add wardrobe summary
    if (wardrobe.length > 0) {
      context += `\n\nCLIENT'S WARDROBE (${wardrobe.length} items):`;
      
      // Group by garment type
      const grouped = wardrobe.reduce((acc, item) => {
        if (!acc[item.garmentType]) acc[item.garmentType] = [];
        acc[item.garmentType].push(item);
        return acc;
      }, {} as Record<string, ClosetItem[]>);
      
      Object.entries(grouped).forEach(([type, items]) => {
        context += `\n${type}s:`;
        items.forEach(item => {
          const details = [
            item.color,
            item.material ? `(${item.material})` : '',
            item.pattern && item.pattern !== 'solid' ? `[${item.pattern}]` : '',
            item.brand || '',
            item.size ? `Size: ${item.size}` : '',
            item.notes || '',
          ].filter(Boolean).join(' ');
          context += `\n  - [ITEM_ID:${item.id}] ${details}`.trim();
        });
      });
      
      context += `\n\nIMPORTANT: When referencing specific wardrobe items in your responses, use the format [ITEM_ID:xxx] where xxx is the item's ID. This allows the app to display the actual item image. For example: "Your [ITEM_ID:abc123] navy cotton shirt would pair perfectly."`;
    }

    // Add price context for shopping suggestions (IMPORTANT FIX #5)
    context += `\n\nWhen suggesting shopping items, always mention expected price range:
- Budget items: typically $25-$50
- Mid-range items: typically $50-$100  
- Premium items: typically $100-$200

Example: "A navy cotton dress shirt (typically $40-60) would work perfectly."

When referencing wardrobe items, describe them naturally ("your gray wool pants") 
and include the item ID using [ITEM_ID:xxx] format so the app can display the actual item.
For example: "Your [ITEM_ID:abc123] gray wool pants would pair perfectly with this."

When the user asks to "see" an item or "show" an item, make sure to include the [ITEM_ID:xxx] 
reference so the app can display it visually.

When suggesting shopping, provide specific item descriptions that can be searched for.`;

    return context;
  },

  /**
   * Send message and get AI response
   * Handles both text and image messages
   */
  async sendMessage(
    session: ChatSession,
    userMessage: ChatMessage,
    profile: UserProfile,
    wardrobe: ClosetItem[]
  ): Promise<ChatMessage> {
    try {
      // Add user message to session
      session.messages.push(userMessage);
      
      // If user selected specific wardrobe items, add them to context
      let enhancedContext = '';
      if (userMessage.wardrobeItems && userMessage.wardrobeItems.length > 0) {
        enhancedContext = `\n\nUSER IS REFERENCING THESE SPECIFIC WARDROBE ITEMS IN THIS MESSAGE:`;
        userMessage.wardrobeItems.forEach((item, index) => {
          const details = [
            item.garmentType,
            item.color + (item.secondaryColor ? ` / ${item.secondaryColor}` : ''),
            item.material ? `(${item.material})` : '',
            item.pattern && item.pattern !== 'solid' ? `[${item.pattern}]` : '',
            item.brand || '',
            item.size ? `Size: ${item.size}` : '',
            item.notes || '',
          ].filter(Boolean).join(' ');
          enhancedContext += `\n${index + 1}. ${details}`.trim();
        });
        enhancedContext += `\n\nPay special attention to these items when responding. Reference them specifically if relevant.`;
      }
      
      // Build system context
      const systemContext = await this.buildSystemContext(profile, wardrobe);
      const fullContext = systemContext + enhancedContext;
      
      // Log the full context length and key parts for debugging
      console.log('[ChatService] Sending to Claude:', {
        contextLength: fullContext.length,
        hasMeasurements: !!profile.measurements,
        measurementsIncluded: fullContext.includes('CLIENT MEASUREMENTS'),
        systemContextLength: systemContext.length,
        profileId: profile.id,
        profileMeasurements: profile.measurements,
      });
      
      // Log a snippet of the context to verify measurements are included
      if (fullContext.includes('CLIENT MEASUREMENTS')) {
        const measurementsStart = fullContext.indexOf('CLIENT MEASUREMENTS');
        const measurementsSnippet = fullContext.substring(measurementsStart, measurementsStart + 500);
        console.log('[ChatService] Measurements section in context:', measurementsSnippet);
      } else {
        console.error('[ChatService] ERROR: Measurements NOT found in context!');
        console.log('[ChatService] Full context preview:', fullContext.substring(0, 1000));
      }
      
      // Prepare messages for Claude API
      // Exclude the welcome message (first assistant message) from API call
      const messagesToSend = session.messages.filter(
        (msg, index) => !(msg.role === 'assistant' && index === 0)
      );
      
      const apiMessages = await Promise.all(
        messagesToSend.map(async (msg) => {
            const content = await Promise.all(
              msg.content.map(async (c) => {
                if (c.type === 'text') {
                  return {
                    type: 'text' as const,
                    text: c.text || '',
                  };
                } else if (c.type === 'image' && c.imageUri) {
                  // Convert image URI to base64
                  const base64 = await ClaudeVisionService.imageToBase64(c.imageUri);
                  return {
                    type: 'image' as const,
                    source: {
                      type: 'base64' as const,
                      media_type: 'image/jpeg' as const,
                      data: base64,
                    },
                  };
                }
                return null;
              })
            );
            
            return {
              role: msg.role,
              content: content.filter((c): c is NonNullable<typeof c> => c !== null),
            };
          })
      );
      
      // Call Claude API
      console.log('[ChatService] Calling Claude API with system context length:', fullContext.length);
      console.log('[ChatService] System context preview (first 500 chars):', fullContext.substring(0, 500));
      
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        system: fullContext,
        messages: apiMessages,
      });
      
      console.log('[ChatService] Claude API response received');
      
      // Extract response text
      const textContent = response.content.find(c => c.type === 'text');
      let responseText = textContent?.type === 'text' ? textContent.text : 'I apologize, but I encountered an error.';
      
      // Parse item references from AI response (format: [ITEM_ID:xxx])
      const itemIdPattern = /\[ITEM_ID:([^\]]+)\]/g;
      const referencedItemIds: string[] = [];
      let match;
      
      while ((match = itemIdPattern.exec(responseText)) !== null) {
        referencedItemIds.push(match[1]);
      }
      
      // Find referenced items from wardrobe
      const referencedItems: ClosetItem[] = [];
      if (referencedItemIds.length > 0) {
        referencedItemIds.forEach(itemId => {
          const item = wardrobe.find(w => w.id === itemId);
          if (item) {
            referencedItems.push(item);
          }
        });
      }
      
      // Clean response text by removing [ITEM_ID:xxx] markers for display
      responseText = responseText.replace(/\[ITEM_ID:[^\]]+\]/g, '');
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: uuid.v4() as string,
        role: 'assistant',
        content: [{
          type: 'text',
          text: responseText,
        }],
        wardrobeItems: referencedItems.length > 0 ? referencedItems : undefined,
        timestamp: new Date().toISOString(),
      };
      
      // Add to session
      session.messages.push(assistantMessage);
      session.lastMessageAt = new Date().toISOString();
      
      return assistantMessage;
    } catch (error) {
      console.error('[ChatService] Send message failed:', error);
      
      // Return error message
      return {
        id: uuid.v4() as string,
        role: 'assistant',
        content: [{
          type: 'text',
          text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        }],
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Save session to history
   */
  async saveSession(session: ChatSession): Promise<void> {
    await HistoryService.saveCheck({
      id: session.id,
      type: 'chat-session',
      result: session as any,
      createdAt: session.startedAt,
    });
  },

  /**
   * Load recent session
   */
  async loadRecentSession(): Promise<ChatSession | null> {
    const history = await HistoryService.getCheckHistory();
    const recentChat = history.find(h => h.type === 'chat-session');
    
    if (recentChat && recentChat.result) {
      const session = recentChat.result as any;
      // Mark as active if it's recent (within last 24 hours)
      const lastMessage = new Date(session.lastMessageAt);
      const now = new Date();
      const hoursSinceLastMessage = (now.getTime() - lastMessage.getTime()) / (1000 * 60 * 60);
      session.active = hoursSinceLastMessage < 24;
      return session as ChatSession;
    }
    
    return null;
  },
};

