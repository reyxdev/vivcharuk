import { Link } from 'react-router';
import { useMe } from '@/features/auth/useSession';
import { MORE_DAILY, MORE_SETUP, type Section } from '@/components/sections';
import { IconCircle, PageHeader } from '@/components/ui';

// Round 20 #57, #143–144, #257: everything beyond the main menu as a grid of icons — daily on top,
// set-up below. On the phone it is its own screen.
function Grid({ items }: { items: Section[] }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {items.map((s) => (
        <Link key={s.to} to={s.to} className="flex flex-col items-center gap-2 rounded-xl border border-border-hairline bg-bg-surface px-2 py-4 text-center text-body-sm text-text-primary hover:bg-bg-alt">
          <IconCircle icon={s.icon} color={s.color} ink={s.ink} size={40} />
          {s.label}
        </Link>
      ))}
    </div>
  );
}

export function MorePage() {
  const { data: me } = useMe();
  const can = (p?: string) => !p || !!me?.permissions.includes(p);
  const setup = MORE_SETUP.filter((s) => can(s.perm));
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Ще" />
      <Grid items={MORE_DAILY.filter((s) => can(s.perm))} />
      {setup.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-caption font-semibold uppercase tracking-wide text-text-muted">Для налаштування</h2>
          <Grid items={setup} />
        </section>
      )}
    </div>
  );
}
