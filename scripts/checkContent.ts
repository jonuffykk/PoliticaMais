import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

const contentDir = join(process.cwd(), 'content')
const errors: string[] = []

const sourceRef = z.object({
  label: z.string().min(3),
  url: z.url(),
  publisher: z.string().min(2),
  retrievedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  archiveUrl: z.url().optional(),
})

const sourceRefs = z.array(sourceRef).min(1, 'todo registro precisa de pelo menos uma fonte')
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use o formato AAAA-MM-DD')

const person = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  ballotName: z.string().min(2),
  party: z.string(),
  officeId: z.string().min(1),
  state: z.string().length(2),
  photo: z.string(),
  sourceRefs,
})

const schemas = {
  senators: person,
  politicians: person,
  offices: z.object({
    id: z.string().min(1),
    level: z.enum(['federal', 'estadual', 'municipal']),
    name: z.string().min(2),
    summaryPlain: z.string().min(20),
    canDo: z.array(z.string()).min(1),
    cannotDo: z.array(z.string()).min(1),
    commonMyths: z.array(z.string()),
    sourceRefs,
  }),
  claims: z.object({
    id: z.string().min(1),
    subject: z.string().min(2),
    statement: z.string().min(10),
    verdict: z.enum(['verdadeiro', 'impreciso', 'falso', 'sem contexto', 'insustentável', 'não verificável']),
    evidence: z.array(z.string()).min(1),
    checkedAt: isoDate,
    corrections: z.array(z.object({ date: isoDate, note: z.string().min(5) })),
    sourceRefs: z.array(sourceRef).min(2, 'verificação exige duas fontes independentes'),
  }),
  glossary: z.object({
    term: z.string().min(2),
    slug: z.string().min(2),
    definitionPlain: z.string().min(20),
    related: z.array(z.string()),
    sourceRefs,
  }),
  elections: z.object({
    year: z.string().regex(/^\d{4}$/),
    summaryPlain: z.string().min(20),
    offices: z.array(z.string()).min(1),
    dates: z.array(z.object({ label: z.string().min(3), date: isoDate })).min(1),
    sourceRefs,
  }),
  topics: z.object({
    id: z.string().min(1),
    name: z.string().min(2),
    summaryPlain: z.string().min(10),
    offices: z.array(z.string()).min(1),
  }),
}

const loaded: Record<string, unknown[]> = {}

for (const [name, schema] of Object.entries(schemas)) {
  let rows: unknown[]
  try {
    rows = JSON.parse(readFileSync(join(contentDir, `${name}.json`), 'utf8')) as unknown[]
  } catch {
    errors.push(`${name}.json não pôde ser lido`)
    continue
  }

  const result = z.array(schema).safeParse(rows)
  if (!result.success) {
    for (const issue of result.error.issues.slice(0, 10)) {
      errors.push(`${name}[${issue.path.join('.')}]: ${issue.message}`)
    }
  }
  loaded[name] = rows
}

function idsOf(name: string, key = 'id') {
  return new Set((loaded[name] ?? []).map((row) => String((row as Record<string, unknown>)[key])))
}

const officeIds = idsOf('offices')

for (const name of ['politicians', 'senators']) {
  for (const row of (loaded[name] ?? []) as { id: string; officeId: string }[]) {
    if (!officeIds.has(row.officeId)) errors.push(`${name} ${row.id} aponta para cargo inexistente`)
  }
}
for (const row of (loaded.topics ?? []) as { id: string; offices: string[] }[]) {
  for (const id of row.offices) {
    if (!officeIds.has(id)) errors.push(`topic ${row.id} aponta para cargo inexistente: ${id}`)
  }
}
for (const row of (loaded.elections ?? []) as { year: string; offices: string[] }[]) {
  for (const id of row.offices) {
    if (!officeIds.has(id)) errors.push(`election ${row.year} aponta para cargo inexistente: ${id}`)
  }
}

const duplicates = (name: string, key: string) => {
  const seen = new Set<string>()
  for (const row of (loaded[name] ?? []) as Record<string, unknown>[]) {
    const id = String(row[key])
    if (seen.has(id)) errors.push(`${name} tem ${key} repetido: ${id}`)
    seen.add(id)
  }
}

duplicates('politicians', 'id')
duplicates('senators', 'id')
duplicates('offices', 'id')
duplicates('claims', 'id')
duplicates('topics', 'id')
duplicates('glossary', 'slug')

const maxAgeDays = 210
const now = Date.now()

for (const row of (loaded.politicians ?? []) as { id: string; sourceRefs: { retrievedAt: string }[] }[]) {
  const newest = row.sourceRefs
    .map((source) => Date.parse(source.retrievedAt))
    .filter((value) => !Number.isNaN(value))
    .sort((a, b) => b - a)[0]
  if (newest && (now - newest) / 86400000 > maxAgeDays) {
    errors.push(`o snapshot de rotas está com mais de ${maxAgeDays} dias; rode npm run data:fetch`)
    break
  }
}

if (errors.length > 0) {
  console.error('conteúdo reprovado:')
  for (const message of errors) console.error(`  ${message}`)
  process.exit(1)
}

const total = Object.values(loaded).reduce((sum, rows) => sum + rows.length, 0)
console.log(`conteúdo aprovado: ${total} registros em ${Object.keys(loaded).length} coleções`)
