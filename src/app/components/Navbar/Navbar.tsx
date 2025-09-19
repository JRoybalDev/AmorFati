'use client'

import ContentFilters from '@/app/components/Navbar/ContentFilters';
import Link from 'next/link';
import { FaRegCopyright } from "react-icons/fa";

function Navbar() {

  const navItems = [
    { title: "Dear Diary", link: "/dear-diary" },
    { title: "Sweet Disposition", link: "/sweet-disposition" },
    { title: "Cinematic Feels", link: "/cinematic-feels" },
    { title: " Before Death", link: "/before-death" },
    { title: "Archive", link: "/archive" },
  ]

  return (
    <nav className='w-1/6 bg-BGnav px-4 py-6 text-white'>
      {/* Hero */}
      <div className="pb-4">
        <Link className="text-h1 font-semibold" href={"/"}>AMOR FATI</Link>
        <h3 className="text-h3 font-semibold">Tagline</h3>
      </div>

      <div className='border-b-6 rounded-lg border-BGdivider'/>

      {/* Filter */}
      <div className="py-4 flex flex-col gap-2">
        <h4 className='text-h2 font-semibold'>FILTER BY TYPE:</h4>
        <ContentFilters/>
      </div>

      <div className='border-b-6 rounded-lg border-BGdivider'/>

      {/* Links */}
      <div className="py-4 flex flex-col gap-4">
        {navItems.map((item, idx) => (
          <Link key={idx} className={`font-semibold text-h3 hover:text-HOVERlink duration-250`} href={item.link}>{item.title}</Link>
        ))}
      </div>

      <div className='border-b-6 rounded-lg border-BGdivider'/>

      {/* Copyright */}
      <div className='py-4 flex items-center gap-1 text-main'>
        <FaRegCopyright />
        <p>Amor Fati</p>
      </div>
    </nav>
  )
}

export default Navbar
