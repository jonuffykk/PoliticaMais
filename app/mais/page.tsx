import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Breadcrumbs, PageHeader, Section } from '@/components/ui'
import { buildInfo, repoUrl } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Mais',
  description: 'Índice completo do Politica+: seções, documentos, API pública e app.',
  alternates: { canonical: '/mais/' },
}

const groups = [
  {
    title: 'Quem decide',
    links: [
      { href: '/politicians/', label: 'Deputados e senadores', hint: 'ao vivo, Câmara e Senado' },
      { href: '/offices/', label: 'Cargos e competências', hint: 'o que cada cargo pode e não pode' },
      { href: '/compare/', label: 'Comparar', hint: 'até quatro nomes lado a lado' },
    ],
  },
  {
    title: 'O que foi decidido',
    links: [
      { href: '/votings/', label: 'Votações do plenário', hint: 'com o voto de cada deputado' },
      { href: '/indicators/', label: 'Indicadores', hint: 'IPCA, Selic, dólar, desocupação' },
      { href: '/topics/', label: 'Temas', hint: 'quem decide cada assunto' },
      { href: '/checks/', label: 'Verificações', hint: 'afirmação contra fonte primária' },
    ],
  },
  {
    title: 'Entender',
    links: [
      { href: '/glossary/', label: 'Glossário', hint: 'PEC, MP, quociente eleitoral' },
      { href: '/elections/', label: 'Eleições', hint: 'calendário e cargos em disputa' },
      { href: '/docs/methodology/', label: 'Metodologia', hint: 'como o dado chega até aqui' },
      { href: '/docs/data/', label: 'API e dados abertos', hint: 'use por conta própria' },
    ],
  },
  {
    title: 'Projeto',
    links: [
      { href: '/download/', label: 'Baixar o app', hint: 'Android e app web' },
      { href: '/docs/editorial/', label: 'Política editorial', hint: 'quem decide o quê aqui' },
      { href: '/docs/privacy/', label: 'Privacidade', hint: 'o que sai do seu aparelho' },
      { href: '/docs/terms/', label: 'Termos de uso', hint: '' },
      { href: '/docs/about/', label: 'Sobre o Politica+', hint: '' },
    ],
  },
]

export default function MorePage() {
  return (
    <>
      <PageHeader
        title="Mais"
        description="Tudo o que existe no Politica+, em um lugar só."
        crumbs={<Breadcrumbs items={[{ label: 'Mais' }]} />}
      />

      {groups.map((group) => (
        <Section key={group.title} title={group.title}>
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {group.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-accent"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{link.label}</span>
                    {link.hint ? (
                      <span className="block text-xs text-muted-foreground">{link.hint}</span>
                    ) : null}
                  </span>
                  <ArrowRight size={15} aria-hidden className="shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <Section title="Esta versão">
        <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          <p>
            Versão {buildInfo.version}, build de {buildInfo.builtAt}. Código sob AGPL-3.0, conteúdo sob
            CC BY-SA 4.0.
          </p>
          <p className="mt-2">
            O Politica+ não recomenda voto. Reúne dado público com fonte e data para você decidir
            sozinho.
          </p>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-block text-primary underline underline-offset-2"
          >
            Código-fonte no GitHub
          </a>
        </div>
      </Section>
    </>
  )
}
