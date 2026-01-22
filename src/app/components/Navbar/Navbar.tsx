import { currentUser } from '@clerk/nextjs/server';
import DesktopNavbar from './DesktopNavbar';
import MobileNavbar from './MobileNavbar';

async function Navbar() {
  const user = await currentUser()

  console.log(user)

  const defaultNavItems = [
    { title: "Dear Diary (text)", link: "/dear-diary" },
    { title: "Sweet Disposition (images)", link: "/sweet-disposition" },
    { title: "Cinematic Feels (films)", link: "/cinematic-feels" },
    { title: "Archive", link: "/archive" },
  ]

  // For future use if needed.
  // const adminNavItems = [
  //   { title: "Posts", link: "/dear-diary" },
  //   { title: "Sweet Disposition", link: "/sweet-disposition" },
  //   { title: "Cinematic Feels", link: "/cinematic-feels" },
  //   { title: "Archive", link: "/archive" },
  // ]


  return (
    <>
      <div className='md:flex hidden w-3/12'>
        <DesktopNavbar navItems={defaultNavItems} />
      </div>
      <div className='md:hidden w-screen'>
        <MobileNavbar navItems={defaultNavItems} />
      </div>
    </>
  )
}

export default Navbar
