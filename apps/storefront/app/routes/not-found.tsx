import type { Route } from './+types/not-found';
import { redirectOr404 } from '@/lib/api.server';
import { NotFound } from '@/components/layout/NotFound';

export const loader = ({ request }: Route.LoaderArgs) => redirectOr404(request);

export function ErrorBoundary() {
  return <main className="grid min-h-dvh place-items-center bg-bg-page"><NotFound /></main>;
}

export default function NotFound404() {
  return null;
}
