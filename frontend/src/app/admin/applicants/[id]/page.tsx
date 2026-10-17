import { APPLICANTS } from "@/mock/recruitment";

import { ApplicantDetail } from "./applicant-detail";

export function generateStaticParams() {
  return APPLICANTS.map((a) => ({ id: a.id }));
}

export default async function ApplicantDetailPage({ params }: PageProps<"/admin/applicants/[id]">) {
  const { id } = await params;
  return <ApplicantDetail id={id} />;
}
