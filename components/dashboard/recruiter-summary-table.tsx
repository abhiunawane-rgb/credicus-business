import { Users } from "lucide-react";

const recruiterRows = [
  { name: "Rahul", created: 10, interviews: 10, confirmed: 10, selections: 10, joinings: 10 },
  { name: "Mahesh", created: 15, interviews: 15, confirmed: 14, selections: 15, joinings: 15 },
  { name: "Rajesh", created: 20, interviews: 20, confirmed: 18, selections: 20, joinings: 20 },
  { name: "Aisha Khan", created: 12, interviews: 11, confirmed: 9, selections: 8, joinings: 5 },
];

export default function RecruiterSummaryTable() {
  return (
    <div className="ui-card-dark overflow-x-auto p-4">
      <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Users className="h-5 w-5 text-credicus-yellow" />
        Today Summary — Recruiter-wise
      </h4>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-credicus-border text-credicus-gray">
            <th className="px-3 py-2 text-left">Recruiter</th>
            <th className="px-3 py-2 text-left">Candidates Created</th>
            <th className="px-3 py-2 text-left">Interviews</th>
            <th className="px-3 py-2 text-left">Confirmed</th>
            <th className="px-3 py-2 text-left">Selections (Month)</th>
            <th className="px-3 py-2 text-left">Joinings (Month)</th>
          </tr>
        </thead>
        <tbody>
          {recruiterRows.map((row) => (
            <tr key={row.name} className="border-b border-credicus-border/60 transition-colors duration-200 hover:bg-credicus-yellow/5">
              <td className="px-3 py-3 font-medium text-white">{row.name}</td>
              <td className="px-3 py-3 text-credicus-gray-light">{row.created}</td>
              <td className="px-3 py-3 text-credicus-gray-light">{row.interviews}</td>
              <td className="px-3 py-3 text-credicus-gray-light">{row.confirmed}</td>
              <td className="px-3 py-3 text-credicus-yellow">{row.selections}</td>
              <td className="px-3 py-3 text-credicus-yellow">{row.joinings}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
