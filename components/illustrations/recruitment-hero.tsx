import { BarChart3, Target, TrendingUp, Users } from "lucide-react";

const metrics = [
  { icon: Users, label: "Active candidates", value: "2.5K+" },
  { icon: Target, label: "Placement rate", value: "94%" },
  { icon: TrendingUp, label: "Faster hiring", value: "3×" },
  { icon: BarChart3, label: "Client retention", value: "98%" },
];

export default function RecruitmentHeroVisual() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-credicus-yellow/10 blur-2xl" />
      <div className="relative grid grid-cols-2 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="rounded-xl border border-credicus-border bg-credicus-card/80 p-4 backdrop-blur-sm transition hover:border-credicus-yellow/40"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-credicus-yellow/15 text-credicus-yellow">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-credicus-yellow">{metric.value}</p>
              <p className="mt-1 text-xs text-credicus-gray-light">{metric.label}</p>
            </div>
          );
        })}
      </div>
      <div className="relative mt-3 rounded-xl border border-credicus-yellow/20 bg-gradient-to-r from-credicus-yellow/10 to-transparent px-4 py-3">
        <p className="text-sm font-medium text-white">CRM-powered recruitment</p>
        <p className="text-xs text-credicus-gray-light">Track every candidate from lead to joining</p>
      </div>
    </div>
  );
}
