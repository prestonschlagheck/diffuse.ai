'use client'

import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState } from 'react'

const faqs = [
  {
    question: 'What is Diffuse.AI?',
    answer: 'Diffuse.AI is an AI-powered workflow automation platform that transforms local government meetings into publication-ready news articles. Our technology uses advanced transcription and natural language processing to automate local journalism while maintaining accuracy and editorial standards.',
  },
  {
    question: 'How does Diffuse.AI work?',
    answer: 'Diffuse.AI follows a 4-step process: (1) Capture - Record meetings using any audio/video device, (2) Process - Our AI transcribes and analyzes the content, (3) Generate - Create factually accurate articles, (4) Publish - Human editors refine and publish quickly. The entire process takes minutes instead of hours.',
  },
  {
    question: 'Can I use Diffuse as an independent contractor?',
    answer: 'Absolutely! Diffuse works perfectly for independent journalists, freelancers, and solo content creators. You don\'t need an organization or team account. Just sign up for a free account to get started with 3 projects, or upgrade to Pro ($20/mo) for 15 projects.',
  },
  {
    question: 'How do I integrate with my existing CMS?',
    answer: 'Enterprise accounts can connect their Diffuse accounts to branch sites like WordPress. Admins on your publication site can link their Diffuse credentials and import AI-written articles directly into your CMS with one click. Contact our enterprise team for custom integration options.',
  },
  {
    question: 'What\'s included in the free tier?',
    answer: 'The free tier includes up to 3 projects, full AI article generation, transcription, audio upload support, and basic support. No credit card required. It\'s perfect for trying out Diffuse before committing to a paid plan.',
  },
  {
    question: 'How accurate is the AI-generated content?',
    answer: 'Diffuse.AI generates factually accurate, publication-ready articles using advanced AI. Our system is specifically trained for journalism standards. However, we always recommend a quick human review before publishing to catch any edge cases and add local context.',
  },
  {
    question: 'What audio formats are supported?',
    answer: 'Diffuse supports all major audio and video formats including MP3, WAV, M4A, MP4, MOV, and more. You can also record directly within the app using your device\'s microphone.',
  },
  {
    question: 'How is team collaboration handled?',
    answer: 'Enterprise accounts support full team collaboration with role-based access. Owners have full control, Admins can manage members and projects, Editors can create and modify content, and Viewers have read-only access. Teams join via invite codes for easy onboarding.',
  },
]

export default function FAQ() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [openIndex, setOpenIndex] = useState<number | null>(0)

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
    <section id="faq" ref={ref} className="relative py-16 sm:py-20 md:py-24 scroll-mt-20">
      <div className="container-padding">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="max-w-4xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-12 px-4">
            <span className="text-cosmic-orange text-xs sm:text-sm md:text-caption uppercase tracking-wider font-semibold mb-3 block">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-heading-xl lg:text-display-sm font-bold mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
            <p className="text-base sm:text-lg md:text-body-md text-medium-gray max-w-2xl mx-auto">
              Everything you need to know about Diffuse.AI
            </p>
          </motion.div>

          {/* FAQ Items */}
          <motion.div variants={itemVariants} className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="glass-container overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-base md:text-lg font-medium text-secondary-white pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <svg className="w-5 h-5 text-cosmic-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-medium-gray leading-relaxed border-t border-white/10 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>

          {/* Still have questions */}
          <motion.div
            variants={itemVariants}
            className="mt-12 glass-container p-6 md:p-8 text-center"
          >
            <h3 className="text-xl font-bold text-secondary-white mb-2">
              Still have questions?
            </h3>
            <p className="text-medium-gray mb-4">
              We&apos;re here to help. Reach out to our team anytime.
            </p>
            <a
              href="mailto:support@diffuse.ai"
              className="inline-flex items-center gap-2 text-cosmic-orange hover:text-rich-orange transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@diffuse.ai
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Background Accent */}
      <div className="absolute bottom-1/3 right-0 w-1/4 h-1/4 bg-cosmic-orange/5 rounded-full blur-[150px] -z-10" />
    </section>
  )
}

