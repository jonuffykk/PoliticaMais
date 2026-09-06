import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export * from './site'

export type SourceRef = {
  label: string
  url: string
  publisher: string
  retrievedAt: string
  archiveUrl?: string
}

export type Politician = {
  id: string
  name: string
  ballotName: string
  party: string
  officeId: string
  state: string
  photo: string
  sourceRefs: SourceRef[]
}

export type Office = {
  id: string
  level: 'federal' | 'estadual' | 'municipal'
  name: string
  summaryPlain: string
  canDo: string[]
  cannotDo: string[]
  commonMyths: string[]
  sourceRefs: SourceRef[]
}

export const verdicts = [
  'verdadeiro',
  'impreciso',
  'falso',
  'sem contexto',
  'insustentável',
  'não verificável',
] as const

export type Verdict = (typeof verdicts)[number]

export type Claim = {
  id: string
  subject: string
  statement: string
  verdict: Verdict
  evidence: string[]
  checkedAt: string
  corrections: { date: string; note: string }[]
  sourceRefs: SourceRef[]
}

export type GlossaryEntry = {
  term: string
  slug: string
  definitionPlain: string
  related: string[]
  sourceRefs: SourceRef[]
}

export type Election = {
  year: string
  summaryPlain: string
  offices: string[]
  dates: { label: string; date: string }[]
  sourceRefs: SourceRef[]
}

export type Topic = {
  id: string
  name: string
  summaryPlain: string
  offices: string[]
}

export type Vote = { position: 'sim' | 'nao' | 'abstencao' | 'ausente' | 'obstrucao' }

const contentDir = join(process.cwd(), 'content')

function read<T>(file: string): T[] {
  try {
    return JSON.parse(readFileSync(join(contentDir, file), 'utf8')) as T[]
  } catch {
    return []
  }
}

export const politicians = read<Politician>('politicians.json')
export const senators = read<Politician>('senators.json')
export const offices = read<Office>('offices.json')
export const claims = read<Claim>('claims.json')
export const glossary = read<GlossaryEntry>('glossary.json')
export const elections = read<Election>('elections.json')
export const topics = read<Topic>('topics.json')

export const getPolitician = (id: string) => politicians.find((item) => item.id === id)
export const getSenator = (id: string) => senators.find((item) => item.id === id)
export const getOffice = (id: string) => offices.find((item) => item.id === id)
export const getTopic = (id: string) => topics.find((item) => item.id === id)
export const getClaim = (id: string) => claims.find((item) => item.id === id)
export const getElection = (year: string) => elections.find((item) => item.year === year)

export function readDoc(slug: string) {
  try {
    return readFileSync(join(contentDir, 'docs', `${slug}.md`), 'utf8')
  } catch {
    return null
  }
}

export const docSlugs = ['methodology', 'editorial', 'data', 'terms', 'privacy', 'about'] as const
export type DocSlug = (typeof docSlugs)[number]

export const docTitles: Record<DocSlug, string> = {
  methodology: 'Metodologia',
  editorial: 'Política editorial e governança',
  data: 'API pública e dados abertos',
  terms: 'Termos de uso',
  privacy: 'Privacidade',
  about: 'Sobre o Politica+',
}

export const buildInfo = {
  version: (() => {
    try {
      return (
        JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as { version: string }
      ).version
    } catch {
      return '0.0.0'
    }
  })(),
  builtAt: new Date().toISOString().slice(0, 10),
}
