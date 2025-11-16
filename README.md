# Diffuse.AI Landing Page

A modern, AI-focused landing page for Diffuse.AI - a workflow automation system that transforms local events and meetings into news articles.

## Features

- 🎨 Modern glassmorphism design with dark theme
- 🌊 Smooth Framer Motion animations and transitions
- 📱 Fully responsive (mobile-first design)
- 🎯 Built with Next.js 14, TypeScript, and Tailwind CSS
- 🎭 IBM Plex Mono typography
- 🎨 Custom color palette with cosmic orange accents

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Design System

### Colors

**Primary Colors:**
- Dark Gray: `#141414`
- Black: `#000000`
- Secondary White: `#dbdbdb`
- Cosmic Orange: `#ff9628`
- Medium Gray: `#545454`

**Secondary Colors:**
- Pale Blue: `#90efff`
- Dusty Blue: `#447aa6`
- Rich Orange: `#ff7300`
- Off White: `#f4f4f4`

### Typography

- Font Family: IBM Plex Mono
- Display sizes: xl (80px), lg (64px), md (48px), sm (36px)
- Heading sizes: xl (32px), lg (24px), md (20px)
- Body sizes: lg (18px), md (16px), sm (14px)
- Caption: 12px

### Components

- Glass containers with backdrop blur
- Animated gradient buttons
- Smooth scroll animations
- Responsive grid layouts
- Custom scrollbar styling

## Project Structure

```
diffuse.ai/
├── app/
│   ├── globals.css       # Global styles and utilities
│   ├── layout.tsx        # Root layout with metadata
│   └── page.tsx          # Main page component
├── components/
│   ├── Hero.tsx          # Hero section
│   ├── About.tsx         # About/Overview section
│   ├── HowItWorks.tsx    # Process explanation
│   ├── Features.tsx      # AI features showcase
│   ├── UseCases.tsx      # Use cases and pilot project
│   └── Footer.tsx        # Footer component
├── public/               # Static assets (add your images here)
└── ...config files
```

## Customization

### Adding Images

Place your images in the `/public` directory and update the placeholder sections in:
- `components/UseCases.tsx` (Schuylkill River Press screenshot)

### Updating Content

Edit the content directly in each component file:
- Hero headline: `components/Hero.tsx`
- Features list: `components/Features.tsx`
- Process steps: `components/HowItWorks.tsx`
- Use cases: `components/UseCases.tsx`

### Styling

The design system is defined in:
- `tailwind.config.ts` - Tailwind configuration
- `app/globals.css` - Custom CSS classes and utilities

## Technologies

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Font:** IBM Plex Mono (Google Fonts)

## Performance

- Optimized animations with Framer Motion
- Lazy loading with `useInView` hooks
- Responsive images and assets
- CSS-based glassmorphism effects

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/diffuse-ai)

**Quick Deploy:**
```bash
npm i -g vercel
vercel
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Deploy to Other Platforms

**Netlify:**
```bash
npm run build
# Deploy .next folder
```

**AWS Amplify, Cloudflare Pages, etc.:**
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`

## Post-Deployment Checklist

- [ ] Update domain in `app/sitemap.ts`
- [ ] Add favicon and app icons to `/public`
- [ ] Connect "Schedule a Demo" buttons to booking system
- [ ] Add analytics tracking
- [ ] Replace placeholder images
- [ ] Configure custom domain
- [ ] Test on real mobile devices

## Production Ready

✅ **Build Status:** Passing  
✅ **Linting:** No errors  
✅ **TypeScript:** No errors  
✅ **Bundle Size:** 130 kB (optimized)  
✅ **Performance:** Static generation enabled  
✅ **SEO:** Metadata, sitemap, manifest configured  
✅ **Responsive:** Mobile-first design  

## License

All rights reserved.

