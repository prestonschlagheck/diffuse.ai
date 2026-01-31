// Comprehensive structured data schemas for SEO
export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Diffuse.AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Diffuse.AI is an AI-powered workflow automation platform that transforms local government meetings into publication-ready news articles. Our technology uses advanced transcription and natural language processing to automate local journalism while maintaining accuracy and editorial standards.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does Diffuse.AI work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Diffuse.AI follows a 4-step process: (1) Capture - Record meetings using any audio/video device, (2) Process - Our AI transcribes and analyzes the content, (3) Generate - Create factually accurate articles, (4) Publish - Connect to your frontend to auto-publish, or copy and paste. Either way, you\'re live in minutes.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is Diffuse different from using ChatGPT?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Diffuse is built for the full workflow: record, transcribe, generate, and publish. Connect to publishing frontends to auto-populate articles—no copy-paste. Designed for small teams at a fraction of the cost, with one smooth workflow instead of juggling multiple tools.',
      },
    },
    {
      '@type': 'Question',
      name: 'What technology powers Diffuse.AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Diffuse.AI is powered by GPT 5.1 API (OpenAI\'s top-tier language model), combined with custom editorial logic and automation workflows. We use API-first architecture for seamless integration with existing newsroom systems.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who can use Diffuse.AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Diffuse.AI is designed for media outlets, local newsrooms, municipalities, nonprofits, and any organization that needs to cover local government meetings and community events efficiently.',
      },
    },
    {
      '@type': 'Question',
      name: 'How accurate is the AI-generated content?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Diffuse.AI generates factually accurate, publication-ready articles using advanced AI. All content goes through human editorial review to ensure quality, accuracy, and adherence to journalistic standards.',
      },
    },
  ],
}

export const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Diffuse.AI Platform',
  description: 'AI-powered workflow automation platform that transforms local meetings into news articles. Built for scalable, tech-first journalism.',
  brand: {
    '@type': 'Brand',
    name: 'Diffuse.AI',
  },
  category: 'Software Application',
  offers: {
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    price: '0',
    priceCurrency: 'USD',
    priceValidUntil: '2026-12-31',
    url: 'https://diffuse.ai',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '1',
    bestRating: '5',
    worstRating: '1',
  },
  image: 'https://diffuse.ai/socialcover.png',
  url: 'https://diffuse.ai',
}

export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Local News Automation',
  provider: {
    '@type': 'Organization',
    name: 'Diffuse.AI',
    url: 'https://diffuse.ai',
  },
  areaServed: {
    '@type': 'Country',
    name: 'United States',
  },
  description: 'AI-driven automation that transforms local government meetings into news articles. API-first platform for modern newsrooms.',
  offers: {
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Diffuse.AI Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Meeting Transcription & Analysis',
          description: 'Automated transcription and analysis of local government meetings',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AI Article Generation',
          description: 'AI-powered generation of publication-ready news articles',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Workflow Integration',
          description: 'API-first integration with existing newsroom workflows',
        },
      },
    ],
  },
}

export const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use Diffuse.AI for Local News Automation',
  description: 'Transform local government meetings into news articles using AI automation',
  image: 'https://diffuse.ai/socialcover.png',
  totalTime: 'PT15M',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Capture',
      text: 'Record local government meetings, town halls, or community events using any audio/video device.',
      url: 'https://diffuse.ai#process',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Process',
      text: 'Diffuse.AI uses advanced transcription and natural language processing to understand context, decisions, and key quotes.',
      url: 'https://diffuse.ai#process',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Generate',
      text: 'Our editorial AI logic creates factually accurate, publication-ready news articles in minutes, not hours.',
      url: 'https://diffuse.ai#process',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Publish',
      text: 'Human editors refine and publish quickly, freeing them to focus on investigative work and community engagement.',
      url: 'https://diffuse.ai#process',
    },
  ],
}

export const videoSchema = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'Diffuse.AI Platform Demo',
  description: 'See how Diffuse.AI transforms local meetings into news articles using AI automation',
  thumbnailUrl: 'https://diffuse.ai/socialcover.png',
  uploadDate: '2024-11-01',
  contentUrl: 'https://diffuse.ai#demo',
  embedUrl: 'https://diffuse.ai#demo',
}

