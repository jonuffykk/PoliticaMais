'use client'

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

export type Freshness = 'snapshot' | 'loading' | 'live' | 'error'

export type LiveResult<T> = {
  data: T
  freshness: Freshness
  updatedAt: number | null
  error: string | null
  refresh: () => void
}

type Entry = { value?: unknown; at?: number; pending: boolean; error?: string }

const empty: Entry = { pending: false }
const store = new Map<string, Entry>()
const listeners = new Map<string, Set<() => void>>()
const inflight = new Map<string, AbortController>()
const hydrated = new Set<string>()

const storageKey = (key: string) => `pm:v1:${key}`

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener())
}

function update(key: string, patch: Partial<Entry>) {
  store.set(key, { ...(store.get(key) ?? empty), ...patch })
  notify(key)
}

function hydrate(key: string) {
  if (hydrated.has(key)) return
  hydrated.add(key)
  try {
    const raw = window.localStorage.getItem(storageKey(key))
    if (!raw) return
    const parsed = JSON.parse(raw) as { value: unknown; at: number }
    store.set(key, { ...(store.get(key) ?? empty), value: parsed.value, at: parsed.at })
    notify(key)
  } catch {
    window.localStorage.removeItem(storageKey(key))
  }
}

function persist(key: string, value: unknown, at: number) {
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify({ value, at }))
  } catch {
    clearLiveCache()
  }
}

export function clearLiveCache() {
  try {
    for (const item of Object.keys(window.localStorage)) {
      if (item.startsWith('pm:v1:')) window.localStorage.removeItem(item)
    }
  } catch {
    return
  }
}

function revalidate<T>(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<T>,
  ttl: number,
  force: boolean,
) {
  const entry = store.get(key) ?? empty
  if (entry.pending) return
  if (!force && entry.at !== undefined && Date.now() - entry.at < ttl) return

  const controller = new AbortController()
  inflight.get(key)?.abort()
  inflight.set(key, controller)
  update(key, { pending: true })

  fetcher(controller.signal)
    .then((value) => {
      if (controller.signal.aborted) return
      const at = Date.now()
      persist(key, value, at)
      update(key, { value, at, pending: false, error: undefined })
    })
    .catch((cause: Error) => {
      if (controller.signal.aborted) return
      update(key, { pending: false, error: cause.message })
    })
    .finally(() => {
      if (inflight.get(key) === controller) inflight.delete(key)
    })
}

function subscribe(key: string, listener: () => void) {
  const set = listeners.get(key) ?? new Set()
  set.add(listener)
  listeners.set(key, set)
  return () => {
    set.delete(listener)
    if (set.size === 0) listeners.delete(key)
  }
}

const oneHour = 3600_000

export function useLive<T>(
  key: string | null,
  fetcher: (signal: AbortSignal) => Promise<T>,
  fallback: T,
  { ttl = oneHour }: { ttl?: number } = {},
): LiveResult<T> {
  const entry = useSyncExternalStore(
    useCallback((listener) => (key ? subscribe(key, listener) : () => undefined), [key]),
    useCallback(() => (key ? (store.get(key) ?? empty) : empty), [key]),
    () => empty,
  )

  const refresh = useCallback(() => {
    if (key) revalidate(key, fetcher, ttl, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ttl])

  useEffect(() => {
    if (!key) return
    hydrate(key)
    revalidate(key, fetcher, ttl, false)
    const onWake = () => {
      if (document.visibilityState === 'visible') revalidate(key, fetcher, ttl, false)
    }
    window.addEventListener('online', onWake)
    document.addEventListener('visibilitychange', onWake)
    return () => {
      window.removeEventListener('online', onWake)
      document.removeEventListener('visibilitychange', onWake)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, ttl])

  return useMemo(() => {
    const hasValue = entry.value !== undefined
    const freshness: Freshness = entry.pending
      ? hasValue
        ? 'live'
        : 'loading'
      : entry.error && !hasValue
        ? 'error'
        : hasValue
          ? 'live'
          : 'snapshot'
    return {
      data: hasValue ? (entry.value as T) : fallback,
      freshness,
      updatedAt: entry.at ?? null,
      error: entry.error ?? null,
      refresh,
    }
  }, [entry, fallback, refresh])
}

const tickMs = 20_000
const clockListeners = new Set<() => void>()
let clockTimer: ReturnType<typeof setInterval> | null = null
let clockNow = 0

function subscribeClock(listener: () => void) {
  clockListeners.add(listener)
  if (!clockTimer) {
    clockNow = Date.now()
    clockTimer = setInterval(() => {
      clockNow = Date.now()
      clockListeners.forEach((notifyClock) => notifyClock())
    }, tickMs)
  }
  return () => {
    clockListeners.delete(listener)
    if (clockListeners.size === 0 && clockTimer) {
      clearInterval(clockTimer)
      clockTimer = null
    }
  }
}

export function useClock() {
  return useSyncExternalStore(
    subscribeClock,
    () => clockNow || (clockNow = Date.now()),
    () => 0,
  )
}
