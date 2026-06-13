import type { LucideIcon } from "lucide-react";

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type ProcessStepsProps = {
  steps: Step[];
  dark?: boolean;
};

export default function ProcessSteps({ steps, dark = false }: ProcessStepsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div
            key={step.title}
            style={{ animationDelay: `${index * 100}ms` }}
            className={`group relative h-full overflow-hidden rounded-xl border p-5 opacity-0 animate-fade-in-up transition-all duration-300 hover:-translate-y-1 hover:border-credicus-yellow/50 hover:shadow-glow ${
              dark ? "border-credicus-border bg-credicus-card" : "ui-card"
            }`}
          >
            <div className="pointer-events-none absolute inset-0 ui-shimmer opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative mb-4 flex items-center gap-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                  dark ? "bg-credicus-yellow/15 text-credicus-yellow" : "bg-credicus-yellow/10 text-credicus-black"
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-credicus-yellow">Step {index + 1}</span>
            </div>
            <h3 className={`relative font-semibold ${dark ? "text-white" : "text-gray-900"}`}>{step.title}</h3>
            <p className={`relative mt-2 text-sm ${dark ? "text-credicus-gray-light" : "text-credicus-gray"}`}>
              {step.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
