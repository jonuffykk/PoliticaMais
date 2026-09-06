'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import { ChevronDown, RefreshCw, WifiOff } from 'lucide-react'
import { Avatar } from '@/components/blocks'
import {
  Badge,
  Button,
  Card,
  CardTitle,
  Empty,
  Input,
  Select,
  Skeleton,
  Stat,
  Toggle,
} from '@/components/ui'
import { useClock, useLive, type LiveResult } from '@/lib/live'
import {
  brazilianDate,
  getSeries,
  listBodies,
  listDeputies,
  listFronts,
  listHistory,
  listProposals,
  listVotingRecords,
  listVotings,
  positionByLabel,
  seriesCatalog,
  seriesWindows,
  type CamaraDeputy,
  type CamaraBody,
  type CamaraDeputyDetail,
  type CamaraFront,
  type CamaraHistory,
  type CamaraProposal,
  type CamaraVoteRecord,
  type CamaraVoting,
} from '@/lib/sources'
import { getDeputy } from '@/lib/sources'
import {
  cn,
  formatDate,
  formatNumber,
  formatRelative,
  formatShortDate,
  brazilStates,
  groupBy,
  normalize,
} from '@/lib/utils'

export function LiveStatus({ result, source }: { result: LiveResult<unknown>; source: string }) {
  const now = useClock()
  const age = result.updatedAt && now ? now - result.updatedAt : null
  const fresh = age !== null && age < 300_000

  const label =
    result.freshness === 'loading'
      ? 'consultando a fonte'
      : result.freshness === 'error' && result.updatedAt === null
        ? 'fonte fora do ar'
        : result.updatedAt === null
          ? 'dado do build'
          : age === null
            ? 'consultado'
            : `consultado ${formatRelative(result.updatedAt, now)}`

  const tone =
    result.freshness === 'error'
      ? 'text-negative'
      : fresh
        ? 'text-positive'
        : 'text-muted-foreground'

  return (
    <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5">
        <span className={cn('inline-flex shrink-0 items-center gap-1.5 font-medium', tone)}>
          {result.freshness === 'error' ? (
            <WifiOff size={12} aria-hidden />
          ) : (
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full bg-current',
                result.freshness === 'loading' && 'animate-pulse',
              )}
            />
          )}
          {label}
        </span>
        <span className="truncate">· {source}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={result.refresh}
        aria-label="Consultar a fonte de novo"
        title="Consultar a fonte de novo"
        className="shrink-0 px-2 text-xs"
      >
        <RefreshCw
          size={13}
          aria-hidden
          className={result.freshness === 'loading' ? 'animate-spin' : ''}
        />
        <span className="hidden sm:inline">Atualizar</span>
      </Button>
    </div>
  )
}

type Point = { date: string; value: number }

function Chart({ series, unit, height = 132 }: { series: Point[]; unit: string; height?: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const width = 320
  const pad = 6

  const points = useMemo(() => {
    if (series.length <= 180) return series
    const step = Math.ceil(series.length / 180)
    const sampled = series.filter((_, index) => index % step === 0)
    const last = series[series.length - 1]
    if (sampled[sampled.length - 1] !== last) sampled.push(last)
    return sampled
  }, [series])

  const geometry = useMemo(() => {
    if (points.length < 2) return null
    const values = points.map((point) => point.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || Math.abs(max) || 1
    const x = (index: number) => pad + (index / (points.length - 1)) * (width - pad * 2)
    const y = (value: number) => pad + (1 - (value - min) / span) * (height - pad * 2)
    const line = points.map((point, index) => `${x(index)},${y(point.value)}`).join(' ')
    return { min, max, x, y, line, area: `${pad},${height} ${line} ${width - pad},${height}` }
  }, [points, height])

  if (!geometry) return null

  const active = hover === null ? points.length - 1 : hover
  const point = points[active]
  const gradientId = `grad-${unit.replace(/\W/g, '')}-${points.length}`

  return (
    <figure className="mt-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-32 w-full touch-none"
        role="img"
        aria-label={`Série de ${points.length} pontos, de ${formatShortDate(points[0].date)} a ${formatShortDate(points[points.length - 1].date)}`}
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect()
          const ratio = (event.clientX - box.left) / box.width
          setHover(Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1)))))
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={geometry.area} fill={`url(#${gradientId})`} />
        <polyline
          points={geometry.line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={geometry.x(active)}
          x2={geometry.x(active)}
          y1={pad}
          y2={height - pad}
          stroke="var(--border)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx={geometry.x(active)}
          cy={geometry.y(point.value)}
          r="3.5"
          fill="var(--primary)"
          stroke="var(--card)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <figcaption className="mt-1.5 flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{formatDate(point.date, 'month')}</span>
        <span className="font-medium text-foreground">{formatNumber(point.value, unit)}</span>
      </figcaption>
    </figure>
  )
}

function IndicatorCard({ item }: { item: (typeof seriesCatalog)[number] }) {
  const [months, setMonths] = useState<number>(item.months)
  const result = useLive(
    `bcb:${item.code}:${months}`,
    async (signal) => {
      const rows = await getSeries(item.code, months, { signal })
      return rows
        .map((row) => ({ date: brazilianDate(row.data), value: Number(row.valor) }))
        .filter((point) => Number.isFinite(point.value))
    },
    [] as Point[],
    { ttl: 3600_000 },
  )

  const series = result.data
  const last = series[series.length - 1]
  const previous = series[series.length - 2]
  const delta = last && previous ? last.value - previous.value : null
  const tone = delta === null || delta === 0 ? 'neutral' : delta > 0 ? 'negative' : 'positive'

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <CardTitle>{item.name}</CardTitle>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {last ? formatNumber(last.value, item.unit) : <Skeleton className="h-7 w-28" />}
          </p>
        </div>
        {delta !== null ? (
          <Badge variant={tone === 'neutral' ? 'default' : tone}>
            {delta > 0 ? '+' : ''}
            {formatNumber(delta, item.unit)}
          </Badge>
        ) : null}
      </div>

      {series.length > 1 ? (
        <Chart series={series} unit={item.unit} />
      ) : (
        <Skeleton className="mt-4 h-32 w-full" />
      )}

      <div className="mt-3 flex gap-1.5">
        {seriesWindows.map((option) => (
          <Toggle
            key={option.months}
            pressed={months === option.months}
            onClick={() => setMonths(option.months)}
          >
            {option.label}
          </Toggle>
        ))}
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <LiveStatus result={result} source={`Banco Central, série ${item.code}`} />
      </div>
    </Card>
  )
}

export function IndicatorBoard() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {seriesCatalog.map((item) => (
        <IndicatorCard key={item.id} item={item} />
      ))}
    </div>
  )
}

export function DeputyDirectory({ fallback }: { fallback: CamaraDeputy[] }) {
  const result = useLive('camara:deputies', (signal) => listDeputies({ signal }), fallback, {
    ttl: 21600_000,
  })
  const [query, setQuery] = useState('')
  const [party, setParty] = useState('')
  const [state, setState] = useState('')
  const [pager, setPager] = useState({ key: '', limit: 60 })
  const deferred = useDeferredValue(query)

  const parties = useMemo(
    () => [...new Set(result.data.map((deputy) => deputy.siglaPartido))].filter(Boolean).sort(),
    [result.data],
  )

  const filtered = useMemo(() => {
    const terms = normalize(deferred).split(/\s+/).filter(Boolean)
    return result.data.filter((deputy) => {
      if (party && deputy.siglaPartido !== party) return false
      if (state && deputy.siglaUf !== state) return false
      if (terms.length === 0) return true
      const haystack = normalize(`${deputy.nome} ${deputy.siglaPartido} ${deputy.siglaUf}`)
      return terms.every((term) => haystack.includes(term))
    })
  }, [result.data, deferred, party, state])

  const filterKey = `${deferred}|${party}|${state}`
  const limit = pager.key === filterKey ? pager.limit : 60

  const loading = result.freshness === 'loading' && result.data.length === 0

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-20 -mx-4 space-y-3 border-b border-border bg-background/92 px-4 py-3 backdrop-blur-md">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtrar por nome, partido ou estado"
          aria-label="Filtrar deputados"
          enterKeyHint="search"
        />
        <div className="flex gap-2">
          <Select
            value={party}
            onChange={(event) => setParty(event.target.value)}
            aria-label="Partido"
            className="flex-1"
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
            className="flex-1"
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

      <LiveStatus result={result} source="Câmara dos Deputados, dados abertos" />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-[4.75rem] rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Empty title="Nenhum resultado">
          Ajuste o filtro. A base tem {result.data.length} parlamentares em exercício.
        </Empty>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {filtered.length} de {result.data.length} parlamentares
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {filtered.slice(0, limit).map((deputy) => (
              <li key={deputy.id}>
                <Link
                  href={`/politicians/${deputy.id}/`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted"
                >
                  <Avatar name={deputy.nome} photo={deputy.urlFoto} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{deputy.nome}</span>
                    <span className="block text-sm text-muted-foreground">
                      {deputy.siglaPartido} · {deputy.siglaUf}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {filtered.length > limit ? (
            <Button variant="outline" className="w-full" onClick={() => setPager({ key: filterKey, limit: limit + 60 })}>
              Mostrar mais {Math.min(60, filtered.length - limit)}
            </Button>
          ) : null}
        </>
      )}
    </div>
  )
}

const tallyLabels = {
  sim: 'Sim',
  nao: 'Não',
  abstencao: 'Abstenção',
  obstrucao: 'Obstrução',
  ausente: 'Art. 17',
} as const

const tallyTones = {
  sim: 'positive',
  nao: 'negative',
  abstencao: 'warning',
  obstrucao: 'warning',
  ausente: 'default',
} as const

type TallyKey = keyof typeof tallyLabels

function VoterList({ records }: { records: CamaraVoteRecord[] }) {
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState<TallyKey | ''>('')
  const [pager, setPager] = useState({ key: '', limit: 24 })
  const deferred = useDeferredValue(query)

  const rows = useMemo(
    () =>
      records
        .map((record) => ({ record, key: positionByLabel[record.tipoVoto] as TallyKey | undefined }))
        .filter((row): row is { record: CamaraVoteRecord; key: TallyKey } => Boolean(row.key))
        .sort((a, b) => a.record.deputado_.nome.localeCompare(b.record.deputado_.nome, 'pt-BR')),
    [records],
  )

  const filtered = useMemo(() => {
    const terms = normalize(deferred).split(/\s+/).filter(Boolean)
    return rows.filter((row) => {
      if (position && row.key !== position) return false
      if (terms.length === 0) return true
      const person = row.record.deputado_
      const haystack = normalize(`${person.nome} ${person.siglaPartido} ${person.siglaUf}`)
      return terms.every((term) => haystack.includes(term))
    })
  }, [rows, deferred, position])

  const filterKey = `${deferred}|${position}`
  const shown = pager.key === filterKey ? pager.limit : 24

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar deputado, partido ou estado"
          aria-label="Buscar quem votou"
          className="sm:flex-1"
        />
        <Select
          value={position}
          onChange={(event) => setPosition(event.target.value as TallyKey | '')}
          aria-label="Filtrar por voto"
        >
          <option value="">Todos os votos</option>
          {(Object.keys(tallyLabels) as TallyKey[]).map((key) => (
            <option key={key} value={key}>
              {tallyLabels[key]}
            </option>
          ))}
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} de {rows.length} votos registrados
      </p>

      {filtered.length === 0 ? (
        <Empty title="Nenhum voto encontrado">Ajuste a busca ou o filtro.</Empty>
      ) : (
        <>
          <ul className="divide-y divide-border rounded-md border border-border">
            {filtered.slice(0, shown).map((row) => (
              <li key={row.record.deputado_.id} className="flex items-center gap-3 px-3 py-2">
                <Avatar name={row.record.deputado_.nome} photo={row.record.deputado_.urlFoto} size={32} />
                <Link
                  href={`/politicians/${row.record.deputado_.id}/`}
                  className="min-w-0 flex-1 hover:underline"
                >
                  <span className="block truncate text-sm font-medium">{row.record.deputado_.nome}</span>
                  <span className="block text-xs text-muted-foreground">
                    {row.record.deputado_.siglaPartido} · {row.record.deputado_.siglaUf}
                  </span>
                </Link>
                <Badge variant={tallyTones[row.key]}>{tallyLabels[row.key]}</Badge>
              </li>
            ))}
          </ul>
          {filtered.length > shown ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPager({ key: filterKey, limit: shown + 60 })}
            >
              Mostrar mais {Math.min(60, filtered.length - shown)}
            </Button>
          ) : null}
        </>
      )}
    </div>
  )
}

function VotingTally({ voting }: { voting: CamaraVoting }) {
  const result = useLive(
    `camara:votes:${voting.id}`,
    (signal) => listVotingRecords(voting.id, { signal }),
    [] as CamaraVoteRecord[],
    { ttl: 86400_000 },
  )
  const [view, setView] = useState<'partido' | 'pessoa'>('partido')

  const tally = useMemo(() => {
    const counts = new Map<string, number>()
    for (const record of result.data) {
      const position = positionByLabel[record.tipoVoto]
      if (position) counts.set(position, (counts.get(position) ?? 0) + 1)
    }
    return counts
  }, [result.data])

  const byParty = useMemo(() => {
    const groups = groupBy(
      result.data.filter((record) => positionByLabel[record.tipoVoto]),
      (record) => record.deputado_.siglaPartido,
    )
    return [...groups.entries()]
      .map(([name, records]) => ({
        name,
        yes: records.filter((record) => record.tipoVoto === 'Sim').length,
        no: records.filter((record) => record.tipoVoto === 'Não').length,
        total: records.length,
      }))
      .sort((a, b) => b.total - a.total)
  }, [result.data])

  if (result.freshness === 'loading' && result.data.length === 0) {
    return <Skeleton className="mt-4 h-40 w-full" />
  }

  if (result.data.length === 0) {
    return (
      <p className="mt-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
        Votação simbólica: o plenário decidiu sem registrar voto individual, então não há lista de quem
        votou o quê.
      </p>
    )
  }

  return (
    <div className="mt-4 space-y-4 border-t border-border pt-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(tallyLabels) as TallyKey[])
          .filter((key) => tally.get(key))
          .map((key) => (
            <Stat key={key} label={tallyLabels[key]} value={tally.get(key) ?? 0} tone={tallyTones[key]} />
          ))}
      </div>

      <div className="flex gap-1.5">
        <Toggle pressed={view === 'partido'} onClick={() => setView('partido')}>
          Por partido
        </Toggle>
        <Toggle pressed={view === 'pessoa'} onClick={() => setView('pessoa')}>
          Quem votou o quê
        </Toggle>
      </div>

      {view === 'partido' ? (
        <ul className="space-y-1.5">
          {byParty.map((party) => (
            <li key={party.name} className="flex items-center gap-3 text-sm">
              <span className="w-24 shrink-0 truncate font-medium">{party.name}</span>
              <span className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="bg-positive"
                  style={{ width: `${(party.yes / party.total) * 100}%` }}
                  aria-hidden
                />
                <span
                  className="bg-negative"
                  style={{ width: `${(party.no / party.total) * 100}%` }}
                  aria-hidden
                />
              </span>
              <span className="w-20 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {party.yes} a {party.no}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <VoterList records={result.data} />
      )}

      <LiveStatus result={result} source={`Votos nominais da votação ${voting.id}`} />
    </div>
  )
}

export function VotingFeed({ limit = 20 }: { limit?: number }) {
  const result = useLive(
    `camara:votings:${limit}`,
    (signal) => listVotings(limit, { signal }),
    [] as CamaraVoting[],
    { ttl: 1800_000 },
  )
  const [open, setOpen] = useState<string | null>(null)

  if (result.freshness === 'loading' && result.data.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-24 rounded-lg" />
        ))}
      </div>
    )
  }

  if (result.data.length === 0) {
    return (
      <Empty title="Sem votações agora">
        A API da Câmara não devolveu votações. Tente atualizar em alguns minutos.
      </Empty>
    )
  }

  return (
    <div className="space-y-3">
      <LiveStatus result={result} source="Câmara dos Deputados, votações do plenário" />
      {result.data.map((voting) => {
        const proposal = voting.proposicoesAfetadas?.[0]
        const title = proposal
          ? `${proposal.siglaTipo} ${proposal.numero}/${proposal.ano}`
          : voting.descricao
        const summary = proposal ? proposal.ementa?.trim() || voting.descricao : null
        const expanded = open === voting.id
        return (
          <Card key={voting.id}>
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : voting.id)}
              aria-expanded={expanded}
              className="flex w-full items-start gap-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <Badge variant={voting.aprovacao ? 'positive' : 'negative'}>
                    {voting.aprovacao ? 'aprovado' : 'rejeitado'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatShortDate(voting.data)} · {voting.siglaOrgao}
                  </span>
                </span>
                <span className="mt-2 line-clamp-3 block font-medium">{title}</span>
                {summary ? (
                  <span className="mt-1 line-clamp-3 block text-sm text-muted-foreground">{summary}</span>
                ) : null}
              </span>
              <ChevronDown
                size={18}
                aria-hidden
                className={cn('mt-1 shrink-0 text-muted-foreground transition-transform', expanded && 'rotate-180')}
              />
            </button>
            {expanded ? <VotingTally voting={voting} /> : null}
          </Card>
        )
      })}
    </div>
  )
}

export function PoliticianLive({
  id,
  fallbackName,
  fallbackPhoto,
}: {
  id: string
  fallbackName: string
  fallbackPhoto?: string
}) {
  const profile = useLive<CamaraDeputyDetail | null>(
    `camara:deputy:${id}`,
    (signal) => getDeputy(id, { signal }),
    null,
    { ttl: 21600_000 },
  )
  const history = useLive(
    `camara:history:${id}`,
    (signal) => listHistory(id, { signal }),
    [] as CamaraHistory[],
    { ttl: 86400_000 },
  )
  const bodies = useLive(
    `camara:bodies:${id}`,
    (signal) => listBodies(id, { signal }),
    [] as CamaraBody[],
    { ttl: 86400_000 },
  )
  const proposals = useLive(
    `camara:proposals:${id}`,
    (signal) => listProposals(id, { signal }),
    [] as CamaraProposal[],
    { ttl: 43200_000 },
  )
  const fronts = useLive(
    `camara:fronts:${id}`,
    (signal) => listFronts(id, { signal }),
    [] as CamaraFront[],
    { ttl: 604800_000 },
  )

  const status = profile.data?.ultimoStatus

  const partyChanges = useMemo(() => {
    const ordered = [...history.data].sort((a, b) => a.dataHora.localeCompare(b.dataHora))
    const changes: { party: string; since: string }[] = []
    for (const entry of ordered) {
      if (!entry.siglaPartido) continue
      if (changes[changes.length - 1]?.party !== entry.siglaPartido) {
        changes.push({ party: entry.siglaPartido, since: entry.dataHora.slice(0, 10) })
      }
    }
    return changes.reverse()
  }, [history.data])

  const currentBodies = useMemo(
    () => bodies.data.filter((body) => !body.dataFim).slice(0, 10),
    [bodies.data],
  )

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={status?.nome ?? fallbackName} photo={status?.urlFoto ?? fallbackPhoto} size={72} />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold">{status?.nomeEleitoral ?? fallbackName}</h1>
            <p className="text-muted-foreground">
              {profile.data?.nomeCivil ?? fallbackName}
              {status ? ` · ${status.siglaPartido} · ${status.siglaUf}` : ''}
            </p>
            {status ? (
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant={status.situacao === 'Exercício' ? 'positive' : 'warning'}>
                  {status.situacao}
                </Badge>
                <Badge variant="outline">{status.condicaoEleitoral}</Badge>
                <Badge variant="outline">legislatura {status.idLegislatura}</Badge>
              </div>
            ) : (
              <Skeleton className="mt-2 h-6 w-52" />
            )}
          </div>
        </div>
        {status?.descricaoStatus ? (
          <p className="mt-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
            {status.descricaoStatus}
          </p>
        ) : null}
        <div className="mt-4 border-t border-border pt-3">
          <LiveStatus result={profile} source="Câmara dos Deputados, ficha do parlamentar" />
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Escolaridade" value={profile.data?.escolaridade ?? '—'} />
        <Stat
          label="Nascimento"
          value={profile.data?.dataNascimento ? formatDate(profile.data.dataNascimento) : '—'}
          hint={
            profile.data?.municipioNascimento
              ? `${profile.data.municipioNascimento}, ${profile.data.ufNascimento}`
              : undefined
          }
        />
        <Stat
          label="Frentes parlamentares"
          value={fronts.data.length > 0 ? fronts.data.length : '—'}
          hint="assinaturas declaradas"
        />
      </div>

      {partyChanges.length > 0 ? (
        <Card>
          <CardTitle>Trajetória partidária</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Troca de partido é um sinal pouco divulgado e bastante informativo.
          </p>
          <ol className="mt-4 space-y-3">
            {partyChanges.map((change, index) => (
              <li key={`${change.party}-${change.since}`} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={cn(
                    'h-2.5 w-2.5 shrink-0 rounded-full',
                    index === 0 ? 'bg-primary' : 'bg-border',
                  )}
                />
                <Badge variant={index === 0 ? 'primary' : 'default'}>{change.party}</Badge>
                <span className="text-sm text-muted-foreground">desde {formatDate(change.since)}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 border-t border-border pt-3">
            <LiveStatus result={history} source="Câmara dos Deputados, histórico do mandato" />
          </div>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Propostas apresentadas</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">
          As mais recentes em que o parlamentar consta como autor.
        </p>
        {proposals.freshness === 'loading' && proposals.data.length === 0 ? (
          <Skeleton className="mt-4 h-32 w-full" />
        ) : proposals.data.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nenhuma proposta registrada como autoria.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {proposals.data.slice(0, 8).map((proposal) => (
              <li key={proposal.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <a
                  href={`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=${proposal.id}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm font-medium text-primary"
                >
                  {proposal.siglaTipo} {proposal.numero}
                  {proposal.ano ? `/${proposal.ano}` : ''}
                </a>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{proposal.ementa}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 border-t border-border pt-3">
          <LiveStatus
            result={proposals}
            source="Câmara dos Deputados, proposições por autor"
          />
        </div>
      </Card>

      {currentBodies.length > 0 ? (
        <Card>
          <CardTitle>Comissões e órgãos</CardTitle>
          <ul className="mt-3 space-y-2.5">
            {currentBodies.map((body) => (
              <li key={`${body.idOrgao}-${body.dataInicio}`} className="text-sm">
                <span className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{body.titulo}</Badge>
                  <span className="font-medium">{body.siglaOrgao}</span>
                </span>
                <span className="mt-0.5 block text-muted-foreground">{body.nomePublicacao || body.nomeOrgao}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-border pt-3">
            <LiveStatus result={bodies} source="Câmara dos Deputados, órgãos do parlamentar" />
          </div>
        </Card>
      ) : null}

      {profile.data && profile.data.redeSocial.length > 0 ? (
        <Card>
          <CardTitle>Perfis declarados</CardTitle>
          <ul className="mt-3 flex flex-wrap gap-2">
            {profile.data.redeSocial.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-9 items-center rounded-full border border-border px-3.5 text-sm text-primary"
                >
                  {new URL(url).hostname.replace('www.', '')}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Endereços informados pelo próprio parlamentar à Câmara. Não passam por
            conferência.
          </p>
        </Card>
      ) : null}
    </div>
  )
}

export function HomeHighlights() {
  const votings = useLive('camara:votings:4', (signal) => listVotings(4, { signal }), [] as CamaraVoting[], {
    ttl: 1800_000,
  })
  const ipca = useLive(
    'bcb:433:home',
    async (signal) => {
      const rows = await getSeries(433, 3, { signal })
      return rows.map((row) => ({ date: brazilianDate(row.data), value: Number(row.valor) }))
    },
    [] as Point[],
  )
  const selic = useLive(
    'bcb:432:home',
    async (signal) => {
      const rows = await getSeries(432, 2, { signal })
      return rows.map((row) => ({ date: brazilianDate(row.data), value: Number(row.valor) }))
    },
    [] as Point[],
  )
  const lastIpca = ipca.data[ipca.data.length - 1]
  const lastSelic = selic.data[selic.data.length - 1]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat
          label="IPCA"
          value={lastIpca ? formatNumber(lastIpca.value, '%') : <Skeleton className="h-6 w-20" />}
          hint={lastIpca ? formatDate(lastIpca.date, 'month') : undefined}
        />
        <Stat
          label="Selic"
          value={lastSelic ? formatNumber(lastSelic.value, '%') : <Skeleton className="h-6 w-20" />}
          hint={lastSelic ? formatDate(lastSelic.date, 'month') : undefined}
        />
        <Stat
          label="Votações"
          value={votings.data.length > 0 ? votings.data.length : <Skeleton className="h-6 w-10" />}
          hint="no plenário"
        />
      </div>

      {votings.data.length > 0 ? (
        <ul className="space-y-2">
          {votings.data.map((voting) => {
            const proposal = voting.proposicoesAfetadas?.[0]
            return (
              <li key={voting.id}>
                <Link
                  href="/votings/"
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5 transition-colors hover:bg-muted"
                >
                  <Badge variant={voting.aprovacao ? 'positive' : 'negative'}>
                    {voting.aprovacao ? 'aprovado' : 'rejeitado'}
                  </Badge>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {proposal
                        ? `${proposal.siglaTipo} ${proposal.numero}/${proposal.ano}`
                        : voting.descricao}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{formatShortDate(voting.data)}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <Skeleton className="h-40 w-full rounded-lg" />
      )}

      <LiveStatus result={votings} source="Câmara dos Deputados e Banco Central" />
    </div>
  )
}
