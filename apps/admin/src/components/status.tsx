import { CircleDot, PhoneCall, Hammer, Package, Truck, CircleCheck, X, Undo2, type LucideIcon } from 'lucide-react';

// Round 20 #41, #106: a coloured badge with an icon and the word; in phone lists the icon and colour
// only (#248). Colours are mid-tones that read on light and dark; the word stays in the text colour.
export const ORDER_STATUS: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  PENDING: { label: 'Нове', icon: CircleDot, color: '#5A8AAF' },
  CONFIRMED: { label: 'Підтверджене', icon: PhoneCall, color: '#3C8A65' },
  IN_PRODUCTION: { label: 'Виготовляється', icon: Hammer, color: '#8E76A8' },
  PACKING: { label: 'Пакується', icon: Package, color: '#B08D4F' },
  SHIPPED: { label: 'Відправлене', icon: Truck, color: '#5A8AAF' },
  DELIVERED: { label: 'Отримане', icon: CircleCheck, color: '#3C8A65' },
  CANCELLED: { label: 'Скасоване', icon: X, color: '#C0533F' },
  RETURNED: { label: 'Повернене', icon: Undo2, color: '#C77D58' },
};

export function Badge({ label, icon: Icon, color, compact = false }: { label: string; icon?: LucideIcon; color: string; compact?: boolean }) {
  return (
    <span title={label} className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-caption font-medium text-text-primary" style={{ background: `${color}22` }}>
      {Icon && <Icon size={13} color={color} strokeWidth={2.25} aria-hidden="true" />}
      <span className={compact ? 'max-md:sr-only' : ''}>{label}</span>
    </span>
  );
}

export function OrderStatus({ status, compact }: { status: string; compact?: boolean }) {
  const s = ORDER_STATUS[status] ?? { label: status, icon: CircleDot, color: '#7B776E' };
  return <Badge label={s.label} icon={s.icon} color={s.color} compact={compact} />;
}
