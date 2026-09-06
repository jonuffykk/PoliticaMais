import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import './globals.css'
import { Shell } from '@/components/shell'
import { buildInfo, repoUrl, siteDescription, siteName, siteShortDescription, siteUrl } from '@/lib/content'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${siteName}: ${siteShortDescription}`, template: `%s · ${siteName}` },
  description: siteDescription,
  applicationName: siteName,
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: siteName, statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName,
    url: siteUrl,
    title: `${siteName}: ${siteShortDescription}`,
    description: siteDescription,
    images: [{ url: '/og.png', width: 1200, height: 630, alt: siteName }],
  },
  twitter: { card: 'summary_large_image', title: siteName, description: siteDescription, images: ['/og.png'] },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
}

const themeScript = `try{var p=localStorage.getItem('pm:theme');var d=p==='dark'||(p!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.dataset.theme=d?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}`

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://www.camara.leg.br https://www.senado.leg.br https://legis.senado.leg.br",
  "font-src 'self'",
  "connect-src 'self' https://dadosabertos.camara.leg.br https://api.bcb.gov.br https://legis.senado.leg.br",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ')

const inlineCsp = process.env.NODE_ENV === 'production' ? csp : null

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  logo: `${siteUrl}/icons/icon-512.png`,
  sameAs: [repoUrl],
}

const footerLinks = [
  { href: '/mais/', label: 'Todas as seções' },
  { href: '/docs/methodology/', label: 'Metodologia' },
  { href: '/docs/data/', label: 'API e dados' },
  { href: '/docs/privacy/', label: 'Privacidade' },
  { href: '/docs/terms/', label: 'Termos' },
  { href: '/download/', label: 'Baixar o app' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {inlineCsp ? <meta httpEquiv="Content-Security-Policy" content={inlineCsp} /> : null}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 "
        >
          Ir para o conteúdo
        </a>

        <Shell>{children}</Shell>

        <footer className="hidden border-t border-border md:block" data-print="hide">
          <div className="container-page flex flex-wrap items-center gap-x-5 gap-y-2 py-5 text-xs text-muted-foreground">
            <nav aria-label="Rodapé">
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <p className="ml-auto">
              Versão {buildInfo.version} · AGPL-3.0 e CC BY-SA 4.0 ·{' '}
              <a href={repoUrl} target="_blank" rel="noreferrer noopener" className="underline">
                código-fonte
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
