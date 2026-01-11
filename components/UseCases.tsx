'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const individualUseTypes = [
  {
    label: 'Freelance Reporters',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    ),
  },
  {
    label: 'Podcast Creators',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    label: 'Local Bloggers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    label: 'Newsletter Writers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Video Journalists',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Civic Watchdogs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
]

export default function UseCases() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="use-cases" ref={ref} className="relative py-16 sm:py-20 md:py-24 bg-dark-gray/30 scroll-mt-20">
      <div className="container-padding">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-12 md:mb-16 px-4"
          >
            <span className="text-cosmic-orange text-xs sm:text-sm md:text-caption uppercase tracking-wider font-semibold mb-4 block">
              Built For You
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-heading-xl lg:text-display-sm font-bold mb-6">
              From Freelancers to <span className="gradient-text">News Teams</span>
            </h2>
            <p className="text-base sm:text-lg md:text-body-md text-medium-gray max-w-3xl mx-auto">
              Whether you&apos;re an independent journalist or managing a multi-publication network, Diffuse scales with you.
            </p>
          </motion.div>

          {/* Independent Contractors Panel - ORANGE themed */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <div className="glass-container p-6 sm:p-8 md:p-10 border-cosmic-orange/20 bg-cosmic-orange/5">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-block px-3 py-1 bg-cosmic-orange/20 text-cosmic-orange text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
                    For Individuals
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-secondary-white mb-4">
                    No Newsroom? <span className="text-cosmic-orange">No Problem.</span>
                  </h3>
                  <p className="text-medium-gray leading-relaxed mb-6">
                    Diffuse works just as well for independent contractors, freelance reporters, and solo content creators. 
                    You don&apos;t need an organization or team—just sign up and start creating.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    {[
                      'Start free with 3 projects—no credit card required',
                      'Upgrade to Pro ($20/mo) for 15 projects',
                      'Perfect for freelance journalists and podcasters',
                      'No organization or team account needed',
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-cosmic-orange flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm md:text-base text-secondary-white">{item}</span>
                      </div>
                    ))}
                  </div>

                  <a href="/login" className="inline-flex items-center gap-2 bg-cosmic-orange hover:bg-rich-orange text-black font-medium px-6 py-3 rounded-glass transition-colors">
                    Start Free
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>

                <div className="glass-container p-6 bg-black/30">
                  <div className="text-center mb-6">
                    <div className="text-sm text-medium-gray uppercase tracking-wider mb-2">Perfect For</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {individualUseTypes.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-secondary-white">
                        <div className="text-cosmic-orange">
                          {item.icon}
                        </div>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* News Organizations - Spring-Ford Press */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="glass-container p-6 sm:p-8 md:p-10 lg:p-14 overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-stretch">
                {/* Left Content */}
                <div>
                  <div className="inline-block px-3 py-1 bg-[#3391af]/20 text-[#3391af] text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
                    Live Example
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-heading-xl font-bold mb-4 md:mb-6">
                    <span className="text-[#dbdbdb]">Spring-Ford</span> <span className="text-[#3391af]">Press</span>
                  </h3>
                  <p className="text-base sm:text-lg md:text-body-md text-secondary-white mb-6 leading-relaxed">
                    Digital-first local news outlet serving the Spring-Ford area 
                    of Pennsylvania, powered by Diffuse.AI.
                  </p>

                  <div className="space-y-4">
                    {[
                      'AI-generated meeting coverage',
                      'Published articles within hours',
                      'Consistent local news output',
                    ].map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#3391af]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#3391af]">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="text-sm sm:text-base md:text-body-md text-secondary-white">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Visual */}
                <a 
                  href="https://springford.press" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="relative flex flex-col h-full group transition-transform duration-300 hover:scale-[1.02]"
                >
                  <div className="overflow-hidden rounded-t-glass">
                    <div className="bg-[#3391af]/90 group-hover:bg-[#57959f] px-4 py-3 flex items-center justify-center transition-colors duration-300">
                      <span className="text-sm sm:text-base md:text-body-sm font-bold text-white uppercase tracking-wider">
                        See It In Action
                      </span>
                    </div>
                  </div>

                  <div className="glass-container flex-1 flex items-center justify-center relative overflow-hidden rounded-none border-t-0 border-b-0 w-full min-h-[200px] sm:min-h-[250px]">
                    <img 
                      src="/sfpthumbnail.png" 
                      alt="Spring-Ford Press Homepage" 
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div className="overflow-hidden rounded-b-glass bg-[#3391af]/90 group-hover:bg-[#57959f] px-4 py-3 flex items-center justify-center gap-2 transition-colors duration-300 w-full">
                    <span className="text-sm sm:text-base md:text-body-md font-bold text-white">Visit springford.press</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Accents */}
      <div className="absolute top-1/3 left-0 w-1/3 h-1/3 bg-cosmic-orange/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-1/3 right-0 w-1/3 h-1/3 bg-accent-purple/5 rounded-full blur-[150px] -z-10" />
    </section>
  )
}
