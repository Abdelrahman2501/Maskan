import { Suspense } from "react";

import { DetailPageSkeleton } from "@/components/ui/page-skeleton";
import { APPLICANTS } from "@/mock/recruitment";

import { ApplicantDetail } from "./applicant-detail";

export function generateStaticParams() {
  return APPLICANTS.map((a) => ({ id: a.id }));
}

// Route params are awaited inside <Suspense> so the page shell renders instantly (Next 16).
export default function ApplicantDetailPage({ params }: PageProps<"/admin/applicants/[id]">) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <ApplicantDetailLoader params={params} />
    </Suspense>
  );
}

async function ApplicantDetailLoader({ params }: { params: PageProps<"/admin/applicants/[id]">["params"] }) {
  const { id } = await params;
  return <ApplicantDetail id={id} />;
}
