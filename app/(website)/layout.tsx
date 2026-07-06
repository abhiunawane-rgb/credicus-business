import type { ReactNode } from "react";
import SiteFooter from "@/components/site-footer";
import SiteNavbar from "@/components/site-navbar";

type WebsiteLayoutProps = {
  children: ReactNode;
};

export default function WebsiteLayout({ children }: WebsiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-credicus-chrome">
      <SiteNavbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
