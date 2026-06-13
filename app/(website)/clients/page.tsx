import { Building2, Factory, Landmark, Rocket, Store } from "lucide-react";
import Container from "@/components/container";

const clientNames = [
  { name: "FinEdge", icon: Landmark },
  { name: "NorthBridge", icon: Building2 },
  { name: "ScaleLabs", icon: Rocket },
  { name: "BluePeak", icon: Factory },
  { name: "TalentSpring", icon: Store },
  { name: "ClearPoint", icon: Building2 },
  { name: "VisionWorks", icon: Rocket },
  { name: "PrimeOrbit", icon: Landmark },
];

export default function ClientsPage() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <p className="ui-kicker">Clients</p>
            <h1 className="ui-page-title">Trusted by organizations across industries.</h1>
            <p className="ui-page-subtitle">
              We partner with startups, growth-stage ventures, and enterprise teams to build
              dependable talent pipelines.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {clientNames.map((client) => {
              const Icon = client.icon;
              return (
                <div
                  key={client.name}
                  className="ui-card-interactive flex flex-col items-center gap-3 px-4 py-8 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-credicus-yellow/10 text-credicus-yellow">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-semibold text-credicus-gray">{client.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
