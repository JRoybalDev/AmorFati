'use client'

import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';

function Navbar() {

  const navItems = [
    { title: "Dear Diary", link: "/dear-diary" },
    { title: "Sweet Disposition", link: "/sweet-disposition" },
    { title: "Cinematic Feels", link: "/cinematic-feels" },
    { title: " Before Death", link: "/before-death" },
    { title: "Archive", link: "/archive" },
  ]

  return (
    <>
      <div className='lg:flex hidden w-1/6'>
        <DesktopNavbar navItems={navItems}/>
      </div>
      <div className='lg:hidden w-screen'>
        <MobileNavbar navItems={navItems}/>
      </div>
    </>
  )
}

export default Navbar
