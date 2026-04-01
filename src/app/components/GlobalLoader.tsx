'use client'

import React from 'react'
import { PuffLoader } from 'react-spinners'

export default function GlobalLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full py-20 animate-in fade-in duration-700">
      <PuffLoader color="#BE5103" speedMultiplier={.4} size={100}/>
      <p className="mt-8 text-xs font-bold text-[#9B4000]/40 uppercase tracking-[0.3em] font-sans animate-pulse">
        Loading Content
      </p>
    </div>
  )
}
