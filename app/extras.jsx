/* Доп. секции: калькулятор кирпича (обёртка), каталог кирпича Magma, 3D BIM, Доставка */
const fmt2 = (n) => new Intl.NumberFormat('ru-RU').format(n);

/* ---------- Калькулятор кирпича (секция-обёртка) ---------- */
function BrickCalcSection() {
  return (
    <section id="brick-calc" className="section">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Калькулятор кирпича</span>
          <h2>Посчитайте облицовочный кирпич</h2>
          <p>Введите длину и высоту стен и выберите формат — 1НФ или 1,4НФ. Покажу, сколько кирпича нужно на облицовку с запасом.</p>
        </div>
        <BrickCalculator />
      </div>
    </section>
  );
}

/* ---------- Каталог кирпича Magma — горизонтальная лента ---------- */
function BrickCatalog() {
  const railRef = React.useRef(null);
  const scroll = (dir) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * Math.min(680, el.clientWidth * 0.8), behavior: 'smooth' });
  };
  return (
    <section id="bricks" className="section section--tight">
      <div className="wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 'clamp(20px,3vw,32px)' }}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Облицовочный кирпич · Magma</span>
            <h2>Кирпич для фасада</h2>
            <p>Лицевой керамический кирпич завода «Магма Керамик» — для облицовки дома из газоблока. Листайте варианты.</p>
          </div>
          <div style={brc.navBtns}>
            <button style={brc.navBtn} onClick={() => scroll(-1)} aria-label="Назад">←</button>
            <button style={brc.navBtn} onClick={() => scroll(1)} aria-label="Вперёд">→</button>
          </div>
        </div>
      </div>
      <div ref={railRef} style={brc.rail} className="gb-rail">
        <div style={{ width: 'var(--gutter)', flex: 'none' }}></div>
        {window.GB.BRICKS.map(b => (
          <article key={b.id} className="card" style={brc.card}>
            <img src={`assets/slots/brick-${b.id}.webp`} alt={b.name} loading="lazy" style={{ ...brc.thumb, display: 'block', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = 'assets/gras-block.jpg'; }} />
            <div style={brc.body}>
              <div style={brc.cardHead}>
                <h3 style={brc.name}>{b.name}</h3>
                <span className="chip">{b.format}</span>
              </div>
              <div className="mono" style={brc.meta}>{b.color} · {b.size} мм</div>
              <p style={brc.note}>{b.note}</p>
              <div style={brc.footRow}>
                <div style={brc.price}>{fmt2(b.pricePerPc)} ₽<span style={brc.priceUnit}>/шт</span></div>
                <a className="btn btn-dark btn-sm" href={window.GB.MAX_LINK} target="_blank" rel="noopener">
                  <span className="max-glyph"></span> Заказать
                </a>
              </div>
            </div>
          </article>
        ))}
        <div style={{ width: 'var(--gutter)', flex: 'none' }}></div>
      </div>
      <div className="wrap">
        <p style={brc.foot}>Цены ориентировочные, уточняйте актуальные при заказе. Подберу кирпич под ваш фасад и посчитаю количество.</p>
      </div>
    </section>
  );
}

/* ---------- 3D BIM-модели ---------- */
function BimSection() {
  return (
    <section id="bim" className="section" style={{ background: 'var(--surface-2)', borderBlock: '1px solid var(--line)' }}>
      <div className="wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 'clamp(20px,3vw,32px)' }}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Проектировщикам · ГРАС</span>
            <h2>3D BIM-модели</h2>
            <p>Готовые BIM-модели блоков и элементов ГРАС для точного проектирования дома в Revit, ArchiCAD, Renga и nanoCAD.</p>
          </div>
          <a className="btn btn-ghost" href={window.GB.BIM_URL} target="_blank" rel="noopener">Скачать модели на ГРАС →</a>
        </div>
        <div style={bim.grid}>
          {window.GB.BIM.map(m => (
            <a key={m.id} className="card" href={window.GB.BIM_URL} target="_blank" rel="noopener" style={bim.card}>
              <div style={bim.cube}>
                <div style={bim.cubeGlyph}>◫</div>
              </div>
              <div style={bim.body}>
                <h3 style={bim.name}>{m.name}</h3>
                <div className="mono" style={bim.soft}>{m.soft}</div>
                <p style={bim.note}>{m.note}</p>
                <span style={bim.link}>Открыть <span className="arrow-x" style={{ display: 'inline-block', transition: 'transform .2s ease' }}>↗</span></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Доставка ---------- */
function DeliverySection() {
  const d = window.GB.DELIVERY;
  return (
    <section id="delivery" className="section">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Доставка и отгрузка</span>
          <h2>Привезу на участок</h2>
          <p>{d.intro}</p>
        </div>

        <div style={dl.steps}>
          {d.steps.map((s, i) => (
            <div key={i} style={dl.step}>
              <div style={dl.stepNum}>{i + 1}</div>
              <h3 style={dl.stepT}>{s.t}</h3>
              <p style={dl.stepD}>{s.d}</p>
              {i < d.steps.length - 1 && <span style={dl.stepArrow}>→</span>}
            </div>
          ))}
        </div>

        <div style={dl.methods}>
          {d.methods.map((m, i) => (
            <div key={i} className="card" style={dl.method}>
              <h3 style={dl.methodT}>{m.t}</h3>
              <p style={dl.methodD}>{m.d}</p>
            </div>
          ))}
        </div>

        <div style={dl.noteBar}>
          <span style={dl.noteIcon}>🚚</span>
          <p style={dl.noteText}>{d.note}</p>
          <a className="btn btn-primary btn-sm" href={window.GB.MAX_LINK} target="_blank" rel="noopener" style={{ flex: 'none' }}>
            <span className="max-glyph"></span> Заказать доставку
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- styles ---------- */
const brc = {
  navBtns: { display: 'flex', gap: 8 },
  navBtn: { width: 44, height: 44, borderRadius: 999, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 18, color: 'var(--ink)', cursor: 'pointer', display: 'grid', placeItems: 'center' },
  rail: { display: 'flex', gap: 18, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 8, scrollSnapType: 'x proximity' },
  card: { flex: 'none', width: 280, scrollSnapAlign: 'start', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  thumb: { width: '100%', aspectRatio: '4/3', background: 'oklch(0.95 0.01 60)' },
  body: { padding: 18, display: 'flex', flexDirection: 'column', gap: 9, flex: 1 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  name: { fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' },
  meta: { fontSize: 12, color: 'var(--ink-3)' },
  note: { fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.45, flex: 1 },
  footRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 13, borderTop: '1px solid var(--line-soft)' },
  price: { fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em' },
  priceUnit: { fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', marginLeft: 2 },
  foot: { fontSize: 13, color: 'var(--ink-3)', marginTop: 18, lineHeight: 1.5 },
};

const bim = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px,1fr))', gap: 18 },
  card: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  cube: { aspectRatio: '16/8', background: 'linear-gradient(135deg, var(--ink) 0%, oklch(0.32 0.02 260) 100%)', display: 'grid', placeItems: 'center' },
  cubeGlyph: { fontSize: 52, color: 'oklch(0.8 0.06 250)', opacity: .9 },
  body: { padding: 20, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
  name: { fontSize: 17.5, fontWeight: 700, letterSpacing: '-0.01em' },
  soft: { fontSize: 12, color: 'var(--accent-ink)', letterSpacing: '.02em' },
  note: { fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.45, flex: 1 },
  link: { fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4 },
};

const dl = {
  steps: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 'clamp(14px,2vw,22px)', marginBottom: 'clamp(20px,3vw,32px)' },
  step: { position: 'relative', padding: '4px 8px 4px 0' },
  stepNum: { width: 40, height: 40, borderRadius: 11, background: 'var(--accent)', color: 'var(--on-accent)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 14 },
  stepT: { fontSize: 18, fontWeight: 700, marginBottom: 7 },
  stepD: { fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.5, maxWidth: '34ch' },
  stepArrow: { position: 'absolute', top: 8, right: -2, fontSize: 18, color: 'var(--line-strong, var(--ink-3))', opacity: .4 },
  methods: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 16 },
  method: { padding: 22 },
  methodT: { fontSize: 17, fontWeight: 700, marginBottom: 8 },
  methodD: { fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 },
  noteBar: { display: 'flex', alignItems: 'center', gap: 18, marginTop: 'clamp(20px,3vw,32px)', padding: 'clamp(18px,2.5vw,24px)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', flexWrap: 'wrap' },
  noteIcon: { fontSize: 26, flex: 'none' },
  noteText: { flex: 1, minWidth: 220, fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.5 },
};

Object.assign(window, { BrickCalcSection, BrickCatalog, BimSection, DeliverySection });
