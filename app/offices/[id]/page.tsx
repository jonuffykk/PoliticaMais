import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OfficePowersCard } from '@/components/blocks'
import { Badge, Breadcrumbs, Section } from '@/components/ui'
import { getOffice, offices, topics } from '@/lib/content'

type Params = { params: Promise<{ id: string }> }

const levelLabels = { federal: 'Federal', estadual: 'Estadual', municipal: 'Municipal' }

export function generateStaticParams() {
  return offices.map((office) => ({ id: office.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const office = getOffice(id)
  if (!office) return {}
  return {
    title: `O que ${office.name} pode fazer`,
    description: office.summaryPlain,
    alternates: { canonical: `/offices/${office.id}/` },
  }
}

export default async function OfficePage({ params }: Params) {
  const { id } = await params
  const office = getOffice(id)
  if (!office) notFound()

  const related = topics.filter((topic) => topic.offices.includes(office.id))

  return (
    <>
      <Breadcrumbs items={[{ label: 'Cargos', href: '/offices/' }, { label: office.name }]} />

      <header className="space-y-2">
        <Badge variant="outline">{levelLabels[office.level]}</Badge>
        <h1 className="text-2xl font-semibold capitalize">{office.name}</h1>
      </header>

      <OfficePowersCard office={office} />

      {related.length > 0 ? (
        <Section title="Temas que passam por este cargo">
          <ul className="flex flex-wrap gap-2">
            {related.map((topic) => (
              <li key={topic.id}>
                <Link
                  href={`/topics/${topic.id}/`}
                  className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm transition-colors hover:bg-muted"
                >
                  {topic.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  )
}
