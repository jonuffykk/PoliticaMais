'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import { Avatar } from '@/components/blocks'
import { LiveStatus } from '@/components/live'
import { Badge, Card, CardTitle, Empty, Input, Select, Skeleton, Stat } from '@/components/ui'
import { useLive } from '@/lib/live'
import {
  getSenator,
  listSenatorMandates,
  listSenators,
  type Senator,
  type SenatorDetail,
  type SenatorMandate,
} from '@/lib/sources'
import { brazilStates, formatDate, normalize } from '@/lib/utils'

export function SenatorDirectory({ fallback }: { fallback: Senator[] }) {
  const result = useLive('senado:senators', (signal) => listSenators({ signal }), fallback, {
    ttl: 21600_000,
  })
  const [query, setQuery] = useState('')
  const [party, setParty] = useState('')
  const [state, setState] = useState('')
  const deferred = useDeferredValue(query)

  const parties = useMemo(
    () => [...new Set(result.data.map((person) => person.siglaPartido))].filter(Boolean).sort(),
    [result.data],
  )

  const filtered = useMemo(() => {
    const terms = normalize(deferred).split(/\s+/).filter(Boolean)
    return result.data.filter((person) => {
      if (party && person.siglaPartido !== party) return false
      if (state && person.siglaUf !== state) return false
      if (terms.length === 0) return true
      const haystack = normalize(`${person.nome} ${person.nomeCompleto} ${person.siglaPartido} ${person.siglaUf}`)
      return terms.every((term) => haystack.includes(term))
    })
  }, [result.data, deferred, party, state])

  const loading = result.freshness === 'loading' && result.data.length === 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtrar por nome, partido ou estado"
          aria-label="Filtrar senadores"
          className="sm:flex-1"
        />
        <Select value={party} onChange={(event) => setParty(event.target.value)} aria-label="Partido">
          <option value="">Todos os partidos</option>
          {parties.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select value={state} onChange={(event) => setState(event.target.value)} aria-label="Estado">
          <option value="">Todos os estados</option>
          {brazilStates.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>

      <LiveStatus result={result} source="Senado Federal, dados abertos" />

      {loading ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }, (_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Empty title="Nenhum resultado">
          Ajuste o filtro. O Senado tem {result.data.length} senadores em exercício.
        </Empty>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filtered.length} de {result.data.length} senadores
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((person) => (
              <li key={person.id}>
                <Link
                  href={`/senators/${person.id}/`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 transition-colors hover:bg-accent"
                >
                  <Avatar name={person.nome} photo={person.urlFoto} size={38} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{person.nome}</span>
                    <span className="block text-xs text-muted-foreground">
                      {person.siglaPartido} · {person.siglaUf}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function mandateTerm(mandate: SenatorMandate) {
  const first = mandate.PrimeiraLegislaturaDoMandato
  const second = mandate.SegundaLegislaturaDoMandato
  if (!first) return ''
  return `${formatDate(first.DataInicio, 'short')} a ${formatDate((second ?? first).DataFim, 'short')}`
}

export function SenatorLive({
  id,
  fallbackName,
  fallbackPhoto,
}: {
  id: string
  fallbackName: string
  fallbackPhoto?: string
}) {
  const profile = useLive<SenatorDetail | null>(
    `senado:senator:${id}`,
    (signal) => getSenator(id, { signal }),
    null,
    { ttl: 21600_000 },
  )
  const mandates = useLive(
    `senado:mandates:${id}`,
    (signal) => listSenatorMandates(id, { signal }),
    [] as SenatorMandate[],
    { ttl: 86400_000 },
  )

  const person = profile.data
  const current = mandates.data[0]

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={person?.nome ?? fallbackName} photo={person?.urlFoto ?? fallbackPhoto} size={72} />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold">{person?.nome ?? fallbackName}</h1>
            <p className="text-muted-foreground">
              {person?.nomeCompleto ?? fallbackName}
              {person?.siglaPartido ? ` · ${person.siglaPartido} · ${person.siglaUf}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="positive">Em exercício</Badge>
              {current?.DescricaoParticipacao ? (
                <Badge variant="outline">{current.DescricaoParticipacao}</Badge>
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-4 border-t border-border pt-3">
          <LiveStatus result={profile} source="Senado Federal, ficha do parlamentar" />
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Mandato"
          value={current ? mandateTerm(current) : '—'}
          hint={current ? `Legislatura ${current.PrimeiraLegislaturaDoMandato?.NumeroLegislatura ?? ''}` : undefined}
        />
        <Stat
          label="Nascimento"
          value={person?.nascimento ? formatDate(person.nascimento) : '—'}
          hint={person?.naturalidade ? `${person.naturalidade}, ${person.ufNaturalidade}` : undefined}
        />
        <Stat label="Estado que representa" value={person?.siglaUf ?? '—'} />
      </div>

      {person?.gabinete || person?.email || person?.pagina ? (
        <Card>
          <CardTitle>Contato oficial</CardTitle>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {person.gabinete ? <li>{person.gabinete}</li> : null}
            {person.email ? (
              <li>
                <a href={`mailto:${person.email}`} className="text-primary underline underline-offset-2">
                  {person.email}
                </a>
              </li>
            ) : null}
          </ul>
          {person.pagina ? (
            <a
              href={person.pagina}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-accent"
            >
              Página no Senado
            </a>
          ) : null}
          <p className="mt-3 text-xs text-muted-foreground">
            Dados publicados pelo Senado Federal. Não passam por conferência independente.
          </p>
        </Card>
      ) : null}

      {mandates.data.length > 0 ? (
        <Card>
          <CardTitle>Mandatos</CardTitle>
          <ol className="mt-3 space-y-2 text-sm">
            {mandates.data.map((mandate, index) => (
              <li key={index} className="flex flex-wrap items-center gap-2">
                <Badge variant={index === 0 ? 'primary' : 'default'}>{mandate.UfParlamentar}</Badge>
                <span>{mandate.DescricaoParticipacao}</span>
                <span className="text-muted-foreground">{mandateTerm(mandate)}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 border-t border-border pt-3">
            <LiveStatus result={mandates} source="Senado Federal, mandatos" />
          </div>
        </Card>
      ) : null}
    </div>
  )
}
