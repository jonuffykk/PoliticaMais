export const CAMARA = 'https://dadosabertos.camara.leg.br/api/v2'
export const BCB = 'https://api.bcb.gov.br/dados/serie'
export const SENADO = 'https://legis.senado.leg.br/dadosabertos'

export class SourceError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'SourceError'
  }
}

type FetchOptions = { signal?: AbortSignal; timeout?: number; retries?: number }

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const queues = new Map<string, { chain: Promise<unknown>; gap: number }>()

function enqueue<T>(host: string, task: () => Promise<T>, gap: number): Promise<T> {
  const queue = queues.get(host) ?? { chain: Promise.resolve(), gap }
  const next = queue.chain.then(async () => {
    const result = await task()
    await sleep(gap)
    return result
  })
  queues.set(host, { chain: next.catch(() => undefined), gap })
  return next
}

async function request<T>(url: string, timeout: number, signal?: AbortSignal): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort, { once: true })
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    })
    if (!response.ok) throw new SourceError(`a fonte respondeu ${response.status}`, response.status)
    return (await response.json()) as T
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw signal?.aborted ? (error as Error) : new SourceError('tempo esgotado')
    }
    throw error instanceof SourceError ? error : new SourceError((error as Error).message)
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

export async function getJson<T>(
  url: string,
  { signal, timeout = 12000, retries = 2 }: FetchOptions = {},
): Promise<T> {
  const { host } = new URL(url)
  const gap = host.includes('bcb.gov.br') ? 450 : 0

  const attempt = async () => {
    let last: Error = new SourceError('sem resposta')
    for (let round = 0; round <= retries; round += 1) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      try {
        return await request<T>(url, timeout, signal)
      } catch (error) {
        last = error as Error
        if (last.name === 'AbortError') throw last
        if (round < retries) await sleep(600 * 2 ** round)
      }
    }
    throw last
  }

  return gap > 0 ? enqueue(host, attempt, gap) : attempt()
}

export type CamaraDeputy = {
  id: number
  nome: string
  siglaPartido: string
  siglaUf: string
  urlFoto: string
  email: string | null
  idLegislatura: number
}

export type CamaraDeputyDetail = {
  id: number
  nomeCivil: string
  ultimoStatus: {
    nome: string
    nomeEleitoral: string
    siglaPartido: string
    siglaUf: string
    urlFoto: string
    situacao: string
    condicaoEleitoral: string
    descricaoStatus: string | null
    idLegislatura: number
    gabinete?: { nome?: string; predio?: string; sala?: string; telefone?: string; email?: string }
  }
  escolaridade: string | null
  dataNascimento: string | null
  ufNascimento: string | null
  municipioNascimento: string | null
  redeSocial: string[]
}

export type CamaraVoting = {
  id: string
  data: string
  dataHoraRegistro: string
  siglaOrgao: string
  descricao: string
  aprovacao: number
  proposicoesAfetadas?: { id: number; siglaTipo: string; numero: number; ano: number; ementa?: string }[]
}

export type CamaraVoteRecord = {
  tipoVoto: string
  dataRegistroVoto: string
  deputado_: { id: number; nome: string; siglaPartido: string; siglaUf: string; urlFoto: string }
}

export type CamaraBody = {
  idOrgao: number
  siglaOrgao: string
  nomeOrgao: string
  nomePublicacao: string
  titulo: string
  dataInicio: string
  dataFim: string | null
}

export type CamaraHistory = {
  siglaPartido: string
  siglaUf: string
  idLegislatura: number
  dataHora: string
  situacao: string | null
  condicaoEleitoral: string | null
  descricaoStatus: string | null
}

export type CamaraProposal = {
  id: number
  siglaTipo: string
  numero: number
  ano: number
  ementa: string
}

export type CamaraFront = { id: number; titulo: string; idLegislatura: number }

export type BcbPoint = { data: string; valor: string }

const unwrap = <T>(payload: { dados: T }) => payload.dados

export const listDeputies = (options?: FetchOptions) =>
  getJson<{ dados: CamaraDeputy[] }>(
    `${CAMARA}/deputados?ordem=ASC&ordenarPor=nome&itens=513`,
    options,
  ).then(unwrap)

export const getDeputy = (id: string, options?: FetchOptions) =>
  getJson<{ dados: CamaraDeputyDetail }>(`${CAMARA}/deputados/${id}`, options).then(unwrap)

export const listBodies = (id: string, options?: FetchOptions) =>
  getJson<{ dados: CamaraBody[] }>(`${CAMARA}/deputados/${id}/orgaos?itens=100`, options).then(unwrap)

export const listHistory = (id: string, options?: FetchOptions) =>
  getJson<{ dados: CamaraHistory[] }>(`${CAMARA}/deputados/${id}/historico`, options).then(unwrap)

export const listFronts = (id: string, options?: FetchOptions) =>
  getJson<{ dados: CamaraFront[] }>(`${CAMARA}/deputados/${id}/frentes`, options).then(unwrap)

export const listProposals = (id: string, options?: FetchOptions) =>
  getJson<{ dados: CamaraProposal[] }>(
    `${CAMARA}/proposicoes?idDeputadoAutor=${id}&ordem=DESC&ordenarPor=id&itens=15`,
    options,
  ).then(unwrap)

export const listVotings = (limit: number, options?: FetchOptions) =>
  getJson<{ dados: CamaraVoting[] }>(
    `${CAMARA}/votacoes?ordem=DESC&ordenarPor=dataHoraRegistro&itens=${limit}`,
    options,
  ).then(unwrap)

export const listVotingRecords = (votingId: string, options?: FetchOptions) =>
  getJson<{ dados: CamaraVoteRecord[] }>(`${CAMARA}/votacoes/${votingId}/votos`, options).then(unwrap)

const pad = (value: number) => String(value).padStart(2, '0')

const brDay = (date: Date) =>
  `${pad(date.getUTCDate())}/${pad(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`

export function getSeries(code: number, months: number, options?: FetchOptions) {
  const end = new Date()
  const start = new Date(end)
  start.setUTCMonth(start.getUTCMonth() - months)
  const query = `formato=json&dataInicial=${brDay(start)}&dataFinal=${brDay(end)}`
  return getJson<BcbPoint[]>(`${BCB}/bcdata.sgs.${code}/dados?${query}`, options)
}

export const seriesCatalog = [
  { id: 'ipca', code: 433, name: 'IPCA mensal', unit: '%', months: 36 },
  { id: 'selic', code: 432, name: 'Selic meta', unit: '% ao ano', months: 36 },
  { id: 'dolar', code: 1, name: 'Dólar comercial de venda', unit: 'R$', months: 12 },
  { id: 'desemprego', code: 24369, name: 'Taxa de desocupação', unit: '%', months: 36 },
] as const

export type Senator = {
  id: string
  nome: string
  nomeCompleto: string
  siglaPartido: string
  siglaUf: string
  urlFoto: string
  email: string
  pagina: string
}

type SenadorRaw = {
  IdentificacaoParlamentar: {
    CodigoParlamentar: string
    NomeParlamentar: string
    NomeCompletoParlamentar: string
    SiglaPartidoParlamentar?: string
    UfParlamentar?: string
    EmailParlamentar?: string
    UrlPaginaParlamentar?: string
  }
  Mandato?: { UfParlamentar?: string; DescricaoParticipacao?: string }
}

export const senatorPhoto = (id: string) =>
  `https://legis.senado.leg.br/senadores/fotos-oficiais/${id}`

function toSenator(raw: SenadorRaw): Senator {
  const person = raw.IdentificacaoParlamentar
  return {
    id: person.CodigoParlamentar,
    nome: person.NomeParlamentar,
    nomeCompleto: person.NomeCompletoParlamentar,
    siglaPartido: person.SiglaPartidoParlamentar ?? '',
    siglaUf: person.UfParlamentar ?? raw.Mandato?.UfParlamentar ?? '',
    urlFoto: senatorPhoto(person.CodigoParlamentar),
    email: person.EmailParlamentar ?? '',
    pagina: (person.UrlPaginaParlamentar ?? '').replace('http://', 'https://'),
  }
}

export async function listSenators(options?: FetchOptions): Promise<Senator[]> {
  const payload = await getJson<{
    ListaParlamentarEmExercicio: { Parlamentares: { Parlamentar: SenadorRaw[] } }
  }>(`${SENADO}/senador/lista/atual`, options)
  return payload.ListaParlamentarEmExercicio.Parlamentares.Parlamentar.map(toSenator).sort((a, b) =>
    a.nome.localeCompare(b.nome, 'pt-BR'),
  )
}

export type SenatorDetail = Senator & {
  nascimento: string
  naturalidade: string
  ufNaturalidade: string
  gabinete: string
}

export async function getSenator(id: string, options?: FetchOptions): Promise<SenatorDetail> {
  const payload = await getJson<{
    DetalheParlamentar: {
      Parlamentar: SenadorRaw & {
        DadosBasicosParlamentar?: {
          DataNascimento?: string
          Naturalidade?: string
          UfNaturalidade?: string
          EnderecoParlamentar?: string
        }
      }
    }
  }>(`${SENADO}/senador/${id}`, options)
  const person = payload.DetalheParlamentar.Parlamentar
  const basics = person.DadosBasicosParlamentar ?? {}
  return {
    ...toSenator(person),
    nascimento: basics.DataNascimento ?? '',
    naturalidade: basics.Naturalidade ?? '',
    ufNaturalidade: basics.UfNaturalidade ?? '',
    gabinete: basics.EnderecoParlamentar ?? '',
  }
}

export type SenatorMandate = {
  UfParlamentar: string
  DescricaoParticipacao: string
  PrimeiraLegislaturaDoMandato?: { NumeroLegislatura: string; DataInicio: string; DataFim: string }
  SegundaLegislaturaDoMandato?: { NumeroLegislatura: string; DataInicio: string; DataFim: string }
}

export async function listSenatorMandates(id: string, options?: FetchOptions) {
  const payload = await getJson<{
    MandatoParlamentar: { Parlamentar: { Mandatos?: { Mandato: SenatorMandate | SenatorMandate[] } } }
  }>(`${SENADO}/senador/${id}/mandatos`, options)
  const raw = payload.MandatoParlamentar.Parlamentar.Mandatos?.Mandato
  if (!raw) return [] as SenatorMandate[]
  return Array.isArray(raw) ? raw : [raw]
}

export const seriesWindows = [
  { months: 12, label: '1 ano' },
  { months: 36, label: '3 anos' },
  { months: 120, label: '10 anos' },
]

export const brazilianDate = (value: string) => {
  const [day, month, year] = value.split('/')
  return year ? `${year}-${month}-${day}` : value
}

export const positionByLabel: Record<string, string> = {
  Sim: 'sim',
  Não: 'nao',
  Abstenção: 'abstencao',
  Obstrução: 'obstrucao',
  'Artigo 17': 'ausente',
}
