import Link from "next/link";
import Logo from "@/components/brand/logo";
import Container from "@/components/container";

export default function SiteFooter() {
  return (
    <footer className="ui-site-chrome border-t border-white/10">
      <Container>
        <div className="flex flex-col gap-8 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Logo size="sm" href="/" />
            <p className="max-w-sm text-sm leading-relaxed text-neutral-400">
              Credicus Business — recruitment CRM and growth partner for ambitious hiring teams.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            {[
              { href: "/about", label: "About" },
              { href: "/services", label: "Services" },
              { href: "/clients", label: "Clients" },
              { href: "/contact", label: "Contact" },
              { href: "/sign-in", label: "Login" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-[var(--touch-min)] items-center font-medium text-neutral-300 transition hover:text-credicus-yellow"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-white/10 py-4 text-xs text-neutral-500">
          © {new Date().getFullYear()} Credicus. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
