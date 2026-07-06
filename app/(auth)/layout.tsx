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
      <aside className="relative flex flex-col justify-between overflow-hidden border-b border-credicus-line-subtle bg-gradient-to-br from-credicus-yellow-soft via-white to-credicus-primary-soft px-6 py-8 sm:px-10 lg:w-[44%] lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-credicus-yellow/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-credicus-yellow/10 blur-3xl" />

        <div className="ui-site-chrome -mx-6 mb-8 px-6 py-6 sm:-mx-10 sm:px-10 lg:-mx-12 lg:-mt-12 lg:px-12 lg:pt-12">
          <Logo size="lg" href="/" />
        </div>

        <div className="relative space-y-10">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-credicus-ink-muted">
              Credicus Business
            </p>
            <h1 className="text-2xl font-bold leading-tight text-credicus-ink sm:text-4xl">
              Hire smarter with{" "}
              <span className="text-credicus-yellow">Credicus Business</span>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-credicus-ink-secondary sm:text-base">
              Sign in to access your recruitment dashboard, track performance, and move candidates through your hiring
              funnel faster.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-credicus-line-subtle bg-white px-3 py-3 shadow-sm transition hover:border-credicus-yellow/50"
              >
                <p className="text-lg font-bold text-credicus-yellow sm:text-xl">{stat.value}</p>
                <p className="text-[11px] text-credicus-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <ul className="space-y-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-xl border border-credicus-line-subtle bg-white p-3 shadow-sm transition hover:border-credicus-yellow/40"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-credicus-yellow-soft text-credicus-yellow">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-credicus-ink">{item.title}</p>
                    <p className="text-xs text-credicus-ink-secondary">{item.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative mt-8 text-xs text-credicus-ink-muted">
          Need help?{" "}
          <Link href="/contact" className="font-medium text-credicus-ink transition hover:text-credicus-yellow">
            Contact our team
          </Link>
        </p>
      </aside>

      <main
        id="main-content"
        className="relative flex flex-1 items-center justify-center overflow-hidden bg-credicus-chrome px-6 py-10 sm:px-10"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-credicus-yellow/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-credicus-yellow/10 blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="animate-scale-in rounded-2xl border border-credicus-line-subtle bg-white p-8 shadow-lg sm:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
