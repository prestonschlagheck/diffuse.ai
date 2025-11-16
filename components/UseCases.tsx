'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function UseCases() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="use-cases" ref={ref} className="relative py-16 md:py-20 bg-dark-gray/30 scroll-mt-20">
      <div className="container-padding">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-20"
          >
            <span className="text-cosmic-orange text-caption uppercase tracking-wider font-semibold mb-4 block">
              In Action
            </span>
            <h2 className="text-display-sm md:text-display-md lg:text-display-lg font-bold mb-6">
              Powering <span className="gradient-text">Real Newsrooms</span>
            </h2>
            <p className="text-body-lg text-medium-gray max-w-3xl mx-auto">
              See how Diffuse is transforming local journalism, one community at a time.
            </p>
          </motion.div>

          {/* Main Use Case - Schuylkill River Press */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="glass-container p-10 md:p-14 mb-12 overflow-hidden group"
              >
                {/* Content Grid */}
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Left Content */}
                <div>
                  {/* River Press Text Logo */}
                  <h3 className="text-display-sm md:text-display-md font-bold mb-6">
                    The Schuylkill <span className="text-[#dbdbdb]">River</span><span className="text-[#3391af]">Press</span>
                  </h3>
                  <p className="text-body-md text-secondary-white mb-6 leading-relaxed">
                    Digital-first local news outlet serving the Spring-Ford area 
                    of Pennsylvania. Fully automated coverage via API integration with municipal recording systems.
                  </p>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {[
                      'Meeting recaps published within hours',
                      'Local features and community spotlights',
                      'Event coverage and announcements',
                      'Sustainable ad-supported revenue model',
                    ].map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-cosmic-orange/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-cosmic-orange">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="text-body-md text-secondary-white">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button className="bg-[#3391af] hover:bg-[#57959f] text-white px-8 py-3 rounded-glass-sm font-semibold transition-all duration-300 hover:scale-105">
                    Visit SchuylkillRiverPress.com →
                  </button>
                </div>

                {/* Right Visual */}
                <div className="relative">
                  {/* Badge - Above Image */}
                  <div className="inline-flex items-center gap-2 glass-container-sm px-4 py-2 mb-4">
                    <div className="w-2 h-2 bg-[#3391af] rounded-full animate-pulse" />
                    <span className="text-body-sm text-[#3391af] font-semibold uppercase tracking-wider">
                      Pilot Project
                    </span>
                  </div>

                  {/* Placeholder for Screenshot */}
                  <div className="glass-container aspect-[4/3] flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#3391af]/10 to-[#57959f]/10" />
                    <div className="relative z-10 text-center p-8">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 text-[#3391af]">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                      <p className="text-body-sm text-medium-gray">
                        [Screenshot Placeholder]
                        <br />
                        Schuylkill River Press Homepage
                      </p>
                    </div>
                  </div>

                  {/* Stats Overlay */}
                  <div className="absolute -bottom-4 -right-4 glass-container p-4 border-[#3391af]/20">
                    <div className="text-heading-xl font-bold text-[#3391af]">12K+</div>
                    <div className="text-caption text-medium-gray">Monthly Readers</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Additional Use Cases */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Media Outlets */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-container p-6 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-glass-sm bg-cosmic-orange/10 flex items-center justify-center mb-4 group-hover:bg-cosmic-orange/20 transition-colors duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic-orange">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </div>
              <h3 className="text-heading-md font-bold mb-2">Media Outlets</h3>
              <p className="text-body-sm text-medium-gray leading-relaxed">
                License Diffuse to augment your newsroom capabilities and expand coverage without expanding costs.
              </p>
            </motion.div>

            {/* Municipalities */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-container p-6 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-glass-sm bg-cosmic-orange/10 flex items-center justify-center mb-4 group-hover:bg-cosmic-orange/20 transition-colors duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic-orange">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3 className="text-heading-md font-bold mb-2">Municipalities</h3>
              <p className="text-body-sm text-medium-gray leading-relaxed">
                Improve transparency with auto-generated meeting summaries for your residents.
              </p>
            </motion.div>

            {/* Nonprofits */}
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="glass-container p-6 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-glass-sm bg-cosmic-orange/10 flex items-center justify-center mb-4 group-hover:bg-cosmic-orange/20 transition-colors duration-300">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic-orange">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3 className="text-heading-md font-bold mb-2">Nonprofits</h3>
              <p className="text-body-sm text-medium-gray leading-relaxed">
                Civic journalism organizations can deploy Diffuse to serve underrepresented communities.
              </p>
            </motion.div>
          </motion.div>

          {/* CTA Section - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12"
          >
            <div className="glass-container p-8 md:p-10 text-center">
              <h3 className="text-heading-xl font-bold mb-3">
                Ready to Transform Your Newsroom?
              </h3>
              <p className="text-body-md text-medium-gray mb-6 max-w-2xl mx-auto">
                See how Diffuse integrates with your workflow—schedule a demo today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="btn-primary px-6 py-3 text-body-sm">
                  Schedule a Demo
                </button>
                <button className="btn-secondary px-6 py-3 text-body-sm">
                  Contact Sales
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Accents */}
      <div className="absolute top-1/3 left-0 w-1/3 h-1/3 bg-cosmic-orange/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-1/3 right-0 w-1/3 h-1/3 bg-pale-blue/5 rounded-full blur-[150px] -z-10" />
    </section>
  )
}

