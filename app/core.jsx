/* Header, Hero, OrderForm, Footer */

function useIsMobile(bp = 900) {
  const [m, setM] = React.useState(typeof window !== 'undefined' && window.innerWidth < bp);
  React.useEffect(() => {
    const on = () => setM(window.innerWidth < bp);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [bp]);
  return m;
}

const NAV_ALL = [
  { href: '#calc', label: 'Калькулятор', sec: 'calc' },
  { href: '#products', label: 'Газоблок', sec: 'products' },
  { href: '#bricks', label: 'Кирпич', sec: 'bricks' },
  { href: '#beton', label: 'Бетон', sec: 'beton' },
  { href: '#gbi', label: 'ЖБИ', sec: 'gbi' },
  { href: '#video', label: 'Видео', sec: 'video' },
  { href: '#articles', label: 'Статьи', sec: 'articles' },
  { href: '#projects', label: 'Проекты', sec: 'projects' },
  { href: '#delivery', label: 'Доставка', sec: 'delivery' },
  { href: '#faq', label: 'Вопросы', sec: 'faq' },
];

/* Видимость разделов: читает GB.SECTIONS и обновляется по событию gb:sections */
function useSections() {
  const [s, setS] = React.useState(() => (window.GB.SECTIONS || {}));
  React.useEffect(() => {
    const on = (e) => setS({ ...e.detail });
    window.addEventListener('gb:sections', on);
    return () => window.removeEventListener('gb:sections', on);
  }, []);
  return s;
}
function navItems(sec) { return NAV_ALL.filter(n => sec[n.sec] !== false); }

/* Scrollspy: какой раздел сейчас на экране → этот пункт меню становится красным */
function useScrollSpy(hrefs) {
  const [active, setActive] = React.useState(null);
  React.useEffect(() => {
    const ids = hrefs.map(h => h.replace('#', ''));
    const onScroll = () => {
      const mark = window.innerHeight * 0.32; // линия «считания» — верхняя треть экрана
      let current = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - mark <= 0) current = id; else break;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [hrefs.join('|')]);
  return active;
}

function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile(1120);
  const NAV = navItems(useSections());
  const active = useScrollSpy(NAV.map(n => n.href));
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header style={{ ...hs.bar, ...(scrolled ? hs.barScrolled : {}) }}>
      <div className="wrap" style={hs.inner}>
        <a href="#top" style={hs.logo}>
          <span style={hs.logoMark}>Г<span style={hs.logoMark34}>34</span></span>
          <span style={hs.logoText}>ГАЗОБЛОК<b>34</b></span>
        </a>

        {!isMobile && (
          <nav style={hs.nav}>
            {NAV.map(n => {
              const on = active === n.href.replace('#', '');
              return <a key={n.href} href={n.href} style={{ ...hs.navLink, ...(on ? hs.navLinkActive : {}) }}>{n.label}</a>;
            })}
          </nav>
        )}

        <div style={hs.right}>
          <a className="btn btn-primary btn-sm m-header-cta" href={window.GB.MAX_LINK} target="_blank" rel="noopener">
            <span className="max-glyph"></span> <span className="m-cta-full">Заказать в </span>MAX
          </a>
          <button style={{ ...hs.burger, display: isMobile ? 'flex' : 'none' }} onClick={() => setOpen(o => !o)} aria-label="Меню">
            <span style={{ ...hs.burgerLine, transform: open ? 'translateY(5px) rotate(45deg)' : 'none' }}></span>
            <span style={{ ...hs.burgerLine, opacity: open ? 0 : 1 }}></span>
            <span style={{ ...hs.burgerLine, transform: open ? 'translateY(-5px) rotate(-45deg)' : 'none' }}></span>
          </button>
        </div>
      </div>
      {open && isMobile && (
        <div style={hs.mobileMenu}>
          {NAV.map(n => {
            const on = active === n.href.replace('#', '');
            return <a key={n.href} href={n.href} style={{ ...hs.mobileLink, ...(on ? hs.navLinkActive : {}) }} onClick={() => setOpen(false)}>{n.label}</a>;
          })}
          <a className="btn btn-primary" href={window.GB.MAX_LINK} target="_blank" rel="noopener" style={{ marginTop: 8 }} onClick={() => setOpen(false)}>
            <span className="max-glyph"></span> Заказать в MAX
          </a>
          <a className="btn btn-ghost" href={`tel:${(window.GB.CONTACTS.phones[0]||'').replace(/[^+\d]/g,'')}`} onClick={() => setOpen(false)}>
            ☎ {window.GB.CONTACTS.phones[0]}
          </a>
        </div>
      )}
    </header>
  );
}

/* Кнопка «КАЛЬКУЛЯТОР» над фото дома: наведение/клик → выбор Газоблок / Кирпич / Бетон */
function CalcMenu({ align = 'right' }) {
  const [open, setOpen] = React.useState(false);
  const sec = useSections();
  const items = [
    { href: '#calc',       label: 'Газоблок', d: 'блоки, поддоны, клей', sec: 'calc' },
    { href: '#brick-calc', label: 'Кирпич',   d: 'облицовка фасада',   sec: 'bricks' },
    { href: '#beton',      label: 'Бетон',    d: 'кубы и миксеры',       sec: 'beton' },
    { href: '#gbi-calc',   label: 'ЖБИ',      d: 'блоки, перемычки, кольца', sec: 'gbi' },
  ].filter(i => sec[i.sec] !== false);
  if (!items.length) return null;
  return (
    <div style={{ ...cm.row, justifyContent: align === 'left' ? 'flex-start' : 'flex-end', marginTop: align === 'left' ? 0 : cm.row.marginTop }} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <div style={cm.anchor}>
        <button type="button" style={cm.btn} onClick={() => setOpen(o => !o)} aria-expanded={open} aria-haspopup="true">
          <span style={cm.icon}>▦</span>
          КАЛЬКУЛЯТОР
          <span style={{ ...cm.chev, transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
        </button>
        {open && (
          <div style={{ ...cm.drop, right: align === 'left' ? 'auto' : 0, left: align === 'left' ? 0 : 'auto' }}>
            <div className="card" style={cm.menu}>
              {items.map(i => (
                <a key={i.href} href={i.href} style={cm.item} onClick={() => setOpen(false)}>
                  <span style={cm.itemLabel}>{i.label}</span>
                  <span style={cm.itemD}>{i.d}</span>
                  <span style={cm.itemArrow}>→</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const cm = {
  row: { display: 'flex', justifyContent: 'flex-end', marginTop: -26, marginBottom: 16 },
  anchor: { position: 'relative', zIndex: 40, width: 250, maxWidth: '100%' },
  btn: { width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '13px 20px', borderRadius: 12, border: 'none', background: 'var(--accent)', color: 'var(--on-accent, #fff)', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, letterSpacing: '.04em', cursor: 'pointer', boxShadow: 'var(--shadow-md)' },
  icon: { fontSize: 14, opacity: .9 },
  chev: { fontSize: 13, transition: 'transform .18s ease', display: 'inline-block' },
  drop: { position: 'absolute', top: '100%', right: 0, left: 0, paddingTop: 8, width: '100%' },
  menu: { display: 'flex', flexDirection: 'column', padding: 8, boxShadow: 'var(--shadow-lg)', background: 'var(--surface)' },
  item: { display: 'grid', gridTemplateColumns: '1fr auto', gridTemplateRows: 'auto auto', columnGap: 10, alignItems: 'center', padding: '11px 13px', borderRadius: 9, color: 'var(--ink)', transition: 'background .12s ease' },
  itemLabel: { fontSize: 15.5, fontWeight: 700, gridRow: 1 },
  itemD: { fontSize: 12, color: 'var(--ink-3)', gridRow: 2, gridColumn: 1 },
  itemArrow: { gridRow: '1 / span 2', gridColumn: 2, fontSize: 16, color: 'var(--accent-ink)' },
};

function Hero({ showMarquee = true }) {
  const isMobile = useIsMobile();
  return (
    <section id="top" style={ho.wrap}>
      <div className="wrap" style={{ ...ho.grid, gridTemplateColumns: isMobile ? '1fr' : ho.grid.gridTemplateColumns }}>
        <div style={ho.left}>
          <span className="chip chip--accent">Волгоград · gazoblok34.ru</span>
          <h1 style={ho.h1}>
            Построил дом <span style={ho.hlight}>200&nbsp;м²</span><br/>
            за 62 дня — и покажу,<br/>как сделать так же
          </h1>
          <p style={ho.lede}>
            Я снимаю свою стройку из газобетона на YouTube: собрал дом своими руками
            на пено-клее, тестирую материалы и инструменты. Здесь — мой опыт, расчёты
            и проверенный газоблок завода Грас с доставкой по Волгограду.
          </p>
          <div className="hero-cta" style={ho.cta}>
            <a className="btn btn-dark btn-lg" href="#calc">Рассчитать газоблок</a>
            <a className="btn btn-ghost btn-lg" href={window.GB.YT_LINK} target="_blank" rel="noopener">
              Смотреть канал
            </a>
          </div>
          {isMobile && <div style={{ marginTop: 14 }}><CalcMenu align="left" /></div>}
          <div className="m-hero-stats" style={ho.stats}>
            {window.GB.STATS.map((s, i) => (
              <div key={i} style={ho.stat}>
                <div style={ho.statVal}>{s.value}<span style={ho.statUnit}>{s.unit}</span></div>
                <div style={ho.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...ho.right, display: isMobile ? 'none' : 'block' }}>
          <CalcMenu />
          <img src={window.GB.HERO_IMG || "assets/hero-house-illustration.png"} alt="Современный дом из газоблока ГРАС" style={{ ...ho.heroImg, height: 'auto', display: 'block', objectFit: 'cover', borderRadius: 14 }} onError={(e) => { if (e.currentTarget.dataset.fb !== '1') { e.currentTarget.dataset.fb = '1'; e.currentTarget.src = 'assets/hero-house-illustration.png'; } }} />
          <div className="card" style={ho.floatCard}>
            <div style={ho.floatAvatar}>
              <img src="assets/slots/author-avatar.webp" alt="Автор канала" style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Автор канала ГАЗОБЛОК34</div>
              <div className="muted" style={{ fontSize: 13.5 }}>самостройщик · Волгоград</div>
            </div>
          </div>
          <div className="card" style={ho.playBadge}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>на канале</div>
            <div style={{ fontWeight: 700, fontSize: 22, fontFamily: 'var(--font-display)' }}>8 лет стройки</div>
          </div>
        </div>
      </div>

      {showMarquee && <div className="wrap" style={ho.marqueeWrap}>
        <div style={ho.marquee}>
          {[...['Пено-клей','D400 · D500 · D600','U-блоки и армопояс','Доставка по области','Завод Грас','Кладка первого ряда','Тесты материалов','Проекты домов'], ...['Пено-клей','D400 · D500 · D600','U-блоки и армопояс','Доставка по области','Завод Грас','Кладка первого ряда','Тесты материалов','Проекты домов']].map((t,i) => (
            <span key={i} style={ho.marqueeItem}><span style={ho.marqueeDot}></span>{t}</span>
          ))}
        </div>
      </div>}
    </section>
  );
}

function OrderForm() {
  const isMobile = useIsMobile();
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [need, setNeed] = React.useState('Газоблок для дома');
  const [msg, setMsg] = React.useState('');
  const [sent, setSent] = React.useState(false);

  const NEEDS = ['Газоблок для дома', 'Бетон', 'ЖБИ', 'Помощь с расчётом', 'Готовый проект', 'Пено-клей и материалы', 'Другое'];

  const submit = (e) => {
    e.preventDefault();
    const text =
      `Заявка с сайта gazoblok34.ru:%0A` +
      `Имя: ${name || '—'}%0AТелефон: ${phone || '—'}%0AЗапрос: ${need}%0A` +
      (msg ? `Комментарий: ${msg}%0A` : '');
    window.open(`${window.GB.MAX_LINK}`, '_blank');
    setSent(true);
  };

  return (
    <section id="order" className="section" style={of.wrap}>
      <div className="wrap" style={{ ...of.grid, gridTemplateColumns: isMobile ? '1fr' : of.grid.gridTemplateColumns }}>
        <div style={{ ...of.left, position: isMobile ? 'static' : of.left.position }}>
          <span className="eyebrow">Заказ и связь</span>
          <h2 style={of.h2}>Оставьте заявку — я свяжусь лично</h2>
          <p style={of.lede}>
            Помогу подобрать марку и толщину блока под ваш проект, посчитаю объём и оформлю
            поставку от завода Грас. Все заявки и заказы веду в мессенджере MAX.
          </p>
          <div style={of.contacts}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a className="btn btn-primary btn-lg" href={window.GB.MAX_LINK} target="_blank" rel="noopener">
                <span className="max-glyph"></span> Написать в MAX
              </a>
              <a className="btn btn-dark btn-lg" href={window.GB.TG_BOT.link} target="_blank" rel="noopener">
                ✈ Заказ через Telegram-бот
              </a>
            </div>
            <div style={of.where}>
              <div style={of.whereRow}><b>Где купить:</b> «Оптом и в розницу»</div>
              <div style={of.whereRow} className="muted">{window.GB.CONTACTS.address}</div>
              <div style={of.whereRow} className="muted">Поставщик — {window.GB.CONTACTS.supplier}</div>
              <a className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }}
                 href={`https://yandex.ru/maps/?rtext=~${encodeURIComponent(window.GB.CONTACTS.address)}&rtt=auto`}
                 target="_blank" rel="noopener">
                <span style={{ fontSize: 15 }}>📍</span> Как добраться — маршрут
              </a>
            </div>
            <RouteMap />
            <div style={of.contactList}>
              {window.GB.CONTACTS.phones.map(p => (
                <a key={p} href={`tel:${p.replace(/[^+\d]/g, '')}`} style={of.contactItem}>
                  <span style={of.contactIcon}>☎</span>{p}
                </a>
              ))}
              <a href={`mailto:${window.GB.CONTACTS.email}`} style={of.contactItem}>
                <span style={of.contactIcon}>✉</span>{window.GB.CONTACTS.email}
              </a>
            </div>
            <ShareBar />
          </div>
        </div>

        <form className="card" style={of.form} onSubmit={submit}>
          {sent ? (
            <div style={of.success}>
              <div style={of.successMark}>✓</div>
              <h3 style={{ fontSize: 24 }}>Заявка собрана</h3>
              <p className="muted" style={{ fontSize: 15 }}>
                Открыл для вас MAX — отправьте сообщение, и я отвечу с расчётом.
                Не открылся? Напишите напрямую.
              </p>
              <a className="btn btn-dark" href={window.GB.MAX_LINK} target="_blank" rel="noopener">
                <span className="max-glyph"></span> Открыть MAX
              </a>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSent(false)}>Новая заявка</button>
            </div>
          ) : (
            <React.Fragment>
              <div style={of.field}>
                <label style={of.label}>Как вас зовут</label>
                <input style={of.input} value={name} onChange={e => setName(e.target.value)} placeholder="Имя" />
              </div>
              <div style={of.field}>
                <label style={of.label}>Телефон</label>
                <input style={of.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7 ___ ___-__-__" inputMode="tel" />
              </div>
              <div style={of.field}>
                <label style={of.label}>Что нужно</label>
                <div style={of.needWrap}>
                  {NEEDS.map(n => (
                    <button type="button" key={n} onClick={() => setNeed(n)}
                      style={{ ...of.needChip, ...(need === n ? of.needChipOn : {}) }}>{n}</button>
                  ))}
                </div>
              </div>
              <div style={of.field}>
                <label style={of.label}>Комментарий <span className="muted">(необязательно)</span></label>
                <textarea style={{ ...of.input, minHeight: 78, resize: 'vertical' }} value={msg} onChange={e => setMsg(e.target.value)} placeholder="Площадь дома, сроки, вопросы…" />
              </div>
              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Отправить в MAX
              </button>
              <p style={of.formNote}>Нажимая кнопку, вы переходите в мессенджер MAX для отправки заявки.</p>
            </React.Fragment>
          )}
        </form>
      </div>
    </section>
  );
}

function Footer() {
  const NAV = navItems(useSections());
  return (
    <footer style={fo.wrap}>
      <div className="wrap">
        <div className="m-footer" style={fo.top}>
          <div style={fo.brandCol}>
            <a href="#top" style={hs.logo}>
              <span style={{ ...hs.logoMark, background: 'var(--accent)' }}>Г<span style={hs.logoMark34}>34</span></span>
              <span style={{ ...hs.logoText, color: 'var(--bg)' }}>ГАЗОБЛОК<b>34</b></span>
            </a>
            <p style={fo.brandText}>
              Личный блог о стройке дома из газобетона. Опыт, расчёты и проверенный
              газоблок завода Грас с доставкой по Волгограду и области.
            </p>
            <a className="btn btn-primary btn-sm" href={window.GB.MAX_LINK} target="_blank" rel="noopener" style={{ alignSelf: 'flex-start' }}>
              <span className="max-glyph"></span> Заказать в MAX
            </a>
          </div>
          <div style={fo.linksCol}>
            <div className="mono" style={fo.colHead}>Разделы</div>
            {NAV.map(n => <a key={n.href} href={n.href} style={fo.fLink}>{n.label}</a>)}
          </div>
          <div style={fo.linksCol}>
            <div className="mono" style={fo.colHead}>Соцсети</div>
            {window.GB.SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener" style={fo.fLink}>{s.label}</a>
            ))}
          </div>
          <div style={fo.linksCol}>
            <div className="mono" style={fo.colHead}>Контакты</div>
            {window.GB.CONTACTS.phones.map(p => (
              <a key={p} href={`tel:${p.replace(/[^+\d]/g, '')}`} style={fo.fLink}>{p}</a>
            ))}
            <a href={`mailto:${window.GB.CONTACTS.email}`} style={fo.fLink}>{window.GB.CONTACTS.email}</a>
            <div style={fo.fText}>«Оптом и в розницу»</div>
            <div style={fo.fText}>{window.GB.CONTACTS.address}</div>
          </div>
        </div>
        <div style={fo.bottom}>
          <span>© {new Date().getFullYear()} ГАЗОБЛОК34 · gazoblok34.ru</span>
          <span style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="admin.html" style={{ ...fo.fLink, fontSize: 13, opacity: .7 }}>Админка</a>
            <span className="mono" style={{ opacity: .7 }}>Строим своими руками</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Route map (Яндекс.Карты) ---------- */
function RouteMap() {
  const addr = window.GB.CONTACTS.address;
  const q = encodeURIComponent(addr);
  return (
    <div style={of.mapBox}>
      <iframe
        title="Как добраться — Яндекс.Карты"
        src={`https://yandex.ru/map-widget/v1/?text=${q}&z=16`}
        style={of.mapFrame} loading="lazy" allowFullScreen></iframe>
    </div>
  );
}

/* ---------- Share bar ---------- */
function ShareBar() {
  const [copied, setCopied] = React.useState('');
  const pageUrl = (typeof window !== 'undefined' && window.location && /^https?:/.test(window.location.href))
    ? window.location.href.split('#')[0]
    : 'https://gazoblok34.ru';
  const u = encodeURIComponent(pageUrl);
  const t = encodeURIComponent('ГАЗОБЛОК34 — газоблок ГРАС и стройка дома, Волгоград');

  const items = [
    { label: 'ВКонтакте', short: 'ВК', bg: '#0077FF', href: `https://vk.com/share.php?url=${u}&title=${t}` },
    { label: 'Одноклассники', short: 'ОК', bg: '#EE8208', href: `https://connect.ok.ru/offer?url=${u}&title=${t}` },
    { label: 'Telegram', short: 'TG', bg: '#26A5E4', href: `https://t.me/share/url?url=${u}&text=${t}` },
    { label: 'WhatsApp', short: 'WA', bg: '#25D366', href: `https://api.whatsapp.com/send?text=${t}%20${u}` },
    { label: 'Дзен', short: 'Дзен', bg: '#1A1A1A', copy: true },
    { label: 'Rutube', short: 'RT', bg: '#14191F', copy: true },
    { label: 'Яндекс', short: 'Я', bg: '#FC3F1D', copy: true },
    { label: 'MAX', short: 'MAX', bg: '#1E63F0', copy: true },
  ];

  const onCopy = async (label) => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(label);
      setTimeout(() => setCopied(''), 1900);
    } catch (e) {
      window.prompt('Скопируйте ссылку:', pageUrl);
    }
  };

  return (
    <div style={of.share}>
      <div style={of.shareHead}>
        <span style={of.shareTitle}>Поделиться сайтом</span>
        {copied && <span style={of.shareCopied}>Ссылка скопирована — вставьте в {copied}</span>}
      </div>
      <div style={of.shareRow}>
        {items.map(it => it.copy ? (
          <button key={it.label} type="button" onClick={() => onCopy(it.label)}
            title={`Скопировать ссылку для ${it.label}`}
            style={{ ...of.shareBtn, background: it.bg }}>{it.short}</button>
        ) : (
          <a key={it.label} href={it.href} target="_blank" rel="noopener"
            title={`Поделиться в ${it.label}`}
            style={{ ...of.shareBtn, background: it.bg }}>{it.short}</a>
        ))}
      </div>
    </div>
  );
}

/* ---------- styles ---------- */
const hs = {
  bar: { position: 'sticky', top: 0, zIndex: 50, transition: 'all .25s ease', borderBottom: '1px solid transparent' },
  barScrolled: { background: 'oklch(0.972 0.006 80 / 0.82)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)' },
  inner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68, gap: 20 },
  logo: { display: 'flex', alignItems: 'center', gap: 11 },
  logoMark: { width: 38, height: 38, borderRadius: 9, background: 'var(--ink)', color: 'var(--bg)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, position: 'relative' },
  logoMark34: { fontFamily: 'var(--font-mono)', fontSize: 9, position: 'absolute', bottom: 4, right: 5, color: 'var(--accent)', fontWeight: 700 },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' },
  nav: { display: 'flex', gap: 18, alignItems: 'center' },
  navLink: { fontSize: 15, fontWeight: 500, color: 'var(--ink-2)', transition: 'color .15s ease' },
  navLinkActive: { color: '#d12b2b', fontWeight: 700 },
  right: { display: 'flex', alignItems: 'center', gap: 14 },
  burger: { display: 'none', flexDirection: 'column', gap: 4, width: 38, height: 38, border: '1px solid var(--line)', borderRadius: 9, background: 'var(--surface)', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' },
  burgerLine: { width: 17, height: 2, background: 'var(--ink)', borderRadius: 2, transition: 'all .2s ease' },
  mobileMenu: { display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderBottom: '1px solid var(--line)', padding: '8px var(--gutter) 18px' },
  mobileLink: { padding: '12px 0', fontSize: 16, fontWeight: 500, borderBottom: '1px solid var(--line-soft)' },
};

const ho = {
  wrap: { paddingTop: 'clamp(36px,6vw,72px)', paddingBottom: 'clamp(20px,3vw,36px)' },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,0.95fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'center' },
  left: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 22 },
  h1: { fontSize: 'clamp(34px,5.4vw,62px)', fontWeight: 800, letterSpacing: '-0.03em' },
  hlight: { color: 'var(--accent)' },
  lede: { fontSize: 'clamp(16px,1.6vw,19px)', color: 'var(--ink-2)', maxWidth: '52ch' },
  cta: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4,auto)', gap: 'clamp(18px,3vw,36px)', marginTop: 14, paddingTop: 26, borderTop: '1px solid var(--line)', width: '100%' },
  stat: {},
  statVal: { fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: 4 },
  statUnit: { fontSize: 14, fontWeight: 600, color: 'var(--accent)' },
  statLabel: { fontSize: 13, color: 'var(--ink-3)', marginTop: 2, maxWidth: 130, lineHeight: 1.3 },

  right: { position: 'relative' },
  heroImg: { aspectRatio: '4/5', width: '100%', boxShadow: 'var(--shadow-lg)' },
  floatCard: { position: 'absolute', left: -22, bottom: 34, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px 12px 12px', borderRadius: 14 },
  floatAvatar: { width: 44, height: 44, borderRadius: 999, overflow: 'hidden', flex: 'none' },
  playBadge: { position: 'absolute', right: -18, top: 96, padding: '12px 18px', borderRadius: 14, textAlign: 'right' },

  marqueeWrap: { marginTop: 'clamp(32px,5vw,56px)', overflow: 'hidden', maskImage: 'linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)' },
  marquee: { display: 'flex', gap: 40, animation: 'gbmarquee 32s linear infinite', whiteSpace: 'nowrap', width: 'max-content' },
  marqueeItem: { display: 'inline-flex', alignItems: 'center', gap: 12, fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '.06em' },
  marqueeDot: { width: 6, height: 6, borderRadius: 999, background: 'var(--accent)' },
};

const of = {
  wrap: { background: 'var(--surface-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' },
  grid: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,0.9fr)', gap: 'clamp(28px,5vw,64px)', alignItems: 'start' },
  left: { position: 'sticky', top: 96 },
  h2: { fontSize: 'clamp(28px,3.6vw,44px)', marginTop: 16 },
  lede: { fontSize: 17, color: 'var(--ink-2)', marginTop: 16, maxWidth: '46ch' },
  contacts: { display: 'flex', flexDirection: 'column', gap: 22, marginTop: 28 },
  where: { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 15 },
  whereRow: { lineHeight: 1.5 },
  contactList: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 },
  contactItem: { display: 'inline-flex', alignItems: 'center', gap: 11, fontSize: 16, fontWeight: 600, color: 'var(--ink)' },
  contactIcon: { width: 30, height: 30, borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center', fontSize: 14, flex: 'none' },
  mapBox: { marginTop: 4, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' },
  mapFrame: { width: '100%', height: 220, border: 'none', display: 'block' },
  share: { marginTop: 4, display: 'flex', flexDirection: 'column', gap: 12 },
  shareHead: { display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' },
  shareTitle: { fontSize: 14, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  shareCopied: { fontSize: 12.5, color: 'var(--accent-ink)', fontWeight: 600 },
  shareRow: { display: 'flex', flexWrap: 'wrap', gap: 9 },
  shareBtn: { minWidth: 46, height: 38, padding: '0 13px', borderRadius: 10, border: 'none', cursor: 'pointer', color: '#fff', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.01em', transition: 'transform .12s ease, filter .12s ease' },
  form: { padding: 'clamp(24px,3vw,32px)', display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 14, fontWeight: 600 },
  input: { padding: '13px 15px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 15.5, fontFamily: 'var(--font-body)', color: 'var(--ink)', background: 'var(--surface)', outline: 'none', transition: 'border-color .15s ease' },
  needWrap: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  needChip: { padding: '9px 14px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--surface)', fontSize: 13.5, fontWeight: 500, color: 'var(--ink-2)', cursor: 'pointer', transition: 'all .15s ease' },
  needChipOn: { background: 'var(--ink)', color: 'var(--bg)', borderColor: 'var(--ink)' },
  formNote: { fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'center', lineHeight: 1.5 },
  success: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14, padding: '12px 0' },
  successMark: { width: 52, height: 52, borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 700 },
};

const fo = {
  wrap: { background: 'var(--ink)', color: 'oklch(0.78 0.01 80)', paddingTop: 'clamp(48px,6vw,72px)', paddingBottom: 32 },
  top: { display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr', gap: 'clamp(24px,4vw,48px)', paddingBottom: 40, borderBottom: '1px solid oklch(1 0 0 / 0.1)' },
  brandCol: { display: 'flex', flexDirection: 'column', gap: 18 },
  brandText: { fontSize: 14.5, lineHeight: 1.6, maxWidth: '40ch' },
  linksCol: { display: 'flex', flexDirection: 'column', gap: 11 },
  colHead: { fontSize: 11.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'oklch(0.6 0.01 80)', marginBottom: 4 },
  fLink: { fontSize: 14.5, color: 'oklch(0.82 0.01 80)', transition: 'color .15s ease' },
  fText: { fontSize: 14, lineHeight: 1.5, color: 'oklch(0.74 0.01 80)' },
  bottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, fontSize: 13, flexWrap: 'wrap', gap: 10 },
};

Object.assign(window, { Header, Hero, OrderForm, Footer, useIsMobile, useSections });
