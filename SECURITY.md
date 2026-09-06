# Política de segurança

## Reportar uma falha

Use o Private Vulnerability Reporting do GitHub, na aba Security deste repositório. Não abra issue pública para falha de segurança.

Respondemos em até 72 horas. Se a falha for confirmada, publicamos a correção e um aviso creditando quem reportou, a menos que a pessoa prefira anonimato.

## Superfície de ataque

O projeto é um site estático. Não há autenticação, banco de dados, formulário, upload nem rota de escrita. Isso remove boa parte das classes clássicas de vulnerabilidade.

O que ainda importa aqui:

- Injeção de conteúdo pelos dados coletados, já que eles entram no HTML.
- Dependência comprometida na cadeia de build.
- Configuração fraca de CSP ou de cabeçalho de segurança.
- Adulteração do APK distribuído.

## O que já está aplicado

CSP restritiva, HSTS com preload, `X-Content-Type-Options`, `Referrer-Policy: no-referrer` e `Permissions-Policy` negando câmera, microfone, geolocalização, pagamento e sensores.

Nenhum script, fonte ou recurso de terceiro é carregado no navegador. No app, `cleartext` está desativado e `allowNavigation` está vazio.

Lockfile obrigatório, `npm audit` no CI e Dependabot com merge automático apenas em patch.

## Verificar o app

Todo release publica o APK com checksum SHA-256. Confira antes de instalar:

```bash
sha256sum politicamais.apk
```

A versão e a data de build também aparecem em `/docs/about/` e no `index.json` da API. Se não baterem com o release oficial, você não está na versão nossa.

## Fora de escopo

Relato gerado por scanner automático sem prova de exploração, ausência de cabeçalho que não gera risco real neste contexto, e engenharia social contra mantenedores.
