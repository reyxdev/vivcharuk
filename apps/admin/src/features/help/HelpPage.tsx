import { useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { Image as ImageIcon, Mic } from 'lucide-react';
import { PageHeader } from '@/components/ui';
import { MORE_DAILY, MORE_SETUP } from '@/components/sections';

// Round 20 #44, #95–96, #180, #280, #295: one short page. Each part has the id of its section's path,
// so the «?» in the header opens /help#orders, /help#mail and so on. Steps carry places for
// screenshots (computer and phone separately); they are added after the visit.

function Shot({ what, phone }: { what: string; phone?: boolean }) {
  return (
    <figure className={`flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-control bg-bg-alt px-3 text-center text-caption text-text-muted ${phone ? 'aspect-[9/16] w-32' : 'aspect-video w-full max-w-64'}`}>
      <ImageIcon size={16} className="shrink-0" /> Знімок екрана{phone ? ' телефона' : ''}: {what}
    </figure>
  );
}

function Topic({ id, title, children, shots }: { id: string; title: string; children: ReactNode; shots?: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 rounded-xl border border-border-hairline bg-bg-surface p-4 target:ring-2 target:ring-accent">
      <h2 className="mb-2 text-h3 font-semibold text-text-primary">{title}</h2>
      <div className="flex flex-col gap-2 text-body text-text-body [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-1.5 [&_b]:text-text-primary">{children}</div>
      {shots && <div className="mt-3 flex flex-wrap gap-2">{shots}</div>}
    </section>
  );
}

const OTHER: Record<string, string> = {
  '/categories': 'Порядок змінюється перетягуванням за ⋮⋮. Зірочка — категорія в колах на головній. Нова категорія спершу прихована.',
  '/collections': 'Товар додається в колекцію галочкою в його редакторі; тут — порядок товарів (перетягуванням) і текст сторінки.',
  '/media': 'Усі фото й відео. Натисніть на фото — побачите, де воно використане. Нові фото додаються в редакторі товару.',
  '/blog': 'Напишіть статтю, як лист: заголовок, «Коротко» і текст. Зберігається саме; на сайт — кнопкою «Опублікувати».',
  '/promotions': '«Промокод» → оберіть вид знижки → код, розмір, дати. Вимкнути можна перемикачем у списку.',
  '/newsletter': 'Хто погодився отримувати листи. Підписка діє лише після того, як людина підтвердить її з листа.',
  '/employees': '«Запросити» → ім\'я, пошта, ролі. Людина отримає посилання й сама придумає пароль.',
  '/settings': 'Плитки: оплата, опт, сповіщення, сайт (стрічка й банери). Кожна має свою кнопку «Зберегти».',
  '/templates': 'Готові описи й розміри для кожної категорії — з них починається новий товар.',
  '/libraries': 'Кольори, розміри й матеріали, з яких складаються товари.',
  '/audit': 'Хто що змінив. «Фільтри» — за людиною й датою.',
};

export function HelpPage() {
  const { hash } = useLocation();
  useEffect(() => { if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' }); }, [hash]);
  const others = [...MORE_DAILY, ...MORE_SETUP].filter((s) => OTHER[s.to]);

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <PageHeader title="Довідка" sub="Коротко про головне. Натисніть «?» вгорі в будь-якому розділі — відкриється потрібна частина." />
      <nav aria-label="Зміст" className="flex flex-wrap gap-1.5">
        {[['orders', 'Замовлення'], ['products', 'Товар з фото'], ['mail', 'Пошта'], ['shop-sale', 'Магазин'], ['print', 'Друк'], ['account', 'Вхід і пароль'], ['other', 'Інші розділи']].map(([id, t]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-border-control bg-bg-surface px-3 py-1 text-body-sm text-text-primary hover:bg-bg-alt">{t}</a>
        ))}
      </nav>

      <Topic id="orders" title="Як прийняти замовлення" shots={<><Shot what="список «Нові»" /><Shot what="кнопка внизу замовлення" phone /></>}>
        <ol>
          <li>Відкрийте <b>Замовлення</b> → вкладка <b>Нові</b>. Нове замовлення ще й дзенькне та прийде в Telegram.</li>
          <li>Натисніть на замовлення. Зателефонуйте покупцю — кнопки дзвінка, Viber і Telegram поруч з його іменем.</li>
          <li>Після розмови натисніть велику кнопку <b>«Подзвонив, підтверджую»</b>.</li>
          <li>Далі та сама кнопка підказує наступний крок: <b>«Пакувати»</b> (або «Виготовляти» для свого розміру) → <b>«Відправлено»</b> — впишіть ТТН, і покупець отримає лист з номером → <b>«Отримано»</b>.</li>
        </ol>
        <p>Скасувати чи змінити статус інакше — у «⋯» вгорі замовлення. Панель завжди перепитає «Ви впевнені?».</p>
        <p id="quick-orders" className="scroll-mt-20">«Купити в 1 клік» — окрема вкладка в Замовленнях: передзвоніть людині й натисніть «Створити замовлення».</p>
      </Topic>

      <Topic id="products" title="Як додати товар з фото" shots={<><Shot what="крок «Категорія»" /><Shot what="додавання фото з камери" phone /></>}>
        <ol>
          <li><b>Товари</b> → <b>«Додати»</b>. Спершу оберіть категорію — назва, розміри й опис підставляться самі.</li>
          <li>Фото: перетягніть кілька з комп'ютера або на телефоні натисніть камеру чи галерею. Перше фото — головне; порядок змінюється перетягуванням. Фото можна додати й пізніше — тоді товар лишиться чернеткою.</li>
          <li>Позначте розміри й кольори, перевірте ціну й кількість.</li>
          <li>На останньому кроці подивіться, як товар виглядатиме на сайті, і натисніть <b>«Опублікувати»</b>.</li>
        </ol>
        <p>Ціну й кількість вже готового товару можна змінити прямо в таблиці: впишіть і натисніть Enter.</p>
      </Topic>

      <Topic id="mail" title="Як відповісти на лист" shots={<><Shot what="лист і кнопка «Відповісти»" /><Shot what="мікрофон на клавіатурі" phone /></>}>
        <ol>
          <li>Відкрийте <b>Пошту</b> → вкладка <b>Нові</b> → натисніть на лист.</li>
          <li>Натисніть <b>«Відповісти»</b>. Можна вставити готовий шаблон і змінити його.</li>
          <li>Напишіть відповідь і натисніть <b>«Надіслати»</b>. Лист піде з адреси магазину, а відповідь покупця з'явиться тут же.</li>
        </ol>
        <p className="flex items-start gap-2 rounded-lg bg-bg-alt p-3"><Mic size={18} className="mt-0.5 shrink-0 text-accent-text" /><span>Не хочеться друкувати? На телефоні натисніть <b>мікрофон</b> на клавіатурі й говоріть — текст напишеться сам. Потім лише перевірте розділові знаки.</span></p>
      </Topic>

      <Topic id="shop-sale" title="Продаж у магазині" shots={<><Shot what="каса з плитками товарів" /><Shot what="нижня смужка «Продати»" phone /></>}>
        <ol>
          <li>Відкрийте <b>Магазин</b> (або кнопку «Продаж у магазині» на головній).</li>
          <li>Натискайте на плитки товарів — кожне натискання додає 1 штуку. Якщо в товару є розміри, панель спершу запитає розмір.</li>
          <li>За потреби дайте знижку сумою чи відсотком.</li>
          <li>Натисніть <b>«Продати»</b>, оберіть готівку чи переказ на картку. Каса очиститься для наступного покупця, а залишки зменшаться самі.</li>
        </ol>
        <p>Помилились? Того ж дня продаж можна скасувати — товар повернеться на склад.</p>
      </Topic>

      <Topic id="print" title="Друк" shots={<Shot what="перегляд аркуша перед друком" />}>
        <p>У замовленні чи в списку (позначте кілька) натисніть <b>«Друк»</b> і оберіть: пакувальний лист, рахунок для оплати на IBAN або цінники (8 на аркуш A4). Спершу відкриється перегляд аркуша, потім — <b>«Друкувати»</b>.</p>
        <p>На телефоні замість принтера можна зберегти PDF або надіслати його кнопкою «Поділитися».</p>
        <p>Наклейки Нової пошти поки друкуються в застосунку Нової пошти.</p>
      </Topic>

      <Topic id="account" title="Вхід, пароль і Authenticator" shots={<><Shot what="поле для коду" phone /><Shot what="Google Authenticator з кодом" phone /></>}>
        <ol>
          <li>Впишіть свою пошту й пароль.</li>
          <li>Панель попросить шість цифр. <b>Відкрийте Google Authenticator, скопіюйте код, вставте</b> його в поле (або наберіть). Код змінюється кожні 30 секунд — якщо не підійшов, візьміть новий.</li>
          <li>На своєму телефоні чи комп'ютері позначте <b>«Запам'ятати на 7 днів»</b> — тоді входити доведеться рідше.</li>
        </ol>
        <p>Зручніше — <b>вхід за обличчям (Face ID) чи відбитком</b>: увімкніть його один раз у меню під своїм іменем → <Link to="/account" className="text-accent-text underline">«Пароль і вхід»</Link>. Пароль і код при цьому лишаються запасним способом.</p>
        <p>Змінити пароль — там само. Загубили телефон з Authenticator? Увійдіть резервним кодом (вам їх видали при першому вході) або попросіть іншого власника скинути код входу в «Співробітниках».</p>
      </Topic>

      <section id="other" className="scroll-mt-20 rounded-xl border border-border-hairline bg-bg-surface p-4">
        <h2 className="mb-2 text-h3 font-semibold text-text-primary">Інші розділи</h2>
        <dl className="flex flex-col gap-2">
          {others.map((s) => (
            <div key={s.to} id={s.to.slice(1)} className="scroll-mt-20 rounded-lg p-1 target:bg-accent/5">
              <dt className="text-body font-semibold text-text-primary"><Link to={s.to} className="hover:underline">{s.label}</Link></dt>
              <dd className="text-body-sm text-text-body">{OTHER[s.to]}</dd>
            </div>
          ))}
        </dl>
      </section>
      <p id="customers" className="scroll-mt-20 text-body-sm text-text-muted"><b className="text-text-primary">Клієнти</b> — усі покупці з замовленнями, листами й нотатками. ★ — оптовий, «обережно» — якщо були проблеми.</p>
      <p id="reviews" className="scroll-mt-20 text-body-sm text-text-muted"><b className="text-text-primary">Відгуки</b> з'являються на сайті лише після перевірки: «Опублікувати», «Сховати» або відповісти від імені Вівчарика.</p>
    </div>
  );
}
