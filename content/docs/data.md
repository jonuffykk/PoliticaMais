O Politica+ trabalha com duas camadas de dados, e a diferença importa para quem vai consumir.

A camada **ao vivo** é lida pelo seu navegador direto da fonte oficial, no momento em que você abre a página. Votações, fichas de parlamentares, comissões, proposições e séries econômicas vêm daí. Não passam por servidor nosso, não são copiadas e não têm como estar desatualizadas em relação à origem.

A camada **curada** é o conteúdo que exige trabalho editorial: competências de cada cargo, verificações de afirmações, glossário, temas e calendário eleitoral. Esse material é versionado no repositório, revisado por pessoas e publicado como JSON estático.

## Fontes ao vivo

```
https://dadosabertos.camara.leg.br/api/v2
https://legis.senado.leg.br/dadosabertos
https://api.bcb.gov.br/dados/serie
```

As três respondem com `Access-Control-Allow-Origin: *`, então qualquer página pode consultá-las direto do navegador. É exatamente o que este site faz. Você não precisa de nós como intermediário: consulte a origem.

Duas limitações que descobrimos na prática e que valem registrar:

- O Banco Central recusa `dados/ultimos/{n}` com `n` maior que 20. Use `dados?dataInicial=dd/MM/yyyy&dataFinal=dd/MM/yyyy`, que não tem esse teto.
- O endpoint de despesas da cota parlamentar da Câmara está devolvendo lista vazia para todos os parlamentares. Enquanto isso durar, não exibimos gasto de cota, porque mostrar zero seria pior do que não mostrar nada.
- O Senado devolve a foto oficial em `http://`, que uma página segura recusa. Reescrevemos para `https://legis.senado.leg.br/senadores/fotos-oficiais/{id}`, que é o destino final do redirecionamento.

## Cobertura

Deputado federal e senador têm ficha individual porque existe base pública consultável. Presidente, governador, prefeito e vereador aparecem pela competência do cargo, não por ficha pessoal: não há API equivalente para o Executivo nem para as câmaras municipais, e uma ficha escrita à mão envelheceria sem ninguém notar. Para candidatura, bens declarados e contas de campanha de qualquer cargo, a fonte é o DivulgaCand do TSE.

## API do conteúdo curado

JSON estático, gratuito, sem chave, sem cadastro e sem limite de requisição. São arquivos em CDN.

```
GET https://politicamais.com/api/v1/index.json
GET https://politicamais.com/api/v1/offices.json
GET https://politicamais.com/api/v1/claims.json
GET https://politicamais.com/api/v1/topics.json
GET https://politicamais.com/api/v1/glossary.json
GET https://politicamais.com/api/v1/elections.json
GET https://politicamais.com/api/v1/politicians.json
GET https://politicamais.com/api/v1/politicians.csv
GET https://politicamais.com/api/v1/search.json
GET https://politicamais.com/api/v1/openapi.json
```

Comece pelo `index.json`. Ele traz a versão, a data do build, a contagem de cada coleção e os endereços das fontes ao vivo.

O `politicians.json` é um retrato dos parlamentares usado para gerar as rotas do site e para o app abrir uma ficha sem rede. Para dado corrente de parlamentar, use a API da Câmara.

## Exemplo

```bash
curl https://politicamais.com/api/v1/index.json
curl https://politicamais.com/api/v1/claims.json | jq '.[] | {statement, verdict}'
```

## Cache no aparelho

O site e o app guardam no seu próprio navegador o resultado das consultas ao vivo, para abrir rápido e continuar legíveis sem internet. Esse cache é local, tem prazo curto e nunca sai do aparelho. Cada bloco da interface mostra quando foi atualizado e traz um botão para forçar nova consulta.

## Licença e uso

Conteúdo e dados curados sob CC BY-SA 4.0. Cite o Politica+ e mantenha a mesma licença em obras derivadas. Os dados das fontes oficiais seguem a licença de cada órgão.

Se você for construir algo em cima disso, o pedido é um só: preserve a fonte e a data de coleta ao lado do número. Um dado sem procedência vira boato com aparência de estatística.
