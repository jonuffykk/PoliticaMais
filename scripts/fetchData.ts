import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { CAMARA, SENADO, listDeputies, listSenators } from '../lib/sources'

const contentDir = join(process.cwd(), 'content')
const today = new Date().toISOString().slice(0, 10)

const save = (name: string, rows: unknown[]) =>
  writeFileSync(join(contentDir, `${name}.json`), `${JSON.stringify(rows, null, 2)}\n`, 'utf8')

const byName = (a: { ballotName: string }, b: { ballotName: string }) =>
  a.ballotName.localeCompare(b.ballotName, 'pt-BR')

async function run() {
  const deputies = await listDeputies({ timeout: 30000 })
  if (deputies.length === 0) throw new Error('a Câmara devolveu uma lista vazia')

  save(
    'politicians',
    deputies
      .map((deputy) => ({
        id: String(deputy.id),
        name: deputy.nome,
        ballotName: deputy.nome,
        party: deputy.siglaPartido,
        officeId: 'deputado-federal',
        state: deputy.siglaUf,
        photo: deputy.urlFoto,
        sourceRefs: [
          {
            label: `Ficha de ${deputy.nome} na Câmara`,
            url: `${CAMARA}/deputados/${deputy.id}`,
            publisher: 'Câmara dos Deputados',
            retrievedAt: today,
          },
        ],
      }))
      .sort(byName),
  )

  const senate = await listSenators({ timeout: 30000 })
  if (senate.length === 0) throw new Error('o Senado devolveu uma lista vazia')

  save(
    'senators',
    senate
      .map((person) => ({
        id: person.id,
        name: person.nomeCompleto,
        ballotName: person.nome,
        party: person.siglaPartido,
        officeId: 'senador',
        state: person.siglaUf,
        photo: person.urlFoto,
        sourceRefs: [
          {
            label: `Ficha de ${person.nome} no Senado`,
            url: `${SENADO}/senador/${person.id}`,
            publisher: 'Senado Federal',
            retrievedAt: today,
          },
        ],
      }))
      .sort(byName),
  )

  console.log(`snapshot de rotas: ${deputies.length} deputados e ${senate.length} senadores`)
}

run().catch((error: Error) => {
  console.error(error.message)
  process.exit(1)
})
