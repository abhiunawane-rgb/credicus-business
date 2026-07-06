import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type BackLinkProps = {
  href: string;
  label?: string;
};

/** User control & freedom — familiar back navigation (Jakob's Law) */
export default function BackLink({ href, label = "Back" }: BackLinkProps) {
  return (
    <Link href={href} className="ui-back-link">
      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </Link>
  );
}
