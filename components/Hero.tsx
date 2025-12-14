'use client'

import { motion } from 'framer-motion'

// Animated soundwave that transforms into text
const SoundwaveToText = () => {
  // Sample headlines that appear
  const headlines = [
    "Council Approves New Budget",
    "School Board Meeting Highlights",
    "Infrastructure Plan Advances",
  ]

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-cosmic-orange/20 rounded-full blur-[100px] -translate-y-1/2" />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-pale-blue/10 rounded-full blur-[80px] -translate-y-1/2" />
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-8">
        {/* Header text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-heading-xl md:text-display-md font-bold mb-4">
            Reviving Local News Through{' '}
            <span className="gradient-text">Smart Automation</span>
          </h1>
          <p className="text-body-md md:text-body-lg text-medium-gray max-w-2xl mx-auto">
            AI-driven workflow that transforms meeting recordings into publication-ready journalism
          </p>
        </motion.div>

        {/* Soundwave to Headlines visualization */}
        <div className="relative glass-container p-8 md:p-12">
          {/* Flow indicator */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-caption text-cosmic-orange uppercase tracking-wider font-semibold">
              Audio Input
            </div>
            <motion.div
              className="flex-1 mx-4 h-px bg-gradient-to-r from-cosmic-orange/50 via-cosmic-orange to-cosmic-orange/50"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
            <div className="text-caption text-cosmic-orange uppercase tracking-wider font-semibold">
              Article Output
            </div>
          </div>

          {/* Visualization area */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left side - Animated soundwave */}
            <div className="relative h-32 flex items-center justify-center">
              <div className="flex items-center gap-1">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-cosmic-orange to-rich-orange rounded-full"
                    initial={{ height: 8 }}
                    animate={{
                      height: [8, Math.random() * 60 + 20, 8],
                    }}
                    transition={{
                      duration: 0.8 + Math.random() * 0.4,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      delay: i * 0.05,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
              {/* Microphone icon */}
              <motion.div
                className="absolute -top-2 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cosmic-orange">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </motion.div>
            </div>

            {/* Right side - Generated headlines */}
            <div className="space-y-3">
              {headlines.map((headline, index) => (
                <motion.div
                  key={index}
                  className="glass-container-sm p-4 border-l-2 border-cosmic-orange"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 1 + index * 0.3,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic-orange mt-0.5 flex-shrink-0">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <path d="M14 2v6h6" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span className="text-body-sm text-secondary-white font-medium">
                      {headline}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Processing indicator */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="relative">
              <motion.div
                className="w-12 h-12 rounded-full border-2 border-cosmic-orange/30 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic-orange">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </motion.div>
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-full border border-cosmic-orange/50"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
        >
          <a href="#overview" className="btn-primary text-center">
            Learn More
          </a>
          <a href="#process" className="btn-secondary text-center">
            See How It Works
          </a>
        </motion.div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 grid-background opacity-30" />

      {/* Soundwave to Text Animation */}
      <div className="relative z-10 container-padding w-full">
        <SoundwaveToText />
      </div>
    </section>
  )
}
