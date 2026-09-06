import type { Metadata } from 'next'
import { Compare } from '@/components/compare'
import { Breadcrumbs, PageHeader } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Comparar',
  description:
    'Compare até quatro deputados federais nas últimas votações nominais do plenário da Câmara.',
  alternates: { canonical: '/compare/' },
}

export default function ComparePage() {
  return (
    <>
      <PageHeader
        title="Comparar"
        description="Escolha os nomes e veja como cada um votou nas votações nominais mais recentes do plenário."
        crumbs={<Breadcrumbs items={[{ label: 'Comparar' }]} />}
      />
      <Compare />
    </>
  )
}
