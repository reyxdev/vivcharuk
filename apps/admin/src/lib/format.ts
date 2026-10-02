export const uah = (minor: number | null | undefined) =>
  minor === null || minor === undefined ? '—' : `${new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 0 }).format(Math.round(minor / 100))} ₴`;

export const dateTime = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const time = d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === today.toDateString()) return `Сьогодні ${time}`;
  return `${d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })} ${time}`;
};

export const date = (iso: string) => new Date(iso).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' });

export const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Нове', CONFIRMED: 'Підтверджене', IN_PRODUCTION: 'Виготовляється', PACKING: 'Пакується',
  SHIPPED: 'Відправлене', DELIVERED: 'Отримане', CANCELLED: 'Скасоване', RETURNED: 'Повернене',
};

export const PAYMENT_LABEL: Record<string, string> = {
  CARD: 'Картка', COD_INSPECTION: 'Наложений платіж', PREPAYMENT: 'Передоплата', IBAN: 'Рахунок IBAN',
};
