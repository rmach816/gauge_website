# GAUGE - MVP Refinement Instructions for Cursor

**Purpose**: Update PREMIUM_TAILOR_SHOP_REDESIGN.md with these refined specifications for a focused 6-week MVP launch.

---

## Executive Summary of Changes

### Scope Reductions (Cut from MVP)
- ❌ Weather API integration for travel recommendations
- ❌ Local store geolocation and directions
- ❌ Real-time product inventory checking
- ❌ Currency conversion for international shopping
- ❌ Social features (share outfits)
- ❌ Outfit calendar
- ❌ AR try-on

### MVP Focus (Keep & Enhance)
- ✅ Premium design system with gradients (no texture images)
- ✅ Complete onboarding flow with measurement visual guides
- ✅ Wardrobe management with AI categorization
- ✅ "Dress Me" - All 4 modes (Wardrobe, Shopping, Mixed, In-Store)
- ✅ Simplified affiliate shopping (keyword search, not real-time product APIs)
- ✅ Enhanced premium tier features
- ✅ Settings with budget preferences

---

## SECTION 1: Visual Design System Updates

### Replace "Background Textures" Section with:

#### Wood Background Implementation (Gradient-Based)

**Implementation Strategy**: Use CSS/React Native gradients to create wood-like depth without image assets. This ensures consistent rendering, better performance, and easier maintenance.

**Primary Background Gradients**:

```typescript
export const TailorGradients = {
  // Main screen background - dark wood effect
  woodDarkGradient: {
    colors: ['#3E2723', '#2C1810', '#1A0F0A'],
    locations: [0, 0.6, 1],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  // Card/panel background - medium wood effect
  woodMediumGradient: {
    colors: ['#5D4037', '#4E342E', '#3E2723'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  // Light accent panels
  parchmentGradient: {
    colors: ['#FDF6E3', '#F5EDD5', '#EDE4C8'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  // Premium buttons - gold shimmer
  goldGradient: {
    colors: ['#F4D03F', '#D4AF37', '#B8860B'],
    locations: [0, 0.5, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
} as const;
```

**Implementation Example**:
```typescript
import { LinearGradient } from 'expo-linear-gradient';

// Screen background
<LinearGradient
  colors={TailorGradients.woodDarkGradient.colors}
  locations={TailorGradients.woodDarkGradient.locations}
  start={TailorGradients.woodDarkGradient.start}
  end={TailorGradients.woodDarkGradient.end}
  style={styles.background}
>
  {/* Content */}
</LinearGradient>

// Card/panel
<LinearGradient
  colors={TailorGradients.woodMediumGradient.colors}
  style={styles.card}
>
  {/* Card content */}
</LinearGradient>

// Premium button
<LinearGradient
  colors={TailorGradients.goldGradient.colors}
  start={TailorGradients.goldGradient.start}
  end={TailorGradients.goldGradient.end}
  style={styles.premiumButton}
>
  {/* Button content */}
</LinearGradient>
```

**Design Guidelines**:
- Always use `TailorColors.cream` or `TailorColors.ivory` for text on dark gradients
- Test text contrast ratio (minimum 4.5:1 for WCAG AA compliance)
- Use `woodMediumGradient` for cards to create visual depth
- Reserve `goldGradient` for premium CTAs and highlights

**Dependencies**:
```bash
npx expo install expo-linear-gradient
```

---

## SECTION 2: Onboarding Flow - Measurement Visual Guides

### Add New Subsection: "Measurement Visual Guide Specifications"

#### Overview
Each measurement screen requires a clear visual guide showing proper measurement technique. Use AI-generated images or high-quality stock photos.

#### Image Requirements

**General Specifications**:
- **Format**: PNG with transparent background (or white background)
- **Size**: 800x600px minimum, 1200x900px preferred
- **Subject**: Male figure in fitted gray t-shirt and dark fitted pants
- **Tape Measure**: Bright yellow or white for visibility
- **Style**: Clean, professional, well-lit
- **Annotations**: Red arrows and text labels pointing to measurement points

**Individual Measurement Guides**:

1. **Height**
   - Full body shot, side view
   - Tape measure running from floor to top of head
   - Person standing straight against wall
   - Label: "Stand straight, measure floor to top of head"

2. **Weight**
   - Person standing on digital scale (visible display)
   - Front view, full body
   - Label: "Weigh yourself in morning, before eating"

3. **Chest**
   - Front view, tape measure across fullest part of chest
   - Arms at sides
   - Red arrows pointing to: "Across nipple line, under armpits"
   - Label: "Measure around fullest part, breathe normally"

4. **Waist**
   - Front view, tape measure at natural waistline
   - Red arrow pointing to: "At belly button level"
   - Label: "Measure at narrowest point, don't hold breath"

5. **Inseam**
   - Side view, tape measure from crotch to ankle
   - Person standing with legs together
   - Red arrows showing measurement path
   - Label: "Inside leg, crotch to ankle bone"

6. **Neck**
   - Front view close-up, tape measure around neck
   - Red arrow pointing to: "Just below Adam's apple"
   - Label: "Measure at base of neck, 2 fingers of space"

7. **Sleeve**
   - Side view, arm slightly bent
   - Tape measure from center back neck to wrist
   - Red arrows showing: shoulder → elbow → wrist path
   - Label: "Center back neck, over shoulder, to wrist bone"

8. **Shoulder**
   - Back view, tape measure across shoulder blade tops
   - Arms at sides
   - Red arrows pointing to: "Across shoulder seams"
   - Label: "From shoulder point to shoulder point, across back"

**AI Image Generation Prompts** (if using AI):
```
Professional men's clothing measurement guide, male model in gray fitted t-shirt, 
bright yellow measuring tape, clean white background, well-lit studio photography, 
photorealistic, detailed annotation arrows, measuring [BODY_PART], technical 
illustration style, fashion measurement tutorial
```

**Stock Image Resources**:
- Shutterstock: Search "men's body measurements guide"
- iStock: Search "tailor measuring man"
- Unsplash: Free option, search "man measuring tape"
- Custom creation: Use Midjourney, DALL-E, or Stable Diffusion

**Implementation**:
```typescript
// src/assets/measurement-guides/
// chest-measurement.png
// waist-measurement.png
// etc.

// In MeasurementScreen component:
<Image
  source={require(`../../assets/measurement-guides/${measurementType}-measurement.png`)}
  style={styles.guideImage}
  resizeMode="contain"
/>
```

---

## SECTION 3: "Dress Me" Feature - In-Store Assistant Detail

### Replace In-Store Assistant Description with:

#### In-Store Assistant (Premium Feature)

**Core Purpose**: Real-time styling assistance while shopping in physical stores, acting as a personal stylist in your pocket.

**User Flow**:

```
User enters store → Opens "In-Store Assistant" mode
  ↓
Takes photo of item on rack/mannequin
  ↓
AI analyzes in <5 seconds
  ↓
Shows instant feedback + outfit combinations
  ↓
User can:
  - Save to "Considering" list
  - Compare with other photos
  - See what from wardrobe it pairs with
  ↓
At checkout, review all "Considering" items
```

**Screen: In-Store Assistant Mode**

**Layout**:
- Full-screen camera view
- Semi-transparent bottom panel with:
  - Large circular "Capture" button (gold)
  - Small "Considering" counter badge (top right)
  - "How to Use" info button (top left)
- After capture: Analysis overlay with results

**Analysis Response Format**:

```typescript
interface InStoreAnalysisResult {
  quickFeedback: string; // "Great choice! This navy blazer is versatile."
  matchRating: 'excellent' | 'good' | 'okay' | 'skip';
  outfitSuggestions: Array<{
    description: string; // "Pair with your gray wool pants and brown leather shoes"
    fromWardrobe: ClosetItem[]; // Items user already owns
    buyAlso: string[]; // Other items to look for in store
  }>;
  styleNotes: string[]; // ["Classic fit suits your build", "Navy is in your color palette"]
  sizingAdvice?: string; // "Try 42R based on your measurements"
}
```

**Example Analysis Display**:

```
┌─────────────────────────────────────┐
│     [Photo of navy blazer]          │
│                                      │
│  âœ… Excellent Match                  │
│                                      │
│  "This navy blazer is perfect for   │
│   your style. It's a versatile      │
│   piece that works for business     │
│   and dressy casual occasions."     │
│                                      │
│  ðŸ'• Outfit Ideas:                   │
│                                      │
│  • With your gray wool pants +      │
│    brown leather oxfords            │
│    [Thumbnail of items]             │
│                                      │
│  • With dark jeans + white          │
│    dress shirt (look for in store)  │
│                                      │
│  ðŸ" Sizing Tip:                      │
│  Try 42R based on your chest (42")  │
│  and height (5'10")                 │
│                                      │
│  [Add to Considering] [Take Another]│
└─────────────────────────────────────┘
```

**"Considering" List Feature**:
- Temporary holding area for items user is thinking about
- Shows all photos taken during shopping session
- Side-by-side comparison view
- Can add notes to each item
- Clears after 24 hours or manual clear
- Export list as text/email for reference

**Technical Considerations**:

**Offline Mode**:
- Queue photos if no connectivity
- Process when connection restored
- Show "Queued for analysis (3)" indicator
- Local caching of previous analyses

**Performance**:
- Target: <5 seconds per analysis
- Compress images before upload (0.6 quality, 1200px max width)
- Show skeleton loading state during analysis
- Cache common outfit combinations

**Privacy**:
- No photos stored on servers (processed and discarded)
- Only results stored locally
- Clear "Photos are not saved" messaging

**Usage Limits**:
- Premium tier: Unlimited in-store analyses
- Free tier: "Upgrade to use In-Store Assistant" paywall

---

## SECTION 4: Shopping Integration - Simplified Approach

### Replace "API Integrations" Section with:

#### Shopping Integration (Simplified MVP)

**Strategy**: Use affiliate search links with smart keyword generation instead of real-time product APIs. This provides immediate functionality without complex integrations.

**How It Works**:

1. AI generates item description: "Navy cotton dress shirt, spread collar"
2. Service extracts keywords: ["navy", "cotton", "dress shirt", "spread collar", "men"]
3. Build affiliate search URLs for each retailer
4. User clicks link → Opens retailer search results → Purchases with affiliate tracking

**Enhanced AffiliateLinkService**:

```typescript
// src/services/affiliateLinks.ts

interface ShoppingSearchParams {
  garmentType: GarmentType;
  description: string; // AI-generated detailed description
  colors?: string[];
  styles?: string[];
  priceRange: PriceRange;
  userSize?: string; // Include if measurements available
}

export const AffiliateLinkService = {
  /**
   * Extract optimal search keywords from AI description
   */
  extractKeywords(description: string, garmentType: GarmentType): string[] {
    const keywords = ['men'];
    
    // Add garment type
    keywords.push(garmentType.toLowerCase());
    
    // Extract fabric types (cotton, wool, linen, etc.)
    const fabrics = ['cotton', 'wool', 'linen', 'silk', 'denim', 'leather'];
    fabrics.forEach(fabric => {
      if (description.toLowerCase().includes(fabric)) {
        keywords.push(fabric);
      }
    });
    
    // Extract style descriptors
    const styles = ['slim', 'fitted', 'relaxed', 'classic', 'modern', 'casual', 'formal'];
    styles.forEach(style => {
      if (description.toLowerCase().includes(style)) {
        keywords.push(style);
      }
    });
    
    // Extract colors
    const colors = ['navy', 'black', 'white', 'gray', 'blue', 'brown', 'tan'];
    colors.forEach(color => {
      if (description.toLowerCase().includes(color)) {
        keywords.push(color);
      }
    });
    
    return keywords;
  },

  /**
   * Build optimized search term
   */
  buildSearchTerm(params: ShoppingSearchParams): string {
    const { description, garmentType, colors, userSize } = params;
    
    const keywords = this.extractKeywords(description, garmentType);
    
    // Add size if available
    if (userSize) {
      keywords.push(userSize);
    }
    
    // Add primary color if not already included
    if (colors && colors.length > 0 && !keywords.includes(colors[0].toLowerCase())) {
      keywords.unshift(colors[0].toLowerCase());
    }
    
    return keywords.join(' ');
  },

  /**
   * Generate shopping options with smart search links
   */
  generateShoppingOptions(params: ShoppingSearchParams): ShoppingItem[] {
    const searchTerm = this.buildSearchTerm(params);
    const { garmentType, description, priceRange } = params;
    
    const options: ShoppingItem[] = [];
    
    // Amazon - widest selection
    options.push({
      id: uuid.v4() as string,
      name: description,
      brand: 'Amazon',
      price: 0, // Price unknown (user will see on site)
      imageUrl: '', // No preview image in MVP
      affiliateLink: this.generateAmazonLink(searchTerm, priceRange),
      retailer: 'Amazon',
      garmentType,
      priceRange,
      searchTerm, // Store for user reference
    });
    
    // Nordstrom - quality/premium
    if (priceRange !== PriceRange.BUDGET) {
      options.push({
        id: uuid.v4() as string,
        name: description,
        brand: 'Nordstrom',
        price: 0,
        imageUrl: '',
        affiliateLink: this.generateNordstromLink(searchTerm),
        retailer: 'Nordstrom',
        garmentType,
        priceRange,
        searchTerm,
      });
    }
    
    // J.Crew - mid-range, good style
    if (priceRange === PriceRange.MID || priceRange === PriceRange.BUDGET) {
      options.push({
        id: uuid.v4() as string,
        name: description,
        brand: 'J.Crew',
        price: 0,
        imageUrl: '',
        affiliateLink: this.generateJCrewLink(searchTerm),
        retailer: 'J.Crew',
        garmentType,
        priceRange,
        searchTerm,
      });
    }
    
    // Bonobos - great fit
    if (priceRange !== PriceRange.BUDGET) {
      options.push({
        id: uuid.v4() as string,
        name: description,
        brand: 'Bonobos',
        price: 0,
        imageUrl: '',
        affiliateLink: this.generateBonobosLink(searchTerm),
        retailer: 'Bonobos',
        garmentType,
        priceRange,
        searchTerm,
      });
    }
    
    return options;
  },

  /**
   * Enhanced Amazon link with price filtering
   */
  generateAmazonLink(searchTerm: string, priceRange: PriceRange): string {
    const encoded = encodeURIComponent(searchTerm);
    const baseUrl = `https://www.amazon.com/s?k=${encoded}`;
    
    // Add price filters
    let priceFilter = '';
    switch (priceRange) {
      case PriceRange.BUDGET:
        priceFilter = '&rh=p_36:1253503011'; // Under $50
        break;
      case PriceRange.MID:
        priceFilter = '&rh=p_36:1253505011'; // $50-$100
        break;
      case PriceRange.PREMIUM:
        priceFilter = '&rh=p_36:1253506011'; // $100-$200
        break;
    }
    
    return `${baseUrl}${priceFilter}&tag=${AMAZON_AFFILIATE_TAG}`;
  },

  // ... other retailer link generators remain similar
};
```

**Shopping Card UI Enhancement**:

```typescript
// Display shopping options with clear expectations

<ShoppingCard>
  <RetailerLogo>Amazon</RetailerLogo>
  <Description>Navy cotton dress shirt, spread collar</Description>
  <SearchTermBadge>Searching: "men navy cotton dress shirt"</SearchTermBadge>
  <PriceRangeBadge>$25-$75</PriceRangeBadge>
  
  <Button onPress={openLink}>
    Search on Amazon →
  </Button>
  
  <HelperText>
    We'll search Amazon for items matching this description. 
    Results open in your browser.
  </HelperText>
</ShoppingCard>
```

**Future Enhancement Path** (Post-MVP):
- Phase 2: Integrate with Amazon Product Advertising API for real product data
- Phase 3: Add real-time pricing, images, ratings
- Phase 4: In-app product browsing without leaving app

---

## SECTION 5: Premium Tier - Enhanced Features

### Replace "Premium Pricing" Section with:

#### Premium Tier Strategy

**Pricing**: $6.99/month (unchanged)

**Premium Features** (Expanded):

**Core Premium Features**:
1. **Unlimited Style Checks** (Free tier: 10 checks)
2. **In-Store Assistant** (Camera-based real-time styling)
3. **Unlimited Wardrobe Items** (Free tier: 20 items max)
4. **Favorite Combinations** (Save unlimited outfit combinations)
5. **Priority AI Processing** (Faster analysis queue)

**Additional Premium Perks**:
6. **Advanced Measurements** (Body type analysis, fit recommendations beyond basic sizing)
7. **Seasonal Refresh Reminders** ("Time to update your wardrobe for fall")
8. **Style Evolution Tracking** (See how your style preferences change over time)
9. **Export Features** (Export wardrobe as PDF, shopping lists as text)
10. **Early Access** (New features, special occasions, holiday outfit planning)

**Free Tier Limitations**:
- 10 style checks total (lifetime, not per month)
- No in-store assistant access
- Max 20 wardrobe items
- Can't save favorite combinations
- Standard processing speed
- Basic measurements only

**Upgrade Prompts**:

**After 8th Free Check**:
```
"You have 2 free checks remaining"
[Upgrade to Premium] [Continue]
```

**After 10th Check**:
```
"You've used all 10 free checks!"

Premium gives you:
âœ… Unlimited style checks
âœ… In-store shopping assistant
âœ… Unlimited wardrobe items
âœ… Advanced fit recommendations

$6.99/month • Cancel anytime

[Start Premium Trial] [Maybe Later]
```

**Wardrobe Limit**:
```
"You've reached the 20-item wardrobe limit"

Premium members get:
âœ… Unlimited wardrobe items
âœ… Favorite outfit combinations
âœ… Advanced organization

[Upgrade to Premium] [Manage Items]
```

**In-Store Assistant Gate**:
```
[Premium Feature badge]

"In-Store Assistant helps you shop with confidence"

Real-time styling advice while you shop:
• Instant match analysis
• Outfit combinations
• Size recommendations
• Compare multiple items

Available with Premium ($6.99/month)

[Upgrade Now] [Learn More]
```

---

## SECTION 6: Target Audience & User Personas

### Add New Section: "Target Audience Definition"

#### Primary Audience

**Men who struggle with clothing decisions** but want to look put-together. This crosses age ranges and style consciousness levels.

**Persona 1: "The Overwhelmed Professional"**
- **Age**: 28-45
- **Occupation**: Office job, client-facing roles
- **Pain Point**: "I have no idea what goes together. I wear the same 3 outfits."
- **Motivation**: Wants to look professional but doesn't know where to start
- **App Usage**: Relies heavily on "Dress Me" for complete outfits, follows suggestions exactly
- **Premium Driver**: Unlimited checks as he builds confidence

**Persona 2: "The Efficient Optimizer"**
- **Age**: 25-40
- **Occupation**: Tech, startup, consulting
- **Pain Point**: "I don't have time to think about clothes. Just tell me what works."
- **Motivation**: Values efficiency, wants quick decisions, minimal effort
- **App Usage**: Uses wardrobe mode, wants fast yes/no answers
- **Premium Driver**: In-store assistant for efficient shopping trips

**Persona 3: "The Style-Conscious Improver"**
- **Age**: 22-55
- **Occupation**: Any, prioritizes appearance
- **Pain Point**: "I care about style but need guidance to level up."
- **Motivation**: Wants to refine taste, stay current, get validation
- **App Usage**: Experiments with different modes, saves combinations, browses shopping
- **Premium Driver**: Advanced recommendations, style evolution tracking

**Persona 4: "The Special Occasion Dresser"**
- **Age**: 30-65
- **Occupation**: Any
- **Pain Point**: "I need to dress up for weddings/events but don't know the rules."
- **Motivation**: Wants to avoid embarrassment, dress appropriately
- **App Usage**: Primarily uses occasion-based outfit builder
- **Premium Driver**: Less likely to upgrade unless events are frequent

**Persona 5: "The Body-Conscious Dresser"**
- **Age**: 25-60
- **Occupation**: Any
- **Pain Point**: "Nothing fits me right. I don't know what styles work for my body."
- **Motivation**: Wants clothes that flatter, hide insecurities, boost confidence
- **App Usage**: Heavy measurement input, values size recommendations
- **Premium Driver**: Advanced body type analysis

**Demographics**:
- **Age Range**: 22-65 (broad appeal)
- **Income**: $40k-$150k+ (freemium allows wide entry)
- **Tech Savvy**: Medium (app must be intuitive)
- **Fashion Knowledge**: Low to Medium (high fashion knowledge users don't need this)

**Secondary Audience**:
- Partners/spouses who help men shop ("Let me check the app for him")
- Professional stylists using as a client tool
- Retail sales associates recommending to customers

---

## SECTION 7: Implementation Phases - Refined Timeline

### Replace "Implementation Phases" Section with:

#### MVP Implementation Timeline (6 Weeks)

**Goal**: Launch functional premium experience with core features, prove product-market fit.

---

### Week 1-2: Foundation & Design System

**Deliverables**:
- [ ] Complete design system implementation
  - [ ] TailorColors palette
  - [ ] TailorTypography system
  - [ ] TailorGradients (wood effect backgrounds)
  - [ ] TailorSpacing, BorderRadius, Shadows
  - [ ] GoldButton component (premium CTAs)
  - [ ] WoodBackground component (LinearGradient wrapper)
- [ ] Update all existing screens with new design
- [ ] Create reusable components:
  - [ ] MeasurementGuideCard
  - [ ] PremiumBadge
  - [ ] StepIndicator (for onboarding)
  - [ ] SkipButton (consistent across onboarding)

**Testing Checkpoints**:
- Text contrast meets WCAG 4.5:1 on all backgrounds
- Gradients render consistently on iOS and Android
- Premium gold aesthetic feels high-end

---

### Week 2-3: Onboarding Flow

**Deliverables**:
- [ ] Welcome screen (logo, greeting, wood background)
- [ ] Greeting screen (personalized message)
- [ ] Measurement screens (8 screens, one per measurement)
  - [ ] Create/source measurement guide images (AI-generated or stock)
  - [ ] Height, Weight, Chest, Waist, Inseam, Neck, Sleeve, Shoulder
  - [ ] Each with visual guide, input field, "Why we need this" explanation
  - [ ] Skip button on each screen
- [ ] Shoe size screen
- [ ] Style preferences screen
  - [ ] 4 options: Conservative, Modern, Stylish, Fashion-Forward
  - [ ] Image examples for each (can be placeholder photos initially)
- [ ] Wardrobe photo onboarding
  - [ ] "Would you like to add wardrobe items?" screen
  - [ ] Photo guidelines explanation
  - [ ] Skip option prominent
- [ ] Completion screen ("You're all set!")
- [ ] OnboardingService implementation
  - [ ] Track onboarding completion state
  - [ ] Allow restart from Settings
  - [ ] Skip functionality at any step

**Testing Checkpoints**:
- Complete onboarding flow end-to-end
- Skip from any screen and resume later
- Measurements save correctly
- Photos capture and categorize properly

---

### Week 3-4: Core "Dress Me" Feature

**Deliverables**:
- [ ] Dress Me home screen
  - [ ] Mode selection cards (4 modes)
  - [ ] Premium badges on In-Store Assistant
  - [ ] Usage counter for free tier
- [ ] **Mode 1: Wardrobe Mode**
  - [ ] Occasion selector (enhanced)
  - [ ] Generate outfits from wardrobe
  - [ ] Display 2-3 outfit combinations
  - [ ] Save as favorite option
- [ ] **Mode 2: Shopping Mode**
  - [ ] Occasion + style preference selector
  - [ ] Budget/price range toggle
  - [ ] Generate complete outfit
  - [ ] Show shopping links (affiliate)
  - [ ] "Search on [Retailer]" buttons
- [ ] **Mode 3: Mixed Mode**
  - [ ] Select wardrobe items to include
  - [ ] Generate outfit with selected items + shopping recommendations
  - [ ] Combined display (owned + buy)
- [ ] **Mode 4: In-Store Assistant** (Premium)
  - [ ] Camera interface
  - [ ] "Upgrade to Premium" paywall for free users
  - [ ] Quick analysis (premium users)
  - [ ] "Considering" list feature
  - [ ] Side-by-side comparison
- [ ] Enhanced AffiliateLinkService (keyword-based search)
- [ ] Claude Vision prompts for all modes

**Testing Checkpoints**:
- All 4 modes generate appropriate results
- Free tier users see paywall for in-store assistant
- Affiliate links open correctly with tracking
- Analysis completes in <10 seconds

---

### Week 4-5: Wardrobe & Settings

**Deliverables**:
- [ ] Enhanced Wardrobe Screen
  - [ ] Grid view of items
  - [ ] Add item flow with AI categorization
  - [ ] Delete items
  - [ ] View item details
  - [ ] Favorite combinations section
  - [ ] Free tier: Max 20 items (with upgrade prompt)
  - [ ] Premium: Unlimited items
- [ ] Enhanced Settings Screen
  - [ ] Edit measurements (jump to measurement input)
  - [ ] Style preferences
  - [ ] Budget settings (Budget/Mid/Premium price range preference)
  - [ ] Language selection (English for MVP, placeholder for future)
  - [ ] Premium status display
  - [ ] "Restart Onboarding" button
  - [ ] Test premium activation (for development)
- [ ] Favorite Combinations
  - [ ] Save outfit combinations (premium only)
  - [ ] View saved combinations
  - [ ] Delete combinations
- [ ] Premium management
  - [ ] PremiumService implementation
  - [ ] Usage tracking (free tier checks)
  - [ ] Paywall screens for each premium feature

**Testing Checkpoints**:
- Wardrobe CRUD operations work
- AI categorization is reasonably accurate
- Premium gates trigger correctly
- Settings persist across sessions

---

### Week 5-6: Polish, Testing & Launch Prep

**Deliverables**:
- [ ] Navigation refinement
  - [ ] Smooth transitions between screens
  - [ ] Proper back button handling
  - [ ] Tab navigation polish
- [ ] Loading states
  - [ ] Skeleton screens during AI analysis
  - [ ] Progress indicators
  - [ ] Timeout handling (>30s)
- [ ] Error handling
  - [ ] Network errors (offline mode messaging)
  - [ ] API errors (Claude unavailable)
  - [ ] User-friendly error messages
  - [ ] Retry mechanisms
- [ ] Empty states
  - [ ] No wardrobe items yet
  - [ ] No history yet
  - [ ] No favorite combinations
- [ ] Premium features polish
  - [ ] In-store assistant UI refinement
  - [ ] "Considering" list UX
  - [ ] Premium badge consistency
- [ ] Comprehensive testing
  - [ ] End-to-end user flows
  - [ ] Free tier restrictions
  - [ ] Premium feature access
  - [ ] Performance testing
- [ ] App store preparation
  - [ ] Screenshots (with wood backgrounds, gold accents)
  - [ ] App description emphasizing premium experience
  - [ ] Privacy policy (no photo storage on servers)
  - [ ] Terms of service

**Testing Checkpoints**:
- No crashes during normal usage
- Graceful handling of network issues
- All premium gates work correctly
- Performance is smooth (60fps)
- Ready for TestFlight/Beta

---

### Post-MVP (Future Phases)

**Phase 2 (Week 7-10): Enhanced Shopping**
- Real-time product API integration (Amazon, Nordstrom)
- Product images, prices, ratings in-app
- Price comparison
- Favorites/wishlist

**Phase 3 (Week 11-14): Social & Community**
- Share outfits (optional)
- Style inspiration feed
- Local store suggestions (if demand exists)

**Phase 4 (Week 15+): Advanced Features**
- Travel/weather recommendations
- Outfit calendar
- Style evolution tracking
- AR try-on (exploration)

---

## SECTION 8: Critical Technical Notes

### Add New Section: "MVP Technical Considerations"

#### Image Compression & Performance

**Problem**: Claude Vision API costs scale with image size. Full-resolution photos are expensive and slow.

**Solution**:
```typescript
// src/utils/imageCompression.ts

import * as ImageManipulator from 'expo-image-manipulator';

export const compressImage = async (uri: string): Promise<string> => {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }], // Max 1200px width
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipResult.uri;
  } catch (error) {
    console.error('Image compression failed:', error);
    return uri; // Return original if compression fails
  }
};

// Usage in PhotoCapture:
const handlePhotoCaptured = async (uri: string) => {
  const compressedUri = await compressImage(uri);
  onPhotoCaptured(compressedUri);
};
```

**Impact**:
- Reduces API costs by ~70%
- Faster uploads (especially on slower connections)
- Maintains sufficient quality for AI analysis

---

#### Claude API Cost Management

**Estimated Costs**:
- Per style check: ~$0.016 (with compressed images)
- Per wardrobe categorization: ~$0.008 (single image)
- Per in-store analysis: ~$0.012 (single image, faster processing)

**10,000 users, average 5 checks each = 50,000 checks**
- Cost: 50,000 × $0.016 = $800/month
- Revenue (if 5% convert to premium): 500 × $6.99 = $3,495/month
- Gross margin: ~77% (healthy)

**Cost Optimization Strategies**:
1. Compress all images before API calls (already implemented above)
2. Cache common outfit combinations (e.g., "business casual wedding guest")
3. Batch process wardrobe photos (analyze multiple items in one API call)
4. Implement API call timeouts (max 30 seconds)
5. Monitor usage patterns and optimize prompts

---

#### Offline Mode & Error Handling

**In-Store Assistant Offline Queue**:
```typescript
// src/services/offlineQueue.ts

interface QueuedAnalysis {
  id: string;
  imageUri: string;
  timestamp: string;
  requestType: 'in-store-analysis';
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export const OfflineQueueService = {
  async queueAnalysis(imageUri: string): Promise<string> {
    const queuedItem: QueuedAnalysis = {
      id: uuid.v4(),
      imageUri,
      timestamp: new Date().toISOString(),
      requestType: 'in-store-analysis',
      status: 'pending',
    };
    
    const queue = await StorageService.getOfflineQueue();
    queue.push(queuedItem);
    await StorageService.saveOfflineQueue(queue);
    
    return queuedItem.id;
  },
  
  async processQueue(): Promise<void> {
    const queue = await StorageService.getOfflineQueue();
    const pending = queue.filter(item => item.status === 'pending');
    
    for (const item of pending) {
      try {
        item.status = 'processing';
        await StorageService.saveOfflineQueue(queue);
        
        const result = await ClaudeVisionService.analyzeStyle({
          imageBase64: [item.imageUri],
          requestType: item.requestType,
        });
        
        item.status = 'completed';
        // Store result for user to review
        await StorageService.saveAnalysisResult(item.id, result);
        
      } catch (error) {
        item.status = 'failed';
        console.error('Queue processing failed:', error);
      }
      
      await StorageService.saveOfflineQueue(queue);
    }
  },
};

// Check network status and process queue
import NetInfo from '@react-native-community/netinfo';

NetInfo.addEventListener(state => {
  if (state.isConnected) {
    OfflineQueueService.processQueue();
  }
});
```

---

#### Premium Activation (Development Testing)

**Test Premium Activation** (Settings screen):
```typescript
// src/screens/ProfileScreen.tsx

{__DEV__ && (
  <View style={styles.devSection}>
    <Text style={styles.devLabel}>Development Tools</Text>
    <Button
      title="Activate Premium (Test)"
      onPress={async () => {
        await PremiumService.activatePremium();
        Alert.alert('Success', 'Premium activated for testing');
      }}
    />
    <Button
      title="Reset to Free Tier (Test)"
      onPress={async () => {
        await PremiumService.deactivatePremium();
        Alert.alert('Success', 'Reset to free tier');
      }}
    />
  </View>
)}
```

**Remove before production deploy.**

---

#### Affiliate Account Setup Preparation

**Before Launch Checklist**:
- [ ] Apply for Amazon Associates account (approval takes 24-48 hours)
- [ ] Apply for Nordstrom affiliate program
- [ ] Apply for J.Crew affiliate program (Commission Junction)
- [ ] Apply for Bonobos affiliate program
- [ ] Add affiliate IDs to .env file
- [ ] Test affiliate link tracking (make test purchases)
- [ ] Set up affiliate revenue tracking dashboard

**Note**: Most affiliate programs require an active app/website before approval. Consider launching MVP without affiliate IDs initially, using standard links, then updating once approved.

---

## SECTION 9: Success Metrics & Analytics

### Add New Section: "MVP Success Metrics"

#### Key Metrics to Track (First 90 Days)

**Onboarding Metrics**:
- Onboarding start rate (users who see welcome screen)
- Onboarding completion rate (goal: >60%)
- Average measurements completion (goal: >40%)
- Wardrobe photos added during onboarding (goal: >30%)
- Average time to complete onboarding (target: <5 minutes)

**Engagement Metrics**:
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Average "Dress Me" uses per user (goal: 2+ per week)
- Mode preference distribution (Wardrobe vs Shopping vs Mixed vs In-Store)
- Wardrobe items added (goal: average 10+ items per user)

**Premium Conversion Metrics**:
- Free check exhaustion rate (users who hit 10 check limit)
- Time to premium upgrade (days from signup to upgrade)
- Premium conversion rate by trigger:
  - Check limit reached: goal >15%
  - In-store assistant attempt: goal >8%
  - Wardrobe limit reached: goal >5%
- Premium retention (month-over-month)
- Churn rate (premium cancellations)

**Shopping Metrics**:
- Affiliate link clicks
- Click-through rate by retailer
- Average links clicked per outfit generation
- "Considering" list usage (in-store assistant)

**Technical Metrics**:
- API response time (target: p95 <8 seconds)
- AI analysis accuracy (manual review sample)
- App crash rate (target: <1%)
- Image upload success rate

**User Satisfaction**:
- App Store rating (goal: >4.2 stars)
- In-app feedback (add simple thumbs up/down after each check)
- Support tickets per 100 users
- Feature request themes

---

## SECTION 10: Launch Preparation Checklist

### Add New Section: "Pre-Launch Checklist"

#### App Store Assets

**iOS App Store**:
- [ ] Icon (1024x1024px) - sophisticated, wood-toned with gold accent
- [ ] Screenshots (5-8 required)
  - Screenshot 1: Welcome screen showing wood background
  - Screenshot 2: Measurement guide example
  - Screenshot 3: "Dress Me" mode selection
  - Screenshot 4: Outfit result with shopping links
  - Screenshot 5: In-store assistant in action (premium badge visible)
- [ ] App preview video (optional but recommended, 15-30 seconds)
- [ ] App description emphasizing "premium tailor experience"
- [ ] Keywords: men's style, outfit builder, wardrobe assistant, personal stylist, clothing match
- [ ] Privacy policy URL (required)
- [ ] Support URL (required)

**Android Play Store**:
- [ ] Icon (512x512px)
- [ ] Feature graphic (1024x500px)
- [ ] Screenshots (2-8 required, same as iOS)
- [ ] Short description (80 characters)
- [ ] Full description
- [ ] Privacy policy URL (required)

#### Legal & Compliance

- [ ] Privacy Policy (address: no photo storage, measurements stored locally, affiliate links)
- [ ] Terms of Service
- [ ] Affiliate disclosure (FTC compliance: "We earn commission from purchases made through our links")
- [ ] GDPR compliance (if targeting EU): Data deletion, export
- [ ] COPPA compliance: Age gate (13+)

#### Testing

- [ ] TestFlight beta (iOS) with 10-20 users
- [ ] Google Play Internal Testing (Android)
- [ ] Test on various devices (iPhone SE, iPhone 15, iPad, Android phones)
- [ ] Test on various iOS versions (iOS 16+)
- [ ] Test on various Android versions (Android 10+)
- [ ] Test offline mode
- [ ] Test premium features comprehensively
- [ ] Test all 4 "Dress Me" modes end-to-end

#### Infrastructure

- [ ] Claude API key activated and funded
- [ ] Rate limiting configured (prevent abuse)
- [ ] Error logging service (Sentry or similar)
- [ ] Analytics service (Mixpanel, Amplitude, or Firebase)
- [ ] Crash reporting (Crashlytics)
- [ ] Backend monitoring (if applicable)

---

## SECTION 11: Post-MVP Roadmap (Optional Section)

### Add New Section: "Beyond MVP - Future Vision"

#### Phase 2: Enhanced Shopping (Month 3-4)
- Real-time product APIs (Amazon Product Advertising API, Nordstrom)
- In-app product browsing with images, prices, ratings
- Price comparison across retailers
- Wishlist/favorites management
- Size availability checking
- Direct checkout links (deep linking)

#### Phase 3: Social & Discovery (Month 5-6)
- Share outfits (optional, privacy-first)
- Style inspiration feed (curated outfits)
- Local store suggestions with geolocation
- Store reviews and recommendations
- Community-sourced outfit ideas

#### Phase 4: Advanced Intelligence (Month 7-9)
- Travel outfit planner with weather integration
- Outfit calendar (plan outfits for upcoming events)
- Style evolution tracking (see how preferences change)
- Seasonal wardrobe recommendations
- Automated "wardrobe refresh" suggestions

#### Phase 5: Enterprise & B2B (Month 10-12)
- White-label solution for retailers (in-store kiosk mode)
- Professional stylist tools (manage multiple clients)
- Bulk wardrobe management
- Corporate dress code compliance checker

#### Long-Term Vision (Year 2+)
- AR try-on (virtual fitting room)
- 3D body scanning for perfect measurements
- Fabric care recommendations
- Tailoring service integration (send items to tailors)
- Clothing rental integration (Rent the Runway for men)
- Sustainability scoring (rate items by environmental impact)

---

## CRITICAL: Implementation Priority Order

### This is the EXACT order to build in:

1. **Design System** (Week 1)
   - Colors, typography, gradients
   - Base components (buttons, cards, backgrounds)
   
2. **Onboarding** (Week 2)
   - All 8+ screens
   - Measurement guides (images)
   - Skip functionality
   
3. **Wardrobe Management** (Week 3)
   - Add/delete items
   - AI categorization
   - Grid view
   
4. **"Dress Me" - Wardrobe Mode** (Week 3)
   - Generate outfits from existing items
   - Prove core value proposition
   
5. **"Dress Me" - Shopping Mode** (Week 4)
   - Generate outfit with affiliate links
   - Keyword-based search
   
6. **"Dress Me" - Mixed Mode** (Week 4)
   - Combine wardrobe + shopping
   
7. **Premium Gates** (Week 5)
   - Check counter
   - Wardrobe item limit
   - Paywalls
   
8. **"Dress Me" - In-Store Assistant** (Week 5)
   - Camera interface
   - Quick analysis
   - "Considering" list
   
9. **Settings & Profile** (Week 5)
   - Edit measurements
   - Preferences
   - Premium management
   
10. **Polish & Testing** (Week 6)
    - Loading states
    - Error handling
    - Performance optimization
    - Beta testing

---

## Questions for Clarification

Before implementing, please confirm:

1. **Measurement Images**: Should I generate AI prompts for all 8 measurement guide images, or will you source stock photos?

2. **Style Preference Images**: For the 4 style categories (Conservative, Modern, Stylish, Fashion-Forward), do you want placeholder images initially or should I suggest specific stock photo sources?

3. **Affiliate Timeline**: Since affiliate accounts take time to approve, should we launch with standard retailer links first, then update with affiliate IDs later?

4. **Beta Testing**: Do you have a group of beta testers lined up, or should we plan for public TestFlight?

5. **Analytics**: Which analytics service do you prefer? (Firebase is free and easy, Mixpanel has better features)

---

## Final Notes for Cursor

When updating PREMIUM_TAILOR_SHOP_REDESIGN.md:

1. **Replace** sections where explicitly stated ("Replace X Section with:")
2. **Add** new sections where indicated ("Add New Section:")
3. **Update** implementation phases with refined 6-week timeline
4. **Remove** all references to features cut from MVP (weather API, local stores, social features, AR try-on from MVP sections - keep in "Future" section only)
5. **Ensure** all shopping integration references use simplified keyword-based approach, not real-time product APIs
6. **Verify** all gradient implementations use `expo-linear-gradient` instead of image textures
7. **Emphasize** in-store assistant as the primary premium draw throughout the document
8. **Clarify** target audience is broad (men who struggle with clothing) not narrow (specific age range)
9. **Update** technical considerations with image compression, offline queue, cost management sections
10. **Add** comprehensive pre-launch checklist

This MVP is designed to launch in 6 weeks with a focused feature set that proves the core value proposition: **A premium personal tailor experience in your pocket.**
