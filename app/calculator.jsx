/* Калькулятор газоблока — простой расчёт: размеры стен → блоки, поддоны, клей, цена */

function Calculator() {
  const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n);
  const isMobile = useIsMobile();

  const DENSITIES = [
    { id: 'D300', price: 6950 },
    { id: 'D350', price: 7050 },
    { id: 'D400', price: 7100 },
    { id: 'D500', price: 7150 },
    { id: 'D600', price: 7250 },
  ];
  const THICKNESS = [200, 300, 400];

  const [len, setLen]       = React.useState(10);
  const [wid, setWid]       = React.useState(8);
  const [hgt, setHgt]       = React.useState(3);
  const [th, setTh]         = React.useState(300);
  const [openings, setOp]   = React.useState(18);
  const [dens, setDens]     = React.useState('D500');
  const [pulse, setPulse]   = React.useState(false);

  const r = React.useMemo(() => {
    const perimeter = 2 * (Number(len) + Number(wid));
    const gross = perimeter * Number(hgt);
    const net = Math.max(0, gross - Number(openings));
    const volume = net * (Number(th) / 1000);
    const blockVol = 0.6 * 0.25 * (Number(th) / 1000);
    const blocks = Math.ceil(volume / blockVol);
    const palletVol = ['D300', 'D350', 'D400'].includes(dens) ? 2.16 : 1.8;
    const pallets = Math.ceil(volume / palletVol);
    const glue = Math.ceil(volume / 1.5);
    const price = DENSITIES.find(d => d.id === dens).price;
    const cost = Math.round(volume * price);
    return { perimeter, net: Math.round(net), volume: Math.round(volume * 10) / 10, blocks, pallets, glue, cost };
  }, [len, wid, hgt, th, openings, dens]);

  React.useEffect(() => { setPulse(true); const t = setTimeout(() => setPulse(false), 320); return () => clearTimeout(t); }, [r.blocks, r.cost]);

  const orderText =
    `Здравствуйте! Расчёт с сайта gazoblok34.ru:%0A` +
    `• Дом ${len}×${wid} м, высота стен ${hgt} м%0A` +
    `• Газоблок ${dens}, толщина стены ${th} мм%0A` +
    `• Объём: ${r.volume} м³ · блоков ~${fmt(r.blocks)} шт · поддонов ${r.pallets}%0A` +
    `• Пено-клей ~${r.glue} баллонов%0A` +
    `• Ориентир по стоимости блоков: ${fmt(r.cost)} ₽%0AХочу уточнить и оформить заказ.`;

  const Stepper = ({ label, unit, value, set, min, max, step = 1 }) => (
    <div style={cs.field}>
      <label style={cs.flabel}>{label}<span style={cs.funit}>{unit}</span></label>
      <div style={cs.stepper}>
        <button style={cs.stepBtn} onClick={() => set(Math.max(min, Math.round((value - step) * 10) / 10))} aria-label="−">–</button>
        <input
          style={cs.stepInput}
          type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => { const v = e.target.value === '' ? min : Number(e.target.value); set(Math.min(max, Math.max(min, v))); }}
        />
        <button style={cs.stepBtn} onClick={() => set(Math.min(max, Math.round((value + step) * 10) / 10))} aria-label="+">+</button>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => set(Number(e.target.value))} style={cs.range} />
    </div>
  );

  return (
    <div style={{ ...cs.grid, gridTemplateColumns: isMobile ? '1fr' : cs.grid.gridTemplateColumns }}>
      {/* Inputs */}
      <div className="card" style={cs.inputs}>
        <div style={cs.inputsHead}>
          <span className="eyebrow eyebrow--plain mono">Параметры дома</span>
          <p className="muted" style={{ fontSize: 14.5, marginTop: 6 }}>Габариты по внешним стенам. Цифры можно править вручную.</p>
        </div>

        <div className="calc-fields" style={cs.fieldGrid}>
          <Stepper label="Длина дома" unit="м" value={len} set={setLen} min={3} max={40} step={0.5} />
          <Stepper label="Ширина дома" unit="м" value={wid} set={setWid} min={3} max={40} step={0.5} />
          <Stepper label="Высота стен" unit="м" value={hgt} set={setHgt} min={2} max={12} step={0.1} />
          <Stepper label="Окна и двери" unit="м²" value={openings} set={setOp} min={0} max={120} step={1} />
        </div>

        <div style={cs.choiceRow}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={cs.flabel}>Толщина стены<span style={cs.funit}>мм</span></label>
            <div style={cs.seg}>
              {THICKNESS.map(t => (
                <button key={t} onClick={() => setTh(t)}
                  style={{ ...cs.segBtn, ...(th === t ? cs.segBtnOn : {}) }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={cs.flabel}>Плотность блока<span style={cs.funit}>марка</span></label>
            <div style={{ ...cs.seg, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {DENSITIES.map(d => (
                <button key={d.id} onClick={() => setDens(d.id)}
                  style={{ ...cs.segBtn, ...(dens === d.id ? cs.segBtnOn : {}) }}>{d.id}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={cs.summaryLine}>
          <span className="mono" style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
            периметр {r.perimeter} м · площадь стен {fmt(r.net)} м²
          </span>
        </div>
      </div>

      {/* Result */}
      <div style={{ ...cs.resultWrap, position: isMobile ? 'static' : cs.resultWrap.position }}>
        <div style={cs.result}>
          <div style={cs.resHead}>
            <span className="eyebrow eyebrow--plain mono" style={{ color: 'var(--on-accent)', opacity: .85 }}>Нужно газоблока</span>
          </div>
          <div style={{ ...cs.bigNum, transform: pulse ? 'scale(1.015)' : 'scale(1)' }}>
            <span style={cs.bigNumVal}>{fmt(r.blocks)}</span>
            <span style={cs.bigNumUnit}>блоков</span>
          </div>

          <div className="res-cells" style={cs.resGrid}>
            <ResCell v={`${fmt(r.volume)}`} u="м³ объём" />
            <ResCell v={r.pallets} u="поддонов" />
            <ResCell v={`~${r.glue}`} u="баллонов клея" />
          </div>

          <div style={cs.costRow}>
            <div>
              <div className="mono" style={{ fontSize: 12, opacity: .8 }}>ориентир по блокам {dens}</div>
              <div style={cs.costVal}>{fmt(r.cost)} ₽</div>
            </div>
            <span style={cs.costNote}>без доставки</span>
          </div>

          <a className="btn btn-ghost btn-lg" style={cs.resBtn}
             href={`${window.GB.MAX_LINK}`} target="_blank" rel="noopener">
            <span className="max-glyph"></span> Заказать расчёт в MAX
          </a>
          <p style={cs.resFoot}>Расчёт ориентировочный. Точное количество и цену уточню лично — пишите в MAX.</p>
        </div>
      </div>
    </div>
  );
}

function ResCell({ v, u }) {
  return (
    <div style={cs.resCell}>
      <div style={cs.resCellV}>{v}</div>
      <div style={cs.resCellU}>{u}</div>
    </div>
  );
}

const cs = {
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 22, alignItems: 'start' },
  inputs: { padding: 'clamp(22px,3vw,34px)' },
  inputsHead: { marginBottom: 24 },
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 28px' },
  field: {},
  flabel: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: 14.5, fontWeight: 600, marginBottom: 9, color: 'var(--ink)' },
  funit: { fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 500, color: 'var(--ink-3)', letterSpacing: '.04em' },
  stepper: { display: 'flex', alignItems: 'stretch', border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', background: 'var(--surface)' },
  stepBtn: { width: 40, border: 'none', background: 'var(--surface-2)', color: 'var(--ink-2)', fontSize: 20, cursor: 'pointer', lineHeight: 1 },
  stepInput: { flex: 1, minWidth: 0, border: 'none', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 600, color: 'var(--ink)', background: 'transparent', outline: 'none', padding: '10px 4px' },
  range: { width: '100%', marginTop: 12, accentColor: 'var(--accent)' },
  choiceRow: { display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 26 },
  seg: { display: 'flex', gap: 6, background: 'var(--surface-2)', padding: 5, borderRadius: 11, border: '1px solid var(--line)' },
  segBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: '9px 8px', border: 'none', background: 'transparent', borderRadius: 7, fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', cursor: 'pointer', transition: 'all .15s ease', lineHeight: 1.2, textAlign: 'center' },
  segBtnOn: { background: 'var(--surface)', color: 'var(--ink)', boxShadow: 'var(--shadow-sm)' },
  summaryLine: { marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--line-soft)' },

  resultWrap: { position: 'sticky', top: 96 },
  result: { background: 'var(--ink)', color: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: 'clamp(24px,3vw,32px)', boxShadow: 'var(--shadow-lg)' },
  resHead: { marginBottom: 4 },
  bigNum: { display: 'flex', alignItems: 'baseline', gap: 12, transition: 'transform .3s cubic-bezier(.2,.9,.3,1)' },
  bigNumVal: { fontFamily: 'var(--font-display)', fontSize: 'clamp(48px,7vw,68px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: .95, color: 'var(--on-accent)' },
  bigNumUnit: { fontSize: 18, fontWeight: 600, color: 'oklch(0.7 0.01 80)' },
  resGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 22 },
  resCell: { background: 'oklch(1 0 0 / 0.06)', borderRadius: 11, padding: '14px 12px', border: '1px solid oklch(1 0 0 / 0.08)' },
  resCellV: { fontFamily: 'var(--font-display)', fontSize: 23, fontWeight: 700, color: 'var(--on-accent)' },
  resCellU: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.72 0.01 80)', marginTop: 3, letterSpacing: '.02em' },
  costRow: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 22, paddingTop: 20, borderTop: '1px solid oklch(1 0 0 / 0.12)' },
  costVal: { fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--accent)', marginTop: 2, letterSpacing: '-0.02em' },
  costNote: { fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'oklch(0.66 0.01 80)' },
  resBtn: { width: '100%', marginTop: 22, background: 'var(--accent)', color: 'var(--on-accent)', borderColor: 'transparent' },
  resFoot: { fontSize: 12.5, color: 'oklch(0.66 0.01 80)', marginTop: 14, lineHeight: 1.5 },
};

window.Calculator = Calculator;

/* ===========================================================
   Калькулятор кирпича — длина/высота стены → количество кирпича
   Форматы: 1НФ (одинарный 250×120×65), 1.4НФ (утолщённый 250×120×88)
   =========================================================== */
function BrickCalculator() {
  const fmt = (n) => new Intl.NumberFormat('ru-RU').format(n);
  const isMobile = useIsMobile();

  // шт на 1 м² кладки в полкирпича (с учётом растворного шва ~10 мм)
  const FORMATS = [
    { id: '1НФ',   label: '1НФ', sub: 'одинарный', size: '250 × 120 × 65', perM2: 51 },
    { id: '1.4НФ', label: '1,4НФ', sub: 'утолщённый', size: '250 × 120 × 88', perM2: 39 },
  ];
  const KLADKA = [
    { id: 0.5, label: 'В полкирпича', sub: 'облицовка, 120 мм', k: 1 },
    { id: 1,   label: 'В кирпич', sub: '250 мм', k: 2 },
  ];

  const [len, setLen] = React.useState(40);
  const [hgt, setHgt] = React.useState(3);
  const [op, setOp]   = React.useState(20);
  const [fmtId, setFmtId] = React.useState('1НФ');
  const [klId, setKlId]   = React.useState(0.5);
  const [pulse, setPulse] = React.useState(false);

  const r = React.useMemo(() => {
    const fO = FORMATS.find(f => f.id === fmtId);
    const kO = KLADKA.find(k => k.id === klId);
    const area = Math.max(0, Number(len) * Number(hgt) - Number(op));
    const bricks = Math.ceil(area * fO.perM2 * kO.k);
    const withSpare = Math.ceil(bricks * 1.05);
    const pallets = Math.ceil(withSpare / 480); // ~480 шт/паллета (1НФ)
    return { area: Math.round(area * 10) / 10, bricks, withSpare, pallets, perM2: fO.perM2, k: kO.k };
  }, [len, hgt, op, fmtId, klId]);

  React.useEffect(() => { setPulse(true); const t = setTimeout(() => setPulse(false), 320); return () => clearTimeout(t); }, [r.withSpare]);

  const orderText =
    `Здравствуйте! Расчёт облицовочного кирпича с сайта gazoblok34.ru:%0A` +
    `• Стена ${len} м × ${hgt} м, проёмы ${op} м²%0A` +
    `• Формат ${fmtId}, кладка ${klId === 0.5 ? 'в полкирпича' : 'в кирпич'}%0A` +
    `• Площадь ${r.area} м² · нужно ~${fmt(r.withSpare)} шт (с запасом 5%)%0AХочу подобрать кирпич и оформить заказ.`;

  const Stepper = ({ label, unit, value, set, min, max, step = 1 }) => (
    <div style={cs.field}>
      <label style={cs.flabel}>{label}<span style={cs.funit}>{unit}</span></label>
      <div style={cs.stepper}>
        <button style={cs.stepBtn} onClick={() => set(Math.max(min, Math.round((value - step) * 10) / 10))} aria-label="−">–</button>
        <input style={cs.stepInput} type="number" value={value} min={min} max={max} step={step}
          onChange={(e) => { const v = e.target.value === '' ? min : Number(e.target.value); set(Math.min(max, Math.max(min, v))); }} />
        <button style={cs.stepBtn} onClick={() => set(Math.min(max, Math.round((value + step) * 10) / 10))} aria-label="+">+</button>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} style={cs.range} />
    </div>
  );

  return (
    <div style={{ ...cs.grid, gridTemplateColumns: isMobile ? '1fr' : cs.grid.gridTemplateColumns }}>
      <div className="card" style={cs.inputs}>
        <div style={cs.inputsHead}>
          <span className="eyebrow eyebrow--plain mono">Параметры облицовки</span>
          <p className="muted" style={{ fontSize: 14.5, marginTop: 6 }}>Длина и высота стены под облицовку. Проёмы вычтем.</p>
        </div>

        <div className="calc-fields" style={cs.fieldGrid}>
          <Stepper label="Длина стен" unit="м" value={len} set={setLen} min={1} max={300} step={1} />
          <Stepper label="Высота стен" unit="м" value={hgt} set={setHgt} min={2} max={12} step={0.1} />
          <Stepper label="Окна и двери" unit="м²" value={op} set={setOp} min={0} max={200} step={1} />
        </div>

        <div style={cs.choiceRow}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={cs.flabel}>Формат кирпича<span style={cs.funit}>мм</span></label>
            <div style={cs.seg}>
              {FORMATS.map(f => (
                <button key={f.id} onClick={() => setFmtId(f.id)} title={f.size}
                  style={{ ...cs.segBtn, ...(fmtId === f.id ? cs.segBtnOn : {}), flexDirection: 'column', gap: 1, padding: '8px 6px' }}>
                  <span>{f.label}</span>
                  <span style={{ fontSize: 10.5, opacity: .7, fontWeight: 500 }}>{f.sub}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <label style={cs.flabel}>Тип кладки<span style={cs.funit}>толщина</span></label>
            <div style={cs.seg}>
              {KLADKA.map(k => (
                <button key={k.id} onClick={() => setKlId(k.id)}
                  style={{ ...cs.segBtn, ...(klId === k.id ? cs.segBtnOn : {}), flexDirection: 'column', gap: 1, padding: '8px 6px' }}>
                  <span style={{ fontSize: 12.5 }}>{k.label}</span>
                  <span style={{ fontSize: 10.5, opacity: .7, fontWeight: 500 }}>{k.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={cs.summaryLine}>
          <span className="mono" style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
            расход {r.perM2 * r.k} шт/м² · площадь облицовки {fmt(r.area)} м²
          </span>
        </div>
      </div>

      <div style={{ ...cs.resultWrap, position: isMobile ? 'static' : cs.resultWrap.position }}>
        <div style={cs.result}>
          <div style={cs.resHead}>
            <span className="eyebrow eyebrow--plain mono" style={{ color: 'var(--on-accent)', opacity: .85 }}>Нужно кирпича</span>
          </div>
          <div style={{ ...cs.bigNum, transform: pulse ? 'scale(1.015)' : 'scale(1)' }}>
            <span style={cs.bigNumVal}>{fmt(r.withSpare)}</span>
            <span style={cs.bigNumUnit}>шт</span>
          </div>

          <div className="res-cells" style={cs.resGrid}>
            <ResCell v={`${fmt(r.area)}`} u="м² облицовки" />
            <ResCell v={`${fmt(r.bricks)}`} u="шт без запаса" />
            <ResCell v={`~${r.pallets}`} u="поддонов" />
          </div>

          <div style={cs.costRow}>
            <div>
              <div className="mono" style={{ fontSize: 12, opacity: .8 }}>с запасом на подрезку</div>
              <div style={cs.costVal}>+5%</div>
            </div>
            <span style={cs.costNote}>формат {fmtId}</span>
          </div>

          <a className="btn btn-ghost btn-lg" style={cs.resBtn} href={`${window.GB.MAX_LINK}`} target="_blank" rel="noopener">
            <span className="max-glyph"></span> Подобрать кирпич в MAX
          </a>
          <p style={cs.resFoot}>Расчёт ориентировочный для облицовки. Точный расход зависит от шва и раскладки — помогу подобрать.</p>
        </div>
      </div>
    </div>
  );
}

window.BrickCalculator = BrickCalculator;
