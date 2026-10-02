import { useEffect, useState } from 'react';
import { Share, SquarePlus, X } from 'lucide-react';

const KEY = 'vk.installHint.done';
type PromptEvent = Event & { prompt: () => Promise<void> };

const standalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
const isIphone = () => /iPhone|iPod/.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
const done = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return true; } };

/**
 * Round 20 #48, #238: «Встановити на телефон», shown once. On iPhone (Safari only) the steps
 * Поділитися → «На екран Додому»; on Android the browser's own install button. Never shown inside the
 * installed app or after it was closed once.
 */
export function InstallHint() {
  const [show, setShow] = useState(false);
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  useEffect(() => {
    if (standalone() || done() || window.innerWidth >= 768) return;
    if (isIphone()) { setShow(true); return; }
    const onPrompt = (e: Event) => { e.preventDefault(); setPrompt(e as PromptEvent); setShow(true); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);
  const close = () => { setShow(false); try { localStorage.setItem(KEY, '1'); } catch { /* private mode */ } };
  if (!show) return null;
  return (
    <div role="dialog" aria-label="Встановити на телефон" className="vk-sheet fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 rounded-2xl border border-border-hairline bg-bg-surface p-4 shadow-2xl md:hidden">
      <div className="flex items-start gap-3">
        <img src="/admin/icon-192.png" alt="" width={40} height={40} className="rounded-xl" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div className="min-w-0 flex-1">
          <p className="text-body font-semibold text-text-primary">Вівчарик на екрані телефона</p>
          {prompt ? <p className="text-body-sm text-text-muted">Панель відкриватиметься одним дотиком, як звичайна програма.</p> : (
            <ol className="mt-1 flex flex-col gap-1 text-body-sm text-text-body">
              <li className="flex items-center gap-1.5">1. Унизу Safari натисніть <Share size={16} className="text-info" aria-label="Поділитися" /> «Поділитися»</li>
              <li className="flex items-center gap-1.5">2. Оберіть <SquarePlus size={16} aria-hidden="true" /> «На екран Додому»</li>
              <li>3. Натисніть «Додати»</li>
            </ol>
          )}
        </div>
        <button type="button" onClick={close} aria-label="Закрити" className="-m-1 rounded-full p-2 text-text-muted hover:bg-bg-alt"><X size={18} /></button>
      </div>
      {prompt && <button type="button" onClick={async () => { await prompt.prompt(); close(); }} className="mt-3 min-h-12 w-full rounded-lg bg-accent text-body-sm font-semibold text-white">Встановити</button>}
    </div>
  );
}
