import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { OfficePowersCard } from '@/components/blocks'
import { SenatorLive } from '@/components/senate'
import { Breadcrumbs, Section } from '@/components/ui'
import { getOffice, getSenator, senators, siteUrl } from '@/lib/content'

type Params = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return senators.map((person) => ({ id: person.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const person = getSenator(id)
  if (!person) return {}
  return {
    title: person.ballotName,
    description: `${person.ballotName}, ${person.party}, ${person.state}. Mandato, contato e competências do cargo, lidos ao vivo dos dados abertos do Senado.`,
    alternates: { canonical: `/senators/${person.id}/` },
  }
}

export default async function SenatorPage({ params }: Params) {
  const { id } = await params
  const person = getSenator(id)
  if (!person) notFound()

  const office = getOffice(person.officeId)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    alternateName: person.ballotName,
    jobTitle: 'Senador da República',
    memberOf: { '@type': 'Organization', name: person.party },
    image: person.photo,
    url: `${siteUrl}/senators/${person.id}/`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <Breadcrumbs items={[
          { label: 'Políticos', href: '/politicians/' },
          { label: person.ballotName },
        ]} />

      <SenatorLive id={person.id} fallbackName={person.ballotName} fallbackPhoto={person.photo} />

      {office ? (
        <Section title="O cargo">
          <OfficePowersCard office={office} />
        </Section>
      ) : null}
    </>
  )
}
