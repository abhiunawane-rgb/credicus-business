import { Briefcase, ClipboardCheck, Phone, UserCheck, Users } from "lucide-react";

const steps = [
  { icon: Briefcase, label: "Sourcing", value: "1.2K" },
  { icon: Phone, label: "Screening", value: "480" },
  { icon: ClipboardCheck, label: "Interviews", value: "156" },
  { icon: UserCheck, label: "Offers", value: "42" },
  { icon: Users, label: "Joinings", value: "28" },
];

export default function HiringFunnel() {
  return (
    <div className="rounded-2xl border border-credicus-line-subtle bg-white p-6 shadow-md">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-credicus-yellow">Hiring pipeline</p>
      <p className="mb-6 text-lg font-semibold text-credicus-ink">End-to-end recruitment flow</p>
      <div className="space-y-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const width = 100 - index * 14;
          return (
            <div key={step.label} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-credicus-yellow-soft text-credicus-yellow">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-credicus-ink-muted">{step.label}</span>
                  <span className="font-semibold text-credicus-ink">{step.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-credicus-line-subtle">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-credicus-yellow-soft to-credicus-yellow transition-all"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
