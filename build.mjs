// Monta o site estático em dist/: cada página de src/pages recebe head, header e footer.
// Uso: node build.mjs   →   envie o conteúdo de dist/ para public_html na Hostinger.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, cpSync, rmSync } from 'node:fs';

const SITE = 'https://ag180.com.br';
const part = (n) => readFileSync(`src/partials/${n}.html`, 'utf8');
const [head, header, footer] = ['head', 'header', 'footer'].map(part);

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
cpSync('public', 'dist', { recursive: true });

const urls = [];
for (const file of readdirSync('src/pages').filter((f) => f.endsWith('.html'))) {
  const raw = readFileSync(`src/pages/${file}`, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error(`${file}: falta o bloco de metadados ---`);
  const meta = JSON.parse(m[1]);
  const slug = file.replace('.html', '');
  const path = slug === 'index' ? '/' : `/${slug}`;
  urls.push(path);

  const nav = header.replace(new RegExp(`data-nav="${meta.nav ?? slug}"`), 'data-nav aria-current="page"');
  const vars = { title: meta.title, description: meta.description, url: SITE + path, site: SITE };
  const fill = (s) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
${fill(head)}
</head>
<body data-page="${slug}"${meta.dark ? ' class="hero-dark"' : ''}>
${nav}
<main id="conteudo">
${raw.slice(m[0].length)}
</main>
${fill(footer)}
<script src="/assets/js/site.js" defer></script>
</body>
</html>
`;
  writeFileSync(`dist/${file}`, html);
}

writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE}${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`
);
console.log(`dist/ pronto: ${urls.length} páginas`);
