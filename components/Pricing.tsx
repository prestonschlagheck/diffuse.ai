'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState } from 'react'

const individualPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    projects: 3,
    description: 'Perfect for trying out Diffuse',
    features: [
      'Up to 3 projects',
      'AI article generation',
      'Transcription included',
      'Audio upload support',
    ],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/month',
    projects: 15,
    description: 'For independent journalists',
    features: [
      'Up to 15 projects',
      'Everything in Free',
      'Priority transcription',
      'In-app recording',
    ],
    cta: 'Get Pro',
    highlight: true,
    badge: 'Most Popular',
  },
  {
    name: 'Pro Max',
    price: '$60',
    period: '/month',
    projects: 40,
    description: 'For power users',
    features: [
      'Up to 40 projects',
      'Everything in Pro',
      'Faster processing',
      'Priority support',
    ],
    cta: 'Get Pro Max',
    highlight: false,
  },
]

const enterprisePlans = [
  {
    name: 'Enterprise Pro',
    price: '$100',
    period: '/month',
    projects: '50',
    description: 'For small newsrooms',
    features: [
      'Up to 50 projects',
      'Team collaboration',
      'Role-based access',
      'CMS integration',
      'Dedicated support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Enterprise Pro Max',
    price: '$500',
    period: '/month',
    projects: 'Unlimited',
    description: 'For large organizations',
    features: [
      'Unlimited projects',
      'Everything in Enterprise Pro',
      'Multi-publication support',
      'Custom integrations',
      'Account manager',
    ],
    cta: 'Contact Sales',
  },
]

export default function Pricing() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [showEnterprise, setShowEnterprise] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    <section id="pricing" ref={ref} className="relative py-16 sm:py-20 md:py-24 scroll-mt-20 bg-dark-gray/30">
      <div className="container-padding">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-12 px-4">
            <span className={`text-xs sm:text-sm md:text-caption uppercase tracking-wider font-semibold mb-3 block ${showEnterprise ? 'text-accent-purple' : 'text-cosmic-orange'}`}>
              Simple Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-heading-xl lg:text-display-sm font-bold mb-4">
              Start Free, <span className={showEnterprise ? 'text-accent-purple' : 'gradient-text'}>Scale As You Grow</span>
            </h2>
            <p className="text-base sm:text-lg md:text-body-md text-medium-gray max-w-2xl mx-auto mb-8">
              No hidden fees. No credit card required to start.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-1 glass-container px-1.5 py-1.5">
              <button
                onClick={() => setShowEnterprise(false)}
                className={`px-4 py-2 rounded-glass text-sm font-medium transition-all ${
                  !showEnterprise
                    ? 'bg-cosmic-orange text-black'
                    : 'text-medium-gray hover:text-secondary-white'
                }`}
              >
                Individual
              </button>
              <button
                onClick={() => setShowEnterprise(true)}
                className={`px-4 py-2 rounded-glass text-sm font-medium transition-all ${
                  showEnterprise
                    ? 'bg-accent-purple text-black'
                    : 'text-medium-gray hover:text-secondary-white'
                }`}
              >
                Enterprise
              </button>
            </div>
          </motion.div>

          {/* Individual Plans */}
          {!showEnterprise && (
            <motion.div
              variants={itemVariants}
              className="grid md:grid-cols-3 gap-6"
            >
              {individualPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`glass-container p-6 md:p-8 relative ${
                    plan.highlight
                      ? 'border-cosmic-orange/50 bg-cosmic-orange/5'
                      : ''
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cosmic-orange text-black text-xs font-bold rounded-full">
                      {plan.badge}
                    </div>
                  )}

                  <h3 className="text-xl md:text-2xl font-bold text-secondary-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-medium-gray mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-3xl md:text-4xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-medium-gray text-sm">{plan.period}</span>
                  </div>

                  <div className="mb-6 pb-6 border-b border-white/10">
                    <span className="text-cosmic-orange font-semibold">{plan.projects} projects</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-medium-gray">
                        <svg className="w-5 h-5 text-cosmic-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/login"
                    className={`block w-full py-3 text-center font-medium rounded-glass transition-all ${
                      plan.highlight
                        ? 'bg-cosmic-orange hover:bg-rich-orange text-black'
                        : 'bg-white/10 hover:bg-white/20 text-secondary-white'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </motion.div>
          )}

          {/* Enterprise Plans */}
          {showEnterprise && (
            <motion.div
              variants={itemVariants}
              className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            >
              {enterprisePlans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`glass-container p-6 md:p-8 ${index === 1 ? 'border-accent-purple/50 bg-accent-purple/5' : ''}`}
                >
                  <h3 className="text-xl md:text-2xl font-bold text-secondary-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-medium-gray mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-3xl md:text-4xl font-bold text-accent-purple">{plan.price}</span>
                    <span className="text-medium-gray text-sm">{plan.period}</span>
                  </div>

                  <div className="mb-6 pb-6 border-b border-white/10">
                    <span className="text-accent-purple font-semibold">{plan.projects} projects</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-medium-gray">
                        <svg className="w-5 h-5 text-accent-purple flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={plan.name === 'Enterprise Pro Max' ? 'mailto:enterprise@diffuse.ai' : '/login'}
                    className={`block w-full py-3 text-center font-medium rounded-glass transition-all ${
                      index === 1
                        ? 'bg-accent-purple hover:bg-accent-purple/80 text-black'
                        : 'bg-white/10 hover:bg-white/20 text-secondary-white'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Background Accents */}
      <div className={`absolute top-1/3 left-0 w-1/3 h-1/3 rounded-full blur-[150px] -z-10 ${showEnterprise ? 'bg-accent-purple/5' : 'bg-cosmic-orange/5'}`} />
    </section>
  )
}
