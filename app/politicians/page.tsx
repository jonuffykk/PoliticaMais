import type { Metadata } from 'next'
import { PeopleDirectory } from '@/components/directory'
import { Breadcrumbs, PageHeader } from '@/components/ui'
import { politicians, senators } from '@/lib/content'
import type { CamaraDeputy, Senator } from '@/lib/sources'

export const metadata: Metadata = {
  title: 'Políticos',
  description:
    'Os 513 deputados federais e os 81 senadores em exercício, lidos ao vivo da Câmara e do Senado, com filtro por partido e estado.',
  alternates: { canonical: '/politicians/' },
}

const deputyFallback: CamaraDeputy[] = politicians.map((person) => ({
  id: Number(person.id),
  nome: person.ballotName,
  siglaPartido: person.party,
  siglaUf: person.state,
  urlFoto: person.photo,
  email: null,
  idLegislatura: 0,
}))

const senatorFallback: Senator[] = senators.map((person) => ({
  id: person.id,
  nome: person.ballotName,
  nomeCompleto: person.name,
  siglaPartido: person.party,
  siglaUf: person.state,
  urlFoto: person.photo,
  email: '',
  pagina: '',
}))

export default function PoliticiansPage() {
  return (
    <>
      <PageHeader
        title="Políticos"
        description="Os 513 deputados federais e os 81 senadores em exercício, na mesma lista. A busca roda no seu aparelho e não envia nada para lugar nenhum."
        crumbs={<Breadcrumbs items={[{ label: 'Políticos' }]} />}
      />
      <PeopleDirectory deputyFallback={deputyFallback} senatorFallback={senatorFallback} />
    </>
  )
}
