import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router';
import './app.css';
import { useMe } from '@/features/auth/useSession';
import { LoginPage } from '@/features/auth/LoginPage';
import { Shell } from '@/components/Shell';
import { UiProvider } from '@/components/ui';
import { MorePage } from '@/features/more/MorePage';
import { CustomerPage } from '@/features/customers/CustomerPage';
import { NewProductWizard } from '@/features/products/NewProductWizard';
import { MediaPage } from '@/features/media/MediaPage';
import { HelpPage } from '@/features/help/HelpPage';
import { AccountPage } from '@/features/account/AccountPage';
import { NewsletterPage } from '@/features/newsletter/NewsletterPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { NotBuiltPage } from '@/features/NotBuiltPage';
import { OrdersPage } from '@/features/orders/OrdersPage';
import { OrderPage } from '@/features/orders/OrderPage';
import { NewOrderPage } from '@/features/orders/NewOrderPage';
import { ProductsPage } from '@/features/products/ProductsPage';
import { ProductEditorPage } from '@/features/products/ProductEditorPage';
import { ReviewsPage } from '@/features/reviews/ReviewsPage';
import { QuickOrdersPage } from '@/features/quick-orders/QuickOrdersPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { LibrariesPage } from '@/features/libraries/LibrariesPage';
import { CategoriesPage } from '@/features/categories/CategoriesPage';
import { AuditPage } from '@/features/audit/AuditPage';
import { EmployeesPage } from '@/features/employees/EmployeesPage';
import { TemplatesPage } from '@/features/templates/TemplatesPage';
import { CustomersPage } from '@/features/customers/CustomersPage';
import { ShopSalePage } from '@/features/stock/ShopSalePage';
import { CollectionsPage } from '@/features/collections/CollectionsPage';
import { BlogPage, PostEditorPage } from '@/features/blog/BlogPage';
import { PromotionsPage } from '@/features/promotions/PromotionsPage';
import { MailPage } from '@/features/mail/MailPage';
import { SetPasswordPage } from '@/features/auth/SetPasswordPage';

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } });

function App() {
  // Invitation and new-password links work without a session (24 §24.8).
  const path = location.pathname.replace(/^\/admin/, '');
  if (path.startsWith('/invite')) return <SetPasswordPage mode="invite" />;
  if (path.startsWith('/reset-password')) return <SetPasswordPage mode="reset" />;
  return <Authed />;
}

function Authed() {
  const { data: me, isPending } = useMe();
  if (isPending) return <div className="grid min-h-dvh place-items-center text-text-muted">Завантаження…</div>;
  if (!me) return <LoginPage />;
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<DashboardPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/new" element={<NewOrderPage />} />
        <Route path="orders/:number" element={<OrderPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<NewProductWizard />} />
        <Route path="products/:id" element={<ProductEditorPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="quick-orders" element={<QuickOrdersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="libraries" element={<LibrariesPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="shop-sale" element={<ShopSalePage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:id" element={<PostEditorPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="mail" element={<MailPage />} />
        <Route path="mail/:id" element={<MailPage />} />
        <Route path="more" element={<MorePage />} />
        <Route path="customers/:id" element={<CustomerPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="newsletter" element={<NewsletterPage />} />
        <Route path="*" element={<NotBuiltPage title="Сторінку не знайдено" />} />
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/admin">
        <UiProvider>
          <App />
        </UiProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
