'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const stats = [
  { value: '50+', label: 'Local Newsrooms' },
  { value: '10,000+', label: 'Articles Generated' },
  { value: '94%', label: 'Time Savings' },
  { value: '<5min', label: 'Per Article' },
]

export default function SocialProofBar() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <section ref={ref} className="relative py-8 md:py-12 border-y border-white/5 bg-dark-gray/30">
      <div className="container-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Trust headline */}
          <p className="text-center text-xs sm:text-sm text-medium-gray uppercase tracking-widest mb-6 md:mb-8">
            Trusted by newsrooms across the country
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl md:text-display-sm font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-medium-gray">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Partner mention */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-white/5"
          >
            <span className="text-xs sm:text-sm text-medium-gray">Powering</span>
            <span className="text-sm sm:text-base font-semibold">
              <span className="text-secondary-white">Spring-Ford</span>{' '}
              <span className="text-[#3391af]">Press</span>
            </span>
            <span className="text-xs sm:text-sm text-medium-gray">& more</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

