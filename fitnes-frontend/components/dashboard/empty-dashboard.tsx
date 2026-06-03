import type { ReactNode } from "react";

export function EmptyDashboard({
  children,
  description,
  title,
}: {
  children?: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="max-w-3xl">
      <h2 className="text-3xl font-semibold leading-tight text-[#121a16]">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-[#59645f]">{description}</p>
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}
