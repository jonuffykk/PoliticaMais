import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs, Card, CardTitle, Empty, PageHeader } from '@/components/ui'
import { elections } from '@/lib/content'
import { formatShortDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Eleições',
  description: 'Calendário eleitoral e cargos em disputa, com fonte no TSE e na Constituição.',
  alternates: { canonical: '/elections/' },
}

export default function ElectionsPage() {
  const sorted = [...elections].sort((a, b) => b.year.localeCompare(a.year))

  return (
    <>
      <PageHeader
        title="Eleições"
        description="O que está em jogo e quando."
        crumbs={<Breadcrumbs items={[{ label: 'Eleições' }]} />}
      />
      {sorted.length === 0 ? (
        <Empty>Nenhum calendário cadastrado.</Empty>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sorted.map((election) => (
            <Card
              key={election.year}
              as={Link}
              href={`/elections/${election.year}/`}
              interactive
              className="block"
            >
              <CardTitle>Eleição de {election.year}</CardTitle>
              <span className="mt-2 block text-sm text-muted-foreground">{election.summaryPlain}</span>
              <span className="mt-3 block text-xs text-muted-foreground">
                {election.dates.map((date) => `${date.label}: ${formatShortDate(date.date)}`).join(' · ')}
              </span>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
