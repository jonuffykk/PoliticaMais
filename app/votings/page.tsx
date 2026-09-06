import type { Metadata } from 'next'
import { VotingFeed } from '@/components/live'
import { Breadcrumbs, PageHeader } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Votações',
  description:
    'Votações mais recentes do plenário da Câmara dos Deputados, com placar por partido, lidas ao vivo dos dados abertos.',
  alternates: { canonical: '/votings/' },
}

export default function VotingsPage() {
  return (
    <>
      <PageHeader
        title="Votações do plenário"
        description="Abra uma votação para ver o placar, a divisão por partido e o voto de cada deputado. Parte das votações é simbólica e não registra voto individual."
        crumbs={<Breadcrumbs items={[{ label: 'Votações' }]} />}
      />
      <VotingFeed limit={20} />
    </>
  )
}
