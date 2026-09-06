import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OfficePowersCard } from '@/components/blocks'
import { VotingFeed } from '@/components/live'
import { Breadcrumbs, Section } from '@/components/ui'
import { getOffice, getTopic, topics } from '@/lib/content'

type Params = { params: Promise<{ topic: string }> }

export function generateStaticParams() {
  return topics.map((topic) => ({ topic: topic.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { topic } = await params
  const found = getTopic(topic)
  if (!found) return {}
  return {
    title: found.name,
    description: found.summaryPlain,
    alternates: { canonical: `/topics/${found.id}/` },
  }
}

export default async function TopicPage({ params }: Params) {
  const { topic } = await params
  const found = getTopic(topic)
  if (!found) notFound()

  const relatedOffices = found.offices.map(getOffice).filter((office) => office !== undefined)

  return (
    <>
      <Breadcrumbs items={[{ label: 'Temas', href: '/topics/' }, { label: found.name }]} />

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{found.name}</h1>
        <p className="text-muted-foreground">{found.summaryPlain}</p>
      </header>

      <Section
        title="Quem decide"
        description="Antes de cobrar, veja qual cargo tem competência sobre o assunto."
      >
        <div className="space-y-3">
          {relatedOffices.map((office) => (
            <OfficePowersCard key={office.id} office={office} compact />
          ))}
        </div>
      </Section>

      <Section
        title="O que o plenário votou"
        description="Votações mais recentes da Câmara. Abra para ver o placar por partido."
        action={
          <Link href="/votings/" className="text-sm text-primary underline underline-offset-2">
            Ver todas
          </Link>
        }
      >
        <VotingFeed limit={6} />
      </Section>
    </>
  )
}
