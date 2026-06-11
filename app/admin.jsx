/* ГАЗОБЛОК34 — админ-панель. Редактирует те же данные (window.GBStore),
   что читает сайт. Сохранение пишет в localStorage браузера. */

const { useState, useEffect, useRef } = React;

/* ============================================================
   ПАРОЛЬ ОТ АДМИНКИ — замените на свой.
   Это простая защита от посторонних (не банковский уровень).
   ============================================================ */
const ADMIN_PASSWORD = "gazoblok34";

const uid = () => Date.now() + Math.floor(Math.random() * 1000);
const deep = (o) => JSON.parse(JSON.stringify(o));

const TABS = [
  { id: "sections", label: "Разделы", icon: "▤" },
  { id: "contacts", label: "Контакты", icon: "☎" },
  { id: "socials",  label: "Соцсети",  icon: "◎" },
  { id: "products", label: "Продукция", icon: "▦" },
  { id: "bricks",   label: "Кирпич",    icon: "▥" },
  { id: "beton",    label: "Бетон",     icon: "◆" },
  { id: "gbi",      label: "ЖБИ",       icon: "▣" },
  { id: "videos",   label: "Видео",     icon: "▶" },
  { id: "articles", label: "Статьи",    icon: "✎" },
  { id: "projects", label: "Проекты",   icon: "⌂" },
  { id: "faq",      label: "Вопросы",   icon: "?" },
  { id: "analytics",label: "Аналитика", icon: "%" },
];

/* ---------- field primitives ---------- */
function Field({ label, children, hint, wide }) {
  return (
    <label style={{ ...af.field, gridColumn: wide ? '1 / -1' : 'auto' }}>
      <span style={af.label}>{label}</span>
      {children}
      {hint && <span style={af.hint}>{hint}</span>}
    </label>
  );
}
function TextIn({ value, onChange, placeholder, mono }) {
  return <input style={{ ...af.input, ...(mono ? af.mono : {}) }} value={value ?? ''} placeholder={placeholder}
    onChange={e => onChange(e.target.value)} />;
}
function NumIn({ value, onChange }) {
  return <input type="number" style={af.input} value={value ?? ''}
    onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))} />;
}
function AreaIn({ value, onChange, placeholder, rows = 4 }) {
  return <textarea style={{ ...af.input, minHeight: rows * 24, resize: 'vertical', lineHeight: 1.5 }} value={value ?? ''}
    placeholder={placeholder} onChange={e => onChange(e.target.value)} />;
}

/* Фото: загрузка с компьютера → уменьшается и хранится вместе с контентом */
function ImageField({ value, onChange, label = "Фото" }) {
  const inputRef = useRef(null);
  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 900;
      const k = Math.min(1, MAX / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      onChange(c.toDataURL('image/jpeg', 0.82));
      URL.revokeObjectURL(url);
      if (inputRef.current) inputRef.current.value = '';
    };
    img.src = url;
  };
  return (
    <div style={{ ...af.field, gridColumn: '1 / -1' }}>
      <span style={af.label}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ width: 96, height: 72, borderRadius: 9, border: '1px solid var(--line)', background: 'var(--surface-2)', overflow: 'hidden', display: 'grid', placeItems: 'center', flex: 'none' }}>
          {value
            ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>нет фото</span>}
        </div>
        <label style={{ ...af.addBtnSm, display: 'inline-block', cursor: 'pointer' }}>
          {value ? 'Заменить фото' : 'Загрузить фото'}
          <input ref={inputRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
        </label>
        {value && <button style={{ ...af.iconBtn, ...af.del, width: 'auto', padding: '0 12px' }} onClick={() => onChange('')}>Убрать</button>}
      </div>
      <span style={af.hint}>JPG/PNG — сайт сам уменьшит и сохранит. «Убрать» вернёт стандартное изображение.</span>
    </div>
  );
}

/* ---------- item card wrapper ---------- */
function ItemCard({ title, badge, onRemove, onUp, onDown, children, canUp, canDown }) {
  return (
    <div style={af.item}>
      <div style={af.itemHead}>
        <div style={af.itemTitle}>
          {badge != null && <span style={af.itemNum}>{badge}</span>}
          <span>{title}</span>
        </div>
        <div style={af.itemActions}>
          <button style={af.iconBtn} disabled={!canUp} onClick={onUp} title="Выше">↑</button>
          <button style={af.iconBtn} disabled={!canDown} onClick={onDown} title="Ниже">↓</button>
          <button style={{ ...af.iconBtn, ...af.del }} onClick={onRemove} title="Удалить">✕</button>
        </div>
      </div>
      <div className="adm-grid2" style={af.grid2}>{children}</div>
    </div>
  );
}

/* ---------- section editors ---------- */
function ContactsEditor({ data, set }) {
  const c = data.CONTACTS;
  const setC = (k, v) => set(d => { d.CONTACTS[k] = v; });
  const setPhone = (i, v) => set(d => { d.CONTACTS.phones[i] = v; });
  const addPhone = () => set(d => { d.CONTACTS.phones.push(''); });
  const delPhone = (i) => set(d => { d.CONTACTS.phones.splice(i, 1); });
  return (
    <div style={af.stack}>
      <div style={af.item}>
        <div style={af.itemHead}><div style={af.itemTitle}><span>Главный экран</span></div></div>
        <div className="adm-grid2" style={af.grid2}>
          <ImageField label="Фото дома под шапкой (справа от заголовка)" value={data.HERO_IMG} onChange={v => set(d => { d.HERO_IMG = v; })} />
        </div>
      </div>
      <div style={af.item}>
        <div style={af.itemHead}><div style={af.itemTitle}><span>Телефоны</span></div>
          <button style={af.addBtnSm} onClick={addPhone}>+ телефон</button></div>
        <div style={af.stack}>
          {c.phones.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 10 }}>
              <input style={{ ...af.input, flex: 1 }} value={p} onChange={e => setPhone(i, e.target.value)} placeholder="+7 ..." />
              <button style={{ ...af.iconBtn, ...af.del }} onClick={() => delPhone(i)}>✕</button>
            </div>
          ))}
        </div>
      </div>
      <div style={af.item}>
        <div className="adm-grid2" style={af.grid2}>
          <Field label="Email"><TextIn value={c.email} onChange={v => setC('email', v)} mono /></Field>
          <Field label="Поставщик"><TextIn value={c.supplier} onChange={v => setC('supplier', v)} /></Field>
          <Field label="Адрес" wide><TextIn value={c.address} onChange={v => setC('address', v)} /></Field>
        </div>
      </div>
      <div style={af.item}>
        <div style={af.itemHead}><div style={af.itemTitle}><span>Ссылки для заказа</span></div></div>
        <div className="adm-grid2" style={af.grid2}>
          <Field label="Ссылка на MAX" wide hint="Кнопки «Заказать в MAX» и форма ведут сюда"><TextIn value={data.MAX_LINK} onChange={v => set(d => { d.MAX_LINK = v; })} mono /></Field>
          <Field label="Ссылка на YouTube-канал" wide hint="Кнопка «Все ролики» и «Смотреть канал»"><TextIn value={data.YT_LINK} onChange={v => set(d => { d.YT_LINK = v; })} mono /></Field>
        </div>
      </div>
    </div>
  );
}

function SocialsEditor({ data, set }) {
  const list = data.SOCIALS;
  const add = () => set(d => { d.SOCIALS.push({ label: 'Новая сеть', href: 'https://', tag: '' }); });
  return (
    <ListSection count={list.length} addLabel="+ соцсеть" onAdd={add}>
      {list.map((s, i) => (
        <ItemCard key={i} badge={i + 1} title={s.label || 'Соцсеть'}
          canUp={i > 0} canDown={i < list.length - 1}
          onUp={() => move(set, 'SOCIALS', i, -1)} onDown={() => move(set, 'SOCIALS', i, 1)}
          onRemove={() => set(d => { d.SOCIALS.splice(i, 1); })}>
          <Field label="Название"><TextIn value={s.label} onChange={v => set(d => { d.SOCIALS[i].label = v; })} /></Field>
          <Field label="Подпись"><TextIn value={s.tag} onChange={v => set(d => { d.SOCIALS[i].tag = v; })} /></Field>
          <Field label="Ссылка" wide><TextIn value={s.href} onChange={v => set(d => { d.SOCIALS[i].href = v; })} mono /></Field>
        </ItemCard>
      ))}
    </ListSection>
  );
}

function ProductsEditor({ data, set }) {
  const list = data.PRODUCTS;
  const add = () => set(d => { d.PRODUCTS.push({ id: 'p' + uid(), name: 'Новый блок', badge: '', density: 'D500', strength: 'B2,5', size: '600 × 250 × 300', sizes: ['600 × 250 × 300'], thickness: 300, pricePerM3: 7000, blocksPerM3: 22.2, palletM3: 1.8, note: '' }); });
  return (
    <ListSection count={list.length} addLabel="+ продукт" onAdd={add}>
      {list.map((p, i) => (
        <ItemCard key={p.id} badge={i + 1} title={p.name}
          canUp={i > 0} canDown={i < list.length - 1}
          onUp={() => move(set, 'PRODUCTS', i, -1)} onDown={() => move(set, 'PRODUCTS', i, 1)}
          onRemove={() => set(d => { d.PRODUCTS.splice(i, 1); })}>
          <ImageField label="Фото блока" value={p.img} onChange={v => set(d => { d.PRODUCTS[i].img = v; })} />
          <Field label="Название"><TextIn value={p.name} onChange={v => set(d => { d.PRODUCTS[i].name = v; })} /></Field>
          <Field label="Бейдж" hint="напр. Хит, Тёплый"><TextIn value={p.badge} onChange={v => set(d => { d.PRODUCTS[i].badge = v; })} /></Field>
          <Field label="Плотность"><TextIn value={p.density} onChange={v => set(d => { d.PRODUCTS[i].density = v; })} /></Field>
          <Field label="Прочность"><TextIn value={p.strength} onChange={v => set(d => { d.PRODUCTS[i].strength = v; })} /></Field>
          <Field label="Размер по умолчанию, мм"><TextIn value={p.size} onChange={v => set(d => { d.PRODUCTS[i].size = v; })} mono /></Field>
          <Field label="Все размеры (через запятую)" wide hint="Напр.: 600 × 250 × 200, 600 × 250 × 300, 600 × 250 × 400 — на карточке появятся кнопки выбора, цена за блок пересчитается"><TextIn value={(p.sizes || []).join(', ')} onChange={v => set(d => { d.PRODUCTS[i].sizes = v.split(',').map(s => s.trim()).filter(Boolean); })} mono /></Field>
          <Field label="Толщина, мм" hint="для картинки блока"><NumIn value={p.thickness} onChange={v => set(d => { d.PRODUCTS[i].thickness = v; })} /></Field>
          <Field label="Цена, ₽/м³"><NumIn value={p.pricePerM3} onChange={v => set(d => { d.PRODUCTS[i].pricePerM3 = v; })} /></Field>
          <Field label="Блоков в м³" hint="600×250×300 ≈ 22.2"><NumIn value={p.blocksPerM3} onChange={v => set(d => { d.PRODUCTS[i].blocksPerM3 = v; })} /></Field>
          <Field label="Описание" wide><AreaIn rows={2} value={p.note} onChange={v => set(d => { d.PRODUCTS[i].note = v; })} /></Field>
        </ItemCard>
      ))}
    </ListSection>
  );
}

function VideosEditor({ data, set }) {
  const list = data.VIDEOS;
  const add = () => set(d => { d.VIDEOS.push({ id: uid(), title: 'Новое видео', dur: '00:00', views: '0', tag: '', frame: '', url: d.YT_LINK }); });
  return (
    <ListSection count={list.length} addLabel="+ видео" onAdd={add}>
      {list.map((v, i) => (
        <ItemCard key={v.id} badge={i + 1} title={v.title}
          canUp={i > 0} canDown={i < list.length - 1}
          onUp={() => move(set, 'VIDEOS', i, -1)} onDown={() => move(set, 'VIDEOS', i, 1)}
          onRemove={() => set(d => { d.VIDEOS.splice(i, 1); })}>
          <Field label="Заголовок" wide><TextIn value={v.title} onChange={x => set(d => { d.VIDEOS[i].title = x; })} /></Field>
          <Field label="Ссылка на ролик (YouTube)" wide hint="Вставьте прямую ссылку на видео — карточка откроет его"><TextIn value={v.url} onChange={x => set(d => { d.VIDEOS[i].url = x; })} mono /></Field>
          <Field label="Длительность"><TextIn value={v.dur} onChange={x => set(d => { d.VIDEOS[i].dur = x; })} mono /></Field>
          <Field label="Просмотры"><TextIn value={v.views} onChange={x => set(d => { d.VIDEOS[i].views = x; })} /></Field>
          <Field label="Тег"><TextIn value={v.tag} onChange={x => set(d => { d.VIDEOS[i].tag = x; })} /></Field>
          <Field label="Описание кадра" hint="текст на превью"><TextIn value={v.frame} onChange={x => set(d => { d.VIDEOS[i].frame = x; })} /></Field>
        </ItemCard>
      ))}
    </ListSection>
  );
}

function ArticlesEditor({ data, set }) {
  const list = data.ARTICLES;
  const add = () => set(d => { d.ARTICLES.push({ id: uid(), title: 'Новая статья', mins: 5, cat: 'Гид', excerpt: '', body: [''] }); });
  return (
    <ListSection count={list.length} addLabel="+ статья" onAdd={add}>
      {list.map((a, i) => (
        <ItemCard key={a.id} badge={i + 1} title={a.title}
          canUp={i > 0} canDown={i < list.length - 1}
          onUp={() => move(set, 'ARTICLES', i, -1)} onDown={() => move(set, 'ARTICLES', i, 1)}
          onRemove={() => set(d => { d.ARTICLES.splice(i, 1); })}>
          <Field label="Заголовок" wide><TextIn value={a.title} onChange={v => set(d => { d.ARTICLES[i].title = v; })} /></Field>
          <Field label="Категория"><TextIn value={a.cat} onChange={v => set(d => { d.ARTICLES[i].cat = v; })} /></Field>
          <Field label="Время чтения, мин"><NumIn value={a.mins} onChange={v => set(d => { d.ARTICLES[i].mins = v; })} /></Field>
          <Field label="Краткое описание" wide><AreaIn rows={2} value={a.excerpt} onChange={v => set(d => { d.ARTICLES[i].excerpt = v; })} /></Field>
          <Field label="Полный текст" wide hint="Каждый абзац — с новой строки (через пустую строку)">
            <AreaIn rows={8} value={(a.body || []).join('\n\n')}
              onChange={v => set(d => { d.ARTICLES[i].body = v.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean); })} />
          </Field>
        </ItemCard>
      ))}
    </ListSection>
  );
}

function ProjectsEditor({ data, set }) {
  const list = data.PROJECTS;
  const add = () => set(d => { d.PROJECTS.push({ id: uid(), name: 'Новый проект', floors: '1 этаж', area: 100, beds: 3, blockM3: 35, frame: 'фасад дома' }); });
  return (
    <ListSection count={list.length} addLabel="+ проект" onAdd={add}>
      {list.map((p, i) => (
        <ItemCard key={p.id} badge={i + 1} title={p.name}
          canUp={i > 0} canDown={i < list.length - 1}
          onUp={() => move(set, 'PROJECTS', i, -1)} onDown={() => move(set, 'PROJECTS', i, 1)}
          onRemove={() => set(d => { d.PROJECTS.splice(i, 1); })}>
          <ImageField label="Фото проекта" value={p.img} onChange={v => set(d => { d.PROJECTS[i].img = v; })} />
          <Field label="Название"><TextIn value={p.name} onChange={v => set(d => { d.PROJECTS[i].name = v; })} /></Field>
          <Field label="Этажность"><TextIn value={p.floors} onChange={v => set(d => { d.PROJECTS[i].floors = v; })} /></Field>
          <Field label="Площадь, м²"><NumIn value={p.area} onChange={v => set(d => { d.PROJECTS[i].area = v; })} /></Field>
          <Field label="Спальни"><NumIn value={p.beds} onChange={v => set(d => { d.PROJECTS[i].beds = v; })} /></Field>
          <Field label="Объём блока, м³"><NumIn value={p.blockM3} onChange={v => set(d => { d.PROJECTS[i].blockM3 = v; })} /></Field>
          <Field label="Подпись фото"><TextIn value={p.frame} onChange={v => set(d => { d.PROJECTS[i].frame = v; })} /></Field>
        </ItemCard>
      ))}
    </ListSection>
  );
}

function AnalyticsEditor({ data, set }) {
  const a = data.ANALYTICS || { yandexId: '' };
  return (
    <div style={af.stack}>
      <div style={af.item}>
        <div style={af.itemHead}><div style={af.itemTitle}><span>Яндекс.Метрика</span></div></div>
        <div style={af.grid2}>
          <Field label="Номер счётчика" wide
            hint="Только цифры, напр. 98765432. Найдёте в metrika.yandex.ru → ваш счётчик → «Номер». После сохранения счётчик заработает на сайте.">
            <TextIn value={a.yandexId} onChange={v => set(d => { if (!d.ANALYTICS) d.ANALYTICS = {}; d.ANALYTICS.yandexId = v.replace(/\D/g, ''); })} placeholder="напр. 98765432" mono />
          </Field>
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 4 }}>
          Как подключить: зарегистрируйтесь на metrika.yandex.ru, создайте счётчик для адреса газоблок34.рф,
          скопируйте его <b>номер</b> и вставьте сюда. Вставлять весь код не нужно — сайт подключит счётчик сам.
          Чтобы отключить — очистите поле.
        </p>
      </div>
    </div>
  );
}

/* ---------- Разделы: вкл/выкл участков сайта ---------- */
const ADMIN_SECTIONS = [
  { k: 'calc',     label: 'Калькулятор газоблока' },
  { k: 'products', label: 'Газоблок (продукция)' },
  { k: 'bricks',   label: 'Кирпич (калькулятор + каталог)' },
  { k: 'beton',    label: 'Бетон' },
  { k: 'gbi',      label: 'ЖБИ' },
  { k: 'video',    label: 'Видео' },
  { k: 'articles', label: 'Статьи' },
  { k: 'projects', label: 'Проекты' },
  { k: 'delivery', label: 'Доставка' },
  { k: 'faq',      label: 'Вопросы' },
];
function SectionsEditor({ data, set }) {
  const s = data.SECTIONS || {};
  const toggle = (k) => set(d => { if (!d.SECTIONS) d.SECTIONS = {}; d.SECTIONS[k] = !(d.SECTIONS[k] !== false); });
  return (
    <div style={af.stack}>
      <div style={af.item}>
        <div style={af.itemHead}><div style={af.itemTitle}><span>Разделы сайта</span></div></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ADMIN_SECTIONS.map(it => {
            const on = s[it.k] !== false;
            return (
              <button key={it.k} type="button" onClick={() => toggle(it.k)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, padding: '12px 2px', background: 'none', border: 'none', borderBottom: '1px solid var(--line)', cursor: 'pointer', font: 'inherit', width: '100%', textAlign: 'left' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: on ? 'var(--ink)' : 'var(--ink-3)' }}>{it.label}</span>
                <span style={{ width: 42, height: 24, borderRadius: 999, background: on ? 'var(--accent)' : 'var(--line)', position: 'relative', flex: 'none', transition: 'background .15s ease', display: 'inline-block' }}>
                  <span style={{ position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: 999, background: '#fff', transition: 'transform .15s ease', display: 'block', transform: on ? 'translateX(18px)' : 'translateX(0)' }}></span>
                </span>
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 12 }}>
          Выключенный раздел пропадает с главной страницы и из меню. Не забудьте нажать «Сохранить».
          Такая же кнопка «Разделы» появляется внизу слева на самом сайте, пока вы вошли в админку.
        </p>
      </div>
    </div>
  );
}

/* ---------- Бетон ---------- */
function BetonEditor({ data, set }) {
  const b = data.BETON || { GRADES: [] };
  const addGrade = () => set(d => { d.BETON.GRADES.push({ id: 'g' + uid(), name: 'М200', cls: 'B15', use: '', price: 5000 }); });
  return (
    <div style={af.stack}>
      <div style={af.item}>
        <div style={af.itemHead}><div style={af.itemTitle}><span>Ссылки для заказа бетона</span></div></div>
        <div className="adm-grid2" style={af.grid2}>
          <Field label="Telegram (заказ расчёта)" wide hint="Кнопка «Заказать расчёт в Telegram»"><TextIn value={b.TG_LINK} onChange={v => set(d => { d.BETON.TG_LINK = v; })} mono /></Field>
          <Field label="Подпись Telegram" hint="напр. @beribeton034"><TextIn value={b.TG_LABEL} onChange={v => set(d => { d.BETON.TG_LABEL = v; })} mono /></Field>
          <Field label="Объём миксера, м³"><NumIn value={b.mixerM3} onChange={v => set(d => { d.BETON.mixerM3 = v; })} /></Field>
          <Field label="Ссылка MAX (заказ)" wide><TextIn value={b.MAX_LINK} onChange={v => set(d => { d.BETON.MAX_LINK = v; })} mono /></Field>
          <Field label="Ссылка MAX — запасная" wide><TextIn value={b.MAX_LINK2} onChange={v => set(d => { d.BETON.MAX_LINK2 = v; })} mono /></Field>
          <Field label="Описание раздела" wide><AreaIn rows={3} value={b.intro} onChange={v => set(d => { d.BETON.intro = v; })} /></Field>
        </div>
      </div>
      {(b.GRADES || []).map((g, i) => (
        <ItemCard key={g.id || i} badge={i + 1} title={`${g.name} · ${g.cls}`}
          canUp={i > 0} canDown={i < b.GRADES.length - 1}
          onUp={() => set(d => { const a = d.BETON.GRADES; const t = a[i]; a[i] = a[i-1]; a[i-1] = t; })}
          onDown={() => set(d => { const a = d.BETON.GRADES; const t = a[i]; a[i] = a[i+1]; a[i+1] = t; })}
          onRemove={() => set(d => { d.BETON.GRADES.splice(i, 1); })}>
          <ImageField label="Фото (необязательно — без фото карточка остаётся как сейчас)" value={g.img} onChange={v => set(d => { d.BETON.GRADES[i].img = v; })} />
          <Field label="Марка"><TextIn value={g.name} onChange={v => set(d => { d.BETON.GRADES[i].name = v; })} /></Field>
          <Field label="Класс"><TextIn value={g.cls} onChange={v => set(d => { d.BETON.GRADES[i].cls = v; })} /></Field>
          <Field label="Цена, ₽/м³"><NumIn value={g.price} onChange={v => set(d => { d.BETON.GRADES[i].price = v; })} /></Field>
          <Field label="Бейдж" hint="напр. Хит"><TextIn value={g.badge} onChange={v => set(d => { d.BETON.GRADES[i].badge = v; })} /></Field>
          <Field label="Применение" wide><TextIn value={g.use} onChange={v => set(d => { d.BETON.GRADES[i].use = v; })} /></Field>
        </ItemCard>
      ))}
      <button style={af.addBtn} onClick={addGrade}>+ марка бетона</button>
    </div>
  );
}

/* ---------- ЖБИ ---------- */
function GbiEditor({ data, set }) {
  const list = data.GBI || [];
  const add = () => set(d => { d.GBI.push({ id: 'g' + uid(), name: 'Новое изделие', cat: 'Блоки ФБС', size: '', weight: 0, price: 0, note: '' }); });
  return (
    <div style={af.stack}>
      <div style={af.item}>
        <div className="adm-grid2" style={af.grid2}>
          <Field label="Ссылка на каталог завода" wide hint="Кнопка «Весь каталог завода»"><TextIn value={data.GBI_URL} onChange={v => set(d => { d.GBI_URL = v; })} mono /></Field>
        </div>
      </div>
      {list.map((g, i) => (
        <ItemCard key={g.id} badge={i + 1} title={g.name}
          canUp={i > 0} canDown={i < list.length - 1}
          onUp={() => move(set, 'GBI', i, -1)} onDown={() => move(set, 'GBI', i, 1)}
          onRemove={() => set(d => { d.GBI.splice(i, 1); })}>
          <ImageField label="Фото изделия" value={g.img} onChange={v => set(d => { d.GBI[i].img = v; })} />
          <Field label="Название"><TextIn value={g.name} onChange={v => set(d => { d.GBI[i].name = v; })} /></Field>
          <Field label="Категория" hint="напр. Блоки ФБС, Перемычки"><TextIn value={g.cat} onChange={v => set(d => { d.GBI[i].cat = v; })} /></Field>
          <Field label="Размер, мм"><TextIn value={g.size} onChange={v => set(d => { d.GBI[i].size = v; })} mono /></Field>
          <Field label="Вес, кг/шт"><NumIn value={g.weight} onChange={v => set(d => { d.GBI[i].weight = v; })} /></Field>
          <Field label="Цена, ₽/шт"><NumIn value={g.price} onChange={v => set(d => { d.GBI[i].price = v; })} /></Field>
          <Field label="Описание" wide><AreaIn rows={2} value={g.note} onChange={v => set(d => { d.GBI[i].note = v; })} /></Field>
        </ItemCard>
      ))}
      <button style={af.addBtn} onClick={add}>+ изделие ЖБИ</button>
    </div>
  );
}

/* ---------- Кирпич ---------- */
function BricksEditor({ data, set }) {
  const list = data.BRICKS || [];
  const add = () => set(d => { d.BRICKS.push({ id: 'b' + uid(), name: 'Новый кирпич', color: '', format: '1НФ', size: '250 × 120 × 65', pricePerPc: 0, note: '' }); });
  return (
    <div style={af.stack}>
      {list.map((b, i) => (
        <ItemCard key={b.id} badge={i + 1} title={b.name}
          canUp={i > 0} canDown={i < list.length - 1}
          onUp={() => move(set, 'BRICKS', i, -1)} onDown={() => move(set, 'BRICKS', i, 1)}
          onRemove={() => set(d => { d.BRICKS.splice(i, 1); })}>
          <ImageField label="Фото кирпича" value={b.img} onChange={v => set(d => { d.BRICKS[i].img = v; })} />
          <Field label="Название"><TextIn value={b.name} onChange={v => set(d => { d.BRICKS[i].name = v; })} /></Field>
          <Field label="Цвет"><TextIn value={b.color} onChange={v => set(d => { d.BRICKS[i].color = v; })} /></Field>
          <Field label="Формат"><TextIn value={b.format} onChange={v => set(d => { d.BRICKS[i].format = v; })} /></Field>
          <Field label="Размер, мм"><TextIn value={b.size} onChange={v => set(d => { d.BRICKS[i].size = v; })} mono /></Field>
          <Field label="Цена, ₽/шт"><NumIn value={b.pricePerPc} onChange={v => set(d => { d.BRICKS[i].pricePerPc = v; })} /></Field>
          <Field label="Описание" wide><AreaIn rows={2} value={b.note} onChange={v => set(d => { d.BRICKS[i].note = v; })} /></Field>
        </ItemCard>
      ))}
      <button style={af.addBtn} onClick={add}>+ кирпич</button>
    </div>
  );
}

function FaqEditor({ data, set }) {
  const list = data.FAQ;
  const add = () => set(d => { d.FAQ.push({ q: 'Новый вопрос?', a: '' }); });
  return (
    <ListSection count={list.length} addLabel="+ вопрос" onAdd={add}>
      {list.map((f, i) => (
        <ItemCard key={i} badge={i + 1} title={f.q}
          canUp={i > 0} canDown={i < list.length - 1}
          onUp={() => move(set, 'FAQ', i, -1)} onDown={() => move(set, 'FAQ', i, 1)}
          onRemove={() => set(d => { d.FAQ.splice(i, 1); })}>
          <Field label="Вопрос" wide><TextIn value={f.q} onChange={v => set(d => { d.FAQ[i].q = v; })} /></Field>
          <Field label="Ответ" wide><AreaIn rows={3} value={f.a} onChange={v => set(d => { d.FAQ[i].a = v; })} /></Field>
        </ItemCard>
      ))}
    </ListSection>
  );
}

function ListSection({ count, addLabel, onAdd, children }) {
  return (
    <div style={af.stack}>
      {children}
      <button style={af.addBtn} onClick={onAdd}>{addLabel}</button>
    </div>
  );
}

function move(set, key, i, dir) {
  set(d => {
    const arr = d[key]; const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  });
}

/* ---------- app ---------- */
function Admin({ onLogout }) {
  const [data, setData] = useState(() => window.GBStore.get());
  const [tab, setTab] = useState('contacts');
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (mutator) => {
    setData(prev => { const next = deep(prev); mutator(next); return next; });
    setDirty(true);
  };

  const save = () => {
    window.GBStore.save(data);
    setDirty(false);
    flash('Сохранено. Откройте сайт — изменения уже там.');
  };
  const discard = () => { setData(window.GBStore.get()); setDirty(false); flash('Изменения отменены'); };
  const resetAll = () => {
    if (!window.confirm('Сбросить весь контент к стандартному? Ваши правки будут удалены.')) return;
    const def = window.GBStore.reset(); setData(window.GBStore.get()); setDirty(false); flash('Сброшено к стандартному контенту');
  };
  const flash = (m) => { setToast(m); clearTimeout(flash._t); flash._t = setTimeout(() => setToast(null), 2600); };

  useEffect(() => {
    const beforeUnload = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  const Editor = {
    sections: SectionsEditor, contacts: ContactsEditor, socials: SocialsEditor, products: ProductsEditor,
    bricks: BricksEditor, beton: BetonEditor, gbi: GbiEditor,
    videos: VideosEditor, articles: ArticlesEditor, projects: ProjectsEditor, faq: FaqEditor, analytics: AnalyticsEditor,
  }[tab];
  const active = TABS.find(t => t.id === tab);

  return (
    <div style={af.shell}>
      {/* top bar */}
      <header style={af.top}>
        <div style={af.brand}>
          <span style={af.logoMark}>Г<span style={af.logoMark34}>34</span></span>
          <div>
            <div style={af.brandTitle}>Панель управления</div>
            <div style={af.brandSub}>ГАЗОБЛОК34 · контент сайта</div>
          </div>
        </div>
        <div style={af.topActions}>
          {dirty && <span style={af.dirtyDot}>● Есть несохранённые изменения</span>}
          <a href="index.html" target="_blank" style={af.linkBtn}>Открыть сайт ↗</a>
          {onLogout && <button style={af.linkBtn} onClick={onLogout}>Выйти</button>}
          {dirty && <button style={af.ghostBtn} onClick={discard}>Отменить</button>}
          <button style={{ ...af.saveBtn, ...(dirty ? {} : af.saveBtnIdle) }} onClick={save} disabled={!dirty}>Сохранить</button>
        </div>
      </header>

      <div className="adm-body" style={af.body}>
        {/* sidebar */}
        <aside className="adm-side" style={af.side}>
          <nav className="adm-nav" style={af.nav}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ ...af.navItem, ...(t.id === tab ? af.navItemOn : {}) }}>
                <span style={af.navIcon}>{t.icon}</span>{t.label}
                <span style={af.navCount}>{Array.isArray(data[mapKey(t.id)]) ? data[mapKey(t.id)].length : ''}</span>
              </button>
            ))}
          </nav>
          <button style={af.resetBtn} onClick={resetAll}>Сбросить к стандартному</button>
          <p style={af.sideNote}>Данные хранятся в этом браузере. Чтобы изменения увидели посетители на их устройствах, нужен сервер — сейчас правки видны на вашем компьютере.</p>
        </aside>

        {/* content */}
        <main style={af.content}>
          <div style={af.contentHead}>
            <h1 style={af.h1}>{active.label}</h1>
            <p style={af.crumb}>Редактирование раздела «{active.label}» · изменения попадут на сайт после кнопки «Сохранить»</p>
          </div>
          <Editor data={data} set={set} />
        </main>
      </div>

      {toast && <div style={af.toast}>{toast}</div>}
    </div>
  );
}

function mapKey(tab) {
  return { socials: 'SOCIALS', products: 'PRODUCTS', bricks: 'BRICKS', gbi: 'GBI', videos: 'VIDEOS', articles: 'ARTICLES', projects: 'PROJECTS', faq: 'FAQ' }[tab] || '';
}

/* ---------- styles ---------- */
const af = {
  shell: { minHeight: '100vh', background: 'var(--surface-2)', display: 'flex', flexDirection: 'column' },
  top: { position: 'sticky', top: 0, zIndex: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, padding: '14px clamp(16px,3vw,32px)', background: 'oklch(0.985 0.004 80 / 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' },
  brand: { display: 'flex', alignItems: 'center', gap: 13 },
  logoMark: { width: 42, height: 42, borderRadius: 10, background: 'var(--ink)', color: 'var(--bg)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, position: 'relative', flex: 'none' },
  logoMark34: { fontFamily: 'var(--font-mono)', fontSize: 10, position: 'absolute', bottom: 4, right: 6, color: 'var(--accent)', fontWeight: 700 },
  brandTitle: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em' },
  brandSub: { fontSize: 12.5, color: 'var(--ink-3)' },
  topActions: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  dirtyDot: { fontSize: 12.5, color: 'var(--accent-ink)', fontWeight: 600 },
  linkBtn: { fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', padding: '9px 14px', borderRadius: 9, border: '1px solid var(--line)', background: 'var(--surface)' },
  ghostBtn: { fontSize: 14, fontWeight: 600, color: 'var(--ink-2)', padding: '9px 14px', borderRadius: 9, border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer' },
  saveBtn: { fontSize: 14, fontWeight: 700, color: 'var(--on-accent, #fff)', padding: '10px 22px', borderRadius: 9, border: 'none', background: 'var(--accent)', cursor: 'pointer' },
  saveBtnIdle: { background: 'var(--line)', color: 'var(--ink-3)', cursor: 'default' },

  body: { display: 'flex', alignItems: 'flex-start', gap: 0, flex: 1 },
  side: { position: 'sticky', top: 71, alignSelf: 'flex-start', width: 252, flex: 'none', padding: 'clamp(16px,2vw,24px)', display: 'flex', flexDirection: 'column', gap: 16, borderRight: '1px solid var(--line)', minHeight: 'calc(100vh - 71px)' },
  nav: { display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: { display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 10, border: 'none', background: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', textAlign: 'left', width: '100%', fontFamily: 'inherit' },
  navItemOn: { background: 'var(--ink)', color: 'var(--bg)' },
  navIcon: { width: 20, textAlign: 'center', fontSize: 14, opacity: .85 },
  navCount: { marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, opacity: .6 },
  resetBtn: { marginTop: 'auto', fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', padding: '10px', borderRadius: 9, border: '1px dashed var(--line)', background: 'none', cursor: 'pointer' },
  sideNote: { fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 },

  content: { flex: 1, minWidth: 0, padding: 'clamp(20px,3vw,40px)', maxWidth: 920 },
  contentHead: { marginBottom: 24 },
  h1: { fontFamily: 'var(--font-display)', fontSize: 'clamp(26px,3vw,34px)', fontWeight: 800, letterSpacing: '-0.02em' },
  crumb: { fontSize: 14, color: 'var(--ink-3)', marginTop: 8 },

  stack: { display: 'flex', flexDirection: 'column', gap: 16 },
  item: { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 'clamp(16px,2vw,22px)' },
  itemHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 },
  itemTitle: { display: 'flex', alignItems: 'center', gap: 11, fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', minWidth: 0 },
  itemNum: { width: 26, height: 26, borderRadius: 7, background: 'var(--accent-soft)', color: 'var(--accent-ink)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, flex: 'none' },
  itemActions: { display: 'flex', gap: 6, flex: 'none' },
  iconBtn: { width: 32, height: 32, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface)', cursor: 'pointer', fontSize: 14, color: 'var(--ink-2)', display: 'grid', placeItems: 'center' },
  del: { color: 'var(--accent-ink)' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' },
  hint: { fontSize: 11.5, color: 'var(--ink-3)' },
  input: { padding: '11px 13px', border: '1px solid var(--line)', borderRadius: 9, fontSize: 14.5, fontFamily: 'var(--font-body)', color: 'var(--ink)', background: 'var(--surface)', outline: 'none', width: '100%' },
  mono: { fontFamily: 'var(--font-mono)', fontSize: 13 },
  addBtn: { padding: '14px', borderRadius: 12, border: '1.5px dashed var(--line-strong, var(--line))', background: 'var(--surface)', color: 'var(--ink-2)', fontSize: 14.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  addBtnSm: { padding: '8px 14px', borderRadius: 9, border: '1px dashed var(--line)', background: 'var(--surface)', color: 'var(--ink-2)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },

  toast: { position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: 'var(--ink)', color: 'var(--bg)', padding: '14px 22px', borderRadius: 12, fontSize: 14.5, fontWeight: 600, boxShadow: 'var(--shadow-lg)', maxWidth: '90vw', textAlign: 'center' },
};

/* ---------- login gate ---------- */
function Gate({ onOk }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (val === ADMIN_PASSWORD) {
      try { sessionStorage.setItem('gb_admin_ok', '1'); } catch (e) {}
      try { localStorage.setItem('gb_admin_on', '1'); } catch (e) {}
      onOk();
    } else {
      setErr(true);
    }
  };
  return (
    <div style={gate.wrap}>
      <form style={gate.card} onSubmit={submit}>
        <span style={gate.logo}>Г<span style={gate.logo34}>34</span></span>
        <h1 style={gate.title}>Панель управления</h1>
        <p style={gate.sub}>Введите пароль для входа</p>
        <input
          type="password" autoFocus value={val}
          onChange={e => { setVal(e.target.value); setErr(false); }}
          placeholder="Пароль" style={{ ...gate.input, ...(err ? gate.inputErr : {}) }} />
        {err && <span style={gate.err}>Неверный пароль</span>}
        <button type="submit" style={gate.btn}>Войти</button>
        <a href="index.html" style={gate.back}>← На сайт</a>
      </form>
    </div>
  );
}

const gate = {
  wrap: { minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--surface-2)', padding: 20 },
  card: { width: 'min(380px, 100%)', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: 'clamp(28px,4vw,40px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-lg)' },
  logo: { width: 54, height: 54, borderRadius: 13, background: 'var(--ink)', color: 'var(--bg)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 27, position: 'relative', marginBottom: 6 },
  logo34: { fontFamily: 'var(--font-mono)', fontSize: 11, position: 'absolute', bottom: 6, right: 8, color: 'var(--accent)', fontWeight: 700 },
  title: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.15, textAlign: 'center' },
  sub: { fontSize: 14, color: 'var(--ink-3)', marginBottom: 8, textAlign: 'center' },
  input: { width: '100%', padding: '13px 15px', border: '1px solid var(--line)', borderRadius: 11, fontSize: 16, fontFamily: 'var(--font-body)', color: 'var(--ink)', background: 'var(--surface)', outline: 'none', textAlign: 'center' },
  inputErr: { borderColor: 'var(--accent)' },
  err: { fontSize: 13, color: 'var(--accent-ink)', fontWeight: 600 },
  btn: { width: '100%', padding: '13px', borderRadius: 11, border: 'none', background: 'var(--accent)', color: 'var(--on-accent, #fff)', fontSize: 15.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 },
  back: { fontSize: 13.5, color: 'var(--ink-3)', marginTop: 6 },
};

/* ---------- root ---------- */
function Root() {
  const [ok, setOk] = useState(() => {
    try { return sessionStorage.getItem('gb_admin_ok') === '1'; } catch (e) { return false; }
  });
  return ok ? <Admin onLogout={() => { try { sessionStorage.removeItem('gb_admin_ok'); } catch (e) {} try { localStorage.removeItem('gb_admin_on'); } catch (e) {} setOk(false); }} /> : <Gate onOk={() => setOk(true)} />;
}

ReactDOM.createRoot(document.getElementById('admin-root')).render(<Root />);
