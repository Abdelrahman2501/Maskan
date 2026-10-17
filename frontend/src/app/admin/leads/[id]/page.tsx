import { Suspense } from "react";

import { DetailPageSkeleton } from "@/components/ui/page-skeleton";
import { LEADS } from "@/mock/leads";

import { LeadDetail } from "./lead-detail";

export function generateStaticParams() {
  return LEADS.map((l) => ({ id: l.id }));
}

// Route params are awaited inside <Suspense> so the page shell renders instantly (Next 16).
export default function LeadDetailPage({ params }: PageProps<"/admin/leads/[id]">) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <LeadDetailLoader params={params} />
    </Suspense>
  );
}

async function LeadDetailLoader({ params }: { params: PageProps<"/admin/leads/[id]">["params"] }) {
  const { id } = await params;
  return <LeadDetail id={id} />;
}
