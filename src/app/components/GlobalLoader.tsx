'use client'

import { motion, useReducedMotion } from 'framer-motion'

export default function GlobalLoader() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="flex min-h-[400px] w-full flex-col items-center justify-center py-20"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="h-[100px] w-[100px] rounded-full border-4 border-[#BE5103]/15 border-t-[#BE5103]"
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 1.1, ease: 'linear', repeat: Infinity }}
      />
      <motion.p
        className="mt-8 text-xs font-bold text-[#9B4000]/40 uppercase tracking-[0.3em] font-sans"
        initial={prefersReducedMotion ? false : { opacity: 0.35 }}
        animate={prefersReducedMotion ? undefined : { opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
      >
        Loading Content
      </motion.p>
    </motion.div>
  )
}
