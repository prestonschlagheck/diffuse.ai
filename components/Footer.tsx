'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      <div className="container-padding py-12">
        <div className="max-w-7xl mx-auto">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold">
                diffuse<span className="text-cosmic-orange">.ai</span>
              </h2>
              <p className="text-body-sm text-medium-gray mt-2">
                Reviving local news through smart automation
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <button className="btn-primary">
                Schedule a Demo
              </button>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <p className="text-body-sm text-medium-gray">
              © {new Date().getFullYear()} Diffuse.AI. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-body-sm text-medium-gray hover:text-cosmic-orange transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-body-sm text-medium-gray hover:text-cosmic-orange transition-colors duration-300"
              >
                Terms of Service
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1/2 bg-cosmic-orange/5 rounded-full blur-[150px] -z-10" />
    </footer>
  )
}

