# GAUGE - Tagged Outfit Memory Feature (v1.2 - Improved)

**Purpose**: Add simple cross-session memory to Chat feature so AI can recall past outfits by occasion, date, or context.

**When to Implement**: After MVP launch, as first major update (v1.2)

**Implementation Time**: 5-6 days (updated from 3-4 days)

**User Value**: "Remember that business meeting outfit?" → AI recalls it instantly

---

## Overview

### The Problem
**MVP limitation**: Chat only remembers within a single session. Users can't reference past conversations.

```
User: "Remember that outfit I wore for the business meeting?"
AI (MVP): ❌ "I don't have access to our previous conversations..."
```

### The Solution
Auto-save every outfit suggested in chat with searchable tags. AI can recall them later. Users can also manually save outfits.

```
User: "Remember that outfit I wore for the business meeting?"
AI (v1.2): ✅ "Yes! On January 15th we discussed your client 
            presentation. You wore the navy blazer with gray 
            pants, white shirt, and brown oxfords. Want 
            something similar?"
```

### How It Works
1. During chat, when AI suggests outfit → Auto-save with metadata (using Claude extraction)
2. User can manually save outfits → "Save this outfit" button
3. User asks about past outfit → Search saved outfits by keywords (with fuzzy matching)
4. Re-inject found outfit into current conversation context
5. AI responds naturally, referencing the past outfit

---

## Technical Architecture

### Data Model

**New Type: SavedOutfit**

```typescript
// Add to src/types/index.ts

export interface SavedOutfit {
  id: string;
  userId: string;
  
  // Core outfit data
  items: OutfitItem[];
  totalPrice?: number;
  
  // Context metadata
  occasion?: Occasion | string;
  description: string;           // "Navy blazer business dinner outfit"
  userQuery: string;              // Original user question
  aiResponse?: string;            // Full AI response (for context)
  
  // Search/recall
  tags: string[];                 // ["business", "dinner", "formal", "navy", "blazer"]
  keywords: string[];             // Extracted key terms
  
  // Timestamps & tracking
  createdAt: string;
  chatSessionId: string;
  source: 'chat' | 'outfit-builder' | 'wardrobe' | 'manual';
  
  // User actions
  wasFavorited: boolean;
  timesReferenced: number;        // Track how often user asks about it
  lastReferencedAt?: string;
  
  // Extraction metadata
  extractionConfidence?: number;   // 0-1, how confident we are in extraction
  manuallyEdited?: boolean;       // User corrected the outfit
}

export interface OutfitSearchResult {
  outfit: SavedOutfit;
  matchScore: number;             // 0-1 relevance score
  matchedKeywords: string[];      // Which keywords matched
  matchType: 'exact' | 'fuzzy' | 'semantic'; // How it matched
}
```

### Storage Service Updates

**Add to src/services/storage.ts:**

```typescript
export const StorageService = {
  // ... existing methods
  
  // OUTFIT MEMORY
  async getSavedOutfits(): Promise<SavedOutfit[]> {
    try {
      const data = await AsyncStorage.getItem('@gauge_saved_outfits');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[StorageService] Failed to get saved outfits:', error);
      return [];
    }
  },
  
  async saveOutfit(outfit: SavedOutfit): Promise<void> {
    try {
      const outfits = await this.getSavedOutfits();
      outfits.unshift(outfit); // Most recent first
      
      // Smart pruning (keep favorited, recently referenced, and recent)
      const pruned = this.pruneOutfits(outfits);
      
      await AsyncStorage.setItem(
        '@gauge_saved_outfits',
        JSON.stringify(pruned)
      );
    } catch (error) {
      console.error('[StorageService] Failed to save outfit:', error);
      throw error;
    }
  },
  
  /**
   * Smart pruning: Keep favorited, recently referenced, and recent outfits
   */
  private pruneOutfits(outfits: SavedOutfit[], maxCount: number = 100): SavedOutfit[] {
    const now = Date.now();
    const dayMs = 1000 * 60 * 60 * 24;
    
    // Never delete favorited
    const favorited = outfits.filter(o => o.wasFavorited);
    
    // Keep recently referenced (last 90 days)
    const recentlyReferenced = outfits.filter(o => {
      if (!o.lastReferencedAt) return false;
      const daysSince = (now - new Date(o.lastReferencedAt).getTime()) / dayMs;
      return daysSince < 90;
    });
    
    // Keep very recent (last 30 days)
    const veryRecent = outfits.filter(o => {
      const daysSince = (now - new Date(o.createdAt).getTime()) / dayMs;
      return daysSince < 30;
    });
    
    // Combine and deduplicate
    const toKeep = new Map<string, SavedOutfit>();
    
    [...favorited, ...recentlyReferenced, ...veryRecent].forEach(outfit => {
      toKeep.set(outfit.id, outfit);
    });
    
    // Fill remaining slots with most recent
    const remaining = outfits
      .filter(o => !toKeep.has(o.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, maxCount - toKeep.size);
    
    remaining.forEach(outfit => {
      toKeep.set(outfit.id, outfit);
    });
    
    return Array.from(toKeep.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  async updateOutfit(outfitId: string, updates: Partial<SavedOutfit>): Promise<void> {
    try {
      const outfits = await this.getSavedOutfits();
      const index = outfits.findIndex(o => o.id === outfitId);
      
      if (index !== -1) {
        outfits[index] = { ...outfits[index], ...updates };
        await AsyncStorage.setItem(
          '@gauge_saved_outfits',
          JSON.stringify(outfits)
        );
      }
    } catch (error) {
      console.error('[StorageService] Failed to update outfit:', error);
      throw error;
    }
  },
  
  async deleteOutfit(outfitId: string): Promise<void> {
    try {
      const outfits = await this.getSavedOutfits();
      const filtered = outfits.filter(o => o.id !== outfitId);
      await AsyncStorage.setItem(
        '@gauge_saved_outfits',
        JSON.stringify(filtered)
      );
    } catch (error) {
      console.error('[StorageService] Failed to delete outfit:', error);
      throw error;
    }
  },
};
```

---

## Outfit Memory Service

**Create new file: src/services/outfitMemory.ts**

```typescript
import { StorageService } from './storage';
import { SavedOutfit, OutfitSearchResult, OutfitItem, Occasion } from '../types';
import { ClaudeVisionService } from './claude';
import uuid from 'react-native-uuid';

// Install: npm install fuse.js
import Fuse from 'fuse.js';

export const OutfitMemoryService = {
  /**
   * Extract searchable keywords from outfit description and context
   * Enhanced with more comprehensive keyword list
   */
  extractKeywords(description: string, occasion?: string, userQuery?: string): string[] {
    const text = `${description} ${occasion || ''} ${userQuery || ''}`.toLowerCase();
    
    // Expanded style keywords
    const styleKeywords = [
      // Occasions
      'business', 'casual', 'formal', 'wedding', 'interview', 'date',
      'dinner', 'party', 'meeting', 'presentation', 'office', 'work',
      'cocktail', 'gala', 'funeral', 'graduation', 'prom',
      
      // Seasons
      'summer', 'winter', 'spring', 'fall', 'autumn',
      
      // Colors
      'navy', 'black', 'gray', 'grey', 'blue', 'brown', 'white', 'beige',
      'tan', 'khaki', 'charcoal', 'burgundy', 'maroon',
      
      // Garments
      'blazer', 'suit', 'jeans', 'chinos', 'shirt', 'shoes', 'tie',
      'jacket', 'coat', 'pants', 'trousers', 'slacks', 'oxfords',
      'loafers', 'boots', 'sneakers', 'dress shirt', 'polo',
      
      // Styles
      'professional', 'smart', 'dressy', 'relaxed', 'sporty',
      'elegant', 'classic', 'modern', 'trendy', 'conservative',
    ];
    
    const found = styleKeywords.filter(keyword => text.includes(keyword));
    return [...new Set(found)]; // Remove duplicates
  },

  /**
   * Generate searchable tags from outfit context
   */
  generateTags(outfit: {
    description: string;
    occasion?: string;
    items: OutfitItem[];
    userQuery?: string;
  }): string[] {
    const tags: string[] = [];
    
    // Add occasion
    if (outfit.occasion) {
      tags.push(outfit.occasion.toLowerCase());
    }
    
    // Add garment types
    outfit.items.forEach(item => {
      tags.push(item.garmentType.toLowerCase().replace(/_/g, ' '));
    });
    
    // Add colors from items
    outfit.items.forEach(item => {
      if (item.description) {
        const colorMatch = item.description.match(/\b(navy|black|gray|blue|brown|white|beige|tan|khaki|charcoal|burgundy|maroon)\b/i);
        if (colorMatch) {
          tags.push(colorMatch[0].toLowerCase());
        }
      }
    });
    
    // Add extracted keywords
    const keywords = this.extractKeywords(
      outfit.description,
      outfit.occasion,
      outfit.userQuery
    );
    tags.push(...keywords);
    
    // Remove duplicates
    return [...new Set(tags)];
  },

  /**
   * Extract outfit from AI response using Claude (more reliable than regex)
   */
  async extractOutfitFromResponse(
    response: string,
    userQuery: string
  ): Promise<{ items: OutfitItem[]; description: string; confidence: number } | null> {
    try {
      // Use Claude to extract structured outfit data
      const extractionPrompt = `Extract outfit information from this style advice. Return ONLY valid JSON, no other text.

AI Response: "${response}"

User Query: "${userQuery}"

Extract:
1. List of garments mentioned (type, color, description)
2. Overall outfit description (1-2 sentences)
3. Occasion if mentioned
4. Confidence score (0-1) for extraction accuracy

Return JSON format:
{
  "items": [
    {
      "garmentType": "BLAZER",
      "description": "navy blazer",
      "color": "navy"
    }
  ],
  "description": "Navy blazer business outfit",
  "occasion": "business meeting",
  "confidence": 0.9
}

If no clear outfit is suggested, return null.`;

      const extractionResponse = await ClaudeVisionService.sendMessage({
        messages: [{
          role: 'user',
          content: extractionPrompt,
        }],
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 500,
      });

      // Parse JSON response
      const jsonMatch = extractionResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const extracted = JSON.parse(jsonMatch[0]);
      
      if (!extracted.items || extracted.items.length === 0) {
        return null;
      }

      // Map to OutfitItem format
      const items: OutfitItem[] = extracted.items.map((item: any) => ({
        garmentType: item.garmentType as any,
        description: item.description || `${item.color || ''} ${item.garmentType}`.trim(),
        shoppingOptions: [],
      }));

      return {
        items,
        description: extracted.description || 'Outfit from chat',
        confidence: extracted.confidence || 0.7,
      };
    } catch (error) {
      console.error('[OutfitMemory] Extraction failed:', error);
      return null;
    }
  },

  /**
   * Save outfit from chat conversation
   */
  async saveOutfitFromChat(params: {
    items: OutfitItem[];
    description: string;
    userQuery: string;
    occasion?: string;
    chatSessionId: string;
    totalPrice?: number;
    aiResponse?: string;
    extractionConfidence?: number;
  }): Promise<SavedOutfit> {
    const outfit: SavedOutfit = {
      id: uuid.v4() as string,
      userId: 'current-user', // Update with actual user ID if multi-user
      items: params.items,
      totalPrice: params.totalPrice,
      occasion: params.occasion,
      description: params.description,
      userQuery: params.userQuery,
      aiResponse: params.aiResponse,
      tags: this.generateTags({
        description: params.description,
        occasion: params.occasion,
        items: params.items,
        userQuery: params.userQuery,
      }),
      keywords: this.extractKeywords(
        params.description,
        params.occasion,
        params.userQuery
      ),
      createdAt: new Date().toISOString(),
      chatSessionId: params.chatSessionId,
      source: 'chat',
      wasFavorited: false,
      timesReferenced: 0,
      extractionConfidence: params.extractionConfidence,
      manuallyEdited: false,
    };
    
    await StorageService.saveOutfit(outfit);
    console.log('[OutfitMemory] Saved outfit:', outfit.id, outfit.tags);
    
    return outfit;
  },

  /**
   * Search saved outfits with fuzzy matching
   */
  async searchOutfits(query: string): Promise<OutfitSearchResult[]> {
    const outfits = await StorageService.getSavedOutfits();
    
    if (outfits.length === 0) return [];
    
    // Use Fuse.js for fuzzy search
    const fuse = new Fuse(outfits, {
      keys: [
        { name: 'tags', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'userQuery', weight: 0.2 },
        { name: 'keywords', weight: 0.1 },
      ],
      threshold: 0.4, // 0 = exact match, 1 = match anything
      includeScore: true,
      minMatchCharLength: 2,
    });
    
    const searchResults = fuse.search(query);
    
    // Parse date references ("last month", "two weeks ago")
    const dateBoost = this.parseDateReference(query);
    
    // Calculate final scores
    const results: OutfitSearchResult[] = searchResults.map(result => {
      const outfit = result.item;
      let score = 1 - (result.score || 0); // Convert Fuse score (lower is better) to match score (higher is better)
      
      // Determine match type
      let matchType: 'exact' | 'fuzzy' | 'semantic' = 'fuzzy';
      if (result.score === 0) matchType = 'exact';
      else if (result.score < 0.3) matchType = 'semantic';
      
      // Boost recent outfits
      const daysSinceCreated = 
        (Date.now() - new Date(outfit.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) score += 0.2;
      else if (daysSinceCreated < 30) score += 0.1;
      
      // Boost frequently referenced outfits
      score += Math.min(outfit.timesReferenced * 0.1, 0.3);
      
      // Apply date boost if query references time
      if (dateBoost && outfit.createdAt) {
        const outfitDate = new Date(outfit.createdAt);
        if (this.isDateInRange(outfitDate, dateBoost)) {
          score += 0.3;
        }
      }
      
      // Extract matched keywords
      const matchedKeywords: string[] = [];
      const queryTerms = query.toLowerCase().split(/\s+/);
      
      queryTerms.forEach(term => {
        if (outfit.tags.some(tag => tag.includes(term) || term.includes(tag))) {
          matchedKeywords.push(term);
        }
      });
      
      return {
        outfit,
        matchScore: Math.min(score, 1), // Cap at 1.0
        matchedKeywords,
        matchType,
      };
    });
    
    // Filter and sort
    return results
      .filter(r => r.matchScore > 0.2) // Only return decent matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3); // Return top 3 matches
  },

  /**
   * Parse date references in query ("last month", "two weeks ago")
   */
  parseDateReference(query: string): { start: Date; end: Date } | null {
    const lowerQuery = query.toLowerCase();
    const now = new Date();
    
    // "last week", "last month", "last year"
    if (lowerQuery.includes('last week')) {
      const start = new Date(now);
      start.setDate(start.getDate() - 14);
      return { start, end: new Date(now) };
    }
    
    if (lowerQuery.includes('last month')) {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 2);
      return { start, end: new Date(now) };
    }
    
    // "two weeks ago", "three months ago"
    const weeksAgo = lowerQuery.match(/(\d+)\s*weeks?\s*ago/);
    if (weeksAgo) {
      const weeks = parseInt(weeksAgo[1]);
      const start = new Date(now);
      start.setDate(start.getDate() - (weeks + 1) * 7);
      const end = new Date(now);
      end.setDate(end.getDate() - (weeks - 1) * 7);
      return { start, end };
    }
    
    return null;
  },

  /**
   * Check if date is in range
   */
  isDateInRange(date: Date, range: { start: Date; end: Date }): boolean {
    return date >= range.start && date <= range.end;
  },

  /**
   * Mark outfit as referenced (user asked about it)
   */
  async markOutfitReferenced(outfitId: string): Promise<void> {
    const outfits = await StorageService.getSavedOutfits();
    const outfit = outfits.find(o => o.id === outfitId);
    
    if (outfit) {
      await StorageService.updateOutfit(outfitId, {
        timesReferenced: outfit.timesReferenced + 1,
        lastReferencedAt: new Date().toISOString(),
      });
    }
  },

  /**
   * Format outfit for AI context (concise version)
   */
  formatOutfitForContext(outfit: SavedOutfit): string {
    const date = new Date(outfit.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    
    const items = outfit.items.map(item => 
      `${item.garmentType.replace(/_/g, ' ')}: ${item.description}`
    ).join(', ');
    
    return `Past outfit (${date}): ${outfit.description}
Items: ${items}
Context: ${outfit.userQuery}`;
  },
};
```

---

## Chat Service Updates

**Update src/services/chat.ts:**

```typescript
import { OutfitMemoryService } from './outfitMemory';

export const ChatService = {
  // ... existing methods
  
  /**
   * Enhanced system context with outfit memory
   */
  async buildSystemContext(
    profile: UserProfile,
    wardrobe: ClosetItem[]
  ): Promise<string> {
    let context = `You are a sophisticated personal tailor helping your client with style advice. 
You know them well and provide warm, professional guidance.

IMPORTANT: Keep responses concise (3-4 sentences max) unless asked for detailed advice. 
Be conversational and natural, like a real tailor would speak.`;

    // Add measurements (existing code)
    if (profile.measurements) {
      const m = profile.measurements;
      context += `\n\nCLIENT MEASUREMENTS:
- Height: ${Math.floor(m.height / 12)}' ${m.height % 12}"
- Weight: ${m.weight} lbs
- Chest: ${m.chest}", Waist: ${m.waist}", Inseam: ${m.inseam}"
- Neck: ${m.neck}", Sleeve: ${m.sleeve}", Shoulder: ${m.shoulder || 'N/A'}"
- Preferred fit: ${m.preferredFit}`;
    }

    // Add style preferences (existing code)
    context += `\n\nSTYLE PREFERENCES:
- Overall style: ${profile.stylePreference || 'Not set'}`;

    // Add wardrobe summary (existing code)
    if (wardrobe.length > 0) {
      context += `\n\nCLIENT'S WARDROBE (${wardrobe.length} items):`;
      
      const grouped = wardrobe.reduce((acc, item) => {
        if (!acc[item.garmentType]) acc[item.garmentType] = [];
        acc[item.garmentType].push(item);
        return acc;
      }, {} as Record<string, ClosetItem[]>);
      
      Object.entries(grouped).forEach(([type, items]) => {
        context += `\n${type.replace(/_/g, ' ')}s:`;
        items.slice(0, 5).forEach(item => { // Limit to 5 per type
          context += `\n  - ${item.color} ${item.brand || ''} ${item.notes || ''}`.trim();
        });
      });
    }

    // NEW: Add outfit memory instructions
    context += `\n\nOUTFIT MEMORY:
When the user asks about past outfits (e.g., "remember that business meeting outfit?"), 
I will search their saved outfits and provide them to you in the next message.

When you receive saved outfit context, reference it naturally:
- "I found this [occasion] outfit from [date]..."
- "You wore [items] for that [occasion]..."
- "Let me pull up that outfit we discussed..."

Be specific and helpful in recalling their past style choices.`;

    return context;
  },

  /**
   * Detect if user is asking about past outfit (improved patterns)
   */
  detectOutfitRecallQuery(message: string): boolean {
    // Negative patterns (not recall queries)
    const negativePatterns = [
      /remember to/i,        // "Remember to wear..."
      /don't forget/i,        // "Don't forget to..."
      /make sure/i,          // "Make sure to..."
      /remind me/i,          // "Remind me to..."
    ];
    
    // Check negatives first
    if (negativePatterns.some(p => p.test(message))) {
      return false;
    }
    
    // Positive recall patterns
    const recallPatterns = [
      /remember.*outfit/i,           // "Remember that outfit..."
      /that outfit.*wore/i,          // "That outfit I wore..."
      /what.*wore.*for/i,            // "What did I wear for..."
      /outfit.*last.*time/i,          // "Outfit from last time"
      /outfit.*before/i,              // "Outfit from before"
      /outfit.*earlier/i,             // "Outfit from earlier"
      /outfit.*we discussed/i,       // "Outfit we discussed"
      /outfit.*we talked/i,           // "Outfit we talked about"
      /show me.*outfit/i,             // "Show me that outfit"
      /that.*outfit/i,                // "That outfit" (context-dependent)
    ];
    
    const lowerMessage = message.toLowerCase();
    return recallPatterns.some(pattern => pattern.test(lowerMessage));
  },

  /**
   * Enhanced message sending with outfit memory
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
      
      // Check if user is asking about past outfit
      const textContent = userMessage.content.find(c => c.type === 'text');
      const messageText = textContent?.text || '';
      
      let outfitContext = '';
      if (this.detectOutfitRecallQuery(messageText)) {
        // Search for matching outfits
        const results = await OutfitMemoryService.searchOutfits(messageText);
        
        if (results.length > 0) {
          console.log(`[ChatService] Found ${results.length} matching outfits`);
          
          // Format top match for context
          const topMatch = results[0];
          outfitContext = `\n\nRECALLED OUTFIT:\n${
            OutfitMemoryService.formatOutfitForContext(topMatch.outfit)
          }`;
          
          // Mark as referenced
          await OutfitMemoryService.markOutfitReferenced(topMatch.outfit.id);
        } else {
          outfitContext = '\n\nNo matching past outfits found. Politely tell the user you don\'t recall that specific outfit, but offer to help create something similar.';
        }
      }
      
      // Build system context
      const systemContext = await this.buildSystemContext(profile, wardrobe);
      const fullContext = systemContext + outfitContext;
      
      // Prepare messages for Claude API
      const apiMessages = session.messages.map(msg => ({
        role: msg.role,
        content: msg.content.map(c => {
          if (c.type === 'text') {
            return {
              type: 'text' as const,
              text: c.text || '',
            };
          } else {
            return {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: 'image/jpeg' as const,
                data: c.imageUri || '',
              },
            };
          }
        }),
      }));
      
      // Call Claude API
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        system: fullContext, // Enhanced with outfit recall
        messages: apiMessages,
      });
      
      // Extract response text
      const responseContent = response.content.find(c => c.type === 'text');
      const responseText = responseContent?.type === 'text' 
        ? responseContent.text 
        : 'I apologize, but I encountered an error.';
      
      // Detect if AI suggested an outfit → Save it (using Claude extraction)
      const outfitExtraction = await OutfitMemoryService.extractOutfitFromResponse(
        responseText,
        messageText
      );
      
      if (outfitExtraction && outfitExtraction.confidence > 0.6) {
        await OutfitMemoryService.saveOutfitFromChat({
          items: outfitExtraction.items,
          description: outfitExtraction.description,
          userQuery: messageText,
          chatSessionId: session.id,
          aiResponse: responseText,
          extractionConfidence: outfitExtraction.confidence,
        });
        
        console.log('[ChatService] Auto-saved outfit from suggestion');
      }
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: uuid.v4(),
        role: 'assistant',
        content: [{
          type: 'text',
          text: responseText,
        }],
        timestamp: new Date().toISOString(),
      };
      
      // Add to session
      session.messages.push(assistantMessage);
      session.lastMessageAt = new Date().toISOString();
      
      return assistantMessage;
    } catch (error) {
      console.error('[ChatService] Send message failed:', error);
      
      return {
        id: uuid.v4(),
        role: 'assistant',
        content: [{
          type: 'text',
          text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        }],
        timestamp: new Date().toISOString(),
      };
    }
  },
};
```

---

## Manual Save Feature

**Add to ChatScreen.tsx:**

```typescript
// Add state for manual save
const [showSaveOutfitModal, setShowSaveOutfitModal] = useState(false);
const [outfitToSave, setOutfitToSave] = useState<OutfitItem[] | null>(null);

// Add "Save Outfit" button to message bubble (for assistant messages with outfits)
const handleSaveOutfit = async (message: ChatMessage) => {
  // Extract outfit from message
  const extraction = await OutfitMemoryService.extractOutfitFromResponse(
    message.content.find(c => c.type === 'text')?.text || '',
    'Manual save'
  );
  
  if (extraction) {
    setOutfitToSave(extraction.items);
    setShowSaveOutfitModal(true);
  }
};

// Save Outfit Modal Component
<Modal visible={showSaveOutfitModal}>
  <SaveOutfitModal
    items={outfitToSave || []}
    onSave={async (description, occasion) => {
      await OutfitMemoryService.saveOutfitFromChat({
        items: outfitToSave!,
        description,
        userQuery: 'Manual save',
        occasion,
        chatSessionId: session.id,
        source: 'manual',
      });
      setShowSaveOutfitModal(false);
      // Show success toast
    }}
    onCancel={() => setShowSaveOutfitModal(false)}
  />
</Modal>
```

---

## Integration with Favorites

**Update to sync with existing Favorites feature:**

```typescript
// When user favorites an outfit from memory
async favoriteOutfit(outfitId: string): Promise<void> {
  const outfit = await StorageService.getSavedOutfits()
    .then(outfits => outfits.find(o => o.id === outfitId));
  
  if (outfit) {
    // Update saved outfit
    await StorageService.updateOutfit(outfitId, { wasFavorited: true });
    
    // Also save to Favorites (if using same storage)
    const favoriteOutfit: FavoriteOutfit = {
      id: outfitId,
      name: outfit.description,
      items: outfit.items,
      occasion: outfit.occasion,
      createdAt: outfit.createdAt,
      notes: `From chat on ${new Date(outfit.createdAt).toLocaleDateString()}`,
    };
    
    await StorageService.saveFavoriteOutfit(favoriteOutfit);
  }
}
```

---

## User Experience Examples

### Example 1: Recalling Past Outfit

```
User: "Remember that outfit I wore for the business meeting?"

[System searches saved outfits with fuzzy matching]
[Finds: Navy blazer outfit from Jan 15, match score: 0.85]

AI: "Yes! On January 15th we discussed your client presentation. 
     You wore:
     • Navy blazer
     • Gray wool pants
     • White dress shirt
     • Brown leather oxfords
     
     That was a great professional look. Want to recreate it 
     or adjust something?"

User: "Same outfit but more casual for today"

AI: "Let's make it smart casual:
     • Keep the navy blazer
     • Swap gray pants for dark jeans
     • White shirt works, or try light blue for softer look
     • Brown loafers instead of oxfords
     
     Still professional but more relaxed."
```

### Example 2: Fuzzy Search Success

```
User: "What about that biz meeting outfit from last month?"

[System searches: "biz meeting last month"]
[Fuzzy match: "business meeting" from 3 weeks ago, match score: 0.78]

AI: "I found your business meeting outfit from 3 weeks ago..."
```

### Example 3: Manual Save

```
User: "I have a wedding this Saturday"

AI: "Wedding guest! Let's build you a great outfit.
     For a summer afternoon wedding, I recommend:
     • Light gray suit
     • White dress shirt
     • Navy tie
     • Brown leather shoes
     
     This is classic, appropriate, and comfortable."

[User taps "Save Outfit" button on AI message]

[Modal appears: "Save this outfit?"]
[User can edit description, add occasion, then saves]

[Outfit saved with source: 'manual']
```

### Example 4: No Match Found

```
User: "What about that green tie I wore last month?"

[System searches saved outfits for: "green tie last month"]
[Finds: No matches above threshold]

AI: "I don't recall a specific green tie outfit in our 
     conversations, but let's work with that! Do you have 
     the tie in your wardrobe? I can suggest what to pair 
     it with."
```

---

## UI Updates

### Chat Screen Enhancements

**Add visual feedback:**

```typescript
// Show when outfit is being saved
const [savingOutfit, setSavingOutfit] = useState(false);

// In message bubble, show save button for assistant messages
{message.role === 'assistant' && (
  <TouchableOpacity
    onPress={() => handleSaveOutfit(message)}
    style={styles.saveButton}
  >
    <Text>💾 Save Outfit</Text>
  </TouchableOpacity>
)}

// Show toast when outfit auto-saved
{savingOutfit && (
  <Toast message="Outfit saved to memory" />
)}
```

### History Screen Enhancement

**Add "Saved Outfits" section:**

```typescript
// src/screens/HistoryScreen.tsx

const HistoryScreen: React.FC = () => {
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [showOutfits, setShowOutfits] = useState(false);
  
  useEffect(() => {
    loadSavedOutfits();
  }, []);
  
  const loadSavedOutfits = async () => {
    const outfits = await StorageService.getSavedOutfits();
    setSavedOutfits(outfits);
  };
  
  return (
    <ScrollView>
      {/* Existing chat history */}
      
      <TouchableOpacity
        onPress={() => setShowOutfits(!showOutfits)}
        style={styles.toggleButton}
      >
        <Text style={styles.toggleText}>
          {showOutfits ? '▼' : '▶'} Saved Outfits ({savedOutfits.length})
        </Text>
      </TouchableOpacity>
      
      {showOutfits && (
        <View style={styles.section}>
          {savedOutfits.length === 0 ? (
            <EmptyState type="outfit-memory" />
          ) : (
            savedOutfits.map(outfit => (
              <OutfitMemoryCard
                key={outfit.id}
                outfit={outfit}
                onPress={() => viewOutfitDetails(outfit)}
                onFavorite={() => favoriteOutfit(outfit.id)}
              />
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
};
```

### Outfit Memory Card Component

```typescript
// src/components/OutfitMemoryCard.tsx

interface Props {
  outfit: SavedOutfit;
  onPress: () => void;
  onFavorite?: () => void;
}

export const OutfitMemoryCard: React.FC<Props> = ({ 
  outfit, 
  onPress, 
  onFavorite 
}) => {
  const date = new Date(outfit.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.date}>{date}</Text>
          {outfit.source === 'manual' && (
            <Text style={styles.manualBadge}>Manual</Text>
          )}
          {outfit.extractionConfidence && outfit.extractionConfidence < 0.8 && (
            <Text style={styles.lowConfidenceBadge}>Low confidence</Text>
          )}
        </View>
        <TouchableOpacity onPress={onFavorite} style={styles.favoriteButton}>
          <Text style={styles.favoriteIcon}>
            {outfit.wasFavorited ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.description}>{outfit.description}</Text>
      
      {outfit.occasion && (
        <Text style={styles.occasion}>{outfit.occasion}</Text>
      )}
      
      <View style={styles.items}>
        {outfit.items.slice(0, 4).map((item, idx) => (
          <Text key={idx} style={styles.item}>
            • {item.garmentType.replace(/_/g, ' ')}: {item.description}
          </Text>
        ))}
        {outfit.items.length > 4 && (
          <Text style={styles.moreItems}>+{outfit.items.length - 4} more</Text>
        )}
      </View>
      
      <View style={styles.tags}>
        {outfit.tags.slice(0, 3).map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
      
      {outfit.timesReferenced > 0 && (
        <Text style={styles.referenced}>
          Referenced {outfit.timesReferenced} {outfit.timesReferenced === 1 ? 'time' : 'times'}
        </Text>
      )}
    </TouchableOpacity>
  );
};
```

---

## Testing Checklist

### Functional Testing

- [ ] Save outfit during chat (auto-detect with Claude extraction)
- [ ] Manual save outfit from chat
- [ ] Search for outfit by occasion ("business meeting")
- [ ] Search for outfit by garment type ("navy blazer")
- [ ] Search with fuzzy matching ("biz meeting" → "business meeting")
- [ ] Search for outfit by date context ("last month", "two weeks ago")
- [ ] No results found → AI responds gracefully
- [ ] Multiple results → AI uses top match
- [ ] Recently referenced outfits rank higher
- [ ] Outfit tags extract correctly
- [ ] Outfit saved with correct metadata
- [ ] Low confidence extractions marked appropriately
- [ ] Manual edits to saved outfits work
- [ ] Integration with Favorites works

### User Experience Testing

- [ ] User asks "remember that..." → AI recalls
- [ ] User references vague context → AI finds best match
- [ ] AI response feels natural (not robotic)
- [ ] History screen shows saved outfits
- [ ] Can view outfit details from history
- [ ] Tags display correctly on cards
- [ ] Referenced count updates properly
- [ ] Visual feedback when saving
- [ ] Toast notifications work
- [ ] Manual save modal works
- [ ] Favorite button works

### Edge Cases

- [ ] Empty outfit history → no errors
- [ ] Search with no keywords → graceful handling
- [ ] Very long outfit descriptions → truncate properly
- [ ] Duplicate outfits → handled correctly
- [ ] 100+ saved outfits → smart pruning works
- [ ] Corrupted data → app doesn't crash
- [ ] Low confidence extraction → user can edit
- [ ] Fuzzy search with typos → finds matches
- [ ] Date parsing with various formats → works
- [ ] Negative patterns don't trigger recall

### Performance Testing

- [ ] Search 100 outfits → <100ms response time
- [ ] Auto-save during chat → no UI lag
- [ ] Claude extraction → <2s response time
- [ ] Load history screen → <500ms
- [ ] AsyncStorage limits not exceeded
- [ ] Fuzzy search performance acceptable

---

## Implementation Timeline

### Day 1: Data Layer & Search
**Duration**: 5-6 hours

- [ ] Add SavedOutfit type to types/index.ts
- [ ] Update StorageService with outfit methods
- [ ] Implement smart pruning logic
- [ ] Install Fuse.js for fuzzy search
- [ ] Create OutfitMemoryService with enhanced search
- [ ] Test storage operations
- [ ] Test search algorithm with mock data
- [ ] Test fuzzy matching

### Day 2: Claude Extraction
**Duration**: 5-6 hours

- [ ] Implement extractOutfitFromResponse using Claude
- [ ] Test extraction accuracy
- [ ] Handle low confidence cases
- [ ] Add extraction confidence scoring
- [ ] Test with various response formats
- [ ] Optimize extraction prompt

### Day 3: Chat Integration
**Duration**: 5-6 hours

- [ ] Update ChatService.buildSystemContext()
- [ ] Improve detectOutfitRecallQuery() with negative patterns
- [ ] Add auto-save logic with Claude extraction
- [ ] Add search integration
- [ ] Test full chat flow with memory
- [ ] Test recall detection accuracy

### Day 4: Manual Save & UI
**Duration**: 5-6 hours

- [ ] Add "Save Outfit" button to chat
- [ ] Create SaveOutfitModal component
- [ ] Add visual feedback (toasts, loading states)
- [ ] Add "Saved Outfits" to History screen
- [ ] Create OutfitMemoryCard component
- [ ] Add favorite integration
- [ ] Test UI responsiveness

### Day 5: Integration & Polish
**Duration**: 4-5 hours

- [ ] Integrate with Favorites feature
- [ ] Add outfit detail view
- [ ] Polish styling
- [ ] Add error handling
- [ ] Test edge cases
- [ ] Performance optimization

### Day 6: Testing & Refinement
**Duration**: 4-5 hours

- [ ] Run full test checklist
- [ ] Test with real conversations
- [ ] Fix edge cases
- [ ] Update system prompts based on testing
- [ ] Performance optimization if needed
- [ ] User acceptance testing

**Total**: 5-6 days (updated from 3-4 days)

---

## Dependencies

**New packages needed:**

```bash
npm install fuse.js
npm install --save-dev @types/fuse.js
```

**Total size impact**: ~50KB (Fuse.js)

---

## Cost Impact

### Storage
- ~1.5KB per saved outfit (slightly larger with aiResponse)
- 100 outfits = 150KB
- 1000 users × 150KB = 150MB total
- **Cost**: Negligible (AsyncStorage is free)

### API Costs
- **Search**: Local (no API calls) ✅
- **Extraction**: +200-300 tokens per outfit save (using Claude)
- **Context injection**: +50-100 tokens per message (when recalling)
- **Estimated**: ~$0.0003 per outfit save, ~$0.0001 per recall
- **Impact**: 2-3% increase in API costs (updated from 1%)

### Performance
- Search 100 outfits: <100ms (with Fuse.js)
- Claude extraction: 1-2s (async, non-blocking)
- No database queries (all local)
- **Impact**: Minimal user-facing latency

---

## Success Metrics

Track these after launch:

**Usage Metrics:**
- % of premium users who ask about past outfits
- Average # of outfit recalls per user per week
- Search success rate (found match vs no match)
- Auto-save accuracy (% correctly extracted)
- Manual save usage rate

**Engagement Metrics:**
- Session length after implementing memory (should increase)
- User retention (should improve)
- Premium subscription renewals (should improve)
- False positive rate (recall triggered incorrectly)

**Target Goals:**
- 30%+ of premium users use recall feature monthly
- 80%+ recall queries find relevant matches
- 10%+ increase in chat engagement after adding memory
- <5% false positive rate on recall detection
- 85%+ auto-extraction accuracy

---

## Future Enhancements (v2.0+)

**Not for v1.2, but ideas for later:**

1. **Visual Outfit Cards**
   - Save actual photos of outfit items
   - Display visual grid in history
   - Image-based search

2. **Outfit Collections**
   - Group by season ("Summer 2025")
   - Group by occasion type
   - "Favorite Work Outfits" folder

3. **Smart Suggestions**
   - "You haven't worn this outfit in 3 months"
   - "Similar to your favorite business dinner look"
   - Seasonal reminders

4. **Export/Share**
   - Export outfit history as PDF
   - Share favorite outfits with friends
   - Print outfit cards

5. **Vector Search (True AI Memory)**
   - Semantic search instead of keyword
   - "Professional but not too formal" → finds relevant outfits
   - Requires Pinecone/vector DB

6. **Outfit Analytics**
   - Most referenced outfits
   - Favorite occasions
   - Style evolution over time

---

## Rollout Strategy

### Soft Launch (Week 1)
- Enable for 10% of premium users
- Monitor for bugs
- Collect feedback
- Track extraction accuracy
- Monitor false positive rate

### Full Launch (Week 2)
- Enable for all premium users
- Add announcement in-app
- Update App Store description
- Email to premium users

### Communication
**In-app announcement:**
```
🎉 New Feature: Outfit Memory

Your AI tailor now remembers past outfits! 

Try asking:
• "Remember that business dinner outfit?"
• "What did I wear to the wedding last month?"
• "Show me that navy blazer outfit we discussed"

You can also manually save outfits by tapping 
the 💾 button on any outfit suggestion.

Your chat just got smarter.
```

**Email to premium users:**
```
Subject: Your AI Tailor Now Remembers 🧠

We've upgraded your personal tailor with outfit memory.

Now when you ask "Remember that outfit I wore for...?", 
your AI tailor can instantly recall past conversations 
and outfit suggestions.

Features:
✅ Auto-saves outfit suggestions from chat
✅ Manual save option for any outfit
✅ Smart search (finds "biz meeting" → "business meeting")
✅ Remembers your favorite looks

It's like having a stylist who actually remembers your 
style journey.

Try it in your next chat!
```

---

## Known Limitations

1. **Extraction Accuracy**: Claude extraction is ~85-90% accurate. Low confidence extractions can be manually edited.

2. **Search Limitations**: Keyword-based search (even with fuzzy matching) won't handle complex semantic queries like "professional but not too formal" perfectly. Vector search would be better but requires infrastructure.

3. **Storage Limits**: 100 outfit limit may need adjustment based on user feedback. Smart pruning helps but may delete some outfits users want to keep.

4. **Date Parsing**: Basic date reference parsing. Complex date queries may not work perfectly.

5. **Manual Save Required**: Some outfit suggestions may not auto-save if extraction confidence is low. Users can manually save.

---

## Conclusion

This improved version addresses key concerns from v1.1:

✅ **More reliable extraction** (Claude-based instead of regex)  
✅ **Better search** (fuzzy matching with Fuse.js)  
✅ **Manual save option** (user control)  
✅ **Smart pruning** (keeps important outfits)  
✅ **Better recall detection** (fewer false positives)  
✅ **Visual feedback** (users know what's happening)  
✅ **Favorites integration** (unified experience)  

**Implementation**: 5-6 days (realistic timeline)  
**Cost**: 2-3% API increase (acceptable)  
**Value**: High user impact, strong differentiation  

**Ship MVP first, add this as your first major update.** Users will love it.

