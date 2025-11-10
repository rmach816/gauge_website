n# GAUGE - Premium Tailor Shop Redesign Guide

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Visual Design System](#visual-design-system)
3. [Onboarding Flow](#onboarding-flow)
4. [Core Features](#core-features)
5. [Navigation Structure](#navigation-structure)
6. [Data Models](#data-models)
7. [Screen Specifications](#screen-specifications)
8. [Component Specifications](#component-specifications)
9. [User Flows](#user-flows)
10. [Technical Implementation](#technical-implementation)
11. [Implementation Phases](#implementation-phases)
12. [Pre-Launch Critical Fixes](#pre-launch-critical-fixes)

---

## BUILD ORDER - START HERE

**Follow this exact sequence to build the app. Each step builds on the previous one.**

### Phase 1: Design System Foundation (Week 1)

**Step 1**: Create `src/utils/constants.ts` with complete design system
- Add `TailorColors` palette (wood tones, cream, gold, navy)
- Add `TailorTypography` system (display, headings, body, button, caption, label)
- Add `TailorGradients` (woodDarkGradient, woodMediumGradient, parchmentGradient, goldGradient)
- Add `TailorSpacing` (xs, sm, md, lg, xl, xxl, xxxl)
- Add `TailorBorderRadius` (sm, md, lg, xl, round)
- Add `TailorShadows` (small, medium, large)
- Add `TailorContrasts` (contrast-safe color pairings - **CRITICAL FIX #1**)
- Add `TailorColorUsage` (usage guidelines)

**Step 2**: Create `src/utils/contrastTest.ts`
- Implement WCAG contrast calculation utility
- Test all color combinations in development mode
- Verify cream on woodDark, navy on parchment, navy on gold all pass 4.5:1

**Step 3**: Create `src/components/WoodBackground.tsx`
- LinearGradient wrapper component
- Uses `TailorGradients.woodDarkGradient` by default
- Accepts children and optional gradient prop
- Implements adaptive performance (simplified gradients on low-end devices - **FIX #6**)

**Step 4**: Create `src/utils/devicePerformance.ts`
- Device performance detection utility
- `isLowEndDevice()` method
- `getAdaptiveGradient()` method for performance optimization

**Step 5**: Create `src/components/GoldButton.tsx`
- Premium CTA button component
- Uses `TailorGradients.goldGradient`
- Text color: `TailorColors.navy` (not gold - **CRITICAL FIX #1**)
- Supports title, onPress, disabled states

**Step 6**: Test contrast ratios
- Run contrast tests on all color combinations
- Fix any gold text on dark backgrounds
- Verify all text meets WCAG 4.5:1 standard
- Test in bright sunlight for outdoor readability

### Phase 2: Onboarding Infrastructure (Week 2)

**Step 7**: Create `src/services/onboarding.ts`
- `getOnboardingState()`: Promise<OnboardingState>
- `saveOnboardingState(state)`: Promise<void>
- `markStepComplete(step)`: Promise<void>
- `markStepSkipped(step)`: Promise<void>
- `hasCompletedOnboarding()`: Promise<boolean>
- `resetOnboarding()`: Promise<void>
- `markAsSkipped()`: Promise<void> (**CRITICAL FIX #2**)
- `shouldShowSetupReminder()`: Promise<boolean>

**Step 8**: Create `src/screens/onboarding/WelcomeScreen.tsx`
- Wood gradient background
- App logo/icon (centered)
- "Welcome to GAUGE" title
- "Get Started" button (gold, primary CTA)
- **"Skip Setup - Try Basic Features" button (CRITICAL FIX #2)**
- Helper text: "You can complete setup anytime from Settings"

**Step 9**: Create `src/components/SetupReminderBanner.tsx`
- Shows for users who skipped onboarding
- Displays: "📸 Complete setup for personalized recommendations"
- "Setup Now" button (navigates to Settings)
- Dismissible with "×" button

**Step 10**: Create `src/screens/onboarding/GreetingScreen.tsx`
- Personalized greeting message
- Progress indicator (if not skipping)
- Continue button
- Skip button (always visible)

**Step 11**: Create `src/components/ProgressIndicator.tsx`
- Shows "Step X of Y" during onboarding
- Visual progress bar
- Used across all measurement screens

**Step 12**: Create `src/screens/onboarding/MeasurementStepScreen.tsx`
- Reusable component for each measurement
- Visual guide image (measurement illustration)
- Instructions text
- Number input field with unit (inches)
- "Next" button (gold, primary)
- "Skip This" button (text, secondary)
- Progress indicator

**Step 13**: Create measurement guide images
- Source or create 8 images: height, weight, chest, waist, inseam, neck, sleeve, shoulder
- Store in `src/assets/measurement-guides/`
- Format: PNG, 800x600px minimum, transparent background

**Step 14**: Create `src/screens/onboarding/StylePreferencesScreen.tsx`
- Title: "What's your style?"
- 4 style cards (Conservative, Modern, Stylish, Fashion-Forward)
- Each card: large outfit image, style name, description
- Multi-select enabled
- Selected state: gold border
- Continue/Skip buttons

**Step 15**: Create `src/screens/onboarding/WardrobePhotoScreen.tsx`
- Title and explanation
- **Photo guidelines section with privacy messaging (CRITICAL FIX #4)**
- Privacy icon and "Your Privacy Matters" section
- Camera interface or photo picker
- Photo review with AI categorization
- Skip option prominent

**Step 16**: Create `src/screens/onboarding/CompletionScreen.tsx`
- Success message: "Perfect! You're all set."
- Summary of collected data (if any)
- "Start Using GAUGE" button (gold, primary)
- Link to Settings

### Phase 3: Core Features (Week 3-4)

**Step 17**: Update `src/screens/HomeScreen.tsx`
- Wood gradient background
- Title: "How can I help you today?"
- **Large gold button: "Chat with Your Tailor" (Premium badge)**
- Standard button: "Quick Style Check" (usage counter for free tier)
- Standard button: "Build an Outfit"
- **SetupReminderBanner component (if user skipped onboarding)**

**Step 18**: Create `src/screens/QuickStyleCheckScreen.tsx`
- Photo capture (1-3 photos)
- **Privacy messaging visible (CRITICAL FIX #4)**
- Instant AI analysis
- Results display with rating (Great/Okay/Poor)
- Free tier counter display
- Premium: Unlimited

**Step 19**: Create `src/screens/BuildOutfitScreen.tsx`
- Occasion selector
- Mode selection (Wardrobe/Shopping/Mixed)
- Price range selector (optional)
- Outfit generation
- Results with shopping links

**Step 20**: Update `src/screens/ClosetScreen.tsx` (Wardrobe)
- Grid view of items
- Filter by garment type, color, brand
- Search functionality
- Add item button
- Free tier: Max 20 items (with upgrade prompt)
- Premium: Unlimited items

**Step 21**: Create `src/screens/AddClosetItemScreen.tsx`
- Camera/photo picker
- AI auto-categorization (garment type, color, brand)
- Review and edit screen
- Save to wardrobe
- **Privacy messaging visible (CRITICAL FIX #4)**

### Phase 4: Premium Chat Feature (Week 4-5)

**Step 22**: Create `src/services/chat.ts`
- `startSession()`: Promise<ChatSession>
- `buildSystemContext(profile, wardrobe)`: Promise<string>
- `sendMessage(session, userMessage, profile, wardrobe)`: Promise<ChatMessage>
- `saveSession(session)`: Promise<void>
- `loadRecentSession()`: Promise<ChatSession | null>

**Step 23**: Update `src/services/premium.ts`
- Add `getFreeChatStatus()`: Promise<{hasUsedFreeMessage, canUseFreeMessage}> (**CRITICAL FIX #3**)
- Add `markFreeChatMessageUsed()`: Promise<void>
- Track `hasUsedFreeChatMessage` in premium status

**Step 24**: Create `src/screens/ChatScreen.tsx`
- Parchment gradient background
- Header: "Chat with Your Tailor" with back button
- Message list (FlatList)
- Message bubbles (AI: wood gradient, User: gold gradient)
- Input bar: camera button, text input, send button
- **Allow 1 free message for non-premium users (CRITICAL FIX #3)**
- **Show upgrade prompt after AI responds to free message**
- Typing indicator
- Loading states

**Step 25**: Create `src/components/UpgradePromptOverlay.tsx`
- Shows after free user's first chat message
- Features list (unlimited chat, wardrobe, shopping, in-store)
- Price: $6.99/month
- "Upgrade to Premium" button (gold)
- "Maybe Later" dismiss button

**Step 26**: Create `src/components/MessageBubble.tsx`
- Renders text and image messages
- AI messages: left-aligned, wood gradient
- User messages: right-aligned, gold gradient
- Avatar components (AI tailor icon, user icon)

### Phase 5: Shopping & Results (Week 4-5)

**Step 27**: Update `src/components/ShoppingCard.tsx`
- **Add price range badge (IMPORTANT FIX #5)**
- Retailer logo/name
- Item description
- Search term display
- **Price range: "$25-$50", "$50-$100", "$100-$200"**
- **Disclaimer: "Prices may vary. We earn a small commission."**
- CTA button: "Search on [Retailer] →"

**Step 28**: Update `src/screens/ResultScreen.tsx`
- Display outfit results
- **Calculate and show total outfit price range (IMPORTANT FIX #5)**
- Shopping cards with price ranges
- Save as favorite (premium only)
- Share options

**Step 29**: Update `src/services/affiliateLinks.ts`
- Extract keywords from AI descriptions
- Generate affiliate search URLs
- Include price range in search terms
- Multiple retailer options per item

### Phase 6: Settings & Polish (Week 5-6)

**Step 30**: Update `src/screens/SettingsScreen.tsx`
- Profile section (edit measurements, style preferences, shoe size)
- Wardrobe section (manage items, restart setup)
- Shopping preferences (budget settings, preferred retailers)
- Account section (language, premium status, subscription management)
- **Privacy & Data section (CRITICAL FIX #4)**
  - Photo Privacy setting
  - Local Storage info
  - Affiliate Disclosure
  - Link to Privacy Policy
- About section (app version, terms, privacy policy, contact)

**Step 31**: Create `src/screens/PrivacyPolicyScreen.tsx`
- Comprehensive privacy policy
- Photo privacy section (never stored)
- Data storage section (local only)
- Affiliate disclosure
- Third party services
- User rights
- Contact information

**Step 32**: Update all photo capture screens with privacy messaging
- Quick Style Check screen
- Chat photo button
- Wardrobe photo screen
- Add item screen
- **Consistent messaging: "Photos processed instantly, never stored"**

**Step 33**: Performance optimization
- Test on low-end Android device
- Implement adaptive gradients (simplify on low-end devices)
- Profile with React DevTools
- Verify 60fps on all main screens
- **Limit gradient usage (only main screens, not cards)**

**Step 34**: Typography consistency
- Update all typography to use platform-specific fonts
- iOS: SF Pro Display/Text
- Android: Roboto
- **Remove serif fonts for consistency (IMPORTANT FIX #7)**
- Test font weights and line heights

**Step 35**: Final testing
- Run all contrast tests
- Test "Skip All" onboarding flow
- Test free chat message preview
- Test privacy messaging visibility
- Test price range displays
- Test performance on low-end devices
- Test typography consistency

---

## Design Philosophy

### Core Concept
Transform GAUGE from a utility app into a **premium, personalized tailoring experience**. Users should feel like they're walking into a high-end custom tailor shop where they're the center of attention, receiving expert guidance and personalized service.

### Key Principles
1. **Sophistication**: Stained wood aesthetics, rich textures, elegant typography
2. **Personalization**: Every interaction feels tailored to the individual
3. **Guidance**: Proactive assistance, not just reactive tools
4. **Premium Feel**: High-quality visuals, smooth animations, attention to detail
5. **Accessibility**: Beautiful but functional, clear hierarchy, readable text

---

## Visual Design System

### Color Palette

#### Primary Colors
```typescript
export const TailorColors = {
  // Wood Tones (Backgrounds)
  woodDark: '#3E2723',        // Dark stained wood (primary background)
  woodMedium: '#5D4037',      // Medium wood (cards, panels)
  woodLight: '#8D6E63',       // Light wood accents
  
  // Cream & Ivory (Text on Wood)
  cream: '#F5F5DC',           // Primary text on dark backgrounds
  ivory: '#FFF8DC',           // Secondary text
  parchment: '#FDF6E3',       // Light backgrounds, cards
  
  // Gold Accents (Premium Elements)
  gold: '#D4AF37',            // Premium badges, highlights
  goldLight: '#F4D03F',       // Hover states, active elements
  goldDark: '#B8860B',        // Pressed states
  
  // Deep Navy (Text & Contrast)
  navy: '#1A1A2E',            // Primary text on light backgrounds
  navyLight: '#2E2E4A',       // Secondary text
  
  // Accent Colors
  burgundy: '#800020',        // Error states, important actions
  forest: '#2D5016',          // Success states
  bronze: '#CD7F32',          // Info states
  
  // Neutral Grays (for UI elements)
  grayLight: '#E8E8E8',       // Borders, dividers
  grayMedium: '#A0A0A0',      // Disabled text
  grayDark: '#505050',        // Placeholder text
} as const;
```

#### Usage Guidelines
- **Dark Wood Backgrounds**: Use `woodDark` for main screens, `woodMedium` for cards
- **Text on Wood**: Always use `cream` or `ivory` for readability
- **Text on Light**: Use `navy` or `navyLight` for contrast
- **Premium Elements**: Use `gold` for premium badges, subscription highlights
- **Interactive Elements**: Gold accents for buttons, active states

### Typography

```typescript
export const TailorTypography = {
  // Display (Hero Text, Greetings)
  display: {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
    letterSpacing: -0.5,
    fontFamily: 'System', // Use system serif if available
  },
  
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  
  // Body Text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  
  // UI Elements
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
  },
} as const;
```

### Spacing System

```typescript
export const TailorSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;
```

### Border Radius

```typescript
export const TailorBorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 9999,
} as const;
```

### Shadows & Elevation

```typescript
export const TailorShadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
```

### Background Gradients

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

## Onboarding Flow

### Overview
The onboarding flow is **fully skippable** at every step. Users can access all setup features later from Settings. The flow should feel welcoming, not overwhelming.

### Flow Structure

```
Welcome Screen
  ↓
Greeting & Introduction
  ↓
Measurements (Optional, Step-by-Step)
  ├─ Height
  ├─ Weight
  ├─ Chest
  ├─ Waist
  ├─ Inseam
  ├─ Neck
  ├─ Sleeve
  └─ Shoulder
  ↓
Shoe Size (Optional)
  ↓
Style Preferences (Optional)
  ↓
Wardrobe Photos (Optional)
  ↓
Completion
```

### Screen Specifications

#### 1. Welcome Screen

**Purpose**: First impression, sets the premium tone

**Content**:
- App logo/icon (centered, large)
- Welcome message: "Welcome to GAUGE"
- Subtitle: "Your personal tailor, always at your service"
- Wood texture background
- Two buttons:
  - Primary: "Get Started" (gold button)
  - Secondary: "Skip Setup" (text button, cream color)

**Design Notes**:
- Full-screen wood texture background
- Centered content with generous spacing
- Elegant animation on logo appearance
- Smooth transition to next screen

#### 2. Greeting Screen

**Purpose**: Personal greeting, makes user feel valued

**Content**:
- Personalized greeting: "Hello! I'm delighted to have you here."
- Brief explanation: "Let's get to know you so I can provide the best recommendations."
- Progress indicator: "Step 1 of 8" (if not skipping)
- Continue button
- Skip button (always visible)

**Design Notes**:
- Warm, conversational tone
- Large, readable text on wood background
- Subtle animation on text appearance

#### 3. Measurements Screen (Step-by-Step)

**Purpose**: Collect body measurements one at a time with visual guidance

**Structure**: Each measurement gets its own screen

**Components per Measurement**:
1. **Measurement Name** (e.g., "Neck Measurement")
2. **Visual Guide**:
   - Illustration/diagram showing where to measure
   - Photo example (if available)
   - Text instructions: "Measure around the base of your neck, where your collar would sit"
3. **Input Field**:
   - Number input with unit (inches)
   - Placeholder: "Enter measurement"
   - Validation: Must be positive number, reasonable range
4. **Navigation**:
   - "Next" button (primary, gold)
   - "Skip This" button (secondary, text)
   - Progress indicator: "Step 3 of 8"

**Measurements Order**:
1. Height
2. Weight (with reassurance: "Don't worry, you're in a judgment-free zone")
3. Chest
4. Waist
5. Inseam
6. Neck
7. Sleeve
8. Shoulder

**Design Notes**:
- Each screen focuses on one measurement
- Visual guides are essential (illustrations or photos)
- Reassuring tone, especially for weight
- Can skip any individual measurement
- Progress saved if user exits

#### Measurement Visual Guide Specifications

**Overview**:
Each measurement screen requires a clear visual guide showing proper measurement technique. Use AI-generated images or high-quality stock photos.

**Image Requirements**:

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

#### 4. Shoe Size Screen

**Purpose**: Collect shoe size for footwear recommendations

**Content**:
- Title: "What's your shoe size?"
- Size selector (US sizes: 6-16)
- Or text input for international sizes
- Skip button

**Design Notes**:
- Simple, straightforward
- Visual size chart if helpful

#### 5. Style Preferences Screen

**Purpose**: Understand user's style preferences

**Content**:
- Title: "What's your style?"
- Style options with **image examples**:
  - Conservative (example outfit image)
  - Modern (example outfit image)
  - Stylish (example outfit image)
  - Fashion-Forward (example outfit image)
- Multi-select allowed (user can select multiple)
- Continue button
- Skip button

**Design Notes**:
- **Critical**: Include actual outfit images for each style
- Large, tappable cards with images
- Selected state: gold border, subtle highlight
- Can select multiple styles

#### 6. Wardrobe Photos Screen

**Purpose**: Optional wardrobe cataloging

**Content**:
- Title: "Do you have a wardrobe you'd like to catalog?"
- Explanation: "We can tailor combinations of the clothes you already have and suggest new items that pair well."
- **Photo Guidelines** (prominently displayed):
  - "Photo must show the entire piece"
  - "One item at a time"
  - "Works best with neutral background"
  - "Avoid multiple items in one photo"
- Visual examples: Good vs. Bad photo examples
- Two options:
  - "Start Adding Photos" (opens camera/photo picker)
  - "Skip for Now" (continues to completion)
- If adding photos:
  - Camera interface
  - Photo review screen (with option to retake)
  - AI categorization (auto-detect garment type, can override)
  - Continue adding or finish

**Design Notes**:
- Clear photo guidelines are essential
- Show good/bad examples visually
- Batch upload capability
- AI auto-categorization with manual override
- Can add photos later from Wardrobe screen

#### 7. Completion Screen

**Purpose**: Celebrate completion, transition to main app

**Content**:
- Success message: "Perfect! You're all set."
- Brief summary of what was collected (if any)
- "Start Using GAUGE" button (primary, gold)
- Link to Settings: "You can always adjust these in Settings"

**Design Notes**:
- Celebratory but not overdone
- Clear next step
- Reassurance about editing later

### Onboarding State Management

```typescript
interface OnboardingState {
  hasCompletedOnboarding: boolean;
  completedSteps: string[];
  skippedSteps: string[];
  currentStep: number;
  measurements?: Partial<UserMeasurements>;
  shoeSize?: string;
  stylePreferences?: StylePreference[];
  wardrobePhotos?: string[]; // URIs of photos added during onboarding
}
```

### Skip Functionality

- **Every screen** has a "Skip" or "Skip for Now" option
- Skipped steps can be completed later from Settings
- Onboarding can be restarted from Settings
- Progress is saved (user can exit and resume)

---

## Core Features

### 1. Chat with Your Tailor (Premium) - THE Core Feature

**The Insight**: Users don't want rigid modes - they want a conversation with their tailor. "Hey, will this blazer match my gray pants?" is natural. Clicking through mode selection screens is not.

**The Solution**: Premium users get unlimited chat sessions with their AI tailor, who knows their measurements, wardrobe, and style preferences. Free users get structured checks only.

#### The Experience

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

#### Premium Chat Feature

**Access Level**: Premium Only ($6.99/month)
**Free Tier**: Structured checks only, no chat access

**What Premium Users Get**:
- Unlimited chat sessions
- Multi-turn conversations with context retention
- Mix photos and text freely
- Reference wardrobe items by description
- Follow-up questions without re-submitting info
- Session history saved

#### Chat UI Design

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

#### Session Management

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

### 2. Quick Style Check (Free/Premium)

**Purpose**: One-shot style analysis without conversation. The original instant-check feature.

**Flow**:
1. Take/select 1-3 photos of outfit
2. AI analyzes and provides rating (Great/Okay/Poor)
3. Shows analysis and suggestions
4. No follow-up questions - single response only

**Free Tier**: 10 checks total (lifetime, not per month)
**Premium Tier**: Unlimited checks

### 3. Build an Outfit (Free/Premium)

**Purpose**: Structured outfit builder for users who prefer guided flows.

**Flow**:
1. Select occasion (required)
2. Select price range (optional)
3. Choose mode:
   - "Use My Wardrobe" - Generate from existing items
   - "Shop for New Items" - Complete shopping outfit
   - "Mix Both" - Combine wardrobe + shopping
4. AI generates outfit(s)
5. Display results with shopping links (if applicable)

**Features**:
- Structured, no conversation
- Good for users who prefer step-by-step guidance
- Can save as favorite combination (premium only)

### 4. Wardrobe Management

**Enhanced Features**:

#### Main Wardrobe Screen
- Grid view of all items
- Filter by: garment type, color, brand, occasion
- Search functionality
- Statistics: total items, by type, by color

#### Add Item Flow
1. Take/select photo
2. AI auto-categorization:
   - Garment type (shirt, pants, jacket, etc.)
   - Color detection
   - Style detection
   - Brand detection (if visible)
3. Review and edit:
   - Can override any AI detection
   - Add notes
   - Add brand manually
   - Tag for occasions
4. Save

#### Edit Item
- Update photo
- Edit category, color, brand, notes
- Delete item

#### Favorite Combinations
- Save complete outfits from "Dress Me"
- View saved combinations
- Edit combinations
- Share combinations (future feature)

### 5. Shop Screen

**Purpose**: Browse and discover new clothing

**Features**:
- Browse by category (shirts, pants, jackets, shoes, accessories)
- Style suggestions based on profile
- Filter by: price, color, size, brand, style
- Save items as favorites
- Direct purchase links (affiliate)
- New arrivals section
- Trending items section

**Note**: Local store suggestions moved to future phase (post-MVP)

### 6. Settings Screen

**Sections**:

1. **Profile**
   - Edit measurements (opens measurement flow)
   - Edit style preferences
   - Edit shoe size
   - Edit favorite occasions

2. **Wardrobe**
   - Manage wardrobe items
   - Restart wardrobe photo setup
   - Export wardrobe data (future)

3. **Shopping Preferences**
   - Budget settings (max price per item, per outfit)
   - Preferred retailers
   - Size preferences (if measurements not provided)
   - Notification preferences

4. **Account**
   - Language selection
   - Premium subscription status
   - Subscription management
   - Restart onboarding

5. **About**
   - App version
   - Terms of service
   - Privacy policy
   - Contact support

---

## Navigation Structure

### Proposed Structure

```
App Navigator (Stack)
├─ Onboarding Stack (if first launch)
│  └─ [Onboarding screens]
│
├─ Main Tabs (Bottom Tab Navigator)
│  ├─ Home Tab
│  │  └─ Home Screen
│  │     ├─ Chat with Your Tailor (Premium) - Primary CTA
│  │     ├─ Quick Style Check (Free/Premium)
│  │     └─ Build an Outfit (Free/Premium)
│  │
│  ├─ Chat Tab (Premium Only) - Alternative access to chat
│  │
│  ├─ Wardrobe Tab
│  │  ├─ Wardrobe Grid
│  │  ├─ Add Item Screen
│  │  ├─ Edit Item Screen
│  │  └─ Favorite Combinations
│  │
│  ├─ Shop Tab
│  │  ├─ Browse Screen
│  │  ├─ Item Detail Screen
│  │  ├─ Favorites Screen
│  │  └─ Local Stores Screen
│  │
│  ├─ History Tab
│  │  └─ Past Recommendations
│  │
│  └─ Settings Tab
│     └─ Settings Screen
│        ├─ Profile Settings
│        ├─ Wardrobe Settings
│        ├─ Shopping Preferences
│        └─ Account Settings
│
└─ Modal Screens (Stack)
   ├─ Result Screen (outfit results)
   ├─ Paywall Screen
   └─ Item Detail Screen
```

### Navigation Updates

**Bottom Tab Icons** (replace emojis with proper icons):
- Home: Tailor's scissors or suit icon
- Chat: Message/chat icon (Premium only, or shows paywall)
- Wardrobe: Hanger or closet icon
- Shop: Shopping bag icon
- History: Clock or list icon
- Settings: Gear icon

**Home Screen Layout**:
```
┌─────────────────────────────────────┐
│                                      │
│   [HUGE GOLD BUTTON]                 │
│   💬 Chat with Your Tailor          │
│   Premium • Your personal style     │
│   expert                             │
│                                      │
│   [Standard Button]                  │
│   📸 Quick Style Check               │
│   (Free: 8 remaining)                │
│                                      │
│   [Standard Button]                  │
│   🎯 Build an Outfit                 │
│   Choose occasion, we'll help        │
│                                      │
└─────────────────────────────────────┘
```

**The message**: "Chat is the premium experience. Quick checks are for trying us out."

---

## Data Models

### Updated Type Definitions

```typescript
// ============================================
// ENHANCED USER PROFILE
// ============================================

export interface UserMeasurements {
  height?: number;              // inches (optional)
  weight?: number;              // pounds (optional)
  chest?: number;               // inches (optional)
  waist?: number;               // inches (optional)
  inseam?: number;              // inches (optional)
  neck?: number;                // inches (optional)
  sleeve?: number;              // inches (optional)
  shoulder?: number;            // inches (optional)
  preferredFit: 'slim' | 'regular' | 'relaxed';
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  measurements?: UserMeasurements;
  shoeSize?: string;            // NEW: US size or international
  stylePreference: StylePreference[];
  favoriteOccasions: Occasion[];
  budgetSettings?: BudgetSettings; // NEW
  language?: string;             // NEW
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSettings {
  maxItemPrice?: number;
  maxOutfitPrice?: number;
  preferredPriceRange: PriceRange;
  preferredRetailers?: string[];
}

// ============================================
// ENHANCED CLOSET ITEMS
// ============================================

export interface ClosetItem {
  id: string;
  imageUri: string;
  garmentType: GarmentType;
  color: string;
  brand?: string;
  notes?: string;
  occasionTags?: Occasion[];   // NEW: Tag items for occasions
  addedAt: string;
  lastWorn?: string;            // NEW: Track usage
  aiDetected?: {                // NEW: Store AI detection results
    garmentType: GarmentType;
    color: string;
    brand?: string;
    confidence: number;
  };
}

// ============================================
// FAVORITE COMBINATIONS
// ============================================

export interface FavoriteCombination {
  id: string;
  name: string;
  occasion: Occasion;
  items: CombinationItem[];
  notes?: string;
  createdAt: string;
  lastWorn?: string;
}

export interface CombinationItem {
  type: 'wardrobe' | 'shopping';
  itemId: string;
  garmentType: GarmentType;
  description: string;
  imageUri?: string; // For wardrobe items
  shoppingItem?: ShoppingItem; // For shopping items
}

// ============================================
// DRESS ME REQUEST
// ============================================

export interface DressMeRequest {
  mode: 'wardrobe' | 'shopping' | 'mixed' | 'in-store';
  occasion: Occasion;
  crowdType?: string;           // NEW: Type of crowd/event
  location?: TravelLocation;     // NEW: Travel details
  selectedWardrobeItems?: string[]; // For mixed mode
  priceRange?: PriceRange;
  colorPreferences?: string[];
  stylePreferences?: StylePreference[];
}

export interface TravelLocation {
  destination: string;
  travelDate: string; // ISO date
  duration?: number; // days
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  weatherForecast?: WeatherData; // If available
}

export interface WeatherData {
  temperature: number;
  conditions: string;
  recommendations: string[]; // AI-generated clothing recommendations
}

// ============================================
// ENHANCED SHOPPING
// ============================================

export interface ShoppingItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  affiliateLink: string;
  retailer: string;
  garmentType: GarmentType;
  sizes: string[];
  recommendedSize?: string;     // Based on user measurements
  priceRange: PriceRange;
  colors?: string[];             // Available colors
  inStock: boolean;
  rating?: number;               // NEW: User/retailer rating
  reviewCount?: number;          // NEW
}

export interface LocalStore {
  id: string;
  name: string;
  address: string;
  distance?: number; // miles/km
  phone?: string;
  website?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  availableItems?: ShoppingItem[]; // If inventory API available
}

// ============================================
// ONBOARDING STATE
// ============================================

export interface OnboardingState {
  hasCompletedOnboarding: boolean;
  completedSteps: string[];
  skippedSteps: string[];
  currentStep?: number;
  measurements?: Partial<UserMeasurements>;
  shoeSize?: string;
  stylePreferences?: StylePreference[];
  wardrobePhotos?: string[];
}

// ============================================
// CHAT FEATURE
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    imageUri?: string;
  }>;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  startedAt: string;
  lastMessageAt: string;
  active: boolean;
}
```

---

## Screen Specifications

### Home Screen

**File**: `src/screens/HomeScreen.tsx`

**Layout**:
- Wood gradient background
- Title: "How can I help you today?"
- Three primary action buttons:

1. **Chat with Your Tailor** (Large, Gold Gradient Button)
   - Icon: 💬 Chat icon
   - Title: "Chat with Your Tailor"
   - Subtitle: "Premium • Your personal style expert"
   - Premium badge visible
   - Tap: Opens chat (premium) or paywall (free)

2. **Quick Style Check** (Standard Button)
   - Icon: 📸 Camera icon
   - Title: "Quick Style Check"
   - Subtitle: "Free: X remaining" or "Unlimited (Premium)"
   - Tap: Opens photo capture for instant check

3. **Build an Outfit** (Standard Button)
   - Icon: 🎯 Target icon
   - Title: "Build an Outfit"
   - Subtitle: "Choose occasion, we'll help"
   - Tap: Opens structured outfit builder

**Design**:
- Chat button is prominently displayed (largest, gold gradient)
- Other buttons are secondary (standard styling)
- Premium badge on chat button
- Usage counter for free tier on Quick Check

### Chat Screen

**File**: `src/screens/ChatScreen.tsx`

**Layout**:
- Parchment gradient background
- Header: "Chat with Your Tailor" with back button
- Message list (FlatList)
  - AI messages: Left-aligned, wood medium gradient bubbles
  - User messages: Right-aligned, gold gradient bubbles
  - Images: Inline display with thumbnails
- Input bar (bottom):
  - Camera button (left)
  - Text input (center, expandable)
  - Send button (right, gold)
- Typing indicator (when AI is responding)

**Components**:
- MessageBubble component
- Avatar components (AI tailor icon, user icon)
- Image preview component
- TypingIndicator component

### Measurement Input Screen (Onboarding)

**File**: `src/screens/onboarding/MeasurementStepScreen.tsx`

**Layout**:
- Wood background
- Progress indicator (top)
- Measurement name (large, cream text)
- Visual guide (illustration/image, centered)
- Instructions (body text, cream)
- Input field (large, cream background, navy text)
- Unit label
- Navigation buttons (bottom):
  - "Skip This" (text button, left)
  - "Next" (gold button, right)

**Components Needed**:
- Measurement illustrations (one per measurement type)
- Progress indicator component
- Large number input component

### Style Preferences Screen

**File**: `src/screens/onboarding/StylePreferencesScreen.tsx`

**Layout**:
- Title: "What's your style?"
- Four style cards (grid or stacked)
- Each card:
  - Large outfit image (required)
  - Style name
  - Brief description
  - Selected state: gold border, subtle highlight
- Multi-select enabled
- Continue/Skip buttons

**Critical**: Must include actual outfit images for each style preference.

### Wardrobe Photo Capture Screen

**File**: `src/screens/onboarding/WardrobePhotoScreen.tsx`

**Layout**:
- Title and explanation
- Photo guidelines (prominent, with examples)
- Camera interface or photo picker
- Photo review screen:
  - Preview of captured photo
  - AI detection results (garment type, color)
  - Edit options
  - "Retake" or "Use This Photo" buttons
- Batch upload capability
- Skip option

### Settings Screen

**File**: `src/screens/SettingsScreen.tsx` (enhanced)

**Layout**:
- Wood background
- Section headers (cream text, gold underline)
- Settings items (cream cards on wood)
- Navigation to sub-screens
- Premium status banner (if premium)

**Sections**:
1. Profile Settings
2. Wardrobe Settings
3. Shopping Preferences
4. Account & Subscription
5. About & Support

---

## Component Specifications

### New Components Needed

#### 1. WoodBackground Component
```typescript
// src/components/WoodBackground.tsx
// Provides consistent wood texture background
```

#### 2. MeasurementGuide Component
```typescript
// src/components/MeasurementGuide.tsx
// Shows illustration and instructions for each measurement
```

#### 3. StyleCard Component
```typescript
// src/components/StyleCard.tsx
// Displays style preference with image, selectable
```

#### 4. ModeSelectionCard Component
```typescript
// src/components/ModeSelectionCard.tsx
// Large card for Dress Me mode selection
```

#### 5. FavoriteCombinationCard Component
```typescript
// src/components/FavoriteCombinationCard.tsx
// Displays saved outfit combination
```

#### 6. LocalStoreCard Component
```typescript
// src/components/LocalStoreCard.tsx
// Displays nearby store information
```

#### 7. ProgressIndicator Component
```typescript
// src/components/ProgressIndicator.tsx
// Shows onboarding progress (Step X of Y)
```

#### 8. PhotoGuidelines Component
```typescript
// src/components/PhotoGuidelines.tsx
// Shows good vs. bad photo examples for wardrobe
```

### Enhanced Existing Components

#### MeasurementInput
- Add visual guide support
- Larger, more prominent design
- Better validation feedback

#### OccasionPicker
- Enhanced with location/travel options
- Crowd type selection
- Visual examples

---

## User Flows

### Flow 1: First-Time User Onboarding

```
App Launch
  ↓
Check: Has completed onboarding?
  ├─ No → Welcome Screen
  │   ↓
  │   Get Started
  │   ↓
  │   Greeting Screen
  │   ↓
  │   Measurements (Step-by-Step, Skippable)
  │   ↓
  │   Shoe Size (Skippable)
  │   ↓
  │   Style Preferences (Skippable)
  │   ↓
  │   Wardrobe Photos (Skippable)
  │   ↓
  │   Completion Screen
  │   ↓
  └─ Yes → Main App (Dress Me Screen)
```

### Flow 2: Dress Me - Wardrobe Mode

```
Dress Me Screen
  ↓
Select "Use My Wardrobe"
  ↓
Select Occasion
  ↓
[Optional] Select Crowd Type
  ↓
[Optional] Travel Details
  ↓
Review Wardrobe Items
  ↓
AI Generates Combinations
  ↓
Display Results
  ├─ View Outfit Details
  ├─ Save as Favorite
  ├─ Add Missing Items (Shopping)
  └─ Generate New Combinations
```

### Flow 3: Dress Me - Shopping Mode

```
Dress Me Screen
  ↓
Select "Shop for New Items"
  ↓
Select Occasion
  ↓
Select Price Range
  ↓
[Optional] Color Preferences
  ↓
AI Generates Complete Outfits
  ↓
Display Results
  ├─ View Item Details
  ├─ See Size Recommendations
  ├─ Open Purchase Link (Affiliate)
  ├─ Save Item as Favorite
  ├─ Save Outfit as Favorite
  └─ Filter/Adjust Preferences
```

### Flow 4: In-Store Assistant (Premium)

```
Dress Me Screen
  ↓
Select "I'm at the Store" (Premium)
  ↓
[If not premium] Paywall Screen
  ↓
Camera Interface Opens
  ↓
Take Photo of Item
  ↓
Real-Time Analysis
  ├─ Style Match Score
  ├─ Wardrobe Compatibility
  ├─ Size Recommendation
  ├─ Occasion Suitability
  └─ Price/Value Assessment
  ↓
Display Results
  ├─ View Pairing Suggestions
  ├─ Compare with Other Items
  ├─ Save to Favorites
  └─ Take Another Photo
```

### Flow 5: Adding Wardrobe Item

```
Wardrobe Screen
  ↓
Tap "Add Item"
  ↓
Take/Select Photo
  ↓
AI Auto-Categorization
  ├─ Garment Type
  ├─ Color
  ├─ Brand (if visible)
  └─ Style
  ↓
Review & Edit Screen
  ├─ Override AI Detection
  ├─ Add Notes
  ├─ Tag for Occasions
  └─ Save
  ↓
Item Added to Wardrobe
```

---

## Technical Implementation

### New Services Needed

#### 1. OnboardingService
```typescript
// src/services/onboarding.ts
// Manages onboarding state, progress, completion
```

**Methods**:
- `getOnboardingState(): Promise<OnboardingState>`
- `saveOnboardingState(state: OnboardingState): Promise<void>`
- `markStepComplete(step: string): Promise<void>`
- `markStepSkipped(step: string): Promise<void>`
- `hasCompletedOnboarding(): Promise<boolean>`
- `resetOnboarding(): Promise<void>`

#### 2. ChatService
```typescript
// src/services/chat.ts
// Handles chat sessions, message sending, context building
```

**Methods**:
- `startSession(): Promise<ChatSession>`
- `buildSystemContext(profile: UserProfile, wardrobe: ClosetItem[]): Promise<string>`
- `sendMessage(session: ChatSession, userMessage: ChatMessage, profile: UserProfile, wardrobe: ClosetItem[]): Promise<ChatMessage>`
- `saveSession(session: ChatSession): Promise<void>`
- `loadRecentSession(): Promise<ChatSession | null>`

**Interface Definitions**:
```typescript
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

#### 3. FavoriteCombinationsService
```typescript
// src/services/favoriteCombinations.ts
// Manages saved outfit combinations
```

**Methods**:
- `getFavoriteCombinations(): Promise<FavoriteCombination[]>`
- `saveFavoriteCombination(combination: FavoriteCombination): Promise<void>`
- `deleteFavoriteCombination(id: string): Promise<void>`
- `updateFavoriteCombination(id: string, updates: Partial<FavoriteCombination>): Promise<void>`

#### 4. DressMeService (For Build Outfit feature)
```typescript
// src/services/dressMe.ts
// Handles structured outfit building (non-chat)
```

**Methods**:
- `generateWardrobeOutfits(request: DressMeRequest): Promise<CompleteOutfit[]>`
- `generateShoppingOutfits(request: DressMeRequest): Promise<CompleteOutfit[]>`
- `generateMixedOutfit(request: DressMeRequest): Promise<CompleteOutfit>`

**Note**: In-store assistant functionality is now handled through chat, not a separate mode.

#### 6. Enhanced ClosetService
```typescript
// Add AI categorization methods
```

**New Methods**:
- `categorizeItem(imageUri: string): Promise<ClosetItem>` // AI auto-categorization
- `getItemsByOccasion(occasion: Occasion): Promise<ClosetItem[]>`
- `getFavoriteCombinations(): Promise<FavoriteCombination[]>`

### Enhanced Claude Service

**New Request Types**:
- `'chat-message'`: Chat conversation (premium)
- `'instant-check'`: Quick style check (free/premium)
- `'wardrobe-outfit'`: Generate outfits from wardrobe (Build Outfit)
- `'shopping-outfit'`: Generate complete shopping outfits (Build Outfit)
- `'mixed-outfit'`: Mix wardrobe + shopping (Build Outfit)
- `'wardrobe-categorization'`: Auto-categorize wardrobe photos

### API Integrations

#### Affiliate Programs
- **Amazon Associates**: Keyword-based search links
- **Nordstrom**: Keyword-based search links
- **J.Crew**: Keyword-based search links
- **Bonobos**: Keyword-based search links

**Implementation** (Simplified MVP):
- Keyword extraction from AI descriptions
- Affiliate search URL generation
- Price range filtering in URLs
- Direct purchase links (opens in browser)

**Note**: Real-time product APIs moved to Phase 2 (post-MVP). MVP uses keyword-based affiliate search links.

#### Location Services
**Note**: Local store suggestions moved to Phase 3 (post-MVP)

#### Weather API
**Note**: Weather integration moved to Phase 4 (post-MVP)

### Image Processing

#### AI Categorization
- Use Claude Vision API for:
  - Garment type detection
  - Color detection
  - Brand detection (if visible)
  - Style analysis

#### Photo Quality Validation
- Check for:
  - Single item in photo
  - Neutral background
  - Full item visibility
  - Good lighting

### Storage Updates

**CRITICAL: ALL Storage Must Go Through StorageService**

**Rule**: Never use AsyncStorage directly in components or services. All storage operations must go through `StorageService` for:
- Consistency
- Error handling
- Type safety
- Future migration support

**Correct Usage**:
```typescript
// ✅ CORRECT - Use StorageService
import { StorageService } from '../services/storage';
await StorageService.saveUserProfile(profile);
const profile = await StorageService.getUserProfile();
```

**Incorrect Usage**:
```typescript
// ❌ WRONG - Direct AsyncStorage call
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('@gauge_user_profile', JSON.stringify(profile));
```

**New Storage Keys**:
```typescript
const STORAGE_KEYS = {
  // ... existing keys
  ONBOARDING_STATE: '@gauge_onboarding_state',
  FAVORITE_COMBINATIONS: '@gauge_favorite_combinations',
  BUDGET_SETTINGS: '@gauge_budget_settings',
  LOCAL_STORES: '@gauge_local_stores',
} as const;
```

### Error Handling & Fallback UI

**API Failure Handling**:

All API calls (Claude API, image processing, etc.) must implement fallback UI for failures:

1. **Offline Detection**:
   - Use `@react-native-community/netinfo` to detect network status
   - Show `OfflineBanner` component when offline
   - Disable API-dependent features when offline

2. **API Error States**:
   - Network errors: Show retry button with clear message
   - Timeout errors: Show timeout message with retry option
   - Rate limit errors: Show rate limit message with wait time
   - Server errors: Show generic error with retry option

3. **Fallback UI Components**:

```typescript
// Error State Component
<View style={styles.errorContainer}>
  <Text style={styles.errorIcon}>⚠️</Text>
  <Text style={styles.errorTitle}>Unable to Connect</Text>
  <Text style={styles.errorMessage}>
    We're having trouble reaching our servers. Please check your connection and try again.
  </Text>
  <GoldButton
    title="Retry"
    onPress={handleRetry}
    style={styles.retryButton}
  />
</View>
```

4. **Retry Logic**:
   - Implement exponential backoff for retries
   - Maximum 3 retry attempts
   - Show loading state during retry
   - Clear error state on successful retry

5. **Offline Banner** (Already exists in `src/components/OfflineBanner.tsx`):
   - Shows at top of screen when offline
   - Dismissible
   - Auto-hides when connection restored

6. **Error Boundaries**:
   - Use `ErrorBoundary` component for React errors
   - Log errors to crash reporting service
   - Show user-friendly error message

---

## Pre-Launch Critical Fixes

**Purpose**: Address all technical and UX issues identified in ChatGPT's design review. These fixes are critical for MVP launch success.

**Priority Classification**:
- 🚨 **CRITICAL (Must Fix Before Launch)**: Fixes #1-4
- ⚠️ **IMPORTANT (Fix During MVP)**: Fixes #5-7

---

### Fix #1: Contrast Accessibility (CRITICAL)

**Issue**: Gold text (`#D4AF37`) on dark wood backgrounds (`#3E2723`) fails WCAG 4.5:1 contrast ratio requirement. This creates legal liability and poor readability.

**Solution**: Contrast-Safe Design System

**Update `src/utils/constants.ts`:**

```typescript
// Add contrast-safe color pairings
export const TailorContrasts = {
  // Text colors for backgrounds
  onWoodDark: TailorColors.cream,      // ALWAYS use cream on dark wood
  onWoodMedium: TailorColors.cream,    // ALWAYS use cream on medium wood
  onParchment: TailorColors.navy,      // ALWAYS use navy on light backgrounds
  onGold: TailorColors.navy,           // ALWAYS use navy on gold buttons
  
  // Never use these combinations:
  // ❌ gold text on woodDark
  // ❌ gold text on woodMedium
  // ❌ cream text on parchment
} as const;

// Update usage guidelines
export const TailorColorUsage = {
  gold: {
    allowedUses: [
      'Button backgrounds',
      'Icon fills',
      'Borders and dividers',
      'Premium badges (as background)',
      'Accent highlights',
    ],
    forbiddenUses: [
      'Body text on dark backgrounds', // Fails contrast
      'Paragraph text on any background',
      'Labels on dark backgrounds',
    ],
  },
} as const;
```

**Add contrast testing utility:**

```typescript
// src/utils/contrastTest.ts

export const testContrast = (foreground: string, background: string): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} => {
  // Implement WCAG contrast calculation
  // https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
  
  const getLuminance = (hex: string): number => {
    // Convert hex to RGB and calculate relative luminance
    // (Implementation details)
  };
  
  const fg = getLuminance(foreground);
  const bg = getLuminance(background);
  const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
  
  return {
    ratio,
    passesAA: ratio >= 4.5,    // WCAG AA standard
    passesAAA: ratio >= 7.0,   // WCAG AAA standard
  };
};

// Test all combinations in development
if (__DEV__) {
  console.log('Testing contrast ratios:');
  console.log('cream on woodDark:', testContrast(TailorColors.cream, TailorColors.woodDark));
  console.log('gold on woodDark:', testContrast(TailorColors.gold, TailorColors.woodDark));
  console.log('navy on parchment:', testContrast(TailorColors.navy, TailorColors.parchment));
  console.log('navy on gold:', testContrast(TailorColors.navy, TailorColors.gold));
}
```

**Correct usage examples:**

```typescript
// ❌ WRONG - Gold text on dark background
<Text style={{ 
  color: TailorColors.gold, 
  backgroundColor: TailorColors.woodDark 
}}>
  Premium Feature
</Text>

// ✅ CORRECT - Cream text on dark background, gold accent
<View style={{ backgroundColor: TailorColors.woodDark }}>
  <View style={{ 
    borderLeftWidth: 4, 
    borderLeftColor: TailorColors.gold 
  }}>
    <Text style={{ color: TailorColors.cream }}>
      Premium Feature
    </Text>
  </View>
</View>

// ✅ CORRECT - Gold button with dark text
<LinearGradient colors={TailorGradients.goldGradient.colors}>
  <Text style={{ color: TailorColors.navy }}>
    Upgrade to Premium
  </Text>
</LinearGradient>
```

**Testing Checklist**:
- [ ] Run contrast tests on all color combinations
- [ ] Verify cream text is readable on all wood backgrounds
- [ ] Verify navy text is readable on gold buttons
- [ ] Test in bright sunlight (outdoor readability)
- [ ] Test with accessibility tools (iOS VoiceOver, Android TalkBack)
- [ ] Screenshot all screens and verify contrast visually

---

### Fix #2: "Skip All" Onboarding Button (CRITICAL)

**Issue**: 8+ onboarding steps create drop-off risk. Users want to try the app immediately, not commit to a long setup process.

**Solution**: Add "Skip All" Option

**Update Welcome Screen:**

```typescript
// src/screens/onboarding/WelcomeScreen.tsx

export const WelcomeScreen: React.FC = ({ navigation }) => {
  const handleSkipAll = async () => {
    // Mark onboarding as "skipped"
    await OnboardingService.markAsSkipped();
    
    // Go directly to main app
    navigation.replace('MainTabs');
    
    // Show subtle reminder on first home screen visit
    // "Complete setup for personalized recommendations"
  };

  return (
    <LinearGradient colors={TailorGradients.woodDarkGradient.colors}>
      <View style={styles.container}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        
        <Text style={styles.title}>Welcome to GAUGE</Text>
        <Text style={styles.subtitle}>
          Your personal tailor, always at your service
        </Text>
        
        {/* Primary CTA */}
        <GoldButton 
          title="Get Started" 
          onPress={() => navigation.navigate('Greeting')}
        />
        
        {/* Secondary options */}
        <View style={styles.skipOptions}>
          <TouchableOpacity onPress={handleSkipAll}>
            <Text style={styles.skipAllText}>
              Skip Setup - Try Basic Features
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.helperText}>
            You can complete setup anytime from Settings
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};
```

**Update OnboardingService:**

```typescript
// src/services/onboarding.ts

export const OnboardingService = {
  async markAsSkipped(): Promise<void> {
    await StorageService.saveOnboardingState({
      hasCompletedOnboarding: false,
      skippedAll: true,
      completedSteps: [],
      skippedSteps: ['all'],
    });
  },
  
  async isOnboardingComplete(): Promise<boolean> {
    const state = await StorageService.getOnboardingState();
    return state.hasCompletedOnboarding || state.skippedAll;
  },
  
  async shouldShowSetupReminder(): Promise<boolean> {
    const state = await StorageService.getOnboardingState();
    return state.skippedAll && !state.hasCompletedOnboarding;
  },
};
```

**Add Setup Reminder Banner (Home Screen):**

```typescript
// src/components/SetupReminderBanner.tsx

export const SetupReminderBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    OnboardingService.shouldShowSetupReminder().then(setShowBanner);
  }, []);
  
  if (!showBanner) return null;
  
  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>
        📸 Complete setup for personalized recommendations
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.bannerAction}>Setup Now</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setShowBanner(false)}>
        <Text style={styles.bannerDismiss}>×</Text>
      </TouchableOpacity>
    </View>
  );
};
```

**Testing Checklist**:
- [ ] "Skip Setup" button visible on Welcome screen
- [ ] Clicking "Skip Setup" navigates directly to main app
- [ ] Setup reminder banner shows on Home screen for skipped users
- [ ] "Setup Now" button navigates to Settings
- [ ] Banner can be dismissed
- [ ] Onboarding can be restarted from Settings

---

### Fix #3: 1 Free Chat Message Preview (CRITICAL)

**Issue**: Hard paywall on chat prevents users from experiencing the core premium value proposition before paying.

**Solution**: Free Preview Message

**Update PremiumService:**

```typescript
// src/services/premium.ts

export const PremiumService = {
  // ... existing methods
  
  async getFreeChatStatus(): Promise<{
    hasUsedFreeMessage: boolean;
    canUseFreeMessage: boolean;
  }> {
    const status = await StorageService.getPremiumStatus();
    return {
      hasUsedFreeMessage: status.hasUsedFreeChatMessage || false,
      canUseFreeMessage: !status.isPremium && !status.hasUsedFreeChatMessage,
    };
  },
  
  async markFreeChatMessageUsed(): Promise<void> {
    const status = await StorageService.getPremiumStatus();
    await StorageService.savePremiumStatus({
      ...status,
      hasUsedFreeChatMessage: true,
    });
  },
};
```

**Update ChatScreen to allow 1 free message:**

```typescript
// src/screens/ChatScreen.tsx

export const ChatScreen: React.FC = ({ navigation }) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [canUseFreeMessage, setCanUseFreeMessage] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    const premium = await PremiumService.isPremium();
    setIsPremium(premium);
    
    if (!premium) {
      const { canUseFreeMessage: canUse } = await PremiumService.getFreeChatStatus();
      setCanUseFreeMessage(canUse);
      
      if (!canUse) {
        // Already used free message - show paywall
        navigation.navigate('Paywall', { feature: 'chat' });
        return;
      }
    }
    
    // Initialize session for everyone (premium or free trial)
    let existingSession = await ChatService.loadRecentSession();
    if (!existingSession || !existingSession.active) {
      existingSession = await ChatService.startSession();
    }
    setSession(existingSession);
  };

  const handleSendMessage = async () => {
    // ... existing message sending code
    
    // After AI responds to first message from free user:
    if (!isPremium && canUseFreeMessage) {
      await PremiumService.markFreeChatMessageUsed();
      setCanUseFreeMessage(false);
      
      // Show upgrade prompt after AI response
      setTimeout(() => {
        setShowUpgradePrompt(true);
      }, 2000); // Let them read the response first
    }
    
    // ... rest of code
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <FlatList
        data={session?.messages || []}
        renderItem={renderMessage}
      />
      
      {showUpgradePrompt && <UpgradePromptOverlay onDismiss={() => setShowUpgradePrompt(false)} />}
      
      <View style={styles.inputContainer}>
        {/* Input is disabled after free message used */}
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={
            !isPremium && !canUseFreeMessage
              ? "Upgrade to continue chatting..."
              : "Ask your tailor anything..."
          }
          editable={isPremium || canUseFreeMessage}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={isPremium || canUseFreeMessage ? handleSendMessage : handleUpgradePrompt}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
```

**Create Upgrade Prompt Overlay:**

```typescript
// src/components/UpgradePromptOverlay.tsx

interface Props {
  onDismiss: () => void;
}

export const UpgradePromptOverlay: React.FC<Props> = ({ onDismiss }) => {
  return (
    <Animated.View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.icon}>✨</Text>
        <Text style={styles.title}>Enjoying the conversation?</Text>
        <Text style={styles.body}>
          Your personal tailor is ready to help with unlimited advice, outfit suggestions, and shopping assistance.
        </Text>
        
        <View style={styles.features}>
          <FeatureBullet icon="💬" text="Unlimited chat sessions" />
          <FeatureBullet icon="👔" text="Full wardrobe management" />
          <FeatureBullet icon="🛍️" text="Personalized shopping" />
          <FeatureBullet icon="📸" text="In-store assistance" />
        </View>
        
        <Text style={styles.price}>$6.99/month</Text>
        
        <GoldButton 
          title="Upgrade to Premium" 
          onPress={() => {
            onDismiss();
            navigation.navigate('Paywall');
          }}
        />
        
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissText}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};
```

**Testing Checklist**:
- [ ] Free users can send exactly 1 message
- [ ] AI response is high-quality and personalized
- [ ] Upgrade prompt appears after AI responds (not before)
- [ ] "Maybe Later" button works (dismisses prompt)
- [ ] After dismissing, input field shows "Upgrade to continue..."
- [ ] Premium users never see this flow

---

### Fix #4: Privacy Messaging (CRITICAL)

**Issue**: Users need clear assurance that photos are not stored on servers. This is both a legal requirement (privacy policy) and trust issue.

**Solution**: Privacy Messaging Throughout App

**1. Onboarding - Wardrobe Photo Screen:**

```typescript
// src/screens/onboarding/WardrobePhotoScreen.tsx

<View style={styles.privacySection}>
  <Text style={styles.privacyIcon}>🔒</Text>
  <Text style={styles.privacyTitle}>Your Privacy Matters</Text>
  <Text style={styles.privacyText}>
    • Photos are analyzed instantly on secure servers
    • We never save or store your photos
    • Only you can see your wardrobe items
    • All data stored locally on your device
  </Text>
</View>
```

**2. Chat Photo Button:**

```typescript
// src/screens/ChatScreen.tsx

const handlePhotoButtonPress = () => {
  Alert.alert(
    '📷 Add Photo',
    'Photos are analyzed in real-time and not stored on our servers. Only you can see your photos.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Library', onPress: handleChoosePhoto },
    ]
  );
};
```

**3. Quick Style Check:**

```typescript
// src/screens/HomeScreen.tsx - Quick Check card

<View style={styles.infoRow}>
  <Text style={styles.infoIcon}>🔒</Text>
  <Text style={styles.infoText}>
    Photos processed instantly, never stored
  </Text>
</View>
```

**4. Settings - Privacy Section:**

```typescript
// src/screens/SettingsScreen.tsx

<View style={styles.section}>
  <Text style={styles.sectionHeader}>Privacy & Data</Text>
  
  <SettingsItem
    icon="🔒"
    title="Photo Privacy"
    description="Photos are never uploaded to our servers"
    onPress={() => navigation.navigate('PrivacyPolicy')}
  />
  
  <SettingsItem
    icon="📱"
    title="Local Storage"
    description="All your data is stored on your device"
    onPress={() => navigation.navigate('DataPolicy')}
  />
  
  <SettingsItem
    icon="🛍️"
    title="Affiliate Disclosure"
    description="We earn commissions on purchases"
    onPress={() => navigation.navigate('AffiliateDisclosure')}
  />
</View>
```

**5. Privacy Policy Page:**

Create comprehensive privacy policy covering:
- Photo privacy (never stored)
- Data storage (local only)
- Affiliate disclosure
- Third party services
- User rights
- Contact information

**6. First Launch Privacy Banner:**

```typescript
// Show on very first app launch, before onboarding

<View style={styles.privacyBanner}>
  <Text style={styles.bannerTitle}>🔒 Your Privacy</Text>
  <Text style={styles.bannerText}>
    GAUGE keeps your data private. Photos are analyzed in real-time 
    and never stored. All personal data stays on your device.
  </Text>
  <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
    <Text style={styles.bannerLink}>Read Privacy Policy</Text>
  </TouchableOpacity>
  <GoldButton title="I Understand" onPress={dismissBanner} />
</View>
```

**Testing Checklist**:
- [ ] Privacy messaging visible on all photo capture screens
- [ ] Privacy policy accessible from Settings
- [ ] Affiliate disclosure present and clear
- [ ] First launch privacy banner shows
- [ ] "Never stored" messaging consistent across app

---

### Fix #5: Price Range Display (IMPORTANT)

**Issue**: Users clicking shopping links without knowing expected prices creates trust issues and surprises.

**Solution**: Show Expected Price Ranges

**Update ShoppingCard Component:**

```typescript
// src/components/ShoppingCard.tsx

interface ShoppingCardProps {
  item: ShoppingItem;
  onPress: () => void;
}

export const ShoppingCard: React.FC<ShoppingCardProps> = ({ item, onPress }) => {
  // Calculate expected price range from priceRange enum
  const getPriceDisplay = (range: PriceRange): string => {
    switch (range) {
      case PriceRange.BUDGET:
        return '$25-$50';
      case PriceRange.MID:
        return '$50-$100';
      case PriceRange.PREMIUM:
        return '$100-$200';
      default:
        return 'Varies';
    }
  };

  return (
    <View style={styles.card}>
      {/* Retailer logo */}
      <View style={styles.header}>
        <Text style={styles.retailer}>{item.retailer}</Text>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>
            {getPriceDisplay(item.priceRange)}
          </Text>
        </View>
      </View>
      
      {/* Item description */}
      <Text style={styles.description}>{item.name}</Text>
      
      {/* Search term reference */}
      <View style={styles.searchTermRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchTerm}>
          Searching: "{item.searchTerm}"
        </Text>
      </View>
      
      {/* CTA Button */}
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>
          Search on {item.retailer} →
        </Text>
      </TouchableOpacity>
      
      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        Prices may vary. We earn a small commission on purchases.
      </Text>
    </View>
  );
};
```

**Update Outfit Results Screen:**

```typescript
// src/screens/ResultScreen.tsx

// Show total expected price range for complete outfit

const calculateOutfitPriceRange = (items: OutfitItem[]): string => {
  const ranges = items.map(item => {
    switch (item.shoppingOptions[0].priceRange) {
      case PriceRange.BUDGET: return { min: 25, max: 50 };
      case PriceRange.MID: return { min: 50, max: 100 };
      case PriceRange.PREMIUM: return { min: 100, max: 200 };
    }
  });
  
  const totalMin = ranges.reduce((sum, r) => sum + r.min, 0);
  const totalMax = ranges.reduce((sum, r) => sum + r.max, 0);
  
  return `$${totalMin}-$${totalMax}`;
};

// Display in UI:
<View style={styles.priceSection}>
  <Text style={styles.priceLabel}>Complete Outfit Price Range</Text>
  <Text style={styles.priceRange}>
    {calculateOutfitPriceRange(outfit.items)}
  </Text>
  <Text style={styles.priceDisclaimer}>
    Estimated based on typical prices. Actual prices may vary by retailer.
  </Text>
</View>
```

**Add to Chat AI Responses:**

When AI suggests shopping items, include price context:

```typescript
// In ChatService.buildSystemContext():

context += `\n\nWhen suggesting shopping items, always mention expected price range:
- Budget items: typically $25-$50
- Mid-range items: typically $50-$100  
- Premium items: typically $100-$200

Example: "A navy cotton dress shirt (typically $40-60) would work perfectly."`;
```

**Testing Checklist**:
- [ ] Price ranges display on all shopping cards
- [ ] Total outfit price shown on results screen
- [ ] AI mentions price context in chat responses
- [ ] Disclaimer about price variation present
- [ ] Price badges visually prominent

---

### Fix #6: Performance Optimization (IMPORTANT)

**Issue**: Multiple gradient layers can cause frame drops (below 60fps) on low-end Android devices.

**Solution**: Adaptive Performance

**1. Device Performance Detection:**

```typescript
// src/utils/devicePerformance.ts

import { Platform } from 'react-native';
import * as Device from 'expo-device';

export const DevicePerformance = {
  /**
   * Detect if device is low-end based on available criteria
   */
  isLowEndDevice(): boolean {
    if (Platform.OS === 'ios') {
      // iOS devices generally handle gradients well
      // Only flag very old devices (iPhone 6s and older)
      return false; // Conservative: assume iOS is fine
    }
    
    if (Platform.OS === 'android') {
      // Check total memory (rough proxy for performance)
      // Note: expo-device doesn't provide RAM directly
      // Use conservative fallback
      return true; // Test on actual device and adjust
    }
    
    return false;
  },
  
  /**
   * Get appropriate gradient based on device capability
   */
  getAdaptiveGradient(fullGradient: {
    colors: string[];
    locations?: number[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  }): typeof fullGradient {
    if (this.isLowEndDevice()) {
      // Simplify to solid color (use first color)
      return {
        colors: [fullGradient.colors[0]],
        locations: [0],
        start: fullGradient.start,
        end: fullGradient.end,
      };
    }
    
    return fullGradient;
  },
};
```

**2. Update Gradient Usage:**

```typescript
// src/components/WoodBackground.tsx

import { DevicePerformance } from '../utils/devicePerformance';

export const WoodBackground: React.FC<{ children: ReactNode }> = ({ children }) => {
  const gradient = DevicePerformance.getAdaptiveGradient(
    TailorGradients.woodDarkGradient
  );
  
  return (
    <LinearGradient
      colors={gradient.colors}
      locations={gradient.locations}
      start={gradient.start}
      end={gradient.end}
      style={styles.background}
    >
      {children}
    </LinearGradient>
  );
};
```

**3. Simplify Gradients:**

```typescript
// Update TailorGradients with simpler versions

export const TailorGradients = {
  // Simplified: Only 2 colors (better performance)
  woodDarkGradient: {
    colors: ['#3E2723', '#1A0F0A'],  // Was 3 colors, now 2
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  woodMediumGradient: {
    colors: ['#5D4037', '#3E2723'],  // Was 3 colors, now 2
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  goldGradient: {
    colors: ['#F4D03F', '#B8860B'],  // Was 3 colors, now 2
    locations: [0, 1],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
};
```

**4. Limit Gradient Usage:**

```typescript
// Strategy: Use gradients sparingly

const backgroundStrategy = {
  // Full gradient backgrounds (expensive):
  mainScreens: ['Home', 'Chat', 'Welcome'],
  
  // Solid colors (cheap):
  cards: TailorColors.woodMedium,  // No gradient
  modals: TailorColors.parchment,  // No gradient
  buttons: 'Use gradient only for primary CTAs',
};
```

**Testing Checklist**:
- [ ] Test on low-end Android device (e.g., Samsung Galaxy A10)
- [ ] Verify 60fps on main screens (Home, Chat)
- [ ] Test scrolling performance (wardrobe grid, chat messages)
- [ ] Profile with React DevTools Profiler
- [ ] Test with Android's "Profile GPU Rendering" developer option
- [ ] Verify no jank during navigation transitions

---

### Fix #7: Typography Fallbacks (IMPORTANT)

**Issue**: System serif fonts vary wildly across platforms, creating inconsistent visual identity.

**Solution**: Consistent Typography Stack

**Update Typography System:**

```typescript
// src/utils/constants.ts

import { Platform } from 'react-native';

export const TailorTypography = {
  // Use sans-serif for consistency across platforms
  fontFamily: {
    // Primary: Modern sans-serif (consistent across platforms)
    primary: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
    
    // Secondary: For body text (more readable)
    secondary: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
  },
  
  // Display (Hero Text, Greetings)
  display: {
    fontSize: 36,
    fontWeight: '700' as const,
    lineHeight: 44,
    letterSpacing: -0.5,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
  },
  
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.3,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
  },
  
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
  },
  
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
  },
  
  // Body Text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
  },
  
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
  },
  
  // UI Elements
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
  },
  
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
  },
  
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.3,
    textTransform: 'uppercase' as const,
    fontFamily: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
  },
} as const;
```

**Testing Checklist**:
- [ ] Typography renders consistently on iOS and Android
- [ ] Font weights display correctly (700, 600, 500, 400)
- [ ] Line heights provide proper spacing
- [ ] Letter spacing improves readability
- [ ] Text scales properly with system accessibility settings

---

## Implementation Phases

### MVP Implementation Timeline (6 Weeks)

**Goal**: Launch functional premium experience with core features, prove product-market fit.

---

### Week 1-2: Foundation & Design System

**Deliverables**:
- [ ] Complete design system implementation
  - [ ] TailorColors palette
  - [ ] TailorTypography system (with platform-specific fonts - **FIX #7**)
  - [ ] TailorGradients (wood effect backgrounds, simplified to 2 colors - **FIX #6**)
  - [ ] TailorSpacing, BorderRadius, Shadows
  - [ ] TailorContrasts (contrast-safe color pairings - **CRITICAL FIX #1**)
  - [ ] TailorColorUsage (usage guidelines - **CRITICAL FIX #1**)
  - [ ] GoldButton component (premium CTAs, navy text not gold - **CRITICAL FIX #1**)
  - [ ] WoodBackground component (LinearGradient wrapper with adaptive performance - **FIX #6**)
- [ ] Create `src/utils/contrastTest.ts` (WCAG contrast testing utility - **CRITICAL FIX #1**)
- [ ] Create `src/utils/devicePerformance.ts` (adaptive gradient detection - **FIX #6**)
- [ ] Update all existing screens with new design
- [ ] Fix all gold text on dark backgrounds (replace with cream - **CRITICAL FIX #1**)
- [ ] Create reusable components:
  - [ ] MeasurementGuideCard
  - [ ] PremiumBadge
  - [ ] StepIndicator (for onboarding)
  - [ ] SkipButton (consistent across onboarding)
  - [ ] SetupReminderBanner (**CRITICAL FIX #2**)

**CRITICAL FIXES (Week 1-2)**:
- [ ] **Fix #1: Contrast Accessibility** - All text meets WCAG 4.5:1 standard
- [ ] **Fix #2: "Skip All" Onboarding Button** - Welcome screen skip option, SetupReminderBanner
- [ ] **Fix #4: Privacy Messaging** - Add privacy sections to all photo screens
- [ ] **Fix #6: Performance Optimization** - Device performance detection, adaptive gradients

**Testing Checkpoints**:
- [ ] Run contrast tests on all color combinations (**CRITICAL FIX #1**)
- [ ] Verify cream text is readable on all wood backgrounds
- [ ] Verify navy text is readable on gold buttons
- [ ] Test in bright sunlight (outdoor readability)
- [ ] Test with accessibility tools (iOS VoiceOver, Android TalkBack)
- [ ] "Skip Setup" button works and navigates correctly (**CRITICAL FIX #2**)
- [ ] Setup reminder banner shows for skipped users
- [ ] Privacy messaging visible on all photo capture screens (**CRITICAL FIX #4**)
- [ ] Test on low-end Android device for performance (**FIX #6**)
- [ ] Verify 60fps on main screens
- [ ] Gradients render consistently on iOS and Android
- [ ] Premium gold aesthetic feels high-end

---

### Week 2-3: Onboarding Flow

**Deliverables**:
- [ ] Welcome screen (logo, greeting, wood background)
  - [ ] **"Skip Setup - Try Basic Features" button (CRITICAL FIX #2)**
  - [ ] Helper text: "You can complete setup anytime from Settings"
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
  - [ ] **Privacy messaging section (CRITICAL FIX #4)**
  - [ ] Skip option prominent
- [ ] Completion screen ("You're all set!")
- [ ] OnboardingService implementation
  - [ ] Track onboarding completion state
  - [ ] Allow restart from Settings
  - [ ] Skip functionality at any step
  - [ ] **`markAsSkipped()` method (CRITICAL FIX #2)**
  - [ ] **`shouldShowSetupReminder()` method (CRITICAL FIX #2)**

**Testing Checkpoints**:
- [ ] Complete onboarding flow end-to-end
- [ ] "Skip Setup" button navigates to main app (**CRITICAL FIX #2**)
- [ ] Setup reminder banner appears on Home screen for skipped users
- [ ] Skip from any screen and resume later
- [ ] Measurements save correctly
- [ ] Photos capture and categorize properly
- [ ] Privacy messaging visible on wardrobe photo screen (**CRITICAL FIX #4**)

---

### Week 3-4: Core Features

**Deliverables**:
- [ ] Home Screen
  - [ ] Three action buttons (Chat, Quick Check, Build Outfit)
  - [ ] Chat button prominently displayed (gold gradient)
  - [ ] Usage counter for free tier
- [ ] Quick Style Check
  - [ ] Photo capture (1-3 photos)
  - [ ] Instant analysis
  - [ ] Results display
  - [ ] Free tier counter (10 checks)
- [ ] Build Outfit Feature
  - [ ] Occasion selector
  - [ ] Mode selection (Wardrobe/Shopping/Mixed)
  - [ ] Outfit generation
  - [ ] Results with shopping links
- [ ] Enhanced Wardrobe
  - [ ] Add item flow with AI categorization
  - [ ] Delete items
  - [ ] View item details
  - [ ] Free tier: Max 20 items (with upgrade prompt)
  - [ ] Premium: Unlimited items
- [ ] Enhanced AffiliateLinkService (keyword-based search)
- [ ] Claude Vision prompts for all features

**Testing Checkpoints**:
- All features generate appropriate results
- Free tier restrictions work correctly
- Affiliate links open correctly with tracking
- Analysis completes in <10 seconds

---

### Week 4-5: Premium Chat Feature

**Deliverables**:
- [ ] ChatService implementation
  - [ ] Session management
  - [ ] Context building (measurements, wardrobe, preferences)
  - [ ] Message sending/receiving
  - [ ] Image handling in messages
  - [ ] **Price context in shopping suggestions (IMPORTANT FIX #5)**
- [ ] ChatScreen component
  - [ ] Message rendering (text, images)
  - [ ] Input handling (text, photos)
  - [ ] Typing indicator
  - [ ] Loading states
  - [ ] **1 free message for non-premium users (CRITICAL FIX #3)**
  - [ ] **Upgrade prompt overlay after free message (CRITICAL FIX #3)**
  - [ ] **Privacy messaging on photo button (CRITICAL FIX #4)**
- [ ] PremiumService updates
  - [ ] **`getFreeChatStatus()` method (CRITICAL FIX #3)**
  - [ ] **`markFreeChatMessageUsed()` method (CRITICAL FIX #3)**
- [ ] Premium gates
  - [ ] Paywall for free users (after free message used)
  - [ ] Session saving/loading
  - [ ] History integration
  - [ ] Resume conversation
- [ ] Chat UI polish
  - [ ] Message bubbles (AI: wood gradient, User: gold gradient)
  - [ ] Avatar components
  - [ ] Image preview in messages
  - [ ] Smooth scrolling
- [ ] UpgradePromptOverlay component (**CRITICAL FIX #3**)
- [ ] ShoppingCard component updates
  - [ ] **Price range badges (IMPORTANT FIX #5)**
  - [ ] **Price disclaimers (IMPORTANT FIX #5)**
- [ ] ResultScreen updates
  - [ ] **Total outfit price range calculation (IMPORTANT FIX #5)**
  - [ ] **Price range display (IMPORTANT FIX #5)**

**CRITICAL FIXES (Week 4-5)**:
- [ ] **Fix #3: 1 Free Chat Message Preview** - Allow 1 free message, show upgrade prompt after response
- [ ] **Fix #5: Price Range Display** - Show price ranges on shopping cards and results

**IMPORTANT FIXES (Week 4-5)**:
- [ ] **Fix #5: Price Range Display** - Shopping cards, results screen, chat responses
- [ ] **Fix #7: Typography Fallbacks** - Platform-specific fonts (if not completed in Week 1-2)

**Testing Checkpoints**:
- [ ] Chat sessions work end-to-end
- [ ] Context is maintained across messages
- [ ] Free users can send exactly 1 message (**CRITICAL FIX #3**)
- [ ] Upgrade prompt appears after AI responds (not before)
- [ ] Premium users access chat immediately
- [ ] Images work in messages
- [ ] Price ranges display on all shopping cards (**IMPORTANT FIX #5**)
- [ ] Total outfit price shown on results screen (**IMPORTANT FIX #5**)
- [ ] AI mentions price context in chat responses (**IMPORTANT FIX #5**)
- [ ] Privacy messaging visible on chat photo button (**CRITICAL FIX #4**)

---

### Week 5 Day 5: Design QA Pass

**Purpose**: Comprehensive design quality assurance before launch

**Deliverables**:
- [ ] **Screenshot every screen (iOS + Android)**
  - [ ] WelcomeScreen
  - [ ] GreetingScreen
  - [ ] All 8 MeasurementStepScreens
  - [ ] StylePreferencesScreen
  - [ ] WardrobePhotoScreen
  - [ ] CompletionScreen
  - [ ] HomeScreen
  - [ ] ChatScreen
  - [ ] QuickStyleCheckScreen
  - [ ] BuildOutfitScreen
  - [ ] ClosetScreen
  - [ ] AddClosetItemScreen
  - [ ] ResultScreen
  - [ ] SettingsScreen
  - [ ] PrivacyPolicyScreen
  - [ ] PaywallScreen
  - [ ] All error states
  - [ ] All loading states
  - [ ] All empty states

- [ ] **Verify all text uses cream (not gold) on dark backgrounds**
  - [ ] Audit all screens with woodDark/woodMedium backgrounds
  - [ ] Verify no gold text on dark backgrounds
  - [ ] Check all headings, body text, captions
  - [ ] Verify contrast ratios meet WCAG 4.5:1

- [ ] **Check all gradients render consistently**
  - [ ] Test on iOS (iPhone 12, iPhone 14, iPhone 15)
  - [ ] Test on Android (Samsung Galaxy S21, Pixel 6, low-end device)
  - [ ] Verify woodDarkGradient renders correctly
  - [ ] Verify woodMediumGradient renders correctly
  - [ ] Verify goldGradient renders correctly
  - [ ] Verify parchmentGradient renders correctly
  - [ ] Check adaptive gradients on low-end devices

- [ ] **Validate WCAG 4.5:1 contrast ratios**
  - [ ] Run contrast tests on all color combinations
  - [ ] Verify cream on woodDark passes (target: 4.5:1+)
  - [ ] Verify cream on woodMedium passes (target: 4.5:1+)
  - [ ] Verify navy on parchment passes (target: 4.5:1+)
  - [ ] Verify navy on gold passes (target: 4.5:1+)
  - [ ] Document any exceptions with justification

- [ ] **Ensure premium gold buttons are consistent**
  - [ ] All GoldButton components use same gradient
  - [ ] All gold buttons use navy text (not gold)
  - [ ] Button sizes are consistent (primary vs secondary)
  - [ ] Disabled states are consistent
  - [ ] Loading states are consistent
  - [ ] Touch feedback is consistent

- [ ] **Test in sunlight (outdoor readability)**
  - [ ] Test on actual device in bright sunlight
  - [ ] Verify text is readable on wood backgrounds
  - [ ] Verify text is readable on gold buttons
  - [ ] Check if any adjustments needed for outdoor use
  - [ ] Document any readability issues

**Output**: Design QA report with screenshots, contrast test results, and any issues found

---

### Week 5-6: Settings, Polish & Launch Prep

**Deliverables**:
- [ ] Enhanced Settings Screen
  - [ ] Edit measurements (jump to measurement input)
  - [ ] Style preferences
  - [ ] Budget settings (Budget/Mid/Premium price range preference)
  - [ ] Language selection (English for MVP, placeholder for future)
  - [ ] Premium status display
  - [ ] "Restart Onboarding" button
  - [ ] **Privacy & Data section (CRITICAL FIX #4)**
    - [ ] Photo Privacy setting
    - [ ] Local Storage info
    - [ ] Affiliate Disclosure
    - [ ] Link to Privacy Policy
  - [ ] Test premium activation (for development)
- [ ] PrivacyPolicyScreen (**CRITICAL FIX #4**)
  - [ ] Comprehensive privacy policy
  - [ ] Photo privacy section
  - [ ] Data storage section
  - [ ] Affiliate disclosure
  - [ ] Third party services
  - [ ] User rights
- [ ] Update all photo capture screens with privacy messaging (**CRITICAL FIX #4**)
  - [ ] Quick Style Check screen
  - [ ] Chat photo button
  - [ ] Wardrobe photo screen
  - [ ] Add item screen
- [ ] Favorite Combinations (Premium)
  - [ ] Save outfit combinations
  - [ ] View saved combinations
  - [ ] Delete combinations
- [ ] Premium management
  - [ ] PremiumService implementation
  - [ ] Usage tracking (free tier checks)
  - [ ] Paywall screens for each premium feature
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
- [ ] Performance optimization final checks (**FIX #6**)
  - [ ] Test on low-end Android device
  - [ ] Profile with React DevTools
  - [ ] Verify 60fps on all main screens
  - [ ] Test scrolling performance
- [ ] Typography consistency final checks (**FIX #7**)
  - [ ] Verify platform-specific fonts render correctly
  - [ ] Test font weights and line heights
  - [ ] Test text scaling with accessibility settings
- [ ] Comprehensive testing
  - [ ] End-to-end user flows
  - [ ] Free tier restrictions
  - [ ] Premium feature access
  - [ ] **All 7 critical fixes validated**
  - [ ] Performance testing
- [ ] App store preparation
  - [ ] Screenshots (with wood backgrounds, gold accents)
  - [ ] App description emphasizing premium experience
  - [ ] Privacy policy (no photo storage on servers)
  - [ ] Terms of service

**Final Testing Checkpoints**:
- [ ] No crashes during normal usage
- [ ] Graceful handling of network issues
- [ ] All premium gates work correctly
- [ ] Performance is smooth (60fps) (**FIX #6**)
- [ ] All contrast ratios pass WCAG 4.5:1 (**CRITICAL FIX #1**)
- [ ] "Skip All" onboarding flow works end-to-end (**CRITICAL FIX #2**)
- [ ] Free chat message preview works correctly (**CRITICAL FIX #3**)
- [ ] Privacy messaging visible on all photo screens (**CRITICAL FIX #4**)
- [ ] Price ranges display correctly (**IMPORTANT FIX #5**)
- [ ] Typography consistent across platforms (**IMPORTANT FIX #7**)
- [ ] Ready for TestFlight/Beta

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

## Key Decisions & Answers

### 1. Measurements
- **Answer**: Optional, can be skipped
- **Impact**: App won't suggest sizes if measurements not provided
- **Implementation**: All measurement inputs are optional, with clear messaging about benefits

### 2. Wardrobe Photo Categorization
- **Answer**: Auto-categorization with manual override
- **Implementation**: Use Claude Vision API to detect garment type, color, brand. Store results in `aiDetected` field. Allow user to override all detections.

### 3. Shopping Integration
- **Answer**: Keyword-based affiliate search links (simplified MVP)
- **Implementation**: Extract keywords from AI descriptions, generate affiliate search URLs. Real-time product APIs moved to Phase 2 (post-MVP). All links use affiliate tracking.

### 4. Premium Pricing
- **Answer**: Keep $6.99/month for now
- **Core Value**: Chat with Your Tailor (unlimited conversations)
- **Additional Features**: Unlimited style checks, unlimited wardrobe items, favorite combinations, priority AI processing

---

## Success Metrics

### User Engagement
- Onboarding completion rate (target: >60%)
- Measurements completion rate (target: >40%)
- Wardrobe items added (target: average 10+ items)
- Chat usage frequency (premium users, target: 2+ sessions/week)
- Quick Check usage (free users, target: 5+ checks before conversion)

### Feature Usage
- Chat usage (premium users): Sessions started, messages per session, photo messages vs text
- Quick Check usage (free/premium): Usage frequency, conversion trigger
- Build Outfit usage: Mode preference (Wardrobe/Shopping/Mixed)
- Favorite combinations saved
- Shopping link clicks
- Premium conversion rate

### Business Metrics
- Affiliate link clicks
- Conversion rate (clicks to purchases)
- Premium subscription rate
- User retention (7-day, 30-day)

---

## Notes & Considerations

### Performance
- Image processing can be slow - implement loading states
- Real-time product search may have API rate limits - implement caching
- Offline mode important for in-store assistant

### Accessibility
- Ensure text contrast meets WCAG standards (4.5:1 minimum)
- Wood textures shouldn't interfere with readability
- Support system font scaling
- Voice-over compatible

### Localization
- Language selection in settings
- Support for metric measurements (cm, kg)
- International shoe sizes
- Currency conversion for shopping

### Future Enhancements
- Social features (share outfits)
- Outfit calendar (plan outfits for week)
- Style evolution tracking
- Integration with fashion blogs/influencers
- AR try-on (future)

---

## Chat Feature Cost Considerations

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

### Simplified Shopping Integration

**Strategy**: Use affiliate search links with smart keyword generation instead of real-time product APIs. This provides immediate functionality without complex integrations.

**How It Works**:
1. AI generates item description: "Navy cotton dress shirt, spread collar"
2. Service extracts keywords: ["navy", "cotton", "dress shirt", "spread collar", "men"]
3. Build affiliate search URLs for each retailer
4. User clicks link → Opens retailer search results → Purchases with affiliate tracking

**Enhanced AffiliateLinkService**:
- Extract optimal search keywords from AI description
- Build optimized search term with size (if measurements available)
- Generate shopping options with smart search links
- Price range filtering in URLs (budget/mid/premium)
- Multiple retailer options per item (Amazon, Nordstrom, J.Crew, Bonobos)

**Shopping Card UI**:
- Display shopping options with clear expectations
- Show search term badge: "Searching: 'men navy cotton dress shirt'"
- Price range badge: "$25-$75"
- Helper text: "We'll search [Retailer] for items matching this description. Results open in your browser."

**Future Enhancement Path** (Post-MVP):
- Phase 2: Integrate with Amazon Product Advertising API for real product data
- Phase 3: Add real-time pricing, images, ratings
- Phase 4: In-app product browsing without leaving app

---

## Conclusion

This redesign transforms GAUGE from a utility app into a premium, personalized tailoring experience. The focus is on:

1. **Chat as Core Premium Feature**: Natural conversation replaces rigid modes - users ask questions like they would to a real tailor
2. **Premium Aesthetic**: Sophisticated design with wood gradients and gold accents that feels high-end
3. **Personalization**: Every interaction tailored to the individual user (measurements, wardrobe, preferences)
4. **Flexibility**: Fully skippable onboarding, multiple access points (chat, quick check, build outfit)
5. **Value**: Chat provides unlimited personalized advice, shopping integration, wardrobe management

**Key Innovation**: Chat feature is THE premium value proposition. It's natural, powerful, and creates a relationship (chat with your tailor) not just a tool (style checker). This positions GAUGE as a premium service, not just an app.

The 6-week MVP timeline focuses on proving the core value proposition: **A premium personal tailor experience in your pocket, accessible through natural conversation.**

