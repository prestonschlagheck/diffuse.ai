# Creating Your Open Graph Social Share Image

## 🎯 Goal
Create a 1200x630px image of your hero section that appears when sharing on iMessage, Twitter, Facebook, LinkedIn, Slack, etc.

## 📐 Required Images

You need to create **3 images** for optimal social sharing:

### 1. **og-image.png** (Primary - Required)
- **Size:** 1200x630px
- **Format:** PNG or JPG
- **Purpose:** Primary social share image (Twitter, Facebook, LinkedIn, iMessage)
- **Content:** Screenshot of your hero section

### 2. **og-image-square.png** (Optional but Recommended)
- **Size:** 1200x1200px
- **Format:** PNG or JPG
- **Purpose:** Square format for some platforms
- **Content:** Centered version of hero or logo

### 3. **apple-touch-icon.png** (iOS Home Screen)
- **Size:** 180x180px
- **Format:** PNG
- **Purpose:** iOS home screen icon
- **Content:** Your logo/brand mark

---

## 🖼️ Method 1: Screenshot Your Hero Section (Easiest)

### Step 1: Take Screenshot
1. Open http://localhost:3000 in browser
2. Set browser window to **1200px wide**
3. Zoom to 100%
4. Scroll to top (hero section visible)
5. Use browser DevTools (F12):
   - Right-click hero section
   - "Capture node screenshot" (Chrome)
   - Or use full-page screenshot tool

### Step 2: Crop & Resize
Use any image editor:

**Free Online Tools:**
- [Canva](https://canva.com) - Free image editor
- [Photopea](https://photopea.com) - Online Photoshop alternative
- [Remove.bg](https://remove.bg) - Remove backgrounds

**Desktop Tools:**
- Preview (Mac) - Built-in
- Paint (Windows) - Built-in
- GIMP - Free & powerful

**Crop to:**
- 1200px width
- 630px height
- Center the hero text

### Step 3: Export & Save
```bash
# Save files to:
/Users/prestonschlagheck/Downloads/Code Projects/diffuse.ai/public/og-image.png
/Users/prestonschlagheck/Downloads/Code Projects/diffuse.ai/public/og-image-square.png
/Users/prestonschlagheck/Downloads/Code Projects/diffuse.ai/public/apple-touch-icon.png
```

---

## 🎨 Method 2: Design Custom Image (Recommended)

### Using Canva (Free)

1. **Go to:** https://canva.com
2. **Create:** Custom size → 1200 x 630 px
3. **Design your image with:**
   - Black background (#000000)
   - Text: "diffuse.ai" (IBM Plex Mono font)
   - Headline: "Reviving Local News Through Smart Automation"
   - Orange accent (#ff9628)
   - Add subtle gradient or animation preview

4. **Download:** PNG format
5. **Save as:** `og-image.png`

### Using Figma (Free)

1. **Go to:** https://figma.com
2. **Create:** 1200 x 630 frame
3. **Design** using your brand:
   ```
   Background: #000000 (black)
   Text: #dbdbdb (off-white)
   Accent: #ff9628 (cosmic orange)
   Font: IBM Plex Mono (Google Fonts)
   ```
4. **Export:** PNG at 2x resolution
5. **Rename:** to `og-image.png`

---

## 🛠️ Method 3: Automated Screenshot (Advanced)

### Using Playwright (Node.js)

```bash
# Install Playwright
npm install -D @playwright/test

# Create screenshot script
cat > scripts/generate-og-image.js << 'EOF'
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport for OG image size
  await page.setViewportSize({ width: 1200, height: 630 });
  
  // Navigate to your local site
  await page.goto('http://localhost:3000');
  
  // Wait for animations to settle
  await page.waitForTimeout(2000);
  
  // Take screenshot of hero section
  await page.locator('section').first().screenshot({ 
    path: 'public/og-image.png',
    type: 'png'
  });
  
  console.log('✓ OG image created: public/og-image.png');
  
  await browser.close();
})();
EOF

# Run the script
node scripts/generate-og-image.js
```

---

## 📱 Design Guidelines

### Content to Include:
- ✅ "diffuse.ai" logo/text
- ✅ Main headline: "Reviving Local News Through Smart Automation"
- ✅ Subtle gradient or visual effect
- ✅ High contrast for readability

### What to Avoid:
- ❌ Too much text (hard to read when small)
- ❌ Important content near edges (gets cropped)
- ❌ Light text on light backgrounds
- ❌ Complex layouts (keep it simple)

### Color Scheme (Your Brand):
```css
Background:  #000000 (Black)
Text:        #dbdbdb (Off-white)
Accent:      #ff9628 (Cosmic Orange)
Secondary:   #ff7300 (Rich Orange)
```

---

## ✅ After Creating Images

### 1. Save files to `/public` folder:
```
public/
├── og-image.png         (1200x630px)
├── og-image-square.png  (1200x1200px - optional)
├── apple-touch-icon.png (180x180px)
├── icon-192.png         (192x192px)
├── icon-512.png         (512x512px)
└── favicon.ico          (32x32px)
```

### 2. Verify images load:
```bash
# Start dev server (if not running)
npm run dev

# Check these URLs:
# → http://localhost:3000/og-image.png
# → http://localhost:3000/apple-touch-icon.png
```

### 3. Test social sharing:

**Facebook Debugger:**
https://developers.facebook.com/tools/debug/

**Twitter Card Validator:**
https://cards-dev.twitter.com/validator

**LinkedIn Post Inspector:**
https://www.linkedin.com/post-inspector/

**iMessage Preview:**
Send the link to yourself via Messages

---

## 🎨 Quick Canva Template

Here's exactly what to put in Canva:

```
Canvas: 1200 x 630px
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: Black (#000000)

[Add Text - Top]
Font: IBM Plex Mono Bold
Size: 80px
Color: White (#FFFFFF)
Text: "diffuse"
Then add: ".ai" in Orange (#ff9628)

[Add Text - Center]
Font: IBM Plex Mono Regular
Size: 48px
Color: Off-white (#dbdbdb)
Text: "Reviving Local News
       Through Smart Automation"

[Add Shape - Bottom]
Gradient bar from #ff9628 to #ff7300
Height: 8px, Full width

[Add Circle - Corner]
Subtle orange glow (#ff9628, 30% opacity)
Position: Top right, partially visible
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔍 Testing Your Images

### Check Image Specs:
```bash
# macOS
file public/og-image.png
# Should show: PNG image data, 1200 x 630

# Linux
identify public/og-image.png
```

### Preview How It Looks:
1. **iMessage:** Send link to yourself
2. **Slack:** Paste link in a channel
3. **Twitter:** Create draft tweet with link
4. **Facebook:** Paste in post (don't publish!)

---

## 📏 Image Specifications Reference

| Platform     | Size        | Format | Notes                    |
|-------------|-------------|--------|--------------------------|
| Facebook    | 1200x630px  | PNG    | Primary OG image         |
| Twitter     | 1200x628px  | PNG    | Cards with summary large |
| LinkedIn    | 1200x627px  | PNG    | Article shares           |
| iMessage    | 1200x630px  | PNG    | Link previews            |
| WhatsApp    | 1200x630px  | PNG    | Link previews            |
| Slack       | 1200x630px  | PNG    | Unfurls                  |
| Instagram   | 1080x1080px | PNG    | Square format            |

**Your current setup (1200x630px) works for all platforms!**

---

## 🚀 Quick Reference

**After creating images:**

1. Save to `/public` folder
2. Restart dev server: `npm run dev`
3. Test: http://localhost:3000/og-image.png
4. Deploy: `vercel --prod`
5. Verify: Share link on iMessage/Slack

**Files needed:**
- ✅ `og-image.png` (1200x630) - REQUIRED
- ⚪ `og-image-square.png` (1200x1200) - Optional
- ⚪ `apple-touch-icon.png` (180x180) - Optional
- ⚪ `icon-192.png` (192x192) - Optional  
- ⚪ `icon-512.png` (512x512) - Optional
- ⚪ `favicon.ico` (32x32) - Optional

Only `og-image.png` is required for social sharing to work!

---

Need help? The layout is already configured in `app/layout.tsx` - just add your images! 🎉

