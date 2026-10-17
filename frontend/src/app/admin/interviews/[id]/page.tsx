import { INTERVIEWS } from "@/mock/recruitment";

import { InterviewReview } from "./interview-review";

export function generateStaticParams() {
  return INTERVIEWS.map((s) => ({ id: s.id }));
}

export default async function InterviewReviewPage({ params }: PageProps<"/admin/interviews/[id]">) {
  const { id } = await params;
  return <InterviewReview id={id} />;
}
