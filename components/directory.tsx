'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import { Avatar } from '@/components/blocks'
import { LiveStatus } from '@/components/live'
import { Badge, Button, Empty, Input, Select, Skeleton } from '@/components/ui'
import { useLive } from '@/lib/live'
import { listDeputies, listSenators, type CamaraDeputy, type Senator } from '@/lib/sources'
import { brazilStates, normalize } from '@/lib/utils'

type Person = {
  id: string
  name: string
  role: 'Deputado federal' | 'Senador'
  party: string
  state: string
  photo: string
  href: string
}

export function PeopleDirectory({
  deputyFallback,
  senatorFallback,
}: {
  deputyFallback: CamaraDeputy[]
  senatorFallback: Senator[]
}) {
  const deputies = useLive('camara:deputies', (signal) => listDeputies({ signal }), deputyFallback, {
    ttl: 21600_000,
  })
  const senators = useLive('senado:senators', (signal) => listSenators({ signal }), senatorFallback, {
    ttl: 21600_000,
  })

  const [query, setQuery] = useState('')
  const [party, setParty] = useState('')
  const [state, setState] = useState('')
  const [pager, setPager] = useState({ key: '', limit: 60 })
  const deferred = useDeferredValue(query)

  const people = useMemo<Person[]>(
    () =>
      [
        ...deputies.data.map((person) => ({
          id: `d-${person.id}`,
          name: person.nome,
          role: 'Deputado federal' as const,
          party: person.siglaPartido,
          state: person.siglaUf,
          photo: person.urlFoto,
          href: `/politicians/${person.id}/`,
        })),
        ...senators.data.map((person) => ({
          id: `s-${person.id}`,
          name: person.nome,
          role: 'Senador' as const,
          party: person.siglaPartido,
          state: person.siglaUf,
          photo: person.urlFoto,
          href: `/senators/${person.id}/`,
        })),
      ].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    [deputies.data, senators.data],
  )

  const parties = useMemo(
    () => [...new Set(people.map((person) => person.party))].filter(Boolean).sort(),
    [people],
  )

  const filtered = useMemo(() => {
    const terms = normalize(deferred).split(/\s+/).filter(Boolean)
    return people.filter((person) => {
      if (party && person.party !== party) return false
      if (state && person.state !== state) return false
      if (terms.length === 0) return true
      const haystack = normalize(`${person.name} ${person.role} ${person.party} ${person.state}`)
      return terms.every((term) => haystack.includes(term))
    })
  }, [people, deferred, party, state])

  const filterKey = `${deferred}|${party}|${state}`
  const limit = pager.key === filterKey ? pager.limit : 60
  const loading = people.length === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome, cargo, partido ou estado"
          aria-label="Buscar por nome, cargo, partido ou estado"
          className="sm:flex-1"
        />
        <div className="flex gap-2">
          <Select
            value={party}
            onChange={(event) => setParty(event.target.value)}
            aria-label="Partido"
            className="flex-1 sm:flex-none"
          >
            <option value="">Todos os partidos</option>
            {parties.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select
            value={state}
            onChange={(event) => setState(event.target.value)}
            aria-label="Estado"
            className="flex-1 sm:flex-none"
          >
            <option value="">Todos os estados</option>
            {brazilStates.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <LiveStatus result={deputies} source="Câmara dos Deputados e Senado Federal" />

      {loading ? (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => (
            <li key={index}>
              <Skeleton className="h-16 rounded-lg" />
            </li>
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <Empty title="Nenhum resultado">
          Ajuste a busca. A base tem {people.length} parlamentares em exercício, entre Câmara e Senado.
        </Empty>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filtered.length} de {people.length} parlamentares
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, limit).map((person) => (
              <li key={person.id}>
                <Link
                  href={person.href}
                  className="flex h-full items-center gap-3 rounded-lg border border-border bg-card p-2.5 transition-colors hover:bg-accent"
                >
                  <Avatar name={person.name} photo={person.photo} size={38} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{person.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {person.party} · {person.state}
                    </span>
                  </span>
                  <Badge variant={person.role === 'Senador' ? 'primary' : 'outline'}>
                    {person.role === 'Senador' ? 'Senado' : 'Câmara'}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
          {filtered.length > limit ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPager({ key: filterKey, limit: limit + 60 })}
            >
              Mostrar mais {Math.min(60, filtered.length - limit)}
            </Button>
          ) : null}
        </>
      )}
    </div>
  )
}
