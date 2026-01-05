'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function WhyDiffuse() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  return (
    <section id="why-diffuse" ref={ref} className="relative py-16 sm:py-20 md:py-24 scroll-mt-20 bg-dark-gray/30">
      <div className="container-padding">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16 px-4">
            <span className="text-cosmic-orange text-xs sm:text-sm md:text-caption uppercase tracking-wider font-semibold mb-3 block">
              Why Choose Diffuse?
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-heading-xl lg:text-display-sm font-bold mb-4">
              More Than Just <span className="gradient-text">Another AI Tool</span>
            </h2>
            <p className="text-base sm:text-lg md:text-body-md text-medium-gray max-w-3xl mx-auto">
              ChatGPT can write. Diffuse <span className="text-secondary-white font-medium">automates your entire newsroom</span>—from 
              recording to publication, without you lifting a finger.
            </p>
          </motion.div>

          {/* Main Comparison */}
          <motion.div variants={itemVariants} className="glass-container p-6 md:p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Without Diffuse */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-secondary-white">Using Generic LLMs</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Manually transcribe recordings',
                    'Copy-paste into ChatGPT repeatedly',
                    'Format and edit each article by hand',
                    'Manually upload to your CMS',
                    'Hours of work per article',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-medium-gray text-sm md:text-base">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* With Diffuse */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-cosmic-orange/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-secondary-white">Using Diffuse.AI</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    'Drop in a recording, walk away',
                    'Automatic transcription & analysis',
                    'AI structures article for you',
                    'One-click publish to your site',
                    'Minutes, not hours',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-secondary-white text-sm md:text-base">
                      <svg className="w-5 h-5 text-cosmic-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Value Props */}
          <motion.div variants={itemVariants} className="grid sm:grid-cols-3 gap-4 md:gap-6 mb-8">
            {/* One Person Newsroom */}
            <div className="glass-container p-6 text-center group hover:bg-white/5 transition-colors duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cosmic-orange/20 to-rich-orange/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-secondary-white mb-2">One-Person Newsroom</h3>
              <p className="text-sm md:text-base text-medium-gray">
                Run an entire local news operation solo. No staff required—just you and Diffuse.
              </p>
            </div>

            {/* Hyper-Local Focus */}
            <div className="glass-container p-6 text-center group hover:bg-white/5 transition-colors duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cosmic-orange/20 to-rich-orange/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-secondary-white mb-2">Hyper-Local Coverage</h3>
              <p className="text-sm md:text-base text-medium-gray">
                Cover every school board meeting, every township vote. Stories that matter to your community.
              </p>
            </div>

            {/* Sustainable Model */}
            <div className="glass-container p-6 text-center group hover:bg-white/5 transition-colors duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cosmic-orange/20 to-rich-orange/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-secondary-white mb-2">Finally Sustainable</h3>
              <p className="text-sm md:text-base text-medium-gray">
                Cut costs by 90%. Make local journalism economically viable again.
              </p>
            </div>
          </motion.div>

          {/* Bottom CTA Section */}
          <motion.div variants={itemVariants} className="glass-container p-6 md:p-8 text-center">
            <h3 className="text-xl md:text-2xl font-bold text-secondary-white mb-3">
              Ready to revive local news in your community?
            </h3>
            <p className="text-medium-gray text-sm md:text-base mb-6 max-w-2xl mx-auto">
              Join the waitlist and be among the first to bring automated local journalism to your town.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="/login" 
                className="btn-primary text-center text-sm sm:text-base py-3 px-8"
              >
                Get Started Free
              </a>
              <a 
                href="#use-cases" 
                className="btn-secondary text-center text-sm sm:text-base py-3 px-8"
              >
                See It In Action
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Accents */}
      <div className="absolute top-1/4 right-0 w-1/4 h-1/4 bg-cosmic-orange/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-1/4 left-0 w-1/4 h-1/4 bg-dusty-blue/5 rounded-full blur-[150px] -z-10" />
    </section>
  )
}

