"use client";

import { Briefcase, Target, Users, type LucideIcon } from "lucide-react";
import IconBadge from "@/components/ui/icon-badge";

const services: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "Executive Search",
    description: "Leadership hiring for roles that shape business outcomes.",
    icon: Target,
  },
  {
    title: "Permanent Hiring",
    description: "End-to-end hiring across tech, sales, and operations.",
    icon: Users,
  },
  {
    title: "Contract Staffing",
    description: "Flexible staffing for rapid scaling and specialized needs.",
    icon: Briefcase,
  },
];

export default function ServicesGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <article
          key={service.title}
          style={{ animationDelay: `${index * 100}ms` }}
          className="ui-card-interactive group p-6 opacity-0 animate-fade-in-up"
        >
          <IconBadge
            icon={service.icon}
            variant="light"
            size="lg"
            className="mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          />
          <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-credicus-black">
            {service.title}
          </h3>
          <p className="mt-2 text-sm text-credicus-gray">{service.description}</p>
        </article>
      ))}
    </div>
  );
}
