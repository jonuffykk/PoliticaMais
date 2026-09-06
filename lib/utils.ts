import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const dateFormats = {
  long: { dateStyle: 'long' },
  short: { dateStyle: 'short' },
  month: { month: 'short', year: 'numeric' },
} satisfies Record<string, Intl.DateTimeFormatOptions>

function asUtc(iso: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return `${iso}T00:00:00Z`
  if (/^\d{4}-\d{2}-\d{2}T[\d:.]+$/.test(iso)) return `${iso}Z`
  return iso
}

export function formatDate(iso: string, style: keyof typeof dateFormats = 'long') {
  const date = new Date(asUtc(iso))
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('pt-BR', { ...dateFormats[style], timeZone: 'UTC' }).format(date)
}

export const formatShortDate = (iso: string) => formatDate(iso, 'short')

export function formatRelative(timestamp: number, now = Date.now()) {
  const seconds = Math.round((timestamp - now) / 1000)
  if (Math.abs(seconds) < 45) return 'agora'

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['second', 60],
    ['minute', 60],
    ['hour', 24],
    ['day', 7],
    ['week', 4.35],
    ['month', 12],
    ['year', Number.POSITIVE_INFINITY],
  ]
  const formatter = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'always' })
  let value = seconds
  for (const [unit, step] of units) {
    if (Math.abs(value) < step) return formatter.format(Math.round(value), unit)
    value /= step
  }
  return formatter.format(Math.round(value), 'year')
}

export function formatNumber(value: number, unit?: string) {
  const text = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)
  return unit ? `${text} ${unit}` : text
}

export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter((part) => part.length > 2)
  const first = parts[0] ?? name
  const last = parts.length > 1 ? parts[parts.length - 1] : ''
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

export const brazilStates = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT', 'PA', 'PB', 'PE',
  'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
]

export function groupBy<T, K extends string>(items: T[], key: (item: T) => K) {
  const map = new Map<K, T[]>()
  for (const item of items) {
    const group = key(item)
    const bucket = map.get(group)
    if (bucket) bucket.push(item)
    else map.set(group, [item])
  }
  return map
}

export type Theme = 'light' | 'dark'

const themeKey = 'pm:theme'
const themeListeners = new Set<() => void>()

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#161d2b' : '#ffffff')
}

export function subscribeTheme(listener: () => void) {
  themeListeners.add(listener)
  return () => {
    themeListeners.delete(listener)
  }
}

export function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function setTheme(theme: Theme) {
  window.localStorage.setItem(themeKey, theme)
  apply(theme)
  for (const listener of themeListeners) listener()
}

const locationListeners = new Set<() => void>()

export function subscribeLocation(listener: () => void) {
  locationListeners.add(listener)
  window.addEventListener('popstate', listener)
  return () => {
    locationListeners.delete(listener)
    window.removeEventListener('popstate', listener)
  }
}

export function getSearchParam(key: string) {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get(key) ?? ''
}

export function setSearchParam(key: string, value: string) {
  const url = new URL(window.location.href)
  if (value) url.searchParams.set(key, value)
  else url.searchParams.delete(key)
  window.history.replaceState(null, '', url)
  for (const listener of locationListeners) listener()
}
