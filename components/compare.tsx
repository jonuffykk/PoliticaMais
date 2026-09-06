'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { Plus, X } from 'lucide-react'
import { Avatar, positionLabels } from '@/components/blocks'
import { LiveStatus } from '@/components/live'
import { Badge, Button, Card, Empty, Input, Skeleton } from '@/components/ui'
import { useLive } from '@/lib/live'
import {
  listDeputies,
  listVotingRecords,
  listVotings,
  positionByLabel,
  type CamaraDeputy,
  type CamaraVoteRecord,
  type CamaraVoting,
} from '@/lib/sources'
import { formatShortDate, getSearchParam, normalize, setSearchParam, subscribeLocation } from '@/lib/utils'

const maxSelected = 4
const votingCount = 6

function VotingMatrix({ votings, people }: { votings: CamaraVoting[]; people: CamaraDeputy[] }) {
  const batch = votings.map((voting) => voting.id).join(',')
  const [loaded, setLoaded] = useState<{ key: string; records: Record<string, CamaraVoteRecord[]> }>({
    key: '',
    records: {},
  })

  useEffect(() => {
    const controller = new AbortController()
    Promise.all(
      votings.map((voting) =>
        listVotingRecords(voting.id, { signal: controller.signal })
          .then((rows) => [voting.id, rows] as const)
          .catch(() => [voting.id, [] as CamaraVoteRecord[]] as const),
      ),
    )
      .then((entries) => {
        if (!controller.signal.aborted) setLoaded({ key: batch, records: Object.fromEntries(entries) })
      })
      .catch(() => undefined)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch])

  if (loaded.key !== batch) return <Skeleton className="h-64 w-full rounded-lg" />

  const records = loaded.records
  const nominal = votings.filter((voting) => (records[voting.id] ?? []).length > 0)

  if (nominal.length === 0) {
    return (
      <Empty title="Sem votação nominal recente">
        As últimas votações do plenário foram simbólicas, sem registro de voto individual.
      </Empty>
    )
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <table className="w-full min-w-[36rem] text-sm">
        <caption className="sr-only">Comparação de voto por votação</caption>
        <thead>
          <tr>
            <th scope="col" className="border-b border-border p-3 text-left align-bottom">
              Votação
            </th>
            {people.map((person) => (
              <th key={person.id} scope="col" className="border-b border-border p-3 text-left align-bottom">
                <span className="flex items-center gap-2">
                  <Avatar name={person.nome} photo={person.urlFoto} size={28} />
                  <span className="min-w-0">
                    <span className="block truncate text-[0.8125rem]">{person.nome}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {person.siglaPartido} · {person.siglaUf}
                    </span>
                  </span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {nominal.map((voting) => {
            const proposal = voting.proposicoesAfetadas?.[0]
            return (
              <tr key={voting.id}>
                <th scope="row" className="border-b border-border p-3 text-left align-top font-medium">
                  <span className="block">
                    {proposal ? `${proposal.siglaTipo} ${proposal.numero}/${proposal.ano}` : voting.descricao}
                  </span>
                  <span className="block text-xs font-normal text-muted-foreground">
                    {formatShortDate(voting.data)}
                  </span>
                </th>
                {people.map((person) => {
                  const record = (records[voting.id] ?? []).find(
                    (item) => item.deputado_.id === person.id,
                  )
                  const key = record ? positionByLabel[record.tipoVoto] : null
                  const position = key ? positionLabels[key as keyof typeof positionLabels] : null
                  return (
                    <td key={person.id} className="border-b border-border p-3 align-top">
                      {position ? (
                        <Badge variant={position.variant}>{position.label}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">sem registro</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function Compare() {
  const deputies = useLive('camara:deputies', (signal) => listDeputies({ signal }), [] as CamaraDeputy[], {
    ttl: 21600_000,
  })
  const votings = useLive(
    `camara:votings:${votingCount}`,
    (signal) => listVotings(votingCount, { signal }),
    [] as CamaraVoting[],
    { ttl: 1800_000 },
  )

  const raw = useSyncExternalStore(
    subscribeLocation,
    () => getSearchParam('ids'),
    () => '',
  )
  const [query, setQuery] = useState('')

  const selectedIds = useMemo(
    () => raw.split(',').filter(Boolean).slice(0, maxSelected),
    [raw],
  )
  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => deputies.data.find((person) => String(person.id) === id))
        .filter((person): person is CamaraDeputy => Boolean(person)),
    [selectedIds, deputies.data],
  )

  const suggestions = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter(Boolean)
    if (terms.length === 0) return []
    return deputies.data
      .filter((person) => !selectedIds.includes(String(person.id)))
      .filter((person) => {
        const haystack = normalize(`${person.nome} ${person.siglaPartido} ${person.siglaUf}`)
        return terms.every((term) => haystack.includes(term))
      })
      .slice(0, 6)
  }, [deputies.data, query, selectedIds])

  function toggle(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id].slice(0, maxSelected)
    setSearchParam('ids', next.join(','))
    setQuery('')
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={
            selectedIds.length >= maxSelected
              ? `Limite de ${maxSelected} nomes atingido`
              : 'Adicionar parlamentar por nome, partido ou estado'
          }
          disabled={selectedIds.length >= maxSelected}
          aria-label="Adicionar parlamentar"
        />
        {suggestions.length > 0 ? (
          <ul className="overflow-hidden rounded-lg border border-border bg-card">
            {suggestions.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  onClick={() => toggle(String(person.id))}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-muted"
                >
                  <Avatar name={person.nome} photo={person.urlFoto} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{person.nome}</span>
                    <span className="block text-xs text-muted-foreground">
                      {person.siglaPartido} · {person.siglaUf}
                    </span>
                  </span>
                  <Plus size={16} aria-hidden className="text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {selected.map((person) => (
            <li key={person.id}>
              <button
                type="button"
                onClick={() => toggle(String(person.id))}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card pr-2 pl-1.5 text-sm"
              >
                <Avatar name={person.nome} photo={person.urlFoto} size={24} />
                <span className="max-w-40 truncate">{person.nome}</span>
                <X size={14} aria-hidden className="text-muted-foreground" />
                <span className="sr-only">Remover {person.nome}</span>
              </button>
            </li>
          ))}
          <li>
            <Button variant="ghost" size="sm" onClick={() => setSearchParam('ids', '')}>
              Limpar
            </Button>
          </li>
        </ul>
      ) : null}

      {selected.length === 0 ? (
        <Empty title="Escolha até quatro nomes">
          A seleção fica no endereço da página, então o link compartilhado abre a mesma comparação.
        </Empty>
      ) : votings.data.length === 0 ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <VotingMatrix votings={votings.data} people={selected} />
      )}

      <LiveStatus result={votings} source="Câmara dos Deputados, últimas votações nominais" />

      <Card>
        <p className="text-sm text-muted-foreground">
          A tabela mostra apenas posição registrada em votação nominal do plenário. Ausência de registro
          não significa concordância nem discordância: pode ser ausência justificada, licença ou votação
          simbólica.
        </p>
      </Card>
    </div>
  )
}
