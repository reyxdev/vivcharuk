import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, RefreshCw, Unplug } from 'lucide-react';
import { api, post } from '@/lib/api';
import { dateTime } from '@/lib/format';
import { CopyButton, GhostButton, PrimaryButton, SkeletonRows, useConfirm, useToast } from '@/components/ui';
import { errorText, Panel, Row } from './parts';

// 2026-10-03: the hours from «Магазин» go to Google Maps (Google Business Profile). The panel is the
// source of truth; Google is written after every change and checked once a day.

interface Gbp {
  configured: boolean; connected: boolean; redirectUri: string;
  connectedAt: string | null; connectedBy: string | null;
  location: { name: string; title: string; address: string } | null;
  status: 'idle' | 'ok' | 'awaiting_api_access' | 'error'; code: string | null; message: string | null;
  dirty: boolean; lastSyncAt: string | null; lastAttemptAt: string | null; inSync: boolean | null; lastCheckedAt: string | null;
}
interface Failure { code: string; message: string }

const RETURN: Record<string, [string, 'ok' | 'error']> = {
  connected: ['Google підключено. Тепер оберіть місце на Картах.', 'ok'],
  denied: ['Доступ у Google не надано.', 'error'],
  scope: ['Google не дав дозволу керувати профілем компанії. Підключіть ще раз і поставте всі галочки.', 'error'],
  no_refresh_token: ['Google не видав постійного ключа. Приберіть доступ «Вівчарик» у myaccount.google.com/permissions і підключіть ще раз.', 'error'],
  bad_state: ['Посилання застаріло або відкрите з іншого входу. Натисніть «Підключити Google» ще раз.', 'error'],
  google_error: ['Google відповів помилкою. Спробуйте ще раз за хвилину.', 'error'],
  not_configured: ['На сервері немає ключів Google — див. кроки нижче.', 'error'],
};

const CODE_TEXT: Record<string, string> = {
  API_ACCESS_NOT_APPROVED: 'Google ще не схвалив доступ до API.',
  TOKEN_REVOKED: 'Доступ до Google скасовано — підключіть знову.',
  NOT_CONNECTED: 'Google не підключено.',
  PERMISSION_DENIED: 'Google відмовив у доступі: цей обліковий запис не керує профілем або API не увімкнено в Google Cloud.',
  NOT_FOUND: 'Google не знаходить це місце — оберіть його ще раз.',
  RATE_LIMITED: 'Google просить зачекати — повторимо самі.',
};
/** «о 14:05» today, «12 жовтня о 14:05» on another day. */
const at = (iso: string) => {
  const d = new Date(iso);
  const time = d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  return d.toDateString() === new Date().toDateString() ? `о ${time}` : `${d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })} о ${time}`;
};
const failureText = (code: string | null, message: string | null) => [code ? CODE_TEXT[code] : null, message].filter(Boolean).join(' ') || code || '';

function StatusLine({ g }: { g: Gbp }) {
  const tone = (cls: string, text: string) => <p className={`text-body-sm ${cls}`}>{text}</p>;
  if (!g.configured) return tone('text-text-muted', 'Не налаштовано: на сервері ще немає ключів Google (кроки нижче).');
  if (!g.connected) return tone('text-text-muted', 'Не підключено.');
  if (g.status === 'awaiting_api_access') return tone('text-warning', g.location
    ? 'Чекає доступу до API Google. Графік відправимо, щойно Google схвалить заявку (перевіряємо щодня).'
    : 'Чекає доступу до API Google. Щойно Google схвалить заявку, місце обереться саме (якщо воно одне), і графік піде в Google; перевіряємо щодня.');
  if (!g.location) return tone('text-warning', 'Підключено. Оберіть місце на Картах.');
  if (g.status === 'error') return tone('text-danger', `Помилка: ${failureText(g.code, g.message)}`);
  if (g.status === 'ok' && g.lastSyncAt) return tone('text-ok', `Синхронізовано ${at(g.lastSyncAt)}.${g.dirty ? ' Нові зміни підуть у Google приблизно за хвилину.' : ''}`);
  return tone('text-text-muted', g.dirty ? 'Графік піде в Google приблизно за хвилину.' : 'Ще не відправляли.');
}

export function GoogleBusinessCard() {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [params, setParams] = useSearchParams();
  const { data: g, refetch } = useQuery({ queryKey: ['google-business'], queryFn: () => api<Gbp>('/admin/google-business') });
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const locations = useQuery({ queryKey: ['google-business-locations'], enabled: picking, queryFn: async () => {
    const r = await api<{ locations: Gbp['location'][]; failure: Failure | null }>('/admin/google-business/locations');
    void qc.invalidateQueries({ queryKey: ['google-business'] }); // a refused listing may change the status line
    return r;
  } });

  // Back from Google: ?gbp=<result> — say what happened, then drop it from the address.
  useEffect(() => {
    const r = params.get('gbp');
    if (!r) return;
    const [text, kind] = RETURN[r] ?? RETURN.google_error!;
    toast(text, kind === 'ok' ? undefined : 'error');
    if (r === 'connected') setPicking(true);
    params.delete('gbp'); setParams(params, { replace: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!g) return <SkeletonRows rows={3} />;

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } catch (e) { toast(errorText(e, { GBP_NOT_CONFIGURED: RETURN.not_configured![0] }), 'error'); }
    finally { setBusy(false); await qc.invalidateQueries({ queryKey: ['google-business'] }); }
  };
  const connect = () => run(async () => { window.location.href = (await post<{ url: string }>('/admin/google-business/oauth/start')).url; });
  const disconnect = async () => {
    if (!(await confirm({ title: 'Від’єднати Google?', text: 'Графік перестане оновлюватися на Google Картах. Те, що вже там, залишиться.', ok: 'Від’єднати', danger: true }))) return;
    await run(async () => { const r = await post<{ revoked: boolean }>('/admin/google-business/disconnect'); toast(r.revoked ? 'Google від’єднано, доступ відкликано.' : 'Google від’єднано. Перевірте myaccount.google.com/permissions, чи доступ прибрано.'); setPicking(false); });
  };
  const choose = (name: string) => run(async () => {
    const r = await api<{ failure: Failure | null }>('/admin/google-business/location', { method: 'PUT', body: JSON.stringify({ name }) });
    if (r.failure) { toast(failureText(r.failure.code, r.failure.message), 'error'); await qc.invalidateQueries({ queryKey: ['google-business'] }); }
    else { toast('Місце обрано. Графік піде в Google приблизно за хвилину.'); setPicking(false); await post('/admin/google-business/sync').catch(() => undefined); }
  });
  const syncNow = () => run(async () => {
    const s = await post<Gbp>('/admin/google-business/sync');
    if (s.status === 'ok') toast('Графік відправлено в Google.');
    else toast(failureText(s.code, s.message) || 'Не вдалося', 'error');
  });

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Google Карти" sub="Години роботи з «Магазину» (тиждень і особливі дні) самі потрапляють у профіль компанії в Google. Головне — графік у панелі: те, що змінили в Google вручну, ми не підтягуємо.">
        <StatusLine g={g} />
        {g.location && g.inSync === false && g.status === 'ok' && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 p-3">
            <span className="text-body-sm text-text-primary">У Google інший графік{g.lastCheckedAt ? ` (перевірено ${dateTime(g.lastCheckedAt)})` : ''}.</span>
            <PrimaryButton icon={RefreshCw} disabled={busy} onClick={() => void syncNow()}>Відправити графік у Google</PrimaryButton>
          </div>
        )}
        {g.connected && (
          <div className="flex flex-col">
            <Row label="Місце">{g.location ? <><span className="block">{g.location.title}</span><span className="block text-body-sm text-text-muted">{g.location.address}</span></> : '—'}</Row>
            {g.connectedBy && <Row label="Підключив">{g.connectedBy}{g.connectedAt ? `, ${dateTime(g.connectedAt)}` : ''}</Row>}
            {g.lastCheckedAt && <Row label="Остання перевірка">{dateTime(g.lastCheckedAt)}{g.inSync === true ? ' — збігається' : ''}</Row>}
          </div>
        )}
        {picking && (
          <div className="flex flex-col gap-2 rounded-lg border border-border-hairline p-3">
            {locations.isPending && <SkeletonRows rows={2} />}
            {locations.data?.failure && <p className="text-body-sm text-danger">{failureText(locations.data.failure.code, locations.data.failure.message)}</p>}
            {locations.data && !locations.data.failure && !locations.data.locations.length && <p className="text-body-sm text-text-muted">У цьому обліковому записі Google немає жодного профілю компанії.</p>}
            {locations.data?.locations.map((l) => l && (
              <button key={l.name} type="button" disabled={busy} onClick={() => void choose(l.name)} className="flex flex-col rounded-lg border border-border-hairline p-3 text-left hover:bg-bg-alt">
                <span className="text-body text-text-primary">{l.title}</span>
                <span className="text-body-sm text-text-muted">{l.address || l.name}</span>
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {g.configured && !g.connected && <PrimaryButton icon={MapPin} disabled={busy} onClick={() => void connect()}>Підключити Google</PrimaryButton>}
          {g.connected && <GhostButton icon={MapPin} disabled={busy} onClick={() => { setPicking(true); void locations.refetch(); }}>{g.location ? 'Змінити місце' : 'Обрати місце'}</GhostButton>}
          {g.connected && g.location && <PrimaryButton icon={RefreshCw} disabled={busy} onClick={() => void syncNow()}>Відправити зараз</PrimaryButton>}
          {g.connected && <GhostButton icon={Unplug} disabled={busy} onClick={() => void disconnect()}>Від’єднати</GhostButton>}
          <GhostButton disabled={busy} onClick={() => void refetch()}>Оновити стан</GhostButton>
        </div>
      </Panel>

      <Panel title="Як підключити" sub="Один раз, у власному обліковому записі Google, який керує профілем компанії.">
        <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-body-sm text-text-body">
          <li>На console.cloud.google.com створіть проєкт (наприклад, «Вівчарик»).</li>
          <li>У «APIs &amp; Services → Library» увімкніть «My Business Account Management API» і «My Business Business Information API».</li>
          <li>«OAuth consent screen»: тип External, стан Testing; у «Test users» додайте свій обліковий запис Google (той, що керує профілем).</li>
          <li>«Credentials → Create credentials → OAuth client ID», тип «Web application». У «Authorized redirect URIs» вставте адресу нижче.</li>
          <li>Client ID і Client secret передайте розробникові: він впише їх на сервері (GOOGLE_BP_CLIENT_ID і GOOGLE_BP_CLIENT_SECRET).</li>
          <li>Подайте заявку на доступ до API: <a href="https://developers.google.com/my-business/content/prereqs" target="_blank" rel="noreferrer" className="underline">developers.google.com/my-business/content/prereqs</a> (профіль має бути підтверджений і активний 60+ днів, з адресою сайту).</li>
          <li>Тут натисніть «Підключити Google» і оберіть місце. Поки Google розглядає заявку, картка показує «Чекає доступу до API Google»; після схвалення графік піде сам, і рядок стане зеленим.</li>
        </ol>
        <div className="flex flex-col gap-1">
          <span className="text-body-sm text-text-muted">Адреса для «Authorized redirect URIs»</span>
          <span className="flex items-center gap-1 break-all font-mono text-body-sm text-text-primary">{g.redirectUri} <CopyButton value={g.redirectUri} label="адресу" /></span>
        </div>
      </Panel>
    </div>
  );
}
