'use client'

import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import WhyDiffuse from '@/components/WhyDiffuse'
import UseCases from '@/components/UseCases'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      {/* Structured Data - Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://diffuse.ai',
              },
            ],
          }),
        }}
      />
      
      <Navbar />
      <main className="relative overflow-hidden">
        <Hero />
        <About />
        <WhyDiffuse />
        <UseCases />
        <Footer />
      </main>
    </>
  )
}
