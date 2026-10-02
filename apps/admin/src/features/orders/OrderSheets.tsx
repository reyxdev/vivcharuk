import { useEffect, useRef, useState } from 'react';
import { ClipboardPaste, ScanLine } from 'lucide-react';
import { Sheet, useConfirm, useToast } from '@/components/ui';
import { uah } from '@/lib/format';
import { editContact, errText, markCaution, recordPayment, recordRefund, transition, useRefresh, type Detail } from './api';
import { CANCEL_REASONS } from './shared';

const input = 'w-full rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body text-text-primary max-md:py-3';
const label = 'flex flex-col gap-1 text-body-sm text-text-muted';
const parseUah = (s: string) => { const n = Number(s.replace(/\s/g, '').replace(',', '.')); return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null; };
const toUah = (minor: number) => String(Math.round(minor) / 100).replace('.', ',');

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{children}</div>;
}
function Btn({ danger, ...rest }: { danger?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...rest} className={`min-h-11 rounded-lg px-4 text-body-sm font-semibold text-white disabled:opacity-50 ${danger ? 'bg-danger' : 'bg-accent'}`} />;
}

type Props = { o: Detail; onClose: () => void };

/* ---------- «Відправлено»: TTN, typed, pasted or scanned (#112–113, #266–268) ---------- */
// The browser's own barcode reader where it exists (Chrome on Android); elsewhere — iPhone Safari —
// a small JS reader (@zxing/browser), loaded only when the camera opens.
type Detector = { detect: (v: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> };
const hasDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
const canScan = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
const ttnFrom = (raw: string) => { const d = raw.replace(/\D/g, ''); return d.length >= 8 && d.length <= 20 ? d : null; };

function Scanner({ onCode, onClose }: { onCode: (s: string) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let stream: MediaStream | null = null; let timer = 0; let stopped = false; let zxingStop: (() => void) | null = null;
    const denied = () => setErr('Немає доступу до камери. Дозвольте його в налаштуваннях або введіть номер.');
    if (hasDetector) {
      const Ctor = (window as unknown as { BarcodeDetector: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
      const det = new Ctor({ formats: ['code_128', 'ean_13', 'itf', 'code_39', 'qr_code'] });
      void navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(async (s) => {
        if (stopped) { s.getTracks().forEach((t) => t.stop()); return; }
        stream = s;
        if (!video.current) return;
        video.current.srcObject = s;
        await video.current.play();
        const tick = async () => {
          if (stopped || !video.current) return;
          const found = (await det.detect(video.current).catch(() => [])).map((c) => ttnFrom(c.rawValue)).find(Boolean);
          if (found) { onCode(found); return; }
          timer = window.setTimeout(() => void tick(), 300);
        };
        void tick();
      }).catch(denied);
    } else {
      void import('@zxing/browser').then(async ({ BrowserMultiFormatReader }) => {
        if (stopped || !video.current) return;
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromConstraints({ video: { facingMode: 'environment' } }, video.current, (result) => {
          const found = result ? ttnFrom(result.getText()) : null;
          if (found && !stopped) { stopped = true; controls.stop(); onCode(found); }
        });
        if (stopped) controls.stop(); else zxingStop = () => controls.stop();
      }).catch(denied);
    }
    return () => { stopped = true; window.clearTimeout(timer); stream?.getTracks().forEach((t) => t.stop()); zxingStop?.(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="flex flex-col gap-2">
      {err ? <p className="text-body-sm text-danger">{err}</p> : <video ref={video} playsInline muted className="aspect-[4/3] w-full rounded-lg bg-black object-cover" />}
      <p className="text-caption text-text-muted">Наведіть камеру на штрихкод ТТН на наклейці.</p>
      <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-border-control text-body-sm">Ввести вручну</button>
    </div>
  );
}

export function ShipSheet({ o, onClose }: Props) {
  const confirm = useConfirm(); const toast = useToast(); const refresh = useRefresh();
  const [ttn, setTtn] = useState(o.trackingNumber ?? '');
  const [notify, setNotify] = useState(true);
  const [scan, setScan] = useState(false);
  const [busy, setBusy] = useState(false);
  const ok = /^\d{8,20}$/.test(ttn);
  const paste = async () => { try { setTtn((await navigator.clipboard.readText()).replace(/\D/g, '').slice(0, 20)); } catch { toast('Не вдалося вставити. Утримайте поле й виберіть «Вставити».', 'error'); } };
  const save = async () => {
    if (!(await confirm({ title: 'Ви впевнені?', text: `${o.number} відправлено, ТТН ${ttn}.`, ok: 'Відправлено' }))) return;
    setBusy(true);
    try {
      await transition(o.number, { to: 'SHIPPED', trackingNumber: ttn, notify: !!o.email && notify });
      toast(o.email && notify ? 'Відправлено. Лист з ТТН піде покупцю.' : 'Відправлено');
      void refresh(o.number); onClose();
    } catch (e) { toast(errText(e), 'error'); } finally { setBusy(false); }
  };
  return (
    <Sheet title="Відправлено" onClose={onClose}>
      {scan ? <Scanner onCode={(c) => { setTtn(c); setScan(false); }} onClose={() => setScan(false)} /> : (
        <div className="flex flex-col gap-3">
          <label className={label}>Номер ТТН
            <div className="flex gap-2">
              <input value={ttn} onChange={(e) => setTtn(e.target.value.replace(/\D/g, '').slice(0, 20))} inputMode="numeric" autoComplete="off" autoFocus placeholder="20450000000000" className={`${input} tabular text-h4`} />
              <button type="button" onClick={() => void paste()} aria-label="Вставити з буфера" title="Вставити" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border-control px-3 text-body-sm text-text-primary hover:bg-bg-alt"><ClipboardPaste size={18} /><span className="max-sm:hidden">Вставити</span></button>
              {canScan && <button type="button" onClick={() => setScan(true)} aria-label="Сканувати штрихкод" title="Сканувати" className="inline-flex shrink-0 items-center rounded-lg border border-border-control px-3 text-text-primary hover:bg-bg-alt"><ScanLine size={18} /></button>}
            </div>
          </label>
          {o.email
            ? <label className="flex items-center gap-2 text-body text-text-primary"><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="size-5 accent-[var(--accent)]" /> Надіслати покупцю лист з ТТН</label>
            : <p className="text-body-sm text-text-muted">У покупця немає email — надішліть ТТН у Viber чи SMS.</p>}
        </div>
      )}
      <Actions><Btn disabled={!ok || busy || scan} onClick={() => void save()}>Відправлено</Btn></Actions>
    </Sheet>
  );
}

/* ---------- Скасувати (#211) ---------- */
export function CancelSheet({ o, onClose }: Props) {
  const confirm = useConfirm(); const toast = useToast(); const refresh = useRefresh();
  const [pick, setPick] = useState('');
  const [other, setOther] = useState('');
  const [busy, setBusy] = useState(false);
  const reason = pick === 'Інше' ? other.trim() : pick;
  const save = async () => {
    if (!(await confirm({ title: `Скасувати ${o.number}?`, text: 'Товари повернуться на склад. Скасування не відміняється.', ok: 'Скасувати замовлення', danger: true }))) return;
    setBusy(true);
    try { await transition(o.number, { to: 'CANCELLED', reason }); toast('Замовлення скасовано'); void refresh(o.number); onClose(); }
    catch (e) { toast(errText(e), 'error'); } finally { setBusy(false); }
  };
  return (
    <Sheet title="Чому скасовуєте?" onClose={onClose}>
      <div className="flex flex-col gap-1">
        {CANCEL_REASONS.map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-body text-text-primary hover:bg-bg-alt max-md:py-3">
            <input type="radio" name="reason" checked={pick === r} onChange={() => setPick(r)} className="size-4 accent-[var(--accent)] max-md:size-5" />{r}
          </label>
        ))}
        {pick === 'Інше' && <input value={other} onChange={(e) => setOther(e.target.value)} autoFocus maxLength={300} placeholder="Кілька слів" className={input} />}
      </div>
      <Actions><Btn danger disabled={!reason || busy} onClick={() => void save()}>Скасувати замовлення</Btn></Actions>
    </Sheet>
  );
}

/* ---------- Повернулось (#212): with the offer to mark the buyer «Обережно» ---------- */
export function ReturnSheet({ o, onClose, canCaution }: Props & { canCaution: boolean }) {
  const confirm = useConfirm(); const toast = useToast(); const refresh = useRefresh();
  const unclaimed = o.status === 'SHIPPED';
  const [reason, setReason] = useState(unclaimed ? 'Не забрав посилку' : '');
  const offer = canCaution && !o.caution && !o.phone.startsWith('anon-');
  const [mark, setMark] = useState(unclaimed && offer);
  const [why, setWhy] = useState('Не забрав посилку');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!(await confirm({ title: 'Ви впевнені?', text: `${o.number} — повернення. Товари повернуться на склад.`, ok: 'Так, повернулось', danger: true }))) return;
    setBusy(true);
    try {
      await transition(o.number, { to: 'RETURNED', reason: reason.trim() });
      if (mark && why.trim()) await markCaution(o.phone, why.trim());
      toast(mark ? 'Записано. Клієнта позначено «Обережно».' : 'Записано');
      void refresh(o.number); onClose();
    } catch (e) { toast(errText(e), 'error'); } finally { setBusy(false); }
  };
  return (
    <Sheet title={unclaimed ? 'Не забрали посилку' : 'Повернення'} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className={label}>Що сталося<input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} className={input} /></label>
        {offer && (
          <div className="flex flex-col gap-2 rounded-xl bg-warning/10 p-3">
            <label className="flex items-center gap-2 text-body text-text-primary"><input type="checkbox" checked={mark} onChange={(e) => setMark(e.target.checked)} className="size-5 accent-[var(--accent)]" /> Позначити клієнта як «Обережно»</label>
            {mark && <input value={why} onChange={(e) => setWhy(e.target.value)} maxLength={300} aria-label="Причина позначки" className={input} />}
          </div>
        )}
      </div>
      <Actions><Btn danger disabled={!reason.trim() || busy || (mark && !why.trim())} onClick={() => void save()}>Записати повернення</Btn></Actions>
    </Sheet>
  );
}

/* ---------- «Оплату отримано» (#114) ---------- */
export function PaymentSheet({ o, onClose }: Props) {
  const confirm = useConfirm(); const toast = useToast(); const refresh = useRefresh();
  const left = Math.max(0, (o.payment === 'PREPAYMENT' && o.paidMinor === 0 ? o.prepaymentMinor ?? 0 : (o.totalMinor ?? 0) - o.paidMinor));
  const [sum, setSum] = useState(left ? toUah(left) : '');
  const [busy, setBusy] = useState(false);
  const minor = parseUah(sum);
  const save = async () => {
    if (!minor || !(await confirm({ title: 'Ви впевнені?', text: `${o.number}: отримано ${uah(minor)}.`, ok: 'Оплату отримано' }))) return;
    setBusy(true);
    try { const r = await recordPayment(o.number, minor); toast(r.full ? 'Оплату записано — замовлення оплачене' : 'Оплату записано'); void refresh(o.number); onClose(); }
    catch (e) { toast(errText(e), 'error'); } finally { setBusy(false); }
  };
  return (
    <Sheet title="Оплату отримано" onClose={onClose}>
      <label className={label}>Скільки надійшло, ₴<input value={sum} onChange={(e) => setSum(e.target.value.replace(/[^\d,.\s]/g, ''))} inputMode="decimal" autoFocus className={`${input} tabular text-h4`} /></label>
      <p className="mt-2 text-body-sm text-text-muted">Разом за замовлення {uah(o.totalMinor)}{o.paidMinor ? ` · вже оплачено ${uah(o.paidMinor)}` : ''}.</p>
      <Actions><Btn disabled={!minor || busy} onClick={() => void save()}>Записати оплату</Btn></Actions>
    </Sheet>
  );
}

/* ---------- Повернення грошей, записане вручну (#214) ---------- */
const HOW = [['CARD', 'На картку'], ['IBAN', 'На рахунок IBAN'], ['CASH', 'Готівкою']] as const;
export function RefundSheet({ o, onClose }: Props) {
  const confirm = useConfirm(); const toast = useToast(); const refresh = useRefresh();
  const [sum, setSum] = useState(o.paidMinor - o.refundedMinor > 0 ? toUah(o.paidMinor - o.refundedMinor) : '');
  const [how, setHow] = useState<(typeof HOW)[number][0]>(o.payment === 'IBAN' ? 'IBAN' : 'CARD');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const minor = parseUah(sum);
  const save = async () => {
    if (!minor || !(await confirm({ title: 'Ви впевнені?', text: `Записати повернення ${uah(minor)} покупцю ${o.number}. Гроші повертаєте ви самі — панель лише записує.`, ok: 'Записати', danger: true }))) return;
    setBusy(true);
    try { await recordRefund(o.number, { amountMinor: minor, method: how, ...(note.trim() ? { note: note.trim() } : {}) }); toast('Повернення записано'); void refresh(o.number); onClose(); }
    catch (e) { toast(errText(e), 'error'); } finally { setBusy(false); }
  };
  return (
    <Sheet title="Записати повернення грошей" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <label className={label}>Сума, ₴<input value={sum} onChange={(e) => setSum(e.target.value.replace(/[^\d,.\s]/g, ''))} inputMode="decimal" autoFocus className={`${input} tabular`} /></label>
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-body-sm text-text-muted">Як повернули</legend>
          {HOW.map(([k, l]) => (
            <label key={k} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-body text-text-primary hover:bg-bg-alt max-md:py-2.5">
              <input type="radio" name="how" checked={how === k} onChange={() => setHow(k)} className="size-4 accent-[var(--accent)] max-md:size-5" />{l}
            </label>
          ))}
        </fieldset>
        <label className={label}>Примітка (необов'язково)<input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className={input} /></label>
      </div>
      <Actions><Btn danger disabled={!minor || busy} onClick={() => void save()}>Записати</Btn></Actions>
    </Sheet>
  );
}

/* ---------- Адреса й контакти (#111) ---------- */
export function ContactSheet({ o, onClose }: Props) {
  const toast = useToast(); const refresh = useRefresh();
  const a = o.shippingAddress;
  const start = {
    fullName: [a.lastName, a.firstName].filter(Boolean).join(' '), patronymic: a.patronymic ?? '', phone: o.phone, email: o.email ?? '',
    city: a.city ?? '', warehouseLabel: a.warehouseLabel ?? '', address: a.address ?? '', postalCode: a.postalCode ?? '',
  };
  const [f, setF] = useState(start);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const branch = a.method === 'NP_BRANCH';
  const street = a.method === 'NP_COURIER' || a.method === 'UKRPOSHTA';
  const save = async () => {
    const diff = Object.fromEntries(Object.entries(f).filter(([k, v]) => v !== start[k as keyof typeof start]).map(([k, v]) => [k, v.trim() || null]));
    if (!Object.keys(diff).length) { onClose(); return; }
    setBusy(true);
    try { await editContact(o.number, diff); toast('Збережено'); void refresh(o.number); onClose(); }
    catch (e) { toast(errText(e), 'error'); } finally { setBusy(false); }
  };
  return (
    <Sheet title="Адреса й контакти" onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={`${label} sm:col-span-2`}>Прізвище та ім'я<input value={f.fullName} onChange={set('fullName')} autoComplete="off" className={input} /></label>
        <label className={label}>По батькові<input value={f.patronymic} onChange={set('patronymic')} autoComplete="off" className={input} /></label>
        <label className={label}>Телефон<input value={f.phone} onChange={set('phone')} inputMode="tel" className={`${input} tabular`} /></label>
        <label className={`${label} sm:col-span-2`}>Email<input value={f.email} onChange={set('email')} type="email" inputMode="email" className={input} /></label>
        {a.method !== 'PICKUP' && <label className={label}>Місто<input value={f.city} onChange={set('city')} className={input} /></label>}
        {branch && <label className={label}>Відділення або поштомат<input value={f.warehouseLabel} onChange={set('warehouseLabel')} className={input} /></label>}
        {street && <label className={label}>Вулиця, будинок, квартира<input value={f.address} onChange={set('address')} className={input} /></label>}
        {street && <label className={label}>Індекс<input value={f.postalCode} onChange={set('postalCode')} inputMode="numeric" className={`${input} tabular`} /></label>}
      </div>
      <p className="mt-2 text-caption text-text-muted">Товари й суми не змінюються — для цього скасуйте й створіть нове замовлення.</p>
      <Actions><Btn disabled={busy} onClick={() => void save()}>Зберегти</Btn></Actions>
    </Sheet>
  );
}

/* ---------- «Обережно» (#212–213, #222) ---------- */
export function CautionSheet({ o, onClose }: Props) {
  const confirm = useConfirm(); const toast = useToast(); const refresh = useRefresh();
  const [why, setWhy] = useState(o.caution?.reason ?? '');
  const [busy, setBusy] = useState(false);
  const save = async (reason: string | null) => {
    if (reason === null && !(await confirm({ title: 'Ви впевнені?', text: 'Позначка «Обережно» зникне з цього клієнта.', ok: 'Зняти позначку' }))) return;
    setBusy(true);
    try { await markCaution(o.phone, reason); toast(reason ? 'Клієнта позначено «Обережно»' : 'Позначку знято'); void refresh(o.number); onClose(); }
    catch (e) { toast(errText(e), 'error'); } finally { setBusy(false); }
  };
  return (
    <Sheet title="Обережно з цим клієнтом" onClose={onClose}>
      <label className={label}>Причина — її побачите на наступних замовленнях<input value={why} onChange={(e) => setWhy(e.target.value)} autoFocus maxLength={300} placeholder="Напр.: не забрав посилку" className={input} /></label>
      <Actions>
        {o.caution && <button type="button" disabled={busy} onClick={() => void save(null)} className="min-h-11 rounded-lg border border-border-control px-4 text-body-sm">Зняти позначку</button>}
        <Btn disabled={why.trim().length < 2 || busy} onClick={() => void save(why.trim())}>Зберегти</Btn>
      </Actions>
    </Sheet>
  );
}
