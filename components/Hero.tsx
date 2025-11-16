'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-20">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 grid-background opacity-30" />

      {/* Hero Image - Centered and 15% Smaller */}
      <div className="relative z-10 container-padding w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-6xl mx-auto"
        >
          <div className="relative w-full aspect-[16/9]">
            <Image
              src="/hero.png"
              alt="Diffuse AI Hero"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

