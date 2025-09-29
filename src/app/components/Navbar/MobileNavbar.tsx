'use client'

import ContentFilters from '@/app/components/Navbar/ContentFilters';
import Link from 'next/link';
import { useState } from 'react';
import { FaRegCopyright } from "react-icons/fa";

type NavItem = {
  title: string;
  link: string;
}

type NavItems = {
  navItems: NavItem[];
}

function MobileNavbar({ navItems }: NavItems) {

  const [isOpen, setOpen] = useState(false);

  return (
    <nav className=''>

    </nav>
  )
}

export default MobileNavbar

// {/* Filter */}
//       <div className="py-4 flex flex-col gap-2">
//         <h4 className='text-h2 font-semibold'>FILTER BY TYPE:</h4>
//         <ContentFilters />
//       </div>

//       <div className='border-b-6 rounded-lg border-BGdivider' />

//       {/* Links */}
//       <div className="py-4 flex flex-col gap-4">
//         {navItems.map((item, idx) => (
//           <Link key={idx} className={`font-semibold text-h3 hover:text-HOVERlink duration-250`} href={item.link}>{item.title}</Link>
//         ))}
//       </div>

//       <div className='border-b-6 rounded-lg border-BGdivider' />

//       {/* Copyright */}
//       <div className='py-4 flex items-center gap-1 text-main'>
//         <FaRegCopyright />
//         <p>Amor Fati</p>
//       </div>
