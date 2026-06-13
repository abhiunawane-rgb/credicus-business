"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import Logo from "@/components/brand/logo";
import Container from "@/components/container";
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/clients", label: "Clients" },
  { href: "/contact", label: "Contact" },
];

export default function SiteNavbar() {
  const pathname = usePathname();
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-credicus-border bg-credicus-black/95 shadow-brand backdrop-blur-md">
      <Container>
        <div className="flex min-h-16 items-center justify-between gap-3 py-3">
          <Logo size="md" />

          <nav aria-label="Primary" className="hidden items-center gap-1 text-sm font-medium md:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`ui-nav-link ${active ? "ui-nav-link-active" : "text-credicus-gray-light"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/sign-in" className="ui-button-primary hidden shrink-0 sm:inline-flex">
              Sign in
            </Link>
            <button
              type="button"
              className="inline-flex min-h-[var(--touch-min)] min-w-[var(--touch-min)] items-center justify-center rounded-md border border-credicus-border text-credicus-gray-light transition hover:border-credicus-yellow hover:text-credicus-yellow md:hidden"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </Container>

      {menuOpen ? (
        <div className="fixed inset-0 top-16 z-30 md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu overlay"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id={menuId}
            aria-label="Mobile primary"
            className="relative border-t border-credicus-border bg-credicus-black px-4 py-4 shadow-brand-lg animate-dropdown-in"
          >
            <ul className="space-y-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-[var(--touch-comfortable)] items-center rounded-lg px-4 text-base font-medium transition ${
                        active
                          ? "bg-credicus-yellow/15 text-credicus-yellow"
                          : "text-credicus-gray-light hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 border-t border-credicus-border pt-4">
              <Link href="/sign-in" className="ui-button-primary w-full">
                Sign in to workspace
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
