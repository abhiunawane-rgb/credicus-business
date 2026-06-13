import type { ReactNode } from "react";
import Link from "next/link";
import { BarChart3, Database, LayoutDashboard, type LucideIcon } from "lucide-react";
import Logo from "@/components/brand/logo";

type AuthLayoutProps = {
  children: ReactNode;
};

const highlights: Array<{ icon: LucideIcon; title: string; detail: string }> = [
  { icon: Database, title: "Candidate CRM", detail: "Track every lead from first touch to joining" },
  { icon: LayoutDashboard, title: "Role dashboards", detail: "Recruiter, team leader, and admin views" },
  { icon: BarChart3, title: "Bulk operations", detail: "Excel import, resume uploads, and exports" },
];

const stats = [
  { value: "2.5K+", label: "Placements" },
  { value: "200+", label: "Clients" },
  { value: "10+", label: "Years" },
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-credicus-black px-6 py-8 text-white sm:px-10 lg:w-[44%] lg:px-12 lg:py-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-credicus-yellow/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-credicus-yellow/5 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full border border-credicus-yellow/10" />

        <div className="relative space-y-10">
          <Logo size="lg" href="/" />
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-credicus-yellow">
              Recruitment workspace
            </p>
            <h1 className="text-2xl font-bold leading-tight sm:text-4xl">
              Hire smarter with{" "}
              <span className="bg-gradient-to-r from-credicus-yellow to-credicus-yellow-hover bg-clip-text text-transparent">
                Credicus CRM
              </span>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-credicus-gray-light sm:text-base">
              Sign in to access your recruitment dashboard, track performance, and move candidates
              through your hiring funnel faster.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-credicus-border bg-white/5 px-3 py-3 backdrop-blur-sm transition hover:border-credicus-yellow/30"
              >
                <p className="text-lg font-bold text-credicus-yellow sm:text-xl">{stat.value}</p>
                <p className="text-[11px] text-credicus-gray-light">{stat.label}</p>
              </div>
            ))}
          </div>

          <ul className="space-y-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-lg border border-credicus-border/60 bg-white/5 p-3 transition hover:border-credicus-yellow/30 hover:bg-white/10"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-credicus-yellow/15 text-credicus-yellow">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-credicus-gray-light">{item.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative mt-8 text-xs text-credicus-gray">
          Need help?{" "}
          <Link href="/contact" className="text-credicus-yellow transition hover:underline">
            Contact our team
          </Link>
        </p>
      </aside>

      <main
        id="main-content"
        className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-credicus-yellow-muted/20 px-6 py-10 sm:px-10"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-credicus-yellow/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-credicus-yellow/5 blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="animate-scale-in rounded-2xl border border-gray-200/80 bg-white/90 p-8 shadow-brand-lg backdrop-blur-sm transition-all duration-300 hover:border-credicus-yellow/30 hover:shadow-glow-lg sm:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
