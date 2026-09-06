import type { MetadataRoute } from 'next'
import { siteDescription, siteName, siteShortDescription } from '@/lib/content'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: `${siteName}: ${siteShortDescription}`,
    short_name: siteName,
    description: siteDescription,
    lang: 'pt-BR',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#0b1b33',
    categories: ['news', 'education', 'government'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Votações', url: '/votings/' },
      { name: 'Deputados', url: '/politicians/' },
      { name: 'Senadores', url: '/senators/' },
      { name: 'Indicadores', url: '/indicators/' },
    ],
  }
}
