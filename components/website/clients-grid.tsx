"use client";

import { Building2 } from "lucide-react";

const clients = ["FinEdge", "NorthBridge", "ScaleLabs", "BluePeak", "TalentSpring"];

export default function ClientsGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {clients.map((client, index) => (
        <div
          key={client}
          style={{ animationDelay: `${index * 60}ms` }}
          className="ui-card-interactive group flex flex-col items-center gap-2 px-4 py-5 text-center opacity-0 animate-fade-in-up"
        >
          <Building2 className="h-6 w-6 text-credicus-yellow transition-transform duration-300 group-hover:scale-125" />
          <span className="text-sm font-semibold text-credicus-gray transition-colors group-hover:text-gray-900">
            {client}
          </span>
        </div>
      ))}
    </div>
  );
}
