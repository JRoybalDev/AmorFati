'use client'

import { SignedIn } from '@clerk/clerk-react';
import { SignOutButton } from '@clerk/nextjs';
import Link from 'next/link';
import { FaRegCopyright } from "react-icons/fa";

type NavItem = {
  title: string;
  link: string;
}

type NavItems = {
  navItems: NavItem[];
}

function DesktopNavbar({ navItems }: NavItems) {

  return (
    <nav className='bg-BGnav px-4 py-6 text-TEXTmain w-full'>
      {/* Hero */}
      <div className="pb-4">
        <Link className="text-4xl font-medium font-manufacturingConsent" href={"/archive"}>Amor Fati</Link>
        <h3 className="text-h2 font-pirataOne font-normal">28 | I enjoy staring at the sky and singing to the ocean.</h3>
      </div>

      <div className='border-b-6 rounded-lg border-BGdivider' />

      {/* Filter */}
      {/* <div className="py-4 flex flex-col gap-2">
        <h4 className='text-h2 font-semibold'>FILTER BY TYPE:</h4>
        <ContentFilters />
      </div>

      <div className='border-b-6 rounded-lg border-BGdivider' /> */}

      {/* Links */}
      <div className="py-4 flex flex-col gap-4">
        {navItems.map((item, idx) => (
          <Link key={idx} className={`text-h3 font-semibold hover:text-HOVERlink duration-250`} href={item.link}>{item.title}</Link>
        ))}
      </div>

      <div className='border-b-6 rounded-lg border-BGdivider' />

      <SignedIn>
        <div className='flex flex-col gap-4 py-4'>
          <Link className='text-h3 font-semibold hover:text-HOVERlink duration-250' href={'/dashboard'}>Dashboard</Link>
          <SignOutButton>
            <p className='text-h3 font-semibold hover:cursor-pointer hover:text-HOVERlink duration-250'>Sign out</p>
          </SignOutButton>
          <div className='border-b-6 rounded-lg border-BGdivider' />
        </div>
      </SignedIn>

      {/* Copyright */}
      <div className='py-4 flex items-center gap-1 text-main'>
        <FaRegCopyright />
        <p>Amor Fati</p>
      </div>
    </nav>
  )
}

export default DesktopNavbar
