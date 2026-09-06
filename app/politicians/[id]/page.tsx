import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { OfficePowersCard } from '@/components/blocks'
import { PoliticianLive } from '@/components/live'
import { VotingRecord } from '@/components/record'
import { Breadcrumbs, Section } from '@/components/ui'
import { getOffice, getPolitician, politicians, siteUrl } from '@/lib/content'

type Params = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return politicians.map((politician) => ({ id: politician.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const politician = getPolitician(id)
  if (!politician) return {}
  return {
    title: politician.ballotName,
    description: `${politician.ballotName}, ${politician.party}, ${politician.state}. Voto nominal, propostas, comissões e trajetória partidária, lidos ao vivo dos dados abertos da Câmara.`,
    alternates: { canonical: `/politicians/${politician.id}/` },
  }
}

export default async function PoliticianPage({ params }: Params) {
  const { id } = await params
  const politician = getPolitician(id)
  if (!politician) notFound()

  const office = getOffice(politician.officeId)

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: politician.name,
    alternateName: politician.ballotName,
    jobTitle: office?.name,
    memberOf: { '@type': 'Organization', name: politician.party },
    image: politician.photo,
    url: `${siteUrl}/politicians/${politician.id}/`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <Breadcrumbs
        items={[{ label: 'Políticos', href: '/politicians/' }, { label: politician.ballotName }]}
      />

      <PoliticianLive
        id={politician.id}
        fallbackName={politician.ballotName}
        fallbackPhoto={politician.photo}
      />

      <Section
        title="Como votou"
        description="Voto registrado nas votações nominais mais recentes do plenário, com o alinhamento em relação ao próprio partido."
      >
        <VotingRecord deputyId={politician.id} party={politician.party} />
      </Section>

      {office ? (
        <Section title="O cargo">
          <OfficePowersCard office={office} compact />
        </Section>
      ) : null}
    </>
  )
}
