# Sakura Sushi Website - Demo

## Overview
A beautiful, modern demo website for Sakura Sushi restaurant featuring authentic Japanese cuisine with a French location.

## Website URL
- **Local**: http://localhost:3014
- **Network**: http://165.227.156.92:3014
- **Domain**: https://b2b.tengerly.com

## Features

### 🎨 Design
- Clean, modern Japanese restaurant aesthetic
- Elegant color scheme with red (#c8102e) as primary color
- Responsive design that works on all devices
- Smooth scrolling navigation
- Beautiful typography using Playfair Display and Lato fonts

### 📱 Sections

1. **Navigation Bar**
   - Fixed top navigation with smooth scrolling
   - Links to all sections: Home, About, Menu, Gallery, Contact
   - Reserve Table button
   - Mobile-responsive hamburger menu

2. **Hero Section**
   - Full-screen hero with background image
   - Large, elegant typography
   - Call-to-action buttons: "View Menu" and "Book a Table"

3. **About Section**
   - Restaurant story and description
   - Featured image of sushi
   - Statistics: 20+ Years Experience, 50+ Menu Items, 10K+ Happy Customers

4. **Menu Section**
   - Three categories: Nigiri, Rolls, Special Rolls
   - Each item includes name, price in Euros (€), and description
   - Beautiful card-based layout

5. **Gallery Section**
   - 6 high-quality sushi images in a responsive grid
   - Hover effects with scale transformation
   - All images from `/public/images/` directory

6. **Contact Section**
   - Address: 123 Rue de la Cerisier, 75008 Paris, France
   - Phone: +33 1 42 65 78 90
   - Email: info@sakurasushi.fr
   - Hours: Mon-Fri 11:00-22:00, Sat-Sun 12:00-23:00
   - Reservation form with fields for name, email, phone, date, time, guests, and special requests

7. **Footer**
   - Quick links
   - Contact information
   - Social media icons (Facebook, Instagram, Twitter)
   - Copyright notice

## Images Used
All 8 images from `/public/images/` directory:
1. `salad-fresh-sushi-rolls-chopsticks.jpg` - Hero background
2. `sushi-roll-set-desk-topped-with-sauce-top-view.jpg` - About section
3. `traditional-sushi-dark-surface.jpg` - Gallery
4. `sushi-set-hot-rolls-avocado-california-salmon-rolls.jpg` - Gallery
5. `side-view-sushi-rolls-with-salmon-eel-avocado-cream-cheese-plate-with-ginger-wasabi.jpg` - Gallery
6. `woman-holding-sushi-roll-with-chopsticks.jpg` - Gallery
7. `close-up-delicious-fresh-sushi-black-plate.jpg` - Gallery
8. `sushi-with-cucumber-ginger-wasabi-sesame-seeds.jpg` - Gallery

## Localization
- **Currency**: Euro (€) with European format (e.g., 6,50€)
- **Location**: Paris, France
- **Phone**: French format (+33)
- **Time**: 24-hour format
- **Language**: English (as requested)

## Menu Items & Pricing

### Nigiri
- Salmon Nigiri - 6,50€
- Tuna Nigiri - 7,00€
- Eel Nigiri - 6,50€

### Rolls
- California Roll - 12,00€
- Spicy Tuna Roll - 14,00€
- Dragon Roll - 16,00€

### Special Rolls
- Rainbow Roll - 18,00€
- Sakura Special - 20,00€
- Volcano Roll - 17,00€

## Technical Details

### Technologies
- **Framework**: Next.js 16.1.6
- **React**: 19.2.3
- **Styling**: Tailwind CSS 4
- **TypeScript**: 5
- **Fonts**: Google Fonts (Playfair Display, Lato)

### Configuration
- Images set to `unoptimized: true` in `next.config.ts` for production deployment
- Port: 3014
- Managed by PM2 process manager

### File Structure
```
/srv/apps/b2b/
├── app/
│   ├── page.tsx          # Main website component
│   ├── layout.tsx        # Root layout with fonts and metadata
│   └── globals.css       # Global styles and Tailwind config
├── public/
│   └── images/           # All sushi images (8 files)
├── next.config.ts        # Next.js configuration
├── package.json          # Dependencies
└── ecosystem.config.js   # PM2 configuration
```

## Deployment

### Build & Deploy Commands
```bash
# Stop the app
pm2 stop b2b

# Wait for port to free
sleep 2

# Build the application
npm run build

# Start the app
pm2 start b2b

# Check status
pm2 status b2b

# View logs
pm2 logs b2b --lines 20
```

### Important Notes
- Always follow the Safe Build Guide (`SAFE_BUILD_GUIDE.md`)
- Never use `pm2 restart` during build
- Always stop before building, then start after

## Color Palette
- **Primary Red**: #c8102e (Sakura red)
- **Secondary Dark**: #2c2c2c (Footer background)
- **Accent Light**: #f5f5f5 (Section backgrounds)
- **Text**: #1a1a1a (Main text)
- **White**: #ffffff (Background)

## Interactive Elements
- Smooth scroll navigation
- Hover effects on buttons and images
- Mobile-responsive menu toggle
- Form inputs with focus states
- Social media icon hover effects

## Future Enhancements (Optional)
- Add image lightbox for gallery
- Implement actual form submission
- Add animations on scroll
- Multi-language support (French/English toggle)
- Online ordering system
- Customer reviews section
- Chef profiles
- Special events calendar

---

**Created**: February 15, 2026
**Status**: ✅ Live and Running
**Access**: http://localhost:3014 or https://b2b.tengerly.com
