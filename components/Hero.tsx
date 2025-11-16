'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 grid-background opacity-30" />

      {/* Hero Image - Centered and Smaller */}
      <div className="relative z-10 container-padding w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-[85%] max-w-5xl mx-auto"
        >
          <div className="relative w-full aspect-[16/9]">
            <Image
              src="/hero.png"
              alt="Diffuse.AI - AI-powered workflow automation platform for local news - Reviving Local News Through Smart Automation"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 1200px"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

