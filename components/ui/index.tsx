import type { ComponentProps, ElementType, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export { Button, buttonVariants } from './button'
export { Breadcrumbs, type Crumb } from './breadcrumbs'

export function Card({
  className,
  as: Tag = 'div',
  interactive = false,
  ...props
}: ComponentProps<'div'> & { as?: ElementType; interactive?: boolean; href?: string }) {
  return (
    <Tag
      data-slot="card"
      className={cn(
        'rounded-lg border border-border bg-card p-4 text-card-foreground sm:p-5',
        interactive && 'transition-colors hover:border-ring/40 hover:bg-accent',
        className,
      )}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  return <h3 data-slot="card-title" className={cn('text-[0.9375rem] font-semibold', className)} {...props} />
}

export function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('mt-1 text-sm text-muted-foreground', className)} {...props} />
}

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-secondary text-secondary-foreground',
        primary: 'border-transparent bg-primary/10 text-primary',
        positive: 'border-transparent bg-positive/12 text-positive',
        negative: 'border-transparent bg-negative/12 text-negative',
        warning: 'border-transparent bg-warning/14 text-warning',
        outline: 'border-border text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export function Badge({
  className,
  variant,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'h-10 w-full rounded-md border border-input bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground focus-visible:border-ring',
        className,
      )}
      {...props}
    />
  )
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(
        'h-10 rounded-md border border-input bg-background px-2.5 text-sm transition-colors focus-visible:border-ring',
        className,
      )}
      {...props}
    />
  )
}

export function Toggle({
  className,
  pressed = false,
  ...props
}: ComponentProps<'button'> & { pressed?: boolean }) {
  return (
    <button
      type="button"
      data-slot="toggle"
      aria-pressed={pressed}
      className={cn(
        'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-[0.8125rem] font-medium transition-colors',
        pressed
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground hover:bg-accent',
        className,
      )}
      {...props}
    />
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn('skeleton block h-4 w-full', className)} />
}

export function Separator({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-border', className)} />
}

export function PageHeader({
  title,
  description,
  crumbs,
  action,
}: {
  title: string
  description?: string
  crumbs?: ReactNode
  action?: ReactNode
}) {
  return (
    <header className="space-y-3">
      {crumbs}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
    </header>
  )
}

export function Section({
  title,
  description,
  action,
  children,
  className,
  id,
}: {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={cn('space-y-3', className)}>
      {title ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">{title}</h2>
            {description ? (
              <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function Empty({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-5 py-8 text-center">
      {title ? <p className="text-sm font-medium">{title}</p> : null}
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

const statTones = {
  default: 'text-foreground',
  positive: 'text-positive',
  negative: 'text-negative',
  warning: 'text-warning',
}

export function Stat({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: keyof typeof statTones
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
      <p className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className={cn('mt-1 truncate text-lg font-semibold tabular-nums sm:text-xl', statTones[tone])}>
        {value}
      </p>
      {hint ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function Prose({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'max-w-2xl leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:mb-1 [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol>li]:list-decimal [&_p]:my-3 [&_p]:text-muted-foreground [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-xs [&_table]:w-full [&_table]:text-sm [&_td]:border-b [&_td]:border-border [&_td]:py-2 [&_th]:border-b [&_th]:border-border [&_th]:py-2 [&_th]:text-left [&_ul]:my-3',
        className,
      )}
      {...props}
    />
  )
}
