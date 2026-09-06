'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge, Card, Empty, Skeleton, Stat } from '@/components/ui'
import { useLive } from '@/lib/live'
import {
  listVotingRecords,
  listVotings,
  positionByLabel,
  type CamaraVoteRecord,
  type CamaraVoting,
} from '@/lib/sources'
import { formatShortDate } from '@/lib/utils'

const sample = 30

const labels = {
  sim: 'Sim',
  nao: 'Não',
  abstencao: 'Abstenção',
  obstrucao: 'Obstrução',
  ausente: 'Art. 17',
} as const

const tones = {
  sim: 'positive',
  nao: 'negative',
  abstencao: 'warning',
  obstrucao: 'warning',
  ausente: 'default',
} as const

type Key = keyof typeof labels

type Entry = {
  voting: CamaraVoting
  key: Key | null
  partyYes: number
  partyNo: number
}

export function VotingRecord({ deputyId, party }: { deputyId: string; party?: string }) {
  const votings = useLive(
    `camara:votings:${sample}`,
    (signal) => listVotings(sample, { signal }),
    [] as CamaraVoting[],
    { ttl: 1800_000 },
  )

  const batch = votings.data.map((voting) => voting.id).join(',')
  const [loaded, setLoaded] = useState<{ key: string; entries: Entry[] }>({ key: '', entries: [] })

  useEffect(() => {
    if (!batch) return
    const controller = new AbortController()
    Promise.all(
      votings.data.map((voting) =>
        listVotingRecords(voting.id, { signal: controller.signal })
          .then((records) => ({ voting, records }))
          .catch(() => ({ voting, records: [] as CamaraVoteRecord[] })),
      ),
    )
      .then((results) => {
        if (controller.signal.aborted) return
        const entries = results
          .filter((item) => item.records.length > 0)
          .map(({ voting, records }) => {
            const own = records.find((record) => String(record.deputado_.id) === deputyId)
            const peers = party
              ? records.filter((record) => record.deputado_.siglaPartido === party)
              : []
            return {
              voting,
              key: own ? ((positionByLabel[own.tipoVoto] ?? null) as Key | null) : null,
              partyYes: peers.filter((record) => record.tipoVoto === 'Sim').length,
              partyNo: peers.filter((record) => record.tipoVoto === 'Não').length,
            }
          })
        setLoaded({ key: batch, entries })
      })
      .catch(() => undefined)
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch, deputyId, party])

  const ready = loaded.key === batch && batch !== ''
  const entries = useMemo(() => (ready ? loaded.entries : []), [ready, loaded.entries])

  const stats = useMemo(() => {
    const cast = entries.filter((entry) => entry.key && entry.key !== 'ausente')
    const withParty = cast.filter((entry) => entry.partyYes + entry.partyNo > 0)
    const aligned = withParty.filter((entry) => {
      const majority = entry.partyYes >= entry.partyNo ? 'sim' : 'nao'
      return entry.key === majority
    })
    return {
      nominal: entries.length,
      cast: cast.length,
      absent: entries.filter((entry) => !entry.key || entry.key === 'ausente').length,
      alignment: withParty.length > 0 ? Math.round((aligned.length / withParty.length) * 100) : null,
    }
  }, [entries])

  if (!ready) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <Empty title="Sem votação nominal recente">
        As {sample} votações mais recentes do plenário foram simbólicas, e votação simbólica não
        registra quem votou o quê.
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Votações na amostra" value={stats.nominal} hint="nominais e recentes" />
        <Stat label="Votou" value={stats.cast} tone="positive" />
        <Stat
          label="Sem registro"
          value={stats.absent}
          tone={stats.absent > 0 ? 'warning' : 'default'}
        />
        <Stat
          label="Alinhamento partidário"
          value={stats.alignment === null ? '—' : `${stats.alignment}%`}
          hint={party ? `votou com a maioria do ${party}` : undefined}
        />
      </div>

      <Card className="p-0">
        <ul className="divide-y divide-border">
          {entries.map((entry) => {
            const proposal = entry.voting.proposicoesAfetadas?.[0]
            return (
              <li key={entry.voting.id} className="flex items-start gap-3 p-3.5">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {proposal
                      ? `${proposal.siglaTipo} ${proposal.numero}/${proposal.ano}`
                      : entry.voting.descricao}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {formatShortDate(entry.voting.data)} ·{' '}
                    {entry.voting.aprovacao ? 'aprovado' : 'rejeitado'} no plenário
                  </span>
                </span>
                {entry.key ? (
                  <Badge variant={tones[entry.key]}>{labels[entry.key]}</Badge>
                ) : (
                  <Badge variant="outline">sem registro</Badge>
                )}
              </li>
            )
          })}
        </ul>
      </Card>

      <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
        Das {sample} votações mais recentes do plenário, {sample - entries.length} foram simbólicas e
        não registram quem votou o quê. Só as {entries.length}{' '}
        {entries.length === 1 ? 'nominal aparece' : 'nominais aparecem'} acima. Isso não é limitação
        deste site: é como a Câmara decide a maior parte das matérias. Ausência de registro numa
        votação nominal pode ser licença ou missão oficial, não necessariamente falta.
      </p>
    </div>
  )
}
