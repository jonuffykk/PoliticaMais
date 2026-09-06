Este documento explica de onde vem cada informação do Politica+, como ela é conferida e como pedir correção. Ele foi publicado antes do primeiro dado entrar no ar, de propósito.

## Regra principal

Nenhuma informação aparece aqui sem fonte e sem data. Para o conteúdo curado isso é uma trava técnica: o script `checkContent` roda antes de todo build e derruba a publicação se algum registro estiver sem fonte, com URL inválida ou com dado velho demais. Para o dado ao vivo, a data é o instante da consulta, e ela aparece em cada bloco da tela.

## De onde vêm os dados

Parlamentares, votações nominais, comissões, proposições e histórico de mandato vêm da API de dados abertos da Câmara dos Deputados. IPCA, Selic, dólar e taxa de desocupação vêm do Sistema Gerenciador de Séries Temporais do Banco Central. Competências de cargo saem da Constituição e da legislação citada em cada ficha. Calendário eleitoral vem do TSE.

Todas essas fontes são públicas e gratuitas. Nenhuma exige chave de acesso, e é por isso que qualquer pessoa consegue clonar o repositório e reproduzir o site inteiro sem pedir permissão a ninguém.

## Como o dado chega até a sua tela

O número que você vê é buscado pelo seu próprio navegador, direto do servidor do órgão público, no momento em que a página abre. Não passa por servidor nosso, não é copiado para um banco de dados e não pode divergir da origem, porque é a origem.

Cada bloco mostra o estado da consulta: ao vivo, buscando ou fonte fora do ar. Também mostra há quanto tempo foi atualizado e traz um botão para consultar de novo na hora.

O resultado fica guardado no seu aparelho por um prazo curto, para a tela abrir rápido e continuar legível sem internet. Esse cache é local e nunca sai do aparelho.

Quando a fonte oficial está fora do ar, o site diz isso e mostra o último valor que você já tinha, com a hora dele. Não inventamos dado para preencher buraco.

## O conteúdo escrito por gente

Competência de cargo, verificação de afirmação, glossário e tema exigem trabalho editorial e não podem ser gerados por script. Esse material fica versionado no repositório: toda alteração tem diff público, autor e data. Se alguém achar que um texto foi manipulado, não precisa acreditar em nós, basta olhar o histórico.

Conteúdo sobre pessoa pública precisa de dois revisores.

## Como uma verificação é feita

Uma afirmação só vira verificação quando é pública, específica e checável. Opinião não entra. Previsão não entra.

Cada verificação precisa de no mínimo duas fontes independentes, e o veredito sai de uma lista fechada: verdadeiro, impreciso, falso, sem contexto, insustentável, não verificável. Não usamos nota de zero a dez porque número sugere uma precisão que esse tipo de análise não tem.

## Limites que assumimos

Ausência de registro de voto não é posição. Pode ser ausência justificada, licença ou votação simbólica, e a tela diz isso onde o caso aparece.

Escolaridade, perfis de rede social e ocupação são autodeclarados pelo parlamentar à Câmara. Publicamos como declaração, não como fato conferido.

Quando uma fonte oficial deixa de responder ou passa a devolver dado vazio, tiramos a funcionalidade do ar em vez de exibir um número errado. O que está fora e por quê fica registrado na página de API e dados.

## Erros e correções

Erramos, como qualquer publicação. Quando isso acontece, o texto original não é apagado: a correção é publicada com data na própria página, e quem entrar depois vê o que mudou e quando.

Para apontar um erro, abra uma issue no repositório com o link da página e a fonte que contradiz o que está publicado. Se a fonte for melhor que a nossa, a correção sai.

## O que não fazemos

Não recomendamos voto, não damos nota a político, não fazemos ranking e não publicamos previsão eleitoral. Também não aceitamos patrocínio de partido, campanha ou candidato.
