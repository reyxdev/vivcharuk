import { useState } from 'react';
import { Link } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { Ban, MessageSquareText, Phone, PhoneCall, Plus, ShieldAlert } from 'lucide-react';
import { DataTable, type Column } from '@/components/DataTable';
import { CopyButton, EmptyState, Sheet, useConfirm, useToast } from '@/components/ui';
import { dateTime, uah } from '@/lib/format';
import { errText, patchQuick, useQuickOrders, useRefresh, type QuickRow } from './api';
import { contactLinks, prettyPhone } from './shared';

// A request waiting more than an hour turns amber, more than four red (round 9 §P4.1).
const ageClass = (r: QuickRow) => {
  if (r.status !== 'NEW') return 'text-text-muted';
  const h = (Date.now() - new Date(r.createdAt).getTime()) / 3_600_000;
  return h > 4 ? 'text-danger font-semibold' : h > 1 ? 'text-warning font-semibold' : 'text-text-muted';
};

/** «1 клік» (#60, #117–118): phone · product · time · «Подзвонив» · «Створити замовлення». */
export function QuickTab({ can }: { can: (p: string) => boolean }) {
  const { data, isError } = useQuickOrders();
  const refresh = useRefresh();
  const toast = useToast();
  const confirm = useConfirm();
  const [noteFor, setNoteFor] = useState<QuickRow | null>(null);
  const patch = useMutation({
    mutationFn: ({ id, ...b }: { id: string; status?: string; internalNote?: string }) => patchQuick(id, b),
    onSuccess: () => refresh(),
    onError: (e) => toast(errText(e), 'error'),
  });
  const canUpdate = can('orders.update');
  const canCreate = can('orders.create');

  const called = (r: QuickRow) => patch.mutate({ id: r.id, status: 'CALLED' }, { onSuccess: () => toast('Записано: подзвонили') });
  const drop = async (r: QuickRow, status: 'DECLINED' | 'SPAM') => {
    if (!(await confirm({ title: 'Ви впевнені?', text: status === 'SPAM' ? `Запит з ${prettyPhone(r.phone)} — спам. Він зникне зі списку.` : `Покупець з ${prettyPhone(r.phone)} відмовився. Запит зникне зі списку.`, ok: status === 'SPAM' ? 'Це спам' : 'Відмова', danger: true }))) return;
    patch.mutate({ id: r.id, status }, { onSuccess: () => toast('Готово') });
  };

  const product = (r: QuickRow) => r.product
    ? <Link to={`/products/${r.productId}`} onClick={(e) => e.stopPropagation()} className="hover:underline">{r.product.name}{r.product.options ? ` · ${r.product.options}` : ''}{r.quantity > 1 ? ` ×${r.quantity}` : ''}</Link>
    : <span className="text-text-muted">Товар більше не продається</span>;
  const actions = (r: QuickRow) => (
    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
      {canUpdate && r.status === 'NEW' && <button type="button" onClick={() => called(r)} disabled={patch.isPending} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-control px-3 text-body-sm hover:bg-bg-alt max-md:min-h-11"><PhoneCall size={15} /> Подзвонив</button>}
      {canCreate && <Link to={`/orders/new?quick=${r.id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-body-sm font-semibold text-white max-md:min-h-11"><Plus size={15} /> Створити замовлення</Link>}
    </div>
  );

  const columns: Array<Column<QuickRow>> = [
    { key: 'phone', header: 'Телефон', cell: (r) => <span className="inline-flex items-center gap-1 whitespace-nowrap"><a href={contactLinks(r.phone).tel} onClick={(e) => e.stopPropagation()} className="tabular font-medium text-text-primary hover:underline">{prettyPhone(r.phone)}</a><CopyButton value={r.phone} label="телефон" /></span> },
    { key: 'product', header: 'Товар', cell: (r) => <div className="min-w-0">{product(r)}{r.internalNote && <p className="truncate text-caption text-text-muted">{r.internalNote}</p>}</div> },
    { key: 'time', header: 'Час', cell: (r) => <span className={`whitespace-nowrap ${ageClass(r)}`}>{dateTime(r.createdAt)}{r.status === 'CALLED' ? <span className="block text-caption font-normal text-text-muted">подзвонили</span> : null}</span> },
    { key: 'act', header: '', align: 'right', cell: actions },
  ];

  if (isError) return <EmptyState text="Не вдалося завантажити запити. Перевірте зв'язок і оновіть сторінку." />;
  return (
    <>
      <DataTable
        rows={data?.items.map((r) => ({ ...r }))}
        columns={columns}
        empty={<EmptyState icon={Phone} text="Запитів «Купити в 1 клік» немає. Як тільки хтось залишить номер, він з'явиться тут." />}
        actions={(r) => [
          { label: 'Подзвонити', icon: Phone, onClick: () => { window.location.href = contactLinks(r.phone).tel; } },
          { label: 'Нотатка', icon: MessageSquareText, onClick: () => setNoteFor(r), hidden: !canUpdate },
          { label: 'Відмова', icon: Ban, onClick: () => void drop(r, 'DECLINED'), hidden: !canUpdate },
          { label: 'Спам', icon: ShieldAlert, onClick: () => void drop(r, 'SPAM'), danger: true, hidden: !canUpdate || r.status !== 'NEW' },
        ]}
        card={(r) => (
          <div className="flex flex-col gap-1.5 pr-8">
            <div className="flex items-center gap-2">
              <a href={contactLinks(r.phone).tel} onClick={(e) => e.stopPropagation()} className="tabular text-h4 font-semibold text-text-primary">{prettyPhone(r.phone)}</a>
              <span className={`ml-auto text-caption ${ageClass(r)}`}>{dateTime(r.createdAt)}</span>
            </div>
            <p className="text-body-sm text-text-body">{product(r)}{r.product ? <span className="text-text-muted"> · {uah(r.product.priceMinor)}</span> : null}</p>
            {r.internalNote && <p className="text-caption text-text-muted">{r.internalNote}</p>}
            {r.status === 'CALLED' && <p className="text-caption text-text-muted">Подзвонили {r.calledAt ? dateTime(r.calledAt) : ''}</p>}
            <div className="mt-1 [&>div]:justify-start">{actions(r)}</div>
          </div>
        )}
      />
      {noteFor && <NoteSheet row={noteFor} onClose={() => setNoteFor(null)} onSave={(t) => patch.mutate({ id: noteFor.id, internalNote: t }, { onSuccess: () => { toast('Нотатку збережено'); setNoteFor(null); } })} />}
    </>
  );
}

function NoteSheet({ row, onClose, onSave }: { row: QuickRow; onClose: () => void; onSave: (t: string) => void }) {
  const [text, setText] = useState(row.internalNote ?? '');
  return (
    <Sheet title={`Нотатка · ${prettyPhone(row.phone)}`} onClose={onClose}>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} placeholder="Що сказав покупець"
        className="w-full rounded-lg border border-border-control bg-bg-input px-3 py-2 text-body" />
      <div className="mt-3 flex justify-end">
        <button type="button" onClick={() => onSave(text.trim())} className="min-h-11 rounded-lg bg-accent px-4 text-body-sm font-semibold text-white">Зберегти</button>
      </div>
    </Sheet>
  );
}
