'use client'

import { useRef, useEffect, useState } from 'react'

const features = [
  {
    title: 'Advanced Transcription',
    description: 'Speaker ID, timestamps, context awareness',
  },
  {
    title: 'Smart Summarization',
    description: 'Key decisions, votes, discussion points',
  },
  {
    title: 'Editorial Logic',
    description: 'Journalistic standards, factual accuracy',
  },
  {
    title: 'Quote Extraction',
    description: 'Auto-identify important quotes',
  },
  {
    title: 'Multi-Format Output',
    description: 'Articles, summaries, social posts',
  },
  {
    title: 'Human-in-the-Loop',
    description: 'Editor workflow for review',
  },
  {
    title: 'Seamless Integration',
    description: 'CMS, publishing platforms',
  },
  {
    title: 'Scalable Infrastructure',
    description: 'Multiple meetings simultaneously',
  },
]

export default function FeaturesMarquee() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [contentWidth, setContentWidth] = useState(0)

  // Calculate the actual width of one set of features
  useEffect(() => {
    if (containerRef.current) {
      const firstSet = containerRef.current.querySelector('.feature-set')
      if (firstSet) {
        setContentWidth(firstSet.scrollWidth)
      }
    }
  }, [])

  // Duplicate features multiple times for seamless loop
  const allFeatures = [...features, ...features, ...features, ...features]

  return (
    <div className="relative overflow-hidden py-12">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      {/* Scrolling container using CSS animation for smoother loop */}
      <div
        ref={containerRef}
        className="flex marquee-scroll"
        style={{
          '--marquee-duration': '40s',
        } as React.CSSProperties}
      >
        <div className="flex gap-8 feature-set animate-marquee">
          {features.map((feature, index) => (
            <div
              key={`feature-a-${index}`}
              className="glass-container flex-shrink-0 w-80 overflow-hidden group hover:bg-white/10 transition-colors duration-300"
            >
              <div className="bg-cosmic-orange/90 px-4 py-3 flex items-center justify-center">
                <h3 className="text-body-md font-bold text-black">
                  {feature.title}
                </h3>
              </div>
              <div className="p-5">
                <p className="text-body-sm text-medium-gray leading-relaxed text-center">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-6 feature-set animate-marquee" aria-hidden="true">
          {features.map((feature, index) => (
            <div
              key={`feature-b-${index}`}
              className="glass-container flex-shrink-0 w-80 overflow-hidden group hover:bg-white/10 transition-colors duration-300"
            >
              <div className="bg-cosmic-orange/90 px-4 py-3 flex items-center justify-center">
                <h3 className="text-body-md font-bold text-black">
                  {feature.title}
                </h3>
              </div>
              <div className="p-5">
                <p className="text-body-sm text-medium-gray leading-relaxed text-center">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        
        .marquee-scroll:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
