'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { Command, Home, Landmark, LineChart, Moon, Search, Sun, Users, X } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { Logo } from '@/components/logo'
import { useLive } from '@/lib/live'
import { listDeputies, listSenators } from '@/lib/sources'
import { cn, currentTheme, normalize, setTheme, subscribeTheme } from '@/lib/utils'

export type SearchDoc = { id: string; title: string; subtitle: string; url: string; kind: string }

const primaryNav = [
  { href: '/politicians/', label: 'Políticos', icon: Users },
  { href: '/votings/', label: 'Votações', icon: Landmark },
  { href: '/indicators/', label: 'Indicadores', icon: LineChart },
]

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => 'light' as const)
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <Button
      variant="ghost"
      size="icon"
      title={next === 'dark' ? 'Tema escuro' : 'Tema claro'}
      aria-label={next === 'dark' ? 'Usar tema escuro' : 'Usar tema claro'}
      onClick={() => setTheme(next)}
    >
      {theme === 'dark' ? <Moon size={17} aria-hidden /> : <Sun size={17} aria-hidden />}
    </Button>
  )
}

function useStaticIndex() {
  const [docs, setDocs] = useState<SearchDoc[]>([])
  useEffect(() => {
    let alive = true
    fetch('/api/v1/search.json')
      .then((response) => (response.ok ? response.json() : []))
      .then((data: SearchDoc[]) => {
        if (alive) setDocs(data)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])
  return docs
}

const kindLabels: Record<string, string> = {
  deputy: 'Deputado',
  senator: 'Senador',
  office: 'Cargo',
  topic: 'Tema',
  check: 'Verificação',
  glossary: 'Glossário',
  page: 'Página',
}

function rank(doc: SearchDoc, terms: string[]) {
  const title = normalize(doc.title)
  const haystack = `${title} ${normalize(doc.subtitle)}`
  let score = 0
  for (const term of terms) {
    if (!haystack.includes(term)) return 0
    if (title.startsWith(term)) score += 6
    else if (title.includes(` ${term}`)) score += 4
    else if (title.includes(term)) score += 2
    else score += 1
  }
  return score
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const [pointer, setPointer] = useState({ key: '', index: 0 })
  const inputRef = useRef<HTMLInputElement>(null)
  const staticDocs = useStaticIndex()
  const { data: deputies } = useLive('camara:deputies', (signal) => listDeputies({ signal }), [], {
    ttl: 21600_000,
  })
  const { data: senators } = useLive('senado:senators', (signal) => listSenators({ signal }), [], {
    ttl: 21600_000,
  })

  const docs = useMemo<SearchDoc[]>(
    () => [
      ...deputies.map((person) => ({
        id: `deputy-${person.id}`,
        title: person.nome,
        subtitle: `Deputado federal · ${person.siglaPartido} · ${person.siglaUf}`,
        url: `/politicians/${person.id}/`,
        kind: 'deputy',
      })),
      ...senators.map((person) => ({
        id: `senator-${person.id}`,
        title: person.nome,
        subtitle: `Senador · ${person.siglaPartido} · ${person.siglaUf}`,
        url: `/senators/${person.id}/`,
        kind: 'senator',
      })),
      ...staticDocs,
    ],
    [deputies, senators, staticDocs],
  )

  const results = useMemo(() => {
    const terms = normalize(deferred).split(/\s+/).filter(Boolean)
    if (terms.length === 0) return docs.filter((doc) => doc.kind === 'page').slice(0, 8)
    return docs
      .map((doc) => ({ doc, score: rank(doc, terms) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((item) => item.doc)
  }, [docs, deferred])

  const cursor = pointer.key === deferred ? pointer.index : 0
  const moveCursor = (index: number) =>
    setPointer({ key: deferred, index: Math.max(0, Math.min(index, results.length - 1)) })

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(timer)
      document.body.style.overflow = previous
    }
  }, [])

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') return onClose()
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      moveCursor(cursor + 1)
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      moveCursor(cursor - 1)
    }
    if (event.key === 'Enter' && results[cursor]) window.location.href = results[cursor].url
  }

  return (
    <div
      className="animate-fade fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-3 pt-[max(8vh,calc(var(--safe-top)+1rem))] pb-[max(2rem,var(--safe-bottom))] sm:items-center sm:pt-3"
      onMouseDown={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
        className="animate-rise flex max-h-full w-full max-w-[38rem] flex-col overflow-hidden rounded-lg border border-border bg-popover"
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search size={17} aria-hidden className="text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            enterKeyHint="go"
            placeholder="Buscar parlamentar, cargo, tema ou verificação"
            aria-label="Buscar"
            className="h-13 w-full bg-transparent text-[0.9375rem] outline-none placeholder:text-muted-foreground"
          />
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar busca">
            <X size={17} aria-hidden />
          </Button>
        </div>
        <ul className="hide-scrollbar overflow-y-auto overscroll-contain p-1.5">
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-muted-foreground">
              {deferred ? 'Nada encontrado.' : 'Carregando as listas oficiais…'}
            </li>
          ) : (
            results.map((doc, index) => (
              <li key={doc.id}>
                <Link
                  href={doc.url}
                  onClick={onClose}
                  onMouseEnter={() => moveCursor(index)}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-md px-3 py-2.5',
                    index === cursor && 'bg-accent',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{doc.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{doc.subtitle}</span>
                  </span>
                  <Badge variant="outline">{kindLabels[doc.kind] ?? doc.kind}</Badge>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href)

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = isActive(pathname, href)
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'inline-flex h-8 items-center rounded-md px-3 text-sm transition-colors',
        active
          ? 'bg-accent font-medium text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      {label}
    </Link>
  )
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const openPalette = useCallback(() => setPaletteOpen(true), [])

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setPaletteOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const mobileNav = [{ href: '/', label: 'Início', icon: Home }, ...primaryNav]

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 pt-[var(--safe-top)] backdrop-blur">
        <div className="container-page flex h-[var(--header)] items-center gap-1">
          <Link href="/" aria-label="Politica+, ir para o início" className="mr-2 flex items-center">
            <Logo size={26} />
          </Link>

          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex items-center gap-0.5">
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <NavLink href={link.href} label={link.label} pathname={pathname} />
                </li>
              ))}
              <li>
                <NavLink href="/mais/" label="Mais" pathname={pathname} />
              </li>
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={openPalette}
              aria-label="Buscar"
              className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent md:h-8 md:w-auto md:gap-2 md:border md:border-border md:px-2.5 md:text-sm"
            >
              <Search size={17} aria-hidden className="md:size-[15px]" />
              <span className="hidden lg:inline">Buscar</span>
              <kbd className="hidden items-center gap-0.5 rounded border border-border px-1 font-sans text-[0.625rem] lg:inline-flex">
                <Command size={9} aria-hidden />K
              </kbd>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main
        id="main"
        className="container-page animate-rise space-y-8 py-6 pb-[calc(var(--tabbar)+2rem)] md:pb-14"
      >
        {children}
      </main>

      <nav
        aria-label="Navegação"
        data-print="hide"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[var(--safe-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {mobileNav.map((link) => {
            const active = isActive(pathname, link.href)
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-14 flex-col items-center justify-center gap-1 text-[0.625rem]',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <link.icon size={19} aria-hidden strokeWidth={active ? 2.3 : 1.7} />
                  {link.label}
                </Link>
              </li>
            )
          })}
          <li>
            <Link
              href="/mais/"
              aria-current={isActive(pathname, '/mais/') ? 'page' : undefined}
              className={cn(
                'flex h-14 flex-col items-center justify-center gap-1 text-[0.625rem]',
                isActive(pathname, '/mais/') ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Command size={19} aria-hidden strokeWidth={isActive(pathname, '/mais/') ? 2.3 : 1.7} />
              Mais
            </Link>
          </li>
        </ul>
      </nav>

      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} /> : null}
    </>
  )
}
