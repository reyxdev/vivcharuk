import { useEffect, useState } from 'react';
import { Link, useRouteLoaderData, useSearchParams } from 'react-router';
import type { Locale } from '@vivcharyk/schemas';
import { path } from '@/lib/segments';
import { localeOf, titled } from '@/lib/seo';
import type { Route } from './+types/newsletter';
import type { loader as layoutLoader } from './locale-layout';

export function meta({ matches }: Route.MetaArgs) {
  const locale = localeOf(matches);
  return [{ title: titled(locale === 'en' ? 'Newsletter' : 'Розсилка', locale) }, { name: 'robots', content: 'noindex' }];
}

type State = 'working' | 'confirmed' | 'unsubscribed' | 'invalid' | 'error' | 'none';

const TEXT: Record<Exclude<State, 'working'>, { h: string; p: string }> = {
  confirmed: { h: 'Підписку підтверджено', p: 'Дякуємо! Пишемо не частіше одного разу на тиждень — про акції, знижки й нові вироби. Відписатися можна в кожному листі.' },
  unsubscribed: { h: 'Ви відписалися', p: 'Більше не надсилатимемо рекламних листів на цю адресу. Листи про ваші замовлення приходитимуть, як і раніше.' },
  invalid: { h: 'Посилання не діє', p: 'Можливо, ним уже скористалися. Якщо листи все ж приходять — відпишіться за посиланням у найновішому листі або напишіть нам.' },
  error: { h: 'Не вдалося', p: 'Перевірте з’єднання й оновіть сторінку.' },
  none: { h: 'Розсилка Вівчарика', p: 'Підписатися можна, поставивши позначку під час оформлення замовлення.' },
};
// Round 24 G093.
const TEXT_EN: typeof TEXT = {
  confirmed: { h: 'Subscription confirmed', p: 'Thank you! We write no more than once a week — about offers, discounts and new pieces. You can unsubscribe in every e-mail.' },
  unsubscribed: { h: 'You have unsubscribed', p: 'We will not send any more promotional e-mails to this address. E-mails about your orders will still arrive as before.' },
  invalid: { h: 'This link no longer works', p: 'It may have been used already. If the e-mails still arrive, unsubscribe through the link in the latest one or write to us.' },
  error: { h: 'Something went wrong', p: 'Check your connection and reload the page.' },
  none: { h: 'The Vivcharyk newsletter', p: 'You can subscribe by ticking the box when you place an order.' },
};

/**
 * Round 19 D2: the page behind the links in newsletter letters. The token is posted from the page,
 * so a mail scanner that merely opens the link confirms or unsubscribes nobody.
 */
export default function NewsletterPage() {
  const layout = useRouteLoaderData<typeof layoutLoader>('routes/locale-layout');
  const locale = (layout?.locale ?? 'uk') as Locale;
  const [params] = useSearchParams();
  const confirm = params.get('confirm');
  const unsub = params.get('unsubscribe');
  const [state, setState] = useState<State>(confirm || unsub ? 'working' : 'none');

  useEffect(() => {
    if (!confirm && !unsub) return;
    fetch(`/api/v1/newsletter/${confirm ? 'confirm' : 'unsubscribe'}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: confirm ?? unsub }) })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { result: State }) => setState(d.result))
      .catch(() => setState('error'));
  }, [confirm, unsub]);

  const en = locale === 'en';
  const t = state === 'working' ? null : (en ? TEXT_EN : TEXT)[state];
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col justify-center gap-4 px-4 py-(--section-y-md)">
      {t ? (
        <>
          <h1 className="text-h1 text-text-primary">{t.h}</h1>
          <p className="text-body-lg text-text-body">{t.p}</p>
          <Link to={path.home(locale)} className="self-start rounded-lg bg-bg-inverted px-6 py-3 text-body font-semibold text-text-on-inverted">{en ? 'To the home page' : 'На головну'}</Link>
        </>
      ) : <p className="text-body text-text-muted" role="status">{en ? 'Please wait…' : 'Зачекайте…'}</p>}
    </section>
  );
}
