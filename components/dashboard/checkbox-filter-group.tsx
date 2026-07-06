"use client";

type CheckboxFilterGroupProps = {
  title: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
};

export default function CheckboxFilterGroup({ title, options, selected, onChange }: CheckboxFilterGroupProps) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-credicus-ink">{title}</p>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-credicus-ink-secondary">
            <input
              type="checkbox"
              className="accent-credicus-primary"
              checked={selected.includes(option)}
              onChange={() => toggle(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
