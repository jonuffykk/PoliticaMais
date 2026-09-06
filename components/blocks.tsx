import Link from 'next/link'
import { Check, ExternalLink, Minus, X } from 'lucide-react'
import { Badge, Card, CardTitle } from '@/components/ui'
import type { Claim, Office, SourceRef, Vote } from '@/lib/content'
import { cn, formatShortDate, initials } from '@/lib/utils'

export function Avatar({
  name,
  photo,
  size = 44,
  className,
}: {
  name: string
  photo?: string
  size?: number
  className?: string
}) {
  const style = { width: size, height: size }
  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={cn('shrink-0 rounded-full bg-muted object-cover', className)}
        style={style}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground',
        className,
      )}
      style={style}
    >
      {initials(name)}
    </span>
  )
}

export function SourceList({ sources, label = 'Fontes' }: { sources: SourceRef[]; label?: string }) {
  if (sources.length === 0) return null
  return (
    <details className="group mt-4 border-t border-border pt-3 text-sm">
      <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground select-none">
        {label} ({sources.length})
        <span className="ml-1 inline-block transition-transform group-open:rotate-90">›</span>
      </summary>
      <ul className="mt-2 space-y-2">
        {sources.map((source) => (
          <li key={source.url} className="text-xs leading-relaxed">
            <a
              href={source.url}
              rel="noreferrer noopener"
              target="_blank"
              className="inline-flex items-center gap-1 font-medium text-primary underline underline-offset-2"
            >
              {source.label}
              <ExternalLink size={11} aria-hidden />
            </a>
            <span className="text-muted-foreground">
              {' · '}
              {source.publisher} · coletado em {formatShortDate(source.retrievedAt)}
            </span>
          </li>
        ))}
      </ul>
    </details>
  )
}

export function OfficePowersCard({ office, compact = false }: { office: Office; compact?: boolean }) {
  return (
    <Card>
      <CardTitle>O que {office.name} pode fazer</CardTitle>
      <p className="mt-2 text-sm text-muted-foreground">{office.summaryPlain}</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-positive uppercase">Pode</p>
          <ul className="space-y-1.5 text-sm">
            {office.canDo.map((item) => (
              <li key={item} className="flex gap-2">
                <Check size={15} aria-hidden className="mt-1 shrink-0 text-positive" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-negative uppercase">Não pode</p>
          <ul className="space-y-1.5 text-sm">
            {office.cannotDo.map((item) => (
              <li key={item} className="flex gap-2">
                <X size={15} aria-hidden className="mt-1 shrink-0 text-negative" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {!compact && office.commonMyths.length > 0 ? (
        <div className="mt-5 rounded-md bg-muted p-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Cobranças que costumam ir para o cargo errado
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {office.commonMyths.map((item) => (
              <li key={item} className="flex gap-2">
                <Minus size={15} aria-hidden className="mt-1 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <SourceList sources={office.sourceRefs} />
    </Card>
  )
}

export const positionLabels: Record<
  Vote['position'],
  { label: string; variant: 'positive' | 'negative' | 'warning' | 'default' }
> = {
  sim: { label: 'Sim', variant: 'positive' },
  nao: { label: 'Não', variant: 'negative' },
  abstencao: { label: 'Abstenção', variant: 'warning' },
  ausente: { label: 'Ausente', variant: 'default' },
  obstrucao: { label: 'Obstrução', variant: 'warning' },
}

export const verdictVariants: Record<string, 'positive' | 'negative' | 'warning' | 'default'> = {
  verdadeiro: 'positive',
  falso: 'negative',
  impreciso: 'warning',
  'sem contexto': 'warning',
  insustentável: 'negative',
  'não verificável': 'default',
}

export function ClaimCard({ claim }: { claim: Claim }) {
  return (
    <Card as={Link} href={`/checks/${claim.id}/`} interactive className="block">
      <span className="flex items-center justify-between gap-2">
        <Badge variant={verdictVariants[claim.verdict] ?? 'default'}>{claim.verdict}</Badge>
        <span className="text-xs text-muted-foreground">{formatShortDate(claim.checkedAt)}</span>
      </span>
      <span className="mt-3 block text-sm leading-snug font-medium">{claim.statement}</span>
      <span className="mt-1.5 block text-xs text-muted-foreground">{claim.subject}</span>
    </Card>
  )
}
