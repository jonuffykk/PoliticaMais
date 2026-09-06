import type { Metadata } from 'next'
import { SourceList } from '@/components/blocks'
import { Breadcrumbs, Card, CardTitle, Empty, PageHeader } from '@/components/ui'
import { glossary, siteUrl } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Glossário',
  description:
    'PEC, medida provisória, quociente eleitoral, emenda parlamentar e outros jargões do Congresso em linguagem simples.',
  alternates: { canonical: '/glossary/' },
}

export default function GlossaryPage() {
  const sorted = [...glossary].sort((a, b) => a.term.localeCompare(b.term, 'pt-BR'))

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: `${siteUrl}/glossary/`,
    mainEntity: sorted.map((entry) => ({
      '@type': 'Question',
      name: entry.term,
      acceptedAnswer: { '@type': 'Answer', text: entry.definitionPlain },
    })),
  }

  return (
    <>
      {sorted.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}

      <PageHeader
        title="Glossário"
        description="Jargão do Congresso explicado sem jargão."
        crumbs={<Breadcrumbs items={[{ label: 'Glossário' }]} />}
      />

      <div className="space-y-4">
        {sorted.length === 0 ? (
          <Empty>Nenhum termo cadastrado.</Empty>
        ) : (
          <>
            <nav aria-label="Índice do glossário">
              <ul className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
                {sorted.map((entry) => (
                  <li key={entry.slug}>
                    <a
                      href={`#${entry.slug}`}
                      className="inline-flex h-9 items-center rounded-full border border-border bg-card px-3.5 text-[0.8125rem] whitespace-nowrap text-muted-foreground"
                    >
                      {entry.term}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="space-y-3">
              {sorted.map((entry) => (
                <Card key={entry.slug} id={entry.slug} className="scroll-mt-20">
                  <CardTitle>{entry.term}</CardTitle>
                  <p className="mt-2 text-sm">{entry.definitionPlain}</p>
                  {entry.related.length > 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">Veja também: {entry.related.join(', ')}</p>
                  ) : null}
                  <SourceList sources={entry.sourceRefs} />
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
