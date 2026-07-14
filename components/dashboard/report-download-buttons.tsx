"use client";

import { Download, FileSpreadsheet } from "lucide-react";

type Props = {
  report: "recruiter" | "client" | "month" | "all";
  className?: string;
};

export default function ReportDownloadButtons({ report, className = "" }: Props) {
  function download(format: "csv" | "xlsx") {
    window.location.href = `/api/admin/reports/export?report=${report}&format=${format}`;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button type="button" onClick={() => download("csv")} className="ui-button-secondary inline-flex items-center gap-1.5 text-xs">
        <Download className="h-3.5 w-3.5" />
        CSV
      </button>
      <button type="button" onClick={() => download("xlsx")} className="ui-button-secondary inline-flex items-center gap-1.5 text-xs">
        <FileSpreadsheet className="h-3.5 w-3.5" />
        Excel
      </button>
    </div>
  );
}
