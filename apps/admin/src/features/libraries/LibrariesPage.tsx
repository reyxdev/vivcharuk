import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, ChevronRight, Palette, Plus } from 'lucide-react';
import { api, ApiError, post } from '@/lib/api';
import { messageFor } from '@/lib/messages';
import { useMe } from '@/features/auth/useSession';
import { EmptyState, GhostButton, PageHeader, PrimaryButton, Sheet, SkeletonRows, Tabs, useConfirm, useStored, useToast } from '@/components/ui';
import { TEMPLATE_LABEL } from '@/features/products/api';
import { inputCls, labelCls } from '@/features/products/parts';

// «Кольори й матеріали» (37 §37.3, round 20 #233): simple lists — a colour circle, the name, how many
// products use it, «Додати». One source of truth each: a change applies everywhere; what is in use is
// hidden, never deleted.

interface Value {
  id: string; key: string; label: string; hex: string | null; colorFamily: string | null; isNaturalUndyed: boolean;
  dimensions: { widthCm?: number; lengthCm?: number; insoleCm?: number } | null; isHidden: boolean; products: number;
}
interface Material { id: string; name: string; group: string; isHidden: boolean; products: number }
interface Libs { sizes: Record<string, Value[]>; colors: Value[]; patterns: Value[]; materials: Material[]; colorFamilies: string[]; materialGroups: string[] }
type Tab = 'colors' | 'materials' | 'sizes' | 'patterns';
type Kind = 'color' | 'pattern' | 'size';
type Editing = { kind: Kind; value?: Value; templateKey?: string } | { kind: 'material'; value?: Material };

const errText = (e: unknown) => (e instanceof ApiError && e.body?.error.message === 'IN_USE_HIDE_INSTEAD' ? 'Це вже є в товарах — можна лише приховати'
  : e instanceof ApiError && e.body?.error.message === 'ALREADY_EXISTS' ? 'Таке вже є в списку' : messageFor(e instanceof ApiError ? e.code : ''));

function Row({ label, hex, sub, hidden, onOpen, onMove }: { label: string; hex?: string | null; sub: string; hidden: boolean; onOpen: () => void; onMove?: (dir: 'up' | 'down') => void }) {
  return (
    <li className={`flex items-center gap-2 pr-2 ${hidden ? 'opacity-50' : ''}`}>
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 px-4 py-2.5 text-left hover:bg-bg-page">
        {hex !== undefined && <span className="size-7 shrink-0 rounded-full border border-border-control" style={{ background: hex ?? 'var(--bg-alt)' }} aria-hidden="true" />}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body text-text-primary">{label}</span>
          <span className="truncate text-caption text-text-muted">{sub}{hidden ? ' · приховано' : ''}</span>
        </span>
        <ChevronRight size={18} className="text-text-faint" />
      </button>
      {onMove && (
        <span className="flex flex-col">
          <button type="button" onClick={() => onMove('up')} aria-label="Вище" className="rounded p-0.5 text-text-faint hover:bg-bg-alt hover:text-text-primary"><ArrowUp size={14} /></button>
          <button type="button" onClick={() => onMove('down')} aria-label="Нижче" className="rounded p-0.5 text-text-faint hover:bg-bg-alt hover:text-text-primary"><ArrowDown size={14} /></button>
        </span>
      )}
    </li>
  );
}

const used = (n: number) => (n ? `у ${n} товарах` : 'не використовується');

function ValueSheet({ e, libs, onClose, run }: { e: Editing; libs: Libs; onClose: () => void; run: (fn: () => Promise<unknown>, ok: string) => Promise<boolean> }) {
  const confirm = useConfirm();
  const v = e.value;
  const isMat = e.kind === 'material';
  const val = !isMat ? (v as Value | undefined) : undefined;
  const mat = isMat ? (v as Material | undefined) : undefined;
  const [label, setLabel] = useState(val?.label ?? mat?.name ?? '');
  const [hex, setHex] = useState(val?.hex ?? '#C8B89A');
  const [family, setFamily] = useState(val?.colorFamily ?? '');
  const [natural, setNatural] = useState(val?.isNaturalUndyed ?? false);
  const [group, setGroup] = useState(mat?.group ?? libs.materialGroups[0] ?? 'вовна');
  const [w, setW] = useState(val?.dimensions?.widthCm?.toString() ?? '');
  const [l, setL] = useState(val?.dimensions?.lengthCm?.toString() ?? '');
  const tpl = e.kind === 'size' ? e.templateKey ?? '' : '';
  const dims = w || l ? { ...(w ? { widthCm: Number(w) } : {}), ...(l ? { lengthCm: Number(l) } : {}) } : null;
  const title = isMat ? 'Матеріал' : e.kind === 'color' ? 'Колір' : e.kind === 'pattern' ? 'Візерунок' : `Розмір · ${TEMPLATE_LABEL[tpl] ?? tpl}`;

  const save = async () => {
    const ok = await run(async () => {
      if (isMat) {
        if (mat) await api(`/admin/libraries/materials/${mat.id}`, { method: 'PATCH', body: JSON.stringify({ name: label.trim(), group }) });
        else await post('/admin/libraries/materials', { name: label.trim(), group });
        return;
      }
      const body = { label: label.trim(), ...(e.kind === 'color' ? { hex: hex.toUpperCase(), colorFamily: family || null, isNaturalUndyed: natural } : {}), ...(e.kind === 'size' ? { dimensions: dims } : {}) };
      if (val) await api(`/admin/libraries/values/${val.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      else await post('/admin/libraries/values', { type: e.kind, ...(e.kind === 'size' ? { templateKey: tpl } : {}), ...body });
    }, 'Збережено');
    if (ok) onClose();
  };
  const hide = async () => {
    const ok = await run(() => api(isMat ? `/admin/libraries/materials/${v!.id}` : `/admin/libraries/values/${v!.id}`, { method: 'PATCH', body: JSON.stringify({ isHidden: !v!.isHidden }) }), v!.isHidden ? 'Знову в списку' : 'Приховано');
    if (ok) onClose();
  };
  const remove = async () => {
    if (!(await confirm({ title: `Видалити «${label}»?`, ok: 'Видалити', danger: true }))) return;
    if (await run(() => api(`/admin/libraries/values/${v!.id}`, { method: 'DELETE' }), 'Видалено')) onClose();
  };

  return (
    <Sheet title={v ? title : `${title}: новий`} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div className="flex items-end gap-3">
          {e.kind === 'color' && <input type="color" value={hex} onChange={(x) => setHex(x.target.value)} aria-label="Колір" className="size-11 shrink-0 rounded-full border border-border-control bg-transparent" />}
          <label className={`${labelCls} flex-1`}>Назва<input autoFocus value={label} onChange={(x) => setLabel(x.target.value)} placeholder={e.kind === 'size' ? '150×200 см' : e.kind === 'color' ? 'Сірий' : ''} className={inputCls} /></label>
        </div>
        {e.kind === 'color' && (
          <>
            <label className={labelCls}>Група кольорів для фільтра на сайті
              <select value={family} onChange={(x) => setFamily(x.target.value)} className={inputCls}><option value="">—</option>{libs.colorFamilies.map((f) => <option key={f} value={f}>{f}</option>)}</select>
            </label>
            <label className="flex items-center gap-2 text-body-sm text-text-primary"><input type="checkbox" className="size-5 accent-[var(--accent)]" checked={natural} onChange={(x) => setNatural(x.target.checked)} />Натуральний колір вовни, без фарбування</label>
          </>
        )}
        {e.kind === 'size' && (tpl === 'lizhnyk' || tpl === 'podushka' || tpl === 'poias') && (
          <div className="grid grid-cols-2 gap-3">
            {tpl !== 'poias' && <label className={labelCls}>Ширина, см<input inputMode="numeric" value={w} onChange={(x) => setW(x.target.value.replace(/\D/g, ''))} className={inputCls} /></label>}
            <label className={labelCls}>Довжина, см<input inputMode="numeric" value={l} onChange={(x) => setL(x.target.value.replace(/\D/g, ''))} className={inputCls} /></label>
          </div>
        )}
        {isMat && (
          <label className={labelCls}>Група<select value={group} onChange={(x) => setGroup(x.target.value)} className={inputCls}>{libs.materialGroups.map((g) => <option key={g} value={g}>{g}</option>)}</select></label>
        )}
        {v && <p className="text-caption text-text-muted">{used(v.products)}{v.products ? ' — зміна назви чи кольору діє в усіх.' : ''}</p>}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {v && <GhostButton onClick={() => void hide()}>{v.isHidden ? 'Показати' : 'Приховати'}</GhostButton>}
          {v && !isMat && v.products === 0 && <button type="button" onClick={() => void remove()} className="min-h-10 rounded-lg px-3 text-body-sm text-danger hover:bg-danger/10">Видалити</button>}
          <span className="flex-1" />
          <PrimaryButton disabled={label.trim().length < (isMat ? 2 : 1)} onClick={() => void save()}>{v ? 'Зберегти' : 'Додати'}</PrimaryButton>
        </div>
      </div>
    </Sheet>
  );
}

export function LibrariesPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const { data: me } = useMe();
  const canEdit = !!me?.permissions.includes('libraries.manage');
  const { data: libs } = useQuery({ queryKey: ['libraries'], queryFn: () => api<Libs>('/admin/libraries') });
  const [tab, setTab] = useStored<Tab>('libraries.tab', 'colors');
  const [editing, setEditing] = useState<Editing | null>(null);
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try { await fn(); await Promise.all([qc.invalidateQueries({ queryKey: ['libraries'] }), qc.invalidateQueries({ queryKey: ['product-libraries'] })]); toast(ok); return true; }
    catch (e) { toast(errText(e), 'error'); return false; }
  };
  const move = (id: string, dir: 'up' | 'down') => void run(() => api(`/admin/libraries/values/${id}`, { method: 'PATCH', body: JSON.stringify({ move: dir }) }), 'Порядок змінено');
  const open = (x: Editing) => canEdit && setEditing(x);

  const list = (kind: 'color' | 'pattern', values: Value[]) => (
    values.length ? (
      <ul className="flex flex-col divide-y divide-border-hairline overflow-hidden rounded-xl border border-border-hairline bg-bg-surface">
        {values.map((v) => <Row key={v.id} label={v.label} hex={kind === 'color' ? v.hex : undefined} sub={[v.colorFamily, used(v.products)].filter(Boolean).join(' · ')} hidden={v.isHidden} onOpen={() => open({ kind, value: v })} onMove={canEdit ? (d) => move(v.id, d) : undefined} />)}
      </ul>
    ) : <EmptyState icon={Palette} text="Список порожній." />
  );

  return (
    <div className="flex flex-col gap-3">
      <PageHeader title="Кольори й матеріали" actions={canEdit && tab !== 'sizes' && (
        <PrimaryButton icon={Plus} onClick={() => setEditing(tab === 'materials' ? { kind: 'material' } : { kind: tab === 'colors' ? 'color' : 'pattern' })}>Додати</PrimaryButton>
      )} />
      <Tabs tabs={[{ key: 'colors' as Tab, label: 'Кольори' }, { key: 'materials' as Tab, label: 'Матеріали' }, { key: 'sizes' as Tab, label: 'Розміри' }, { key: 'patterns' as Tab, label: 'Візерунки' }]} value={tab} onChange={setTab} />
      {!libs ? <SkeletonRows /> : (
        <>
          {tab === 'colors' && list('color', libs.colors)}
          {tab === 'patterns' && list('pattern', libs.patterns)}
          {tab === 'materials' && (
            <ul className="flex flex-col divide-y divide-border-hairline overflow-hidden rounded-xl border border-border-hairline bg-bg-surface">
              {libs.materials.map((m) => <Row key={m.id} label={m.name} sub={`${m.group} · ${used(m.products)}`} hidden={m.isHidden} onOpen={() => open({ kind: 'material', value: m })} />)}
            </ul>
          )}
          {tab === 'sizes' && Object.entries(libs.sizes).map(([tpl, values]) => (
            <section key={tpl} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h2 className="flex-1 text-h4 font-semibold text-text-primary">{TEMPLATE_LABEL[tpl] ?? tpl}</h2>
                {canEdit && <GhostButton icon={Plus} onClick={() => setEditing({ kind: 'size', templateKey: tpl })}>Додати</GhostButton>}
              </div>
              {values.length ? (
                <ul className="flex flex-col divide-y divide-border-hairline overflow-hidden rounded-xl border border-border-hairline bg-bg-surface">
                  {values.map((v) => <Row key={v.id} label={v.label} sub={used(v.products)} hidden={v.isHidden} onOpen={() => open({ kind: 'size', value: v, templateKey: tpl })} onMove={canEdit ? (d) => move(v.id, d) : undefined} />)}
                </ul>
              ) : <p className="text-body-sm text-text-muted">Розмірів ще немає.</p>}
            </section>
          ))}
        </>
      )}
      {editing && libs && <ValueSheet e={editing} libs={libs} onClose={() => setEditing(null)} run={run} />}
    </div>
  );
}
