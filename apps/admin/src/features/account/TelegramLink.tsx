import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { Send } from 'lucide-react';
import { api, post } from '@/lib/api';
import { GhostButton, PrimaryButton, useConfirm, useToast } from '@/components/ui';

export interface TelegramStatus {
  botConfigured: boolean; botUsername: string | null; allowed: boolean;
  linked: { username: string | null; linkedAt: string | null } | null;
  kinds: Array<{ key: string; label: string; on: boolean }>;
}
interface Link { url: string | null; code: string; expiresAt: string }

export const useTelegramStatus = (enabled = true, live = false) =>
  useQuery({ queryKey: ['telegram-me'], enabled, queryFn: () => api<TelegramStatus>('/auth/staff/telegram'), refetchInterval: live ? 2500 : false });

const isPhone = () => window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;

/** One link shown as a button (phone) or a QR (computer), plus the 6-digit fallback; waits for the bot (T01–T05). */
export function LinkPanel({ link, onCancel, forName }: { link: Link; onCancel: () => void; forName?: string }) {
  const [qr, setQr] = useState('');
  const [left, setLeft] = useState(600);
  useEffect(() => { if (link.url) void QRCode.toDataURL(link.url, { margin: 1, width: 240, color: { dark: '#1C1B18', light: '#FFFFFF' } }).then(setQr); }, [link.url]);
  useEffect(() => {
    const t = window.setInterval(() => setLeft(Math.max(0, Math.round((new Date(link.expiresAt).getTime() - Date.now()) / 1000))), 1000);
    return () => window.clearInterval(t);
  }, [link.expiresAt]);
  if (!left) return <div className="flex flex-col gap-2"><p className="text-body-sm text-text-muted">Посилання вже не діє.</p><GhostButton onClick={onCancel}>Спробувати ще раз</GhostButton></div>;
  const phone = isPhone() && !forName;
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-accent/40 bg-accent/5 p-4">
      {phone ? (
        <>
          <a href={link.url ?? '#'} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#26A5E4] px-5 text-body font-semibold text-white"><Send size={18} /> Відкрити Telegram</a>
          <p className="text-body-sm text-text-body">У боті натисніть «Старт», потім «Так, це я».</p>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          {qr && <img src={qr} alt="QR-код для підключення Telegram" width={180} height={180} className="rounded-lg border border-border-hairline bg-white p-1" />}
          <div className="flex max-w-xs flex-col gap-2 text-body-sm text-text-body">
            <p>{forName ? <>Нехай <b>{forName}</b> наведе камеру свого телефона на код,</> : <>Наведіть камеру телефона на код,</>} відкриється Telegram — там «Старт», потім «Так, це я».</p>
            {link.url && <a href={link.url} target="_blank" rel="noopener" className="text-accent-text underline">або відкрити на цьому комп'ютері</a>}
          </div>
        </div>
      )}
      <p className="text-caption text-text-muted">Не відкривається? Надішліть боту{link.url ? ' ' : ''}код <span className="tabular select-all font-mono font-semibold text-text-primary">{link.code}</span> · діє ще {Math.floor(left / 60)}:{String(left % 60).padStart(2, '0')}</p>
      <p className="text-caption text-text-muted">Чекаю підтвердження з Telegram…</p>
    </div>
  );
}

/** «Пароль і вхід» → Telegram (and Settings → Сповіщення): connect, choose what comes, test, disconnect. */
export function TelegramLink() {
  const toast = useToast();
  const confirm = useConfirm();
  const qc = useQueryClient();
  const [link, setLink] = useState<Link | null>(null);
  const { data: s, refetch } = useTelegramStatus(true, !!link);

  useEffect(() => { if (link && s?.linked) { setLink(null); toast('Telegram підключено ✓'); void qc.invalidateQueries({ queryKey: ['telegram-me'] }); } }, [s?.linked, link, toast, qc]);

  if (!s) return null;
  if (!s.botConfigured) return <p className="rounded-lg bg-bg-alt p-3 text-body-sm text-text-body">Бот ще не підключений: його токен додають на сервері.</p>;
  if (!s.allowed) return <p className="rounded-lg bg-bg-alt p-3 text-body-sm text-text-body">Сповіщення в Telegram для вас вмикає власник у розділі «Співробітники».</p>;

  if (s.linked) {
    const toggle = async (key: string, on: boolean) => {
      const prefs = Object.fromEntries(s.kinds.map((k) => [k.key, k.key === key ? on : k.on]));
      await api('/auth/staff/telegram/prefs', { method: 'PUT', body: JSON.stringify(prefs) });
      await refetch();
    };
    return (
      <div id="telegram" className="flex flex-col gap-3">
        <p className="text-ok text-body">Підключено{s.linked.username ? ` — @${s.linked.username}` : ''}{s.botUsername ? ` · бот @${s.botUsername}` : ''}</p>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1 text-body-sm font-medium text-text-primary">Що надсилати</legend>
          {s.kinds.map((k) => (
            <label key={k.key} className="flex items-center gap-2.5 text-body-sm max-md:py-1">
              <input type="checkbox" checked={k.on} onChange={(e) => void toggle(k.key, e.target.checked)} className="size-4 accent-[var(--accent)] max-md:size-5" /> {k.label}
            </label>
          ))}
          <p className="text-caption text-text-muted">Вночі (22:00–08:00) і на вихідних — без звуку.</p>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <GhostButton icon={Send} onClick={async () => { const r = await post<{ sent: boolean }>('/auth/staff/telegram/test').catch(() => ({ sent: false })); toast(r.sent ? 'Перевірку надіслано — гляньте в Telegram' : 'Не вдалося надіслати', r.sent ? 'ok' : 'error'); }}>Надіслати перевірку</GhostButton>
          <GhostButton onClick={async () => { if (await confirm({ title: 'Відключити Telegram?', text: 'Сповіщення перестануть приходити. Підключити знову можна будь-коли.', ok: 'Відключити', danger: true })) { await api('/auth/staff/telegram', { method: 'DELETE' }); await refetch(); toast('Відключено'); } }}>Відключити</GhostButton>
        </div>
      </div>
    );
  }

  return (
    <div id="telegram" className="flex flex-col gap-3">
      <p className="text-body-sm text-text-body">Нові замовлення, «Купити в 1 клік», оплати й відгуки — одразу вам у Telegram.</p>
      {link ? <LinkPanel link={link} onCancel={() => setLink(null)} /> : (
        <PrimaryButton icon={Send} className="self-start" onClick={async () => {
          try {
            const l = await post<Link>('/auth/staff/telegram/link');
            setLink(l);
          } catch { toast('Не вдалося. Спробуйте ще раз.', 'error'); }
        }}>Підключити Telegram</PrimaryButton>
      )}
    </div>
  );
}
