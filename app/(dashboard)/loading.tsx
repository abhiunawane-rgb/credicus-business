export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-800" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-lg border border-slate-800 bg-slate-900" />
          ))}
        </div>
      </div>
    </div>
  );
}
