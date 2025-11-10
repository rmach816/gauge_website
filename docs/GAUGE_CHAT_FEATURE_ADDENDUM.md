# GAUGE - AI Tailor Chat Feature Addendum

**Purpose**: Add conversational AI chat as core premium feature, enhancing the personal tailor experience.

---

## Executive Summary

**The Insight**: Users don't want rigid modes - they want a conversation with their tailor. "Hey, will this blazer match my gray pants?" is natural. Clicking through mode selection screens is not.

**The Solution**: Premium users get unlimited chat sessions with their AI tailor, who knows their measurements, wardrobe, and style preferences. Free users get 3 chat sessions to try the feature, plus structured checks.

---

## Core Concept: "Chat with Your Tailor"

### The Experience

Instead of navigating through modes, premium users open a chat and ask questions naturally:

**Example Session 1 - At the Store:**
```
User: [Photo of navy blazer]
"Will this work for business dinners?"

AI Tailor: "Absolutely! This navy blazer is perfect for business 
dinners. Based on your measurements (42R), this should fit well. 

It pairs beautifully with:
• Your gray wool pants [shows thumbnail]
• Your white dress shirt [shows thumbnail]
• Your brown leather oxfords [shows thumbnail]

For a complete look, add a burgundy tie. Should I find some options?"

User: "Yes, show me ties"

AI Tailor: [Generates affiliate links for burgundy ties]
"Here are some great options in your budget range..."

User: "What about with jeans for more casual?"

AI Tailor: "Great question! For smart casual with jeans:
• Dark indigo jeans (no distressing)
• White or light blue OCBD shirt
• Brown leather boots or loafers

This blazer is versatile - you'll get a lot of use from it."
```

**Example Session 2 - Getting Dressed:**
```
User: "I have a wedding this weekend. What should I wear?"

AI Tailor: "Wedding guest! Let's build you a great outfit. 
A few questions:
• Indoor or outdoor?
• Time of day?
• How formal? (Black tie, cocktail, semi-formal)
• Season/weather?"

User: "Outdoor, 4pm, cocktail attire, summer"

AI Tailor: "Perfect. From your wardrobe, I recommend:
[Shows complete outfit with thumbnails]

Or we can look at some new options if you want to 
upgrade any pieces?"

User: "The suit is old. Show me new options."

AI Tailor: [Generates shopping links]
"Here are some excellent summer-weight suits in your 
size (42R) and budget..."
```

**Example Session 3 - Wardrobe Question:**
```
User: "I just got these brown shoes [photo]. What can I wear them with?"

AI Tailor: "Those are sharp! Brown leather shoes are incredibly 
versatile. From your wardrobe, they pair with:

Excellent matches:
• Navy chinos [thumbnail]
• Gray wool pants [thumbnail]
• Khaki chinos [thumbnail]
• Dark jeans [thumbnail]

Avoid:
• Black pants (brown + black usually clashes)

Would you like outfit combinations using these shoes?"
```

---

## Feature Specification

### Premium Chat Feature

**Access Level**: Premium Only ($6.99/month) for unlimited sessions
**Free Tier**: 3 chat sessions to try the feature, then upgrade required

**What Premium Users Get**:
- Unlimited chat sessions
- Multi-turn conversations with context retention
- Mix photos and text freely
- Reference wardrobe items by description
- Follow-up questions without re-submitting info
- Session history saved

### Chat UI Design

**Main Chat Screen**:
```
┌─────────────────────────────────────┐
│  ← Chat with Your Tailor            │  [Header]
├─────────────────────────────────────┤
│                                      │
│  [AI Tailor Avatar]                 │  [AI Messages]
│  "Hi! I'm your personal tailor.     │
│   How can I help you today?"        │
│                                      │
│           [User Avatar] "I have a   │  [User Messages]
│           wedding this weekend..."  │
│                                      │
│  [AI Tailor Avatar]                 │
│  "Wedding guest! Let's build..."    │
│                                      │
│  [Outfit Image Preview]             │  [Rich Content]
│  [Show Details Button]              │
│                                      │
│           "Show me new options"     │
│                                      │
│  [Typing indicator...]              │  [Loading State]
│                                      │
├─────────────────────────────────────┤
│  [📷] [Message input field...] [↑] │  [Input Bar]
└─────────────────────────────────────┘
```

**Input Options**:
- Text input (keyboard)
- Camera button (take photo in-line)
- Photo library button
- Voice input (future enhancement)

**Message Types**:
- Text only
- Photo only
- Photo + text caption
- AI response with text
- AI response with outfit preview
- AI response with shopping links

### Session Management

**Session Lifecycle**:
```
Session Start
  ↓
User sends first message (text/photo)
  ↓
AI responds with context from:
  - User measurements
  - Wardrobe items
  - Style preferences
  - Previous sessions (summary)
  ↓
Multi-turn conversation
  ↓
User exits chat
  ↓
Session saved to history
  ↓
Can resume later (last 10 messages visible)
```

**Context Window**:
- Include full conversation history in API call
- Include user profile (measurements, preferences)
- Include wardrobe summary (item descriptions)
- Include occasion if mentioned
- Max 20 turns before suggesting new session

**Session History**:
- Saved in CheckHistory with type `'chat-session'`
- Displayed in History tab
- Can tap to view full conversation
- Can resume session (continues conversation)

### Technical Implementation

#### Chat Service

```typescript
// src/services/chat.ts

import Anthropic from '@anthropic-ai/sdk';
import { StorageService } from './storage';
import { UserProfile, ClosetItem } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    imageUri?: string;
  }>;
  timestamp: string;
}

interface ChatSession {
  id: string;
  messages: ChatMessage[];
  startedAt: string;
  lastMessageAt: string;
  active: boolean;
}

export const ChatService = {
  /**
   * Start new chat session
   */
  async startSession(): Promise<ChatSession> {
    const session: ChatSession = {
      id: uuid.v4(),
      messages: [],
      startedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      active: true,
    };
    
    // Add welcome message
    session.messages.push({
      id: uuid.v4(),
      role: 'assistant',
      content: [{
        type: 'text',
        text: "Hi! I'm your personal tailor. I know your measurements, style preferences, and wardrobe. How can I help you today?",
      }],
      timestamp: new Date().toISOString(),
    });
    
    return session;
  },

  /**
   * Build context for Claude API
   */
  async buildSystemContext(profile: UserProfile, wardrobe: ClosetItem[]): Promise<string> {
    let context = `You are a sophisticated personal tailor helping your client with style advice. 
You know them well and provide warm, professional guidance.

IMPORTANT: Keep responses concise (3-4 sentences max) unless asked for detailed advice. 
Be conversational and natural, like a real tailor would speak.`;

    // Add measurements if available
    if (profile.measurements) {
      const m = profile.measurements;
      context += `\n\nCLIENT MEASUREMENTS:
- Height: ${Math.floor(m.height / 12)}' ${m.height % 12}"
- Weight: ${m.weight} lbs
- Chest: ${m.chest}", Waist: ${m.waist}", Inseam: ${m.inseam}"
- Neck: ${m.neck}", Sleeve: ${m.sleeve}", Shoulder: ${m.shoulder}"
- Preferred fit: ${m.preferredFit}
- Recommended shirt size: ${m.neck}/${m.sleeve}
- Recommended jacket size: ${m.chest}R
- Recommended pants size: ${m.waist}x${m.inseam}`;
    }

    // Add style preferences
    context += `\n\nSTYLE PREFERENCES:
- Overall style: ${profile.stylePreference}
- Favorite occasions: ${profile.favoriteOccasions.join(', ')}`;

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
          context += `\n  - ${item.color} ${item.brand || ''} ${item.notes || ''}`.trim();
        });
      });
    }

    context += `\n\nWhen referencing wardrobe items, describe them naturally ("your gray wool pants") 
and offer to show them if relevant. When suggesting shopping, provide specific item 
descriptions that can be searched for.`;

    return context;
  },

  /**
   * Send message and get AI response
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
      
      // Build system context
      const systemContext = await this.buildSystemContext(profile, wardrobe);
      
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
            // Convert image URI to base64
            return {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: 'image/jpeg' as const,
                data: c.imageUri || '', // Will be converted to base64
              },
            };
          }
        }),
      }));
      
      // Call Claude API
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        system: systemContext,
        messages: apiMessages,
      });
      
      // Extract response text
      const textContent = response.content.find(c => c.type === 'text');
      const responseText = textContent?.type === 'text' ? textContent.text : 'I apologize, but I encountered an error.';
      
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
      
      // Return error message
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

  /**
   * Save session to history
   */
  async saveSession(session: ChatSession): Promise<void> {
    await StorageService.saveCheckToHistory({
      id: session.id,
      type: 'chat-session',
      result: session,
      createdAt: session.startedAt,
    });
  },

  /**
   * Load recent session
   */
  async loadRecentSession(): Promise<ChatSession | null> {
    const history = await StorageService.getCheckHistory();
    const recentChat = history.find(h => h.type === 'chat-session');
    
    if (recentChat && recentChat.result) {
      return recentChat.result as ChatSession;
    }
    
    return null;
  },
};
```

#### Chat Screen Component

```typescript
// src/screens/ChatScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ChatService } from '../services/chat';
import { StorageService } from '../services/storage';
import { PremiumService } from '../services/premium';
import { TailorColors, TailorTypography, TailorSpacing } from '../utils/constants';

export const ChatScreen: React.FC = ({ navigation }) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    // Check premium status
    const premium = await PremiumService.isPremium();
    setIsPremium(premium);

    if (!premium) {
      // Show paywall
      navigation.navigate('Paywall', { feature: 'chat' });
      return;
    }

    // Load or create session
    let existingSession = await ChatService.loadRecentSession();
    if (!existingSession || !existingSession.active) {
      existingSession = await ChatService.startSession();
    }
    setSession(existingSession);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !session) return;

    const userMessage: ChatMessage = {
      id: uuid.v4(),
      role: 'user',
      content: [{
        type: 'text',
        text: inputText.trim(),
      }],
      timestamp: new Date().toISOString(),
    };

    // Clear input
    setInputText('');

    // Add message to UI immediately
    setSession(prev => ({
      ...prev!,
      messages: [...prev!.messages, userMessage],
    }));

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd();
    }, 100);

    // Get AI response
    setIsLoading(true);
    try {
      const profile = await StorageService.getUserProfile();
      const wardrobe = await StorageService.getClosetItems();

      const assistantMessage = await ChatService.sendMessage(
        session,
        userMessage,
        profile!,
        wardrobe
      );

      // Update session with response
      setSession(prev => ({
        ...prev!,
        messages: [...prev!.messages, assistantMessage],
      }));

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd();
      }, 100);

      // Save session
      await ChatService.saveSession(session);
    } catch (error) {
      Alert.alert('Error', 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoCapture = async (uri: string) => {
    if (!session) return;

    const userMessage: ChatMessage = {
      id: uuid.v4(),
      role: 'user',
      content: [{
        type: 'image',
        imageUri: uri,
      }],
      timestamp: new Date().toISOString(),
    };

    // Add to session
    setSession(prev => ({
      ...prev!,
      messages: [...prev!.messages, userMessage],
    }));

    // Get AI response (similar to text)
    setIsLoading(true);
    // ... (same as handleSendMessage but with image)
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userMessage : styles.assistantMessage,
      ]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👔</Text>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}>
          {item.content.map((c, idx) => {
            if (c.type === 'text') {
              return (
                <Text
                  key={idx}
                  style={[
                    styles.messageText,
                    isUser ? styles.userText : styles.assistantText,
                  ]}
                >
                  {c.text}
                </Text>
              );
            } else if (c.type === 'image' && c.imageUri) {
              return (
                <Image
                  key={idx}
                  source={{ uri: c.imageUri }}
                  style={styles.messageImage}
                />
              );
            }
            return null;
          })}
        </View>
        
        {isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        )}
      </View>
    );
  };

  if (!isPremium) {
    return null; // Paywall will be shown
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={session?.messages || []}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {isLoading && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator color={TailorColors.gold} />
          <Text style={styles.loadingText}>Thinking...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.photoButton}
          onPress={() => {/* Open photo capture */}}
        >
          <Text style={styles.photoIcon}>📷</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask your tailor anything..."
          placeholderTextColor={TailorColors.grayMedium}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TailorColors.parchment,
  },
  messageList: {
    padding: TailorSpacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: TailorSpacing.md,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: TailorColors.woodMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: TailorSpacing.xs,
  },
  avatarText: {
    fontSize: 20,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: TailorSpacing.md,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: TailorColors.gold,
  },
  assistantBubble: {
    backgroundColor: TailorColors.woodMedium,
  },
  messageText: {
    ...TailorTypography.body,
  },
  userText: {
    color: TailorColors.navy,
  },
  assistantText: {
    color: TailorColors.cream,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: TailorSpacing.xs,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
  },
  loadingText: {
    ...TailorTypography.caption,
    color: TailorColors.grayDark,
    marginLeft: TailorSpacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: TailorSpacing.md,
    backgroundColor: TailorColors.white,
    borderTopWidth: 1,
    borderTopColor: TailorColors.grayLight,
  },
  photoButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: {
    fontSize: 24,
  },
  input: {
    flex: 1,
    ...TailorTypography.body,
    backgroundColor: TailorColors.grayLight,
    borderRadius: 20,
    paddingHorizontal: TailorSpacing.md,
    paddingVertical: TailorSpacing.sm,
    marginHorizontal: TailorSpacing.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TailorColors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: TailorColors.grayMedium,
  },
  sendIcon: {
    fontSize: 24,
    color: TailorColors.white,
  },
});
```

---

## Integration with Existing Features

### Replace "Dress Me" Mode Selection

**Instead of 4 separate modes, simplify to**:

**Home Screen Options**:
```
┌─────────────────────────────────────┐
│                                      │
│   [Large Gold Button]                │
│   💬 Chat with Your Tailor          │
│   Premium Feature                    │
│                                      │
│   [Standard Button]                  │
│   📸 Quick Style Check               │
│   (Free: 2 remaining)                │
│                                      │
│   [Standard Button]                  │
│   🎯 Build an Outfit                 │
│   Choose occasion, we'll help        │
│                                      │
└─────────────────────────────────────┘
```

**What This Means**:
- **Chat with Your Tailor** (Premium): Conversational, flexible, handles all use cases
- **Quick Style Check** (Free/Premium): Old instant-check, structured, no conversation
- **Build an Outfit** (Free/Premium): Old outfit builder, structured, no conversation

### How Chat Replaces Modes

**Old "In-Store Assistant" mode** → Now just a chat conversation:
- User: [photo] "Will this work?"
- AI: Responds with analysis

**Old "Wardrobe Mode"** → Chat can do this:
- User: "What can I wear from my wardrobe to a wedding?"
- AI: Generates combinations

**Old "Shopping Mode"** → Chat can do this:
- User: "I need a new suit for work"
- AI: Asks questions, generates shopping links

**Old "Mixed Mode"** → Chat can do this:
- User: "I want to wear my navy blazer. What else do I need?"
- AI: Suggests items to buy

**The beauty**: Chat is more flexible than rigid modes. Users ask what they actually want to know.

---

## Premium Positioning

### Updated Premium Features

**Premium Tier ($6.99/month)**:

**Core Value: Chat with Your Tailor**
1. ✅ Unlimited chat sessions (main draw)
2. ✅ Multi-turn conversations with context
3. ✅ Reference wardrobe items naturally
4. ✅ Mix photos and text freely
5. ✅ Follow-up questions
6. ✅ Unlimited style checks (via chat or structured)
7. ✅ Unlimited wardrobe items
8. ✅ Favorite outfit combinations
9. ✅ Priority AI processing
10. ✅ Session history

**Free Tier Limitations**:
- ✅ 3 chat sessions (limited access to try the feature)
- ✅ 10 structured style checks (one-shot, no conversation)
- ✅ Up to 10 wardrobe items
- ✅ Basic outfit builder (no conversation)
- ❌ No favorite combinations

### Upgrade Prompts

**When Free User Exceeds 3 Chat Sessions**:
```
[Premium Feature]

"You've used all 3 free chat sessions"

Upgrade to Premium for unlimited chat with your tailor:
• Ask unlimited questions
• Get personalized advice anytime
• Reference your wardrobe naturally
• Multi-turn conversations

Just like texting your personal tailor.

$6.99/month • Cancel anytime

[Start Premium] [Use Quick Check Instead]
```

**In-App Messaging**:
- After 5th structured check: "Premium members can just chat with their tailor instead of taking new photos each time"
- When viewing history: "Premium members can resume conversations and ask follow-up questions"

---

## Cost Considerations

### API Costs per Chat Message

**Text-only message**: ~$0.003
**Message with 1 photo**: ~$0.012
**Average session** (10 messages, 2 with photos): ~$0.054

**Comparison to Structured Checks**:
- Old instant check (3 photos): ~$0.016
- Chat session (10 messages, 2 photos): ~$0.054
- **Cost ratio**: Chat is ~3.4x more expensive

**Mitigation Strategies**:
1. Chat is premium-only (users are paying $6.99/month)
2. Set soft limit (20 messages per session, suggest starting new)
3. Most chat messages are text-only (much cheaper)
4. Premium users generate more revenue than cost

**Break-Even Analysis**:
- Premium: $6.99/month
- Heavy chat user: 40 sessions/month × $0.054 = $2.16/month
- Margin: $4.83/month (69%)
- Even heavy users are profitable

---

## User Flow Updates

### Simplified Navigation

**Bottom Tabs**:
1. **Home** - Main CTA: "Chat with Your Tailor" or "Quick Check"
2. **History** - Past chats and checks
3. **Wardrobe** - Manage clothing items
4. **Shop** - Browse and build outfits (uses chat if premium)
5. **Profile** - Settings and measurements

### Free User Journey

```
Download app → Onboarding → Home screen
  ↓
Sees "Chat with Your Tailor" (3 free sessions available)
  ↓
Tries chat → Gets great personalized advice
  ↓
Uses 2nd chat session → Asks follow-up questions
  ↓
Uses 3rd chat session → Loves the feature
  ↓
Sees "You've used all 3 free chat sessions"
  ↓
Converts to premium for unlimited access
```

### Premium User Journey

```
Downloads app → Onboarding → Home screen
  ↓
Sees "Chat with Your Tailor" (Premium badge)
  ↓
Clicks → Paywall → Converts immediately
  ↓
Opens chat: "Hi! I'm your personal tailor..."
  ↓
Asks question → Gets answer → Asks follow-up
  ↓
Builds relationship, stays subscribed
```

---

## Stock Photo Requirements Update

### Add: Chat UI Images

**Needed for Chat Feature**:
1. **AI Tailor Avatar** - Illustration of a friendly, sophisticated tailor
   - Style: Simple, elegant icon or illustration
   - Format: PNG with transparency
   - Size: 256x256px minimum
   - Could be: Tape measure icon, suit silhouette, or abstract professional symbol

2. **User Avatar Placeholder** - Generic user icon
   - Standard user silhouette
   - Format: PNG with transparency
   - Size: 256x256px

3. **Chat Empty State** - Illustration for empty chat
   - Welcoming tailor shop interior illustration
   - Shows chat interface concept
   - Size: 600x400px

---

## Testing Plan

### Chat-Specific Tests

**Conversation Flow**:
- [ ] Start new chat session
- [ ] Send text message, receive response
- [ ] Send photo, receive analysis
- [ ] Send photo + text, receive contextual response
- [ ] Ask follow-up question, AI remembers context
- [ ] Reference wardrobe item, AI knows what it is
- [ ] Multi-turn conversation maintains context
- [ ] Session saves correctly
- [ ] Can resume saved session
- [ ] Typing indicator shows while waiting

**Context Testing**:
- [ ] AI knows user's measurements
- [ ] AI knows user's style preferences  
- [ ] AI can reference wardrobe items by description
- [ ] AI remembers previous messages in session
- [ ] AI provides size recommendations when relevant
- [ ] AI suggests shopping when appropriate

**Premium Gates**:
- [ ] Free users can start chat (3 sessions allowed)
- [ ] Free users see paywall after 3 sessions are used
- [ ] Chat session counter tracks free usage correctly
- [ ] Premium users access chat immediately with unlimited sessions
- [ ] Chat counts against premium status correctly
- [ ] Downgraded users lose unlimited access (revert to 3 sessions)

**Edge Cases**:
- [ ] Very long messages (500 char limit)
- [ ] Network failure mid-conversation (show error, allow retry)
- [ ] Session timeout (20+ messages, suggest new session)
- [ ] Photo upload failure (show error, allow retry)
- [ ] AI response timeout (30 sec limit, show error)

---

## Implementation Timeline Update

### Add to Week 5: Chat Feature

**Week 5 becomes "Premium Features Week"**:

**Day 1-2: Chat Service & UI**
- [ ] ChatService implementation
- [ ] ChatScreen component
- [ ] Message rendering (text, images)
- [ ] Input handling (text, photos)

**Day 3: Context & Intelligence**
- [ ] System context building
- [ ] Wardrobe integration
- [ ] Measurement integration
- [ ] Session management

**Day 4: Premium Gates & History**
- [ ] Paywall for free users
- [ ] Session saving/loading
- [ ] History integration
- [ ] Resume conversation

**Day 5: Polish & Testing**
- [ ] Loading states
- [ ] Error handling
- [ ] Typing indicators
- [ ] UX refinements

---

## Success Metrics Update

### Add Chat-Specific Metrics

**Chat Engagement**:
- Chat session starts (premium users)
- Average messages per session (target: 8-12)
- Photo messages vs text messages ratio
- Session completion rate (user satisfied, doesn't drop off)
- Follow-up rate (users ask multiple questions)

**Chat Quality**:
- User satisfaction per chat (thumbs up/down)
- Average response time
- Error rate
- Context retention accuracy (manual spot checks)

**Premium Conversion**:
- Free chat session usage rate (how many of 3 sessions are used)
- Chat paywall impression rate (free users who see it after 3 sessions)
- Chat-driven conversion rate (users who convert after trying free sessions)
- Chat usage among premium users (active users using chat)

---

## Key Answers for You

### Measurement Photos
**Answer**: Stock photos work. Here are resources:
- **Shutterstock**: Search "men body measurements how to"
- **iStock**: Search "tailor measuring man guide"
- **Getty Images**: Search "clothing measurements diagram"
- **DIY Option**: Take photos yourself with a friend, measuring tape, and good lighting

### Style Preference Images
**Recommendations for 4 categories**:

1. **Conservative**
   - Stock search: "businessman professional attire"
   - Example: Navy suit, white shirt, solid tie, leather shoes
   
2. **Modern**
   - Stock search: "smart casual men fashion"
   - Example: Slim chinos, button-down, minimal sneakers

3. **Stylish**
   - Stock search: "men's fashion trendy"
   - Example: Well-fitted blazer, patterned shirt, brogues

4. **Fashion-Forward**
   - Stock search: "men's high fashion street style"
   - Example: Bold patterns, designer pieces, statement accessories

---

## Final Recommendation

**Chat feature should be THE core premium value proposition.** It's:

1. **Natural** - People want to ask questions, not navigate modes
2. **Powerful** - Handles all use cases (in-store, wardrobe, shopping, advice)
3. **Sticky** - Creates relationship, builds loyalty
4. **Profitable** - Even heavy users are profitable at $6.99/month
5. **Defensible** - Hard to copy, requires good AI integration

**Revised Home Screen Priority**:
```
[HUGE GOLD BUTTON]
💬 Chat with Your Tailor
Premium • Your personal style expert

[Smaller buttons below]
📸 Quick Style Check (Free: 8 remaining)
🎯 Build an Outfit
```

The message: "Chat is the premium experience. Quick checks are for trying us out."

This positions GAUGE as a **relationship** (chat with your tailor) not a **tool** (style checker). Much more premium.
