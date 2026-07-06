"use client";

import { useMemo, useState } from "react";
import {
  Briefcase,
  ChevronDown,
  ChevronUp,
  Filter,
  Grid3x3,
  MapPin,
  Share2,
  Users,
} from "lucide-react";
import CheckboxFilterGroup from "@/components/dashboard/checkbox-filter-group";
import ListFilterBar from "@/components/dashboard/list-filter-bar";
import { vendorJobs, type VendorJob } from "@/lib/vendor-data";
import { matchesSearch } from "@/lib/list-filters";

function JobCard({ job }: { job: VendorJob }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="ui-card overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-credicus-ink">{job.title}</h3>
              {job.isNew ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">New</span>
              ) : null}
            </div>
            <div className="mt-3 grid gap-2 text-sm text-credicus-ink-secondary sm:grid-cols-2">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-credicus-primary" />
                Location: {job.location}
              </span>
              <span className="inline-flex items-center gap-2">
                <Grid3x3 className="h-4 w-4 text-green-600" />
                Process: {job.process}
              </span>
              <span className="inline-flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-orange-500" />
                Sub Process: {job.subProcess}
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-credicus-primary" />
                Qualification: {job.qualification}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="rounded-lg p-2 text-credicus-ink-muted hover:bg-credicus-surface hover:text-credicus-ink-secondary" aria-label="Share">
              <Share2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-lg p-2 text-credicus-ink-muted hover:bg-credicus-surface hover:text-credicus-ink-secondary"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-credicus-primary-light px-3 py-1.5 text-sm font-medium text-credicus-primary">
          <Users className="h-4 w-4" />
          Applied Candidates: {job.appliedCount}
        </p>

        {expanded ? (
          <div className="mt-4 grid gap-2 border-t border-gray-100 pt-4 text-sm text-credicus-ink-secondary sm:grid-cols-2">
            <p><span className="font-medium text-credicus-ink">Department:</span> {job.department}</p>
            <p><span className="font-medium text-credicus-ink">Organisation:</span> {job.organisation}</p>
            <p><span className="font-medium text-credicus-ink">Opening Date:</span> {job.openingDate}</p>
            <p><span className="font-medium text-credicus-ink">Closing Date:</span> {job.closingDate}</p>
            <p><span className="font-medium text-credicus-ink">Job Type:</span> {job.jobType}</p>
            <p><span className="font-medium text-credicus-ink">Shift Type:</span> {job.shiftType}</p>
            <p className="sm:col-span-2"><span className="font-medium text-credicus-ink">Address:</span> {job.address}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function VendorJobsPanel() {
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const locations = useMemo(() => [...new Set(vendorJobs.map((j) => j.location.split(" - ")[0]))], []);
  const departments = useMemo(() => [...new Set(vendorJobs.map((j) => j.department))], []);

  const [selectedLocations, setSelectedLocations] = useState<string[]>(locations);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(departments);

  const filtered = useMemo(() => {
    return vendorJobs.filter((job) => {
      const city = job.location.split(" - ")[0];
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(city);
      const matchesDepartment = selectedDepartments.length === 0 || selectedDepartments.includes(job.department);
      const matchesText = matchesSearch(search, [
        job.title,
        job.location,
        job.process,
        job.subProcess,
        job.organisation,
        job.department,
      ]);
      return matchesLocation && matchesDepartment && matchesText;
    });
  }, [search, selectedLocations, selectedDepartments]);

  const totalApplied = vendorJobs.reduce((sum, j) => sum + j.appliedCount, 0);

  function clearFilters() {
    setSearch("");
    setSelectedLocations(locations);
    setSelectedDepartments(departments);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-credicus-ink">Available Job Openings</h2>
        <p className="mt-1 text-sm text-credicus-gray">Browse and submit candidates to open client positions.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Available Jobs", value: vendorJobs.length },
          { label: "Filtered Jobs", value: filtered.length },
          { label: "Candidates Submitted", value: totalApplied },
        ].map((stat) => (
          <article key={stat.label} className="ui-card p-5 text-center">
            <p className="text-3xl font-bold text-credicus-primary">{stat.value}</p>
            <p className="mt-1 text-sm text-credicus-gray">{stat.label}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <ListFilterBar
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search job title, location, process..."
                onReset={clearFilters}
                resultCount={filtered.length}
              />
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-credicus-primary px-4 text-sm font-semibold text-credicus-ink sm:self-auto"
            >
              <Filter className="h-4 w-4" />
              {filtersOpen ? "Hide filters" : "Show filters"}
            </button>
          </div>

          <div className="space-y-4">
            {filtered.length === 0 ? (
              <p className="ui-card p-6 text-center text-sm text-credicus-ink-muted">No jobs match your filters.</p>
            ) : (
              filtered.map((job) => <JobCard key={job.id} job={job} />)
            )}
          </div>
        </div>

        {filtersOpen ? (
          <aside className="ui-card h-fit w-full shrink-0 p-4 lg:w-72">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-credicus-ink">Filters</h3>
              <button type="button" onClick={clearFilters} className="text-xs font-medium text-credicus-primary hover:underline">
                Clear all
              </button>
            </div>
            <div className="space-y-4">
              <CheckboxFilterGroup
                title="Location"
                options={locations}
                selected={selectedLocations}
                onChange={setSelectedLocations}
              />
              <CheckboxFilterGroup
                title="Department"
                options={departments}
                selected={selectedDepartments}
                onChange={setSelectedDepartments}
              />
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
