import type { Metadata } from 'next'
import { Download, Github, ShieldCheck, Smartphone } from 'lucide-react'
import { Breadcrumbs, Card, CardTitle, PageHeader } from '@/components/ui'
import { buildInfo, repoUrl, siteName, siteUrl } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Baixar o app',
  description:
    'App Android do Politica+: mesmo conteúdo do site, sem login, sem rastreio e sem permissão desnecessária.',
  alternates: { canonical: '/download/' },
}

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: siteName,
  operatingSystem: 'Android 8.0+',
  applicationCategory: 'ReferenceApplication',
  url: `${siteUrl}/download/`,
  downloadUrl: `${repoUrl}/releases/latest`,
  softwareVersion: buildInfo.version,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
}

const guarantees = [
  'Não pede login nem cadastro.',
  'Não coleta dado de uso, nem análise, nem identificador de aparelho.',
  'Não pede permissão de câmera, microfone, contatos ou localização.',
  'Não envia notificação de campanha.',
  'Guarda no aparelho apenas o cache das consultas que você fez.',
]

export default function DownloadPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />

      <PageHeader
        title="Baixar o app"
        description="O app é o mesmo site empacotado, então consulta as mesmas fontes oficiais na hora. O que você já abriu fica em cache e continua legível sem internet."
        crumbs={<Breadcrumbs items={[{ label: 'Baixar o app' }]} />}
      />

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <span className="flex items-center gap-2">
              <Download size={18} aria-hidden className="text-primary" />
              <CardTitle>APK para Android</CardTitle>
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              Publicado a cada versão, com checksum SHA-256 na página do release para você conferir antes
              de instalar.
            </p>
            <a
              href={`${repoUrl}/releases/latest`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Abrir o último release
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
              Versão atual do projeto: {buildInfo.version}, build de {buildInfo.builtAt}.
            </p>
          </Card>

          <Card>
            <span className="flex items-center gap-2">
              <Smartphone size={18} aria-hidden className="text-primary" />
              <CardTitle>Instalar como app web</CardTitle>
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              No navegador, abra o menu e escolha adicionar à tela inicial. Funciona em Android e iOS,
              não passa por loja e atualiza sozinho.
            </p>
          </Card>
        </div>

        <Card>
          <span className="flex items-center gap-2">
            <ShieldCheck size={18} aria-hidden className="text-positive" />
            <CardTitle>O que o app não faz</CardTitle>
          </span>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            {guarantees.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <span className="flex items-center gap-2">
            <Github size={18} aria-hidden />
            <CardTitle>Conferir por conta própria</CardTitle>
          </span>
          <p className="mt-2 text-sm text-muted-foreground">
            O APK é compilado pelo GitHub Actions a partir do código público, sem etapa manual. Você pode
            clonar o repositório e reproduzir o mesmo build.
          </p>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-block text-sm text-primary underline underline-offset-2"
          >
            Ver o código-fonte
          </a>
        </Card>
      </div>
    </>
  )
}
