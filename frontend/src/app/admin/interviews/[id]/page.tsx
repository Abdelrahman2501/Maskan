import { Suspense } from "react";

import { DetailPageSkeleton } from "@/components/ui/page-skeleton";
import { INTERVIEWS } from "@/mock/recruitment";

import { InterviewReview } from "./interview-review";

export function generateStaticParams() {
  return INTERVIEWS.map((s) => ({ id: s.id }));
}

// Route params are awaited inside <Suspense> so the page shell renders instantly (Next 16).
export default function InterviewReviewPage({ params }: PageProps<"/admin/interviews/[id]">) {
  return (
    <Suspense fallback={<DetailPageSkeleton />}>
      <InterviewReviewLoader params={params} />
    </Suspense>
  );
}

async function InterviewReviewLoader({ params }: { params: PageProps<"/admin/interviews/[id]">["params"] }) {
  const { id } = await params;
  return <InterviewReview id={id} />;
}
