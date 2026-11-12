// AG|180° · scripts do site (sem dependências)
// Configuração: preencha quando tiver os links definitivos.
const CONFIG = {
  whatsapp: '5571987964471',
  // Link do Calendly, ex.: 'https://calendly.com/ag180/conversa'. Vazio = botão abre o WhatsApp.
  calendly: '',
  // Endpoint do formulário (Formspree, ex.: 'https://formspree.io/f/xxxxxx'). Vazio = mensagem vai pelo WhatsApp.
  formEndpoint: '',
};

const doc = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
doc.classList.add('js');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const wa = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

$$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

/* Header, barra de progresso e órbita: um único listener de scroll com rAF */
const header = $('.site-header');
const bar = $('.progress i');
const waFloat = $('.wa-float');
const spins = $$('.spin');
let lastY = 0, ticking = false;
function onScroll() {
  const y = scrollY;
  const max = doc.scrollHeight - innerHeight;
  header.classList.toggle('scrolled', y > 20);
  if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  waFloat?.classList.toggle('show', y > 600);
  if (!reduce) spins.forEach((s) => (s.style.transform = `rotate(${y * (+s.dataset.speed || 0.12)}deg)`));
  lastY = y;
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* Menu mobile */
const menuBtn = $('.menu-btn');
const nav = $('#nav');
menuBtn?.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') !== 'true';
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
$$('#nav a').forEach((a) => a.addEventListener('click', () => nav.classList.contains('open') && menuBtn.click()));

/* Hero: entrada das linhas do título */
$$('.hero h1 .line > span').forEach((s, i) => s.style.setProperty('--d', `${0.08 + i * 0.09}s`));
$$('.draw').forEach((p) => p.style.setProperty('--len', Math.ceil(p.getTotalLength?.() || 1000)));
requestAnimationFrame(() => setTimeout(() => $$('.hero').forEach((h) => h.classList.add('ready')), 60));

/* Elementos que aparecem ao rolar */
$$('[data-stagger]').forEach((g) => [...g.children].forEach((c, i) => {
  c.classList.add('reveal');
  c.style.setProperty('--d', `${i * 0.09}s`);
}));
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  if (e.target.matches('[data-count]')) countUp(e.target);
  io.unobserve(e.target);
}), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
$$('.reveal, .reveal-x, [data-count], .step').forEach((el) => io.observe(el));
$$('.step').forEach((s, i) => s.style.setProperty('--d', `${0.2 + i * 0.25}s`));

/* Contadores */
function countUp(el) {
  const end = parseFloat(el.dataset.count);
  if (reduce || isNaN(end)) { el.textContent = el.dataset.count; return; }
  const dur = 1600, t0 = performance.now();
  const step = (t) => {
    const p = Math.min((t - t0) / dur, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* Relevo do hero: curvas de nível geradas uma vez */
const topo = $('#topo');
if (topo) {
  let d = '';
  for (let k = 0; k < 16; k++) {
    const y0 = 60 + k * 52, a = 26 + (k % 5) * 9, f = 0.004 + (k % 3) * 0.0012, ph = k * 0.7;
    let p = `M-50 ${y0}`;
    for (let x = -50; x <= 1450; x += 25) p += ` L${x} ${(y0 + Math.sin(x * f + ph) * a + Math.cos(x * f * 0.5 + ph * 1.7) * a * 0.6).toFixed(1)}`;
    d += `<path d="${p}"/>`;
  }
  topo.innerHTML = `<g>${d}</g>`;
}

/* Efeitos ligados à rolagem: um listener, leitura em rAF, só mexe no DOM quando muda */
const scrubs = $$('[data-scrub]').map((el) => {
  const walk = (node) => [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((t) => {
        if (!t) return;
        if (/^\s+$/.test(t)) frag.append(t);
        else { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.append(s); }
      });
      n.replaceWith(frag);
    } else walk(n);
  });
  walk(el);
  return { el, words: $$('.w', el), lit: -1 };
});
const cards = $$('.mcard');
cards.forEach((c, i) => c.style.setProperty('--i', i));
const stairs = $$('.stairs');
const clamp01 = (v) => Math.max(0, Math.min(1, v));
function scrollFx() {
  const vh = innerHeight;
  for (const s of scrubs) {
    const r = s.el.getBoundingClientRect();
    const p = reduce ? 1 : clamp01((vh * 0.85 - r.top) / (r.height + vh * 0.35));
    const n = Math.round(p * s.words.length);
    if (n !== s.lit) { s.words.forEach((w, i) => w.classList.toggle('on', i < n)); s.lit = n; }
  }
  cards.forEach((c) => { const r = c.getBoundingClientRect(); c.classList.toggle('on', reduce || (r.top < vh * 0.88 && r.bottom > vh * 0.12)); });
  for (const s of stairs) {
    const r = s.getBoundingClientRect();
    s.style.setProperty('--draw', reduce ? 0 : 1 - clamp01((vh * 0.9 - r.top) / (vh * 0.5)));
  }
}
if (scrubs.length || cards.length || stairs.length) {
  let fxTick = false;
  addEventListener('scroll', () => { if (!fxTick) { fxTick = true; requestAnimationFrame(() => { scrollFx(); fxTick = false; }); } }, { passive: true });
  addEventListener('resize', scrollFx);
  scrollFx();
}

/* Palavra digitando */
$$('.rot').forEach((el) => {
  const words = el.dataset.words.split('|');
  if (reduce) return;
  let w = 0, c = words[0].length, del = true;
  const tick = () => {
    if (del) { c--; if (c <= 0) { del = false; w = (w + 1) % words.length; } }
    else { c++; if (c >= words[w].length) { del = true; el.textContent = words[w]; return setTimeout(tick, 1800); } }
    el.textContent = words[w].slice(0, Math.max(c, 0)) || '\u200b';
    setTimeout(tick, del ? 40 : 75);
  };
  setTimeout(tick, 2200);
});

/* Lead → Lucro */
$$('.pipe').forEach((pipe) => {
  $$('li', pipe).forEach((li, i) => li.style.setProperty('--i', i));
  const btns = $$('.pipe-tabs button', pipe);
  btns.forEach((b) => b.addEventListener('click', () => {
    pipe.dataset.mode = b.dataset.m;
    btns.forEach((x) => x.setAttribute('aria-pressed', x === b));
  }));
  // Mostra a virada sozinho na primeira vez que aparece
  const once = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    once.disconnect();
    setTimeout(() => btns[1]?.click(), 1400);
  }, { threshold: 0.6 });
  once.observe(pipe);
});

/* Antes × depois */
$$('.ba').forEach((ba) => {
  const r = $('.ba-range', ba);
  r.addEventListener('input', () => ba.style.setProperty('--p', r.value + '%'));
});

/* Luz que segue o mouse, com leve atraso para ficar suave */
if (!reduce && matchMedia('(hover: hover)').matches) {
  const glow = document.createElement('div');
  glow.className = 'glow';
  glow.setAttribute('aria-hidden', 'true');
  document.body.append(glow);
  let tx = innerWidth / 2, ty = innerHeight / 2, gx = tx, gy = ty, running = false;
  const follow = () => {
    gx += (tx - gx) * 0.14; gy += (ty - gy) * 0.14;
    glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
    running = Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5;
    if (running) requestAnimationFrame(follow);
  };
  addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    glow.classList.add('on');
    if (!running) { running = true; requestAnimationFrame(follow); }
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => glow.classList.remove('on'));
}

/* Botões magnéticos (apenas mouse) */
if (!reduce && matchMedia('(hover: hover)').matches) {
  $$('.magnetic').forEach((b) => {
    b.addEventListener('mousemove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.32}px)`;
    });
    b.addEventListener('mouseleave', () => (b.style.transform = ''));
  });
}

/* Agenda: usa o Calendly quando configurado */
$$('[data-schedule]').forEach((a) => {
  a.href = CONFIG.calendly || wa('Olá! Quero agendar uma conversa com a AG|180°.');
  a.target = '_blank';
  a.rel = 'noopener';
});

/* Formulário de contato */
$$('form[data-contact]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('.form-msg', form);
    const data = Object.fromEntries(new FormData(form));
    if (CONFIG.formEndpoint) {
      msg.textContent = 'Enviando…';
      try {
        const r = await fetch(CONFIG.formEndpoint, { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        if (!r.ok) throw new Error();
        form.reset();
        msg.textContent = 'Recebemos sua mensagem. Respondemos em até 1 dia útil.';
      } catch {
        msg.textContent = 'Não foi possível enviar agora. Tente pelo WhatsApp.';
      }
      return;
    }
    const text = `Olá! Vim pelo site da AG|180°.\nNome: ${data.nome}\nEmpresa: ${data.empresa || '-'}\nSegmento: ${data.segmento || '-'}\nE-mail: ${data.email}\nTelefone: ${data.telefone || '-'}\n\n${data.mensagem || ''}`;
    open(wa(text), '_blank', 'noopener');
    msg.textContent = 'Abrimos o WhatsApp com a sua mensagem pronta. É só enviar.';
  });
});

/* Diagnóstico */
const quizEl = $('#quiz');
if (quizEl) {
  const P = { a: 'Aceleração', g: 'Growth & Marketing', t: 'Transformação Empresarial' };
  const DESC = {
    a: 'O gargalo está na base: margem, caixa e plano de expansão. Antes de investir em crescer, é preciso saber quanto sobra de cada venda e para onde o negócio vai.',
    g: 'O negócio tem estrutura, mas a entrada de clientes é instável. O próximo passo é ter canais previsíveis, um processo comercial com meta e um atendimento que não deixa cliente escapar.',
    t: 'A empresa depende demais de você. O ganho está em processos, indicadores, papéis claros e tecnologia, para a operação andar sem que você precise estar em tudo.',
  };
  const Q = [
    { q: 'Hoje, o que mais tira o seu sono?', o: [['Não sei ao certo quanto lucro de verdade', 'a'], ['Faltam clientes novos ou a agenda oscila muito', 'g'], ['Tudo passa por mim e eu não consigo me afastar', 't']] },
    { q: 'Como chegam os seus clientes novos?', o: [['Quase tudo por indicação', 'g'], ['Tenho anúncios, mas não sei o retorno', 'g'], ['Chegam bem, o problema é dar conta', 't'], ['Chegam, mas a margem é apertada', 'a']] },
    { q: 'Com que frequência você olha os números do negócio?', o: [['Só quando o caixa aperta', 'a'], ['Uma vez por mês, no fechamento', 'a'], ['Toda semana, mas sem metas claras', 't'], ['Tenho indicadores e metas', 'g']] },
    { q: 'Se você ficasse 15 dias fora, o que aconteceria?', o: [['A empresa praticamente para', 't'], ['Funciona, mas as vendas caem', 'g'], ['Funciona, mas perco o controle do caixa', 'a']] },
    { q: 'Qual o seu plano para os próximos 12 meses?', o: [['Abrir nova unidade ou franquear', 'a'], ['Encher a agenda e vender mais', 'g'], ['Organizar a casa e ganhar tempo', 't']] },
  ];
  let i = 0;
  const score = { a: 0, g: 0, t: 0 };
  const render = () => {
    if (i >= Q.length) return result();
    quizEl.innerHTML = `<div class="quiz-bar"><i style="width:${(i / Q.length) * 100}%"></i></div>
      <div class="quiz-anim"><p class="quiz-step">Pergunta ${i + 1} de ${Q.length}</p><h2>${Q[i].q}</h2>
      <div class="opts">${Q[i].o.map(([t, k]) => `<button class="opt" data-k="${k}">${t}</button>`).join('')}</div></div>`;
    $$('.opt', quizEl).forEach((b) => b.addEventListener('click', () => { score[b.dataset.k]++; i++; render(); }));
  };
  const result = () => {
    const total = Q.length;
    const top = Object.keys(score).sort((x, y) => score[y] - score[x])[0];
    quizEl.innerHTML = `<div class="quiz-bar"><i style="width:100%"></i></div>
      <div class="quiz-anim"><p class="quiz-step">Seu resultado</p><p class="muted" style="margin:0">A frente que mais destrava o seu negócio agora:</p>
      <p class="result-pillar">${P[top]}</p><p class="lead">${DESC[top]}</p>
      <div class="result-bars">${Object.keys(P).map((k) => `<div><span>${P[k]}</span><span class="bar"><i data-w="${(score[k] / total) * 100}"></i></span><b>${Math.round((score[k] / total) * 100)}%</b></div>`).join('')}</div>
      <div class="hero-acts"><a class="btn btn-accent btn-lg" target="_blank" rel="noopener" href="${wa(`Olá! Fiz o diagnóstico no site da AG|180° e o resultado foi ${P[top]}. Quero conversar.`)}">Conversar sobre o resultado <span class="arr">→</span></a>
      <button class="btn btn-line" id="redo">Refazer</button></div>
      <p class="placeholder-note">Resultado orientativo. Nada do que você responde é guardado.</p></div>`;
    requestAnimationFrame(() => setTimeout(() => $$('.result-bars i', quizEl).forEach((b) => (b.style.width = b.dataset.w + '%')), 50));
    $('#redo').addEventListener('click', () => { i = 0; score.a = score.g = score.t = 0; render(); });
  };
  render();
}

/* Calculadoras */
$$('[data-calc]').forEach((form) => {
  const out = $('.calc-out', form.parentElement);
  const calc = () => {
    const v = Object.fromEntries([...new FormData(form)].map(([k, x]) => [k, parseFloat(String(x).replace(',', '.')) || 0]));
    if (form.dataset.calc === 'margem') {
      const m = v.preco - v.custo - v.preco * (v.impostos + v.taxas) / 100;
      const pct = v.preco ? (m / v.preco) * 100 : 0;
      out.innerHTML = `<strong>${brl(m)} <small style="font-size:.5em">(${pct.toFixed(0)}%)</small></strong><span>sobram de cada venda antes de aluguel, folha e despesas fixas.</span>`;
    } else {
      const perda = v.saem * 12 * v.ticket * v.compras;
      out.innerHTML = `<strong>${brl(perda)}</strong><span>por ano deixam de entrar com os clientes que saem em silêncio.</span>`;
    }
  };
  form.addEventListener('input', calc);
  calc();
});
