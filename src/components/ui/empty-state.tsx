import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <Card className="rounded-[32px] border-dashed bg-white/70 text-center">
      <CardTitle>{title}</CardTitle>
      <CardDescription className="mx-auto mt-3 max-w-xl">{description}</CardDescription>
      {ctaHref && ctaLabel ? (
        <div className="mt-6">
          <Link href={ctaHref} className={buttonClasses({ variant: "secondary" })}>
            {ctaLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
