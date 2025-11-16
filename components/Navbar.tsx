'use client'

import { motion, useScroll, useMotionValueEvent } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

const navLinks = [
  { name: 'Overview', href: '#overview' },
  { name: 'Process', href: '#process' },
  { name: 'Features', href: '#features' },
  { name: 'Use Cases', href: '#use-cases' },
]

export default function Navbar() {
  const [hidden, setHidden] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  
  // Auto-hide timer ref
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentScrollRef = useRef(0)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? currentScrollRef.current
    currentScrollRef.current = latest
    
    const isScrollingDown = latest > previous
    const isScrollingUp = latest < previous
    
    // Always show at the very top
    if (latest < 50) {
      setHidden(false)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
      return
    }
    
    // Hide when scrolling down
    if (isScrollingDown && latest > 150) {
      setHidden(true)
      setMobileMenuOpen(false)
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
        hideTimeoutRef.current = null
      }
    }
    
    // Show when scrolling up (anywhere on page)
    if (isScrollingUp) {
      setHidden(false)
      
      // Clear existing timeout
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
      
      // Set new timeout to hide after 3 seconds of inactivity
      hideTimeoutRef.current = setTimeout(() => {
        // Check current scroll position and menu state
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop
        if (currentScroll > 150 && !mobileMenuOpen) {
          setHidden(true)
        }
      }, 3000)
    }
  })

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      const offset = 80 // Account for navbar height
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
    setMobileMenuOpen(false)
  }

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: '-100%' },
        }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-glass"
      >
        <div className="border-b border-white/10 bg-black/50">
          <div className="container-padding">
            <div className="max-w-7xl mx-auto flex items-center justify-between py-4">
              {/* Logo */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-lg md:text-xl font-bold hover:text-cosmic-orange transition-colors"
              >
                diffuse<span className="text-cosmic-orange">.ai</span>
              </button>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="text-body-sm text-secondary-white hover:text-cosmic-orange transition-colors"
                  >
                    {link.name}
                  </button>
                ))}
                <button className="btn-primary px-5 py-2 text-body-sm">
                  Schedule a Demo
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-secondary-white p-2"
                aria-label="Toggle menu"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {mobileMenuOpen ? (
                    <>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: mobileMenuOpen ? 1 : 0,
          height: mobileMenuOpen ? 'auto' : 0,
        }}
        transition={{ duration: 0.3 }}
        className="fixed top-[72px] left-0 right-0 z-40 md:hidden overflow-hidden"
      >
        <div className="glass-container border-0 border-b border-white/10">
          <div className="container-padding">
            <div className="max-w-7xl mx-auto py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-body-md text-secondary-white hover:text-cosmic-orange transition-colors text-left py-2"
                >
                  {link.name}
                </button>
              ))}
              <button className="btn-primary w-full py-3 text-body-sm mt-2">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

