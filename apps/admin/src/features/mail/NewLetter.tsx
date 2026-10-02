import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import type { MailSettings } from './api';
import { Composer } from './Composer';

// D34 «Новий лист»: full screen on the phone, a sheet on the computer. Opened by `?compose=` in the
// address, so the phone's «Назад» closes it like any other screen. Closing with something written asks
// first, inline (the panel's «Ви впевнені?» is itself a history entry and would fight the address).
export function NewLetter({ to, settings, onClose, onSent }: { to: string; settings: MailSettings | undefined; onClose: () => void; onSent: (threadId: string) => void }) {
  const dirty = useRef(false);
  const [asking, setAsking] = useState(false);
  const close = () => (dirty.current ? setAsking(true) : onClose());
  const keys = useRef({ close, asking });
  keys.current = { close, asking };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { if (keys.current.asking) setAsking(false); else keys.current.close(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-[55] flex justify-center bg-bg-page md:items-center md:bg-black/40 md:p-4">
      <div role="dialog" aria-modal="true" aria-label="Новий лист"
        className="flex w-full flex-col overflow-y-auto p-3 pt-[env(safe-area-inset-top)] pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:max-h-[90dvh] md:max-w-2xl md:rounded-2xl md:bg-bg-surface md:p-5 md:shadow-2xl">
        <div className="-mx-3 mb-2 flex items-center gap-1 border-b border-border-hairline px-1 md:mx-0 md:mb-3 md:border-0 md:px-0">
          <button type="button" onClick={close} aria-label="Назад" className="p-3 md:hidden"><ArrowLeft size={22} /></button>
          <h2 className="min-w-0 flex-1 truncate text-body font-semibold text-text-primary md:text-h3">Новий лист</h2>
          <button type="button" onClick={close} aria-label="Закрити" className="-m-2 rounded-full p-2 text-text-muted hover:bg-bg-alt max-md:hidden"><X size={20} /></button>
        </div>
        {asking && (
          <div role="alertdialog" aria-label="Закрити без надсилання?" className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-warning bg-bg-surface p-3 text-body-sm">
            <span className="min-w-0 flex-1 text-text-primary">Лист не надіслано. Закрити й втратити написане?</span>
            <button type="button" onClick={() => setAsking(false)} autoFocus className="min-h-10 rounded-lg border border-border-control px-3 font-medium max-md:min-h-11">Писати далі</button>
            <button type="button" onClick={onClose} className="min-h-10 rounded-lg bg-danger px-3 font-semibold text-white max-md:min-h-11">Закрити</button>
          </div>
        )}
        <Composer initial="" settings={settings} mode={{ kind: 'new', to }} onDirty={(d) => { dirty.current = d; }} onCancel={close}
          onSent={(id) => { if (id) onSent(id); }} />
        <p className="mt-2 text-caption text-text-muted">Лист піде від info@vivcharuk.com з вашим підписом, копія — у «Надісланих» скриньки.</p>
      </div>
    </div>
  );
}
