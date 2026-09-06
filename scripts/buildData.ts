import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const contentDir = join(root, 'content')
const apiDir = join(root, 'public', 'api', 'v1')

type Row = Record<string, unknown>

function read(file: string): Row[] {
  try {
    return JSON.parse(readFileSync(join(contentDir, `${file}.json`), 'utf8')) as Row[]
  } catch {
    return []
  }
}

function write(path: string, data: unknown) {
  writeFileSync(join(apiDir, path), JSON.stringify(data), 'utf8')
}

const collections = [
  'politicians',
  'senators',
  'offices',
  'claims',
  'glossary',
  'elections',
  'topics',
] as const
type Collection = (typeof collections)[number]

const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { version: string }

mkdirSync(apiDir, { recursive: true })

const data = Object.fromEntries(collections.map((name) => [name, read(name)])) as Record<Collection, Row[]>

for (const name of collections) write(`${name}.json`, data[name])

const csvColumns = ['id', 'name', 'ballotName', 'party', 'officeId', 'state']
writeFileSync(
  join(apiDir, 'politicians.csv'),
  [
    csvColumns.join(','),
    ...data.politicians.map((row) =>
      csvColumns.map((column) => `"${String(row[column] ?? '').replace(/"/g, '""')}"`).join(','),
    ),
  ].join('\n'),
  'utf8',
)

const staticPages = [
  { title: 'Votações do plenário', subtitle: 'Ao vivo, Câmara dos Deputados', url: '/votings/' },
  { title: 'Deputados e senadores', subtitle: 'Ao vivo, 594 em exercício', url: '/politicians/' },
  { title: 'Cargos e competências', subtitle: 'O que cada cargo pode fazer', url: '/offices/' },
  { title: 'Todas as seções', subtitle: 'Índice do site', url: '/mais/' },
  { title: 'Indicadores', subtitle: 'Ao vivo, Banco Central', url: '/indicators/' },
  { title: 'Comparar parlamentares', subtitle: 'Voto lado a lado', url: '/compare/' },
  { title: 'Baixar o app', subtitle: 'Android e app web', url: '/download/' },
  { title: 'Metodologia', subtitle: 'Como o dado chega aqui', url: '/docs/methodology/' },
  { title: 'API pública', subtitle: 'Dados abertos', url: '/docs/data/' },
]

write('search.json', [
  ...data.offices.map((row) => ({
    id: `office-${row.id}`,
    title: String(row.name ?? ''),
    subtitle: 'Competências do cargo',
    url: `/offices/${row.id}/`,
    kind: 'office',
  })),
  ...data.topics.map((row) => ({
    id: `topic-${row.id}`,
    title: String(row.name ?? ''),
    subtitle: String(row.summaryPlain ?? ''),
    url: `/topics/${row.id}/`,
    kind: 'topic',
  })),
  ...data.claims.map((row) => ({
    id: `check-${row.id}`,
    title: String(row.statement ?? ''),
    subtitle: `Veredito: ${row.verdict ?? ''}`,
    url: `/checks/${row.id}/`,
    kind: 'check',
  })),
  ...data.glossary.map((row) => ({
    id: `glossary-${row.slug}`,
    title: String(row.term ?? ''),
    subtitle: String(row.definitionPlain ?? '').slice(0, 90),
    url: `/glossary/#${row.slug}`,
    kind: 'glossary',
  })),
  ...staticPages.map((page) => ({ id: `page-${page.url}`, ...page, kind: 'page' })),
])

const live = {
  deputados: 'https://dadosabertos.camara.leg.br/api/v2/deputados',
  votacoes: 'https://dadosabertos.camara.leg.br/api/v2/votacoes',
  senadores: 'https://legis.senado.leg.br/dadosabertos/senador/lista/atual',
  indicadores: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json',
}

write('index.json', {
  name: 'Politica+',
  version,
  builtAt: new Date().toISOString(),
  license: 'CC-BY-SA-4.0',
  documentation: 'https://politicamais.com/docs/data/',
  editorial: Object.fromEntries(
    collections.map((name) => [name, { count: data[name].length, url: `/api/v1/${name}.json` }]),
  ),
  live,
})

write('openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'Politica+ API',
    version,
    summary: 'Conteúdo editorial do Politica+, com fonte primária e data de coleta.',
    description:
      'Esta API serve o conteúdo curado. Votações, fichas de parlamentares e séries econômicas são lidas ao vivo, no cliente, direto da Câmara dos Deputados e do Banco Central, e não passam por este servidor.',
    license: { name: 'CC BY-SA 4.0', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  },
  servers: [{ url: 'https://politicamais.com/api/v1' }],
  paths: Object.fromEntries([
    ...collections.map((name) => [
      `/${name}.json`,
      {
        get: {
          summary: `Lista de ${name}`,
          responses: {
            '200': {
              description: 'OK',
              content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } },
            },
          },
        },
      },
    ]),
    ['/search.json', { get: { summary: 'Índice de busca do conteúdo curado' } }],
    ['/politicians.csv', { get: { summary: 'Parlamentares em CSV' } }],
    ['/index.json', { get: { summary: 'Manifesto da API e endereços das fontes ao vivo' } }],
  ]),
})

console.log(
  `api v1 gerada: ${collections.reduce((sum, name) => sum + data[name].length, 0)} registros curados`,
)
