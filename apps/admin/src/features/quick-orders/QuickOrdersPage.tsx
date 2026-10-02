import { Navigate } from 'react-router';

// Round 20 #60: «Купити в 1 клік» is a tab inside «Замовлення». Old links (Telegram) land there.
export function QuickOrdersPage() {
  return <Navigate to="/orders?tab=quick" replace />;
}
