import type { MetadataRoute } from 'next'
import {
  claims,
  docSlugs,
  elections,
  offices,
  politicians,
  senators,
  siteUrl,
  topics,
} from '@/lib/content'

export const dynamic = 'force-static'

const staticPaths = [
  '/',
  '/politicians/',
  '/votings/',
  '/indicators/',
  '/topics/',
  '/offices/',
  '/checks/',
  '/glossary/',
  '/elections/',
  '/compare/',
  '/download/',
  '/mais/',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const entries: [string, number][] = [
    ...staticPaths.map((path) => [path, path === '/' ? 1 : 0.8] as [string, number]),
    ...docSlugs.map((slug) => [`/docs/${slug}/`, 0.4] as [string, number]),
    ...offices.map((item) => [`/offices/${item.id}/`, 0.7] as [string, number]),
    ...topics.map((item) => [`/topics/${item.id}/`, 0.7] as [string, number]),
    ...claims.map((item) => [`/checks/${item.id}/`, 0.6] as [string, number]),
    ...elections.map((item) => [`/elections/${item.year}/`, 0.6] as [string, number]),
    ...politicians.map((item) => [`/politicians/${item.id}/`, 0.5] as [string, number]),
    ...senators.map((item) => [`/senators/${item.id}/`, 0.5] as [string, number]),
  ]

  return entries.map(([path, priority]) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: priority >= 0.8 ? 'daily' : 'weekly',
    priority,
  }))
}
