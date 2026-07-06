export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-credicus-surface">
      <div className="hidden w-64 shrink-0 border-r border-credicus-line-default bg-white lg:block">
        <div className="space-y-4 p-4">
          <div className="ui-skeleton h-8 w-24" />
          <div className="ui-skeleton h-10 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="ui-skeleton h-10 w-full" />
          ))}
        </div>
      </div>
      <div className="flex-1">
        <div className="ui-skeleton h-14 w-full border-b border-credicus-line-default" />
        <div className="space-y-4 p-6">
          <div className="ui-skeleton h-8 w-48" />
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="ui-skeleton h-24 rounded-xl" />
            ))}
          </div>
          <div className="ui-skeleton h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
