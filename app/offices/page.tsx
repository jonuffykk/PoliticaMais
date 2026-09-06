import type { Metadata } from 'next'
import Link from 'next/link'
import { Badge, Breadcrumbs, Card, CardTitle, PageHeader, Section } from '@/components/ui'
import { offices } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Cargos',
  description:
    'O que presidente, governador, prefeito, senador, deputado federal e vereador podem e não podem fazer.',
  alternates: { canonical: '/offices/' },
}

const levelLabels = { federal: 'Federal', estadual: 'Estadual', municipal: 'Municipal' }

export default function OfficesPage() {
  return (
    <>
      <PageHeader
        title="Cargos"
        description="Cobrar a pessoa certa começa por saber quem decide o quê. Cada ficha lista poder, limite e as cobranças que costumam ir para o cargo errado."
        crumbs={<Breadcrumbs items={[{ label: 'Cargos' }]} />}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {offices.map((office) => (
          <Card key={office.id} as={Link} href={`/offices/${office.id}/`} interactive className="block">
            <span className="flex items-start justify-between gap-2">
              <CardTitle className="capitalize">{office.name}</CardTitle>
              <Badge variant="outline">{levelLabels[office.level]}</Badge>
            </span>
            <span className="mt-2 block text-sm text-muted-foreground">{office.summaryPlain}</span>
          </Card>
        ))}
      </div>

      <Section
        title="O que já tem ficha individual"
        description="Cobertura honesta: só entra aqui quem tem base pública consultável."
      >
        <Card>
          <ul className="space-y-3 text-sm">
            <li className="flex flex-wrap items-center gap-2">
              <Badge variant="positive">ao vivo</Badge>
              <span>
                <strong>Deputados federais</strong> e <strong>senadores</strong>, com ficha, mandato,
                comissões, propostas e voto nominal.
              </span>
            </li>
            <li className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">só competências</Badge>
              <span>
                <strong>Presidente</strong>, <strong>governador</strong>, <strong>prefeito</strong> e{' '}
                <strong>vereador</strong>: o que o cargo pode e não pode fazer, com fonte na
                Constituição.
              </span>
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Executivo e câmaras municipais não têm API pública equivalente à da Câmara e do Senado. Sem
            base consultável, uma ficha individual seria escrita à mão e envelheceria sem ninguém notar,
            que é exatamente o tipo de dado que este projeto se recusa a publicar. Para candidatura,
            bens declarados e prestação de contas de qualquer cargo, a fonte é o{' '}
            <a
              href="https://divulgacandcontas.tse.jus.br"
              target="_blank"
              rel="noreferrer noopener"
              className="text-primary underline underline-offset-2"
            >
              DivulgaCand do TSE
            </a>
            .
          </p>
        </Card>
      </Section>
    </>
  )
}
