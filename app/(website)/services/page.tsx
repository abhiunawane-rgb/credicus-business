import {
  Briefcase,
  ClipboardList,
  Crown,
  Handshake,
  Search,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import Container from "@/components/container";
import IconBadge from "@/components/ui/icon-badge";
import ProcessSteps from "@/components/website/process-steps";

const serviceList = [
  {
    title: "Executive Search",
    description: "Leadership hiring for critical roles that shape business outcomes.",
    icon: Crown,
  },
  {
    title: "Permanent Hiring",
    description: "End-to-end hiring support across technology, sales, operations, and more.",
    icon: Users,
  },
  {
    title: "Contract Staffing",
    description: "Flexible staffing models for rapid project scaling and specialized needs.",
    icon: Briefcase,
  },
  {
    title: "Recruitment Process Advisory",
    description: "Pipeline design, interview frameworks, and optimization for faster closures.",
    icon: ClipboardList,
  },
];

const deliverySteps = [
  { icon: Handshake, title: "Discovery", description: "Map roles, skills, and hiring timelines." },
  { icon: Search, title: "Talent search", description: "Source from networks, referrals, and CRM." },
  { icon: UserCheck, title: "Evaluation", description: "Structured screening and interview loops." },
  { icon: Zap, title: "Closure", description: "Offer management and onboarding support." },
];

export default function ServicesPage() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="space-y-12">
          <div className="max-w-3xl space-y-4">
            <p className="ui-kicker">Services</p>
            <h1 className="ui-page-title">Recruitment solutions built for modern businesses.</h1>
            <p className="ui-page-subtitle">
              From strategic hires to volume growth, our services are designed to align with your
              business stage and hiring velocity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {serviceList.map((service) => (
              <article
                key={service.title}
                className="ui-card-interactive group flex gap-4 p-6"
              >
                <IconBadge icon={service.icon} variant="light" size="lg" className="shrink-0" />
                <div>
                  <h2 className="text-xl font-semibold text-credicus-ink">{service.title}</h2>
                  <p className="mt-2 text-credicus-gray">{service.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div>
            <h2 className="mb-6 text-xl font-semibold text-credicus-ink">Our delivery process</h2>
            <ProcessSteps steps={deliverySteps} />
          </div>
        </div>
      </Container>
    </section>
  );
}
