# Affiliate Programs Guide for GAUGE App

## Currently Integrated (Ready to Use)

### 1. **Amazon Associates** ✅
**Status:** ✅ **APPROVED - Ready to use!**  
**Your Associate ID:** `gaugeapp-20`  
**Sign up:** https://affiliate-program.amazon.com/  
**Commission:** 1-10% depending on category  
**Requirements:** 
- Website/app with traffic
- Tax information
- Payment details
**Setup:**
1. ✅ Account approved - Associate ID: `gaugeapp-20`
2. Set in `.env`: `AMAZON_AFFILIATE_TAG=gaugeapp-20`
3. For EAS builds, set secret: `eas secret:create --scope project --name amazon_affiliate_tag --value gaugeapp-20`

**Pros:** 
- Massive product selection
- High conversion rates
- Easy integration
- Reliable payouts

**Cons:** 
- Lower commission rates
- 24-hour cookie window
- Competitive approval process

---

### 2. **Nordstrom Affiliate Program** ✅
**Status:** Already implemented in code  
**Sign up:** https://www.shareasale.com/shareasale.cfm?merchantID=4  
**Commission:** 2-4%  
**Requirements:**
- Active website/app
- Minimum traffic thresholds
**How to get your ID:**
1. Join via ShareASale
2. Get your Affiliate ID
3. Set in `.env`: `NORDSTROM_AFFILIATE_ID=your-id`

**Pros:**
- Premium brand reputation
- Good commission for high-end items
- Longer cookie windows

**Cons:**
- Requires ShareASale membership
- Approval can take time

---

## Recommended Additional Programs

### 3. **J.Crew Affiliate Program**
**Status:** Links generated but no affiliate tracking yet  
**Sign up:** https://www.cj.com/publishers/get-started (CJ Affiliate)  
**Commission:** 5-8%  
**How to integrate:**
- J.Crew uses CJ Affiliate (formerly Commission Junction)
- You'll get tracking links to replace current simple search URLs

**Why it's good:** 
- Premium menswear brand
- Strong brand loyalty
- Good commission rates

---

### 4. **Bonobos Affiliate Program**
**Status:** Links generated but no affiliate tracking yet  
**Sign up:** https://www.cj.com/publishers/get-started  
**Commission:** 6-8%  
**How to integrate:**
- Also uses CJ Affiliate
- Perfect for menswear-focused apps

**Why it's good:**
- Modern menswear leader
- Strong mobile experience
- Good fit for your target audience

---

### 5. **Mr. Porter Affiliate Program**
**Sign up:** https://www.awin.com/publishers (Awin)  
**Commission:** 5-7%  
**Why add it:**
- Premium/luxury menswear
- Excellent brand reputation
- International shipping

---

### 6. **ASOS Affiliate Program**
**Sign up:** https://www.awin.com/publishers  
**Commission:** 6-8%  
**Why add it:**
- Massive selection
- Affordable options
- Good for budget-conscious users

---

### 7. **Target Affiliate Program**
**Sign up:** https://www.cj.com/publishers/get-started  
**Commission:** 1-4%  
**Why add it:**
- Accessible pricing
- Wide product range
- Good for basic wardrobe needs

---

### 8. **Uniqlo Affiliate Program**
**Sign up:** https://www.cj.com/publishers/get-started  
**Commission:** 5-6%  
**Why add it:**
- Affordable basics
- Quality materials
- Popular with younger demographics

---

### 9. **SuitSupply Affiliate Program**
**Sign up:** Check their website or contact partnerships  
**Commission:** Varies  
**Why add it:**
- Premium suiting
- Perfect for formal occasion outfits
- High average order value

---

### 10. **Express Affiliate Program**
**Sign up:** https://www.cj.com/publishers/get-started  
**Commission:** 5-7%  
**Why add it:**
- Contemporary menswear
- Frequent sales
- Good commission rates

---

## Affiliate Network Platforms

Most programs use these networks:

### **CJ Affiliate (Commission Junction)**
- Programs: J.Crew, Bonobos, Target, Uniqlo, Express
- **Sign up:** https://www.cj.com/publishers/get-started
- **Pros:** Centralized dashboard, many fashion brands
- **Cons:** Requires approval for each merchant

### **ShareASale**
- Programs: Nordstrom (plus many others)
- **Sign up:** https://www.shareasale.com/info/publisher/
- **Pros:** Easy approval, good support
- **Cons:** Smaller selection than CJ

### **Awin**
- Programs: Mr. Porter, ASOS, many international brands
- **Sign up:** https://www.awin.com/publishers
- **Pros:** Global reach, strong fashion brands
- **Cons:** Approval can be strict

### **Impact.com**
- Programs: Some premium brands
- **Sign up:** https://impact.com/publishers/
- **Pros:** Modern platform, good tracking
- **Cons:** Fewer fashion brands

---

## How to Add More Affiliate Programs

### Step 1: Sign Up
1. Choose 3-5 programs from above
2. Apply with your app's website/landing page
3. Wait for approval (can take 1-2 weeks)

### Step 2: Update Code
Once approved, you'll need to:

1. **Add environment variables** in `.env`:
```env
JCREW_AFFILIATE_ID=your-id
BONOBOS_AFFILIATE_ID=your-id
MRPORTER_AFFILIATE_ID=your-id
```

2. **Update `src/services/affiliateLinks.ts`**:
```typescript
generateJCrewLink(searchTerm: string): string {
  const encoded = encodeURIComponent(searchTerm);
  const id = JCREW_AFFILIATE_ID || '';
  // Use CJ Affiliate tracking link format
  return `https://www.jcrew.com/...?cjdata=${id}`;
}
```

3. **Add to `src/types/env.d.ts`**:
```typescript
declare module '@env' {
  export const JCREW_AFFILIATE_ID: string;
  export const BONOBOS_AFFILIATE_ID: string;
  // etc.
}
```

---

## Revenue Optimization Tips

### 1. **Focus on High-Value Outfits**
- Premium occasion outfits generate higher commissions
- Formal wear has higher average order values

### 2. **Track Performance**
- Monitor which retailers convert best
- Prioritize top performers in UI

### 3. **Cookie Windows**
- Amazon: 24 hours
- Most others: 30-90 days
- Nordstrom: 30 days

### 4. **Best Practices**
- ✅ Always disclose affiliate relationships
- ✅ Test links regularly
- ✅ Use deep links to specific products when possible
- ✅ Track conversions per retailer

---

## Recommended Starting List

**Start with these 3-4 programs:**

1. ✅ **Amazon Associates** (already set up)
   - Breadth of products
   - High conversion

2. ✅ **Nordstrom** (already set up)
   - Premium positioning
   - Good commissions

3. **J.Crew** (quick win)
   - Easy to add
   - Good commission rates

4. **ASOS** or **Uniqlo**
   - Affordable options
   - Broad appeal

**Then expand to:**
- Bonobos (menswear focus)
- Mr. Porter (luxury segment)
- Express (contemporary)

---

## Setting Up Your First Programs

### Priority Order:
1. **Amazon** - Already integrated, just need to sign up
2. **Nordstrom** - Already integrated, just need to sign up  
3. **J.Crew** - Easy integration, good rates
4. **Bonobos** - Perfect brand fit for menswear app

### Timeline:
- Application approval: 1-2 weeks per program
- Integration: 1-2 hours per program (once approved)
- Total setup: 2-4 weeks for all programs

---

## Legal Requirements

⚠️ **Important:** You must:
- Disclose affiliate relationships (add to app terms/privacy)
- Follow each program's terms of service
- Include "Affiliate Disclosure" in your app
- Track and report earnings for taxes

---

**Next Steps:**
1. Sign up for Amazon Associates and Nordstrom (use existing integration)
2. Apply for J.Crew via CJ Affiliate
3. Once approved, I can help integrate the tracking links

