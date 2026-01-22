import type { Metadata, Viewport } from 'next'
import './globals.css'
import { faqSchema, productSchema, serviceSchema, howToSchema } from './schema'

const siteUrl = 'https://diffuse.ai'
const siteName = 'diffuse.ai'
const siteDescription = 'Turn meeting recordings into published articles in minutes. AI-powered journalism automation that saves 90% on content costs. Free to start, scales to enterprise.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'diffuse.ai',
    template: '%s | diffuse.ai',
  },
  description: siteDescription,
  keywords: [
    // Primary keywords
    'AI journalism',
    'automated article writing',
    'meeting to article AI',
    'transcription to news',
    'local news automation',
    // Problem-focused
    'save time writing articles',
    'reduce content costs',
    'automate newsroom',
    'one-person newsroom',
    // Use case keywords
    'meeting transcription to article',
    'government meeting coverage',
    'school board meeting news',
    'township meeting coverage',
    'municipal meeting automation',
    // Technology keywords
    'AI content generation',
    'GPT journalism',
    'LLM news writing',
    'automated transcription',
    'speech to article',
    // Industry keywords
    'local journalism software',
    'newsroom automation platform',
    'community journalism AI',
    'freelance journalist tools',
    'independent reporter software',
    // Competitor alternatives
    'ChatGPT for journalism',
    'AI writing for news',
    'automated reporting tool',
  ],
  authors: [
    { name: 'diffuse.ai', url: siteUrl },
  ],
  creator: 'diffuse.ai',
  publisher: 'diffuse.ai',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: siteName,
    title: 'diffuse.ai — Turn Meetings Into Articles in Minutes',
    description: siteDescription,
    images: [
      {
        url: '/socialcover.png',
        width: 1200,
        height: 630,
        alt: 'diffuse.ai - AI-Powered Journalism Automation',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@DiffuseAI',
    creator: '@DiffuseAI',
    title: 'diffuse.ai — Turn Meetings Into Articles in Minutes',
    description: siteDescription,
    images: ['/socialcover.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [
      { url: '/D.png', sizes: 'any', type: 'image/png' },
    ],
    apple: [
      { url: '/D.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  category: 'technology',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#000000' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="custom-scrollbar">
      <head>
        {/* Preconnect to optimize loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'diffuse.ai',
              url: siteUrl,
              logo: `${siteUrl}/D.png`,
              description: siteDescription,
              foundingDate: '2024',
              sameAs: [
                'https://twitter.com/DiffuseAI',
                'https://linkedin.com/company/diffuse-ai',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Sales',
                availableLanguage: ['English'],
              },
            }),
          }}
        />
        {/* Structured Data - Software Application */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'diffuse.ai',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '5',
                ratingCount: '1',
              },
              description: siteDescription,
            }),
          }}
        />
        {/* Structured Data - WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: siteName,
              url: siteUrl,
              description: siteDescription,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${siteUrl}/?s={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {/* Structured Data - FAQ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
        {/* Structured Data - Product */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productSchema),
          }}
        />
        {/* Structured Data - Service */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceSchema),
          }}
        />
        {/* Structured Data - HowTo */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToSchema),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
