# Site AG|180°

Site estático (HTML, CSS e JS puros, sem dependências).

- `src/pages/` — uma página por arquivo (metadados no bloco `---` do topo)
- `src/partials/` — head, menu e rodapé compartilhados
- `public/` — CSS, JS, fontes, favicon, `.htaccess`, `robots.txt`, `og.png`

## Gerar e publicar

```bash
node build.mjs        # gera dist/
```

Na Hostinger, envie o **conteúdo** de `dist/` para `public_html` (Gerenciador de Arquivos ou FTP).

## Configurar

Em `public/assets/js/site.js`, no objeto `CONFIG`:
- `calendly`: link da agenda (vazio = abre o WhatsApp)
- `formEndpoint`: endpoint do Formspree (vazio = formulário envia pelo WhatsApp)

Textos marcados como exemplo (cases, depoimentos, time) devem ser trocados pelos reais.
