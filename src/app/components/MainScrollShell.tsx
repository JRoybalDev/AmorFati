'use client'

import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useRef } from 'react'

interface MainScrollShellProps {
  nav: ReactNode
  children: ReactNode
}

export default function MainScrollShell({ nav, children }: MainScrollShellProps) {
  const scrollRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ container: scrollRef })
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.25,
  })

  return (
    <div className="flex h-screen w-screen flex-col md:flex-row">
      {nav}
      <main ref={scrollRef} className="relative h-screen w-full overflow-y-scroll bg-BGpage pt-[60px] md:pt-0">
        {!prefersReducedMotion && (
          <motion.div
            aria-hidden="true"
            className="sticky top-0 z-40 h-0.5 origin-left bg-[#BE5103]"
            style={{ scaleX }}
          />
        )}
        <motion.div
          key={pathname}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
