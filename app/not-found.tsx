import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="py-12 text-center">
      <p className="text-5xl font-semibold text-muted-foreground">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Página não encontrada</h1>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground">
        O endereço não existe ou o conteúdo foi movido. Use a busca para achar um parlamentar, um cargo
        ou uma verificação.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
      >
        Voltar para o início
      </Link>
    </section>
  )
}
