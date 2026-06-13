import Link from "next/link";
import { ArrowRight, Clock, FileSpreadsheet, Handshake, Sparkles } from "lucide-react";
import Container from "@/components/container";
import HiringFunnel from "@/components/illustrations/hiring-funnel";
import { AnimatedReveal } from "@/components/ui/animated-reveal";
import ClientsGrid from "@/components/website/clients-grid";
import HomeHero from "@/components/website/home-hero";
import ProcessSteps from "@/components/website/process-steps";
import ServicesGrid from "@/components/website/services-grid";

const processSteps = [
  { icon: Handshake, title: "Consult", description: "Understand your hiring goals and team needs." },
  { icon: FileSpreadsheet, title: "Source", description: "Build pipelines with CRM-led candidate tracking." },
  { icon: Clock, title: "Screen", description: "Structured interviews and skill-based evaluation." },
  { icon: Sparkles, title: "Place", description: "Close offers faster with data-driven follow-ups." },
];

export default function WebsiteHomePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-credicus-border bg-credicus-black py-16 text-white sm:py-24">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-credicus-yellow/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-credicus-yellow/5 blur-3xl" />
        <Container>
          <HomeHero />
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="mb-10 text-center">
            <p className="ui-kicker">How we work</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900 sm:text-3xl">Your hiring journey in 4 steps</h2>
          </div>
          <ProcessSteps steps={processSteps} />
        </Container>
      </section>

      <section className="border-y border-gray-200 bg-white py-16">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <HiringFunnel />
            <div className="space-y-4">
              <p className="ui-kicker">Pipeline visibility</p>
              <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                See every candidate move through your funnel
              </h2>
              <p className="text-credicus-gray">
                Our CRM gives recruiters, team leaders, and admins a shared view of sourcing,
                screening, interviews, offers, and joinings — all in one place.
              </p>
              <Link href="/sign-in" className="ui-button-primary inline-flex items-center gap-2">
                Try the CRM demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="ui-kicker">Services</p>
              <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">What we offer</h2>
            </div>
            <Link href="/services" className="text-sm font-medium text-credicus-gray transition hover:text-credicus-black">
              View all →
            </Link>
          </div>
          <ServicesGrid />
        </Container>
      </section>

      <section className="border-y border-gray-200 bg-gray-50 py-16">
        <Container>
          <div className="mb-8 text-center">
            <p className="ui-kicker">Clients</p>
            <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Trusted by growing teams</h2>
          </div>
          <ClientsGrid />
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <AnimatedReveal>
            <div className="relative overflow-hidden rounded-2xl bg-credicus-black p-8 shadow-brand-lg transition-all duration-300 hover:shadow-glow-lg sm:p-10">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-pulse-glow rounded-full bg-credicus-yellow/10 blur-2xl" />
              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                    Ready to transform your hiring outcomes?
                  </h2>
                  <p className="mt-3 max-w-xl text-credicus-gray-light">
                    Let us design a recruitment strategy aligned with your business goals.
                  </p>
                </div>
                <Link href="/contact" className="ui-button-primary inline-flex shrink-0 items-center gap-2">
                  Contact us
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </AnimatedReveal>
        </Container>
      </section>
    </div>
  );
}
