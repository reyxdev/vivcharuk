import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui';
import type { MailSettings } from './api';

const COLORS: Array<[string, string]> = [['green', 'зелена'], ['blue', 'синя'], ['amber', 'жовта'], ['red', 'червона'], ['violet', 'акцентна']];
const keyOf = (title: string) => title.toLowerCase().replace(/[^a-zа-яіїєґ0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 30) || `k${Date.now()}`;

// Owner only (mail.manage_mailboxes): reply templates, labels, the out-of-hours auto-reply (round 19 D1).
export function MailSettingsPanel({ settings, onDone }: { settings: MailSettings; onDone: () => void }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [templates, setTemplates] = useState(settings.templates);
  const [labels, setLabels] = useState(settings.labels);
  const [auto, setAuto] = useState(settings.autoreply);
  const save = useMutation({
    mutationFn: () => api('/admin/mail/settings', { method: 'PUT', body: JSON.stringify({ templates: templates.filter((t) => t.title.trim()), labels: labels.filter((l) => l.title.trim()), autoreply: auto }) }),
    onSuccess: async () => { toast('Збережено'); await qc.invalidateQueries({ queryKey: ['mail-settings'] }); onDone(); },
  });
  const input = 'rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body-sm';
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h3 className="text-h4 text-text-primary">Шаблони відповідей</h3>
        {templates.map((t, i) => (
          <div key={t.key} className="flex flex-col gap-1.5 rounded-lg border border-border-hairline p-2">
            <div className="flex gap-2">
              <input value={t.title} onChange={(e) => setTemplates((x) => x.map((y, j) => (j === i ? { ...y, title: e.target.value } : y)))} aria-label="Назва шаблону" className={`${input} flex-1 font-semibold`} />
              <button type="button" onClick={() => setTemplates((x) => x.filter((_, j) => j !== i))} className="px-2 text-caption text-danger">Видалити</button>
            </div>
            <textarea value={t.body} rows={3} onChange={(e) => setTemplates((x) => x.map((y, j) => (j === i ? { ...y, body: e.target.value } : y)))} aria-label="Текст шаблону" className={input} />
          </div>
        ))}
        <button type="button" onClick={() => setTemplates((x) => [...x, { key: keyOf(`t${Date.now()}`), title: 'Новий шаблон', body: '' }])} className="self-start rounded-lg border border-border-control px-3 py-1.5 text-body-sm">+ Шаблон</button>
        <p className="text-caption text-text-muted">У квадратних дужках — те, що треба дописати перед відправкою, напр. [номер].</p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-h4 text-text-primary">Мітки</h3>
        {labels.map((l, i) => (
          <div key={l.key} className="flex flex-wrap gap-2">
            <input value={l.title} onChange={(e) => setLabels((x) => x.map((y, j) => (j === i ? { ...y, title: e.target.value } : y)))} aria-label="Назва мітки" className={`${input} flex-1`} />
            <select value={l.color} onChange={(e) => setLabels((x) => x.map((y, j) => (j === i ? { ...y, color: e.target.value } : y)))} aria-label="Колір" className={input}>
              {COLORS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
            </select>
            <button type="button" onClick={() => setLabels((x) => x.filter((_, j) => j !== i))} className="px-2 text-caption text-danger">Видалити</button>
          </div>
        ))}
        <button type="button" onClick={() => setLabels((x) => [...x, { key: keyOf(`l${Date.now()}`), title: '', color: 'blue' }])} className="self-start rounded-lg border border-border-control px-3 py-1.5 text-body-sm">+ Мітка</button>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-h4 text-text-primary">Автовідповідь у неробочий час</h3>
        <label className="flex items-center gap-2 text-body-sm"><input type="checkbox" checked={auto.enabled} onChange={(e) => setAuto({ ...auto, enabled: e.target.checked })} /> Надсилати, коли лист приходить у вихідні або поза 11:00–19:00</label>
        <textarea value={auto.body} rows={5} onChange={(e) => setAuto({ ...auto, body: e.target.value })} aria-label="Текст автовідповіді" className={input} />
        <p className="text-caption text-text-muted">Не більше однієї на розмову за добу; роботам, розсилкам і спаму не надсилається.</p>
      </div>

      {save.isError && <p className="text-body-sm text-danger" role="alert">Не вдалося зберегти</p>}
      <div className="sticky -bottom-5 -mx-5 flex gap-2 border-t border-border-hairline bg-bg-surface px-5 py-3">
        <button type="button" onClick={() => save.mutate()} disabled={save.isPending} className="min-h-11 rounded-lg bg-accent px-5 text-body-sm font-semibold text-white disabled:opacity-50">Зберегти</button>
        <button type="button" onClick={onDone} className="min-h-11 px-3 text-body-sm text-text-muted">Скасувати</button>
      </div>
    </div>
  );
}
