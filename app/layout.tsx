import "./globals.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import AppProviders from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: "Credicus Business | Recruitment CRM & Hiring Partner",
  description: "Credicus helps ambitious companies hire the right talent with a modern recruitment CRM.",
  icons: {
    icon: "/images/credicus-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
