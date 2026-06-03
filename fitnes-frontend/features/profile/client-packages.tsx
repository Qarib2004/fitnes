"use client";

import { Loader2, Package } from "lucide-react";
import { formatDate } from "./format";
import { useClientProfile } from "./use-client-profile";

export function ClientPackages() {
  const profileQuery = useClientProfile();

  if (profileQuery.isLoading) {
    return <LoadingState label="Loading packages" />;
  }

  if (profileQuery.isError) {
    return <EmptyState title="Could not load packages" />;
  }

  const packages = profileQuery.data?.activePackages ?? [];

  return (
    <section>
      <PageHeader
        kicker="Packages"
        title="Active Packages"
        description="Track the packages that can be used to book classes."
      />

      {packages.length === 0 ? (
        <EmptyState title="No active packages yet" />
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((item) => (
            <article className="info-card" key={item.id}>
              <span className="info-icon">
                <Package className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[#121a16]">
                Package
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <InfoRow label="Lessons left" value={item.lessonsLeft} />
                <InfoRow label="Expires" value={formatDate(item.expiresAt)} />
                <InfoRow label="Package ID" value={item.packageId.slice(0, 8)} />
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function PageHeader({
  description,
  kicker,
  title,
}: {
  description: string;
  kicker: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#6b7871]">
        {kicker}
      </p>
      <h2 className="mt-1 text-3xl font-semibold text-[#121a16]">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-[#59645f]">
        {description}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[#6b7871]">{label}</dt>
      <dd className="font-semibold text-[#18211d]">{value}</dd>
    </div>
  );
}

function EmptyState({ title }: { title: string }) {
  return (
    <div className="mt-6 rounded-lg border border-[#dde4e0] bg-white p-8 text-center text-[#59645f]">
      {title}
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center gap-2 text-[#59645f]">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      {label}
    </div>
  );
}
