type CredicusLogoSvgProps = {
  className?: string;
  /** Logo wordmark gray from brand */
  wordmarkClassName?: string;
  chevronClassName?: string;
};

/** Vector logo — transparent background, merges with header/footer chrome */
export default function CredicusLogoSvg({
  className = "h-9 w-auto",
  wordmarkClassName = "fill-[#70757A]",
  chevronClassName = "fill-[#FFD200]",
}: CredicusLogoSvgProps) {
  return (
    <svg
      viewBox="0 0 200 44"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <text
        x="0"
        y="32"
        className={wordmarkClassName}
        style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 26, fontWeight: 700 }}
      >
        Credicus
      </text>
      {/* Logo chevron — two slanted bars */}
      <path
        className={chevronClassName}
        d="M118 6 L132 22 L118 38 L110 22 Z M141 6 L155 22 L141 38 L133 22 Z"
      />
    </svg>
  );
}
