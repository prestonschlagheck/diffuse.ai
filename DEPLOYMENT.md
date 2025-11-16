# Deployment Guide for Vercel

## ✅ Pre-Deployment Checklist

All requirements met:
- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Production build successful
- ✅ No linter errors
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ SEO metadata configured
- ✅ Sitemap and manifest files
- ✅ Optimized bundle size

## 🚀 Deploy to Vercel (Recommended)

### Method 1: Vercel CLI (Fastest)

1. Install Vercel CLI globally:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from project directory:
```bash
cd /Users/prestonschlagheck/Downloads/Code\ Projects/diffuse.ai
vercel
```

4. For production deployment:
```bash
vercel --prod
```

### Method 2: Vercel Dashboard (Easiest)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Diffuse.AI landing page"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)

3. Click "Add New Project"

4. Import your GitHub repository

5. Vercel will auto-detect Next.js and configure settings

6. Click "Deploy"

### Method 3: Vercel Git Integration

Connect your repository to Vercel for automatic deployments:
- Every push to `main` = production deployment
- Every push to other branches = preview deployment

## 🔧 Configuration

### Environment Variables (if needed)

If you need to add environment variables later:

1. In Vercel Dashboard: Settings → Environment Variables
2. Add variables for all environments (Production, Preview, Development)

### Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `diffuse.ai`)
3. Update DNS records as instructed by Vercel
4. SSL certificate is automatic

## 🎯 Post-Deployment Tasks

### 1. Update Domain in Files
After deploying, update the sitemap URL:
- File: `app/sitemap.ts`
- Change: `https://diffuse.ai` to your actual domain

### 2. Add Analytics (Optional)
Add your analytics tracking code:
- Google Analytics
- Mixpanel
- PostHog
- Or your preferred analytics platform

### 3. Connect CTA Buttons
Update "Schedule a Demo" buttons to link to:
- Calendly
- Cal.com
- Or your booking system

Locations:
- `components/Hero.tsx`
- `components/UseCases.tsx`
- `components/Footer.tsx`

### 4. Add Real Images
Replace placeholder images in:
- `components/UseCases.tsx` (Schuylkill River Press screenshot)
- Add images to `/public` folder

### 5. Add Favicon and App Icons
Create and add:
- `/public/favicon.ico` (32x32px)
- `/public/icon-192.png` (192x192px)
- `/public/icon-512.png` (512x512px)
- `/public/apple-touch-icon.png` (180x180px)

Use your orange/black brand colors for the icons.

## 📊 Performance Optimizations (Already Applied)

✅ Static site generation
✅ Automatic image optimization
✅ Font optimization (IBM Plex Mono)
✅ Code splitting
✅ Tree shaking
✅ Minification
✅ Gzip/Brotli compression

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Issues
Check Node.js version:
```bash
node --version  # Should be 18.17 or higher
```

### Deployment Issues
Check Vercel logs in dashboard for detailed error messages.

## 📈 Monitoring

Once deployed, monitor:
- Build times (should be ~30-60 seconds)
- Page load speed (should be <2 seconds)
- Core Web Vitals in Vercel Analytics

## 🔄 Continuous Deployment

With Git integration enabled:
1. Make changes locally
2. Commit and push to GitHub
3. Vercel auto-deploys
4. Preview at temporary URL
5. Production updates on merge to main

## 📞 Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Deployment Support: https://vercel.com/support

---

**Current Build Status:** ✅ Ready for Production
**Bundle Size:** 130 kB (First Load)
**Static Pages:** 4 (/, /_not-found, /manifest.webmanifest, /sitemap.xml)

