export function NotBuiltPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-h2 text-text-primary">{title}</h1>
      <p className="text-body text-text-muted">Розділ ще в роботі.</p>
    </div>
  );
}
