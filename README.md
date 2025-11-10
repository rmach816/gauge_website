# GAUGE Website

Landing page website for the GAUGE mobile app - Your Personal AI Tailor.

**Repository**: [https://github.com/rmach816/gauge_website](https://github.com/rmach816/gauge_website)

## Overview

This is a sophisticated, responsive landing page that matches the GAUGE app's premium design system. The website features:

- **Modern Design**: Matches the app's wood-toned, gold-accented aesthetic
- **Fully Responsive**: Works beautifully on desktop, tablet, and mobile devices
- **Legal Compliance**: Privacy Policy and Terms of Service meeting Apple and Google requirements
- **Smooth Animations**: Fade-in effects and smooth scrolling
- **SEO Optimized**: Proper meta tags and semantic HTML

## Files

- `index.html` - Main landing page with hero, features, pricing, and download sections
- `styles.css` - Complete stylesheet matching the app's design system
- `script.js` - JavaScript for interactivity and animations
- `privacy-policy.html` - Comprehensive privacy policy (Apple & Google compliant)
- `terms-of-service.html` - Complete terms of service (Apple & Google compliant)
- `logo.png` - GAUGE logo image (required - add your logo file)

## Design System

The website uses the same design tokens as the GAUGE app:

- **Colors**: Wood tones (dark, medium), cream/ivory text, gold accents, navy text
- **Typography**: Inter font family with consistent sizing
- **Spacing**: Consistent spacing scale (xs, sm, md, lg, xl, xxl, xxxl)
- **Components**: Buttons, cards, badges matching app style

## Features

### Landing Page Sections

1. **Hero Section**: Eye-catching introduction with app mockup
2. **Features**: 6 key features with icons and descriptions
3. **How It Works**: 4-step process with visual guides
4. **Pricing**: Free vs Premium comparison
5. **Download**: App Store and Google Play CTAs
6. **Footer**: Links to legal pages and contact info

### Legal Pages

- **Privacy Policy**: Comprehensive policy covering:
  - Data collection and usage
  - AI processing (Anthropic Claude)
  - User rights (GDPR, CCPA)
  - Data security
  - Third-party services
  - Children's privacy

- **Terms of Service**: Complete terms covering:
  - Service description
  - Subscription terms
  - User responsibilities
  - Intellectual property
  - Disclaimers and liability
  - Dispute resolution

## Setup

1. Clone or download this repository:
   ```bash
   git clone https://github.com/rmach816/gauge_website.git
   cd gauge_website
   ```
2. Open `index.html` in a web browser
3. For local development, use a simple HTTP server:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js
   npx http-server
   ```

## Customization

### Add Logo

Add your GAUGE logo file:
- Place `logo.png` in the root directory
- Logo should be a PNG with transparent background
- Recommended size: 64x64px to 128x128px (will be scaled to 32px height)
- The logo should be the gold/bronze geometric symbol with "GAUGE" text

### Update Screenshots

Replace placeholder images with actual app screenshots:
- Hero section: `https://via.placeholder.com/300x600/3E2723/F5F5DC?text=App+Screenshot+1`
- How It Works steps: Update `src` attributes in step images
- Download section: Update phone showcase images

### Update Contact Information

Replace placeholder emails in legal pages:
- `privacy@gauge.app`
- `support@gauge.app`
- `legal@gauge.app`

### Update App Store Links

Replace `#` placeholders in download buttons with actual App Store and Google Play links.

### Update Jurisdiction

In `terms-of-service.html`, replace `[Your Jurisdiction]` and `[Arbitration Organization]` with your actual legal information.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

The website can be deployed to:

- **GitHub Pages**: Push to a `gh-pages` branch
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your repository
- **Any static hosting**: Upload all files to your web server

## Notes

- **Logo Required**: Add `logo.png` to the root directory (the website references it)
- Placeholder screenshots use `via.placeholder.com` - replace with actual app screenshots
- App Store and Google Play badges use official images from Apple and Google CDNs
- Download badge links point to `#` - update with actual App Store and Google Play URLs
- Email addresses are placeholders - update with your actual support emails
- Legal pages reference jurisdiction placeholders - update with your actual legal information

## License

Private - All rights reserved
