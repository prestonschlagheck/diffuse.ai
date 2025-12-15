'use client'

import { useEffect, useRef } from 'react'

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

const FeatureCard = ({ feature }: { feature: typeof features[0] }) => (
  <div className="glass-container flex-shrink-0 w-72 sm:w-80 overflow-hidden group hover:bg-white/10 transition-colors duration-300">
    <div className="bg-cosmic-orange/90 px-4 py-3 flex items-center justify-center">
      <h3 className="text-base sm:text-lg md:text-body-md font-bold text-black">
        {feature.title}
      </h3>
    </div>
    <div className="p-5">
      <p className="text-sm sm:text-base md:text-body-sm text-medium-gray leading-relaxed text-center">
        {feature.description}
      </p>
    </div>
  </div>
)

export default function FeaturesMarquee() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const positionRef = useRef(0)
  const isPausedRef = useRef(false)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const firstChild = scroller.firstElementChild as HTMLElement
    if (!firstChild) return

    // Calculate the width of one complete set
    const scrollWidth = firstChild.offsetWidth

    // Speed in pixels per frame (60fps) - adjust this value to change speed
    const speed = 2 // Increased from 1 for faster scrolling

    const animate = () => {
      if (!isPausedRef.current && scroller) {
        positionRef.current -= speed
        
        // Reset position when we've scrolled one full set width
        if (Math.abs(positionRef.current) >= scrollWidth) {
          positionRef.current = 0
        }
        
        scroller.style.transform = `translateX(${positionRef.current}px)`
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    isPausedRef.current = true
  }

  const handleMouseLeave = () => {
    isPausedRef.current = false
  }

  return (
    <div className="relative overflow-hidden py-8 md:py-12">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-32 md:w-48 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-32 md:w-48 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      {/* Scrolling container */}
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          ref={scrollerRef}
          className="flex gap-6 md:gap-8"
          style={{ willChange: 'transform' }}
        >
          {/* Render 3 sets for seamless infinite scroll */}
          {[...Array(3)].map((_, setIndex) => (
            <div key={setIndex} className="flex gap-6 md:gap-8 flex-shrink-0" aria-hidden={setIndex > 0}>
              {features.map((feature, index) => (
                <FeatureCard key={`${setIndex}-${index}`} feature={feature} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
