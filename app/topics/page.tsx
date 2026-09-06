import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumbs, Card, CardTitle, PageHeader } from '@/components/ui'
import { topics } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Temas',
  description:
    'Saúde, segurança, educação, economia, meio ambiente e transparência: quem decide cada assunto.',
  alternates: { canonical: '/topics/' },
}

export default function TopicsPage() {
  return (
    <>
      <PageHeader
        title="Temas"
        description="Cada tema aponta os cargos que realmente decidem o assunto."
        crumbs={<Breadcrumbs items={[{ label: 'Temas' }]} />}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {topics.map((topic) => (
          <Card key={topic.id} as={Link} href={`/topics/${topic.id}/`} interactive className="block">
            <CardTitle>{topic.name}</CardTitle>
            <span className="mt-2 block text-sm text-muted-foreground">{topic.summaryPlain}</span>
          </Card>
        ))}
      </div>
    </>
  )
}
