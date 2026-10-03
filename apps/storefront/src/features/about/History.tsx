import type { Locale } from '@vivcharyk/schemas';

// The owner's family history, as Іван wrote it (2026-10-03). Ukrainian is his text; English is the
// developer's translation. The dates line up the facts an assistant can quote; the story stays whole.
type Part = { h: string; p: string[] };
type Story = { title: string; lead: string; dates: Array<[string, string]>; datesTitle: string; parts: Part[]; close: string[] };

const UK: Story = {
  title: 'Наша історія',
  lead: 'Усе почалося вдома.',
  datesTitle: 'Коротко в датах',
  dates: [
    ['1972', 'Іван Федорович Гондурак починає займатися ремеслом — з ліжників.'],
    ['Кінець 1980-х', 'Одним із перших у районі відкриває кооператив «Прикарпаття», згодом — «Калина».'],
    ['1987', 'Одружується, і справа стає сімейною.'],
    ['Після 1991', 'Підприємство отримує назву «Вівчарик»; купуємо чесальні машини, робимо пряжу й основу для ліжників.'],
    ['2003–2004', 'Відкриваємо цех переробки овечої шкури.'],
    ['Сьогодні', 'Магазин і виробництво: ліжники, коци й постільна білизна з власного швейного цеху.'],
  ],
  parts: [
    { h: 'Усе почалося вдома', p: [
      'У хаті, де виріс Іван Федорович Гондурак, вовна була всюди. Батько й мама ткали ліжники. Удень звичайна робота, а ввечері вовна, гребінь і веретено.',
      'Він добре пам’ятає, як важко це давалося. Щоб з’явився один ліжник, вовну треба було вичесати руками, пасмо за пасмом. Потім так само руками спрясти нитку, годину за годиною, поки болять пальці. Тільки після цього можна було сідати ткати.',
      'Тоді він і подумав: а якщо цю найважчу частину роботи доручити машині? Нехай людина робить те, що вміє тільки вона: тче, вигадує візерунок, вкладає душу. А чесати й прясти може техніка.',
      'Ця думка визначила все його життя.',
    ] },
    { h: 'Перші кроки', p: [
      'Ремеслом Іван Федорович займається з 1972 року. Почав із того, що знав змалку, з ліжників.',
      'Наприкінці 1980-х у країні дозволили кооперативи. Він одним із перших у районі відкрив свій кооператив. Назвав його «Прикарпаття», згодом він став «Калиною».',
      'Робота закипіла. Ліжники з наших рук роз’їжджалися в різні куточки країни. Крім них робили вироби з вовни та шкіри, з дерева, а також вироби з металу та карбування. Біля справи збиралося дедалі більше людей. Для багатьох це був заробіток, а для когось і нове ремесло.',
    ] },
    { h: 'Машини, які полегшили життя селу', p: [
      '1987 року Іван Федорович одружився, і справа стала по-справжньому сімейною.',
      'Після 1991 року підприємство перереєстрували під новою назвою, «Вівчарик». Напрям залишився той самий. Тоді ж і з’явилося те, про що він мріяв ще хлопцем: купили чесальні машини. Викупили одне приміщення, потім друге.',
      'Відтоді до нас почали везти вовну на чесання. Ми почали робити пряжу та основу для ліжників. Люди купували цю основу, ткали ліжники вдома, продавали їх і заробляли.',
      'Важку роботу, яку колись робили руками його батьки, тепер робила машина. Так тут з’явилася техніка, що допомагала цілому селу, а можна сказати, і цілому району. Люди й сьогодні беруть у нас ровницю, прядуть із неї на домашніх прядках і заробляють на цьому. Для нас це, мабуть, найважливіше: наша справа годує не тільки нашу родину.',
    ] },
    { h: 'Від нитки до ковдри', p: [
      'Згодом у цехах з’явилося в’язальне і стьобальне обладнання.',
      'На в’язальних машинах почали в’язати светри з вовняної пряжі. На стьобальних почали робити вовняні ковдри та коци, теплі й важкі, під якими добре спиться в найхолоднішу ніч.',
    ] },
    { h: 'Шкура, яка гріє', p: [
      'У 2003–2004 роках відкрили ще один цех, з переробки овечої шкури. Вичинену шкуру продавали готовою, а з неї шили килимки, на які так приємно ступити босою ногою зранку.',
      'Так поступово сформувався повний цикл: від вовни, яку знімають з овець, до готової речі у вашому домі.',
    ] },
    { h: 'Сьогодні', p: [
      'Частину напрямів Іван Федорович передав дітям. Тепер вони продовжують справу, яку він починав сам.',
      'За собою він залишив магазин і виробництво. Ми робимо ліжники, коци, а також шиємо постільну білизну у власному швейному цеху.',
    ] },
  ],
  close: [
    'За кожною річчю, яку ви тут бачите, стоїть понад п’ятдесят років роботи, два покоління майстрів і одна проста думка, з якої все почалося: праця людини має бути легшою, а річ, яку вона створює, має гріти.',
    'Дякуємо, що ви з нами.',
  ],
};

const EN: Story = {
  title: 'Our story',
  lead: 'It all began at home.',
  datesTitle: 'In dates',
  dates: [
    ['1972', 'Ivan Hondurak takes up the craft, starting with lizhnyks.'],
    ['Late 1980s', 'One of the first in the district, he opens a cooperative: “Prykarpattia”, later “Kalyna”.'],
    ['1987', 'He marries, and the work becomes a family business.'],
    ['After 1991', 'The business is renamed “Vivcharyk”; we buy carding machines and make yarn and warp for lizhnyks.'],
    ['2003–2004', 'We open a workshop for processing sheepskins.'],
    ['Today', 'The shop and the workshop: lizhnyks, wool blankets (kotsy) and bed linen from our own sewing room.'],
  ],
  parts: [
    { h: 'It all began at home', p: [
      'In the house where Ivan Fedorovych Hondurak grew up, there was wool everywhere. His father and mother wove lizhnyks. By day, the usual work; in the evening, wool, a comb and a spindle.',
      'He remembers well how hard it was. For one lizhnyk, the wool had to be combed by hand, strand by strand. Then the yarn had to be spun by hand too, hour after hour, until the fingers ached. Only then could the weaving begin.',
      'That was when he thought: what if the hardest part of the work went to a machine? Let people do what only people can do: weave, invent the pattern, put their soul into it. Combing and spinning can be done by machines.',
      'That thought shaped his whole life.',
    ] },
    { h: 'First steps', p: [
      'Ivan Fedorovych has worked in the craft since 1972. He began with what he had known since childhood: lizhnyks.',
      'In the late 1980s, cooperatives were allowed in the country. He was one of the first in the district to open one. He called it “Prykarpattia”; later it became “Kalyna”.',
      'The work took off. Lizhnyks from our hands travelled to every corner of the country. Besides them, we made goods from wool and leather, from wood, and metalwork and embossing. More and more people gathered around the work. For many it was a living; for some, a new craft.',
    ] },
    { h: 'Machines that made village life easier', p: [
      'In 1987 Ivan Fedorovych married, and the business became truly a family one.',
      'After 1991 the business was registered again under a new name, “Vivcharyk”. The direction stayed the same. And then came what he had dreamt of as a boy: carding machines. We bought one building, then a second.',
      'From then on, people brought us their wool for carding. We began making yarn and warp for lizhnyks. People bought the warp, wove lizhnyks at home, sold them and earned a living.',
      'The heavy work his parents once did by hand was now done by a machine. That is how machinery came here that helped the whole village, and you could say the whole district. To this day people take wool roving from us, spin it on their spinning wheels at home and earn from it. For us this is perhaps the most important thing: our work feeds more than our own family.',
    ] },
    { h: 'From yarn to blanket', p: [
      'In time, knitting and quilting machines arrived in the workshops.',
      'On the knitting machines we began knitting sweaters from wool yarn. On the quilting machines we began making wool blankets and kotsy, warm and heavy, the kind you sleep well under on the coldest night.',
    ] },
    { h: 'A hide that keeps you warm', p: [
      'In 2003–2004 we opened another workshop, for processing sheepskins. The tanned skins were sold ready, and rugs were sewn from them, the kind that feel so good under bare feet in the morning.',
      'Step by step, a full cycle took shape: from the wool shorn from sheep to the finished piece in your home.',
    ] },
    { h: 'Today', p: [
      'Ivan Fedorovych has handed some of the lines of work to his children. They now carry on what he once started alone.',
      'He kept the shop and the workshop. We make lizhnyks and kotsy, and we sew bed linen in our own sewing room.',
    ] },
  ],
  close: [
    'Behind every piece you see here are more than fifty years of work, two generations of craftsmen and one simple thought that started it all: a person’s work should be lighter, and the thing they make should keep you warm.',
    'Thank you for being with us.',
  ],
};

export function History({ locale }: { locale: Locale }) {
  const s = locale === 'en' ? EN : UK;
  return (
    <section aria-labelledby="history" className="py-(--section-y-md)">
      <div className="mx-auto flex max-w-(--container-narrow) flex-col gap-8 px-4">
        <div className="flex flex-col gap-2">
          <h2 id="history" className="text-h1 text-text-primary">{s.title}</h2>
          <p className="text-body-lg text-text-muted">{s.lead}</p>
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-border-hairline bg-bg-surface p-5">
          <h3 className="text-h4 text-text-primary">{s.datesTitle}</h3>
          <dl className="grid gap-x-5 gap-y-2 text-body sm:grid-cols-[8.5rem_1fr]">
            {s.dates.map(([d, t]) => <div key={d} className="contents"><dt className="font-semibold text-text-primary tabular-nums">{d}</dt><dd className="text-text-body">{t}</dd></div>)}
          </dl>
        </div>
        {s.parts.map((part) => (
          <div key={part.h} className="flex flex-col gap-3 text-body-lg text-text-body">
            <h3 className="text-h3 text-text-primary">{part.h}</h3>
            {part.p.map((x) => <p key={x.slice(0, 24)}>{x}</p>)}
          </div>
        ))}
        <div className="flex flex-col gap-3 border-t border-border-hairline pt-6 text-body-lg text-text-primary">
          {s.close.map((x) => <p key={x.slice(0, 24)}>{x}</p>)}
        </div>
      </div>
    </section>
  );
}
