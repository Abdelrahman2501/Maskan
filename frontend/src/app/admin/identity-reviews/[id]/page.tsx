import { IDENTITY_REVIEWS } from "@/mock/recruitment";

import { IdentityReviewWorkspace } from "./identity-review-workspace";

export function generateStaticParams() {
  return IDENTITY_REVIEWS.map((r) => ({ id: r.id }));
}

export default async function IdentityReviewPage({ params }: PageProps<"/admin/identity-reviews/[id]">) {
  const { id } = await params;
  return <IdentityReviewWorkspace id={id} />;
}
