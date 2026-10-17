import { Suspense } from "react";

import { DetailPageSkeleton } from "@/components/ui/page-skeleton";
import { IDENTITY_REVIEWS } from "@/mock/recruitment";

import { IdentityReviewWorkspace } from "./identity-review-workspace";

export function generateStaticParams() {
  return IDENTITY_REVIEWS.map((r) => ({ id: r.id }));
}

// Route params are awaited inside <Suspense> so the page shell renders instantly (Next 16).
export default function IdentityReviewPage({ params }: PageProps<"/admin/identity-reviews/[id]">) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <IdentityReviewWorkspaceLoader params={params} />
    </Suspense>
  );
}

async function IdentityReviewWorkspaceLoader({ params }: { params: PageProps<"/admin/identity-reviews/[id]">["params"] }) {
  const { id } = await params;
  return <IdentityReviewWorkspace id={id} />;
}
