import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Amor Fati',
    short_name: 'Amor Fati',
    description: 'Welcome to a world away from superficial: one with raw insights and emotions. This is for the bitter and the sweet.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF5D6',
    theme_color: '#BE5103',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}