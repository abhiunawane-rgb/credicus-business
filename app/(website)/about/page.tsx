import { Award, Globe, HeartHandshake, TrendingUp, Users } from "lucide-react";
import Container from "@/components/container";
import IconBadge from "@/components/ui/icon-badge";

const stats = [
  { value: "10+", label: "Years in recruitment consulting", icon: Award },
  { value: "2500+", label: "Successful candidate placements", icon: Users },
  { value: "200+", label: "Client organizations supported", icon: Globe },
];

const values = [
  {
    icon: HeartHandshake,
    title: "Relationship-first",
    description: "We build long-term partnerships with clients and candidates alike.",
  },
  {
    icon: TrendingUp,
    title: "Data-driven",
    description: "CRM insights help you hire faster with measurable outcomes.",
  },
  {
    icon: Award,
    title: "Quality-focused",
    description: "Every placement is vetted for skills, culture fit, and retention.",
  },
];

export default function AboutPage() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="ui-section-header">
            <p className="ui-kicker">About Credicus</p>
          </div>
          <h1 className="ui-page-title">We help businesses scale with exceptional talent.</h1>
          <p className="ui-page-subtitle">
            Credicus is a recruitment-focused team that blends market insight, process rigor, and
            relationship-driven hiring to connect organizations with top candidates.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="ui-card-interactive p-6 text-center">
              <IconBadge icon={stat.icon} variant="light" size="lg" className="mx-auto mb-4" />
              <p className="text-3xl font-bold text-credicus-yellow">{stat.value}</p>
              <p className="mt-2 text-sm text-credicus-gray">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <h2 className="mb-8 text-center text-2xl font-semibold text-gray-900">What drives us</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {values.map((item) => (
              <div key={item.title} className="ui-card-interactive p-6">
                <IconBadge icon={item.icon} variant="light" className="mb-4" />
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-credicus-gray">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
