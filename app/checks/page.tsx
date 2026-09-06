import type { Metadata } from 'next'
import { ClaimCard } from '@/components/blocks'
import { Breadcrumbs, Empty, PageHeader } from '@/components/ui'
import { claims, verdicts } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Verificações',
  description: 'Afirmações públicas conferidas contra fonte primária, com evidência, veredito e data.',
  alternates: { canonical: '/checks/' },
}

export default function ChecksPage() {
  const sorted = [...claims].sort((a, b) => b.checkedAt.localeCompare(a.checkedAt))

  return (
    <>
      <PageHeader
        title="Verificações"
        description={`Cada verificação usa no mínimo duas fontes independentes e um veredito de vocabulário fechado: ${verdicts.join(', ')}.`}
        crumbs={<Breadcrumbs items={[{ label: 'Verificações' }]} />}
      />
      {sorted.length === 0 ? (
        <Empty title="Nada publicado ainda">
          As verificações passam por dois revisores antes de entrar no ar.
        </Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>
      )}
    </>
  )
}
