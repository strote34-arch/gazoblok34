/* Бетон «Бери Бетон 34» + ЖБИ «ПростоЖБИ»: каталоги, калькуляторы, заказ в Telegram/MAX */
const fmt3 = (n) => new Intl.NumberFormat('ru-RU').format(n);

/* ===========================================================
   БЕТОН — марки + калькулятор объёма. Заказ расчёта в Telegram,
   заказ в MAX (ссылки в GB.BETON, правятся в админке).
   =========================================================== */
function BetonSection() {
  const B = window.GB.BETON;
  const isMobile = useIsMobile();
  const [grade, setGrade] = React.useState('m300');
  const [mode, setMode]   = React.useState('plita'); // plita | lenta | volume
  const [len, setLen] = React.useState(10);
  const [wid, setWid] = React.useState(8);
  const [thk, setThk] = React.useState(0.25);
  const [per, setPer] = React.useState(36);
  const [lw,  setLw]  = React.useState(0.4);
  const [ld,  setLd]  = React.useState(1.2);
  const [vol, setVol] = React.useState(8);
  const [pulse, setPulse] = React.useState(false);

  const g = B.GRADES.find(x => x.id === grade) || B.GRADES[0];

  const r = React.useMemo(() => {
    let v = 0;
    if (mode === 'plita') v = Number(len) * Number(wid) * Number(thk);
    else if (mode === 'lenta') v = Number(per) * Number(lw) * Number(ld);
    else v = Number(vol);
    const v2 = Math.ceil(v * 1.02 * 2) / 2;            // запас 2%, округление до 0,5 м³
    const mixers = Math.max(1, Math.ceil(v2 / (B.mixerM3 || 8)));
    const cost = Math.round(v2 * g.price);
    return { v: Math.round(v * 100) / 100, v2, mixers, cost };
  }, [mode, len, wid, thk, per, lw, ld, vol, grade]);

  React.useEffect(() => { setPulse(true); const t = setTimeout(() => setPulse(false), 320); return () => clearTimeout(t); }, [r.v2, r.cost]);

  const Stepper = ({ label, unit, value, set, min, max, step = 1 }) => (
    <div>
      <label style={bt.flabel}>{label}<span style={bt.funit}>{unit}</span></label>
      <div style={bt.stepper}>
        <button style={bt.stepBtn} onClick={() => set(Math.max(min, Math.round((value - step) * 100) / 100))} aria-label="−">–</button>
        <input style={bt.stepInput} type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => { const v = e.target.value === '' ? min : Number(e.target.value); set(Math.min(max, Math.max(min, v))); }} />
        <button style={bt.stepBtn} onClick={() => set(Math.min(max, Math.round((value + step) * 100) / 100))} aria-label="+">+</button>
      </div>
    </div>
  );

  const MODES = [
    { id: 'plita', label: 'Плита' },
    { id: 'lenta', label: 'Лента' },
    { id: 'volume', label: 'Объём' },
  ];

  return (
    <section id="beton" className="section" style={{ background: 'var(--surface-2)', borderBlock: '1px solid var(--line)' }} data-screen-label="Бетон">
      <div className="wrap">
        <div style={bt.head}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Товарный бетон · Бери Бетон 34</span>
            <h2>Бетон с доставкой миксером</h2>
            <p>{B.intro}</p>
          </div>
          <a className="btn btn-ghost" href={B.TG_LINK} target="_blank" rel="noopener">Написать в Telegram {B.TG_LABEL} →</a>
        </div>

        {/* марки */}
        <div style={bt.grades}>
          {B.GRADES.map(gr => (
            <button key={gr.id} type="button" onClick={() => setGrade(gr.id)}
              className="card" style={{ ...bt.grade, ...(gr.id === grade ? bt.gradeOn : {}), padding: 0, overflow: 'hidden' }}>
              {gr.img ? <img src={gr.img} alt={`Бетон ${gr.name}`} loading="lazy" style={bt.gradeImg} /> : null}
              <span style={bt.gradeBody}>
                <span style={bt.gradeHead}>
                  <span style={bt.gradeName}>{gr.name}</span>
                  {gr.badge ? <span className="chip chip--accent">{gr.badge}</span> : <span className="chip">{gr.cls}</span>}
                </span>
                {gr.badge ? <span className="mono" style={bt.gradeCls}>класс {gr.cls}</span> : null}
                <span style={bt.gradeUse}>{gr.use}</span>
                <span style={bt.gradePrice}>{fmt3(gr.price)} ₽<span style={bt.gradePriceUnit}>/м³</span></span>
              </span>
            </button>
          ))}
        </div>

        {/* калькулятор */}
        <div style={{ ...bt.calcGrid, gridTemplateColumns: isMobile ? '1fr' : bt.calcGrid.gridTemplateColumns }}>
          <div className="card" style={bt.inputs}>
            <div style={{ marginBottom: 18 }}>
              <span className="eyebrow eyebrow--plain mono">Что заливаем</span>
            </div>
            <div style={bt.seg}>
              {MODES.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)}
                  style={{ ...bt.segBtn, ...(mode === m.id ? bt.segBtnOn : {}) }}>{m.label}</button>
              ))}
            </div>
            <div className="calc-fields" style={bt.fieldGrid}>
              {mode === 'plita' && (
                <React.Fragment>
                  <Stepper label="Длина" unit="м" value={len} set={setLen} min={1} max={60} step={0.5} />
                  <Stepper label="Ширина" unit="м" value={wid} set={setWid} min={1} max={60} step={0.5} />
                  <Stepper label="Толщина" unit="м" value={thk} set={setThk} min={0.05} max={1} step={0.05} />
                </React.Fragment>
              )}
              {mode === 'lenta' && (
                <React.Fragment>
                  <Stepper label="Длина ленты" unit="м" value={per} set={setPer} min={4} max={300} step={1} />
                  <Stepper label="Ширина ленты" unit="м" value={lw} set={setLw} min={0.2} max={1.5} step={0.05} />
                  <Stepper label="Глубина" unit="м" value={ld} set={setLd} min={0.3} max={3} step={0.1} />
                </React.Fragment>
              )}
              {mode === 'volume' && (
                <Stepper label="Объём бетона" unit="м³" value={vol} set={setVol} min={0.5} max={200} step={0.5} />
              )}
            </div>
            <div style={bt.sumLine}>
              <span className="mono" style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
                чистый объём {fmt3(r.v)} м³ · марка {g.name} ({g.cls})
              </span>
            </div>
          </div>

          <div style={bt.result}>
            <span className="eyebrow eyebrow--plain mono" style={{ color: 'var(--on-accent)', opacity: .85 }}>Нужно бетона</span>
            <div style={{ ...bt.bigNum, transform: pulse ? 'scale(1.015)' : 'scale(1)' }}>
              <span style={bt.bigNumVal}>{fmt3(r.v2)}</span>
              <span style={bt.bigNumUnit}>м³ с запасом</span>
            </div>
            <div className="res-cells" style={bt.resGrid}>
              <div style={bt.resCell}><div style={bt.resCellV}>{g.name}</div><div style={bt.resCellU}>марка</div></div>
              <div style={bt.resCell}><div style={bt.resCellV}>{r.mixers}</div><div style={bt.resCellU}>миксер(ов)</div></div>
              <div style={bt.resCell}><div style={bt.resCellV}>{fmt3(r.cost)} ₽</div><div style={bt.resCellU}>ориентир, без доставки</div></div>
            </div>
            <a className="btn btn-lg" style={bt.tgBtn} href={B.TG_LINK} target="_blank" rel="noopener">
              ✈ Заказать расчёт в Telegram
            </a>
            <a className="btn btn-ghost btn-lg" style={bt.maxBtn} href={B.MAX_LINK} target="_blank" rel="noopener">
              <span className="max-glyph"></span> Заказ на MAX
            </a>
            <p style={bt.resFoot}>Цены ориентировочные, без доставки. Напишите в Telegram {B.TG_LABEL} — подберу марку и посчитаю точно с доставкой.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===========================================================
   ЖБИ — каталог завода ПростоЖБИ (prostogbi.ru) + калькулятор
   =========================================================== */
function GbiCard({ g, onPick }) {
  const [imgOk, setImgOk] = React.useState(true);
  const src = g.img || `assets/slots/gbi-${g.id}.webp`;
  return (
    <article className="card" style={gb.card}>
      <div style={gb.thumb}>
        {imgOk
          ? <img src={src} alt={g.name} loading="lazy" style={gb.thumbImg} onError={() => setImgOk(false)} />
          : <div style={gb.thumbPh}><span style={gb.thumbPhGlyph}>▦</span><span className="mono" style={gb.thumbPhText}>{g.cat}</span></div>}
        <span className="chip" style={gb.catChip}>{g.cat}</span>
      </div>
      <div style={gb.body}>
        <h3 style={gb.name}>{g.name}</h3>
        <div className="mono" style={gb.meta}>{g.size} мм · {fmt3(g.weight)} кг</div>
        <p style={gb.note}>{g.note}</p>
        <div style={gb.footRow}>
          <div style={gb.price}>{fmt3(g.price)} ₽<span style={gb.priceUnit}>/шт</span></div>
          <button type="button" className="btn btn-dark btn-sm" onClick={() => onPick(g.id)}>Посчитать</button>
        </div>
      </div>
    </article>
  );
}

function GbiSection() {
  const list = window.GB.GBI || [];
  const isMobile = useIsMobile();
  const railRef = React.useRef(null);
  const calcRef = React.useRef(null);
  const [sel, setSel] = React.useState(list[0] ? list[0].id : null);
  const [qty, setQty] = React.useState(10);
  const [pulse, setPulse] = React.useState(false);

  const scroll = (dir) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * Math.min(680, el.clientWidth * 0.8), behavior: 'smooth' });
  };
  const pick = (id) => {
    setSel(id);
    const el = calcRef.current;
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const g = list.find(x => x.id === sel) || list[0] || {};
  const r = React.useMemo(() => {
    const cost = Math.round((g.price || 0) * qty);
    const tons = Math.round((g.weight || 0) * qty / 100) / 10;
    const trucks = Math.max(1, Math.ceil(tons / 20));
    return { cost, tons, trucks };
  }, [sel, qty, g.price, g.weight]);
  React.useEffect(() => { setPulse(true); const t = setTimeout(() => setPulse(false), 320); return () => clearTimeout(t); }, [r.cost]);

  if (!list.length) return null;

  return (
    <section id="gbi" className="section" data-screen-label="ЖБИ">
      <div className="wrap">
        <div style={bt.head}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">ЖБИ · завод ПростоЖБИ</span>
            <h2>Железобетонные изделия</h2>
            <p>Блоки ФБС, перемычки, сваи, лестничные марши, кольца и плиты с завода ЖБИ в Волгограде. Более 120 видов изделий — серийные и по чертежам.</p>
          </div>
          <div style={gb.navBtns}>
            <a className="btn btn-ghost" href={window.GB.GBI_URL} target="_blank" rel="noopener">Весь каталог завода →</a>
            <button style={gb.navBtn} onClick={() => scroll(-1)} aria-label="Назад">←</button>
            <button style={gb.navBtn} onClick={() => scroll(1)} aria-label="Вперёд">→</button>
          </div>
        </div>
      </div>

      <div ref={railRef} style={gb.rail} className="gb-rail">
        <div style={{ width: 'var(--gutter)', flex: 'none' }}></div>
        {list.map(item => <GbiCard key={item.id} g={item} onPick={pick} />)}
        <div style={{ width: 'var(--gutter)', flex: 'none' }}></div>
      </div>

      {/* калькулятор ЖБИ */}
      <div className="wrap" id="gbi-calc" ref={calcRef}>
        <div style={{ ...bt.calcGrid, gridTemplateColumns: isMobile ? '1fr' : bt.calcGrid.gridTemplateColumns, marginTop: 'clamp(22px,3vw,34px)' }}>
          <div className="card" style={bt.inputs}>
            <div style={{ marginBottom: 18 }}>
              <span className="eyebrow eyebrow--plain mono">Калькулятор ЖБИ</span>
              <p className="muted" style={{ fontSize: 14.5, marginTop: 6 }}>Выберите изделие и количество — посчитаю стоимость, вес и машины на доставку.</p>
            </div>
            <div style={{ display: 'grid', gap: 18 }}>
              <div>
                <label style={bt.flabel}>Изделие<span style={bt.funit}>каталог</span></label>
                <select value={sel || ''} onChange={(e) => setSel(e.target.value)} style={gb.select}>
                  {list.map(item => (
                    <option key={item.id} value={item.id}>{item.cat} — {item.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={bt.flabel}>Количество<span style={bt.funit}>шт</span></label>
                <div style={bt.stepper}>
                  <button style={bt.stepBtn} onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="−">–</button>
                  <input style={bt.stepInput} type="number" value={qty} min={1} max={2000}
                    onChange={(e) => { const v = e.target.value === '' ? 1 : Number(e.target.value); setQty(Math.min(2000, Math.max(1, Math.round(v)))); }} />
                  <button style={bt.stepBtn} onClick={() => setQty(q => Math.min(2000, q + 1))} aria-label="+">+</button>
                </div>
              </div>
            </div>
            <div style={bt.sumLine}>
              <span className="mono" style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
                {g.name} · {g.size} мм · {fmt3(g.weight)} кг/шт · {fmt3(g.price)} ₽/шт
              </span>
            </div>
          </div>

          <div style={bt.result}>
            <span className="eyebrow eyebrow--plain mono" style={{ color: 'var(--on-accent)', opacity: .85 }}>{g.name}</span>
            <div style={{ ...bt.bigNum, transform: pulse ? 'scale(1.015)' : 'scale(1)' }}>
              <span style={bt.bigNumVal}>{fmt3(r.cost)}</span>
              <span style={bt.bigNumUnit}>₽ ориентир</span>
            </div>
            <div className="res-cells" style={bt.resGrid}>
              <div style={bt.resCell}><div style={bt.resCellV}>{fmt3(qty)}</div><div style={bt.resCellU}>шт</div></div>
              <div style={bt.resCell}><div style={bt.resCellV}>{fmt3(r.tons)}</div><div style={bt.resCellU}>тонн</div></div>
              <div style={bt.resCell}><div style={bt.resCellV}>~{r.trucks}</div><div style={bt.resCellU}>машин (20 т)</div></div>
            </div>
            <a className="btn btn-lg" style={bt.tgBtn} href={window.GB.BETON.TG_LINK} target="_blank" rel="noopener">
              ✈ Заказать расчёт в Telegram
            </a>
            <a className="btn btn-ghost btn-lg" style={bt.maxBtn} href={window.GB.BETON.MAX_LINK} target="_blank" rel="noopener">
              <span className="max-glyph"></span> Заказ на MAX
            </a>
            <p style={bt.resFoot}>Цены ориентировочные по прайсу завода — актуальные уточню при заказе. Доставка по Волгограду и области.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===========================================================
   Плавающая кнопка «Разделы» — вкл/выкл участков сайта.
   Видна после входа в админку (localStorage gb_admin_on).
   =========================================================== */
const SECTION_LABELS = [
  { k: 'calc',     label: 'Калькулятор' },
  { k: 'products', label: 'Газоблок' },
  { k: 'bricks',   label: 'Кирпич' },
  { k: 'beton',    label: 'Бетон' },
  { k: 'gbi',      label: 'ЖБИ' },
  { k: 'video',    label: 'Видео' },
  { k: 'articles', label: 'Статьи' },
  { k: 'projects', label: 'Проекты' },
  { k: 'delivery', label: 'Доставка' },
  { k: 'faq',      label: 'Вопросы' },
];

function SectionsFab({ sec, onToggle }) {
  const [open, setOpen] = React.useState(false);
  let isAdmin = false;
  try { isAdmin = localStorage.getItem('gb_admin_on') === '1'; } catch (e) {}
  if (!isAdmin) return null;
  return (
    <div style={sf.wrap}>
      {open && (
        <div className="card" style={sf.panel}>
          <div style={sf.panelHead}>
            <b style={{ fontSize: 14.5 }}>Разделы сайта</b>
            <span className="muted" style={{ fontSize: 12 }}>вкл / выкл</span>
          </div>
          <div style={sf.list}>
            {SECTION_LABELS.map(s => (
              <button key={s.k} type="button" onClick={() => onToggle(s.k)} style={sf.row}>
                <span style={{ fontSize: 14, fontWeight: 600, color: sec[s.k] ? 'var(--ink)' : 'var(--ink-3)' }}>{s.label}</span>
                <span style={{ ...sf.sw, ...(sec[s.k] ? sf.swOn : {}) }}>
                  <span style={{ ...sf.knob, transform: sec[s.k] ? 'translateX(16px)' : 'translateX(0)' }}></span>
                </span>
              </button>
            ))}
          </div>
          <p style={sf.note}>Изменения сохраняются и видны посетителям этого браузера. Управление для всех — в админке.</p>
        </div>
      )}
      <button type="button" style={sf.fab} onClick={() => setOpen(o => !o)} title="Включить/выключить разделы сайта">
        {open ? '×' : '▤'}<span style={{ fontSize: 13, fontWeight: 700 }}>{open ? 'Закрыть' : 'Разделы'}</span>
      </button>
    </div>
  );
}

/* ---------- styles ---------- */
const bt = {
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 'clamp(22px,3vw,36px)' },
  grades: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px,1fr))', gap: 12, marginBottom: 'clamp(22px,3vw,34px)' },
  grade: { display: 'flex', flexDirection: 'column', cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit', transition: 'all .15s ease' },
  gradeImg: { width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' },
  gradeBody: { display: 'flex', flexDirection: 'column', gap: 7, padding: 16, flex: 1 },
  gradeOn: { borderColor: 'var(--accent)', boxShadow: '0 0 0 1.5px var(--accent), var(--shadow-md)' },
  gradeHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  gradeName: { fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' },
  gradeCls: { fontSize: 11.5, color: 'var(--ink-3)' },
  gradeUse: { fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4, flex: 1 },
  gradePrice: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, marginTop: 2 },
  gradePriceUnit: { fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', marginLeft: 2 },

  calcGrid: { display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 22, alignItems: 'start' },
  inputs: { padding: 'clamp(22px,3vw,32px)' },
  seg: { display: 'flex', gap: 6, background: 'var(--surface-2)', padding: 5, borderRadius: 11, border: '1px solid var(--line)', marginBottom: 20 },
  segBtn: { flex: 1, padding: '9px 8px', border: 'none', background: 'transparent', borderRadius: 7, fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer', transition: 'all .15s ease' },
  segBtnOn: { background: 'var(--surface)', color: 'var(--ink)', boxShadow: 'var(--shadow-sm)' },
  fieldGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: '18px 22px' },
  flabel: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 14.5, fontWeight: 600, marginBottom: 9, color: 'var(--ink)' },
  funit: { fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 500, color: 'var(--ink-3)', letterSpacing: '.04em' },
  stepper: { display: 'flex', alignItems: 'stretch', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', background: 'var(--surface)' },
  stepBtn: { width: 40, border: 'none', background: 'var(--surface-2)', color: 'var(--ink-2)', fontSize: 20, cursor: 'pointer', lineHeight: 1 },
  stepInput: { flex: 1, minWidth: 0, border: 'none', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 600, color: 'var(--ink)', background: 'transparent', outline: 'none', padding: '10px 4px' },
  sumLine: { marginTop: 22, paddingTop: 16, borderTop: '1px solid var(--line-soft)' },

  result: { background: 'var(--ink)', color: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: 'clamp(24px,3vw,32px)', boxShadow: 'var(--shadow-lg)' },
  bigNum: { display: 'flex', alignItems: 'baseline', gap: 12, transition: 'transform .3s cubic-bezier(.2,.9,.3,1)', marginTop: 4 },
  bigNumVal: { fontFamily: 'var(--font-display)', fontSize: 'clamp(40px,5.5vw,56px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: .95, color: 'var(--on-accent)' },
  bigNumUnit: { fontSize: 17, fontWeight: 600, color: 'oklch(0.7 0.01 80)' },
  resGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 20 },
  resCell: { background: 'oklch(1 0 0 / 0.06)', borderRadius: 11, padding: '13px 12px', border: '1px solid oklch(1 0 0 / 0.08)' },
  resCellV: { fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--on-accent)' },
  resCellU: { fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'oklch(0.72 0.01 80)', marginTop: 3, letterSpacing: '.02em' },
  tgBtn: { width: '100%', marginTop: 20, background: '#26A5E4', color: '#fff', border: 'none' },
  maxBtn: { width: '100%', marginTop: 10, background: 'transparent', color: 'var(--on-accent)', borderColor: 'oklch(1 0 0 / 0.25)' },
  resFoot: { fontSize: 12.5, color: 'oklch(0.66 0.01 80)', marginTop: 14, lineHeight: 1.5 },
};

const gb = {
  navBtns: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  navBtn: { width: 44, height: 44, borderRadius: 999, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 18, color: 'var(--ink)', cursor: 'pointer', display: 'grid', placeItems: 'center' },
  rail: { display: 'flex', gap: 18, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 8, scrollSnapType: 'x proximity' },
  card: { flex: 'none', width: 280, scrollSnapAlign: 'start', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  thumb: { width: '100%', aspectRatio: '4/3', position: 'relative', overflow: 'hidden', background: 'oklch(0.93 0.005 260)' },
  thumbImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  thumbPh: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(145deg, oklch(0.93 0.005 260) 0%, oklch(0.87 0.008 260) 100%)' },
  thumbPhGlyph: { fontSize: 38, color: 'oklch(0.62 0.015 260)' },
  thumbPhText: { fontSize: 11.5, color: 'oklch(0.55 0.015 260)', letterSpacing: '.04em' },
  catChip: { position: 'absolute', top: 10, left: 10, background: 'oklch(0.995 0.003 80 / 0.92)' },
  body: { padding: 18, display: 'flex', flexDirection: 'column', gap: 9, flex: 1 },
  name: { fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' },
  meta: { fontSize: 12, color: 'var(--ink-3)' },
  note: { fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.45, flex: 1 },
  footRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 13, borderTop: '1px solid var(--line-soft)' },
  price: { fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 800, letterSpacing: '-0.02em' },
  priceUnit: { fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', marginLeft: 2 },
  select: { width: '100%', padding: '12px 14px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 15, fontFamily: 'var(--font-body)', color: 'var(--ink)', background: 'var(--surface)', outline: 'none' },
};

const sf = {
  wrap: { position: 'fixed', left: 18, bottom: 18, zIndex: 90, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 },
  fab: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--ink)', color: 'var(--bg)', fontSize: 16, cursor: 'pointer', boxShadow: 'var(--shadow-lg)', fontFamily: 'inherit' },
  panel: { width: 250, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, boxShadow: 'var(--shadow-lg)', background: 'var(--surface)' },
  panelHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 },
  list: { display: 'flex', flexDirection: 'column' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '8px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--line-soft)', cursor: 'pointer', font: 'inherit', width: '100%', textAlign: 'left' },
  sw: { width: 36, height: 20, borderRadius: 999, background: 'var(--line)', position: 'relative', flex: 'none', transition: 'background .15s ease', display: 'inline-block' },
  swOn: { background: 'var(--accent)' },
  knob: { position: 'absolute', top: 2, left: 2, width: 16, height: 16, borderRadius: 999, background: '#fff', transition: 'transform .15s ease', display: 'block' },
  note: { fontSize: 11.5, color: 'var(--ink-3)', lineHeight: 1.45 },
};

Object.assign(window, { BetonSection, GbiSection, SectionsFab, SECTION_LABELS });
