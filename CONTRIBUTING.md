# Como contribuir

## Antes de abrir um PR

Rode a validação completa:

```bash
npm run verify && npm run build
```

Se o `check` reclamar, o problema é de conteúdo, não de código. Ele derruba registro sem fonte, link morto, referência cruzada quebrada e dado velho demais.

## Regras de conteúdo

Todo registro precisa de `sourceRefs` com URL, publicador e data de coleta. Verificação de afirmação precisa de duas fontes independentes.

O veredito sai de uma lista fechada: verdadeiro, impreciso, falso, sem contexto, insustentável, não verificável. Não invente rótulo novo e não use nota numérica.

Escreva para quem terminou o ensino fundamental. Sem adjetivo valorativo. "Votou contra o projeto", não "votou contra a população".

Nunca edite `content/politicians.json` à mão. Ele é gerado por `npm run data:fetch` e serve só para produzir as rotas do site; a edição manual será sobrescrita.

Dado que muda todo dia não entra em `content/`. Votação, ficha de parlamentar e série econômica são lidos ao vivo, e toda chamada de rede fica em `lib/sources.ts`. Fonte nova entra lá, com tipo declarado, e no `connect-src` da política de segurança de conteúdo em `app/layout.tsx` e `vercel.json`.

## Conflito de interesse

O template de PR tem um campo obrigatório. Se você é filiado a partido, trabalha em gabinete ou é candidato, declare. Quem tem conflito com o assunto não escreve nem revisa aquele conteúdo.

## Revisão

Código precisa de um mantenedor. Conteúdo sobre pessoa pública precisa de dois revisores sem conflito de interesse.

## Código

TypeScript em modo estrito, sem `any` e sem supressão de erro. Identificadores em inglês e camelCase. Texto visível ao usuário em português.

Dependência nova exige justificativa escrita no PR, dizendo o que ela resolve e por que não dá para fazer sem ela. O projeto tem seis dependências de runtime e a intenção é continuar assim.

Sem comentário explicando o óbvio. Sem código morto. Sem arquivo de dez linhas com um único export.

Nada de PNG versionado. Ícone é gerado a partir de `brand/mark.ts` com `npm run icons`.

## Commits

Conventional Commits, porque as notas de cada release são geradas a partir deles.

```
feat: adiciona comparador de partidos
fix: corrige data de coleta no rodapé da ficha
data: atualiza o snapshot de parlamentares
content: publica verificação sobre emenda parlamentar
```

A versão é o campo `version` do `package.json`. Subir esse número e dar push cria a tag e o release automaticamente.

## Reportar erro de dado

Abra uma issue com o link da página e a fonte que contradiz o que está publicado. Se a fonte for melhor que a nossa, a correção sai com adendo datado e o texto original fica no histórico.
