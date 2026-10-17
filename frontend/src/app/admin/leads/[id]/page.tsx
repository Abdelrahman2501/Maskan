import { LEADS } from "@/mock/leads";

import { LeadDetail } from "./lead-detail";

export function generateStaticParams() {
  return LEADS.map((l) => ({ id: l.id }));
}

export default async function LeadDetailPage({ params }: PageProps<"/admin/leads/[id]">) {
  const { id } = await params;
  return <LeadDetail id={id} />;
}
