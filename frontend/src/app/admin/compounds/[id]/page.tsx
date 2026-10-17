import { Suspense } from "react";

import { DetailPageSkeleton } from "@/components/ui/page-skeleton";
import { COMPOUNDS } from "@/mock/properties";

import { CompoundDetail } from "./compound-detail";

export function generateStaticParams() {
  return COMPOUNDS.map((c) => ({ id: c.id }));
}

// Route params are awaited inside <Suspense> so the page shell renders instantly (Next 16).
export default function CompoundDetailPage({ params }: PageProps<"/admin/compounds/[id]">) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <CompoundDetailLoader params={params} />
    </Suspense>
  );
}

async function CompoundDetailLoader({ params }: { params: PageProps<"/admin/compounds/[id]">["params"] }) {
  const { id } = await params;
  return <CompoundDetail id={id} />;
}
