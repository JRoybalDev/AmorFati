'use client'

import Link from 'next/link';
import { useState } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { FaRegCopyright } from "react-icons/fa";
import { motion, AnimatePresence, easeInOut } from "framer-motion";


type NavItem = {
  title: string;
  link: string;
}

type NavItems = {
  navItems: NavItem[];
}

const menuVariants = {
  initial: {
    height: 0,
    opacity: 0
  },
  animate: {
    height: 'calc(100vh - 60px)',
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: easeInOut
    }
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: easeInOut
    }
  }
};

function MobileNavbar({ navItems }: NavItems) {

  const [isOpen, setOpen] = useState(false);

  return (
    <nav className='sticky top-0 bg-BGnav px-4 py-4 text-white w-screen z-50'>
      {/* Closed Nav (Header) */}
      <div className='flex justify-between items-center'>
        <Link className="text-h1Mob font-semibold" href={"/"} onClick={() => setOpen(false)}>AMOR FATI</Link>
        <AiOutlineMenu className='h-5 w-5 cursor-pointer' onClick={() => setOpen((prev) => !prev)} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className='overflow-hidden absolute top-[60px] left-0 right-0 bg-BGnav px-4 pb-10'
            variants={menuVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className='border-b-6 rounded-lg border-BGdivider' />

            {/* Links */}
            <div className="py-4 flex flex-col gap-4">
              {navItems.map((item, idx) => (
                <Link key={idx} className={`font-semibold text-h3 hover:text-HOVERlink duration-250`} href={item.link} onClick={() => setOpen(false)}>{item.title}</Link>
              ))}
            </div>

            <div className='border-b-6 rounded-lg border-BGdivider' />

            {/* Copyright */}
            <div className='py-4 flex items-center gap-1 text-main'>
              <FaRegCopyright />
              <p>Amor Fati</p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default MobileNavbar
