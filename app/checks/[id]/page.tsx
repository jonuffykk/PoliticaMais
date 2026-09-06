import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SourceList, verdictVariants } from '@/components/blocks'
import { Badge, Breadcrumbs, Card, CardTitle, Section } from '@/components/ui'
import { claims, getClaim, siteUrl } from '@/lib/content'
import { formatDate } from '@/lib/utils'

type Params = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return claims.map((claim) => ({ id: claim.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const claim = getClaim(id)
  if (!claim) return {}
  return {
    title: `${claim.statement} (${claim.verdict})`,
    description: `Verificação da afirmação de ${claim.subject}, com evidências e fontes primárias.`,
    alternates: { canonical: `/checks/${claim.id}/` },
  }
}

export default async function CheckPage({ params }: Params) {
  const { id } = await params
  const claim = getClaim(id)
  if (!claim) notFound()

  const claimSchema = {
    '@context': 'https://schema.org',
    '@type': 'ClaimReview',
    url: `${siteUrl}/checks/${claim.id}/`,
    datePublished: claim.checkedAt,
    claimReviewed: claim.statement,
    itemReviewed: { '@type': 'Claim', author: { '@type': 'Person', name: claim.subject } },
    reviewRating: {
      '@type': 'Rating',
      alternateName: claim.verdict,
      ratingValue: claim.verdict === 'verdadeiro' ? 5 : claim.verdict === 'falso' ? 1 : 3,
      bestRating: 5,
      worstRating: 1,
    },
    author: { '@type': 'Organization', name: 'Politica+', url: siteUrl },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(claimSchema) }}
      />

      <Breadcrumbs
        items={[{ label: 'Verificações', href: '/checks/' }, { label: claim.statement }]}
      />

      <header className="space-y-3">
        <Badge variant={verdictVariants[claim.verdict] ?? 'default'}>{claim.verdict}</Badge>
        <h1 className="text-2xl leading-snug font-semibold">{claim.statement}</h1>
        <p className="text-muted-foreground">
          Dito por {claim.subject}. Verificado em {formatDate(claim.checkedAt)}.
        </p>
      </header>

      <Section title="Evidências">
        <Card>
          <ol className="space-y-3 text-sm">
            {claim.evidence.map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[0.6875rem] font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
          <SourceList sources={claim.sourceRefs} label="Fontes primárias" />
        </Card>
      </Section>

      {claim.corrections.length > 0 ? (
        <Section title="Correções">
          <Card>
            <CardTitle>Histórico de alterações</CardTitle>
            <ul className="mt-3 space-y-2 text-sm">
              {claim.corrections.map((correction) => (
                <li key={correction.date}>
                  <span className="text-muted-foreground">{formatDate(correction.date)}: </span>
                  {correction.note}
                </li>
              ))}
            </ul>
          </Card>
        </Section>
      ) : null}
    </>
  )
}
