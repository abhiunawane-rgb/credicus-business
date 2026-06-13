import Link from "next/link";
import Logo from "@/components/brand/logo";
import Container from "@/components/container";

export default function SiteFooter() {
  return (
    <footer className="border-t border-credicus-border bg-credicus-black">
      <Container>
        <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Logo size="sm" href="/" />
            <p className="max-w-sm text-sm text-credicus-gray">
              Recruitment CRM and growth partner for ambitious hiring teams.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-credicus-gray-light">
            <Link href="/about" className="transition hover:text-credicus-yellow">
              About
            </Link>
            <Link href="/services" className="transition hover:text-credicus-yellow">
              Services
            </Link>
            <Link href="/clients" className="transition hover:text-credicus-yellow">
              Clients
            </Link>
            <Link href="/contact" className="transition hover:text-credicus-yellow">
              Contact
            </Link>
            <Link href="/sign-in" className="transition hover:text-credicus-yellow">
              Login
            </Link>
          </div>
        </div>
        <div className="border-t border-credicus-border py-4 text-xs text-credicus-gray">
          © {new Date().getFullYear()} Credicus. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
