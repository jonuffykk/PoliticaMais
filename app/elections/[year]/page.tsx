import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SourceList } from '@/components/blocks'
import { Breadcrumbs, Card, CardTitle, Section } from '@/components/ui'
import { elections, getElection, getOffice } from '@/lib/content'
import { formatDate } from '@/lib/utils'

type Params = { params: Promise<{ year: string }> }

export function generateStaticParams() {
  return elections.map((election) => ({ year: election.year }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { year } = await params
  const election = getElection(year)
  if (!election) return {}
  return {
    title: `Eleição de ${election.year}`,
    description: election.summaryPlain,
    alternates: { canonical: `/elections/${election.year}/` },
  }
}

export default async function ElectionPage({ params }: Params) {
  const { year } = await params
  const election = getElection(year)
  if (!election) notFound()

  const today = new Date().toISOString().slice(0, 10)

  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Eleições', href: '/elections/' }, { label: `Eleição de ${election.year}` }]}
      />

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Eleição de {election.year}</h1>
        <p className="text-muted-foreground">{election.summaryPlain}</p>
      </header>

      <Section title="Datas">
        <Card>
          <ol className="space-y-4">
            {election.dates.map((item) => {
              const past = item.date < today
              return (
                <li key={item.label} className="flex gap-3">
                  <span
                    aria-hidden
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${past ? 'bg-border' : 'bg-primary'}`}
                  />
                  <span className="flex flex-1 flex-wrap justify-between gap-2 text-sm">
                    <span className={past ? 'text-muted-foreground' : 'font-medium'}>{item.label}</span>
                    <span className="text-muted-foreground tabular-nums">{formatDate(item.date)}</span>
                  </span>
                </li>
              )
            })}
          </ol>
          <SourceList sources={election.sourceRefs} />
        </Card>
      </Section>

      <Section title="Cargos em disputa" description="Antes de cobrar, veja o que cada cargo decide.">
        <div className="grid gap-3 sm:grid-cols-2">
          {election.offices.map(getOffice).map((office) =>
            office ? (
              <Card key={office.id} as={Link} href={`/offices/${office.id}/`} interactive className="block">
                <CardTitle className="capitalize">{office.name}</CardTitle>
                <span className="mt-2 block text-sm text-muted-foreground">{office.summaryPlain}</span>
              </Card>
            ) : null,
          )}
        </div>
      </Section>
    </>
  )
}
