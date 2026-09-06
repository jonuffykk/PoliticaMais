O Politica+ não coleta nada sobre você. Esta página é curta porque não há muito o que contar, e é honesta sobre a única coisa que sai do seu aparelho.

## O que não coletamos

Não há login, cadastro, formulário, cookie de rastreio, pixel, análise de uso, mapa de calor ou identificador de dispositivo. Não sabemos quem você é, o que você leu, de onde acessou nem quantas vezes voltou.

Não existe script de terceiro no site. Nenhuma fonte externa, nenhum vídeo incorporado, nenhum botão de rede social que carregue código de outra empresa.

## As requisições que saem do seu navegador

Esta é a parte que exige transparência, porque o site consulta as fontes oficiais na hora, e quem faz a consulta é o seu navegador, não um servidor nosso.

Ao abrir uma página com dado ao vivo, o seu aparelho fala diretamente com:

- `dadosabertos.camara.leg.br`, para parlamentares, votações, comissões e proposições
- `api.bcb.gov.br`, para as séries econômicas
- `camara.leg.br` e `senado.leg.br`, para os retratos oficiais

Esses órgãos veem o seu endereço IP e o horário, como qualquer servidor web vê. É o mesmo que aconteceria se você abrisse o site deles. Enviamos `Referrer-Policy: no-referrer`, então eles não recebem a informação de qual página você estava vendo.

A alternativa seria copiarmos tudo para um servidor nosso e servirmos de intermediário. Isso esconderia o seu IP daqueles órgãos e o entregaria a nós, além de tornar o número mais velho e menos verificável. Preferimos que você fale direto com a fonte e saiba disso.

Se você não quiser esse contato direto, uma VPN ou o Tor resolvem, e o restante do site continua funcionando.

## O que fica no seu aparelho

Duas coisas, ambas no armazenamento local do navegador, nenhuma delas chega até nós:

- a preferência de tema: claro, escuro ou o do sistema
- o resultado das consultas que você já fez, para a tela abrir rápido e continuar legível sem internet

Limpar os dados do navegador apaga as duas. A seleção da página de comparação fica no endereço da página, e não em armazenamento.

## App Android

O app não pede permissão de câmera, microfone, localização, contatos ou armazenamento. Ele faz as mesmas requisições descritas acima e guarda o mesmo cache local. Sem internet, mostra o que já estava guardado e diz que a fonte está fora do ar.

## Hospedagem

O site é servido pela Vercel, que registra dados técnicos de acesso como qualquer servidor web faz, incluindo endereço IP e horário. Esses registros são da Vercel e seguem a política dela. Não temos acesso a eles, não pedimos e não usamos.

## Verificação

Você não precisa acreditar nesta página. O código é aberto sob AGPL-3.0, e a política de segurança de conteúdo do site declara exatamente quais endereços podem receber requisição. Abra `lib/sources.ts` no repositório: toda chamada de rede do projeto está nesse arquivo.

## Contato

Dúvida sobre privacidade vira issue pública no repositório.
