import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import { Breadcrumbs, Prose } from '@/components/ui'
import { docSlugs, docTitles, readDoc, type DocSlug } from '@/lib/content'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return docSlugs.map((slug) => ({ slug }))
}

const isDocSlug = (value: string): value is DocSlug => (docSlugs as readonly string[]).includes(value)

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  if (!isDocSlug(slug)) return {}
  return { title: docTitles[slug], alternates: { canonical: `/docs/${slug}/` } }
}

export default async function DocPage({ params }: Params) {
  const { slug } = await params
  if (!isDocSlug(slug)) notFound()

  const source = readDoc(slug)
  if (!source) notFound()

  return (
    <article className="space-y-3">
      <Breadcrumbs items={[{ label: 'Mais', href: '/mais/' }, { label: docTitles[slug] }]} />
      <h1 className="pb-3 text-2xl font-semibold">{docTitles[slug]}</h1>
      <Prose dangerouslySetInnerHTML={{ __html: await marked.parse(source, { async: true }) }} />
    </article>
  )
}
