import { useEffect, useState } from 'react';
import { Sheet } from '@/components/ui';
import { TelegramLink, useTelegramStatus } from './TelegramLink';

const KEY = 'vk.tgPromptUntil';

/**
 * T06–T07: right after signing in, people who may receive Telegram notices but have not connected yet are
 * offered to connect. «Не зараз» hides it for a week on this device.
 */
export function TelegramPrompt() {
  const { data: s } = useTelegramStatus();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!s || !s.botConfigured || !s.allowed || s.linked) return;
    let until = 0;
    try { until = Number(localStorage.getItem(KEY) ?? 0); if (sessionStorage.getItem(KEY)) return; } catch { /* storage blocked */ }
    if (Date.now() > until) setOpen(true);
  }, [s]);
  useEffect(() => { if (open && s?.linked) setOpen(false); }, [open, s?.linked]);
  if (!open) return null;
  const later = () => {
    try { localStorage.setItem(KEY, String(Date.now() + 7 * 86_400_000)); sessionStorage.setItem(KEY, '1'); } catch { /* */ }
    setOpen(false);
  };
  return (
    <Sheet title="Сповіщення в Telegram" onClose={later}>
      <TelegramLink />
      <button type="button" onClick={later} className="mt-4 min-h-11 w-full rounded-lg text-body-sm text-text-muted hover:bg-bg-alt">Не зараз</button>
    </Sheet>
  );
}
