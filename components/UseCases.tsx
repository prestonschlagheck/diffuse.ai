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
            <h2 className="text-heading-xl font-bold mb-6">
              Powering <span className="gradient-text">Real Newsrooms</span>
            </h2>
            <p className="text-body-md text-medium-gray">
              Transforming local journalism one community at a time
            </p>
          </motion.div>

          {/* Main Use Case - Schuylkill River Press */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
              <motion.div
                className="glass-container p-10 md:p-14 mb-12 overflow-hidden"
              >
                {/* Content Grid */}
                <div className="grid lg:grid-cols-2 gap-12 items-stretch">
                {/* Left Content */}
                <div>
                  {/* River Press Text Logo */}
                  <h3 className="text-heading-xl font-bold mb-6">
                    <span className="text-[#dbdbdb]">River</span><span className="text-[#3391af]">Press</span>
                  </h3>
                  <p className="text-body-md text-secondary-white mb-6 leading-relaxed">
                    Digital-first local news outlet serving the Spring-Ford area 
                    of Pennsylvania. Fully automated coverage via API integration with municipal recording systems.
                  </p>

                  {/* Features */}
                  <div className="space-y-4">
                    {[
                      'Meeting recaps published within hours',
                      'Local features and community spotlights',
                      'Event coverage and announcements',
                      'Sustainable ad-supported revenue model',
                    ].map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#3391af]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[#3391af]">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span className="text-body-md text-secondary-white">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Visual */}
                <div className="relative flex flex-col h-full">
                  {/* Badge - Above Image */}
                  <div className="overflow-hidden rounded-t-glass">
                    <div className="bg-[#3391af]/90 px-4 py-3 flex items-center justify-center">
                      <span className="text-body-sm font-bold text-white uppercase tracking-wider">
                        Pilot Partner
                      </span>
                    </div>
                  </div>

                  {/* Placeholder for Screenshot - Clickable */}
                  <button className="glass-container flex-1 flex items-center justify-center relative overflow-hidden rounded-none border-t-0 border-b-0 w-full hover:bg-white/5 transition-colors duration-300">
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
                  </button>

                  {/* Visit Button - Below Image */}
                  <button className="overflow-hidden rounded-b-glass bg-[#3391af]/90 hover:bg-[#57959f] px-4 py-3 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 w-full">
                    <span className="text-body-md font-bold text-white">Visit RiverPress.com</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
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
            <div className="glass-container overflow-hidden group cursor-pointer hover:bg-white/10 transition-colors duration-300">
              <div className="bg-cosmic-orange/90 px-4 py-3 flex items-center justify-center">
                <h3 className="text-body-md font-bold text-black">Media Outlets</h3>
              </div>
              <div className="p-5">
                <p className="text-body-sm text-medium-gray leading-relaxed text-center">
                  License Diffuse.AI to augment your newsroom capabilities
                </p>
              </div>
            </div>

            {/* Municipalities */}
            <div className="glass-container overflow-hidden group cursor-pointer hover:bg-white/10 transition-colors duration-300">
              <div className="bg-cosmic-orange/90 px-4 py-3 flex items-center justify-center">
                <h3 className="text-body-md font-bold text-black">Municipalities</h3>
              </div>
              <div className="p-5">
                <p className="text-body-sm text-medium-gray leading-relaxed text-center">
                  Improve transparency with auto-generated summaries
                </p>
              </div>
            </div>

            {/* Nonprofits */}
            <div className="glass-container overflow-hidden group cursor-pointer hover:bg-white/10 transition-colors duration-300">
              <div className="bg-cosmic-orange/90 px-4 py-3 flex items-center justify-center">
                <h3 className="text-body-md font-bold text-black">Nonprofits</h3>
              </div>
              <div className="p-5">
                <p className="text-body-sm text-medium-gray leading-relaxed text-center">
                  Deploy Diffuse.AI to serve underrepresented communities
                </p>
              </div>
            </div>
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
                See how Diffuse.AI integrates with your workflow—schedule a demo today.
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

