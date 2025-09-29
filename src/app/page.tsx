import MobileContentFilters from './components/Mobile/MobileContentFilters';
import './globals.css'

export default function Home() {
  return (
    <div className="w-screen xl:w-5/6 bg-BGpage font-inter z-0 text-black">
      <div className='md:hidden'>
        <MobileContentFilters />
      </div>
    </div>
  );
}
