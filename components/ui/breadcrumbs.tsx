import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { siteUrl } from '@/lib/site'

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ label: 'Início', href: '/' }, ...items]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
    })),
  }

  return (
    <nav aria-label="Trilha de navegação">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ol className="hide-scrollbar flex items-center gap-1 overflow-x-auto text-xs text-muted-foreground">
        {trail.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1 whitespace-nowrap">
            {index > 0 ? <ChevronRight size={13} aria-hidden className="opacity-60" /> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="max-w-56 truncate text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
