/* Content sections: Products, Videos, Articles, Projects, FAQ */
const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n);

/* Достаёт ID ролика из ссылки YouTube (watch, youtu.be, shorts, embed). */
function ytId(url) {
  if (!url) return null;
  const m = String(url).match(/(?:youtu\.be\/|watch\?v=|\/embed\/|\/shorts\/|\/v\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function SectionHead({ eyebrow, title, text, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 'clamp(28px,4vw,48px)' }}>
      <div className="section-head" style={{ marginBottom: 0 }}>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {action}
    </div>
  );
}

function Products() {
  return (
    <section id="products" className="section">
      <div className="wrap">
        <SectionHead
          eyebrow="Продукция · завод ГРАС"
          title="Газоблок, который кладу сам"
          text="Продаю те же блоки, из которых построил свой дом — завод ГРАС. Цена за кубометр, доставка по Волгограду и области."
          action={<a className="btn btn-ghost" href="#order">Запросить прайс</a>}
        />
        <div style={ps.grid}>
          {window.GB.PRODUCTS.map(p => (
            <article key={p.id} className="card" style={ps.card}>
              <div style={ps.thumb}>
                <img src={p.img || 'assets/gras-block.jpg'} alt={p.name} style={ps.thumbImg} />
                <span className="chip chip--accent" style={ps.badge}>{p.badge}</span>
              </div>
              <div style={ps.body}>
                <div style={ps.cardHead}>
                  <h3 style={ps.name}>{p.name}</h3>
                  <span className="chip">{p.density}</span>
                </div>
                <div className="mono" style={ps.size}>{p.size} мм</div>
                <p style={ps.note}>{p.note}</p>
                <div style={ps.footRow}>
                  <div>
                    <div style={ps.price}>{fmt(p.pricePerM3)} ₽<span style={ps.priceUnit}>/м³</span></div>
                    <div className="mono" style={ps.perBlock}>~{Math.round(p.pricePerM3 / p.blocksPerM3)} ₽ / {p.unitLabel || 'блок'}</div>
                  </div>
                  <a className="btn btn-dark btn-sm" href={window.GB.MAX_LINK} target="_blank" rel="noopener">
                    <span className="max-glyph"></span> Заказать
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlockGlyph({ thickness }) {
  const w = Math.min(118, 60 + thickness / 6);
  return (
    <div style={{ position: 'relative', width: w, height: 84, transformStyle: 'preserve-3d' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, var(--block) 0%, oklch(0.94 0.006 80) 100%)',
        border: '1px solid var(--block-edge)', borderRadius: 6,
        boxShadow: 'inset -10px -10px 24px oklch(0.84 0.008 78 / 0.5), var(--shadow-sm)',
      }}>
        <div style={{ position: 'absolute', top: 8, left: 8, right: 8, height: 1, background: 'oklch(0.86 0.008 78)' }}></div>
        <div style={{ position: 'absolute', top: 14, left: 8, right: 8, height: 1, background: 'oklch(0.88 0.008 78)' }}></div>
      </div>
    </div>
  );
}

function Videos() {
  return (
    <section id="video" className="section" style={{ background: 'var(--surface-2)', borderBlock: '1px solid var(--line)' }}>
      <div className="wrap">
        <SectionHead
          eyebrow="Видео с канала"
          title="Стройка в прямом эфире"
          text="Каждый этап — от первого ряда до крыши — снят и разобран на YouTube-канале ГАЗОБЛОК34."
          action={<a className="btn btn-ghost" href={window.GB.YT_LINK} target="_blank" rel="noopener">Все ролики →</a>}
        />
        <div className="m-videos" style={vs.grid}>
          {window.GB.VIDEOS.map((v, i) => {
            const vid = ytId(v.url);
            return (
            <a key={v.id} className="video-card" href={v.url || window.GB.YT_LINK} target="_blank" rel="noopener"
               style={{ ...vs.card, ...(i === 0 ? vs.cardFeature : {}) }}>
              <div className="ph" style={{ ...vs.thumb, aspectRatio: i === 0 ? '16/10' : '16/10' }}>
                {vid
                  ? <img src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`} alt={v.title}
                         loading="lazy" style={vs.thumbImg}
                         onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  : <span className="ph__label">{v.frame}</span>}
                <div className="ph__play"></div>
                {v.dur ? <span style={vs.dur}>{v.dur}</span> : null}
                <span className="chip" style={vs.vtag}>{v.tag}</span>
              </div>
              <div style={vs.meta}>
                <h3 style={{ ...vs.vtitle, fontSize: i === 0 ? 22 : 17 }}>{v.title}</h3>
                {v.views ? <div className="mono" style={vs.views}>{v.views} просмотров</div> : <div className="mono" style={vs.views}>Смотреть на YouTube →</div>}
              </div>
            </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Articles() {
  return (
    <section id="articles" className="section">
      <div className="wrap">
        <SectionHead
          eyebrow="Статьи и гайды"
          title="Разбираю по делу"
          text="Без воды: что важно знать, прежде чем класть первый блок."
          action={<a className="btn btn-ghost" href="#order">Задать вопрос</a>}
        />
        <div style={as.list}>
          {window.GB.ARTICLES.map((a, i) => (
            <button key={a.id} type="button" className="article-row"
              onClick={() => window.dispatchEvent(new CustomEvent('gb:article', { detail: a.id }))}
              style={{ ...as.row, ...(i === 0 ? as.rowFirst : {}) }}>
              <span className="mono" style={as.num}>{String(i + 1).padStart(2, '0')}</span>
              <div style={as.rowMain}>
                <div style={as.rowHead}>
                  <span className="chip">{a.cat}</span>
                  <span className="mono" style={as.mins}>{a.mins} мин чтения</span>
                </div>
                <h3 style={as.atitle}>{a.title}</h3>
                <p style={as.excerpt}>{a.excerpt}</p>
                <span style={as.readMore}>Читать статью <span className="arrow-x" style={{ display: 'inline-block', transition: 'transform .2s ease' }}>→</span></span>
              </div>
              <span style={as.arrow}>→</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Projects() {
  return (
    <section id="projects" className="section" style={{ background: 'var(--surface-2)', borderBlock: '1px solid var(--line)' }}>
      <div className="wrap">
        <SectionHead
          eyebrow="Готовые проекты · ГРАС"
          title="С чего начать стройку"
          text="Готовые проекты домов из газобетона ГРАС — от компактных одноэтажных до больших семейных. Откройте проект, чтобы прочитать и скачать на сайте завода."
          action={<a className="btn btn-ghost" href={window.GB.PROJECTS_URL} target="_blank" rel="noopener">Все проекты →</a>}
        />
        <div style={prs.grid}>
          {window.GB.PROJECTS.map(p => (
            <article key={p.id} className="card" style={prs.card}>
              <image-slot id={`project-${p.id}`} style={{ ...prs.thumb, width: '100%', height: 'auto', display: 'block' }} shape="rect" placeholder={`фото: ${p.frame}`}></image-slot>
              <div style={prs.body}>
                <div style={prs.headRow}>
                  <h3 style={prs.name}>«{p.name}»</h3>
                  <span className="chip">{p.floors}</span>
                </div>
                <div style={prs.specs}>
                  <Spec v={`${fmt(p.area)}`} u="м²" />
                  <Spec v={`${p.rooms}`} u="комнат" />
                  <Spec v={p.floors.replace(/\D+/g, '') || '1'} u="этаж(а)" />
                </div>
                <button type="button" className="btn btn-ghost btn-sm" style={{ width: '100%' }}
                  onClick={() => window.dispatchEvent(new CustomEvent('gb:project', { detail: p.id }))}>
                  Подробнее и скачать
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectModal() {
  const [id, setId] = React.useState(null);
  React.useEffect(() => {
    const on = (e) => setId(e.detail);
    window.addEventListener('gb:project', on);
    return () => window.removeEventListener('gb:project', on);
  }, []);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setId(null); };
    if (id != null) { document.body.style.overflow = 'hidden'; window.addEventListener('keydown', onKey); }
    else { document.body.style.overflow = ''; }
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [id]);

  const p = id != null ? window.GB.PROJECTS.find(x => x.id === id) : null;
  if (!p) return null;
  const close = () => setId(null);
  return (
    <div className="gb-modal-overlay" style={am.overlay} onClick={close}>
      <article className="gb-modal-sheet" style={am.sheet} onClick={e => e.stopPropagation()}>
        <button style={am.close} onClick={close} aria-label="Закрыть">×</button>
        <div style={am.scroll}>
          <image-slot id={`projectbig-${p.id}`} style={{ width: '100%', height: 'auto', aspectRatio: '16/9', display: 'block', borderRadius: 14, marginBottom: 22 }} shape="rounded" radius="14" placeholder={`фото проекта «${p.name}»`}></image-slot>
          <div style={am.headMeta}>
            <span className="chip chip--accent">Проект «{p.name}»</span>
            <span className="mono" style={am.mins}>{p.floors}</span>
          </div>
          <h2 style={am.title}>Дом «{p.name}» — {fmt(p.area)} м²</h2>
          <div style={pm.specs}>
            <div style={pm.spec}><div style={pm.specV}>{fmt(p.area)}</div><div style={pm.specU}>м² площадь</div></div>
            <div style={pm.spec}><div style={pm.specV}>{p.rooms}</div><div style={pm.specU}>комнат</div></div>
            <div style={pm.spec}><div style={pm.specV}>{p.floors.replace(/\D+/g, '') || '1'}</div><div style={pm.specU}>этаж(а)</div></div>
          </div>
          <p style={{ ...am.p, marginTop: 22 }}>{p.desc}</p>
          <div style={am.foot}>
            <a className="btn btn-primary" href={window.GB.PROJECTS_URL} target="_blank" rel="noopener">
              Открыть и скачать на ГРАС ↗
            </a>
            <a className="btn btn-ghost" href={window.GB.MAX_LINK} target="_blank" rel="noopener">
              <span className="max-glyph"></span> Узнать смету в MAX
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}

const pm = {
  specs: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 20, padding: '18px 0', borderBlock: '1px solid var(--line)' },
  spec: { textAlign: 'center' },
  specV: { fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' },
  specU: { fontSize: 12, color: 'var(--ink-3)', marginTop: 3 },
};

function Spec({ v, u }) {
  return (
    <div style={prs.spec}>
      <div style={prs.specV}>{v}</div>
      <div className="mono" style={prs.specU}>{u}</div>
    </div>
  );
}

function FAQ() {
  const [open, setOpen] = React.useState(0);
  const isMobile = useIsMobile();
  return (
    <section id="faq" className="section">
      <div className="wrap" style={{ ...fq.grid, gridTemplateColumns: isMobile ? '1fr' : fq.grid.gridTemplateColumns }}>
        <div style={{ ...fq.left, position: isMobile ? 'static' : fq.left.position }}>
          <span className="eyebrow">Вопрос — ответ</span>
          <h2 style={{ fontSize: 'clamp(28px,3.6vw,44px)', marginTop: 16 }}>Частые вопросы<br/>о газоблоке</h2>
          <p className="muted" style={{ marginTop: 16, fontSize: 16.5 }}>
            Не нашли ответ? Спрошу — отвечу лично в MAX.
          </p>
          <a className="btn btn-primary" href={window.GB.MAX_LINK} target="_blank" rel="noopener" style={{ marginTop: 22 }}>
            <span className="max-glyph"></span> Задать вопрос
          </a>
        </div>
        <div style={fq.list}>
          {window.GB.FAQ.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="card" style={{ ...fq.item, ...(isOpen ? fq.itemOpen : {}) }}>
                <button style={fq.q} onClick={() => setOpen(isOpen ? -1 : i)}>
                  <span style={fq.qText}>{f.q}</span>
                  <span style={{ ...fq.plus, transform: isOpen ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                <div style={{ ...fq.aWrap, gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                  <div style={{ overflow: 'hidden' }}>
                    <p style={fq.a}>{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Article modal ---------- */
function ArticleModal() {
  const [id, setId] = React.useState(null);
  React.useEffect(() => {
    const on = (e) => setId(e.detail);
    window.addEventListener('gb:article', on);
    return () => window.removeEventListener('gb:article', on);
  }, []);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setId(null); };
    if (id != null) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKey);
    } else {
      document.body.style.overflow = '';
    }
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [id]);

  const a = id != null ? window.GB.ARTICLES.find(x => x.id === id) : null;
  const close = () => setId(null);
  const idx = a ? window.GB.ARTICLES.findIndex(x => x.id === a.id) : -1;
  const next = idx >= 0 ? window.GB.ARTICLES[(idx + 1) % window.GB.ARTICLES.length] : null;

  if (!a) return null;

  return (
    <div className="gb-modal-overlay" style={am.overlay} onClick={close}>
      <article className="gb-modal-sheet" style={am.sheet} onClick={e => e.stopPropagation()}>
        <button style={am.close} onClick={close} aria-label="Закрыть">×</button>
        <div style={am.scroll}>
          <div style={am.head}>
            <div style={am.headMeta}>
              <span className="chip chip--accent">{a.cat}</span>
              <span className="mono" style={am.mins}>{a.mins} мин чтения</span>
            </div>
            <h2 style={am.title}>{a.title}</h2>
            <p style={am.lede}>{a.excerpt}</p>
          </div>
          <div style={am.body}>
            {(a.body || []).map((p, i) => <p key={i} style={am.p}>{p}</p>)}
          </div>
          <div style={am.foot}>
            <a className="btn btn-primary" href={window.GB.MAX_LINK} target="_blank" rel="noopener">
              <span className="max-glyph"></span> Задать вопрос по теме
            </a>
            {next && next.id !== a.id && (
              <button type="button" className="btn btn-ghost" onClick={() => setId(next.id)}>
                Следующая: «{next.title.length > 28 ? next.title.slice(0, 28) + '…' : next.title}» →
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

/* ---------- styles ---------- */
const ps = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 20 },
  card: { overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  thumb: { aspectRatio: '16/10', borderRadius: 0, position: 'relative', overflow: 'hidden', background: 'oklch(0.96 0.004 80)' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  badge: { position: 'absolute', top: 12, left: 12 },
  body: { padding: 20, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  name: { fontSize: 19, fontWeight: 700 },
  size: { fontSize: 12.5, color: 'var(--ink-3)', letterSpacing: '.02em' },
  note: { fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5, flex: 1 },
  footRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 6, paddingTop: 14, borderTop: '1px solid var(--line-soft)' },
  price: { fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' },
  priceUnit: { fontSize: 14, fontWeight: 600, color: 'var(--ink-3)', marginLeft: 2 },
  perBlock: { fontSize: 12, color: 'var(--ink-3)', marginTop: 2 },
};

const vs = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  card: { display: 'flex', flexDirection: 'column', gap: 14 },
  cardFeature: { gridColumn: 'span 2', gridRow: 'span 1' },
  thumb: { width: '100%', position: 'relative' },
  thumbImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  dur: { position: 'absolute', bottom: 10, right: 10, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--on-accent)', background: 'oklch(0.235 0.012 70 / 0.85)', padding: '3px 8px', borderRadius: 6 },
  vtag: { position: 'absolute', top: 10, left: 10, background: 'oklch(0.995 0.003 80 / 0.9)' },
  meta: { display: 'flex', flexDirection: 'column', gap: 6 },
  vtitle: { fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.01em' },
  views: { fontSize: 12.5, color: 'var(--ink-3)' },
};

const as = {
  list: { display: 'flex', flexDirection: 'column' },
  row: { display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 'clamp(16px,3vw,40px)', alignItems: 'center', padding: 'clamp(22px,3vw,30px) 4px', borderTop: '1px solid var(--line)', transition: 'all .18s ease', background: 'none', border: 'none', borderTop: '1px solid var(--line)', width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit', color: 'inherit' },
  rowFirst: { borderTop: 'none' },
  num: { fontSize: 14, color: 'var(--accent-ink)', fontWeight: 600, alignSelf: 'start', paddingTop: 4 },
  rowMain: { display: 'flex', flexDirection: 'column', gap: 8 },
  rowHead: { display: 'flex', alignItems: 'center', gap: 10 },
  mins: { fontSize: 12, color: 'var(--ink-3)' },
  atitle: { fontSize: 'clamp(19px,2.2vw,25px)', fontWeight: 700, letterSpacing: '-0.02em' },
  excerpt: { fontSize: 15, color: 'var(--ink-2)', maxWidth: '70ch' },
  readMore: { fontSize: 13.5, fontWeight: 600, color: 'var(--accent-ink)', display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 4 },
  arrow: { fontSize: 22, color: 'var(--ink-3)', transition: 'transform .2s ease', alignSelf: 'center' },
};

const am = {
  overlay: { position: 'fixed', inset: 0, zIndex: 200, display: 'grid', placeItems: 'end center', background: 'oklch(0.2 0.01 70 / 0.55)', backdropFilter: 'blur(4px)', padding: '0' },
  sheet: { position: 'relative', width: 'min(720px, 100%)', maxHeight: '92vh', background: 'var(--surface)', borderRadius: '20px 20px 0 0', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  close: { position: 'absolute', top: 16, right: 16, zIndex: 3, width: 40, height: 40, borderRadius: 999, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 24, lineHeight: 1, color: 'var(--ink-2)', cursor: 'pointer', display: 'grid', placeItems: 'center' },
  scroll: { overflowY: 'auto', padding: 'clamp(28px,4vw,44px)' },
  head: { borderBottom: '1px solid var(--line)', paddingBottom: 22, marginBottom: 24 },
  headMeta: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  mins: { fontSize: 12.5, color: 'var(--ink-3)' },
  title: { fontSize: 'clamp(26px,3.4vw,38px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 14, maxWidth: '20ch' },
  lede: { fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.55, maxWidth: '60ch' },
  body: { display: 'flex', flexDirection: 'column', gap: 18 },
  p: { fontSize: 16.5, lineHeight: 1.7, color: 'var(--ink)', maxWidth: '66ch' },
  foot: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--line)' },
};

const prs = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(258px,1fr))', gap: 20 },
  card: { overflow: 'hidden' },
  thumb: { aspectRatio: '4/3', borderRadius: 0 },
  body: { padding: 20, display: 'flex', flexDirection: 'column', gap: 16 },
  headRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { fontSize: 21, fontWeight: 700 },
  specs: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: '14px 0', borderBlock: '1px solid var(--line-soft)' },
  spec: { textAlign: 'center' },
  specV: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' },
  specU: { fontSize: 11, color: 'var(--ink-3)', marginTop: 2 },
};

const fq = {
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0,0.8fr) minmax(0,1.2fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'start' },
  left: { position: 'sticky', top: 96 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  item: { padding: '4px 22px', transition: 'box-shadow .2s ease' },
  itemOpen: { boxShadow: 'var(--shadow-md)' },
  q: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' },
  qText: { fontSize: 17, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em' },
  plus: { fontSize: 26, fontWeight: 300, color: 'var(--accent)', transition: 'transform .25s ease', flex: 'none', lineHeight: 1 },
  aWrap: { display: 'grid', transition: 'grid-template-rows .28s ease' },
  a: { fontSize: 15.5, color: 'var(--ink-2)', lineHeight: 1.6, paddingBottom: 22, maxWidth: '64ch' },
};

Object.assign(window, { Products, Videos, Articles, Projects, FAQ, ArticleModal, ProjectModal });
