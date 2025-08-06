import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'StockAmplify - AI-Powered Stock Analysis & Portfolio Management',
    short_name: 'StockAmplify',
    description: 'Transform your investment strategy with AI-powered stock analysis, real-time portfolio tracking, and smart market insights.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#3b82f6',
    orientation: 'portrait',
    scope: '/',
    lang: 'en-US',
    categories: ['finance', 'business', 'productivity'],
    icons: [
      {
        src: '/logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    screenshots: [
      {
        src: '/logo.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide'
      },
      {
        src: '/logo.png',
        sizes: '640x1136',
        type: 'image/png',
        form_factor: 'narrow'
      }
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'View your portfolio dashboard',
        url: '/dashboard',
        icons: [{ src: '/logo.png', sizes: '96x96' }]
      },
      {
        name: 'Portfolio',
        short_name: 'Portfolio',
        description: 'Manage your stock portfolio',
        url: '/portfolio',
        icons: [{ src: '/logo.png', sizes: '96x96' }]
      },
      {
        name: 'News',
        short_name: 'News',
        description: 'Latest stock market news',
        url: '/news',
        icons: [{ src: '/logo.png', sizes: '96x96' }]
      }
    ]
  }
}
