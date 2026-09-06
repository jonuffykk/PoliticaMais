<div align="center">

<img src="brand/mark.svg" alt="" width="88" height="88">

# Politica+

**Política brasileira com fonte.** Votação da Câmara, ficha de parlamentar e indicador do Banco Central lidos ao vivo, direto do órgão público, no instante em que você abre a tela.

[![release](https://img.shields.io/github/v/release/jonuffykk/politicamais?label=vers%C3%A3o&color=0b1b33)](https://github.com/jonuffykk/politicamais/releases/latest)
[![downloads](https://img.shields.io/github/downloads/jonuffykk/politicamais/total?label=downloads&color=f2b33d)](https://github.com/jonuffykk/politicamais/releases)
[![build](https://img.shields.io/github/actions/workflow/status/jonuffykk/politicamais/release.yml?branch=main&label=build)](https://github.com/jonuffykk/politicamais/actions/workflows/release.yml)
[![licença](https://img.shields.io/badge/c%C3%B3digo-AGPL--3.0-blue)](LICENSE)
[![conteúdo](https://img.shields.io/badge/conte%C3%BAdo-CC%20BY--SA%204.0-lightgrey)](LICENSE-CONTENT)

[Site](https://politicamais.com) · [Baixar o app](https://github.com/jonuffykk/politicamais/releases/latest) · [Metodologia](https://politicamais.com/docs/methodology/) · [API](https://politicamais.com/docs/data/)

</div>

---

## O problema

Muita gente decide voto por recorte de rede social. A informação que resolveria isso já é pública, mas está espalhada em portais oficiais que ninguém consegue usar.

Três perguntas guiam o produto: **o que este cargo pode fazer**, **o que esta pessoa fez** e **o que é boato**.

## Como funciona

Duas camadas, com regras diferentes.

**Ao vivo.** Votação com o voto nominal de cada deputado, placar por partido, ficha de deputado e de senador, comissão, proposição, mandato e série econômica são buscados pelo navegador do usuário direto na Câmara, no Senado e no Banco Central, no momento em que a página abre. Não passam por servidor nosso e não podem divergir da origem, porque são a origem. Cada bloco mostra o estado da consulta, há quanto tempo foi atualizado e um botão para consultar de novo.

**Curado.** Competência de cargo, verificação de afirmação, glossário, tema e calendário eleitoral exigem trabalho editorial. Ficam versionados como JSON, com validação de esquema e de fonte que derruba o build se algo estiver sem procedência.

**Cobertura.** Deputado federal e senador têm ficha individual porque existe base pública consultável. Presidente, governador, prefeito e vereador aparecem pela competência do cargo: não há API equivalente para o Executivo nem para as câmaras municipais, e ficha escrita à mão envelhece sem ninguém notar.

Não há servidor de aplicação, banco de dados, variável de ambiente, login ou rastreio. O `next build` gera HTML estático, e esse mesmo diretório vira o site, o conteúdo do app Android e a API pública.

## Rodando

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
```

O `prebuild` gera os ícones, valida o conteúdo e monta a API em `public/api/v1`. Se algum registro estiver sem fonte, com URL inválida ou velho demais, o build para.

App Android:

```bash
npm run android:add
npm run android:sync
npm run android:open
```

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | gera ícones, valida, monta a API e exporta o site para `out/` |
| `npm run verify` | lint, tipos e testes |
| `npm run icons` | gera favicon, PWA, apple touch, mipmaps do Android e arte de loja |
| `npm run check` | valida esquema, fontes, referências cruzadas e frescor |
| `npm run data:fetch` | atualiza o snapshot de parlamentares usado para gerar as rotas |
| `npm run data:build` | monta `public/api/v1` e o índice de busca |
| `npm run android:sync` | build, `cap sync` e ícones nativos |

## Estrutura

```
app/              rotas do Next
components/ui/    primitivas no padrão shadcn, com CVA
components/       shell, blocks, live, senate, compare, logo
lib/              sources (toda chamada de rede), live (cache SWR), content, site, utils
content/          JSON curado e documentos em markdown
brand/mark.ts     fonte única da identidade visual
scripts/          icons, checkContent, buildData, fetchData
```

Toda chamada de rede do projeto está em `lib/sources.ts`. É intencional: dá para auditar a superfície inteira em um arquivo.

## Ícones

Não há PNG versionado no repositório. `brand/mark.ts` desenha a marca em SVG e `npm run icons` rasteriza tudo: `favicon.ico` multi-resolução, PWA 64 a 1024, maskable, apple touch, imagem Open Graph, mipmaps `mdpi` a `xxxhdpi` com ícone adaptativo e monocromático, além do ícone 512 e da arte destacada para a Play Store.

Para mudar a identidade, mexa em `brand/mark.ts` e rode `npm run icons`.

## A regra que não se negocia

Todo registro curado carrega `sourceRefs` com URL e data de coleta, e o validador derruba o build se faltar. Todo dado ao vivo mostra na tela o horário da consulta e o órgão de origem. Neutralidade aqui é restrição técnica, não promessa.

## Contribuindo

Leia [CONTRIBUTING.md](CONTRIBUTING.md) e a [política editorial](content/docs/editorial.md). Conteúdo sobre pessoa pública exige duas fontes independentes e dois revisores.

## Publicando

Push em `main` roda lint, tipos, testes e build. Se a versão do `package.json` ainda não tiver tag, o mesmo workflow compila o app Android, calcula o SHA-256 de cada arquivo e cria o release com os artefatos anexados.

Para lançar:

```bash
npm version patch --no-git-tag-version && git commit -am "chore: versão" && git push
```

Sem secrets, sai um APK de teste assinado com a chave de debug: instala em qualquer aparelho, serve para experimentar e não serve para a Play Store. Com os secrets abaixo, saem o APK e o AAB assinados de verdade.

| Secret | Conteúdo |
| --- | --- |
| `ANDROID_KEYSTORE` | keystore em base64 |
| `ANDROID_KEYSTORE_PASSWORD` | senha do keystore |
| `ANDROID_KEY_ALIAS` | alias da chave |
| `ANDROID_KEY_PASSWORD` | senha da chave |

O snapshot de rotas é atualizado por um job semanal, que valida e commita em `main` apenas se algo mudou.

## Licença

Código sob [AGPL-3.0](LICENSE). Conteúdo e dados curados sob [CC BY-SA 4.0](LICENSE-CONTENT).
