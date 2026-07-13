"use client";

type ClickableMetricCellProps = {
  value: number;
  label: string;
  onClick: () => void;
};

export default function ClickableMetricCell({ value, label, onClick }: ClickableMetricCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-medium text-credicus-primary underline-offset-2 transition hover:text-credicus-ink hover:underline"
      aria-label={`${label}: ${value}. Click to view details.`}
    >
      {value}
    </button>
  );
}
