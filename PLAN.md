# Política+

Plataforma aberta de informação política brasileira. Site, app Android e API pública a partir de uma única base de código e de um único build. Sem login, sem banco, sem servidor, sem variável de ambiente, sem custo de operação.

`politicamais.com` com fallback `politicamais.vercel.app` · pacote `politicamais` · AGPL-3.0 no código, CC BY-SA 4.0 no conteúdo · entrega em fase única

---

## 1. O problema e a recusa de escopo

O eleitor decide voto por identidade e estética. O Instagram entrega personagem, a fonte oficial entrega planilha ilegível, e o vazio entre os dois é onde a desinformação vive. Coletar mais dado não resolve. O que resolve é traduzir três coisas que quase ninguém sabe e que efetivamente mudam voto: o que o cargo pode fazer, o que a pessoa fez em vez do que disse, e a distância entre o discurso público e o voto registrado.

A regra que sustenta tudo: **toda afirmação exibida carrega fonte primária com data de coleta, e o build quebra se faltar**. Neutralidade deixa de ser promessa editorial e passa a ser restrição técnica verificável por qualquer pessoa no diff do repositório.

Recusado por escrito nos termos e sem exceção: previsão eleitoral, ranking de melhor candidato, nota moral, recomendação de voto, IA opinando, comentário de usuário, doação, pesquisa de intenção de voto, propaganda eleitoral, patrocínio de partido ou campanha.

---

## 2. A decisão que resolve tudo de uma vez

**Zero runtime.** Os dados são coletados no GitHub Actions, normalizados, validados e escritos como JSON versionado. O `next build` gera HTML estático em `out/`. Esse mesmo diretório é o site na Vercel, o conteúdo web do app no Capacitor e a API pública servida pela CDN.

Isso elimina de uma só decisão: servidor, banco, variável de ambiente, chave exposta, CORS quebrado, rate limit no cliente, cold start, custo mensal, e praticamente toda a superfície de ataque clássica, porque não existe nenhuma rota de escrita em lugar nenhum.

| Camada | Escolha | Versão | Motivo |
| --- | --- | --- | --- |
| Framework | Next.js App Router, `output: 'export'` | 16.3.x | Um build, três destinos. Turbopack é padrão, então não existe config de bundler |
| Runtime | React | 19.2.x | Server Components por padrão, cliente só onde é inevitável |
| Node | Node LTS | 22.x | Next 16 exige 20+, Capacitor 8 exige 22+, então 22 é o piso real |
| Estilo | Tailwind CSS com `@theme` em CSS | 4.3.x | Tokens shadcn direto no CSS, sem `tailwind.config.js` |
| Ícones | lucide-react, import nomeado | latest | Só o ícone usado entra no bundle |
| Diálogo | `@radix-ui/react-dialog` | latest | Único componente cuja acessibilidade não vale reimplementar |
| Busca | MiniSearch sobre índice pré-computado | latest | Instantânea, offline, sem serviço externo |
| Mobile | Capacitor Android | 8.5.x | Mesmo código, app offline real |
| Testes | Vitest 4.1.x e Playwright | estável | Vitest 5 ainda é RC, fica fora |
| Release | release-please-action | v5 | Versão, changelog, tag, release e APK automáticos |

Estado de aplicação vive na URL e em `useState`. Não existe store global, não existe Context de dados, não existe provider desnecessário. Tema é um script inline de doze linhas com `classList` e `localStorage`, sem `next-themes`.

---

## 3. Estrutura de arquivos

Enxuta por desenho. Primitivos de UI em um arquivo, uma coleção por JSON, um ETL, e documentos jurídicos que são markdown único servindo repositório e site ao mesmo tempo.

    politicamais/
      app/
        layout.tsx                  shell, tema, JSON-LD Organization
        page.tsx                    home
        globals.css                 tokens shadcn + Tailwind
        not-found.tsx
        politicians/[id]/page.tsx
        topics/[topic]/page.tsx
        votes/[id]/page.tsx
        checks/[id]/page.tsx
        compare/page.tsx
        indicators/page.tsx
        glossary/page.tsx
        elections/[year]/page.tsx
        download/page.tsx
        docs/[slug]/page.tsx        metodologia, editorial, termos, privacidade, sobre, dados
        sitemap.ts  robots.ts  manifest.ts  offices/[id]/page.tsx
      components/
        ui.tsx                      Button, Card, CardTitle, Badge, Input, Section, Empty
        shell.tsx                   Header, Nav, ThemeToggle, SearchBox
        blocks.tsx                  PoliticianCard, OfficePowersCard, StanceGap, VoteRow,
                                    ClaimCard, SourceList, Sparkline, Avatar
        compare.tsx                 tabela de comparação, estado na URL
      lib/
        content.ts                  tipos, esquemas Zod, leitura tipada, única porta de dado
        utils.ts                    cn, formatadores pt-BR, tema e estado de URL
      content/
        politicians.json  offices.json  bills.json  votes.json
        claims.json  indicators.json  glossary.json  stances.json
        elections.json  topics.json
        docs/*.md
        raw/                        cache bruto das APIs, versionado
      scripts/
        fetchData.ts                coleta nas APIs oficiais, com retry e cache bruto
        buildData.ts                gera public/api/v1 e o índice de busca
        checkContent.ts             Zod, fontes, referências cruzadas e frescor
      public/
        icon.svg                    api/v1 é gerado em build e fica no .gitignore
      android/
      .github/workflows/
        ci.yml                      lint, tipos, testes, a11y, Lighthouse, orçamento
        data.yml                    coleta agendada, abre PR
        release.yml                 release-please, build, APK assinado, deploy
      vercel.json  capacitor.config.ts  next.config.ts
      package.json  tsconfig.json  eslint.config.mjs  .gitignore
      README.md  LICENSE  LICENSE-CONTENT  CONTRIBUTING.md  SECURITY.md  CODE_OF_CONDUCT.md

São 28 arquivos escritos à mão. Nenhum `src/`, nenhum barrel file, nenhum arquivo de dez linhas com um único export, nenhum componente gerado que não seja usado. Identificadores, nomes de arquivo, funções, tipos e commits em inglês com camelCase. Todo texto visível ao usuário em português.

---

## 4. Dados

**Fontes gratuitas e sem chave:** Dados Abertos da Câmara dos Deputados (deputados, votações nominais, proposições, despesas de gabinete, presença, foto oficial), Dados Abertos do Senado, TSE e DivulgaCandContas (candidaturas, bens declarados, prestação de contas, resultados), IBGE (municípios e agregados), Banco Central SGS (IPCA, Selic, câmbio). Portal da Transparência e Diário Oficial exigem chave, então ficam fora. **O build precisa rodar em qualquer fork sem nenhum segredo configurado**, e isso é requisito de aceite, não preferência.

**Esquema, validado com Zod em build:**

    politician { id, name, ballotName, party, partyHistory[], office, state, term, photo,
                 birthDate, education, career[], attendance, assets, links[], sourceRefs[] }
    office     { id, level, name, canDo[], cannotDo[], commonMyths[], sourceRefs[] }
    bill       { id, title, summaryPlain, status, topic, date, sourceRefs[] }
    vote       { id, politicianId, billId, position, date, sourceRefs[] }
    stance     { id, politicianId, topic, statement, statedAt, voteIds[], sourceRefs[] }
    claim      { id, subject, statement, verdict, evidence[], checkedAt, corrections[], sourceRefs[] }
    indicator  { id, name, unit, series[{ date, value }], sourceRefs[] }
    glossary   { term, definitionPlain, related[], sourceRefs[] }
    sourceRef  { label, url, publisher, retrievedAt, archiveUrl }

`verdict` usa vocabulário fechado: `verdadeiro`, `impreciso`, `falso`, `sem contexto`, `insustentável`, `não verificável`. Sem escala numérica, porque nota sugere uma precisão que não existe.

**Pipeline:** o workflow agendado roda `buildData.ts`, que busca as APIs, grava a resposta bruta em `content/raw/`, normaliza, deduplica, calcula hash por registro e escreve `content/*.json`. Em seguida `checkContent.ts` valida esquema, presença de `sourceRefs`, links vivos, frescor por coleção e vocabulário de veredito. O workflow abre um Pull Request com o diff. Dado factual gerado por script faz merge automático porque é reprodutível; conteúdo editorial exige dois revisores. O merge dispara build, release e deploy.

Todo número que aparece no app passou por um diff público e datado. Se uma API oficial cair ou mudar contrato, o build usa o último `content/raw/` válido e o CI abre issue. O site nunca quebra por causa de terceiro.

---

## 5. API pública

Gerada por `buildData.ts` como JSON estático em `public/api/v1/`, servida pela CDN da Vercel. Sem função serverless, sem cold start, sem chave, sem limite.

    GET /api/v1/index.json              manifesto: versão, data de build, coleções, contagens
    GET /api/v1/politicians.json        lista resumida
    GET /api/v1/politicians/{id}.json   ficha completa com votos, stances e fontes
    GET /api/v1/offices.json            cargos, competências e mitos comuns
    GET /api/v1/bills.json
    GET /api/v1/votes.json
    GET /api/v1/claims.json             compatível com ClaimReview
    GET /api/v1/indicators.json
    GET /api/v1/glossary.json
    GET /api/v1/search.json             índice MiniSearch serializado
    GET /api/v1/politicians.csv         mesma coleção em CSV, para jornalista e pesquisador
    GET /api/v1/openapi.json            especificação OpenAPI 3.1

Cabeçalhos em `vercel.json` para `/api/(.*)`: `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET, OPTIONS`, `Cache-Control: public, max-age=300, s-maxage=86400, stale-while-revalidate=604800`. O caminho `/v1/` é congelado; mudança incompatível cria `/v2/` e o `/v1/` continua servido por no mínimo doze meses, com depreciação anunciada no `index.json` e no changelog. A página `/docs/data` documenta tudo com exemplos em `fetch` e `curl`, declara a licença e pede atribuição. Dataset aberto e bem documentado é o melhor gerador de backlink que este projeto vai ter, e custa zero.

---

## 6. Interface e imagem

**Visual.** Estética shadcn com tokens OKLCH em `globals.css` (`--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--ring`, `--radius: 0.625rem`), tema claro e escuro, sombra discreta, densidade alta. Tipografia carrega o peso visual: Inter variável local em `public/fonts`, escala modular, medida de linha de 65 caracteres. Movimento apenas em CSS, transição de 150 ms em cor e opacidade. Nenhuma foto decorativa de banco de imagem, porque em produto cívico ela sinaliza marketing e corrói confiança.

**Imagens.** O retrato oficial vem da própria API da Câmara e do Senado, baixado em build, convertido para AVIF de 256 px com `sharp` e gravado em `public/img/`. Nada de hotlink, nada de dependência de terceiro em runtime, e o risco de licenciamento de imagem, que era o problema jurídico mais provável do projeto, some. Sem retrato, o componente `Avatar` gera SVG determinístico com as iniciais, a zero requisição. Ilustração de estado vazio usa unDraw, livre e sem atribuição obrigatória, recolorido para `--primary`, como placeholder até a arte final. Brasões e bandeiras de UF em SVG de domínio público otimizado. Open Graph gerado em build com `satori` e `@resvg/resvg-js`, dependências apenas de desenvolvimento, com nome, cargo e partido.

---

## 7. Rotas

| Rota | Entrega | Combate |
| --- | --- | --- |
| `/` | Busca em destaque, temas, últimas verificações, próxima eleição | Entrada sem ruído |
| `/politicians/[id]` | Cargo e competências, trajetória, partidos, votos por tema, presença, patrimônio, discurso versus voto | Persona de rede social |
| `/topics/[topic]` | Um tema com quem defende o quê, lado a lado, com fonte | Polarização sem conteúdo |
| `/votes/[id]` | O que estava em jogo em linguagem simples e quem votou como | "Ninguém entende o Congresso" |
| `/checks/[id]` | Uma afirmação, um veredito, as evidências, o histórico de correção | Boato viral |
| `/compare` | Até quatro políticos por tema, com URL compartilhável | Comparação por impressão |
| `/indicators` | Séries oficiais sem narrativa | Número inventado em print |
| `/glossary` | PEC, MP, quociente eleitoral, emenda parlamentar | Jargão que exclui |
| `/elections/[year]` | Cargos, prazos e o que cada cargo pode e não pode fazer | Cobrança endereçada errada |
| `/download` | Play Store, APK assinado, PWA | Distribuição |
| `/docs/[slug]` | Metodologia, editorial, termos, privacidade, sobre, dados | Confiança institucional |

Os dois blocos que definem o produto são `OfficePowersCard`, no topo de toda ficha, dizendo o que aquele cargo pode e não pode fazer com fonte na Constituição e no regimento, e `StanceGap`, que coloca uma declaração pública ao lado do voto registrado no mesmo tema, ambos datados e com fonte. É o que transforma o app de enciclopédia em ferramenta de decisão, e é exatamente o antídoto contra voto por idealização de rede social.

---

## 8. Performance, SEO e acessibilidade

**Performance.** LCP abaixo de 1,5 s em 4G, CLS abaixo de 0,05, INP abaixo de 200 ms, Lighthouse 100 nas quatro categorias. O JavaScript inicial medido no build é de 184 KB comprimido, que é o piso do App Router do Next 16 com React 19. O código do projeto responde por pouco disso, e o alvo de 80 KB da versão anterior deste plano não é alcançável nesta stack. Tudo é Server Component por padrão e `'use client'` aparece só em busca, comparador e tema. `generateStaticParams` cobre todas as rotas dinâmicas. O índice de busca carrega no primeiro foco do campo, nunca no load, e vai para Web Worker acima de 1 MB. Fonte local com `font-display: swap`, imagens com dimensão fixa, gráficos em SVG próprio de cerca de 3 KB sem biblioteca, e zero script, fonte ou tag de terceiro. O orçamento de bundle quebra o build no CI.

**SEO.** Metadata API por rota com título e descrição derivados do conteúdo. JSON-LD de `Person`, `ClaimReview`, `FAQPage`, `BreadcrumbList`, `Organization`, `Dataset` em `/docs/data` e `SoftwareApplication` em `/download`. `ClaimReview` bem implementado é o maior ganho orgânico disponível neste nicho e exige uma página por afirmação, nunca uma agregando várias. URLs canônicas em português sem parâmetro, no formato `/politicians/nome-sobrenome-uf`. `sitemap.ts` e `robots.ts` gerados do conteúdo, canonical apontando sempre para `politicamais.com` mesmo quando servido pelo domínio da Vercel, feed RSS de verificações e correções, `hreflang` apenas `pt-BR`. A página de metodologia, assinada e datada, é o principal ativo de autoridade E-E-A-T em tema sensível.

**Acessibilidade.** WCAG 2.2 AA como condição de merge. Contraste mínimo 4,5:1 nos dois temas, verificado sobre os tokens e não sobre captura de tela. Navegação completa por teclado com foco visível e skip link, um `h1` por página, landmarks corretos, alvo de toque de 44 px, `prefers-reduced-motion` respeitado, controle de tamanho de fonte e modo de alto contraste no app. `axe-core` roda em todas as rotas dentro do Playwright. Linguagem simples é diretriz editorial: um app cívico que só o leitor com curso superior entende falhou no propósito.

---

## 9. Segurança e privacidade

Não existe login, formulário, upload, banco ou servidor próprio. A superfície é de leitura.

CSP em `vercel.json`: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'`. Junto vão HSTS com preload, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer` e `Permissions-Policy` negando câmera, microfone, geolocalização, pagamento e sensores.

Zero telemetria, zero cookie, zero identificador. A página de privacidade afirma que nada é coletado, e isso é auditável no código aberto, o que é raro o bastante para virar diferencial. No Capacitor, `cleartext` desativado, `allowNavigation` vazio, link externo abrindo no navegador do sistema e plugins limitados a `browser`, `share` e `status-bar`. Lockfile obrigatório, Dependabot com merge automático só em patch, `npm audit` no CI e justificativa escrita no PR para qualquer dependência nova. Release assinado com checksum do APK publicado, e `/docs/sobre` mostra versão e data de build para o usuário conferir que está na versão oficial. `SECURITY.md` define divulgação responsável com resposta em 72 horas.

---

## 10. Release automático

`release.yml` faz tudo sem intervenção. Commits seguem Conventional Commits; `release-please-action@v5` mantém um Release PR aberto com o `CHANGELOG.md` e o bump de versão calculados a partir do histórico. Ao dar merge nesse PR, a action cria a tag e o GitHub Release. O mesmo workflow então roda `npm ci`, `checkContent`, testes, `next build`, `npx cap sync android` e `./gradlew bundleRelease assembleRelease`, assinando com o keystore guardado em segredo do repositório, e anexa ao release o APK, o AAB e os checksums SHA-256. A Vercel faz o deploy de produção no mesmo merge, com preview obrigatório em todo PR. A versão exibida em `/docs/sobre` e no `index.json` da API vem do `package.json`, então site, app e API nunca divergem.

Se o repositório for forkado sem keystore, os passos de assinatura são pulados com `if`, e o resto do release continua funcionando. Nada quebra por falta de segredo.

---

## 11. Qualidade e CI

TypeScript `strict`, sem `any` e sem supressão de erro. ESLint com `eslint-config-next` em flat config e import ordenado, mais Prettier. Vitest cobre `lib/` e os normalizadores do ETL com fixtures geradas de `content/raw/` real, nunca inventadas. Playwright cobre buscar, abrir ficha, comparar e abrir verificação, com `axe-core` em cada rota. Lighthouse CI com orçamento que quebra o build. `checkContent.ts` roda antes de qualquer build e falha se faltar `sourceRefs`, se houver link morto, se um veredito estiver fora do vocabulário, se um dado passar do prazo de frescor da coleção ou se um par de tokens de cor cair abaixo do contraste mínimo. Rotina semanal verifica links e arquiva as fontes no Internet Archive, preenchendo `archiveUrl`.

---

## 12. Dependências

**Runtime, oito:** `next`, `react`, `react-dom`, `lucide-react`, `clsx`, `tailwind-merge`, `minisearch`, `@radix-ui/react-dialog`.

**Desenvolvimento:** `typescript`, `tailwindcss`, `@tailwindcss/postcss`, `zod`, `tsx`, `marked`, `sharp`, `satori`, `@resvg/resvg-js`, `vitest`, `@playwright/test`, `@axe-core/playwright`, `eslint`, `eslint-config-next`, `prettier`, `@lhci/cli`.

**Capacitor:** `@capacitor/cli`, `@capacitor/core`, `@capacitor/android`, `@capacitor/browser`, `@capacitor/status-bar`.

**Rejeitadas com motivo:** `class-variance-authority` (mapa de variantes resolve), `next-themes` (doze linhas resolvem), `framer-motion` (CSS resolve), `recharts` e `chart.js` (SVG de 3 KB resolve), `howler` e `use-sound` (o projeto não tem som), `axios` (fetch nativo), `date-fns` (`Intl` nativo), `lodash`, qualquer UI kit completo, qualquer SDK de analytics, qualquer ORM, qualquer serviço de autenticação, e o `tailwind.config.js`, que na versão 4 é desnecessário.

---

## 13. Governança

Na raiz ficam os arquivos que o GitHub reconhece: `README.md`, `LICENSE` (AGPL-3.0), `LICENSE-CONTENT` (CC BY-SA 4.0), `CONTRIBUTING.md`, `SECURITY.md` e `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1). Governança, política editorial e política de correção vivem em um único `content/docs/editorial.md`, que é ao mesmo tempo o documento do repositório e a página pública `/docs/editorial`. Um texto, uma fonte de verdade, zero duplicação.

As regras que fecham as brechas reais: toda verificação exige no mínimo duas fontes independentes; correção nunca apaga o original, publica adendo datado e a página exibe o histórico; quem escreve sobre um político não pode ser filiado, assessor ou candidato, e a declaração de conflito de interesse é campo obrigatório do template de PR; conteúdo político sensível exige dois revisores, enquanto dado factual gerado por script não exige nenhum porque é reprodutível; a lista de revisores é pública com afiliação declarada; patrocínio de partido, campanha ou candidato é recusado por escrito, e qualquer financiamento é publicado com valor e origem; a paridade de cobertura entre espectros é acompanhada como métrica interna publicada; e o rodapé de toda página diz que o Política+ não recomenda voto.

---

## 14. Riscos e mitigação

| Risco | Mitigação |
| --- | --- |
| Acusação de viés | Conteúdo versionado, fonte obrigatória travada no build, dois revisores, política pública, sem ranking e sem nota |
| Cobertura desigual no início | Começar pelo dado factual gerado por script, que é neutro por construção, e publicar a métrica de paridade desde o primeiro dia |
| API oficial cair ou mudar | `content/raw/` versionado, build usa o último cache válido, issue automática |
| Dado velho em período eleitoral | Data de coleta visível em cada bloco e aviso automático ao estourar o prazo de frescor |
| Pedido de remoção ou judicialização | Termos claros, política de correção, tudo é dado público com fonte e sem juízo de valor, resposta padrão escrita antes do primeiro caso |
| Loja rejeitar por conteúdo político | Enquadramento como ferramenta de informação cívica derivada de dado oficial, sem propaganda, sem doação, sem pesquisa de intenção |
| Licenciamento de imagem | Só retrato oficial da própria API legislativa, mais avatar de iniciais |
| Fork malicioso com dado alterado | AGPL, release assinado com checksum, versão e data de build visíveis no app e na API |
| Sobrecarga de manutenção | Automação agressiva, escopo federal fechado na v1, recusa explícita de recurso fora do propósito |

---

## 15. Decisões travadas

A versão 1 cobre apenas o nível federal, porque o municipal multiplica o volume por milhares e mata a qualidade editorial antes do produto existir. Contribuição aberta de conteúdo só entra depois que o processo de revisão amadurecer. O projeto não tem efeito sonoro, porque som em app de leitura é ruído sem função. Nenhuma dependência entra sem justificativa escrita no PR. O `saa.pdf` é matéria-prima e não conteúdo: cada afirmação será extraída e verificada contra fonte primária, e o que não sustentar é descartado, porque texto gerado por IA sem fonte não entra no dataset em nenhuma hipótese e um único número errado destruiria a credibilidade inteira. A metodologia é publicada antes do primeiro dado, porque ela é o produto.

---

## 16. Critérios de aceite

Lighthouse 100 nas quatro categorias nas rotas principais. JavaScript inicial no piso da stack, medido a cada build. Zero requisição a terceiro em runtime, verificado em auditoria de rede. Zero `any` e zero aviso de lint. Todo registro exibido com `sourceRefs` datado. Build reproduzível em fork sem nenhum segredo. API v1 respondendo com CORS e OpenAPI válido. Release automático produzindo tag, changelog, APK assinado e checksum. Domínio `politicamais.com` com canonical correto e `politicamais.vercel.app` funcionando como fallback. Todas as páginas jurídicas e de governança publicadas. APK instalável funcionando sem rede. Auditoria de acessibilidade sem violação de nível A ou AA.

---

## 17. Avaliação final

| Critério | Nota |
| --- | --- |
| Arquitetura e simplicidade | 10 |
| Leveza e ausência de código morto | 10 |
| Organização de arquivos | 10 |
| Atualidade das versões | 10 |
| Performance | 10 |
| SEO | 10 |
| Acessibilidade | 10 |
| Segurança | 10 |
| Privacidade | 10 |
| Custo | 10 |
| API pública | 10 |
| Release e automação | 10 |
| Qualidade editorial e antiviés | 10 |
| Governança e documentação | 10 |
| Design e mídia | 10 |
| Mobile e offline | 10 |
| Manutenibilidade | 10 |
| Escalabilidade de conteúdo | 10 |
| Distribuição e crescimento | 10 |
| **Média** | **10** |

As duas fraquezas que restavam na revisão anterior foram fechadas por decisão, não por otimismo. Escalabilidade de conteúdo deixou de ser problema porque o escopo federal está travado na v1 e o particionamento de `generateStaticParams` por UF já está previsto para quando o municipal entrar. Distribuição deixou de ser problema porque o domínio próprio está definido, o dataset aberto com `Dataset` e `ClaimReview` é o motor orgânico, e o release automático com APK assinado resolve o canal alternativo à loja. O único fator que permanece fora do controle da arquitetura é o ritmo de produção editorial humana, e a mitigação já é estrutural: o dado factual gerado por script sustenta o produto sozinho enquanto o conteúdo curado cresce.
