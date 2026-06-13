import { Building2 } from "lucide-react";

const clientRows = [
  { client: "Eureka", interviews: 10, confirmed: 10, tomorrow: 8, selections: 10, joinings: 6 },
  { client: "Altruist", interviews: 15, confirmed: 12, tomorrow: 10, selections: 15, joinings: 9 },
  { client: "OPO", interviews: 20, confirmed: 18, tomorrow: 14, selections: 20, joinings: 12 },
  { client: "FinEdge", interviews: 8, confirmed: 7, tomorrow: 5, selections: 6, joinings: 4 },
];

export default function ClientSummaryTable({ title = "Client-wise Summary" }: { title?: string }) {
  return (
    <div className="ui-card-dark overflow-x-auto p-4">
      <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Building2 className="h-5 w-5 text-credicus-yellow" />
        {title}
      </h4>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-credicus-border text-credicus-gray">
            <th className="px-3 py-2 text-left">Client</th>
            <th className="px-3 py-2 text-left">Today Interviews</th>
            <th className="px-3 py-2 text-left">Confirmed</th>
            <th className="px-3 py-2 text-left">Tomorrow</th>
            <th className="px-3 py-2 text-left">Selections (Month)</th>
            <th className="px-3 py-2 text-left">Joinings (Month)</th>
          </tr>
        </thead>
        <tbody>
          {clientRows.map((row) => (
            <tr key={row.client} className="border-b border-credicus-border/60 transition-colors duration-200 hover:bg-credicus-yellow/5">
              <td className="px-3 py-3 font-medium text-white">{row.client}</td>
              <td className="px-3 py-3 text-credicus-gray-light">{row.interviews}</td>
              <td className="px-3 py-3 text-credicus-gray-light">{row.confirmed}</td>
              <td className="px-3 py-3 text-credicus-gray-light">{row.tomorrow}</td>
              <td className="px-3 py-3 text-credicus-yellow">{row.selections}</td>
              <td className="px-3 py-3 text-credicus-yellow">{row.joinings}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
