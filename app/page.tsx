import Link from 'next/link'
import { ArrowRight, Landmark, LineChart, Scale, ShieldCheck, Users } from 'lucide-react'
import { ClaimCard } from '@/components/blocks'
import { HomeHighlights } from '@/components/live'
import { Card, CardTitle, Section } from '@/components/ui'
import { claims, offices, topics } from '@/lib/content'

const entryPoints = [
  {
    href: '/politicians/',
    icon: Users,
    title: 'Quem representa você',
    text: '513 deputados federais e 81 senadores, com ficha, comissões e propostas.',
  },
  {
    href: '/votings/',
    icon: Landmark,
    title: 'O que o plenário decidiu',
    text: 'Votações da Câmara com placar por partido e o voto de cada deputado.',
  },
  {
    href: '/indicators/',
    icon: LineChart,
    title: 'Como está a economia',
    text: 'IPCA, Selic, dólar e desocupação lidos ao vivo do Banco Central.',
  },
  {
    href: '/checks/',
    icon: ShieldCheck,
    title: 'O que é boato',
    text: 'Afirmação pública conferida contra fonte primária, com evidência e data.',
  },
]

export default function HomePage() {
  const latestChecks = [...claims].sort((a, b) => b.checkedAt.localeCompare(a.checkedAt)).slice(0, 2)

  return (
    <>
      <section className="space-y-2">
        <h1 className="max-w-3xl text-[1.75rem] leading-tight font-semibold sm:text-3xl">
          Antes de votar, veja o que a pessoa fez
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Voto registrado, propostas e verificação de afirmações. Tudo é lido na hora das fontes
          oficiais e aponta de volta para elas.
        </p>
      </section>

      <Section title="Agora" description="Puxado neste instante da Câmara e do Banco Central.">
        <HomeHighlights />
      </Section>

      <Section title="Por onde começar">
        <div className="grid gap-2 sm:grid-cols-2">
          {entryPoints.map((entry) => (
            <Card key={entry.href} as={Link} href={entry.href} interactive className="block">
              <span className="flex items-center gap-2">
                <entry.icon size={17} aria-hidden className="text-primary" />
                <CardTitle className="flex-1">{entry.title}</CardTitle>
                <ArrowRight size={15} aria-hidden className="text-muted-foreground" />
              </span>
              <span className="mt-1.5 block text-sm text-muted-foreground">{entry.text}</span>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Cobrança no cargo certo"
        description="Boa parte da cobrança errada nasce de não saber o que cada cargo pode fazer."
        action={
          <Link href="/offices/" className="text-sm text-primary underline underline-offset-2">
            Ver todos
          </Link>
        }
      >
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((office) => (
            <li key={office.id}>
              <Link
                href={`/offices/${office.id}/`}
                className="flex h-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors hover:bg-accent"
              >
                <Scale size={15} aria-hidden className="shrink-0 text-muted-foreground" />
                <span className="capitalize">{office.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Temas"
        description="Cada tema mostra quem decide e o que já foi votado."
        action={
          <Link href="/topics/" className="text-sm text-primary underline underline-offset-2">
            Ver todos
          </Link>
        }
      >
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <li key={topic.id}>
              <Card as={Link} href={`/topics/${topic.id}/`} interactive className="block h-full p-3.5">
                <CardTitle>{topic.name}</CardTitle>
                <span className="mt-1 block text-sm text-muted-foreground">{topic.summaryPlain}</span>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      {latestChecks.length > 0 ? (
        <Section
          title="Últimas verificações"
          action={
            <Link href="/checks/" className="text-sm text-primary underline underline-offset-2">
              Ver todas
            </Link>
          }
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {latestChecks.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        </Section>
      ) : null}
    </>
  )
}
