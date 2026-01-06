'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const roles = [
  {
    name: 'Owner',
    color: 'purple',
    description: 'Full control over organization settings and billing',
  },
  {
    name: 'Admin',
    color: 'purple',
    description: 'Manage members, projects, and integrations',
  },
  {
    name: 'Editor',
    color: 'blue',
    description: 'Create and edit projects, manage content',
  },
  {
    name: 'Viewer',
    color: 'gray',
    description: 'Read-only access to shared projects',
  },
]

const orgFeatures = [
  {
    feature: 'Invite codes for easy team onboarding',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    feature: 'Share projects across your organization',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
  {
    feature: 'Centralized billing & management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    feature: 'Transfer ownership as needed',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    feature: 'Activity tracking & audit logs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
]

export default function Enterprise() {
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
    <section id="enterprise" ref={ref} className="relative py-16 sm:py-20 md:py-24 scroll-mt-20">
      <div className="container-padding">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16 px-4">
            <span className="text-accent-purple text-xs sm:text-sm md:text-caption uppercase tracking-wider font-semibold mb-3 block">
              Enterprise Solutions
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-heading-xl lg:text-display-sm font-bold mb-4">
              Scale Across <span className="text-accent-purple">Multiple Publications</span>
            </h2>
            <p className="text-base sm:text-lg md:text-body-md text-medium-gray max-w-3xl mx-auto">
              Enterprise accounts enable seamless integration between Diffuse and your branch sites. 
              Manage teams, share projects, and publish content across your entire network.
            </p>
          </motion.div>

          {/* Integration Flow Diagram */}
          <motion.div variants={itemVariants} className="glass-container p-6 md:p-8 mb-8 border-accent-purple/20">
            <h3 className="text-xl md:text-2xl font-bold text-secondary-white mb-6 text-center">
              Branch Site Integration
            </h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              {/* Step 1: Diffuse Dashboard */}
              <div className="glass-container p-4 md:p-6 text-center flex-1 max-w-xs">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent-purple/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-secondary-white mb-1">Diffuse Dashboard</h4>
                <p className="text-sm text-medium-gray">Create & generate articles</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:block">
                <svg className="w-8 h-8 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="md:hidden">
                <svg className="w-8 h-8 text-accent-purple transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* Step 2: API Connection */}
              <div className="glass-container p-4 md:p-6 text-center flex-1 max-w-xs border-accent-purple/30 bg-accent-purple/5">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent-purple/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-bold text-accent-purple mb-1">Connect Account</h4>
                <p className="text-sm text-medium-gray">Link Diffuse to your CMS</p>
              </div>

              {/* Arrow */}
              <div className="hidden md:block">
                <svg className="w-8 h-8 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="md:hidden">
                <svg className="w-8 h-8 text-accent-purple transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* Step 3: Branch Site */}
              <div className="glass-container p-4 md:p-6 text-center flex-1 max-w-xs">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-accent-purple/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h4 className="font-bold text-accent-purple mb-1">Branch Sites</h4>
                <p className="text-sm text-medium-gray">One-click import to publish</p>
              </div>
            </div>
          </motion.div>

          {/* Team Roles */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Role Cards */}
            <div className="glass-container p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-secondary-white mb-6">
                Role-Based Access Control
              </h3>
              <div className="space-y-4">
                {roles.map((role) => {
                  const colorClasses = {
                    purple: 'bg-accent-purple/20 text-accent-purple border-accent-purple/30',
                    orange: 'bg-cosmic-orange/20 text-cosmic-orange border-cosmic-orange/30',
                    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                    gray: 'bg-medium-gray/20 text-medium-gray border-medium-gray/30',
                  }
                  return (
                    <div key={role.name} className="flex items-center gap-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${colorClasses[role.color as keyof typeof colorClasses]}`}>
                        {role.name}
                      </span>
                      <span className="text-sm text-medium-gray">{role.description}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Organization Features */}
            <div className="glass-container p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold text-secondary-white mb-6">
                Organization Features
              </h3>
              <div className="space-y-4">
                {orgFeatures.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-accent-purple">
                      {item.icon}
                    </div>
                    <span className="text-sm md:text-base text-secondary-white">{item.feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Enterprise CTA */}
          <motion.div
            variants={itemVariants}
            className="glass-container p-6 md:p-8 text-center border-accent-purple/20 bg-accent-purple/5"
          >
            <h3 className="text-xl md:text-2xl font-bold text-secondary-white mb-3">
              Ready to Scale Your Newsroom?
            </h3>
            <p className="text-medium-gray mb-6 max-w-2xl mx-auto">
              Enterprise Pro starts at $100/month for 50 projects. Enterprise Pro Max offers unlimited 
              projects for $500/month.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="#pricing" 
                className="inline-flex items-center justify-center gap-2 bg-accent-purple hover:bg-accent-purple/80 text-black font-medium px-8 py-3 rounded-glass transition-colors"
              >
                View Pricing
              </a>
              <a 
                href="mailto:enterprise@diffuse.ai" 
                className="btn-secondary text-center text-sm sm:text-base py-3 px-8"
              >
                Contact Sales
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Accents */}
      <div className="absolute top-1/2 right-0 w-1/4 h-1/4 bg-accent-purple/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-1/4 left-0 w-1/4 h-1/4 bg-accent-purple/5 rounded-full blur-[150px] -z-10" />
    </section>
  )
}
