import type { Metadata, Viewport } from 'next'
import './globals.css'
import { faqSchema, productSchema, serviceSchema, howToSchema } from './schema'

const siteUrl = 'https://diffuse.ai'
const siteName = 'Diffuse.AI'
const siteDescription = 'Transform local meetings into news articles with AI-powered automation. Diffuse brings cutting-edge technology to community journalism, reviving local news through smart automation.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Diffuse.AI - Reviving Local News Through Smart Automation',
    template: '%s | Diffuse.AI',
  },
  description: siteDescription,
  keywords: [
    'AI journalism',
    'local news automation',
    'meeting transcription',
    'community journalism',
    'news AI',
    'automated reporting',
    'local government coverage',
    'journalism technology',
    'news automation platform',
    'civic journalism',
    'meeting summarization',
    'AI news writing',
    'local media',
    'Schuylkill River Press',
    'automated news generation',
    'GPT 5.1',
    'OpenAI API',
    'newsroom automation',
    'local journalism software',
    'meeting coverage AI',
    'municipal news automation',
    'government meeting transcription',
    'AI editorial assistant',
    'news workflow automation',
    'local news technology',
  ],
  authors: [
    { name: 'Diffuse.AI', url: siteUrl },
  ],
  creator: 'Diffuse.AI',
  publisher: 'Diffuse.AI',
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
    title: 'Diffuse.AI - Reviving Local News Through Smart Automation',
    description: siteDescription,
    images: [
      {
        url: '/socialcover.png',
        width: 1200,
        height: 630,
        alt: 'Diffuse.AI - Reviving Local News Through Smart Automation',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@DiffuseAI',
    creator: '@DiffuseAI',
    title: 'Diffuse.AI - Reviving Local News Through Smart Automation',
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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
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
              name: 'Diffuse.AI',
              url: siteUrl,
              logo: `${siteUrl}/icon-512.png`,
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
              name: 'Diffuse.AI',
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
