import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { width: 120, height: 32, className: "h-7 w-auto" },
  md: { width: 160, height: 42, className: "h-9 w-auto" },
  lg: { width: 220, height: 58, className: "h-12 w-auto sm:h-14" },
};

export default function Logo({ href = "/", size = "md", className = "" }: LogoProps) {
  const dimensions = sizeMap[size];

  const image = (
    <Image
      src="/images/credicus-logo.png"
      alt="Credicus"
      width={dimensions.width}
      height={dimensions.height}
      priority
      className={`${dimensions.className} ${className}`}
    />
  );

  if (!href) {
    return image;
  }

  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="Credicus home">
      {image}
    </Link>
  );
}
