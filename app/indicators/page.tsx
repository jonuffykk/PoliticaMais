import type { Metadata } from 'next'
import { IndicatorBoard } from '@/components/live'
import { Breadcrumbs, PageHeader } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Indicadores',
  description:
    'IPCA, Selic, dólar e taxa de desocupação lidos ao vivo do Sistema Gerenciador de Séries Temporais do Banco Central.',
  alternates: { canonical: '/indicators/' },
}

export default function IndicatorsPage() {
  return (
    <>
      <PageHeader
        title="Indicadores"
        description="Números direto do Banco Central, sem intermediário e sem narrativa. A interpretação fica por sua conta."
        crumbs={<Breadcrumbs items={[{ label: 'Indicadores' }]} />}
      />
      <IndicatorBoard />
    </>
  )
}
