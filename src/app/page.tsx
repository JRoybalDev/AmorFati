'use client'

import { useEffect } from 'react';
import './globals.css'
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/archive')
  }, [])
  return (
    <div className="w-screen md:w-9/12 bg-BGpage z-0 text-black p-6">

    </div>
  );
}
